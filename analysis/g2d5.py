"""G2-D5: association rules (market basket) - what to offer when sales calls a customer.

Run after unzipping the source data:
    python3 g2d5.py

Writes g2d5-output.json and ../data/association_rules.csv.

Baskets = invoices of known customers after the G1-D4 cleansing (g2b.py, step 6). Frequent
itemsets (FP-growth, same result as apriori) are found on products that appear in at least 1% of baskets; rules are kept when lift > 1 and
confidence >= 30%. A second pass uses only the baskets of customers the G2-D3 worklist flags,
to check whether the rules that matter for the call are the same as for everyone.
"""
import contextlib
import io
import json
import runpy
from pathlib import Path

import pandas as pd
from mlxtend.frequent_patterns import association_rules, fpgrowth

HERE = Path(__file__).resolve().parent
DATA = HERE / "../data"
MIN_SUPPORT = 0.01
MIN_CONF = 0.30

with contextlib.redirect_stdout(io.StringIO()):
    g2b = runpy.run_path(str(HERE / "g2b.py"))
known = g2b["known"]


def r4(x):
    return round(float(x), 4)


names = (known.groupby("StockCode")["Description"]
         .agg(lambda x: x.dropna().mode().iloc[0] if x.notna().any() else ""))


def rules_for(lines, min_support=MIN_SUPPORT):
    pairs = lines[["Invoice", "StockCode"]].drop_duplicates()
    share = pairs["StockCode"].value_counts() / pairs["Invoice"].nunique()
    # Filter products before pivoting: a full invoice x product table does not fit in memory.
    pairs = pairs[pairs["StockCode"].isin(share.index[share >= min_support])]
    basket = pd.crosstab(pairs["Invoice"], pairs["StockCode"]).astype(bool)
    # FP-growth finds exactly the itemsets apriori would; apriori's candidate table for 562
    # products x 36k baskets does not fit in 16 GB.
    freq = fpgrowth(basket, min_support=min_support, use_colnames=True, max_len=3)
    rules = association_rules(freq, metric="confidence", min_threshold=MIN_CONF)
    rules = rules[rules["lift"] > 1].sort_values(["lift", "confidence"], ascending=False)
    return basket, freq, rules


def readable(rules, n):
    rows = []
    for _, r in rules.head(n).iterrows():
        rows.append({"if_bought": [f"{c} {names.get(c, '')}".strip() for c in sorted(r["antecedents"])],
                     "then_also": [f"{c} {names.get(c, '')}".strip() for c in sorted(r["consequents"])],
                     "support": r4(r["support"]), "confidence": r4(r["confidence"]), "lift": r4(r["lift"])})
    return rows


out = {"min_support": MIN_SUPPORT, "min_confidence": MIN_CONF}
basket, freq, rules = rules_for(known)
out["all"] = {"baskets": int(known["Invoice"].nunique()), "products_total": int(known["StockCode"].nunique()),
              "products_kept_support_ge_1pct": int(basket.shape[1]), "frequent_itemsets": int(len(freq)),
              "rules": int(len(rules)), "top10_by_lift": readable(rules, 10)}
# Rules with high confidence AND reasonable support are the ones worth saying on a call.
practical = rules[rules["support"] >= 0.02].sort_values("confidence", ascending=False)
out["all"]["top10_by_confidence_support_ge_2pct"] = readable(practical, 10)

flagged = pd.read_csv(DATA / "worklist_scored.csv", index_col="customer_id")
flagged_ids = set(flagged.index[flagged["flagged"]])
fl_lines = known[known["Customer ID"].isin(flagged_ids)]
b2, f2, r2_ = rules_for(fl_lines, min_support=0.02)   # fewer baskets -> higher floor
out["flagged_customers"] = {"customers": int(len(flagged_ids)), "baskets": int(fl_lines["Invoice"].nunique()),
                            "products_kept_support_ge_2pct": int(b2.shape[1]), "rules": int(len(r2_)),
                            "top10_by_lift": readable(r2_, 10)}
both = set(map(lambda r: (frozenset(r[0]), frozenset(r[1])), zip(rules["antecedents"], rules["consequents"])))
fl_set = set(map(lambda r: (frozenset(r[0]), frozenset(r[1])), zip(r2_["antecedents"], r2_["consequents"])))
out["flagged_rules_also_in_all_pct"] = r4(len(fl_set & both) / max(len(fl_set), 1) * 100)

csv = rules.copy()
csv["antecedents"] = csv["antecedents"].map(lambda s: " + ".join(sorted(s)))
csv["consequents"] = csv["consequents"].map(lambda s: " + ".join(sorted(s)))
csv[["antecedents", "consequents", "support", "confidence", "lift"]].round(4).to_csv(
    DATA / "association_rules.csv", index=False)

(HERE / "g2d5-output.json").write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str))
print(json.dumps(out, indent=2, ensure_ascii=False, default=str))
