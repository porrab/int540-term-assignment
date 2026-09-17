"""G1-D4-D8 numbers: cleaning-decision verification (D4), EDA (D5), data model + SQL (D6/D7).

Run from this file's directory after unzipping the source data:
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 g1d.py

Writes g1d-output.json next to this script.

Same base filter as G1-A/G1-B/G1-D3 so numbers stack on the same agreed base:
  clean sale line = not a C-invoice, Quantity > 0, Price > 0, real product StockCode.
"""
import json
import sqlite3
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
out["sales_rows"] = int(len(sales))
out["sales_revenue_gbp"] = round(float(sales["LineTotal"].sum()), 2)

# ---------- D4: verify the size of each decision (counts that back the decision table) ----------
d4 = {}
d4["total_rows"] = int(len(df))
d4["duplicate_rows"] = int(df.duplicated().sum())
d4["missing_customer_id_rows"] = int(df["Customer ID"].isna().sum())
d4["missing_customer_id_pct"] = round(df["Customer ID"].isna().mean() * 100, 2)
d4["missing_customer_id_revenue_pct"] = round(
    df.loc[df["Customer ID"].isna(), "LineTotal"].sum()
    / df.loc[df["Quantity"] > 0, "LineTotal"].sum() * 100, 2)
d4["cancel_rows"] = int(df["is_cancel"].sum())
d4["cancel_value_gbp"] = round(float(df.loc[df["is_cancel"], "LineTotal"].sum()), 2)
d4["negative_qty_not_cancel_rows"] = int(((df["Quantity"] < 0) & (~df["is_cancel"])).sum())
d4["price_zero_rows"] = int((df["Price"] == 0).sum())
d4["price_negative_rows"] = int((df["Price"] < 0).sum())
d4["description_blank_rows"] = int(df["Description"].isna().sum())
d4["non_product_rows"] = int((~df["is_product"]).sum())
d4["non_product_codes"] = sorted(df.loc[~df["is_product"], "code_upper"].unique().tolist())
d4["clean_sales_rows_after_all_filters"] = int(len(sales))
d4["clean_sales_rows_pct_of_total"] = round(len(sales) / len(df) * 100, 2)
out["d4"] = d4

# ---------- D5: EDA ----------
d5 = {}

monthly = sales.set_index("InvoiceDate")["LineTotal"].resample("ME").sum()
d5["monthly_revenue_gbp"] = {str(k.date()): round(float(v), 2) for k, v in monthly.items()}
nov_dec = sales[sales["InvoiceDate"].dt.month.isin([11, 12])]
other_months = sales[~sales["InvoiceDate"].dt.month.isin([11, 12])]
d5["nov_dec_share_of_revenue_pct"] = round(
    nov_dec["LineTotal"].sum() / sales["LineTotal"].sum() * 100, 2)
d5["avg_monthly_revenue_nov_dec_gbp"] = round(float(nov_dec.groupby(
    [nov_dec["InvoiceDate"].dt.year, nov_dec["InvoiceDate"].dt.month])["LineTotal"].sum().mean()), 2)
d5["avg_monthly_revenue_other_gbp"] = round(float(other_months.groupby(
    [other_months["InvoiceDate"].dt.year, other_months["InvoiceDate"].dt.month])["LineTotal"].sum().mean()), 2)

by_product_rev = sales.groupby("StockCode").agg(
    revenue=("LineTotal", "sum"), qty=("Quantity", "sum"),
    description=("Description", lambda x: x.dropna().mode().iloc[0] if len(x.dropna()) else "(blank)"),
).sort_values("revenue", ascending=False)
d5["top10_products_by_revenue"] = [
    {"stockcode": str(k), "description": str(r["description"]),
     "revenue_gbp": round(float(r["revenue"]), 2), "units": int(r["qty"])}
    for k, r in by_product_rev.head(10).iterrows()
]
by_product_qty = sales.groupby("StockCode").agg(
    qty=("Quantity", "sum"),
    description=("Description", lambda x: x.dropna().mode().iloc[0] if len(x.dropna()) else "(blank)"),
).sort_values("qty", ascending=False)
d5["top10_products_by_units"] = [
    {"stockcode": str(k), "description": str(r["description"]), "units": int(r["qty"])}
    for k, r in by_product_qty.head(10).iterrows()
]

by_country = sales.groupby("Country")["LineTotal"].sum().sort_values(ascending=False)
d5["top10_countries_by_revenue"] = {str(k): round(float(v), 2) for k, v in by_country.head(10).items()}
d5["uk_share_pct"] = round(by_country.get("United Kingdom", 0) / by_country.sum() * 100, 2)
d5["n_countries"] = int(sales["Country"].nunique())

