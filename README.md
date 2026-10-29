# INT 540 / DSI 121 — Term Assignment (Goal 1 + Goal 2)

Data Analytics for Business Decision · Term Assignment. Goal 1 (presented 1 Oct 2026):
company profile and strategy (G1-A), systems-thinking problem statement and customer
journey map (G1-B), balanced scorecard (G1-C), and data profiling, data decisions and
data model (G1-D). Goal 2 (due 25 Nov, presented 26 Nov 2026): system components (G2-A),
data treatment (G2-B), UX/UI (G2-C), the analyses (G2-D) and the interpretation back to
the scorecard (G2-E). Everything is built from the
**Online Retail II** dataset (UCI ML Repository #502). Every figure cited in the
write-ups is computed by a script in `analysis/` and can be reproduced.

**New to the team? Start with [`team-guide.md`](team-guide.md)** — a plain-language
walkthrough (in Thai) of what the assignment is, what the dataset looks like column by
column, the vocabulary the team uses, and the figures everyone should know by heart.

> ⚠️ **Since 8 Oct 2026 every script removes duplicate rows.** The team's figures are the
> new ones in [`dedup-recheck.md`](dedup-recheck.md). Goal 1 documents keep the figures that
> were submitted; those outputs are kept as `analysis/*-output-g1-submitted.json`.

## Contents

### Plan and brief

| File | What it is |
|---|---|
| [`team-guide.md`](team-guide.md) | Read-me-first orientation for teammates — no Python needed |
| [`plan.md`](plan.md) | Full term assignment plan — Goal 1 + Goal 2 task breakdown, deadlines, team schedule |
| [`goal2-progress.html`](goal2-progress.html) | Reading view of Goal 2 progress (the `.md` files stay the source) |
| [`brief/term-assignment-brief.md`](brief/term-assignment-brief.md) | Verbatim copy of the professor's brief (+ `.docx` original and the sample customer journey map image) |
| [`brief/lecturer-verbal-brief.md`](brief/lecturer-verbal-brief.md) | What the lecturer said in class that is not in the written brief — project types, data sources, presentation rules, and the 8 Oct notes on BI dashboards vs machine learning for Presentation 2 |

### Goal 1

| File | What it is |
|---|---|
| [`g1-a-company-profile.md`](g1-a-company-profile.md) | Company profile, Five Forces/TOWS/Value Chain strategy, retail vs wholesale segmentation |
| [`g1-b-problem-statement.md`](g1-b-problem-statement.md) | Systems thinking model, evidence-backed pain points, problem statement, customer journey map |
| [`g1-c-balanced-scorecard.md`](g1-c-balanced-scorecard.md) | Balanced scorecard — objectives, measures and targets |
| [`g1-d1-d3-data-profiling.md`](g1-d1-d3-data-profiling.md) | Data loading, profiling, data-quality issue inventory |
| [`g1-d4-d8-data-decisions.md`](g1-d4-d8-data-decisions.md) | Data-handling decisions, EDA, data model, SQL |
| [`solution-outline.md`](solution-outline.md) | Shape of the solution — as-is vs to-be, components, scorecard |
| [`presentation-guide.md`](presentation-guide.md) · [`presentation-script-team.md`](presentation-script-team.md) | Speaking scripts for the Goal 1 presentation |
| [`slides/G1-presentation.pptx`](slides/G1-presentation.pptx) | The Goal 1 deck as presented (`slides/G1-slides.pptx` = longer working deck) |

### Goal 2

| File | What it is |
|---|---|
| [`dedup-recheck.md`](dedup-recheck.md) | All figures recomputed after removing duplicate rows — old vs new |
| [`g2-a-system-components.md`](g2-a-system-components.md) | G2-A: decision improvement vs process redesign, as-is vs to-be, where each model plugs in, inputs/outputs/users |
| [`g2-b-data-treatment.md`](g2-b-data-treatment.md) | G2-B: cleansing log, RFM feature engineering, transformation, business impact of each treatment, data dictionary |
| [`g2-c-ux-ui.md`](g2-c-ux-ui.md) · [`mockup/g2-c-mockup.html`](mockup/g2-c-mockup.html) | G2-C: UX/UI for input, interaction and output — worklist, contact log, monthly overview (HTML mockup with real figures) |
| [`g2-d1-dashboard.md`](g2-d1-dashboard.md) | G2-D1: BI dashboard design, star schema, drill-down path and step-by-step Power BI build |
| [`g2-d2-clustering.md`](g2-d2-clustering.md) | G2-D2: k-means customer segments on RFM (k = 4) |
| [`g2-d3-classification.md`](g2-d3-classification.md) | G2-D3: which active customers go silent in the next 180 days — out-of-time test, model vs the "no order for X days" rule, the scored worklist |
| [`g2-d4-regression.md`](g2-d4-regression.md) | G2-D4: forecasting the next 180 days' spend — does not beat the simple baseline, so not proposed for the deck |
| [`g2-d5-association.md`](g2-d5-association.md) | G2-D5: market-basket rules used as conversation openers on the worklist |
| [`g2-e-interpretation.md`](g2-e-interpretation.md) | G2-E: results against the Goal 1 balanced scorecard, impact scenarios, limitations, next steps |
| [`data/customer_features.csv`](data/customer_features.csv) | One row per customer (5,852) — features from G2-B |
| [`data/customer_features_backtest.csv`](data/customer_features_backtest.csv) | Features at an earlier cut-off with a churn label (4,282 customers) |
| [`data/customer_segments.csv`](data/customer_segments.csv) | Segment of each customer from G2-D2 |
| [`data/worklist_scored.csv`](data/worklist_scored.csv) | Every active customer at the data end with churn score, flag and rank (G2-D3) |
| [`data/association_rules.csv`](data/association_rules.csv) | All 594 association rules (G2-D5) |
| [`data/bi/`](data/bi/) | Star-schema tables for Power BI (G2-D1); unzip the two `fact_*.csv.zip` files first |
| [`figures/`](figures/) | Charts for the slides, written by the G2 scripts |

### Scripts and data

| File | What it is |
|---|---|
| [`analysis/profile.py`](analysis/profile.py) | G1-A and G1-D1–D3 figures |
| [`analysis/g1b.py`](analysis/g1b.py) | Retention, returns and journey-stage figures in G1-B |
| [`analysis/g1d.py`](analysis/g1d.py) | G1-D4–D8 figures |
| [`analysis/churn-backtest.py`](analysis/churn-backtest.py) | Time-split churn feasibility check |
| [`analysis/g2b.py`](analysis/g2b.py) | G2-B cleansing, features and `data/customer_features*.csv` |
| [`analysis/g2d2.py`](analysis/g2d2.py) | G2-D2 clustering and `data/customer_segments.csv` |
| [`analysis/g2d3.py`](analysis/g2d3.py) | G2-D3 classification and `data/worklist_scored.csv` |
| [`analysis/g2d1.py`](analysis/g2d1.py) | G2-D1 star-schema tables in `data/bi/` (needs g2d3 output) |
| [`analysis/g2d4.py`](analysis/g2d4.py) | G2-D4 regression |
| [`analysis/g2d5.py`](analysis/g2d5.py) | G2-D5 association rules and `data/association_rules.csv` (needs g2d3 output) |
| `analysis/*-output.json` | Raw output of each script |
| [`data/online_retail_II.csv.zip`](data/online_retail_II.csv.zip) | Source dataset (UCI ML Repository #502, CC BY 4.0) |
| `slides/build*.js` | pptxgenjs scripts that generate the decks |

## Reproducing the analysis

```bash
unzip -o data/online_retail_II.csv.zip -d data
pip install pandas scikit-learn matplotlib mlxtend
cd analysis
python3 profile.py          # G1-A and G1-D1-D3
python3 g1b.py              # G1-B
python3 g1d.py              # G1-D4-D8
python3 churn-backtest.py   # time-split churn feasibility
python3 g2b.py              # G2-B features -> data/customer_features*.csv
python3 g2d2.py             # G2-D2 segments -> data/customer_segments.csv
python3 g2d3.py             # G2-D3 classification -> data/worklist_scored.csv
python3 g2d1.py             # G2-D1 star schema -> data/bi/
python3 g2d4.py             # G2-D4 regression
python3 g2d5.py             # G2-D5 association -> data/association_rules.csv
```

## Rebuilding the slides

```bash
cd slides
npm install
node build-g1-presentation.js
```

## Dataset citation

Chen, D. (2019). *Online Retail II* [Dataset]. UCI Machine Learning
Repository. https://doi.org/10.24432/C5CG6D — Creative Commons Attribution
4.0 International (CC BY 4.0).
