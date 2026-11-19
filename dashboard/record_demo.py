"""Record the speaker-4 Power BI demo as 5 silent clips with a smooth real cursor.

Before running: int540-g2-d1.pbix open in Power BI Desktop on the primary
2560x1440 monitor (175% scale), Filters/Visualizations/Data panes collapsed,
on page "1 Overview" with every slicer at All. Then:
    python record_demo.py [clip numbers...]
Do not touch mouse or keyboard while it runs.

Output per clip in demo-clips/raw/: <name>.mp4 at native 2240x1260, plus
<name>.focus.json (when to zoom to which box) and <name>.clicks.json.
zoom_clips.py turns those into the final 1080p clips.

Coordinates are in a 1600x900 frame of the primary screen (x1.6 = physical).
"""
import ctypes, json, subprocess, sys, time
from pathlib import Path

ctypes.windll.shcore.SetProcessDpiAwareness(2)
import pyautogui as P

P.FAILSAFE = False
P.PAUSE = 0
HERE = Path(__file__).parent
RAW = HERE / "demo-clips" / "raw"
RAW.mkdir(parents=True, exist_ok=True)
K = 1.6
# capture region (physical px): 16:9 around the report canvas + page tabs
CX, CY, CW, CH = 160, 64, 2240, 1260


def cap(x, y):
    """scaled-1600 coords -> capture-frame pixels"""
    return round(x * K - CX), round(y * K - CY)


class Clip:
    def __init__(self, name):
        self.name, self.clicks, self.focus_log = name, [], []

    def __enter__(self):
        subprocess.run([sys.executable, str(HERE / "focus_pbi.py")], check=True)
        self.proc = subprocess.Popen(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "gdigrab", "-framerate", "30", "-draw_mouse", "1",
             "-offset_x", str(CX), "-offset_y", str(CY),
             "-video_size", f"{CW}x{CH}", "-i", "desktop",
             "-c:v", "libx264", "-preset", "ultrafast", "-crf", "14",
             "-pix_fmt", "yuv420p", str(RAW / f"{self.name}.mp4")],
            stdin=subprocess.PIPE)
        time.sleep(1.5)
        self.t0 = time.time() - 0.3  # ffmpeg start-up lag, measured roughly
        self.full()
        return self

    def __exit__(self, *a):
        time.sleep(0.5)
        self.proc.communicate(b"q")
        (RAW / f"{self.name}.clicks.json").write_text(json.dumps(self.clicks, indent=1))
        (RAW / f"{self.name}.focus.json").write_text(json.dumps(self.focus_log, indent=1))
        print("saved", self.name)

    def now(self):
        return round(time.time() - self.t0, 2)

    def focus(self, x0, y0, x1, y1):
        """zoom to this box (scaled coords); zoom_clips.py pads it to 16:9"""
        self.focus_log.append({"t": self.now(), "box": [*cap(x0, y0), *cap(x1, y1)]})

    def full(self):
        self.focus_log.append({"t": self.now(), "box": [0, 0, CW, CH]})

    def move(self, x, y, dur=0.8):
        P.moveTo(x * K, y * K, dur, P.easeInOutQuad)

    def click(self, x, y, button="left", dur=0.8):
        self.move(x, y, dur)
        time.sleep(0.25)
        self.clicks.append({"t": self.now(), "button": button, "xy": cap(x, y)})
        P.click(button=button)

    hold = staticmethod(time.sleep)


def clip1():  # Overview: headline cards -> trend line -> who matters
    with Clip("clip1-overview") as c:
        c.move(120, 500, 0.01); c.hold(2.0)
        # Never cross the slicer row (y 255-300) on the way: a slicer's header icons
        # pop up over the 40.64% card and stay there. Travel in the grey left margin.
        c.focus(186, 120, 1030, 250)            # title + KPI cards
        c.move(150, 224, 0.8); c.hold(0.2)      # up the grey margin
        c.move(360, 224, 0.8); c.hold(3.0)      # 40.64% now
        c.move(950, 137, 1.0); c.hold(2.5)      # 21.07% a year earlier (title)
        c.move(670, 224, 1.0); c.hold(3.0)      # 966 high-risk (model output)
        # line chart: point at axis labels, hovering the line opens a sticky tooltip
        c.focus(190, 305, 925, 545)
        c.move(150, 224, 0.9); c.hold(0.1)      # back to the margin, past the slicers
        c.move(150, 492, 0.7); c.hold(0.1)
        c.move(447, 492, 0.9); c.hold(2.5)      # 2010-12  21.07%
        c.move(554, 492, 1.0); c.hold(2.5)      # 2011-03  29.67%
        c.move(626, 492, 0.8); c.hold(3.0)      # 2011-05  45.23% jump
        c.focus(930, 305, 1350, 545)            # segment share bars
        c.move(1081, 377, 1.2); c.hold(2.5)     # Loyal wholesale 19.0% of customers
        # just right of the bar: the 71.6% label sits inside the bar, and hovering
        # the bar opens a tooltip that covers it
        c.move(1314, 377, 1.0); c.hold(3.0)     # ... but 71.6% of revenue
        c.full()
        c.move(120, 500, 1.0); c.hold(1.5)      # grey margin: closes any tooltip


