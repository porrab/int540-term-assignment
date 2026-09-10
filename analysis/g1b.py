"""G1-B numbers: retention pain point (B3), returns/cancellations (B4), journey stages (B6).

Run from this file's directory after unzipping the source data:
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 g1b.py

Writes g1b-output.json next to this script.

Filter conventions are the same working filter used in G1-A/G1-D3 so the numbers
in G1-B stack on the same base the team already agreed on:
  clean sale line = not a C-invoice, Quantity > 0, Price > 0, real product StockCode.
The formal cleaning decisions still belong to G1-D4.
"""
import json
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
CSV = HERE / "../data/online_retail_II.csv"

NON_PRODUCT_CODES = {
    "POST", "D", "M", "BANK CHARGES", "PADS", "DOT", "CRUK", "C2", "AMAZONFEE",
    "ADJUST", "ADJUST2", "S", "TEST001", "TEST002",
    "GIFT_0001_10", "GIFT_0001_20", "GIFT_0001_30", "GIFT_0001_40", "GIFT_0001_50",
}

df = pd.read_csv(CSV, dtype={"Customer ID": "Int64"}, parse_dates=["InvoiceDate"])
df["Invoice_str"] = df["Invoice"].astype(str)
df["is_cancel"] = df["Invoice_str"].str.startswith("C")
df["code_upper"] = df["StockCode"].astype(str).str.upper()
df["is_product"] = ~df["code_upper"].isin(NON_PRODUCT_CODES)
df["LineTotal"] = df["Quantity"] * df["Price"]

out = {}
DATA_END = df["InvoiceDate"].max()
out["data_end"] = str(DATA_END)

sales = df[(~df["is_cancel"]) & (df["Quantity"] > 0) & (df["Price"] > 0) & df["is_product"]].copy()
known = sales.dropna(subset=["Customer ID"]).copy()
out["sales_rows"] = len(sales)
out["sales_revenue_gbp"] = round(float(sales["LineTotal"].sum()), 2)
out["known_customer_revenue_gbp"] = round(float(known["LineTotal"].sum()), 2)
out["known_customer_revenue_pct"] = round(known["LineTotal"].sum() / sales["LineTotal"].sum() * 100, 2)

# ---------- B3: repeat purchase / one-time buyers ----------
cust = known.groupby("Customer ID").agg(
    orders=("Invoice", "nunique"),
    revenue=("LineTotal", "sum"),
    first=("InvoiceDate", "min"),
    last=("InvoiceDate", "max"),
).reset_index()
out["b3_n_customers"] = int(len(cust))
one = cust[cust["orders"] == 1]
out["b3_one_time_customers"] = int(len(one))
out["b3_one_time_pct"] = round(len(one) / len(cust) * 100, 2)
out["b3_one_time_revenue_gbp"] = round(float(one["revenue"].sum()), 2)
out["b3_one_time_revenue_pct"] = round(one["revenue"].sum() / cust["revenue"].sum() * 100, 2)
out["b3_one_time_avg_revenue_gbp"] = round(float(one["revenue"].mean()), 2)
out["b3_repeat_avg_revenue_gbp"] = round(float(cust[cust["orders"] > 1]["revenue"].mean()), 2)

bins = [(1, 1), (2, 2), (3, 3), (4, 5), (6, 10), (11, 10**9)]
dist = []
for lo, hi in bins:
    grp = cust[(cust["orders"] >= lo) & (cust["orders"] <= hi)]
    dist.append({
        "orders": f"{lo}" if lo == hi else (f"{lo}+" if hi > 10**8 else f"{lo}-{hi}"),
        "customers": int(len(grp)),
        "pct_customers": round(len(grp) / len(cust) * 100, 2),
        "revenue_gbp": round(float(grp["revenue"].sum()), 2),
        "pct_revenue": round(grp["revenue"].sum() / cust["revenue"].sum() * 100, 2),
    })
out["b3_order_count_distribution"] = dist

# Cohort with a fair 12-month observation window: first purchase early enough
# that every customer in it had >=12 months of chances to come back.
cohort_cut = DATA_END - pd.Timedelta(days=365)
cohort = cust[cust["first"] <= cohort_cut]
out["b3_cohort_cutoff"] = str(cohort_cut)
out["b3_cohort_n"] = int(len(cohort))
first_orders = known.merge(cohort[["Customer ID", "first"]], on="Customer ID", how="inner")
within = first_orders[first_orders["InvoiceDate"] <= first_orders["first"] + pd.Timedelta(days=365)]
orders_12m = within.groupby("Customer ID")["Invoice"].nunique()
out["b3_cohort_never_returned_12m"] = int((orders_12m == 1).sum())
out["b3_cohort_never_returned_12m_pct"] = round((orders_12m == 1).mean() * 100, 2)

