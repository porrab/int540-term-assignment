"""G2-D2: k-means customer segmentation on RFM.

Run after g2b.py (it reads the feature table that script writes):
    python3 g2d2.py

Writes g2d2-output.json and ../data/customer_segments.csv (customer_id -> segment).

Inputs are the three *_log_z columns from g2b.py: log(1+x) then z-score, so that
monetary (pounds, heavily right-skewed) does not swamp frequency and recency.
k is chosen from k = 2..8 by the elbow in within-cluster SSE and by silhouette,
and each k is re-run with 10 seeds to check that the split is stable.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score

HERE = Path(__file__).resolve().parent
DATA = HERE / "../data"
X_COLS = ["recency_days_log_z", "frequency_log_z", "monetary_gbp_log_z"]
SEED = 42


def r2(x):
    return round(float(x), 2)


feat = pd.read_csv(DATA / "customer_features.csv", index_col="customer_id")
X = feat[X_COLS].to_numpy()
out = {"customers": int(len(feat)), "inputs": X_COLS}

# ------------------------------------------------------------ choose k
scan = []
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=SEED).fit(X)
    runs = [KMeans(n_clusters=k, n_init=10, random_state=s).fit_predict(X) for s in range(10)]
    ari = [adjusted_rand_score(runs[0], r) for r in runs[1:]]
    scan.append({"k": k, "sse": r2(km.inertia_),
                 "silhouette": round(float(silhouette_score(X, km.labels_)), 4),
                 "seed_stability_min_ari": round(float(min(ari)), 4),
                 "smallest_cluster_pct": r2(np.bincount(km.labels_).min() / len(X) * 100)})
for i in range(1, len(scan)):
    scan[i]["sse_drop_pct_vs_previous_k"] = r2((scan[i - 1]["sse"] - scan[i]["sse"])
                                               / scan[i - 1]["sse"] * 100)
out["k_scan"] = scan

# What does k = 2 (best silhouette) actually split? Kept so the reason for not using it is checkable.
km2 = KMeans(n_clusters=2, n_init=10, random_state=SEED).fit(X)
f2 = feat.assign(c=km2.labels_)
out["k2_profile"] = [{"customers": int(len(g)), "centroid_log_z_RFM": [r2(x) for x in km2.cluster_centers_[c]],
                      "median_recency_days": r2(g["recency_days"].median()),
                      "median_frequency": r2(g["frequency"].median()),
                      "median_monetary_gbp": r2(g["monetary_gbp"].median()),
                      "silent_180_pct": r2(g["is_silent_180"].mean() * 100)}
                     for c, g in f2.groupby("c")]

K = 4   # see ../g2-d2-clustering.md for why (elbow + business readability + stability)
km = KMeans(n_clusters=K, n_init=10, random_state=SEED).fit(X)
feat["cluster"] = km.labels_

# ------------------------------------------------------------ profile clusters
total_m = feat["monetary_gbp"].sum()
prof = feat.groupby("cluster").agg(
    customers=("frequency", "size"),
    median_recency_days=("recency_days", "median"),
    median_frequency=("frequency", "median"),
    median_monetary_gbp=("monetary_gbp", "median"),
    revenue_gbp=("monetary_gbp", "sum"),
    silent_180_pct=("is_silent_180", "mean"),
    has_returned_pct=("has_returned", "mean"),
    median_tenure_days=("tenure_days", "median"),
    median_avg_days_between=("avg_days_between_orders", "median"),
    uk_pct=("is_uk", "mean"),
)
prof["customers_pct"] = prof["customers"] / len(feat) * 100
prof["revenue_share_pct"] = prof["revenue_gbp"] / total_m * 100
prof["silent_180_pct"] *= 100
prof["has_returned_pct"] *= 100
prof["uk_pct"] *= 100
prof["silent_revenue_gbp"] = feat[feat["is_silent_180"]].groupby("cluster")["monetary_gbp"].sum()
prof["silent_revenue_gbp"] = prof["silent_revenue_gbp"].fillna(0)
prof["return_rate_pct"] = (feat.groupby("cluster")["return_value_gbp"].sum()
                           / feat.groupby("cluster")["monetary_gbp"].sum() * 100)
prof["one_order_pct"] = feat.groupby("cluster")["frequency"].apply(lambda s: (s == 1).mean() * 100)
prof["sixplus_orders"] = feat.groupby("cluster")["frequency"].apply(lambda s: int((s >= 6).sum()))


# Business names are assigned by rule from the profile, not by cluster number,
# so the names survive a re-run that happens to number the clusters differently.
def name_clusters(p):
    names = {}
    order_value = p["median_monetary_gbp"].sort_values(ascending=False).index.tolist()
    champions = order_value[0]
    names[champions] = "Loyal wholesale (ลูกค้าประจำรายใหญ่)"
    rest = [c for c in p.index if c != champions]
    # among the rest: the most recent = new/active, the least recent = lost
    by_rec = p.loc[rest, "median_recency_days"].sort_values()
    lost = by_rec.index[-1]
    names[lost] = "Lapsed one-off (ซื้อน้อยแล้วหาย)"
    middle = [c for c in rest if c != lost]
    mid_by_rec = p.loc[middle, "median_recency_days"].sort_values()
    names[mid_by_rec.index[0]] = "Recent, still small (ลูกค้าใหม่/ยังเล็ก)"
    if len(middle) > 1:
        names[mid_by_rec.index[-1]] = "Slipping regulars (ลูกค้าประจำที่เริ่มห่าง)"
    return names


names = name_clusters(prof)
prof["segment"] = prof.index.map(names)
feat["segment"] = feat["cluster"].map(names)

cols = ["segment", "customers", "customers_pct", "median_recency_days", "median_frequency",
        "median_monetary_gbp", "revenue_gbp", "revenue_share_pct", "silent_180_pct",
        "silent_revenue_gbp", "has_returned_pct", "return_rate_pct", "one_order_pct", "sixplus_orders", "median_tenure_days",
        "median_avg_days_between", "uk_pct"]
out["k"] = K
out["profile"] = [{c: (r2(v) if isinstance(v, (float, np.floating)) else
                       int(v) if isinstance(v, (np.integer,)) else v)
                   for c, v in row.items()} for _, row in prof[cols].iterrows()]
out["centroids_log_z"] = {names[i]: [r2(x) for x in c] for i, c in enumerate(km.cluster_centers_)}

# Cross-check against the hand-made RFM scores from g2b.py: does k-means find
# something the 1-5 scores already show? Share of each segment by R score.
out["segment_by_R_score_pct"] = {
    seg: {int(k): r2(v * 100) for k, v in g["R_score"].value_counts(normalize=True).sort_index().items()}
    for seg, g in feat.groupby("segment")}

# The 205 silent regulars from G1 (6+ orders, silent >180 days): where do they land?
reg = feat[(feat["frequency"] >= 6) & feat["is_silent_180"]]
out["silent_regulars_6plus_by_segment"] = reg["segment"].value_counts().to_dict()

feat[["cluster", "segment"]].to_csv(DATA / "customer_segments.csv")
(HERE / "g2d2-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
