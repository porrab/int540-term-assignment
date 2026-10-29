"""G2-D3: classification - which active customers will go silent in the next 180 days?

Run after unzipping the source data (it re-uses g2b.py's cleansing and feature builder,
so every rule from G1-D4 is applied exactly once, in one place):
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 g2d3.py

Writes:
  g2d3-output.json            every number quoted in ../g2-d3-classification.md
  ../data/worklist_scored.csv every active customer at the data end with P(silent), value
                              at risk and segment (feeds the worklist G2-C and dashboard G2-D1)
  ../figures/g2d3-*.png       charts for the slides

Design (see ../g2-d3-classification.md for the reasons):
  population  customers who are still active at the cut-off (last order <= 180 days ago),
              because the problem statement asks to catch silence *before* it happens
  label       no order at all in the 180 days after the cut-off = becomes "silent >180"
              (the threshold the team locked on 10 Sep)
  train       cut-off A = 2010-12-09 (features from rows before A, label from A to A+180d)
  test        cut-off B = 2011-06-09, a later period the models never saw (out-of-time)
  score       cut-off = data end, the list sales would get on the next Monday
"""
import contextlib
import io
import json
import runpy
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, confusion_matrix, precision_score,
                             recall_score, roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, StandardScaler
from sklearn.tree import DecisionTreeClassifier, export_text

HERE = Path(__file__).resolve().parent
DATA = HERE / "../data"
FIG = HERE / "../figures"
FIG.mkdir(exist_ok=True)
SEED = 42
WINDOW = pd.Timedelta(days=180)
CUT_A = pd.Timestamp("2010-12-09")
CUT_B = pd.Timestamp("2011-06-09")

# Re-use g2b.py as the single source of the cleansing rules and the feature builder.
with contextlib.redirect_stdout(io.StringIO()):
    g2b = runpy.run_path(str(HERE / "g2b.py"))
known, cancels, build_features = g2b["known"], g2b["cancels"], g2b["build_features"]
SILENT_DAYS, DATA_END = g2b["SILENT_DAYS"], g2b["DATA_END"]


def r2(x):
    return round(float(x), 2)


def r4(x):
    return round(float(x), 4)


FEATURES = ["recency_days", "frequency", "monetary_gbp", "value_12m_gbp", "avg_basket_gbp",
            "avg_lines_per_basket", "avg_units_per_basket", "tenure_days",
            "avg_days_between_orders", "gap_ratio", "return_rate_pct", "has_returned", "is_uk"]
SKEWED = ["recency_days", "frequency", "monetary_gbp", "value_12m_gbp", "avg_basket_gbp",
          "avg_lines_per_basket", "avg_units_per_basket", "tenure_days",
          "avg_days_between_orders", "gap_ratio", "return_rate_pct"]


def table(asof, with_label=True):
    """Active customers at `asof`, their features, and (if the future is known) the label."""
    f = build_features(known, cancels, asof)
    f = f[f["recency_days"] <= SILENT_DAYS].copy()
    last12 = known[(known["InvoiceDate"] < asof) & (known["InvoiceDate"] >= asof - pd.Timedelta(days=365))]
    ret12 = cancels[(cancels["InvoiceDate"] < asof) & (cancels["InvoiceDate"] >= asof - pd.Timedelta(days=365))
                    & cancels["is_product"]].groupby("Customer ID")["LineTotal"].sum()
    # Net of product returns, so an order that was cancelled in full (e.g. customer 16446's
    # 80,995-unit order) is not counted as value that could be lost.
    f["value_12m_gbp"] = (last12.groupby("Customer ID")["LineTotal"].sum().reindex(f.index).fillna(0.0)
                          + ret12.reindex(f.index).fillna(0.0)).clip(lower=0)
    # One-order customers have no rhythm yet: give them the gap since their only order,
    # i.e. "as slow as they have ever been", and let frequency = 1 carry the rest.
    f["avg_days_between_orders"] = f["avg_days_between_orders"].fillna(f["recency_days"])
    # How late is this customer against their own rhythm? (G2-A4: 60 days is late for a
    # fortnightly buyer and early for a yearly one.) +1 keeps same-day buyers finite.
    f["gap_ratio"] = f["recency_days"] / (f["avg_days_between_orders"] + 1)
    f["has_returned"] = f["has_returned"].astype(int)
    f["is_uk"] = f["is_uk"].astype(int)
    if with_label:
        future = known[(known["InvoiceDate"] >= asof) & (known["InvoiceDate"] < asof + WINDOW)]
        f["silent_next_180"] = (~f.index.isin(set(future["Customer ID"].unique()))).astype(int)
    return f


