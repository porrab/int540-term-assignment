"""G2-D1: star-schema tables for the BI dashboard (Power BI or Excel).

Run after g2d3.py (it joins that script's churn score onto the customer dimension):
    python3 g2d1.py

Writes to ../data/bi/ :
  fact_sales.csv.zip        one row per invoice line (sales after G1-D4 cleansing, step 5)
  fact_returns.csv.zip      one row per product return line (C-invoices, products only)
  dim_customer.csv          one row per customer: country, segment (G2-D2), RFM, churn score (G2-D3)
  dim_product.csv           StockCode -> most common description
  dim_date.csv              day -> week, month, quarter, year (the Time dimension G2-D1 asked for)
  customer_month_status.csv one row per month-end, for the top chart:
                            "% of customers silent >180 days" over time vs the BSC target
  fact_customer_month.csv.zip
                            one row per customer x month-end: that customer's status AS OF that
                            month (days since last order, active/silent, newly silent), so a
                            drill-down from a month on the top chart lists the customers as they
                            were then, not as they are at the data end
  kpi_active_to_silent.csv  one row per cut-off: of the customers active then, how many went silent in
                            the next 180 days (the Customer KPI decided on 5 Nov)
  powerbi-queries.pq        Power Query for every table, with explicit types (see ../g2-d1-dashboard.md)
and g2d1-output.json with the row counts, the monthly series and the figures Power BI must reproduce.

Power BI compares relationship keys without regard to case or trailing spaces, so product keys are
upper-cased and trimmed here. "15056BL" and "15056bl" would otherwise break the fact -> dim_product link.

Sales lines without a Customer ID stay in fact_sales (customer_key = 0, "Unknown") so revenue
totals on the dashboard match the sales total; customer-level visuals filter them out.
"""
import contextlib
import io
import json
import runpy
import zipfile
from pathlib import Path

import numpy as np
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
    path = BI / f"{name}.zip"
    # A zip stamps the write time, so rewriting identical data would still change the file
    # (and add megabytes to git history). Only rewrite when the CSV inside differs.
    if path.exists():
        with zipfile.ZipFile(path) as z:
            if z.namelist() == [name] and z.read(name).decode() == buf:
                return
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.writestr(name, buf)


def product_key(col):
    return col.astype(str).str.strip().str.upper()


out = {}

# ------------------------------------------------------------ fact tables
f = sales.copy()
f["StockCode"] = product_key(f["StockCode"])
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
r["StockCode"] = product_key(r["StockCode"])
r["customer_key"] = r["Customer ID"].fillna(0).astype(int)
# Customers who only appear on a return have no row in dim_customer (5,852 customers with sales).
# They go to the Unknown row, so the relationship holds and the return total is unchanged.
no_sales = (r["customer_key"] != 0) & ~r["customer_key"].isin(feat.index.astype(int))
out["returns_without_a_sales_customer"] = {"rows": int(no_sales.sum()),
                                           "value_gbp": r2(r.loc[no_sales, "LineTotal"].sum()),
                                           "rows_without_customer_id": int((r["customer_key"] == 0).sum()),
                                           "value_without_customer_id_gbp": r2(r.loc[r["customer_key"] == 0, "LineTotal"].sum())}
r.loc[no_sales, "customer_key"] = 0
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
dc["worklist_top50"] = dc["worklist_rank"].le(50)  # the list size decided on 5 Nov
dc["value_12m_gbp"] = score["value_12m_gbp"].reindex(dc.index)
dc["risk_band"] = pd.cut(dc["p_silent_180"], [0, .3, .5, 1.0001], right=False,
                         labels=["Low", "Medium", "High"]).astype(object).fillna("Already silent")
dc["status"] = dc["is_silent_180"].map({True: "Silent >180d", False: "Active"})
for c in ["first_purchase", "last_purchase"]:
    dc[c] = dc[c].dt.date
dc = dc.drop(columns="is_silent_180").reset_index().rename(columns={"Customer ID": "customer_key"})
unknown = pd.DataFrame([{"customer_key": 0, "country": "Unknown", "segment": "Unknown customer",
                         "risk_band": "Unknown", "status": "Unknown", "worklist_flag": False,
                         "worklist_top50": False}])
dc = pd.concat([unknown, dc], ignore_index=True)
# Whole numbers stay whole in the CSV ("3", not "3.0"), so the Power Query Int64 types are safe.
for c in ["customer_key", "frequency", "recency_days", "R_score", "F_score", "M_score", "worklist_rank"]:
    dc[c] = pd.to_numeric(dc[c]).astype("Int64")
