"""Put each page's spoken script into the speaker notes of G2-presentation.pptx.

    node slides/build-g2-presentation.js && python slides/add-g2-notes.py

Reads presentation-script-g2.md (the source of the script) and writes the notes
for slides 1-20 in place. Run it after every rebuild of the deck: pptxgenjs
writes the deck without notes.
"""
import re
from pathlib import Path
from pptx import Presentation

HERE = Path(__file__).resolve().parent.parent
MD = HERE / "presentation-script-g2.md"
DECK = HERE / "slides" / "G2-presentation.pptx"


def plain(t):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"~~(.+?)~~", r"\1", t)
    return re.sub(r"[*`]", "", t).strip()


pages, speaker, cur = {}, None, None
for l in MD.read_text(encoding="utf-8").split("\n"):
    if re.match(r"^# ผู้พูด (\d)", l):
        speaker, cur = int(re.match(r"^# ผู้พูด (\d)", l).group(1)), None
        continue
    if l.startswith("# "):
        speaker, cur = None, None
        continue
    m = re.match(r"^#{2,3} หน้า (\d+)\b(.*)$", l)
    if m and speaker:
        cur = pages.setdefault(int(m.group(1)), [f"ผู้พูด {speaker} · {plain(m.group(2)).lstrip('·—- ')}", ""])
        continue
    if cur is None:
        continue
    s = l.rstrip()
    if s.startswith(">"):
        body = s[1:].strip()
        if body.startswith("**ลำดับ") or "`" in body:   # team notes, not speech
            continue
        cur.append(plain(body))
    elif re.match(r"^\*\(.*\)\*$", s.strip()):
        cur += ["", f"[ภาพในคลิป {plain(s.strip()[2:-2])}]"]
    elif s.startswith("**ส่งไม้:**"):
        cur += ["", plain(s)]

prs = Presentation(DECK)
for n, lines in pages.items():
    if n > len(prs.slides):
        continue
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(lines)).strip()
    prs.slides[n - 1].notes_slide.notes_text_frame.text = text
prs.save(DECK)
print("notes written for slides", sorted(pages))
