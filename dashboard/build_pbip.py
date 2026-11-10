#!/usr/bin/env python
"""Generate the G2-D1 Power BI project (PBIP: TMDL + PBIR) as text.

Power BI Desktop opens the result, refreshes it from data/bi/ and saves it as .pbix.
Inputs: data/bi/powerbi-queries.pq (each table's Power Query, used unchanged) and the
relationships, measures and pages in g2-d1-dashboard.md sections 5.3, 5.4 and 5.6.

Usage: python build_pbip.py [folder holding a blank PBIP's StaticResources]
The theme folder is only needed the first time, when pbip/ does not exist yet.
"""
import json
import re
import shutil
import sys
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
BI = HERE.parent / "data" / "bi"
OUT = HERE / "pbip"
NAME = "int540-g2-d1"
SM = OUT / f"{NAME}.SemanticModel"
RP = OUT / f"{NAME}.Report"
THEME = "Fluent2-CY26SU09"
NS = uuid.UUID("7a2f6d10-4f3a-4b57-9c55-2d1e0a9b6c11")

NAVY, TEAL, GREY, RED, INK = "#1F4E79", "#2A9D8F", "#A6A6A6", "#C00000", "#404040"
LIGHT_GREY, MID_GREY, LIGHT_ORANGE, ORANGE = "#D0D0D0", "#8C8C8C", "#F4B183", "#E66C37"
GBP = r"\£#,0.00;-\£#,0.00"
PCT = "0.00%"


def tag(*parts):
    return str(uuid.uuid5(NS, "/".join(parts)))


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def write_json(path, obj):
    write(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")


# ---------------------------------------------------------------- semantic model

def read_queries():
    text = (BI / "powerbi-queries.pq").read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"// ===== (\w+) =====\n(.*?)(?=\n// =====|\Z)", text, re.S):
        out[m.group(1)] = m.group(2).strip()
    return out


M_TO_TMDL = {"type text": "string", "Int64.Type": "int64", "type number": "double",
             "type date": "dateTime", "type datetime": "dateTime", "type logical": "boolean"}

# Sections 5.3 and 5.4, kept word for word. Helpers below are additions, listed apart.
MEASURES = {
    "fact_sales": [
        ("Revenue", "SUM(fact_sales[line_total_gbp])", GBP),
        ("Net sales", "[Revenue] + [Returns]", GBP),
        ("Net sales last year", "CALCULATE([Net sales], SAMEPERIODLASTYEAR(dim_date[date]))", GBP),
        ("Net sales YoY %", "DIVIDE([Net sales] - [Net sales last year], [Net sales last year])", PCT),
        ("Return rate %", "DIVIDE(-[Returns], [Revenue])", PCT),
        ("Customers", "CALCULATE(DISTINCTCOUNT(fact_sales[customer_key]), KEEPFILTERS(dim_customer[customer_key] <> 0))", "#,0"),
    ],
    "fact_returns": [
        ("Returns", "SUM(fact_returns[line_total_gbp])", GBP),
    ],
    "dim_customer": [
        ("Silent %", 'DIVIDE(CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[status] = "Silent >180d")),\n'
                     'CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[customer_key] <> 0)))', PCT),
        ("Flagged customers", 'CALCULATE(COUNTROWS(dim_customer), KEEPFILTERS(dim_customer[risk_band] = "High"))', "#,0"),
        ("Top 50 value 12m", "CALCULATE(SUM(dim_customer[value_12m_gbp]), KEEPFILTERS(dim_customer[worklist_top50] = TRUE()))", GBP),
    ],
    "fact_customer_month": [
        ("Silent % (as of month)", 'DIVIDE(CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[status] = "Silent >180d"),\n'
                                   "COUNTROWS(fact_customer_month))", PCT),
        ("Silent since 2 points ago", 'CALCULATE(COUNTROWS(fact_customer_month), fact_customer_month[status] = "Silent >180d",\n'
                                      "fact_customer_month[active_2_points_ago] = TRUE())", "#,0"),
        ("Silent value as of month", 'CALCULATE(SUM(fact_customer_month[spend_last_12m_gbp]), fact_customer_month[status] = "Silent >180d")', GBP),
    ],
    "kpi_active_to_silent": [
        ("KPI baseline %", 'CALCULATE(MAX(kpi_active_to_silent[pct]), kpi_active_to_silent[kind] = "G2-D3 test (baseline)")', r"0.00\%"),
    ],
}

