"""G1-D1-D3 profiling + G1-A2/A4 company-profile numbers for Online Retail II.

Run from this file's directory after unzipping the source data:
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 profile.py

Writes profile-output.json next to this script.
"""
import json
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
CSV = HERE / "../data/online_retail_II.csv"

df = pd.read_csv(CSV, dtype={"Customer ID": "Int64"}, parse_dates=["InvoiceDate"])
out = {}

# ---- G1-D1: confirm this file already spans both UCI sheets (2009-2010 + 2010-2011) ----
# The Kaggle/community mirror of UCI dataset 502 ships the two Excel sheets
# ("Year 2009-2010", "Year 2010-2011") pre-merged into one CSV. Row count and
# date range below confirm it matches the UCI spec (1,067,371 rows spanning
# 2009-12-01 to 2011-12-09) so no further sheet-merging step is needed.
out["d1_row_count"] = len(df)
out["d1_date_min"] = str(df["InvoiceDate"].min())
out["d1_date_max"] = str(df["InvoiceDate"].max())
out["d1_columns"] = list(df.columns)

# ---- G1-D2: profiling ----
out["d2_dtypes"] = {c: str(t) for c, t in df.dtypes.items()}
out["d2_missing"] = {c: int(df[c].isna().sum()) for c in df.columns}
out["d2_missing_pct"] = {c: round(df[c].isna().mean() * 100, 2) for c in df.columns}
out["d2_duplicate_rows"] = int(df.duplicated().sum())
out["d2_n_unique_invoice"] = int(df["Invoice"].nunique())
out["d2_n_unique_stockcode"] = int(df["StockCode"].nunique())
out["d2_n_unique_customer"] = int(df["Customer ID"].nunique())
out["d2_n_unique_country"] = int(df["Country"].nunique())
out["d2_quantity_range"] = [float(df["Quantity"].min()), float(df["Quantity"].max())]
out["d2_price_range"] = [float(df["Price"].min()), float(df["Price"].max())]

# ---- G1-D3: data quality issues (identification only — no cleaning decisions here) ----
df["Invoice_str"] = df["Invoice"].astype(str)
is_cancel = df["Invoice_str"].str.startswith("C")
out["d3_cancelled_invoices_rows"] = int(is_cancel.sum())
out["d3_cancelled_invoices_pct_rows"] = round(is_cancel.mean() * 100, 2)

neg_qty = df["Quantity"] < 0
out["d3_negative_qty_rows"] = int(neg_qty.sum())
out["d3_negative_qty_pct"] = round(neg_qty.mean() * 100, 2)
out["d3_negative_qty_not_cancelled"] = int((neg_qty & ~is_cancel).sum())

zero_price = df["Price"] == 0
out["d3_zero_price_rows"] = int(zero_price.sum())
out["d3_zero_price_pct"] = round(zero_price.mean() * 100, 2)
out["d3_negative_price_rows"] = int((df["Price"] < 0).sum())

empty_desc = df["Description"].isna() | (df["Description"].astype(str).str.strip() == "")
out["d3_empty_description_rows"] = int(empty_desc.sum())

missing_cust = df["Customer ID"].isna()
out["d3_missing_customer_id_rows"] = int(missing_cust.sum())
out["d3_missing_customer_id_pct"] = round(missing_cust.mean() * 100, 2)

NON_PRODUCT_CODES = {
    "POST", "D", "M", "BANK CHARGES", "PADS", "DOT", "CRUK", "C2", "AMAZONFEE",
    "ADJUST", "ADJUST2", "S", "TEST001", "TEST002",
    "GIFT_0001_10", "GIFT_0001_20", "GIFT_0001_30", "GIFT_0001_40", "GIFT_0001_50",
}
codes_upper = df["StockCode"].astype(str).str.upper()
mask_np = codes_upper.isin(NON_PRODUCT_CODES)
out["d3_non_product_stockcode_rows"] = int(mask_np.sum())
out["d3_non_product_stockcode_values_present"] = sorted(df.loc[mask_np, "StockCode"].astype(str).unique().tolist())

out["d3_returns_total_value_gbp"] = round(float((df.loc[is_cancel, "Quantity"] * df.loc[is_cancel, "Price"]).sum()), 2)