dc.round(4).to_csv(BI / "dim_customer.csv", index=False)
out["dim_customer"] = {"rows": int(len(dc)), "risk_band_counts": dc["risk_band"].value_counts().to_dict()}

named = f.dropna(subset=["Description"])
desc = named.groupby("StockCode")["Description"].agg(lambda x: x.mode().iloc[0].strip())
dp = pd.DataFrame({"product_key": desc.index, "description": desc.values, "has_sales": True})
# Products that appear only on a return still need a row for the relationship.
only_ret = r[~r["StockCode"].isin(dp["product_key"])]
extra = only_ret.groupby("StockCode")["Description"].agg(
    lambda x: x.dropna().iloc[0].strip() if x.notna().any() else "(returns only)")
dp = pd.concat([dp, pd.DataFrame({"product_key": extra.index, "description": extra.values, "has_sales": False})],
               ignore_index=True)
dp.to_csv(BI / "dim_product.csv", index=False)
out["dim_product"] = {"rows": int(len(dp)), "raw_stock_codes_in_sales": int(sales["StockCode"].nunique()),
                      "keys_merged_by_case_or_space": int(sales["StockCode"].nunique() - len(desc)),
                      "returns_only_products": int(len(extra)), "returns_only_rows": int(len(only_ret))}

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
rows, snaps = [], []
points = [(me, me + pd.Timedelta(days=1), me.strftime("%Y-%m"))
          for me in pd.date_range("2010-06-30", DATA_END - pd.Timedelta(days=1), freq="ME")]
points.append((DATA_END - pd.Timedelta(days=1), DATA_END, "2011-12 (to 9 Dec)"))
for me, asof, label in points:
    k = known[known["InvoiceDate"] < asof]
    g = k.groupby("Customer ID").agg(first=("InvoiceDate", "min"), last=("InvoiceDate", "max"),
                                     orders=("Invoice", "nunique"))
    silent = (asof - g["last"]).dt.days > SILENT_DAYS
    m12 = k[k["InvoiceDate"] >= asof - pd.Timedelta(days=365)].groupby("Customer ID")["LineTotal"].sum()
    reg = g["orders"] >= 6
    rows.append({"month_end": me.date(), "year_month": label,
                 "customers_seen": int(len(g)), "silent_180": int(silent.sum()),
                 "silent_180_pct": r2(silent.mean() * 100),
                 "silent_regulars_6plus": int((silent & reg).sum()),
                 "active_customers": int((~silent).sum()),
                 "revenue_last_12m_gbp": r2(m12.sum())})
    snaps.append(pd.DataFrame({
        "customer_key": g.index.astype(int), "year_month": label, "month_end": me.date(),
        "date_key": int(me.strftime("%Y%m%d")),
        "first_order_month": g["first"].dt.strftime("%Y-%m").to_numpy(),
        "last_order_month": g["last"].dt.strftime("%Y-%m").to_numpy(),
        "days_since_last_order": (asof - g["last"]).dt.days.to_numpy(),
        "orders_so_far": g["orders"].to_numpy(),
        "spend_last_12m_gbp": m12.reindex(g.index).fillna(0.0).round(2).to_numpy(),
        "status": np.where(silent, "Silent >180d", "Active"),
        "regular_6plus": reg.to_numpy()}))
ms = pd.DataFrame(rows)
fcm = pd.concat(snaps, ignore_index=True)
# Newly silent = silent at this point but not at the previous one (the drill behind section 2
# of ../g2-d1-dashboard.md: who tipped over between two month-ends).
prev = fcm.groupby("customer_key")["status"].shift()
fcm["newly_silent"] = (fcm["status"] == "Silent >180d") & (prev == "Active")
# Active two month-ends ago: the definition behind the 987 customers decided on 5 Nov. Summing
# newly_silent over April and May gives 1,023, because it also counts customers who came back.
fcm["active_2_points_ago"] = fcm.groupby("customer_key")["status"].shift(2) == "Active"
write_zip(fcm, "fact_customer_month.csv")
# The snapshot table must reproduce the top-chart series exactly.
check = fcm.groupby("year_month", sort=False).agg(seen=("customer_key", "size"),
                                                  silent=("status", lambda x: (x == "Silent >180d").sum()))