# Not in section 5.4. They only draw the pages: no 5.5 figure depends on them.
HELPERS = {
    "dim_customer": [
        ("Customer share %", "DIVIDE([Customers], CALCULATE([Customers], ALL(dim_customer[segment])))", PCT),
        ("Revenue share %", "DIVIDE([Revenue], CALCULATE([Revenue], ALL(dim_customer[segment])))", PCT),
        ("Selected customer", 'FORMAT(SELECTEDVALUE(dim_customer[customer_key]), "0")', None),
        ("Rhythm note", 'VAR f = SELECTEDVALUE(dim_customer[frequency])\nVAR a = SELECTEDVALUE(dim_customer[avg_days_between_orders])\n'
                        'RETURN IF(f = 1, "One purchase", IF(f > 1 && a = 0, f & " orders on one day, no pattern yet", ""))', None),
        ("Recency colour", 'VAR r = SELECTEDVALUE(dim_customer[recency_days])\nVAR a = SELECTEDVALUE(dim_customer[avg_days_between_orders])\n'
                           f'RETURN IF(a > 0 && r > 3 * a, "{RED}", "{INK}")', None),
        ("Customer share colour", f'IF(SELECTEDVALUE(dim_customer[segment]) = "Slipping regulars", "{LIGHT_ORANGE}", "{LIGHT_GREY}")', None),
        ("Revenue share colour", 'IF(SELECTEDVALUE(dim_customer[segment]) IN {"Loyal wholesale", "Slipping regulars"}, '
                                 f'"{ORANGE}", "{MID_GREY}")', None),
    ],
    "fact_customer_month": [
        ("Selected month", "SELECTEDVALUE(fact_customer_month[year_month])", None),
    ],
}

RELATIONSHIPS = [(f, "customer_key", "dim_customer") for f in ("fact_sales", "fact_returns", "fact_customer_month")] + \
                [(f, "product_key", "dim_product") for f in ("fact_sales", "fact_returns")] + \
                [(f, "date_key", "dim_date") for f in ("fact_sales", "fact_returns", "fact_customer_month")]

COLUMN_FORMATS = {
    "line_total_gbp": GBP, "unit_price_gbp": GBP, "monetary_gbp": GBP, "value_12m_gbp": GBP,
    "spend_last_12m_gbp": GBP, "revenue_last_12m_gbp": GBP,
    "first_purchase": "yyyy-mm-dd", "last_purchase": "yyyy-mm-dd", "month_end": "yyyy-mm-dd",
    "cutoff_date": "yyyy-mm-dd", "date": "yyyy-mm-dd", "invoice_datetime": "yyyy-mm-dd hh:nn",
    "avg_days_between_orders": "0.0", "customer_key": "0", "year": "0",
}


def qname(name):
    return name if re.fullmatch(r"\w+", name) else "'" + name.replace("'", "''") + "'"


def measure_tmdl(table, name, expr, fmt, folder=None):
    lines = []
    if "\n" in expr:
        lines.append(f"\tmeasure {qname(name)} = ```")
        lines += ["\t\t\t" + l for l in expr.split("\n")]
        lines.append("\t\t\t```")
    else:
        lines.append(f"\tmeasure {qname(name)} = {expr}")
    if fmt:
        lines.append(f"\t\tformatString: {fmt}")
    if folder:
        lines.append(f"\t\tdisplayFolder: {folder}")
    lines.append(f"\t\tlineageTag: {tag(table, 'm', name)}")
    lines.append("")
    return lines


def table_tmdl(table, block):
    types = re.findall(r'\{"(\w+)", (type \w+|Int64\.Type)\}', block)
    lines = [f"table {table}", f"\tlineageTag: {tag(table)}"]
    if table == "dim_date":
        lines.append("\tdataCategory: Time")
    lines.append("")
    for name, expr, fmt in MEASURES.get(table, []):
        lines += measure_tmdl(table, name, expr, fmt)
    for name, expr, fmt in HELPERS.get(table, []):
        lines += measure_tmdl(table, name, expr, fmt, "Page helpers (not in spec)")
    for col, mtype in types:
        lines.append(f"\tcolumn {col}")
        lines.append(f"\t\tdataType: {M_TO_TMDL[mtype]}")
        if col in COLUMN_FORMATS:
            lines.append(f"\t\tformatString: {COLUMN_FORMATS[col]}")
        if table == "dim_date" and col == "date":
            lines.append("\t\tisKey")
        if table == "dim_date" and col == "month_name":
            lines.append("\t\tsortByColumn: month")
        lines.append(f"\t\tlineageTag: {tag(table, 'c', col)}")
        lines.append("\t\tsummarizeBy: none")
        lines.append(f"\t\tsourceColumn: {col}")
        lines.append("")
        if mtype == "type date":
            lines += ["\t\tannotation UnderlyingDateTimeDataType = Date", ""]
    if table == "dim_date":
        lines += ["\thierarchy 'Year - Quarter - Month - Date'", f"\t\tlineageTag: {tag(table, 'h')}", ""]
        for lvl in ("year", "year_quarter", "year_month", "date"):
            lines += [f"\t\tlevel {lvl}", f"\t\t\tlineageTag: {tag(table, 'l', lvl)}", f"\t\t\tcolumn: {lvl}", ""]
    lines += [f"\tpartition {table} = m", "\t\tmode: import", "\t\tsource ="]
    lines += ["\t\t\t\t" + l for l in block.split("\n")]
    lines += ["", "\tannotation PBI_ResultType = Table", ""]
    return "\n".join(lines)


