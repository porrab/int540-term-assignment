"""Feasibility check for the churn backtest described in ../solution-outline.md.

Splits the data by time instead of at random: features come only from the first
year, the label comes from whether the customer bought again in the second.
A random split would let the model see the same customer's future, which is
exactly the leakage the write-up warns about.

Run from this file's directory after unzipping the source data:
    unzip -o ../data/online_retail_II.csv.zip -d ../data
    python3 churn-backtest.py

Writes churn-backtest-output.json next to this script. This only establishes
that the split is workable (enough positive cases to train on); the model
itself is G2-D3 work.
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

# End of the observation window: one year before the data ends, so every
# customer in it has a full 12 months in which they could have come back.
CUTOFF = pd.Timestamp("2010-12-09")

df = pd.read_csv(CSV, dtype={"Customer ID": "Int64"}, parse_dates=["InvoiceDate"])
df["is_cancel"] = df["Invoice"].astype(str).str.startswith("C")
df["is_product"] = ~df["StockCode"].astype(str).str.upper().isin(NON_PRODUCT_CODES)
df["LineTotal"] = df["Quantity"] * df["Price"]

sales = df[
    (~df["is_cancel"]) & (df["Quantity"] > 0) & (df["Price"] > 0) & df["is_product"]
].dropna(subset=["Customer ID"])

observed = sales[sales["InvoiceDate"] <= CUTOFF]
future = sales[sales["InvoiceDate"] > CUTOFF]

cust = observed.groupby("Customer ID").agg(
    orders=("Invoice", "nunique"),
    revenue=("LineTotal", "sum"),
    last=("InvoiceDate", "max"),
)
cust["churn"] = ~cust.index.isin(set(future["Customer ID"].unique()))

heavy = (cust["orders"] >= 6) & cust["churn"]
out = {
    "cutoff": str(CUTOFF),
    "customers_in_observation_window": int(len(cust)),
    "churned": int(cust["churn"].sum()),
    "churn_rate_pct": round(float(cust["churn"].mean() * 100), 2),
    "churned_prior_revenue_gbp": round(float(cust.loc[cust["churn"], "revenue"].sum()), 2),
    "churned_heavy_buyers": int(heavy.sum()),
    "churned_heavy_buyers_revenue_gbp": round(float(cust.loc[heavy, "revenue"].sum()), 2),
    "customers_still_buying_next_year": int(future["Customer ID"].nunique()),
}

with open(HERE / "churn-backtest-output.json", "w") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(json.dumps(out, indent=2, ensure_ascii=False))
