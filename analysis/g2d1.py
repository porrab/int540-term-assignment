"""G2-D1: star-schema tables for the BI dashboard (Power BI or Excel).

Run after g2d3.py (it joins that script's churn score onto the customer dimension):
    python3 g2d1.py

Writes to ../data/bi/ :
  fact_sales.csv.zip        one row per invoice line (sales after G1-D4 cleansing, step 5)
  fact_returns.csv.zip      one row per product return line (C-invoices, products only)
  dim_customer.csv          one row per customer: country, segment (G2-D2), RFM, churn score (G2-D3)
  dim_product.csv           StockCode -> most common description
  dim_date.csv              day -> week, month, quarter, year (the Time dimension G2-D1 asked for)
  customer_month_status.csv one row per month-end x customer status, for the top chart:
                            "% of customers silent >180 days" over time vs the BSC target
and g2d1-output.json with the row counts and the monthly series.

Sales lines without a Customer ID stay in fact_sales (customer_key = 0, "Unknown") so revenue
totals on the dashboard match the sales total; customer-level visuals filter them out.
"""
import contextlib
import io
import json
import runpy
import zipfile
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
DATA = HERE / "../data"
BI = DATA / "bi"
BI.mkdir(exist_ok=True)

with contextlib.redirect_stdout(io.StringIO()):
    g2b = runpy.run_path(str(HERE / "g2b.py"))
sales, cancels, feat = g2b["sales"], g2b["cancels"], g2b["feat"]
SILENT_DAYS, DATA_END = g2b["SILENT_DAYS"], g2b["DATA_END"]


def r2(x):
    return round(float(x), 2)