def build_model():
    queries = read_queries()
    assert len(queries) == 8, sorted(queries)
    defn = SM / "definition"
    shutil.rmtree(defn, ignore_errors=True)
    write_json(SM / "definition.pbism", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json",
        "version": "4.2", "settings": {}})
    write_json(SM / ".platform", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
        "metadata": {"type": "SemanticModel", "displayName": NAME},
        "config": {"version": "2.0", "logicalId": tag("sm")}})
    write(defn / "database.tmdl", "database\n\tcompatibilityLevel: 1606\n\n")
    order = json.dumps(["BiFolder"] + list(queries))
    model = ["model Model", "\tculture: en-US", "\tdefaultPowerBIDataSourceVersion: powerBI_V3",
             "\tsourceQueryCulture: en-US", "\tvalueFilterBehavior: independent", "\tdataAccessOptions",
             "\t\tlegacyRedirects", "\t\treturnErrorValuesAsNull", "",
             "annotation __PBI_TimeIntelligenceEnabled = 0", "", f"annotation PBI_QueryOrder = {order}", "",
             'annotation PBI_ProTooling = ["DevMode"]', ""]
    model += [f"ref table {t}" for t in queries] + [""]
    write(defn / "model.tmdl", "\n".join(model))
    folder = str(BI) + "\\"
    write(defn / "expressions.tmdl",
          f'expression BiFolder = "{folder}" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true]\n'
          f"\tlineageTag: {tag('BiFolder')}\n\n"
          "\tannotation PBI_ResultType = Text\n\n")
    rel = []
    for f, c, d in RELATIONSHIPS:
        rel += [f"relationship {tag('rel', f, c)}", f"\tfromColumn: {f}.{c}", f"\ttoColumn: {d}.{c}", ""]
    write(defn / "relationships.tmdl", "\n".join(rel))
    for t, block in queries.items():
        write(defn / "tables" / f"{t}.tmdl", table_tmdl(t, block))


# ---------------------------------------------------------------- report helpers

def col(e, p):
    return {"Column": {"Expression": {"SourceRef": {"Entity": e}}, "Property": p}}


def mea(e, p):
    return {"Measure": {"Expression": {"SourceRef": {"Entity": e}}, "Property": p}}


def agg(e, p, fn=0):
    return {"Aggregation": {"Expression": col(e, p), "Function": fn}}


def lit(v):
    return {"expr": {"Literal": {"Value": v}}}


def s(text):
    return lit("'" + text.replace("'", "''") + "'")


def fill(c):
    return {"solid": {"color": s(c)}}


def named(field, label):
    return {**field, "_label": label}


def proj(field, active=False):
    label = field.pop("_label", None) if isinstance(field, dict) else None
    if "Column" in field:
        e, p = field["Column"]["Expression"]["SourceRef"]["Entity"], field["Column"]["Property"]
        ref = f"{e}.{p}"
    elif "Measure" in field:
        e, p = field["Measure"]["Expression"]["SourceRef"]["Entity"], field["Measure"]["Property"]
        ref = f"{e}.{p}"
    else:
        c = field["Aggregation"]["Expression"]["Column"]
        p = c["Property"]
        ref = f"Sum({c['Expression']['SourceRef']['Entity']}.{p})"
    out = {"field": field, "queryRef": ref, "nativeQueryRef": p}
    if label:
        out["displayName"] = label
    if active:
        out["active"] = True
    return out


def lit_value(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return f"{v}L"
    return "'" + v.replace("'", "''") + "'"


def cond(field, values, negate=False):
    """Categorical filter body on field for the given values."""
    e, p = field["Column"]["Expression"]["SourceRef"]["Entity"], field["Column"]["Property"]
    src = "f0"
    expr = {"In": {"Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": src}}, "Property": p}}],
                   "Values": [[{"Literal": {"Value": lit_value(v)}}] for v in values]}}
    if negate:
        expr = {"Not": {"Expression": expr}}
    return {"Version": 2, "From": [{"Name": src, "Entity": e, "Type": 0}], "Where": [{"Condition": expr}]}


def flt(name, field, values=None, negate=False, how=None):
    out = {"name": name, "field": field, "type": "Categorical"}
    if values is not None:
        out["filter"] = cond(field, values, negate)
    if how:
        out["howCreated"] = how
    return out


NOT_UNKNOWN = lambda n="no_unknown": flt(n, col("dim_customer", "customer_key"), [0], negate=True)
MAY = lambda n="may_2011": flt(n, col("fact_customer_month", "year_month"), ["2011-05"])
NOV = lambda n="nov_2011": flt(n, col("dim_date", "year_month"), ["2011-11"])

TITLE = lambda text, size=11: {"title": [{"properties": {
    "show": lit("true"), "text": s(text), "fontSize": lit(f"{size}D"), "fontColor": fill(INK), "bold": lit("true")}}]}


