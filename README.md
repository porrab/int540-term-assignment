# INT 540 / DSI 121 — Term Assignment (Goal 1)

Data Analytics for Business Decision · Term Assignment Goal 1: company profile
and business strategy (G1-A), systems-thinking problem statement and customer
journey map (G1-B), and data profiling (G1-D1–D3) — all built from the
**Online Retail II** dataset (UCI ML Repository #502). Every figure cited in the
write-ups is computed by a script in `analysis/` and can be reproduced.

## Contents

| File | What it is |
|---|---|
| [`plan.md`](plan.md) | Full term assignment plan — Goal 1 + Goal 2 task breakdown, deadlines, team schedule |
| [`brief/term-assignment-brief.md`](brief/term-assignment-brief.md) | Verbatim copy of the professor's actual brief (+ `.docx` original and the sample customer journey map image) — `plan.md` is checked against this |
| [`brief/lecturer-verbal-brief.md`](brief/lecturer-verbal-brief.md) | Requirements the lecturer gave verbally in class that are not in the written brief — the four allowed project types, the three allowed data sources, and what actually has to be submitted |
| [`g1-a-company-profile.md`](g1-a-company-profile.md) | G1-A deliverable: company profile, real numbers, Five Forces/TOWS/Value Chain strategy, retail vs wholesale segmentation |
| [`g1-b-problem-statement.md`](g1-b-problem-statement.md) | G1-B deliverable: systems thinking model, two evidence-backed pain points, the problem statement, and the customer journey map |
| [`g1-d1-d3-data-profiling.md`](g1-d1-d3-data-profiling.md) | Data loading, profiling, and data-quality issue inventory |
| [`analysis/profile.py`](analysis/profile.py) | Reproducible pandas script that computes every number cited above |
| [`analysis/profile-output.json`](analysis/profile-output.json) | Raw output of `profile.py` |
| [`analysis/g1b.py`](analysis/g1b.py) | Reproducible script behind every retention, returns, and journey-stage figure in G1-B |
| [`analysis/g1b-output.json`](analysis/g1b-output.json) | Raw output of `g1b.py` |
| [`data/online_retail_II.csv.zip`](data/online_retail_II.csv.zip) | Source dataset (UCI ML Repository #502, CC BY 4.0) |
| [`slides/G1-A-slides.pptx`](slides/G1-A-slides.pptx) | G1-A slide deck (10 slides) |
| [`slides/G1-B-slides.pptx`](slides/G1-B-slides.pptx) | G1-B slide deck (9 slides) |
| [`slides/build.js`](slides/build.js) | pptxgenjs script that generates the G1-A deck |
| [`slides/build-g1b.js`](slides/build-g1b.js) | pptxgenjs script that generates the G1-B deck |

## Reproducing the analysis

```bash
cd analysis
unzip -o ../data/online_retail_II.csv.zip -d ../data
pip install pandas
python3 profile.py   # G1-A and G1-D1-D3 figures
python3 g1b.py       # G1-B figures
```

## Rebuilding the slides

```bash
cd slides
npm install
node build.js       # G1-A-slides.pptx
node build-g1b.js   # G1-B-slides.pptx
```

## Dataset citation

Chen, D. (2019). *Online Retail II* [Dataset]. UCI Machine Learning
Repository. https://doi.org/10.24432/C5CG6D — Creative Commons Attribution
4.0 International (CC BY 4.0).