assert (check["seen"].to_numpy() == ms["customers_seen"].to_numpy()).all()
assert (check["silent"].to_numpy() == ms["silent_180"].to_numpy()).all()
out["fact_customer_month"] = {
    "rows": int(len(fcm)), "month_points": int(fcm["year_month"].nunique()),
    "newly_silent_by_month": {k: int(v) for k, v in
                              fcm[fcm["newly_silent"]].groupby("year_month", sort=False).size().items()}}
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

may = fcm[(fcm["year_month"] == "2011-05") & (fcm["status"] == "Silent >180d") & fcm["active_2_points_ago"]]
assert len(may) == out["jump_mar_to_may_2011"]["newly_silent"]
assert may["last_order_month"].value_counts().to_dict() == out["jump_mar_to_may_2011"]["by_last_purchase_month"]
assert may["first_order_month"].isin(["2010-10", "2010-11"]).sum() == out["jump_mar_to_may_2011"]["first_purchase_in_oct_nov_2010"]

# ------------------------------------------------------------ Customer KPI decided on 5 Nov
# Of the customers active at a cut-off (last order within 180 days), how many placed no order in
# the next 180 days? Same definition as the G2-D3 label, so the two reference rows must match it.
WINDOW = pd.Timedelta(days=SILENT_DAYS)


def active_to_silent(asof):
    last = known[known["InvoiceDate"] < asof].groupby("Customer ID")["InvoiceDate"].max()
    active = last[(asof - last).dt.days <= SILENT_DAYS].index
    future = known[(known["InvoiceDate"] >= asof) & (known["InvoiceDate"] < asof + WINDOW)]["Customer ID"].unique()
    return len(active), int((~active.isin(future)).sum())


cuts = [(me + pd.Timedelta(days=1), "month_end") for me in pd.date_range("2010-06-30", DATA_END, freq="ME")
        if me + pd.Timedelta(days=1) + WINDOW <= DATA_END]
cuts += [(pd.Timestamp("2010-12-09"), "G2-D3 train"), (pd.Timestamp("2011-06-09"), "G2-D3 test (baseline)")]
kpi = []
for asof, kind in sorted(cuts, key=lambda c: c[0]):
    n, gone = active_to_silent(asof)
    kpi.append({"cutoff_date": asof.date(), "date_key": int(asof.strftime("%Y%m%d")), "kind": kind,
                "active_customers": n, "became_silent": gone, "pct": r2(gone / n * 100),
                "history_under_12m": asof < pd.Timestamp("2010-12-01")})
kpi = pd.DataFrame(kpi)
ref = kpi.set_index("kind")
assert (ref.loc["G2-D3 train", "active_customers"], ref.loc["G2-D3 train", "became_silent"]) == (3477, 1673)
assert (ref.loc["G2-D3 test (baseline)", "active_customers"], ref.loc["G2-D3 test (baseline)", "became_silent"]) == (2634, 791)
kpi.to_csv(BI / "kpi_active_to_silent.csv", index=False)
out["kpi_active_to_silent"] = kpi.to_dict("records")

# ------------------------------------------------------------ the model must load cleanly in Power BI
for frame, label in [(fact, "fact_sales"), (ret, "fact_returns"), (fcm, "fact_customer_month")]:
    assert frame["customer_key"].isin(dc["customer_key"]).all(), label
    assert frame["date_key"].isin(dd["date_key"]).all() if "date_key" in frame else True, label
for frame, label in [(fact, "fact_sales"), (ret, "fact_returns")]:
    assert frame["product_key"].isin(dp["product_key"]).all(), label
assert not dp["product_key"].str.strip().str.upper().duplicated().any()
# Totals must equal the G2-B base.
assert r2(fact["line_total_gbp"].sum()) == 19655052.81 and r2(ret["line_total_gbp"].sum()) == -716495.53
assert not dc["customer_key"].duplicated().any() and not dd["date_key"].duplicated().any()
assert (dp["product_key"] == dp["product_key"].str.strip()).all()