basket = sales.groupby("Invoice").agg(
    basket_value=("LineTotal", "sum"), n_lines=("StockCode", "nunique"), n_units=("Quantity", "sum"),
)
d5["basket_value_gbp"] = {
    "mean": round(float(basket["basket_value"].mean()), 2),
    "median": round(float(basket["basket_value"].median()), 2),
    "p25": round(float(basket["basket_value"].quantile(0.25)), 2),
    "p75": round(float(basket["basket_value"].quantile(0.75)), 2),
    "p95": round(float(basket["basket_value"].quantile(0.95)), 2),
    "max": round(float(basket["basket_value"].max()), 2),
}
d5["basket_distinct_products"] = {
    "mean": round(float(basket["n_lines"].mean()), 2),
    "median": round(float(basket["n_lines"].median()), 2),
}
d5["n_invoices"] = int(len(basket))
out["d5"] = d5

# ---------- D6/D7: build the normalized 4-table model in SQLite and answer a business question ----------
con = sqlite3.connect(":memory:")

# A handful of customers (12 of 5,852) have more than one Country on record
# (e.g. moved, or a data-entry inconsistency across orders). Assigning by
# mode (most frequent Country) rather than first-seen is the more defensible
# call and matches how a real CUSTOMER dimension would be built.
cust_country_counts = known.groupby("Customer ID")["Country"].nunique()
out["d6_customers_with_ambiguous_country"] = int((cust_country_counts > 1).sum())
customer = known.groupby("Customer ID").agg(
    Country=("Country", lambda x: x.mode().iloc[0]),
).reset_index()
customer.columns = ["Customer_ID", "Country"]
customer.to_sql("CUSTOMER", con, index=False, if_exists="replace")

product = sales.groupby("StockCode").agg(
    Description=("Description", lambda x: x.dropna().mode().iloc[0] if len(x.dropna()) else "(blank)"),
).reset_index()
product.columns = ["StockCode", "Description"]
product.to_sql("PRODUCT", con, index=False, if_exists="replace")

invoice = known.groupby("Invoice").agg(
    InvoiceDate=("InvoiceDate", "min"), Customer_ID=("Customer ID", "first"),
).reset_index()
invoice.columns = ["Invoice", "InvoiceDate", "Customer_ID"]
invoice.to_sql("INVOICE", con, index=False, if_exists="replace")

# Price lives on INVOICE_LINE, not PRODUCT: this dataset's own prices move
# over time for the same StockCode, so a single PRODUCT.Price (e.g. a
# median) can distort JOIN-computed revenue by several hundred percent for
# products/customers whose actual sale price differs a lot from that median
# (verified: e.g. Denmark's true line revenue is ~4x lower than what a
# median-price JOIN would report). Real invoicing systems lock in price at
# time of sale for exactly this reason.
invoice_line = known[["Invoice", "StockCode", "Quantity", "Price"]].copy()
invoice_line.to_sql("INVOICE_LINE", con, index=False, if_exists="replace")

d7_sql = """
SELECT c.Country,
       COUNT(DISTINCT c.Customer_ID) AS n_customers,
       COUNT(DISTINCT i.Invoice)     AS n_orders,
       ROUND(SUM(il.Quantity * il.Price), 2) AS revenue_gbp
FROM CUSTOMER c
JOIN INVOICE i        ON i.Customer_ID = c.Customer_ID
JOIN INVOICE_LINE il  ON il.Invoice = i.Invoice
JOIN PRODUCT p        ON p.StockCode = il.StockCode
WHERE c.Country != 'United Kingdom'
GROUP BY c.Country
ORDER BY revenue_gbp DESC
LIMIT 10;
"""
d7_result = pd.read_sql_query(d7_sql, con)
out["d7_sql"] = d7_sql.strip()
out["d7_business_question"] = "นอกสหราชอาณาจักร ประเทศไหนสร้างรายได้ให้ธุรกิจมากที่สุด และมีลูกค้า/ออเดอร์กี่ราย"
out["d7_result_top10_non_uk"] = d7_result.to_dict(orient="records")
out["d6_table_row_counts"] = {
    "CUSTOMER": int(len(customer)), "PRODUCT": int(len(product)),
    "INVOICE": int(len(invoice)), "INVOICE_LINE": int(len(invoice_line)),
}

with open(HERE / "g1d-output.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, default=str, ensure_ascii=False)
print(json.dumps(out, indent=2, default=str, ensure_ascii=False))