class Page:
    def __init__(self, name, title, binding=None, filters=None):
        self.name, self.title, self.binding, self.filters = name, title, binding, filters or []
        self.visuals = []
        self.hidden = False

    def add(self, vtype, x, y, w, h, roles=None, sort=None, objects=None, title=None, filters=None,
            containers=None, title_size=11):
        i = len(self.visuals)
        visual = {"visualType": vtype}
        if roles:
            visual["query"] = {"queryState": {r: {"projections": [proj(f, active=(r == "Category" and n == 0))
                                                                 for n, f in enumerate(fs)]}
                                              for r, fs in roles.items()}}
            if sort:
                visual["query"]["sortDefinition"] = {
                    "sort": [{"field": f, "direction": d} for f, d in sort], "isDefaultSort": True}
        if objects:
            visual["objects"] = objects
        vco = {"subTitle": [{"properties": {"show": lit("false")}}]} if vtype not in ("textbox", "slicer", "actionButton") else {}
        if title:
            vco.update(TITLE(title, title_size))
        elif vtype not in ("textbox", "slicer", "actionButton"):
            vco["title"] = [{"properties": {"show": lit("false")}}]
        if containers:
            vco.update(containers)
        if vco:
            visual["visualContainerObjects"] = vco
        visual["drillFilterOtherVisuals"] = True
        body = {
            "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.7.0/schema.json",
            "name": f"{self.name}_v{i:02d}",
            "position": {"x": x, "y": y, "z": i * 1000, "height": h, "width": w, "tabOrder": i * 1000},
            "visual": visual}
        if filters:
            body["filterConfig"] = {"filters": filters}
        self.visuals.append(body)

    def text(self, x, y, w, h, text, size=10, bold=False, color=INK):
        style = {"fontSize": f"{size}pt", "color": color}
        if bold:
            style["fontWeight"] = "bold"
        paras = [{"textRuns": [{"value": t, "textStyle": style}]} for t in text.split("\n")]
        self.add("textbox", x, y, w, h, objects={"general": [{"properties": {"paragraphs": paras}}]})

    def card(self, x, y, w, h, field, title, filters=None, size=20, precision=None):
        props = {"fontSize": lit(f"{size}D"), "labelDisplayUnits": lit("1D")}
        if precision is not None:
            props["labelPrecision"] = lit(f"{precision}L")
        objects = {"labels": [{"properties": props}],
                   "categoryLabels": [{"properties": {"show": lit("false")}}]}
        self.add("card", x, y, w, h, roles={"Values": [field]}, objects=objects, title=title,
                 filters=filters, title_size=10)

    def slicer(self, x, y, w, h, field, title):
        self.add("slicer", x, y, w, h, roles={"Values": [field]},
                 objects={"data": [{"properties": {"mode": s("Dropdown")}}],
                          "header": [{"properties": {"show": lit("true"), "text": s(title), "fontSize": lit("9D")}}]})

    def back(self, x, y):
        self.add("actionButton", x, y, 80, 32,
                 objects={"icon": [{"properties": {"shapeType": s("back")}, "selector": {"id": "default"}}]},
                 containers={"visualLink": [{"properties": {"show": lit("true"), "type": s("Back")}}]})

    def save(self, root):
        d = root / self.name
        page = {
            "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json",
            "name": self.name, "displayName": self.title, "displayOption": "FitToPage",
            "height": 720, "width": 1280}
        if self.filters:
            page["filterConfig"] = {"filters": self.filters}
        if self.binding:
            page["pageBinding"] = self.binding
        if self.hidden:
            page["visibility"] = "HiddenInViewMode"
        write_json(d / "page.json", page)
        for v in self.visuals:
            write_json(d / "visuals" / v["name"] / "visual.json", v)


def drill_binding(name, params):
    return {"name": name, "type": "Drillthrough", "parameters": [
        {"name": f"{name}_{i}", "boundFilter": fname, "fieldExpr": field}
        for i, (fname, field) in enumerate(params)]}


def series_colour(pairs):
    return [{"properties": {"fill": fill(c)}, "selector": {"metadata": ref}} for ref, c in pairs]


# ---------------------------------------------------------------- pages (section 5.6)

def top_n(name, field, measure, n, exclude=None):
    """TopN filter: keep the n values of field with the highest measure (optionally leaving some values out)."""
    e, prop = field["Column"]["Expression"]["SourceRef"]["Entity"], field["Column"]["Property"]
    me, mp = measure["Measure"]["Expression"]["SourceRef"]["Entity"], measure["Measure"]["Property"]
    sub = {"Version": 2, "From": [{"Name": "d", "Entity": e, "Type": 0}, {"Name": "m", "Entity": me, "Type": 0}],
           "Select": [{"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": prop}, "Name": "field"}],
           "OrderBy": [{"Direction": 2, "Expression": {"Measure": {"Expression": {"SourceRef": {"Source": "m"}}, "Property": mp}}}],
           "Top": n}
    if exclude:
        sub["Where"] = [{"Condition": {"Not": {"Expression": {"In": {
            "Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": prop}}],
            "Values": [[{"Literal": {"Value": lit_value(v)}}] for v in exclude]}}}}}]
    body = {"Version": 2,
            "From": [{"Name": "subquery", "Expression": {"Subquery": {"Query": sub}}, "Type": 2},
                     {"Name": "d", "Entity": e, "Type": 0}],
            "Where": [{"Condition": {"In": {
                "Expressions": [{"Column": {"Expression": {"SourceRef": {"Source": "d"}}, "Property": prop}}],
                "Table": {"SourceRef": {"Source": "subquery"}}}}}]}
    return {"name": name, "field": field, "type": "TopN", "filter": body}


