"""G2-B numbers: cleansing log (B1), customer features (B2), transformation (B3).

Run from this file's directory after unzipping the source data:
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 g2b.py

Writes:
  g2b-output.json                 every number quoted in ../g2-b-data-treatment.md
  ../data/customer_features.csv   one row per customer, snapshot at the data end
                                  (feeds the BI dashboard G2-D1 and clustering G2-D2)
  ../data/customer_features_backtest.csv
                                  features from year 1 only + churn label from year 2
                                  (feeds classification G2-D3; same split as churn-backtest.py)

Applies every decision in ../g1-d4-d8-data-decisions.md (G1-D4) in order, logging the
row count after each step. G1-D4 decided to drop exact duplicate rows, but the Goal 1
scripts as submitted did not (their base of 1,037,007 rows still contained them; fixed in
all scripts on 2026-10-08). This script also reports how much each headline number moves
between the two bases, see ../dedup-recheck.md.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
DATA = HERE / "../data"
CSV = DATA / "online_retail_II.csv"

NON_PRODUCT_CODES = {
    "POST", "D", "M", "BANK CHARGES", "PADS", "DOT", "CRUK", "C2", "AMAZONFEE",
    "ADJUST", "ADJUST2", "S", "TEST001", "TEST002",
    "GIFT_0001_10", "GIFT_0001_20", "GIFT_0001_30", "GIFT_0001_40", "GIFT_0001_50",
}
SILENT_DAYS = 180                       # team decision 10 Sep: "silent" = no order for 180+ days
CUTOFF = pd.Timestamp("2010-12-09")     # same time split as churn-backtest.py

df = pd.read_csv(CSV, dtype={"Customer ID": "Int64"}, parse_dates=["InvoiceDate"])
df["is_cancel"] = df["Invoice"].astype(str).str.startswith("C")
df["is_product"] = ~df["StockCode"].astype(str).str.upper().isin(NON_PRODUCT_CODES)
df["LineTotal"] = df["Quantity"] * df["Price"]
DATA_END = df["InvoiceDate"].max().normalize() + pd.Timedelta(days=1)

out = {"data_end_exclusive": str(DATA_END.date()), "silent_days": SILENT_DAYS}


def r2(x):
    return round(float(x), 2)


# ---------------------------------------------------------------- B1: cleansing log
log = []


def step(name, frame, note):
    log.append({"step": name, "rows": int(len(frame)),
                "value_gbp": r2(frame["LineTotal"].sum()), "note": note})


step("0 raw file (2 sheets combined)", df, "starting point")
dedup = df.drop_duplicates(subset=[c for c in df.columns
                                   if c not in ("is_cancel", "is_product", "LineTotal")])
step("1 drop exact duplicate rows", dedup, "export artefact, not two real transactions")

cancels = dedup[dedup["is_cancel"]]
s = dedup[~dedup["is_cancel"]]
step("2 set aside C-invoices (kept in a returns table)", s, "returns are analysed separately")
s = s[s["Quantity"] > 0]
step("3 drop Quantity <= 0 outside C-invoices", s, "money out cannot sit inside sales")
s = s[s["Price"] > 0]
step("4 drop Price <= 0", s, "free samples / accounting fixes, not revenue")
sales = s[s["is_product"]]
step("5 drop non-product StockCodes", sales, "postage, fees, discounts are not product sales")
known = sales.dropna(subset=["Customer ID"])
step("6 customer-level base: Customer ID known", known,
     "sales total keeps step 5; every per-customer number uses this step")

for i, row in enumerate(log):
    prev = log[i - 1]["rows"] if i else row["rows"]
    row["removed_vs_previous"] = prev - row["rows"]
out["b1_cleansing_log"] = log
out["b1_returns_table_rows"] = int(len(cancels))
out["b1_returns_table_value_gbp"] = r2(cancels["LineTotal"].sum())

# Effect of the duplicate fix on the Goal 1 headline numbers.
g1_sales = df[(~df["is_cancel"]) & (df["Quantity"] > 0) & (df["Price"] > 0) & df["is_product"]]
g1_known = g1_sales.dropna(subset=["Customer ID"])


def headline(sales_df, known_df):
    last = known_df.groupby("Customer ID")["InvoiceDate"].max()
    orders = known_df.groupby("Customer ID")["Invoice"].nunique()
    silent = (DATA_END - last).dt.days > SILENT_DAYS
    return {
        "sales_rows": int(len(sales_df)),
        "sales_revenue_gbp": r2(sales_df["LineTotal"].sum()),
        "customers": int(known_df["Customer ID"].nunique()),
        "repeat_rate_pct": r2((orders > 1).mean() * 100),
        "silent_180_pct": r2(silent.mean() * 100),
    }


out["b1_duplicate_effect"] = {"goal1_base_with_duplicates": headline(g1_sales, g1_known),
                              "goal2_base_deduplicated": headline(sales, known)}


# ---------------------------------------------------------------- B2: features
def build_features(sales_known, returns, asof):
    """One row per customer, using only rows strictly before `asof`."""
    sk = sales_known[sales_known["InvoiceDate"] < asof]
    rt = returns[(returns["InvoiceDate"] < asof) & returns["is_product"]].dropna(
        subset=["Customer ID"])

    per_inv = sk.groupby(["Customer ID", "Invoice"]).agg(
        basket_value=("LineTotal", "sum"),
        basket_lines=("StockCode", "nunique"),
        basket_units=("Quantity", "sum"))
    g = sk.groupby("Customer ID")
    f = pd.DataFrame({
        "first_purchase": g["InvoiceDate"].min(),
        "last_purchase": g["InvoiceDate"].max(),
        "frequency": g["Invoice"].nunique(),
        "monetary_gbp": g["LineTotal"].sum(),
        "country": g["Country"].agg(lambda x: x.mode().iloc[0]),
    })
    pc = per_inv.groupby("Customer ID")
    f["avg_basket_gbp"] = pc["basket_value"].mean()
    f["avg_lines_per_basket"] = pc["basket_lines"].mean()
    f["avg_units_per_basket"] = pc["basket_units"].mean()
    f["recency_days"] = (asof - f["last_purchase"]).dt.days
    f["tenure_days"] = (asof - f["first_purchase"]).dt.days
    f["avg_days_between_orders"] = np.where(
        f["frequency"] > 1,
        (f["last_purchase"] - f["first_purchase"]).dt.days / (f["frequency"] - 1).clip(lower=1),
        np.nan)
    ret_val = rt.groupby("Customer ID")["LineTotal"].sum().abs()
    f["return_value_gbp"] = ret_val.reindex(f.index).fillna(0.0)
    f["has_returned"] = f["return_value_gbp"] > 0
    f["return_rate_pct"] = f["return_value_gbp"] / f["monetary_gbp"] * 100
    f["is_uk"] = f["country"].eq("United Kingdom")
    # Same 12-units-per-invoice rule G1-A4 used to split retail from wholesale baskets.
    f["buyer_type"] = np.where(f["avg_units_per_basket"] > 12, "wholesale-sized", "retail-sized")
    f["is_silent_180"] = f["recency_days"] > SILENT_DAYS
    return f


feat = build_features(known, cancels, DATA_END)

# Equal-frequency binning into 1-5 scores (the RFM method from the 24 Sep class).
# Recency is reversed: fewer days since last order = better = 5.
feat["R_score"] = pd.qcut(feat["recency_days"].rank(method="first"), 5,
                          labels=[5, 4, 3, 2, 1]).astype(int)
feat["F_score"] = pd.qcut(feat["frequency"].rank(method="first"), 5,
                          labels=[1, 2, 3, 4, 5]).astype(int)
feat["M_score"] = pd.qcut(feat["monetary_gbp"].rank(method="first"), 5,
                          labels=[1, 2, 3, 4, 5]).astype(int)
feat["RFM_code"] = (feat["R_score"].astype(str) + feat["F_score"].astype(str)
                    + feat["M_score"].astype(str))

b2 = {"customers": int(len(feat))}
num_cols = ["recency_days", "frequency", "monetary_gbp", "avg_basket_gbp",
            "avg_lines_per_basket", "avg_units_per_basket", "tenure_days",
            "avg_days_between_orders", "return_value_gbp", "return_rate_pct"]
b2["summary"] = {c: {"median": r2(feat[c].median()), "mean": r2(feat[c].mean()),
                     "p95": r2(feat[c].quantile(.95)), "max": r2(feat[c].max()),
                     "missing": int(feat[c].isna().sum())} for c in num_cols}
b2["has_returned_pct"] = r2(feat["has_returned"].mean() * 100)
b2["is_uk_pct"] = r2(feat["is_uk"].mean() * 100)
b2["buyer_type_counts"] = feat["buyer_type"].value_counts().to_dict()
b2["silent_180_customers"] = int(feat["is_silent_180"].sum())
b2["silent_180_pct"] = r2(feat["is_silent_180"].mean() * 100)
b2["silent_180_revenue_share_pct"] = r2(
    feat.loc[feat["is_silent_180"], "monetary_gbp"].sum() / feat["monetary_gbp"].sum() * 100)
b2["rfm_bin_edges"] = {
    "recency_days": [r2(x) for x in feat.groupby("R_score")["recency_days"].max().sort_index(ascending=False)],
    "frequency": [int(x) for x in feat.groupby("F_score")["frequency"].max().sort_index()],
    "monetary_gbp": [r2(x) for x in feat.groupby("M_score")["monetary_gbp"].max().sort_index()],
}
# Silent rate by recency score is trivially 0/100; by F score it says something.
b2["silent_pct_by_F_score"] = {int(k): r2(v * 100) for k, v in
                               feat.groupby("F_score")["is_silent_180"].mean().items()}
b2["silent_pct_by_returned"] = {str(k): r2(v * 100) for k, v in
                                feat.groupby("has_returned")["is_silent_180"].mean().items()}
# The gap above is mostly frequency: customers with more orders have more chances to
# return something AND are less likely to go silent. Holding F score fixed shows that.
b2["silent_pct_by_F_and_returned"] = {
    f"F{int(k[0])}_returned_{k[1]}": r2(v * 100)
    for k, v in feat.groupby(["F_score", "has_returned"])["is_silent_180"].mean().items()}
b2["retail_sized_revenue_share_pct"] = r2(
    feat.loc[feat["buyer_type"] == "retail-sized", "monetary_gbp"].sum()
    / feat["monetary_gbp"].sum() * 100)
# G1-B3/G1-C "value at risk": silent regulars. Goal 1 quoted £813,004 (6+ orders) from an
# ad-hoc run on the base with duplicates; this is the scripted, deduplicated figure.
total_m = feat["monetary_gbp"].sum()
b2["silent_regulars"] = {}
for lo in (6, 11):
    grp = feat[feat["frequency"] >= lo]
    sil = grp[grp["is_silent_180"]]
    b2["silent_regulars"][f"{lo}plus"] = {
        "customers": int(len(grp)), "revenue_share_pct": r2(grp["monetary_gbp"].sum() / total_m * 100),
        "silent": int(len(sil)), "silent_pct": r2(len(sil) / len(grp) * 100),
        "silent_revenue_gbp": r2(sil["monetary_gbp"].sum()),
        "silent_revenue_share_pct": r2(sil["monetary_gbp"].sum() / total_m * 100)}
# Same figure on the Goal 1 base (duplicates kept), so the old £813,004 is reproducible too.
g1g = g1_known.groupby("Customer ID").agg(o=("Invoice", "nunique"), m=("LineTotal", "sum"),
                                          last=("InvoiceDate", "max"))
g1s = g1g[(g1g["o"] >= 6) & ((DATA_END - g1g["last"]).dt.days > SILENT_DAYS)]
b2["silent_regulars"]["6plus_goal1_base_with_duplicates"] = {
    "silent": int(len(g1s)), "silent_revenue_gbp": r2(g1s["m"].sum()),
    "silent_revenue_share_pct": r2(g1s["m"].sum() / g1g["m"].sum() * 100)}
out["b2_features"] = b2

# ---------------------------------------------------------------- B3: transformation
def skew_kurt(x):
    x = x.dropna()
    return {"skewness": r2(x.skew()), "excess_kurtosis": r2(x.kurt())}


b3 = {}
for c in ["recency_days", "frequency", "monetary_gbp", "avg_basket_gbp"]:
    x = feat[c]
    q1, q3 = x.quantile([.25, .75])
    upper = q3 + 1.5 * (q3 - q1)
    b3[c] = {
        "raw": skew_kurt(x),
        "log1p": skew_kurt(np.log1p(x)),
        "iqr_upper_fence": r2(upper),
        "outliers_above_fence": int((x > upper).sum()),
        "outlier_share_of_revenue_pct": r2(
            feat.loc[x > upper, "monetary_gbp"].sum() / feat["monetary_gbp"].sum() * 100),
        "mean": r2(x.mean()), "median": r2(x.median()),
    }
top1 = feat["monetary_gbp"] >= feat["monetary_gbp"].quantile(.99)
b3["top1pct_customers"] = int(top1.sum())
b3["top1pct_revenue_share_pct"] = r2(feat.loc[top1, "monetary_gbp"].sum()
                                     / feat["monetary_gbp"].sum() * 100)
b3["negative_or_zero_monetary"] = int((feat["monetary_gbp"] <= 0).sum())

# Model-ready columns: log1p for the right-skewed ones, then z-score.
for c in ["recency_days", "frequency", "monetary_gbp"]:
    lx = np.log1p(feat[c])
    feat[f"{c}_log_z"] = (lx - lx.mean()) / lx.std()
out["b3_transformation"] = b3

# ---------------------------------------------------------------- backtest feature table
bt = build_features(known, cancels, CUTOFF)
future_buyers = set(known.loc[known["InvoiceDate"] > CUTOFF, "Customer ID"].unique())
bt["churn_next_12m"] = ~bt.index.isin(future_buyers)
out["backtest_table"] = {
    "cutoff": str(CUTOFF.date()),
    "customers": int(len(bt)),
    "churned": int(bt["churn_next_12m"].sum()),
    "churn_rate_pct": r2(bt["churn_next_12m"].mean() * 100),
    "churned_prior_revenue_gbp": r2(bt.loc[bt["churn_next_12m"], "monetary_gbp"].sum()),
}

# ---------------------------------------------------------------- write
keep_dates = ["first_purchase", "last_purchase"]
for frame, name in [(feat, "customer_features.csv"), (bt, "customer_features_backtest.csv")]:
    o = frame.copy()
    for c in keep_dates:
        o[c] = o[c].dt.date
    o.round(4).to_csv(DATA / name, index_label="customer_id")

(HERE / "g2b-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