def clip2():  # May 2011 -> drill through -> Month drill
    with Clip("clip2-drill-may-2011") as c:
        c.move(641, 250, 0.01); c.hold(1.0)
        c.focus(190, 300, 1100, 650)            # chart + where the menu opens
        c.click(641, 382, "right", 1.2); c.hold(1.2)  # 2011-05 point
        c.move(707, 501, 0.7); c.hold(1.0)      # Drill through
        c.move(860, 501, 0.5); c.hold(0.3)
        c.click(915, 502, dur=0.4); c.hold(0.3) # Month drill
        c.full(); c.hold(1.5)
        c.focus(186, 160, 1050, 250)            # month-end, 45.23%, 987 newly silent
        c.move(900, 222, 1.0); c.hold(3.5)
        c.focus(186, 255, 1350, 755)            # last-order month + segment bars
        c.move(502, 330, 1.0); c.hold(2.5)      # 563 last bought 2010-11
        c.move(316, 440, 0.8); c.hold(2.0)      # 396 last bought 2010-10
        c.full(); c.hold(1.0)


def clip3():  # back to Overview, Segment = Slipping regulars
    with Clip("clip3-segment-slicer") as c:
        c.move(700, 450, 0.01); c.hold(1.0)
        c.click(238, 803, dur=1.0); c.hold(1.5) # tab 1 Overview
        c.focus(186, 120, 900, 500)             # slicer + its list
        c.click(277, 287, dur=1.0); c.hold(1.0) # Segment dropdown
        c.click(278, 422, dur=0.7); c.hold(1.0) # Slipping regulars
        c.click(120, 500, dur=0.7); c.hold(0.3) # close dropdown (grey margin)
        c.focus(186, 170, 1350, 550)            # cards + line + bars now filtered
        c.move(560, 420, 1.0); c.hold(4.0)


def clip4():  # right-click the segment bar -> drill through -> Worklist
    with Clip("clip4-drill-worklist") as c:
        c.move(560, 420, 0.01); c.hold(1.0)
        c.focus(880, 300, 1500, 710)            # bar + menu + submenu
        c.click(1057, 440, "right", 1.0); c.hold(0.8)
        c.move(1124, 585, 0.7); c.hold(1.0)     # Drill through
        c.move(1270, 585, 0.5); c.hold(0.3)
        c.click(1328, 586, dur=0.4); c.hold(0.3) # 2 Worklist
        c.full(); c.hold(1.5)
        c.focus(200, 225, 1010, 690)            # the table
        c.move(538, 245, 1.0); c.hold(2.0)      # Risk column: from the model
        c.move(260, 272, 0.8); c.hold(0.5)
        c.move(260, 679, 2.5); c.hold(2.0)      # run down the 18 rows


def clip5():  # customer 18073: usual gap vs days silent -> Customer history
    with Clip("clip5-customer-18073") as c:
        c.move(260, 679, 0.01)
        c.focus(200, 225, 1010, 690); c.hold(1.0)
        c.move(289, 367, 1.0); c.hold(1.0)      # 18073
        c.focus(200, 330, 1010, 400)            # that row, close up
        c.hold(1.0)
        c.move(860, 367, 1.2); c.hold(2.5)      # usual gap 7.5 days
        c.move(788, 367, 0.5); c.hold(2.5)      # 114 days since last order
        c.focus(200, 330, 760, 610)             # row + right-click menu
        c.click(289, 367, "right", 1.0); c.hold(0.8)
        c.move(356, 486, 0.7); c.hold(1.0)      # Drill through
        c.move(500, 486, 0.4); c.hold(0.3)
        c.click(581, 486, dur=0.4); c.hold(0.3) # Customer history
        c.full(); c.hold(1.0)
        c.focus(186, 160, 870, 520)             # who + latest orders
        c.move(320, 316, 1.0); c.hold(4.0)      # last order 2011-08-17
        c.full(); c.hold(1.0)


CLIPS = {1: clip1, 2: clip2, 3: clip3, 4: clip4, 5: clip5}

if __name__ == "__main__":
    for n in [int(a) for a in sys.argv[1:]] or CLIPS:
        CLIPS[n]()
        time.sleep(1.0)
