"""G2-D3/D4 check against the classes of 29 Oct (kNN, confusion matrix, F1, 10-fold CV) and 5 Nov (OLS,
adjusted R2, F-test, t-test, residual plot, dummy variables). Adds no new decision to g2d3.py or g2d4.py.

Run after the inputs of g2d3.py are in place (needs statsmodels as well):
    python3 g2-class-check.py

Writes g2-class-check-output.json. It re-runs g2d3.py, the same way g2d4.py does.
"""
import contextlib, io, json, runpy, warnings
from pathlib import Path

import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy.stats import kurtosis, skew, spearmanr
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, mean_absolute_error, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from statsmodels.stats.outliers_influence import variance_inflation_factor as vif

warnings.filterwarnings("ignore")
H = Path(__file__).parent
with contextlib.redirect_stdout(io.StringIO()):
    d = runpy.run_path(str(H / "g2d3.py"))
Xtr, ytr, Xte, yte = d["Xtr"], d["ytr"], d["Xte"], d["yte"]
train, test, known, cancels = d["train"], d["test"], d["known"], d["cancels"]
FEATURES, SKEWED, log_scale, logit, SEED, WINDOW = (d["FEATURES"], d["SKEWED"], d["log_scale"],
                                                    d["logit"], d["SEED"], d["WINDOW"])
CUT_A, CUT_B = d["CUT_A"], d["CUT_B"]
o = {"repro": {k: (v.get("test_auc"), v.get("test_confusion_at_0.5")) for k, v in d["results"].items()}}


def met(y, p, score=None):
    tn, fp, fn, tp = confusion_matrix(y, p).ravel()
    pr = tp / (tp + fp) if tp + fp else 0
    re = tp / (tp + fn) if tp + fn else 0
    r = dict(tp=int(tp), fn=int(fn), fp=int(fp), tn=int(tn), acc=(tp + tn) / len(y), mis=(fp + fn) / len(y),
             prec=pr, rec=re, f1=2 * pr * re / (pr + re) if pr + re else 0, spec=tn / (tn + fp), flag=int(tp + fp))
    if score is not None:
        r["auc"] = roc_auc_score(y, score)
    return {k: (round(float(v), 4) if not isinstance(v, int) else v) for k, v in r.items()}


def wl(y, P, val, ks=(50, 250)):
    y, val = np.asarray(y), np.asarray(val)
    idx = np.where(P >= .5)[0]
    idx = idx[np.argsort(-val[idx])]
    out = {}
    for k in ks:
        t = idx[:k]
        out[k] = dict(prec=round(float(y[t].mean() * 100), 1), value=round(float(val[t][y[t] == 1].sum()), 0))
    return out


def knn(k):
    pre = ColumnTransformer([("s", log_scale, SKEWED)], remainder=StandardScaler())
    return make_pipeline(pre, KNeighborsClassifier(n_neighbors=k))


cv10 = StratifiedKFold(10, shuffle=True, random_state=SEED)
rows = []
for k in list(range(1, 20, 2)) + [25, 31, 41, 51, 75, 101, 151]:
    s = cross_validate(knn(k), Xtr, ytr, cv=cv10, scoring=["accuracy", "f1", "roc_auc"])
    rows.append(dict(k=k, acc=round(s["test_accuracy"].mean(), 4), acc_sd=round(s["test_accuracy"].std(), 4),
                     f1=round(s["test_f1"].mean(), 4), auc=round(s["test_roc_auc"].mean(), 4)))
o["knn_cv10"] = rows
best_acc = max(rows, key=lambda r: r["acc"])["k"]
best_f1 = max(rows, key=lambda r: r["f1"])["k"]
best_hw = max((r for r in rows if r["k"] <= 9), key=lambda r: r["acc"])["k"]  # the k = 1-9 range of HW L11
o["best"] = dict(acc=best_acc, f1=best_f1, best_in_1_to_9=best_hw)

val = Xte["value_12m_gbp"].to_numpy()
tests = {}
for k in sorted({best_acc, best_f1, best_hw}):
    m = knn(k).fit(Xtr, ytr)
    P = m.predict_proba(Xte)[:, 1]
    tests[f"knn_k{k}"] = dict(m=met(yte, (P >= .5).astype(int), P), wl=wl(yte, P, val))
m = logit().fit(Xtr, ytr)
P = m.predict_proba(Xte)[:, 1]
tests["logit"] = dict(m=met(yte, (P >= .5).astype(int), P), wl=wl(yte, P, val))
w = Xtr["value_12m_gbp"].clip(lower=1).to_numpy()
rf = RandomForestClassifier(n_estimators=400, min_samples_leaf=20, random_state=SEED, n_jobs=-1).fit(Xtr, ytr)
P = rf.predict_proba(Xte)[:, 1]
tests["rf"] = dict(m=met(yte, (P >= .5).astype(int), P), wl=wl(yte, P, val))
P = d["models"]["decision_tree_depth4"].predict_proba(Xte)[:, 1]
tests["tree"] = dict(m=met(yte, (P >= .5).astype(int), P), wl=wl(yte, P, val))
o["test"] = tests