train, test = table(CUT_A), table(CUT_B)
now = table(DATA_END, with_label=False)
Xtr, ytr = train[FEATURES].astype(float), train["silent_next_180"]
Xte, yte = test[FEATURES].astype(float), test["silent_next_180"]

out = {"window_days": WINDOW.days, "silent_days": SILENT_DAYS,
       "data_end_exclusive": str(DATA_END.date()), "features": FEATURES}
for name, t, cut in [("train_cutoff_A", train, CUT_A), ("test_cutoff_B", test, CUT_B)]:
    out[name] = {"cutoff": str(cut.date()),
                 "label_window": f"{cut.date()} to {(cut + WINDOW - pd.Timedelta(days=1)).date()}",
                 "active_customers": int(len(t)),
                 "went_silent": int(t["silent_next_180"].sum()),
                 "silent_rate_pct": r2(t["silent_next_180"].mean() * 100),
                 "value_12m_of_those_who_went_silent_gbp":
                     r2(t.loc[t["silent_next_180"] == 1, "value_12m_gbp"].sum())}
out["scored_now"] = {"cutoff": str(DATA_END.date()), "active_customers": int(len(now))}

# ------------------------------------------------------------ EDA: each feature vs the label
# (lecturer, 8 Oct: wanted to see variable x target plots in EDA)
eda = {}
for c in FEATURES:
    g = train.groupby("silent_next_180")[c]
    eda[c] = {"median_stayed": r2(g.median()[0]), "median_went_silent": r2(g.median()[1])}
out["eda_median_by_label_train"] = eda
for c in ["frequency", "has_returned"]:
    out[f"silent_rate_by_{c}_train"] = {
        str(k): r2(v * 100) for k, v in
        train.groupby(train[c].clip(upper=10) if c == "frequency" else train[c])["silent_next_180"].mean().items()}

fig, axes = plt.subplots(2, 3, figsize=(12, 7))
for ax, c, title in zip(axes.flat,
                        ["recency_days", "frequency", "value_12m_gbp", "gap_ratio",
                         "avg_basket_gbp", "tenure_days"],
                        ["Days since last order", "Orders so far", "Spend in last 12 months (GBP)",
                         "Days since last order / usual gap", "Average basket (GBP)", "Days since first order"]):
    data = [train.loc[ytr == 0, c], train.loc[ytr == 1, c]]
    ax.boxplot(data, showfliers=False)
    ax.set_xticks([1, 2], ["kept buying", "went silent"])
    ax.set_title(title, fontsize=10)
    if c in ("frequency", "value_12m_gbp", "avg_basket_gbp", "gap_ratio"):
        ax.set_yscale("log")
fig.suptitle(f"Active customers at {CUT_A.date()}: who went silent in the next 180 days (outliers hidden)")
fig.tight_layout()
fig.savefig(FIG / "g2d3-eda-boxplots.png", dpi=150)
plt.close(fig)

# ------------------------------------------------------------ models
log_scale = make_pipeline(FunctionTransformer(np.log1p), StandardScaler())


def logit():
    from sklearn.compose import ColumnTransformer
    pre = ColumnTransformer([("skew", log_scale, SKEWED)], remainder=StandardScaler())
    return make_pipeline(pre, LogisticRegression(max_iter=2000))


