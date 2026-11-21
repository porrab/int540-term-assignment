"""Build one self-contained HTML page: every G2 slide next to its spoken script.

    python slides/build-g2-script-html.py <folder of slide images s01.png ... s26.png>

Slide images come from PowerPoint (File > Export, or the COM export used on
21 Nov 2026). The script text is read from presentation-script-g2.md, so the
page always matches the .md; edit the .md, never the HTML.
Output: presentation-g2-script.html next to presentation-script-g2.md.
"""
import base64, html, io, re, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
MD = HERE / "presentation-script-g2.md"
OUT = HERE / "presentation-g2-script.html"
SLIDES = Path(sys.argv[1])
APPENDIX = {21: "Appendix", 22: "A1", 23: "A2", 24: "A3", 25: "A4", 26: "A5"}


def img_data(n):
    im = Image.open(SLIDES / f"s{n:02d}.png").convert("RGB")
    im.thumbnail((1600, 900))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=82, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"~~(.+?)~~", r"<del>\1</del>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", t)
    return t


def table(lines):
    rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines if not re.match(r"^\|[\s|:-]+\|$", l.strip())]
    head, body = rows[0], rows[1:]
    h = "".join(f"<th>{inline(c)}</th>" for c in head)
    b = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body)
    return f'<table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table>'


def render(lines):
    """Script body: quoted lines are speech, *( )* lines are cues, the rest are notes."""
    out, speech, tbl, items = [], [], [], []

    def flush():
        nonlocal speech, tbl, items
        if items:
            out.append('<ul class="note">' + "".join(f"<li>{inline(x)}</li>" for x in items) + "</ul>")
            items = []
        if speech:
            paras = "\n".join(speech).strip().split("\n\n")
            out.append('<div class="speech">' + "".join(
                "<p>" + "<br>".join(inline(x) for x in p.split("\n")) + "</p>" for p in paras if p.strip()) + "</div>")
            speech = []
        if tbl:
            out.append(table(tbl)); tbl = []

    for raw in lines:
        l = raw.rstrip()
        if l.startswith(">"):
            if tbl: flush()
            speech.append(l[1:].strip())
            continue
        if l.startswith("|"):
            if speech: flush()
            tbl.append(l); continue
        if l.startswith("- "):
            if speech or tbl: flush()
            items.append(l[2:]); continue
        flush()
        if not l.strip() or l.strip() == "---":
            continue
        if re.match(r"^\*\(.*\)\*$", l.strip()):
            out.append(f'<div class="cue">{inline(l.strip()[2:-2])}</div>')
        elif l.startswith("**ส่งไม้:**"):
            out.append(f'<div class="handoff">{inline(l)}</div>')
        else:
            out.append(f'<p class="note">{inline(l)}</p>')
    flush()
    return "\n".join(out)


text = MD.read_text(encoding="utf-8").split("\n")
pages, intro, qa = {}, [], []
speaker, cur, mode = None, None, "intro"
for l in text:
    m_sp = re.match(r"^# ผู้พูด (\d)", l)
    m_pg = re.match(r"^#{2,3} หน้า (\d+)\b(.*)$", l)
    if m_sp:
        speaker, mode, cur = int(m_sp.group(1)), "speaker", None
        continue
    if l.startswith("# เตรียมตอบคำถาม"):
        mode, cur = "qa", None
        continue
    if m_pg and mode == "speaker":
        n = int(m_pg.group(1))
        title = re.sub(r"^[\s·—-]*", "", m_pg.group(2)).strip()
        cur = pages.setdefault(n, {"speaker": speaker, "title": title, "lines": []})
        continue
    if mode == "intro":
        intro.append(l)
    elif mode == "qa":
        qa.append(l)
    elif cur is not None:
        cur["lines"].append(l)
    elif mode == "speaker" and speaker and l.strip() and not l.startswith("#"):
        pages.setdefault(f"sp{speaker}", {"lines": []})["lines"].append(l)

# the team-wide notes: keep the "what the lecturer asked" list and the speaker table
intro_html = render([l for l in intro if not l.startswith("# ")]).replace("<p class=\"note\">## ", "<h3>").replace("<p class=\"note\">", "<p class=\"note\">")
intro_html = re.sub(r'<p class="note">#+ (.*?)</p>', r"<h3>\1</h3>", intro_html)

cards = []
for n in range(1, 21):
    pg = pages.get(n)
    sp = pg["speaker"] if pg else None
    title = pg["title"] if pg else ""
    body = render(pg["lines"]) if pg else '<p class="note">ไม่มีบทพูดของหน้านี้</p>'
    lead = ""
    if pg and n == min(k for k, v in pages.items() if isinstance(k, int) and v["speaker"] == sp):
        sp_notes = pages.get(f"sp{sp}", {}).get("lines", [])
        if sp_notes:
            lead = f'<div class="spnotes">{render(sp_notes)}</div>'
    cards.append(f'''
<section class="card sp{sp}" id="p{n}">
  <div class="slide"><img loading="lazy" src="{img_data(n)}" alt="Slide {n}"></div>
  <div class="script">
    <div class="meta"><span class="num">หน้า {n}</span><span class="who">ผู้พูด {sp}</span></div>
    <h2>{inline(title)}</h2>
    {lead}
    {body}
  </div>
</section>''')

appx = "".join(f'''
<figure class="appx"><img loading="lazy" src="{img_data(n)}" alt="{APPENDIX[n]}"><figcaption>หน้า {n} · {APPENDIX[n]}</figcaption></figure>''' for n in range(21, 27))