# time to 2nd purchase
inv = known.groupby(["Customer ID", "Invoice"])["InvoiceDate"].min().reset_index()
inv = inv.sort_values(["Customer ID", "InvoiceDate"])
inv["rank"] = inv.groupby("Customer ID").cumcount() + 1
second = inv[inv["rank"] == 2][["Customer ID", "InvoiceDate"]].rename(columns={"InvoiceDate": "second"})
gap = second.merge(cust[["Customer ID", "first"]], on="Customer ID")
gap["days"] = (gap["second"] - gap["first"]).dt.days
out["b3_days_to_second_purchase"] = {
    "median": round(float(gap["days"].median()), 1),
    "p25": round(float(gap["days"].quantile(0.25)), 1),
    "p75": round(float(gap["days"].quantile(0.75)), 1),
    "pct_within_90d": round(float((gap["days"] <= 90).mean() * 100), 2),
}

# lapsed / silent customers: no purchase in the last N days of the data
cust["recency_days"] = (DATA_END - cust["last"]).dt.days
for d in (90, 180, 365):
    grp = cust[cust["recency_days"] > d]
    out[f"b3_silent_over_{d}d_customers"] = int(len(grp))
    out[f"b3_silent_over_{d}d_pct"] = round(len(grp) / len(cust) * 100, 2)
    out[f"b3_silent_over_{d}d_revenue_pct"] = round(grp["revenue"].sum() / cust["revenue"].sum() * 100, 2)

# ---------- B4: cancellations / returns ----------
canc = df[df["is_cancel"]].copy()
out["b4_cancel_rows"] = int(len(canc))
out["b4_cancel_invoices"] = int(canc["Invoice"].nunique())
out["b4_cancel_value_gbp"] = round(float(canc["LineTotal"].sum()), 2)
out["b4_cancel_value_pct_of_sales"] = round(abs(canc["LineTotal"].sum()) / sales["LineTotal"].sum() * 100, 2)
out["b4_cancel_units"] = int(canc["Quantity"].sum())
out["b4_cancel_rows_missing_customer"] = int(canc["Customer ID"].isna().sum())
out["b4_cancel_value_missing_customer_gbp"] = round(float(canc.loc[canc["Customer ID"].isna(), "LineTotal"].sum()), 2)

# negative quantity that is NOT a C-invoice
negnc = df[(df["Quantity"] < 0) & (~df["is_cancel"])].copy()
out["b4_negqty_not_cancel_rows"] = int(len(negnc))
out["b4_negqty_not_cancel_value_gbp"] = round(float(negnc["LineTotal"].sum()), 2)
out["b4_negqty_not_cancel_missing_customer_pct"] = round(float(negnc["Customer ID"].isna().mean() * 100), 2)
out["b4_negqty_not_cancel_top_descriptions"] = (
    negnc["Description"].fillna("(blank)").str.strip().str.lower().value_counts().head(10).to_dict()
)

# who returns
canc_known = canc.dropna(subset=["Customer ID"])
returners = set(canc_known["Customer ID"].unique())
cust["ever_returned"] = cust["Customer ID"].isin(returners)
out["b4_customers_who_ever_returned"] = int(cust["ever_returned"].sum())
out["b4_customers_who_ever_returned_pct"] = round(cust["ever_returned"].mean() * 100, 2)
out["b4_return_rate_among_one_time"] = round(
    float(cust.loc[cust["orders"] == 1, "ever_returned"].mean() * 100), 2)
out["b4_return_rate_among_repeat"] = round(
    float(cust.loc[cust["orders"] > 1, "ever_returned"].mean() * 100), 2)

# Concentration of return value, grouped by StockCode alone. Grouping by
# (StockCode, Description) instead splits a code across description variants
# that differ only by whitespace -- "Bank Charges" vs " Bank Charges" -- and
# under-reports it, so the code is the unit here and the description shown is
# the most common spelling. (The whitespace variants themselves are a data
# quality issue for G1-D4.)
by_code = canc.groupby("StockCode")["LineTotal"].sum().sort_values().head(10)
desc_of = canc.groupby("StockCode")["Description"].agg(
    lambda x: x.dropna().mode().iloc[0] if len(x.dropna()) else "(blank)")