models = {
    "baseline_recency_rule": None,  # rank by days since last order only = "no order for X days"
    "logistic_regression": logit(),
    "decision_tree_depth4": DecisionTreeClassifier(max_depth=4, min_samples_leaf=50, random_state=SEED),
    "random_forest": RandomForestClassifier(n_estimators=400, min_samples_leaf=20,
                                            random_state=SEED, n_jobs=-1),
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
results, scores = {}, {}


def worklist_metrics(y, p, value):
    """How good is the top of the list? Sales can call only a few each week."""
    order = np.argsort(-p)
    y, value = np.asarray(y)[order], np.asarray(value)[order]
    lost = value[y == 1].sum()
    res = {}
    for k in (100, 250, 500):
        res[f"top{k}_precision_pct"] = r2(y[:k].mean() * 100)
    top10 = int(round(len(y) * .10))
    res["top10pct_customers"] = top10
    res["top10pct_precision_pct"] = r2(y[:top10].mean() * 100)
    res["top10pct_recall_pct"] = r2(y[:top10].sum() / y.sum() * 100)
    res["top10pct_lost_value_captured_pct"] = r2(value[:top10][y[:top10] == 1].sum() / lost * 100)
    return res


for name, m in models.items():
    if m is None:
        p_te = Xte["recency_days"].to_numpy()
        p_te = p_te / p_te.max()
        r = {"cv_auc_train": None}
    else:
        cvs = cross_val_score(m, Xtr, ytr, cv=cv, scoring="roc_auc")
        m.fit(Xtr, ytr)
        p_te = m.predict_proba(Xte)[:, 1]
        pred = (p_te >= .5).astype(int)
        tn, fp, fn, tp = confusion_matrix(yte, pred).ravel()
        r = {"cv_auc_train": r4(cvs.mean()), "cv_auc_sd": r4(cvs.std()),
             "test_confusion_at_0.5": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
             "test_accuracy_pct": r2((tp + tn) / len(yte) * 100),
             "test_precision_pct": r2(precision_score(yte, pred) * 100),
             "test_recall_pct": r2(recall_score(yte, pred) * 100)}
    r["test_auc"] = r4(roc_auc_score(yte, p_te))
    r["test_pr_auc"] = r4(average_precision_score(yte, p_te))
    r.update(worklist_metrics(yte, p_te, Xte["value_12m_gbp"]))
    results[name], scores[name] = r, p_te
out["test_base_rate_pct"] = r2(yte.mean() * 100)
out["models"] = results

# A model that is only good at spotting *small* customers who leave does not protect revenue.
# Candidate: the same logistic regression trained with each customer weighted by value, so a
# lost £5,000 customer counts more than a lost £50 one. Which weighting to use is decided by
# cross-validation inside the TRAIN period only (top 10% of each fold, flagged P >= 50% then
# by value) - the test period stays untouched until the final comparison.
def top_list(y, p, value, share=.10):
    idx = np.where(p >= .5)[0]
    idx = idx[np.argsort(-value[idx])][:int(round(len(y) * share))]
    lost = value[y == 1].sum()
    return y[idx].mean() * 100, value[idx][y[idx] == 1].sum() / lost * 100


WEIGHTS = {"none": lambda v: None, "sqrt_value": np.sqrt, "value": lambda v: v + 1}
cv_w = {}
for wname, wf in WEIGHTS.items():
    prec, cap = [], []
    for tr, va in cv.split(Xtr, ytr):
        m = logit()
        m.fit(Xtr.iloc[tr], ytr.iloc[tr],
              logisticregression__sample_weight=wf(Xtr["value_12m_gbp"].to_numpy()[tr]))
        a, b = top_list(ytr.to_numpy()[va], m.predict_proba(Xtr.iloc[va])[:, 1],
                        Xtr["value_12m_gbp"].to_numpy()[va])
        prec.append(a)
        cap.append(b)
    cv_w[wname] = {"cv_top10pct_precision_pct": r2(np.mean(prec)),
                   "cv_top10pct_lost_value_captured_pct": r2(np.mean(cap))}
out["weighting_choice_cv_train"] = cv_w
wbest = max(cv_w, key=lambda k: cv_w[k]["cv_top10pct_lost_value_captured_pct"])
out["weighting_chosen"] = wbest
chosen = logit()
chosen.fit(Xtr, ytr, logisticregression__sample_weight=WEIGHTS[wbest](Xtr["value_12m_gbp"].to_numpy()))
best = f"logistic_regression_weight_{wbest}"
models[best] = chosen
p_te = chosen.predict_proba(Xte)[:, 1]
r = {"test_auc": r4(roc_auc_score(yte, p_te)), "test_pr_auc": r4(average_precision_score(yte, p_te))}
r.update(worklist_metrics(yte, p_te, Xte["value_12m_gbp"]))
results[best], scores[best] = r, p_te
out["chosen_model"] = best

# The worklist policy G2-A describes: flag the likely-silent (P >= 50%), then put the most
# valuable first. Pure P x value is not used: it puts the biggest customers on top even at
# P = 5% (they are big, not leaving). Baseline = the rule a person would write without a
# model: flag anyone with no order for X days, X set so that it flags as many customers.
value = Xte["value_12m_gbp"].to_numpy()
lost_total = value[yte.to_numpy() == 1].sum()


def policy(flag, label):
    idx = np.where(flag)[0]
    idx = idx[np.argsort(-value[idx])]
    y = yte.to_numpy()
    res = {"policy": label, "flagged": int(len(idx)),
           "flagged_precision_pct": r2(y[idx].mean() * 100),
           "flagged_recall_pct": r2(y[idx].sum() / y.sum() * 100),
           "flagged_lost_value_captured_pct": r2(value[idx][y[idx] == 1].sum() / lost_total * 100)}
    for k in (100, 250):
        top = idx[:k]
        res[f"top{k}_by_value_precision_pct"] = r2(y[top].mean() * 100)
        res[f"top{k}_by_value_lost_value_gbp"] = r2(value[top][y[top] == 1].sum())
        res[f"top{k}_by_value_lost_value_captured_pct"] = r2(value[top][y[top] == 1].sum() / lost_total * 100)
    return res


flag_model = scores[best] >= .5
n_flag = int(flag_model.sum())
rec = Xte["recency_days"].to_numpy()
x_days = float(np.sort(rec)[::-1][n_flag - 1])
out["test_lost_value_total_gbp"] = r2(lost_total)
out["worklist_policy_model"] = policy(flag_model, f"{best}: P >= 50%, then by 12-month value")
out["worklist_policy_unweighted_logistic"] = policy(scores["logistic_regression"] >= .5,
                                                    "logistic_regression (no weight): P >= 50%, then by 12-month value")
out["worklist_policy_baseline"] = policy(rec >= x_days, f"rule: no order for {int(x_days)}+ days, then by 12-month value")

# What drives the prediction? Tree rules are what can be explained on stage.
tree = models["decision_tree_depth4"]
out["decision_tree_rules"] = export_text(tree, feature_names=FEATURES, decimals=1)
out["decision_tree_importance"] = {f: r4(v) for f, v in sorted(
    zip(FEATURES, tree.feature_importances_), key=lambda t: -t[1]) if v > 0}
lr = models[best]
coef = lr[-1].coef_[0]
names = SKEWED + [f for f in FEATURES if f not in SKEWED]
out["logistic_coefficients_std"] = {n: r4(c) for n, c in sorted(zip(names, coef), key=lambda t: -abs(t[1]))}
rf = models["random_forest"]
out["random_forest_importance"] = {f: r4(v) for f, v in sorted(
    zip(FEATURES, rf.feature_importances_), key=lambda t: -t[1])}

# Probability calibration check in deciles on the test period: does "70%" mean 70%?
dec = pd.qcut(pd.Series(scores[best]).rank(method="first"), 10, labels=False)
out["chosen_calibration_by_decile"] = [
    {"decile": int(d) + 1, "mean_predicted_pct": r2(scores[best][dec == d].mean() * 100),
     "actual_silent_pct": r2(yte.to_numpy()[dec == d].mean() * 100)} for d in range(10)]

# ------------------------------------------------------------ charts: ROC-style comparison
from sklearn.metrics import roc_curve
fig, ax = plt.subplots(figsize=(6, 5))
for name, label in [("baseline_recency_rule", "Rule: days since last order"),
                    ("logistic_regression", "Logistic regression"),
                    ("decision_tree_depth4", "Decision tree (depth 4)"),
                    ("random_forest", "Random forest"),
                    (best, "Logistic, value-weighted (chosen)")]:
    fpr, tpr, _ = roc_curve(yte, scores[name])
    ax.plot(fpr, tpr, label=f"{label}  AUC {results[name]['test_auc']:.3f}")
ax.plot([0, 1], [0, 1], "k:", lw=1)
ax.set_xlabel("False positive rate")
ax.set_ylabel("True positive rate (share of silent customers caught)")
ax.set_title(f"Out-of-time test: active at {CUT_B.date()}")
ax.legend(fontsize=8, loc="lower right")
fig.tight_layout()
fig.savefig(FIG / "g2d3-roc.png", dpi=150)
plt.close(fig)

# The comparison that matters to sales: a call list of 250 names, rule vs model.
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
pol = [("Rule: no order\nfor X days", out["worklist_policy_baseline"]),
       ("Model\n(no weight)", out["worklist_policy_unweighted_logistic"]),
       ("Model, value-\nweighted (chosen)", out["worklist_policy_model"])]
for ax, key, title in [(axes[0], "top250_by_value_precision_pct", "Of 250 names called, % who really went silent"),
                       (axes[1], "top250_by_value_lost_value_captured_pct", "Share of all lost 12-month value on that list (%)")]:
    vals = [d[key] for _, d in pol]
    bars = ax.bar([n for n, _ in pol], vals, color=["#9aa5b1", "#7fb3d5", "#1f77b4"])
    ax.bar_label(bars, fmt="%.1f")
    ax.set_title(title, fontsize=10)
fig.suptitle(f"Out-of-time test (active at {CUT_B.date()}, next 180 days)")
fig.tight_layout()
fig.savefig(FIG / "g2d3-worklist-compare.png", dpi=150)
plt.close(fig)

# ------------------------------------------------------------ score today -> worklist
final = models[best]
Xall, yall = pd.concat([Xtr, Xte]), pd.concat([ytr, yte])   # refit on both periods before use
final.fit(Xall, yall, logisticregression__sample_weight=WEIGHTS[wbest](Xall["value_12m_gbp"].to_numpy()))
now["p_silent_180"] = final.predict_proba(now[FEATURES].astype(float))[:, 1]
now["expected_loss_gbp"] = now["p_silent_180"] * now["value_12m_gbp"]
seg = pd.read_csv(DATA / "customer_segments.csv", index_col="customer_id")["segment"]
now["segment"] = seg.reindex(now.index)
# Same policy as the test above: flagged = P >= 50%, flagged first, then by 12-month value.
now["flagged"] = now["p_silent_180"] >= .5
now = now.sort_values(["flagged", "value_12m_gbp"], ascending=[False, False])
now["rank"] = np.arange(1, len(now) + 1)
cols = ["rank", "flagged", "p_silent_180", "value_12m_gbp", "expected_loss_gbp", "segment", "country",
        "recency_days", "avg_days_between_orders", "gap_ratio", "frequency", "monetary_gbp",
        "last_purchase"]
w = now[cols].copy()
w["last_purchase"] = w["last_purchase"].dt.date
w.round(4).to_csv(DATA / "worklist_scored.csv", index_label="customer_id")
fl = now[now["flagged"]]
top50 = fl.head(50)
out["worklist_now"] = {
    "active_customers_scored": int(len(now)),
    "flagged_p_ge_50pct": int(len(fl)),
    "flagged_value_12m_gbp": r2(fl["value_12m_gbp"].sum()),
    "flagged_expected_loss_gbp": r2(fl["expected_loss_gbp"].sum()),
    "top50_value_12m_gbp": r2(top50["value_12m_gbp"].sum()),
    "top50_expected_loss_gbp": r2(top50["expected_loss_gbp"].sum()),
    "top50_median_p_pct": r2(top50["p_silent_180"].median() * 100),
    "top50_by_segment": top50["segment"].value_counts().to_dict(),
    "flagged_by_segment": fl["segment"].value_counts().to_dict(),
    "all_by_segment_mean_p_pct": {k: r2(v * 100) for k, v in now.groupby("segment")["p_silent_180"].mean().items()},
    "top5": [{"customer_id": int(i), "p_pct": r2(r.p_silent_180 * 100), "value_12m_gbp": r2(r.value_12m_gbp),
              "segment": r.segment, "frequency": int(r.frequency),
              "recency_days": int(r.recency_days), "usual_gap_days": r2(r.avg_days_between_orders)}
             for i, r in fl.head(5).iterrows()],
}

(HERE / "g2d3-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
