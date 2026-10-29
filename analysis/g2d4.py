"""G2-D4: regression - how much will each active customer spend in the next 180 days?

Run after g2d3.py's inputs are in place (it re-uses that script's customer tables):
    python3 g2d4.py

Writes g2d4-output.json and ../figures/g2d4-predicted-vs-actual.png.

Why: the worklist (G2-D3) sorts flagged customers by what they spent in the last 12 months.
A forecast of the next 180 days is the "value" a sales manager actually cares about. This
script checks whether a regression beats the simple guess "next 6 months = half of the last 12".
Same time split as G2-D3: train on cut-off A (2010-12-09), test on cut-off B (2011-06-09).
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
from scipy.stats import spearmanr
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

HERE = Path(__file__).resolve().parent
FIG = HERE / "../figures"
SEED = 42

with contextlib.redirect_stdout(io.StringIO()):
    d3 = runpy.run_path(str(HERE / "g2d3.py"))
train, test, known, cancels = d3["train"], d3["test"], d3["known"], d3["cancels"]
FEATURES, WINDOW, CUT_A, CUT_B = d3["FEATURES"], d3["WINDOW"], d3["CUT_A"], d3["CUT_B"]


def r2(x):
    return round(float(x), 2)


def target(frame, asof):
    """Net spend (sales minus product returns) in the 180 days from the cut-off."""
    s = known[(known["InvoiceDate"] >= asof) & (known["InvoiceDate"] < asof + WINDOW)]
    r = cancels[(cancels["InvoiceDate"] >= asof) & (cancels["InvoiceDate"] < asof + WINDOW)
                & cancels["is_product"]]
    v = (s.groupby("Customer ID")["LineTotal"].sum().reindex(frame.index).fillna(0.0)
         + r.groupby("Customer ID")["LineTotal"].sum().reindex(frame.index).fillna(0.0))
    return v.clip(lower=0)


ytr, yte = target(train, CUT_A), target(test, CUT_B)
Xtr = np.log1p(train[FEATURES].astype(float).clip(lower=0))
Xte = np.log1p(test[FEATURES].astype(float).clip(lower=0))

out = {"target": "net spend in the 180 days after the cut-off (GBP)",
       "train": {"customers": int(len(ytr)), "mean_gbp": r2(ytr.mean()), "median_gbp": r2(ytr.median()),
                 "zero_pct": r2((ytr == 0).mean() * 100), "total_gbp": r2(ytr.sum())},
       "test": {"customers": int(len(yte)), "mean_gbp": r2(yte.mean()), "median_gbp": r2(yte.median()),
                "zero_pct": r2((yte == 0).mean() * 100), "total_gbp": r2(yte.sum())}}

# Spend is very right-skewed (G2-B3), so models learn log(1 + spend) and predictions are
# converted back. Errors are reported in pounds, because that is what the business reads.
preds = {"naive_half_of_last_12m": test["value_12m_gbp"].to_numpy() / 2}
models = {"linear_regression": make_pipeline(StandardScaler(), LinearRegression()),
          "random_forest": RandomForestRegressor(n_estimators=400, min_samples_leaf=10,
                                                 random_state=SEED, n_jobs=-1)}
for name, m in models.items():
    m.fit(Xtr, np.log1p(ytr))
    preds[name] = np.expm1(m.predict(Xte)).clip(min=0)

res = {}
for name, p in preds.items():
    res[name] = {"mae_gbp": r2(mean_absolute_error(yte, p)),
                 "r2_log_scale": round(float(r2_score(np.log1p(yte), np.log1p(p))), 4),
                 "spearman_rank": round(float(spearmanr(yte, p).statistic), 4),
                 "predicted_total_gbp": r2(p.sum())}
    # Does sorting by this prediction put the big future spenders first?
    order = np.argsort(-p)
    res[name]["top250_share_of_actual_spend_pct"] = r2(yte.to_numpy()[order][:250].sum() / yte.sum() * 100)
out["test_results"] = res

lr = models["linear_regression"]
out["linear_coefficients_std_log"] = {f: round(float(c), 4) for f, c in sorted(
    zip(FEATURES, lr[-1].coef_), key=lambda t: -abs(t[1]))}
rf = models["random_forest"]
out["random_forest_importance"] = {f: round(float(v), 4) for f, v in sorted(
    zip(FEATURES, rf.feature_importances_), key=lambda t: -t[1])}

# Chosen over ALL candidates, the naive guess included: a model has to beat it to earn a place.
best = min(preds, key=lambda n: res[n]["mae_gbp"])
out["chosen"] = best
fig, ax = plt.subplots(figsize=(5.5, 5))
ax.scatter(np.log1p(preds[best]), np.log1p(yte), s=6, alpha=.35)
lim = [0, max(np.log1p(yte).max(), np.log1p(preds[best]).max())]
ax.plot(lim, lim, "k:", lw=1)
ticks = [0, 100, 1000, 10000, 100000]
ax.set_xticks(np.log1p(ticks), [f"£{t:,}" for t in ticks])
ax.set_yticks(np.log1p(ticks), [f"£{t:,}" for t in ticks])
ax.set_xlabel("Predicted spend, next 180 days")
ax.set_ylabel("Actual spend, next 180 days")
ax.set_title(f"{best.replace('_', ' ')} (lowest error): out-of-time test (active at {CUT_B.date()})", fontsize=10)
fig.tight_layout()
fig.savefig(FIG / "g2d4-predicted-vs-actual.png", dpi=150)
plt.close(fig)

(HERE / "g2d4-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