def colour_rule(colour_measure):
    """Colour every bar from a measure that returns a hex colour (the selector Power BI itself saves)."""
    return {"properties": {"fill": {"solid": {"color": {"expr": colour_measure}}}},
            "selector": {"data": [{"dataViewWildcard": {"matchingOption": 1}}]}}


def overview():
    p = Page("overview", "1 Overview")
    # Answer first (2026-11-06 review: "pretty, but nothing stands out"). Fixed text: every figure is on the
    # Checks page or was checked in DAX (21.07% Dec 2010, 46.78% Aug 2011, 19.0% / 71.6% segment shares).
    p.text(10, 2, 1260, 30, "4 in 10 customers have gone silent: 40.64% at 9 Dec 2011, nearly double the 21.07% of Dec 2010", 15, True, NAVY)
    p.text(10, 32, 1260, 22, "Loyal wholesale are 19.0% of customers but 71.6% of revenue. Losing them would cost the most.", 11, True, ORANGE)

    p.card(10, 58, 380, 82, mea("dim_customer", "Silent %"), "Silent over 180 days, 9 Dec 2011", size=18)
    p.card(395, 58, 280, 82, mea("dim_customer", "Flagged customers"), "High-risk customers", size=18)
    p.card(680, 58, 300, 82, mea("dim_customer", "Top 50 value 12m"), "Last 12 months' spend, top 50 to call", size=18)
    p.card(985, 58, 285, 82, mea("fact_sales", "Revenue"), "Total revenue, Dec 2009 to 9 Dec 2011", size=18)
    p.text(250, 108, 140, 24, "peak 46.78% (Aug 2011)", 8, True, ORANGE)

    for i, (f, t) in enumerate([(col("dim_customer", "segment"), "Segment"), (col("dim_customer", "risk_band"), "Risk band"),
                                (col("dim_customer", "country"), "Country"), (col("dim_date", "year"), "Year")]):
        p.slicer(10 + i * 205, 142, 200, 50, f, t)
    p.text(835, 156, 435, 24, "Right-click a month, segment or country to see the detail.", 8)

    ym = col("fact_customer_month", "year_month")
    p.add("lineChart", 10, 196, 800, 270,
          roles={"Category": [ym], "Y": [mea("fact_customer_month", "Silent % (as of month)")]},
          sort=[(ym, "Ascending")],
          title="Customers silent over 180 days, at each month-end (dashed line: 40.64% at 9 Dec 2011)",
          objects={
              "lineStyles": [{"properties": {"showMarker": lit("true")}}],
              "dataPoint": [{"properties": {"fill": fill(NAVY)}}],
              "labels": [{"properties": {"show": lit("true"), "labelPrecision": lit("2L"), "fontSize": lit("7D"),
                                         "labelPosition": s("Above"), "enableBackground": lit("true"),
                                         "backgroundColor": fill("#FFFFFF"), "backgroundTransparency": lit("0D")}}],
              "valueAxis": [{"properties": {"start": lit("0D"), "end": lit("0.6D"), "showAxisTitle": lit("false")}}],
              "categoryAxis": [{"properties": {"showAxisTitle": lit("false"), "fontSize": lit("8D")}}],
              "y1AxisReferenceLine": [{"properties": {
                  "show": lit("true"), "displayName": s("Baseline 40.64%"), "value": lit("0.4064D"),
                  "lineColor": fill(RED), "style": s("dashed"), "transparency": lit("55D")},
                  "selector": {"id": "0"}}]})
    p.text(470, 228, 335, 20, "May–Sep 2011: stuck at 45–47%, then down to 40.64%", 9, True, ORANGE)

    seg = col("dim_customer", "segment")
    cs, rs = mea("dim_customer", "Customer share %"), mea("dim_customer", "Revenue share %")
    # Two single-measure charts: Power BI offers colour-by-measure (fx) only when a bar chart has one measure.
    for x, value, colour, title in [(815, cs, "Customer share colour", "Share of customers, by segment"),
                                    (1045, rs, "Revenue share colour", "Share of revenue, by segment")]:
        roles = {"Category": [seg], "Y": [dict(value)]}
        if value is cs:
            roles["Tooltips"] = [dict(rs)]
        p.add("clusteredBarChart", x, 196, 225, 270,
              roles=roles, sort=[(dict(rs), "Descending")], title=title,
              filters=[NOT_UNKNOWN()],
              objects={"dataPoint": [colour_rule(mea("dim_customer", colour))],
                       "labels": [{"properties": {"show": lit("true"), "labelPrecision": lit("1L"), "fontSize": lit("9D")}}],
                       "valueAxis": [{"properties": {"show": lit("false"), "showAxisTitle": lit("false")}}],
                       "categoryAxis": [{"properties": {"showAxisTitle": lit("false"), "fontSize": lit("8D")}}]})

    kc = col("kpi_active_to_silent", "cutoff_date")
    p.add("lineChart", 10, 470, 300, 228,
          roles={"Category": [kc], "Y": [agg("kpi_active_to_silent", "pct")]},
          sort=[(kc, "Ascending")],
          title="New KPI: active customers who went silent within 180 days, by start month (Jul 2010–Jun 2011)", title_size=9,
          filters=[flt("kpi_month_end", col("kpi_active_to_silent", "kind"), ["month_end"])],
          objects={"lineStyles": [{"properties": {"showMarker": lit("true")}}],
                   "dataPoint": [{"properties": {"fill": fill(TEAL)}}],
                   "labels": [{"properties": {"show": lit("true"), "labelPrecision": lit("1L"), "fontSize": lit("7D")}}],
                   "valueAxis": [{"properties": {"start": lit("0D"), "showAxisTitle": lit("false")}}],
                   "categoryAxis": [{"properties": {"show": lit("false"), "showAxisTitle": lit("false"), "axisType": s("Scalar")}}]})
    p.card(315, 470, 145, 96, mea("kpi_active_to_silent", "KPI baseline %"), "New KPI baseline", size=18)
    p.text(315, 570, 145, 128, "Of the customers active in Jun 2011, the share who went silent within 180 days. "
                              "Not the same measure as the 40.64% above.", 8)

    rev = mea("fact_sales", "Revenue")
    p.add("clusteredBarChart", 465, 470, 200, 228,
          roles={"Category": [col("dim_customer", "country")], "Y": [rev]}, sort=[(rev, "Descending")],
          title="Top 5 customer countries by revenue", title_size=9,
          filters=[NOT_UNKNOWN(), top_n("top5_country", col("dim_customer", "country"), rev, 5, exclude=["Unknown"])],
          objects={"dataPoint": [{"properties": {"fill": fill(MID_GREY)}}],
                   "labels": [{"properties": {"show": lit("true"), "labelDisplayUnits": lit("1000000D"), "labelPrecision": lit("1L"), "fontSize": lit("8D")}}],
                   "valueAxis": [{"properties": {"show": lit("false"), "showAxisTitle": lit("false")}}],
                   "categoryAxis": [{"properties": {"showAxisTitle": lit("false"), "fontSize": lit("7D"), "maxMarginFactor": lit("50L")}}]})
    dy = col("dim_date", "year_month")
    p.add("lineChart", 670, 470, 600, 228,
          roles={"Category": [dy], "Y": [mea("fact_sales", "Net sales"), mea("fact_sales", "Net sales last year")],
                 "Tooltips": [mea("fact_sales", "Net sales YoY %")]},
          sort=[(dy, "Ascending")],
          title="Net sales vs the same month last year (Dec 2011 is 1–9 Dec only)", title_size=9,
          objects={"dataPoint": series_colour([("fact_sales.Net sales", NAVY), ("fact_sales.Net sales last year", GREY)]),
                   "legend": [{"properties": {"show": lit("true"), "position": s("Top")}}],
                   "valueAxis": [{"properties": {"showAxisTitle": lit("false"), "labelDisplayUnits": lit("1000000D"), "labelPrecision": lit("0L")}}],
                   "categoryAxis": [{"properties": {"showAxisTitle": lit("false"), "fontSize": lit("7D")}}]})
    p.text(10, 697, 1260, 23, "Before Dec 2010 there is less than 12 months of history, so part of the early rise comes from the data starting. "
                              "Segments and risk bands are as at 9 Dec 2011.", 8)
    return p


