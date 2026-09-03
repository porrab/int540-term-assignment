# INT 540 / DSI 121 — Term Assignment (Goal 1)

Data Analytics for Business Decision · Term Assignment Goal 1 (G1-A): company
profile, evidence-backed business strategy, and customer segmentation, built
from the **Online Retail II** dataset (UCI ML Repository #502).

## Contents

| File | What it is |
|---|---|
| [`plan.md`](plan.md) | Full term assignment plan — Goal 1 + Goal 2 task breakdown, deadlines, team schedule |
| [`brief/term-assignment-brief.md`](brief/term-assignment-brief.md) | Verbatim copy of the professor's actual brief (+ `.docx` original and the sample customer journey map image) — `plan.md` is checked against this |
| [`g1-a-company-profile.md`](g1-a-company-profile.md) | G1-A deliverable: company profile, real numbers, Five Forces/TOWS/Value Chain strategy, retail vs wholesale segmentation |
| [`g1-d1-d3-data-profiling.md`](g1-d1-d3-data-profiling.md) | Data loading, profiling, and data-quality issue inventory |
| [`analysis/profile.py`](analysis/profile.py) | Reproducible pandas script that computes every number cited above |
| [`analysis/profile-output.json`](analysis/profile-output.json) | Raw output of `profile.py` |
| [`data/online_retail_II.csv.zip`](data/online_retail_II.csv.zip) | Source dataset (UCI ML Repository #502, CC BY 4.0) |
| [`slides/G1-A-slides.pptx`](slides/G1-A-slides.pptx) | G1-A slide deck |
| [`slides/build.js`](slides/build.js) | pptxgenjs script that generates the deck |

## Reproducing the analysis

```bash
cd analysis
unzip -o ../data/online_retail_II.csv.zip -d ../data
pip install pandas
python3 profile.py
```

## Rebuilding the slides

```bash
cd slides
npm install
node build.js
```

## Dataset citation

Chen, D. (2019). *Online Retail II* [Dataset]. UCI Machine Learning
Repository. https://doi.org/10.24432/C5CG6D — Creative Commons Attribution
4.0 International (CC BY 4.0).