c = {}
for nm, mm in [("logit", logit()), ("rf", RandomForestClassifier(n_estimators=400, min_samples_leaf=20,
                                                                 random_state=SEED, n_jobs=-1))]:
    s = cross_validate(mm, Xtr, ytr, cv=cv10, scoring=["accuracy", "f1", "roc_auc", "precision", "recall"])
    c[nm] = {x: round(s["test_" + x].mean(), 4) for x in ["accuracy", "f1", "roc_auc", "precision", "recall"]}
o["cv10_existing"] = c
pol = d["out"]["worklist_policy_model"]
flag = pol["flagged"]
tp = int(round(flag * pol["flagged_precision_pct"] / 100))
fp, fn = flag - tp, int(yte.sum()) - tp
tn = len(yte) - tp - fp - fn
pr, re_ = tp / (tp + fp), tp / (tp + fn)
o["chosen_value_weighted_logistic"] = dict(
    policy=pol["policy"], tp=tp, fn=fn, fp=fp, tn=tn, acc=round((tp + tn) / len(yte), 4), prec=round(pr, 4),
    rec=round(re_, 4), f1=round(2 * pr * re_ / (pr + re_), 4), spec=round(tn / (tn + fp), 4),
    recall_saved_pct=pol["flagged_recall_pct"], top50_prec=pol["top50_by_value_precision_pct"],
    top50_value=pol["top50_by_value_lost_value_gbp"], top250_prec=pol["top250_by_value_precision_pct"],
    top250_value=pol["top250_by_value_lost_value_gbp"])


# ---------- customer-level regression, same setup as g2d4.py
def target(f, asof):
    s = known[(known.InvoiceDate >= asof) & (known.InvoiceDate < asof + WINDOW)]
    r = cancels[(cancels.InvoiceDate >= asof) & (cancels.InvoiceDate < asof + WINDOW) & cancels.is_product]
    return (s.groupby("Customer ID").LineTotal.sum().reindex(f.index).fillna(0)
            + r.groupby("Customer ID").LineTotal.sum().reindex(f.index).fillna(0)).clip(lower=0)


Ytr, Yte = target(train, CUT_A), target(test, CUT_B)
LX = np.log1p(train[FEATURES].astype(float).clip(lower=0))
LT = np.log1p(test[FEATURES].astype(float).clip(lower=0))
ly = np.log1p(Ytr)
ols = sm.OLS(ly, sm.add_constant(LX)).fit()
reg = dict(n=int(ols.nobs), k=int(ols.df_model), r2=round(ols.rsquared, 4), adj=round(ols.rsquared_adj, 4),
           F=round(ols.fvalue, 2), pF=float(ols.f_pvalue), se=round(float(np.sqrt(ols.mse_resid)), 4))
reg["coef"] = {f: dict(b=round(ols.params[f], 4), t=round(ols.tvalues[f], 2), p=round(ols.pvalues[f], 4))
               for f in LX.columns}
A = sm.add_constant(LX).values
reg["vif"] = {f: round(vif(A, i + 1), 1) for i, f in enumerate(LX.columns)}
res = ols.resid
reg["resid"] = dict(skew=round(float(skew(res)), 3), exkurt=round(float(kurtosis(res)), 3),
                    zero_share_y=round(float((Ytr == 0).mean()), 4))
bins = pd.qcut(ols.fittedvalues, 5, labels=False, duplicates="drop")
reg["resid_mean_by_fitted_quintile"] = [round(float(res[bins == b].mean()), 3) for b in sorted(set(bins))]
reg["resid_sd_by_fitted_quintile"] = [round(float(res[bins == b].std()), 3) for b in sorted(set(bins))]
pl = ols.predict(sm.add_constant(LT, has_constant="add"))
lt = np.log1p(Yte)
reg["oot_r2_log"] = round(float(1 - ((lt - pl) ** 2).sum() / ((lt - lt.mean()) ** 2).sum()), 4)
smear = float(np.exp(res).mean())
reg["smearing"] = round(smear, 3)


def rr(p):
    p = np.asarray(p)
    order = np.argsort(-p)
    return dict(mae=round(float(mean_absolute_error(Yte, p)), 2), sp=round(float(spearmanr(Yte, p).statistic), 4),
                total=round(float(p.sum()), 0), top250=round(float(Yte.to_numpy()[order][:250].sum() / Yte.sum() * 100), 2))


reg["test"] = dict(actual_total=round(float(Yte.sum()), 0), naive=rr(test["value_12m_gbp"].to_numpy() / 2),
                   ols_log=rr(np.expm1(pl).clip(lower=0)), ols_log_smear=rr((np.exp(pl) * smear - 1).clip(lower=0)))