nav = "".join(f'<a href="#p{min(k for k, v in pages.items() if isinstance(k, int) and v["speaker"] == s)}" class="chip sp{s}">ผู้พูด {s}</a>' for s in range(1, 6))

page = f'''<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>G2 Presentation — สไลด์พร้อมบทพูด</title>
<style>
:root {{ --navy:#1E2761; --gold:#D4A24C; --bg:#F5F8FE; --muted:#5B6B8C; --line:#D7E1F5; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:var(--bg); color:#1d2433; font-family:"Leelawadee UI","Sarabun","Tahoma",sans-serif; font-size:17px; line-height:1.65; }}
header {{ position:sticky; top:0; z-index:5; background:var(--navy); color:#fff; padding:10px 24px; display:flex; gap:16px; align-items:center; flex-wrap:wrap; }}
header b {{ font-size:18px; margin-right:auto; }}
.chip {{ color:#fff; text-decoration:none; padding:4px 12px; border-radius:999px; border:1px solid rgba(255,255,255,.35); font-size:15px; }}
.chip:hover {{ background:rgba(255,255,255,.12); }}
main {{ max-width:1500px; margin:0 auto; padding:24px; }}
.intro {{ background:#fff; border:1px solid var(--line); border-radius:12px; padding:8px 24px 16px; margin-bottom:28px; }}
.intro h3 {{ color:var(--navy); margin:18px 0 6px; }}
.card {{ display:grid; grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:24px; background:#fff; border:1px solid var(--line); border-radius:12px; padding:20px; margin-bottom:22px; scroll-margin-top:70px; }}
.card.sp4 {{ border-left:6px solid var(--gold); }}
.slide img {{ width:100%; border-radius:6px; border:1px solid var(--line); cursor:zoom-in; display:block; }}
.meta {{ display:flex; gap:10px; font-size:14px; color:var(--muted); }}
.num {{ font-weight:700; color:var(--navy); }}
.who {{ background:#EAF0FC; border-radius:999px; padding:0 10px; }}
.sp4 .who {{ background:#FFF4E0; }}
h2 {{ margin:4px 0 12px; font-size:21px; color:var(--navy); }}
.speech {{ border-left:3px solid var(--gold); padding:2px 0 2px 14px; margin:8px 0 12px; }}
.speech p {{ margin:0 0 10px; }}
.cue {{ font-size:14px; color:var(--muted); margin-top:14px; }}
.cue::before {{ content:"ภาพในคลิป "; font-weight:700; }}
.note {{ font-size:14.5px; color:var(--muted); margin:6px 0; }}
.spnotes {{ background:#FFF9EE; border-radius:8px; padding:6px 12px; margin-bottom:10px; }}
.handoff {{ margin-top:14px; padding:8px 12px; background:#EAF0FC; border-radius:8px; }}
code {{ font-size:13px; background:#EEF2FA; padding:1px 5px; border-radius:4px; }}
table {{ border-collapse:collapse; width:100%; font-size:14.5px; margin:8px 0 14px; }}
th,td {{ border:1px solid var(--line); padding:6px 8px; vertical-align:top; text-align:left; }}
th {{ background:var(--navy); color:#fff; }}
.appxgrid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }}
.appx {{ margin:0; background:#fff; border:1px solid var(--line); border-radius:10px; padding:10px; }}
.appx img {{ width:100%; cursor:zoom-in; }}
.appx figcaption {{ font-size:14px; color:var(--muted); }}
#zoom {{ position:fixed; inset:0; background:rgba(10,15,30,.88); display:none; align-items:center; justify-content:center; z-index:9; cursor:zoom-out; }}
#zoom img {{ max-width:96vw; max-height:94vh; }}
@media (max-width: 1000px) {{ .card {{ grid-template-columns:1fr; }} .appxgrid {{ grid-template-columns:1fr; }} }}
@media print {{ header {{ position:static; }} .card {{ break-inside:avoid; }} }}
</style></head>
<body>
<header><b>INT540 Goal 2 — สไลด์พร้อมบทพูด</b>{nav}<a class="chip" href="#qa">ถาม-ตอบ</a></header>
<main>
<div class="intro">{intro_html}</div>
{"".join(cards)}
<section class="card" id="qa" style="display:block">
  <h2>หน้าสำรองและเตรียมตอบคำถาม</h2>
  {render(qa)}
  <div class="appxgrid">{appx}</div>
</section>
<p class="note">สร้างจาก presentation-script-g2.md และ G2-presentation.pptx ด้วย slides/build-g2-script-html.py · แก้บทพูดที่ไฟล์ .md แล้วสร้างหน้านี้ใหม่</p>
</main>
<div id="zoom"><img alt=""></div>
<script>
const z = document.getElementById('zoom');
document.querySelectorAll('.slide img, .appx img').forEach(i => i.addEventListener('click', () => {{ z.querySelector('img').src = i.src; z.style.display = 'flex'; }}));
z.addEventListener('click', () => z.style.display = 'none');
document.addEventListener('keydown', e => {{ if (e.key === 'Escape') z.style.display = 'none'; }});
</script>
</body></html>'''
OUT.write_text(page, encoding="utf-8")
print("wrote", OUT, f"{OUT.stat().st_size/1e6:.1f} MB", "pages with script:", sorted(k for k in pages if isinstance(k, int)))