rows_of = canc.groupby("StockCode")["LineTotal"].size()
out["b4_top10_return_codes_by_value"] = [
    {"stockcode": str(k), "description": str(desc_of[k]),
     "rows": int(rows_of[k]), "value_gbp": round(float(v), 2)}
    for k, v in by_code.items()
]
prod_ret = canc[canc["is_product"]]["LineTotal"].sum()
nonprod_ret = canc[~canc["is_product"]]["LineTotal"].sum()
out["b4_return_value_product_gbp"] = round(float(prod_ret), 2)
out["b4_return_value_nonproduct_gbp"] = round(float(nonprod_ret), 2)
out["b4_return_value_nonproduct_pct"] = round(nonprod_ret / canc["LineTotal"].sum() * 100, 2)

by_cust = canc_known.groupby("Customer ID")["LineTotal"].sum().sort_values()
out["b4_n_returning_customers"] = int(len(by_cust))
out["b4_top10_returning_customers_value"] = [round(float(v), 2) for v in by_cust.head(10)]
out["b4_top10_returning_customers_share_pct"] = round(
    by_cust.head(10).sum() / canc_known["LineTotal"].sum() * 100, 2)
out["b4_top1pct_returning_customers_share_pct"] = round(
    by_cust.head(max(1, int(len(by_cust) * 0.01))).sum() / canc_known["LineTotal"].sum() * 100, 2)

by_country = canc.groupby("Country")["LineTotal"].sum().sort_values().head(6)
out["b4_top_return_countries"] = {str(k): round(float(v), 2) for k, v in by_country.items()}

# returns as % of that market's own sales (UK vs non-UK)
for label, mask_s, mask_c in (
    ("uk", sales["Country"] == "United Kingdom", canc["Country"] == "United Kingdom"),
    ("nonuk", sales["Country"] != "United Kingdom", canc["Country"] != "United Kingdom"),
):
    s = sales.loc[mask_s, "LineTotal"].sum()
    c = abs(canc.loc[mask_c, "LineTotal"].sum())
    out[f"b4_return_rate_{label}_pct"] = round(c / s * 100, 2)

# ---------- B4b: what a C-invoice actually contains ----------
# The C prefix sits on the INVOICE, not the row, so summing every C row also
# picks up the fee/adjustment lines that share those credit notes.
canc_lines = canc.groupby("Invoice")["is_product"].agg(["sum", "count"])
out["b4b_c_invoices_total"] = int(len(canc_lines))
out["b4b_c_invoices_products_only"] = int((canc_lines["sum"] == canc_lines["count"]).sum())
out["b4b_c_invoices_no_product_at_all"] = int((canc_lines["sum"] == 0).sum())
out["b4b_c_invoices_mixed"] = int(
    len(canc_lines) - (canc_lines["sum"] == canc_lines["count"]).sum() - (canc_lines["sum"] == 0).sum())
out["b4b_no_product_invoices_with_one_line"] = int(
    (canc_lines.loc[canc_lines["sum"] == 0, "count"] == 1).sum())

# the same non-product codes also appear on ordinary invoices as positive lines,
# which shows they are line types, not "codes that belong to C invoices"
out["b4b_code_split_c_vs_normal"] = {}
for code in ("M", "AMAZONFEE", "BANK CHARGES", "D", "POST", "CRUK"):
    m = df[df["code_upper"] == code]
    in_c, in_n = m[m["is_cancel"]], m[~m["is_cancel"]]
    out["b4b_code_split_c_vs_normal"][code] = {
        "c_rows": int(len(in_c)), "c_value_gbp": round(float(in_c["LineTotal"].sum()), 2),
        "normal_rows": int(len(in_n)), "normal_value_gbp": round(float(in_n["LineTotal"].sum()), 2),
        "c_avg_line_gbp": round(float(in_c["LineTotal"].mean()), 2) if len(in_c) else None,
    }

# ---------- B6: journey-stage counts ----------
out["b6_stage_counts"] = {
    "customers_with_id": int(len(cust)),
    "bought_once_only": int(len(one)),
    "bought_2_or_more": int((cust["orders"] >= 2).sum()),
    "bought_5_or_more": int((cust["orders"] >= 5).sum()),
    "silent_over_180d": int(out["b3_silent_over_180d_customers"]),
    "ever_returned": int(cust["ever_returned"].sum()),
}
monthly = sales.set_index("InvoiceDate")["LineTotal"].resample("ME").sum()
out["b6_monthly_revenue_gbp"] = {str(k.date()): round(float(v), 2) for k, v in monthly.items()}

with open(HERE / "g1b-output.json", "w") as f:
    json.dump(out, f, indent=2, default=str, ensure_ascii=False)
print(json.dumps(out, indent=2, default=str, ensure_ascii=False))