cols = list(LX.columns)
while True:
    f = sm.OLS(ly, sm.add_constant(LX[cols])).fit()
    pv = f.pvalues.drop("const")
    if pv.max() <= .05:
        break
    cols.remove(pv.idxmax())
reg["backward"] = dict(kept=cols, k=len(cols), r2=round(f.rsquared, 4), adj=round(f.rsquared_adj, 4),
                       F=round(f.fvalue, 2), coef={x: round(f.params[x], 4) for x in cols})
reg["backward"]["test"] = rr(np.expm1(f.predict(sm.add_constant(LT[cols], has_constant="add"))).clip(lower=0))
# Is the U shape in the residuals caused by the customers with zero spend?
zero_by_q = [round(float((Ytr[bins == b] == 0).mean()), 4) for b in sorted(set(bins))]
pos = Ytr > 0
fp_ = sm.OLS(ly[pos], sm.add_constant(LX[pos])).fit()
bp = pd.qcut(fp_.fittedvalues, 5, labels=False, duplicates="drop")
reg["zero_spend_check"] = dict(zero_share_by_fitted_quintile=zero_by_q, n_positive=int(pos.sum()),
    resid_mean_by_quintile_positive_only=[round(float(fp_.resid[bp == b].mean()), 3) for b in sorted(set(bp))])
raw = sm.OLS(Ytr, sm.add_constant(train[FEATURES].astype(float))).fit()
reg["raw"] = dict(r2=round(raw.rsquared, 4), adj=round(raw.rsquared_adj, 4),
                  test=rr(raw.predict(sm.add_constant(test[FEATURES].astype(float), has_constant="add")).clip(lower=0)))
o["reg"] = reg

# ---------- monthly sales: dummy coding as in HW L12 question 1 (m - 1 dummies), but with time instead of
# GNP and months instead of quarters. The class exercise itself has no time variable.
ms = known.assign(m=known.InvoiceDate.dt.to_period("M")).groupby("m").LineTotal.sum()
mr = cancels[cancels.is_product].assign(m=lambda x: x.InvoiceDate.dt.to_period("M")).groupby("m").LineTotal.sum()
y = ms + mr.reindex(ms.index).fillna(0)
o["data_last_invoice"] = str(known.InvoiceDate.max())
y = y[(y.index >= pd.Period("2009-12")) & (y.index <= pd.Period("2011-11"))]
df = pd.DataFrame({"y": y.values, "t": range(1, len(y) + 1), "mon": [p.month for p in y.index]},
                  index=[str(p) for p in y.index])
D = pd.get_dummies(df.mon, prefix="m", dtype=float).drop(columns="m_12")
X = pd.concat([df[["t"]].astype(float), D], axis=1)
f = sm.OLS(df.y, sm.add_constant(X)).fit()
sea = dict(n=len(df), k=int(f.df_model), r2=round(f.rsquared, 4), adj=round(f.rsquared_adj, 4), F=round(f.fvalue, 2),
           pF=round(float(f.f_pvalue), 6), se=round(float(np.sqrt(f.mse_resid)), 0))
sea["coef"] = {x: dict(b=round(f.params[x], 0), p=round(f.pvalues[x], 4)) for x in f.params.index}
Xs = pd.DataFrame({"t": df.t.astype(float), "q4": df.mon.isin([10, 11, 12]).astype(float)}, index=df.index)
g = sm.OLS(df.y, sm.add_constant(Xs)).fit()
sea["simple"] = dict(k=2, r2=round(g.rsquared, 4), adj=round(g.rsquared_adj, 4), F=round(g.fvalue, 2), pF=float(g.f_pvalue),
                     se=round(float(np.sqrt(g.mse_resid)), 0),
                     coef={x: dict(b=round(g.params[x], 0), p=round(g.pvalues[x], 4)) for x in g.params.index})
te = df.iloc[18:]
Xa = sm.add_constant(X, has_constant="add")
ph = sm.OLS(df.y.iloc[:18], Xa.iloc[:18]).fit().predict(Xa.iloc[18:])
Xsa = sm.add_constant(Xs, has_constant="add")
ph2 = sm.OLS(df.y.iloc[:18], Xsa.iloc[:18]).fit().predict(Xsa.iloc[18:])
sn = df.y.shift(12).iloc[18:]
ape = lambda p: round(float((abs(te.y - p) / te.y).mean() * 100), 1)
sea["holdout"] = dict(months=list(te.index), actual=te.y.round(0).tolist(), full_dummy=ph.round(0).tolist(),
                      same_month_last_year=sn.round(0).tolist(), simple=ph2.round(0).tolist(),
                      mape_full=ape(ph), mape_same_month=ape(sn), mape_simple=ape(ph2))
sea["monthly"] = df.y.round(0).to_dict()
o["seasonal"] = sea
(H / "g2-class-check-output.json").write_text(json.dumps(o, indent=1, ensure_ascii=False, default=str), encoding="utf-8")
print("done")