# ---- G1-A: company / country profile ----
# "Clean sales rows" here = not a cancellation, positive qty, positive price.
# This is a working filter for descriptive stats only — the real cleaning
# decisions (with rationale) belong to G1-D4, not this step.
clean = df[(~is_cancel) & (df["Quantity"] > 0) & (df["Price"] > 0)].copy()
clean["LineTotal"] = clean["Quantity"] * clean["Price"]
clean_products_only = clean[~codes_upper.reindex(clean.index).isin(NON_PRODUCT_CODES)]

out["a_clean_rows"] = len(clean)
out["a_gross_revenue_incl_nonproduct_lines_gbp"] = round(float(clean["LineTotal"].sum()), 2)
out["a_net_product_revenue_gbp"] = round(float(clean_products_only["LineTotal"].sum()), 2)
out["a_nonproduct_lines_revenue_gbp"] = round(
    float(clean.loc[codes_upper.reindex(clean.index).isin(NON_PRODUCT_CODES), "LineTotal"].sum()), 2
)

uk = clean_products_only[clean_products_only["Country"] == "United Kingdom"]
non_uk = clean_products_only[clean_products_only["Country"] != "United Kingdom"]
out["a_uk_revenue_gbp"] = round(float(uk["LineTotal"].sum()), 2)
out["a_nonuk_revenue_gbp"] = round(float(non_uk["LineTotal"].sum()), 2)
out["a_uk_revenue_pct"] = round(uk["LineTotal"].sum() / clean_products_only["LineTotal"].sum() * 100, 2)
out["a_uk_rows_pct"] = round(len(uk) / len(clean_products_only) * 100, 2)
out["a_n_countries"] = int(clean_products_only["Country"].nunique())
out["a_top10_countries_by_revenue"] = (
    clean_products_only.groupby("Country")["LineTotal"].sum().sort_values(ascending=False).head(10).round(2).to_dict()
)

out["a_n_customers_known"] = int(clean_products_only["Customer ID"].nunique())
out["a_n_invoices"] = int(clean_products_only["Invoice"].nunique())
out["a_n_products"] = int(clean_products_only["StockCode"].nunique())
out["a_date_min"] = str(clean_products_only["InvoiceDate"].min())
out["a_date_max"] = str(clean_products_only["InvoiceDate"].max())

# basket size per invoice (units and value) -> retail vs wholesale split
basket = clean_products_only.groupby("Invoice").agg(
    units=("Quantity", "sum"),
    value=("LineTotal", "sum"),
    n_lines=("StockCode", "nunique"),
    customer=("Customer ID", "first"),
    country=("Country", "first"),
).reset_index()
out["a_basket_units_describe"] = {k: round(float(v), 2) for k, v in basket["units"].describe().to_dict().items()}
out["a_basket_value_describe"] = {k: round(float(v), 2) for k, v in basket["value"].describe().to_dict().items()}

for q in [0.5, 0.75, 0.90, 0.95, 0.99]:
    out[f"a_basket_units_p{int(q * 100)}"] = round(float(basket["units"].quantile(q)), 2)

for thresh in [50, 100, 200, 500]:
    wholesale = basket[basket["units"] >= thresh]
    out[f"a_wholesale_thresh{thresh}_n_invoices"] = int(len(wholesale))
    out[f"a_wholesale_thresh{thresh}_pct_invoices"] = round(len(wholesale) / len(basket) * 100, 2)
    out[f"a_wholesale_thresh{thresh}_pct_revenue"] = round(wholesale["value"].sum() / basket["value"].sum() * 100, 2)

# Repeat-purchase behaviour — not required for A, but cheap to compute now
# from the same merged+profiled dataset so G1-B3 does not redo this work.
cust_orders = clean_products_only.dropna(subset=["Customer ID"]).groupby("Customer ID")["Invoice"].nunique()
out["b3_pct_one_time_customers"] = round((cust_orders == 1).mean() * 100, 2)
out["b3_n_customers_with_id"] = int(len(cust_orders))

with open(HERE / "profile-output.json", "w") as f:
    json.dump(out, f, indent=2, default=str, ensure_ascii=False)

print(json.dumps(out, indent=2, default=str, ensure_ascii=False))