net = (fact.assign(ym=fact["date_key"] // 100).groupby("ym")["line_total_gbp"].sum()
       + ret.assign(ym=ret["date_key"] // 100).groupby("ym")["line_total_gbp"].sum())
top50 = dc[dc["worklist_top50"]]
out["powerbi_checks"] = {
    "Revenue": r2(fact["line_total_gbp"].sum()),
    "Returns": r2(ret["line_total_gbp"].sum()),
    "Customers": int(fact.loc[fact["customer_key"] != 0, "customer_key"].nunique()),
    "Silent %": ms["silent_180_pct"].iloc[-1],
    "Flagged customers": int((dc["risk_band"] == "High").sum()),
    "Silent % (as of month), 2011-05": float(ms.set_index("year_month").loc["2011-05", "silent_180_pct"]),
    "Silent since 2 points ago, 2011-05": int(len(may)),
    "Top 50 customers": int(len(top50)),
    "Top 50 value 12m": r2(top50["value_12m_gbp"].sum()),
    "Net sales, 2011-11": r2(net[201111]),
    "Net sales last year, 2011-11": r2(net[201011]),
    "KPI baseline %": float(ref.loc["G2-D3 test (baseline)", "pct"]),
}

# ------------------------------------------------------------ Power Query with explicit types
# Auto-detect reads only the first rows, and a Thai Windows locale may read dates and decimals
# differently, so every column is typed by hand with the en-US culture.
T, I, N, D, DT, B = "type text", "Int64.Type", "type number", "type date", "type datetime", "type logical"
SCHEMA = {
    "fact_sales": ("fact_sales.csv", {"invoice": T, "date_key": I, "invoice_datetime": DT, "customer_key": I,
                                      "product_key": T, "country": T, "quantity": I, "unit_price_gbp": N,
                                      "line_total_gbp": N}),
    "fact_returns": ("fact_returns.csv", {"invoice": T, "date_key": I, "customer_key": I, "product_key": T,
                                          "country": T, "quantity": I, "unit_price_gbp": N, "line_total_gbp": N}),
    "fact_customer_month": ("fact_customer_month.csv", {
        "customer_key": I, "year_month": T, "month_end": D, "date_key": I, "first_order_month": T,
        "last_order_month": T, "days_since_last_order": I, "orders_so_far": I, "spend_last_12m_gbp": N,
        "status": T, "regular_6plus": B, "newly_silent": B, "active_2_points_ago": B}),
    "dim_customer": ("dim_customer.csv", {
        "customer_key": I, "country": T, "segment": T, "risk_band": T, "status": T, "first_purchase": D,
        "last_purchase": D, "frequency": I, "monetary_gbp": N, "recency_days": I, "avg_days_between_orders": N,
        "R_score": I, "F_score": I, "M_score": I, "RFM_code": T, "p_silent_180": N, "worklist_flag": B,
        "worklist_rank": I, "worklist_top50": B, "value_12m_gbp": N}),
    "dim_product": ("dim_product.csv", {"product_key": T, "description": T, "has_sales": B}),
    "dim_date": ("dim_date.csv", {"date_key": I, "date": D, "year": I, "quarter": T, "year_quarter": T, "month": I,
                                  "year_month": T, "month_name": T, "iso_week": I, "weekday": T}),
    "customer_month_status": ("customer_month_status.csv", {
        "month_end": D, "year_month": T, "customers_seen": I, "silent_180": I, "silent_180_pct": N,
        "silent_regulars_6plus": I, "active_customers": I, "revenue_last_12m_gbp": N}),
    "kpi_active_to_silent": ("kpi_active_to_silent.csv", {
        "cutoff_date": D, "date_key": I, "kind": T, "active_customers": I, "became_silent": I, "pct": N,
        "history_under_12m": B}),
}
frames = {"fact_sales": fact, "fact_returns": ret, "fact_customer_month": fcm, "dim_customer": dc, "dim_product": dp,
          "dim_date": dd, "customer_month_status": ms, "kpi_active_to_silent": kpi}
for name, (_, cols) in SCHEMA.items():
    assert set(cols) == set(frames[name].columns), (name, set(cols) ^ set(frames[name].columns))
pq = ["// Power Query for the G2-D1 dashboard, generated by analysis/g2d1.py. See ../../g2-d1-dashboard.md section 5.",
      "// Create a text parameter named BiFolder holding the folder path, with a backslash at the end.",
      "// Then make one blank query per block: name it as written and paste the block into Advanced Editor.", ""]
for name, (file, cols) in SCHEMA.items():
    typed = ", ".join('{"%s", %s}' % (c, t) for c, t in cols.items())
    pq += [f"// ===== {name} =====",
           "let",
           f'    Source = Csv.Document(File.Contents(BiFolder & "{file}"), [Delimiter = ",", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),',
           "    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),",
           f'    Typed = Table.TransformColumnTypes(Headers, {{{typed}}}, "en-US")',
           "in",
           "    Typed", ""]
(BI / "powerbi-queries.pq").write_text("\n".join(pq), encoding="utf-8")

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
