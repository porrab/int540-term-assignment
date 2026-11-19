"""Bring the Power BI Desktop window for int540-g2-d1 to the front, maximised."""
import ctypes, ctypes.wintypes as w, time
u = ctypes.windll.user32
found = []
def cb(h, l):
    n = ctypes.create_unicode_buffer(256); u.GetWindowTextW(h, n, 256)
    if n.value.startswith("int540-g2-d1") and u.IsWindowVisible(h):
        found.append(h)
    return True
u.EnumWindows(ctypes.WINFUNCTYPE(ctypes.c_bool, w.HWND, w.LPARAM)(cb), 0)
if not found:
    raise SystemExit("Power BI window int540-g2-d1 not found")
h = found[0]
u.keybd_event(0x12, 0, 0, 0); u.keybd_event(0x12, 0, 2, 0)  # Alt tap unlocks SetForegroundWindow
u.ShowWindow(h, 3)  # SW_MAXIMIZE
u.SetForegroundWindow(h)
time.sleep(0.8)
print("focused", u.GetForegroundWindow() == h)