def write_zip(frame, name):
    buf = frame.to_csv(index=False)
    with zipfile.ZipFile(BI / f"{name}.zip", "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(name, buf)


out = {}

# ------------------------------------------------------------ fact tables
f = sales.copy()
f["customer_key"] = f["Customer ID"].fillna(0).astype(int)
f["date_key"] = f["InvoiceDate"].dt.strftime("%Y%m%d").astype(int)
fact = f[["Invoice", "date_key", "InvoiceDate", "customer_key", "StockCode", "Country",
          "Quantity", "Price", "LineTotal"]].rename(columns={
    "Invoice": "invoice", "InvoiceDate": "invoice_datetime", "StockCode": "product_key",
    "Country": "country", "Quantity": "quantity", "Price": "unit_price_gbp", "LineTotal": "line_total_gbp"})
write_zip(fact, "fact_sales.csv")
out["fact_sales"] = {"rows": int(len(fact)), "revenue_gbp": r2(fact["line_total_gbp"].sum()),
                     "rows_unknown_customer": int((fact["customer_key"] == 0).sum())}

r = cancels[cancels["is_product"]].copy()
r["customer_key"] = r["Customer ID"].fillna(0).astype(int)
r["date_key"] = r["InvoiceDate"].dt.strftime("%Y%m%d").astype(int)
ret = r[["Invoice", "date_key", "customer_key", "StockCode", "Country", "Quantity", "Price",
         "LineTotal"]].rename(columns={
    "Invoice": "invoice", "StockCode": "product_key", "Country": "country", "Quantity": "quantity",
    "Price": "unit_price_gbp", "LineTotal": "line_total_gbp"})
write_zip(ret, "fact_returns.csv")
out["fact_returns"] = {"rows": int(len(ret)), "value_gbp": r2(ret["line_total_gbp"].sum())}

# ------------------------------------------------------------ dimensions
seg = pd.read_csv(DATA / "customer_segments.csv", index_col="customer_id")["segment"]
score = pd.read_csv(DATA / "worklist_scored.csv", index_col="customer_id")
dc = feat[["country", "first_purchase", "last_purchase", "frequency", "monetary_gbp", "recency_days",
           "avg_days_between_orders", "R_score", "F_score", "M_score", "RFM_code", "is_silent_180"]].copy()
dc["segment"] = seg.reindex(dc.index).str.split(" \\(").str[0]
dc["p_silent_180"] = score["p_silent_180"].reindex(dc.index)
dc["worklist_flag"] = score["flagged"].reindex(dc.index).fillna(False).astype(bool)
dc["worklist_rank"] = score["rank"].reindex(dc.index)
dc["risk_band"] = pd.cut(dc["p_silent_180"], [0, .3, .5, 1.0001], right=False,
                         labels=["Low", "Medium", "High"]).astype(object).fillna("Already silent")
dc["status"] = dc["is_silent_180"].map({True: "Silent >180d", False: "Active"})
for c in ["first_purchase", "last_purchase"]:
    dc[c] = dc[c].dt.date
dc = dc.drop(columns="is_silent_180").reset_index().rename(columns={"Customer ID": "customer_key"})
unknown = pd.DataFrame([{"customer_key": 0, "country": "Unknown", "segment": "Unknown customer",
                         "risk_band": "Unknown", "status": "Unknown"}])
dc = pd.concat([unknown, dc], ignore_index=True)
dc.round(4).to_csv(BI / "dim_customer.csv", index=False)
out["dim_customer"] = {"rows": int(len(dc)), "risk_band_counts": dc["risk_band"].value_counts().to_dict()}

desc = (sales.dropna(subset=["Description"]).groupby("StockCode")["Description"]
        .agg(lambda x: x.mode().iloc[0]))
dp = pd.DataFrame({"product_key": desc.index, "description": desc.values})
dp.to_csv(BI / "dim_product.csv", index=False)
out["dim_product"] = {"rows": int(len(dp))}

days = pd.date_range(sales["InvoiceDate"].min().normalize(), DATA_END - pd.Timedelta(days=1), freq="D")
dd = pd.DataFrame({"date": days.date})
dd["date_key"] = days.strftime("%Y%m%d").astype(int)
dd["year"] = days.year
dd["quarter"] = "Q" + days.quarter.astype(str)
dd["year_quarter"] = days.year.astype(str) + "-" + dd["quarter"]
dd["month"] = days.month
dd["year_month"] = days.strftime("%Y-%m")
dd["month_name"] = days.strftime("%b")
dd["iso_week"] = days.isocalendar().week.to_numpy()
dd["weekday"] = days.strftime("%a")
dd = dd[["date_key", "date", "year", "quarter", "year_quarter", "month", "year_month",
         "month_name", "iso_week", "weekday"]]
dd.to_csv(BI / "dim_date.csv", index=False)
out["dim_date"] = {"rows": int(len(dd)), "from": str(dd["date"].min()), "to": str(dd["date"].max())}

# ------------------------------------------------------------ monthly status (top chart)
# At each month-end: of all customers seen so far, how many have had no order for 180+ days,
# and what did the silent ones spend in their last 12 active months? This is the BSC KPI
# "% silent >180 days" as a time series, so the dashboard can show "first N months -> decide
# -> next month the chart moves" (lecturer, 8 Oct).
known = g2b["known"]
rows = []
points = [(me, me + pd.Timedelta(days=1), me.strftime("%Y-%m"))
          for me in pd.date_range("2010-06-30", DATA_END - pd.Timedelta(days=1), freq="ME")]
points.append((DATA_END - pd.Timedelta(days=1), DATA_END, "2011-12 (to 9 Dec)"))
for me, asof, label in points:
    k = known[known["InvoiceDate"] < asof]
    g = k.groupby("Customer ID").agg(last=("InvoiceDate", "max"), orders=("Invoice", "nunique"))
    silent = (asof - g["last"]).dt.days > SILENT_DAYS
    m12 = k[k["InvoiceDate"] >= asof - pd.Timedelta(days=365)].groupby("Customer ID")["LineTotal"].sum()
    reg = g["orders"] >= 6
    rows.append({"month_end": me.date(), "year_month": label,
                 "customers_seen": int(len(g)), "silent_180": int(silent.sum()),
                 "silent_180_pct": r2(silent.mean() * 100),
                 "silent_regulars_6plus": int((silent & reg).sum()),
                 "active_customers": int((~silent).sum()),
                 "revenue_last_12m_gbp": r2(m12.sum())})
ms = pd.DataFrame(rows)
ms.to_csv(BI / "customer_month_status.csv", index=False)
out["customer_month_status"] = rows
out["note"] = ("The last point is the data end (9 Dec 2011), the same snapshot as G1-B and G2-B. "
               "Points before Dec 2010 have under 12 months of history, so % silent climbs partly "
               "because the data starts on 1 Dec 2009, not only because customers left.")

# The jump from end-Mar to end-May 2011: who are the newly silent? (the drill-down the
# dashboard story in ../g2-d1-dashboard.md section 2 relies on)
def silent_last(asof):
    last = known[known["InvoiceDate"] < asof].groupby("Customer ID")["InvoiceDate"].max()
    return last[(asof - last).dt.days > SILENT_DAYS]


before, after = silent_last(pd.Timestamp("2011-04-01")), silent_last(pd.Timestamp("2011-06-01"))
newly = after.index.difference(before.index)
first_buy = known.groupby("Customer ID")["InvoiceDate"].min()
out["jump_mar_to_may_2011"] = {
    "newly_silent": int(len(newly)),
    "by_last_purchase_month": {str(k): int(v) for k, v in
                               after.loc[newly].dt.to_period("M").value_counts().sort_index().items()},
    "first_purchase_in_oct_nov_2010": int(first_buy.loc[newly].between("2010-10-01", "2010-11-30 23:59").sum()),
}

# Preview of the top chart for the slides (the real one lives in Power BI).
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

FIG = HERE / "../figures"
FIG.mkdir(exist_ok=True)
fig, ax = plt.subplots(figsize=(9, 4))
x = list(range(len(ms)))
ax.plot(x, ms["silent_180_pct"], "o-", color="#1f77b4", label="% of customers silent >180 days")
ax.axvspan(-.5, 5.5, color="#eeeeee", label="under 12 months of history")
ax.set_xticks(x, [m[:7] for m in ms["year_month"]], rotation=60, fontsize=8)
ax.set_ylabel("%")
ax.annotate(f"{ms['silent_180_pct'].iloc[-1]:.2f}% = BSC baseline", (x[-1], ms["silent_180_pct"].iloc[-1]),
            textcoords="offset points", xytext=(-150, -25), arrowprops={"arrowstyle": "->"})
ax.set_title("Top chart: share of customers silent for 180+ days, month by month")
ax.legend(loc="upper left", fontsize=8)
fig.tight_layout()
fig.savefig(FIG / "g2d1-top-chart-preview.png", dpi=150)
plt.close(fig)

(HERE / "g2d1-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
