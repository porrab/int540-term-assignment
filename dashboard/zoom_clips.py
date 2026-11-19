"""Add smooth zoom/pan to the raw demo clips using the focus logs.

    python zoom_clips.py [name-substring ...]

Reads demo-clips/raw/<name>.mp4 + <name>.focus.json (written by
record_demo.py) and writes demo-clips/<name>.mp4 at 1920x1080. Each focus
box is padded, widened to 16:9 and kept inside the frame; the camera eases
from the previous box to the new one over TRANS seconds.
Clicks from <name>.clicks.json get an expanding ring; right-clicks also get
a "Right-click" label, so viewers see where the drill-through starts.
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
RAW, OUT = HERE / "demo-clips" / "raw", HERE / "demo-clips"
OW, OH = 1920, 1080
TRANS = 0.8   # seconds per camera move
PAD = 0.04    # margin around a focus box, as a share of its size
# the video runs ~1.2 s behind the logged times: ffmpeg needs that long to start
# grabbing (measured 17 Nov: right-click menus appear 1.3-1.4 s after the logged click)
OFFSET = 1.2
HOLD_END = 3      # seconds of frozen last frame appended to each clip
RING_T, LABEL_T = 0.7, 1.4      # seconds a click ring / right-click label stays
RING = (242, 140, 40)           # orange ring
try:
    FONT = ImageFont.truetype("segoeuib.ttf", 30)
except OSError:
    FONT = ImageFont.load_default()


def draw_clicks(im, clicks, t, view):
    """Draw rings/labels for clicks active at time t onto the 1920x1080 frame."""
    x, y, w, h = view
    active = [c for c in clicks if 0 <= t - c["t"] < max(RING_T, LABEL_T)]
    if not active:
        return im
    over = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    for c in active:
        age = t - c["t"]
        px = (c["xy"][0] - x) / w * OW
        py = (c["xy"][1] - y) / h * OH
        if age < RING_T:
            u = age / RING_T
            r = 14 + 46 * (1 - (1 - u) ** 2)
            a = int(255 * (1 - u))
            d.ellipse((px - r, py - r, px + r, py + r), outline=RING + (a,), width=6)
            if u < 0.35:
                d.ellipse((px - 9, py - 9, px + 9, py + 9), fill=RING + (int(200 * (1 - u / 0.35)),))
        if c["button"] == "right" and age < LABEL_T:
            fade = min(1.0, (LABEL_T - age) / 0.3)
            text = "Right-click"
            tw, th = d.textbbox((0, 0), text, font=FONT)[2:]
            bx, by = px - tw / 2 - 14, py - 62 - th
            d.rounded_rectangle((bx, by, bx + tw + 28, by + th + 16), radius=10,
                                fill=(20, 20, 20, int(215 * fade)))
            d.text((bx + 14, by + 5), text, font=FONT, fill=(255, 255, 255, int(255 * fade)))
    return Image.alpha_composite(im.convert("RGBA"), over).convert("RGB")


def fit(box, W, H):
    x0, y0, x1, y1 = box
    w, h = (x1 - x0) * (1 + 2 * PAD), (y1 - y0) * (1 + 2 * PAD)
    if w / h > OW / OH:
        h = w * OH / OW
    else:
        w = h * OW / OH
    w, h = min(w, W), min(h, H)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    x = min(max(cx - w / 2, 0), W - w)
    y = min(max(cy - h / 2, 0), H - h)
    return (x, y, w, h)


def ease(u):
    u = min(max(u, 0.0), 1.0)
    return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2


def camera(events, t):
    cur = events[0]["view"]
    for prev, ev in zip(events, events[1:]):
        if t < ev["t"]:
            break
        u = ease((t - ev["t"]) / TRANS)
        cur = tuple(p + (n - p) * u for p, n in zip(prev["view_end"], ev["view"]))
    return cur


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                          "-show_entries", "stream=width,height,avg_frame_rate",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True).stdout
    w, h, rate = out.strip().split(",")
    num, den = rate.split("/")
    return int(w), int(h), rate, int(num) / int(den)


def render(name):
    src = RAW / f"{name}.mp4"
    W, H, _, _ = probe(src)
    # gdigrab writes variable frame timing and its avg_frame_rate does not match
    # the frame count, so resample to a constant 30 fps and time frames by that
    rate, fps = "30", 30.0
    events = json.loads((RAW / f"{name}.focus.json").read_text())
    for e in events:
        e["view"] = e["view_end"] = fit(e["box"], W, H)
        e["t"] += OFFSET
    cpath = RAW / f"{name}.clicks.json"
    clicks = json.loads(cpath.read_text()) if cpath.exists() else []
    for c in clicks:
        c["t"] += OFFSET
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(src), "-r", "30", "-f", "rawvideo",
                            "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                            "-s", f"{OW}x{OH}", "-r", rate, "-i", "-",
                            # hold the last frame so a presenter who talks a bit long is not left on black
                            "-vf", f"tpad=stop_mode=clone:stop_duration={HOLD_END}", "-c:v", "libx264",
                            "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                            "-movflags", "+faststart", str(OUT / f"{name}.mp4")],
                           stdin=subprocess.PIPE)
    n, size = 0, W * H * 3
    while True:
        buf = dec.stdout.read(size)
        if len(buf) < size:
            break
        view = camera(events, n / fps)
        x, y, w, h = view
        im = Image.frombytes("RGB", (W, H), buf)
        im = im.transform((OW, OH), Image.Transform.EXTENT, (x, y, x + w, y + h),
                          Image.Resampling.BICUBIC)
        im = draw_clicks(im, clicks, n / fps, view)
        enc.stdin.write(im.tobytes())
        n += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    print(f"{name}: {n} frames, {n / fps:.1f}s")


if __name__ == "__main__":
    names = sorted(p.stem for p in RAW.glob("*.mp4"))
    picks = sys.argv[1:]
    for name in names:
        if not picks or any(s in name for s in picks):
            render(name)