def worklist():
    seg, ctry = col("dim_customer", "segment"), col("dim_customer", "country")
    filters = [flt("drill_segment", seg, how="Drillthrough"), flt("drill_country", ctry, how="Drillthrough"),
               flt("top50", col("dim_customer", "worklist_top50"), [True])]
    p = Page("worklist", "2 Worklist", drill_binding("worklist_drill", [("drill_segment", seg), ("drill_country", ctry)]), filters)
    p.back(10, 8)
    p.text(96, 6, 900, 34, "Who to call first this week: the top 50 high-risk customers by 12-month spend", 15, True, NAVY)
    p.card(1000, 6, 270, 90, mea("dim_customer", "Top 50 value 12m"), "12-month spend on this list", size=18)
    p.slicer(96, 42, 204, 54, seg, "Segment")
    p.slicer(308, 42, 204, 54, ctry, "Country")
    rank = col("dim_customer", "worklist_rank")
    columns = [named(rank, "Rank"), named(col("dim_customer", "customer_key"), "Customer"), named(seg, "Segment"),
               named(ctry, "Country"), named(col("dim_customer", "risk_band"), "Risk"),
               named(col("dim_customer", "value_12m_gbp"), "12-month spend"),
               named(col("dim_customer", "recency_days"), "Days since last order"),
               named(col("dim_customer", "avg_days_between_orders"), "Usual gap (days)"),
               named(mea("dim_customer", "Rhythm note"), "Note")]
    p.add("tableEx", 10, 100, 1260, 590, roles={"Values": columns}, sort=[(rank, "Ascending")],
          objects={"columnHeaders": [{"properties": {"bold": lit("true"), "fontColor": fill("#FFFFFF"), "backColor": fill(NAVY)}}],
                   "values": [{"properties": {"fontColor": {"solid": {"color": {"expr": mea("dim_customer", "Recency colour")}}}},
                               "selector": {"data": [{"dataViewWildcard": {"matchingOption": 1}}],
                                            "metadata": "dim_customer.recency_days"}}],
                   "total": [{"properties": {"totals": lit("false")}}]})
    p.text(10, 692, 1260, 26, "Risk is a level, not a percentage: the model's scores run higher than the real rate. Days turn red past 3× the customer's usual gap. Right-click a customer to see their orders.", 8)
    return p


def month_drill():
    ym = col("fact_customer_month", "year_month")
    p = Page("monthdrill", "Month drill",
             drill_binding("month_drill", [("drill_month", ym)]),
             [flt("drill_month", ym, ["2011-05"], how="Drillthrough")])
    p.back(10, 8)
    p.text(96, 6, 1170, 34, "Who went silent at this month-end, and when did they last buy?", 15, True, NAVY)
    p.card(10, 48, 300, 92, mea("fact_customer_month", "Selected month"), "Month-end", size=20)
    p.card(320, 48, 300, 92, mea("fact_customer_month", "Silent % (as of month)"), "Silent at this month-end", size=20)
    p.card(630, 48, 310, 92, mea("fact_customer_month", "Silent since 2 points ago"), "Newly silent (active 2 month-ends ago)", size=20)
    p.card(950, 48, 320, 92, mea("fact_customer_month", "Silent value as of month"), "Last 12 months' spend of silent customers", size=20)
    lo = col("fact_customer_month", "last_order_month")
    n = mea("fact_customer_month", "Silent since 2 points ago")
    p.add("clusteredColumnChart", 10, 148, 700, 538, roles={"Category": [lo], "Y": [n]}, sort=[(lo, "Ascending")],
          title="Newly silent customers, by the month of their last order",
          objects={"dataPoint": [{"properties": {"fill": fill(NAVY)}}],
                   "labels": [{"properties": {"show": lit("true"), "labelDisplayUnits": lit("1D")}}],
                   "valueAxis": [{"properties": {"show": lit("false"), "showAxisTitle": lit("false")}}],
                   "categoryAxis": [{"properties": {"showAxisTitle": lit("false")}}]})
    seg = col("dim_customer", "segment")
    p.add("clusteredBarChart", 720, 148, 550, 538, roles={"Category": [seg], "Y": [n]}, sort=[(n, "Descending")],
          title="The same customers by segment (segments as at 9 Dec 2011)",
          objects={"dataPoint": [{"properties": {"fill": fill(TEAL)}}],
                   "labels": [{"properties": {"show": lit("true"), "labelDisplayUnits": lit("1D")}}],
                   "valueAxis": [{"properties": {"show": lit("false"), "showAxisTitle": lit("false")}}],
                   "categoryAxis": [{"properties": {"showAxisTitle": lit("false")}}]})
    return p


def customer_history():
    ck = col("dim_customer", "customer_key")
    p = Page("customerhistory", "Customer history",
             drill_binding("customer_drill", [("drill_customer", ck)]),
             [flt("drill_customer", ck, [18073], how="Drillthrough")])
    p.back(10, 8)
    p.text(96, 6, 1170, 34, "Every order line for this customer", 15, True, NAVY)
    p.card(10, 48, 240, 88, mea("dim_customer", "Selected customer"), "Customer", size=18)
    p.card(260, 48, 240, 88, mea("fact_sales", "Revenue"), "Revenue", size=18)
    p.card(510, 48, 240, 88, mea("fact_returns", "Returns"), "Returns", size=18)
    dt = col("fact_sales", "invoice_datetime")
    p.add("tableEx", 10, 142, 1260, 566,
          roles={"Values": [named(dt, "Date"), named(col("fact_sales", "invoice"), "Invoice"), named(col("fact_sales", "product_key"), "Product"),
                            named(col("dim_product", "description"), "Description"), named(col("fact_sales", "quantity"), "Qty"),
                            named(col("fact_sales", "unit_price_gbp"), "Unit price"), named(col("fact_sales", "line_total_gbp"), "Line total")]},
          sort=[(dt, "Descending")],
          objects={"columnHeaders": [{"properties": {"bold": lit("true"), "fontColor": fill("#FFFFFF"), "backColor": fill(NAVY)}}],
                   "total": [{"properties": {"totals": lit("false")}}]})
    return p


def checks():
    p = Page("checks", "Checks 5.5")
    p.hidden = True  # kept for checking, not shown when presenting
    p.text(10, 6, 1260, 30, "Hidden check page: every figure from g2-d1-dashboard.md section 5.5 (expected value in each title). Not for presenting.", 13, True, NAVY)
    rows = [
        (mea("fact_sales", "Revenue"), "Revenue | expected £19,655,052.81", None, None),
        (mea("fact_returns", "Returns"), "Returns | expected -£716,495.53", None, None),
        (mea("fact_sales", "Customers"), "Customers | expected 5,852", None, None),
        (mea("dim_customer", "Silent %"), "Silent % | expected 40.64%", None, None),
        (mea("dim_customer", "Flagged customers"), "Flagged customers | expected 966", None, None),
        (mea("dim_customer", "Top 50 value 12m"), "Top 50 value 12m | expected £116,303.26", None, None),
        (mea("kpi_active_to_silent", "KPI baseline %"), "KPI baseline % | expected 30.03", None, None),
        (mea("fact_customer_month", "Silent % (as of month)"), "Silent % (as of month), 2011-05 | expected 45.23%", [MAY()], None),
        (mea("fact_customer_month", "Silent since 2 points ago"), "Silent since 2 points ago, 2011-05 | expected 987", [MAY()], None),
        (mea("fact_sales", "Net sales"), "Net sales, 2011-11 | expected £1,427,124.54", [NOV()], None),
        (mea("fact_sales", "Net sales last year"), "Net sales last year, 2011-11 | expected £1,394,601.80", [NOV()], None),
    ]
    for i, (field, title, filters, _) in enumerate(rows):
        x = 10 + (i % 3) * 425
        y = 42 + (i // 3) * 112
        p.card(x, y, 415, 104, field, title, filters=filters, size=22)
    lo = col("fact_customer_month", "last_order_month")
    p.add("tableEx", 10, 494, 830, 216,
          roles={"Values": [lo, mea("fact_customer_month", "Silent since 2 points ago")]}, sort=[(lo, "Ascending")],
          title="By last_order_month, 2011-05 | expected 2010-10 = 396, 2010-11 = 563, 2010-12 = 28",
          filters=[MAY()])
    return p


def build_report(theme_from=None):
    defn = RP / "definition"
    shutil.rmtree(defn, ignore_errors=True)
    if theme_from:
        shutil.copytree(Path(theme_from), RP / "StaticResources", dirs_exist_ok=True)
    write_json(RP / "definition.pbir", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json",
        "version": "4.0", "datasetReference": {"byPath": {"path": f"../{NAME}.SemanticModel"}}})
    write_json(RP / ".platform", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json",
        "metadata": {"type": "Report", "displayName": NAME},
        "config": {"version": "2.0", "logicalId": tag("rp")}})
    write_json(defn / "version.json", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json",
        "version": "2.0.0"})
    write_json(defn / "report.json", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.3.0/schema.json",
        "themeCollection": {"baseTheme": {"name": THEME, "reportVersionAtImport": {"visual": "2.13.0", "report": "3.4.0", "page": "2.3.1"},
                                          "type": "SharedResources"}},
        "objects": {"section": [{"properties": {"verticalAlignment": s("Top")}}]},
        "resourcePackages": [{"name": "SharedResources", "type": "SharedResources", "items": [
            {"name": THEME, "path": f"BaseThemes/{THEME}.json", "type": "BaseTheme"}]}],
        "settings": {"useStylableVisualContainerHeader": True, "exportDataMode": "AllowSummarized",
                     "defaultDrillFilterOtherVisuals": True, "allowChangeFilterTypes": True,
                     "useEnhancedTooltips": True, "useDefaultAggregateDisplayName": True}})
    pages = [overview(), worklist(), month_drill(), customer_history(), checks()]
    for p in pages:
        p.save(defn / "pages")
    write_json(defn / "pages" / "pages.json", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.1.0/schema.json",
        "pageOrder": [p.name for p in pages], "activePageName": pages[0].name})
    write_json(OUT / f"{NAME}.pbip", {
        "$schema": "https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json",
        "version": "1.0", "artifacts": [{"report": {"path": f"{NAME}.Report"}}],
        "settings": {"enableAutoRecovery": True}})
    write(OUT / ".gitignore", "**/.pbi/localSettings.json\n**/.pbi/cache.abf\n")


if __name__ == "__main__":
    build_model()
    build_report(sys.argv[1] if len(sys.argv) > 1 else None)
    print("written to", OUT)
