// G1-C deck — Balanced Scorecard: objective, KPI, baseline/target, strategy map.
// Same palette and helpers as build.js (G1-A) / build-g1b.js (G1-B) so the set reads as one.
// Every figure here comes from ../g1-c-balanced-scorecard.md (itself sourced from
// ../analysis/g1b-output.json and ../analysis/g1d-output.json).
//
//   npm install && node build-g1c.js   ->  G1-C-slides.pptx

const pptxgen = require("pptxgenjs");

// ---------- palette ----------
const NAVY = "1E2761";
const ICE = "CADCFC";
const GOLD = "D4A24C";
const WHITE = "FFFFFF";
const BG_LIGHT = "F5F8FE";
const TEXT_DARK = "1E2761";
const TEXT_MUTED = "5B6B8C";
const CARD_BG = "FFFFFF";
const RED = "B3402F";
const GREEN = "5B8A5E";

const THAI_HEAD = "TH Sarabun New";
const THAI_BODY = "TH Sarabun New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PAGE_W = 13.33;
const PAGE_H = 7.5;

// ---------- helpers (identical to build-g1b.js) ----------
function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, dark) {
  slide.addText(label, {
    x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 1.6, h: 0.3,
    fontFace: THAI_BODY, fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0,
  });
  slide.addText("G1-C · INT 540 Data Analytics", {
    x: PAGE_W - 3.3, y: PAGE_H - 0.42, w: 2.8, h: 0.3,
    fontFace: THAI_BODY, fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED, align: "right", margin: 0,
  });
}

function iconCircle(slide, x, y, diameter, label, fill = GOLD, textColor = NAVY) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: diameter, h: diameter,
    fill: { color: fill }, line: { type: "none" }, shadow: freshShadow(),
  });
  slide.addText(label, {
    x, y, w: diameter, h: diameter,
    fontFace: THAI_HEAD, fontSize: diameter > 0.7 ? 20 : 15, bold: true,
    color: textColor, align: "center", valign: "middle", margin: 0,
  });
}

function statCard(slide, x, y, w, h, bigText, smallText, accent = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  slide.addText(bigText, {
    x: x + 0.12, y: y + 0.1, w: w - 0.24, h: h * 0.58,
    fontFace: THAI_HEAD, fontSize: 26, bold: true, color: accent,
    align: "center", valign: "bottom", margin: 0,
  });
  slide.addText(smallText, {
    x: x + 0.1, y: y + h * 0.6, w: w - 0.2, h: h * 0.38,
    fontFace: THAI_BODY, fontSize: 12, color: TEXT_MUTED,
    align: "center", valign: "top", margin: 0,
  });
}

function slideTitle(slide, kicker, title) {
  slide.addText(kicker, {
    x: 0.6, y: 0.35, w: PAGE_W - 1.2, h: 0.35,
    fontFace: THAI_BODY, fontSize: 14, bold: true, color: GOLD,
    align: "left", margin: 0, charSpacing: 1,
  });
  slide.addText(title, {
    x: 0.6, y: 0.68, w: PAGE_W - 1.2, h: 0.75,
    fontFace: THAI_HEAD, fontSize: 30, bold: true, color: TEXT_DARK,
    align: "left", margin: 0,
  });
}

function noteBar(slide, x, y, w, h, textRuns, fill = "FFF4E0", line = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: fill }, line: { color: line, width: 1 },
  });
  slide.addText(textRuns, {
    x: x + 0.22, y, w: w - 0.44, h,
    fontFace: THAI_BODY, fontSize: 13.5, color: TEXT_DARK,
    valign: "middle", lineSpacingMultiple: 1.25, margin: 0,
  });
}

function tableOf(header, body) {
  const head = header.map((t, i) => ({
    text: t,
    options: {
      bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5,
      align: i === 0 ? "left" : "center",
    },
  }));
  const rows = body.map((r, i) =>
    r.map((cell, j) => {
      const c = typeof cell === "object" ? cell : { text: cell };
      return {
        text: c.text,
        options: {
          color: c.color || (j === 0 ? TEXT_DARK : TEXT_MUTED),
          bold: c.bold || j === 0,
          fill: { color: c.fill || (i % 2 === 0 ? WHITE : "EAF0FC") },
          fontSize: c.fontSize || 12,
          align: j === 0 ? "left" : "center",
        },
      };
    })
  );
  return [head, ...rows];
}

// =====================================================================
// Slide 1 — Title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: "263480" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.4, y: 4.6, w: 5.2, h: 5.2, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("TERM ASSIGNMENT · GOAL 1 · G1-C", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.45,
    fontFace: THAI_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0,
  });
  s.addText("จะรู้ได้ยังไงว่าทางแก้ได้ผล", {
    x: 0.9, y: 2.35, w: 11.5, h: 1.3,
    fontFace: THAI_HEAD, fontSize: 46, bold: true, color: WHITE, margin: 0,
  });
  s.addText("Balanced Scorecard — Objective · KPI · Baseline & Target · Strategy Map", {
    x: 0.9, y: 3.55, w: 11.2, h: 0.6,
    fontFace: THAI_BODY, fontSize: 18, color: ICE, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 4.55, w: 9.4, h: 0.9, rectRadius: 0.1,
    fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
  });
  s.addText([
    { text: "หลักการ: ", options: { bold: true, color: GOLD } },
    { text: "ห้ามตั้ง target ลอย ๆ — ทุกตัวเลขต้องมี baseline จริงจาก G1-B/G1-D กำกับเสมอ", options: { color: WHITE } },
  ], {
    x: 1.15, y: 4.55, w: 9.0, h: 0.9,
    fontFace: THAI_BODY, fontSize: 14, valign: "middle", margin: 0,
  });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", {
    x: 0.9, y: 6.65, w: 8, h: 0.4,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
  s.addText("เคาะร่วมกัน 10 ก.ย. 2569 · ฉบับส่งจริง 17 ก.ย. 2569", {
    x: 0.9, y: 7.0, w: 10, h: 0.35,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
}

// =====================================================================
// Slide 2 — C1/C2 Pain point -> Objective -> CSF -> KPI
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "C1–C2 · จาก Pain Point ถึง KPI", "ตรวจจับลูกค้ากำลังจะเงียบ ก่อนที่เขาจะเงียบจริง");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.65, w: 12.1, h: 1.1, rectRadius: 0.1,
    fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText([
    { text: "Objective:  ", options: { bold: true, color: GOLD, fontSize: 16 } },
    { text: "ตรวจจับและรักษาลูกค้าที่กำลังจะเงียบ ก่อนที่เขาจะเงียบจริง — แทนที่จะรู้ตัวหลังยอดขายรวมตกไปแล้ว", options: { color: WHITE, fontSize: 16 } },
  ], { x: 0.9, y: 1.65, w: 11.5, h: 1.1, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });

  const rows = tableOf(
    ["CSF (นามธรรม)", "KPI (ตัวเลข)"],
    [
      ["ฝ่ายขายใช้ระบบเตือนเป็นกิจวัตร", "% สัปดาห์ที่มีการทบทวนรายชื่อลูกค้าเสี่ยง"],
      ["ตรวจจับลูกค้าเสี่ยงได้ทันเวลา ก่อนเงียบครบเกณฑ์", "% ลูกค้าเสี่ยงสูงที่ถูกติดต่อภายใน 30 วันหลังถูกแจ้งเตือน"],
      ["ลูกค้ากลับมาซื้อซ้ำเร็วขึ้นและสม่ำเสมอขึ้น", "อัตราซื้อซ้ำ · เวลาถึงการซื้อครั้งที่ 2 · % เงียบ >180 วัน"],
      ["รายได้จากลูกค้าประจำไม่รั่วออกจากฐาน", "มูลค่าที่กู้คืนได้จากกลุ่มเสี่ยง · อัตราคืนสินค้าจริง"],
    ]
  );
  s.addTable(rows, {
    x: 0.6, y: 3.05, w: 12.1, h: 3.2,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [5.6, 6.5], rowH: 0.7, valign: "middle",
  });

  addFooter(s, "pain point ต้นทาง: ลูกค้าเงียบ 40.64% (ถือ 13.49% ของยอดขาย) · เวลาถึงการซื้อครั้งที่ 2 มัธยฐาน 56 วัน — ไม่มีขั้นตอนใดจับสัญญาณก่อนหน้านั้น");
}

// =====================================================================
// Slide 3 — C3/C4 Baseline + target, measure/who/when
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "C3–C4 · Baseline, Target, Measure", "2 มิติบนตั้งเลขได้ตรง ๆ · 2 มิติล่างรอ Goal 2 ยืนยัน");

  const rows = tableOf(
    ["มิติ / KPI", "Baseline (จริง)", "Target", "วัดยังไง / ใครวัด"],
    [
      [{ text: "L&G — % สัปดาห์ที่ทบทวนรายชื่อ", color: NAVY }, { text: "0%", color: RED, bold: true }, "100% ตั้งแต่สัปดาห์แรก", "log การเปิด worklist · หัวหน้าฝ่ายขาย"],
      [{ text: "Internal — % ติดต่อภายใน 30 วัน", color: NAVY }, { text: "0%", color: RED, bold: true }, "≥80% ภายในไตรมาสแรก", "เทียบวันแจ้งเตือน-วันติดต่อ · หัวหน้าฝ่ายขาย"],
      [{ text: "Customer — อัตราซื้อซ้ำ", color: NAVY }, { text: "72.35%", color: GREEN, bold: true }, "รักษาไว้ไม่ให้ลดลง", "จาก transaction log · ทีมวิเคราะห์ (รายไตรมาส)"],
      [{ text: "Customer — เงียบ >180 วัน", color: NAVY }, { text: "40.64%", color: RED, bold: true }, "ลดลง — รอผล backtest Goal 2", "recency ทุกลูกค้า · ทีมวิเคราะห์ (รายเดือน)"],
      [{ text: "Financial — มูลค่าที่เสี่ยง", color: NAVY }, { text: "£813,004", color: RED, bold: true }, "กู้คืนบางส่วน — สมมติฐานรอพิสูจน์", "เทียบยอดซื้อก่อน-หลังติดต่อ · ทีม+บัญชี"],
      [{ text: "Financial — อัตราคืนสินค้าจริง", color: NAVY }, { text: "3.61%", color: TEXT_MUTED }, "ติดตามต่อ ไม่ใช่ KPI หลัก", "กรอง StockCode สินค้าจริงเท่านั้น · รายเดือน"],
    ]
  );
  s.addTable(rows, {
    x: 0.5, y: 1.55, w: 12.35, h: 4.1,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [3.1, 2.0, 3.1, 4.15], rowH: 0.68, valign: "middle",
  });

  noteBar(s, 0.5, 5.85, 12.35, 1.0, [
    { text: "ทำไม 2 มิติล่างไม่ตั้งตัวเลข target ตรง ๆ: ", options: { bold: true, color: RED } },
    { text: "ไม่มีข้อมูลแคมเปญ/กลุ่มควบคุม พิสูจน์ไม่ได้ว่าติดต่อแล้วทำให้ลูกค้ากลับมาจริงกี่ % — ตั้งเลขลอย ๆ ตรงนี้ถือว่าผิดกติกาของงาน (ห้ามตั้ง target ที่ไม่มี baseline)", options: {} },
  ], "FBE9E7", RED);

  addFooter(s, "ที่มา: g1b.py (baseline B3/B4) + g1d.py (verification) — ดู g1-c-balanced-scorecard.md");
}

// =====================================================================
// Slide 4 — C5 BSC 4 dimensions + strategy map
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "C5 · Balanced Scorecard 4 มิติ", "Strategy Map — เหตุ-ผลจากล่างขึ้นบน");

  const dims = [
    { title: "Financial", obj: "รักษารายได้จากลูกค้าประจำ", kpi: "มูลค่าที่กู้คืนได้ · อัตราคืนสินค้าจริง", color: "8A2E22" },
    { title: "Customer", obj: "ลูกค้ากลับมาซื้อซ้ำเร็วขึ้น มากขึ้น", kpi: "อัตราซื้อซ้ำ · เวลาถึงซื้อครั้งที่ 2 · % เงียบ", color: NAVY },
    { title: "Internal Process", obj: "ตรวจจับลูกค้าเสี่ยงก่อนเงียบครบ 180 วัน", kpi: "% เสี่ยงสูงที่ถูกติดต่อใน 30 วัน", color: "2E5A8A" },
    { title: "Learning & Growth", obj: "ฝ่ายขายใช้ worklist เป็นกิจวัตร", kpi: "% สัปดาห์ที่มีการทบทวนรายชื่อ", color: GREEN },
  ];
  let by = 1.6;
  const bh = 1.05;
  dims.slice().reverse().forEach((d) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: by, w: 7.2, h: bh, rectRadius: 0.08,
      fill: { color: d.color }, line: { type: "none" }, shadow: freshShadow(),
    });
    s.addText(d.title, {
      x: 0.85, y: by + 0.08, w: 2.2, h: bh - 0.16,
      fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, valign: "middle", margin: 0,
    });
    s.addText([
      { text: d.obj + "\n", options: { bold: true, color: WHITE, fontSize: 12.5 } },
      { text: d.kpi, options: { color: ICE, fontSize: 11 } },
    ], { x: 3.15, y: by + 0.06, w: 4.55, h: bh - 0.12, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });
    if (by > 1.6) {
      s.addText("↑", { x: 3.9, y: by - 0.32, w: 0.5, h: 0.32, fontFace: THAI_HEAD, fontSize: 18, bold: true, color: NAVY, align: "center", margin: 0 });
    }
    by += bh + 0.28;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.1, y: 1.6, w: 4.6, h: 5.15, rectRadius: 0.1,
    fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 },
  });
  s.addText("การคืนของอยู่ตรงไหนใน BSC", {
    x: 8.35, y: 1.78, w: 4.1, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0,
  });
  s.addText(
    "แยก 2 ตัวชี้วัดตามคำตัดสิน 10 ก.ย.:\n\n" +
      "อัตราคืนสินค้าจริง 3.61% → KPI มิติ Customer/Financial ที่ฝ่ายขายมีผลได้\n\n" +
      "รายการปรับปรุง/ค่าธรรมเนียม £800,079 → ไม่ใช่ KPI ของ solution นี้ เป็นเรื่องบัญชี ไม่ผูกกับ objective เรื่องลูกค้า",
    { x: 8.35, y: 2.3, w: 4.1, h: 4.2, fontFace: THAI_BODY, fontSize: 13, color: TEXT_DARK, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }
  );

  addFooter(s, "ทุกลูกศรอ่านจากล่างขึ้นบน: L&G ทำได้ก่อน → Internal Process ตามมา → Customer ดีขึ้น → Financial รักษาไว้ได้");
}

// =====================================================================
// Slide 5 — Summary / closing
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: 4.4, w: 5.6, h: 5.6, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("สรุป G1-C", {
    x: 0.7, y: 0.6, w: 11.9, h: 0.7,
    fontFace: THAI_HEAD, fontSize: 34, bold: true, color: WHITE, margin: 0,
  });
  s.addText("Balanced Scorecard พร้อมใช้ ตั้งแต่วันแรกที่มีระบบจริง", {
    x: 0.7, y: 1.2, w: 11.9, h: 0.4,
    fontFace: THAI_BODY, fontSize: 15, color: ICE, margin: 0,
  });

  const summary = [
    ["C1", "Objective", "ตรวจจับและรักษาลูกค้าที่กำลังจะเงียบ ก่อนที่เขาจะเงียบจริง"],
    ["C2", "CSF → KPI", "4 CSF แปลงเป็น KPI ตัวเลขครบทุกมิติ"],
    ["C3", "Baseline & Target", "2 มิติบนตั้งเลขตรง ๆ ได้ (ธุรกิจคุมเอง) · 2 มิติล่างรอ Goal 2 ยืนยัน"],
    ["C5", "Strategy Map", "L&G → Internal Process → Customer → Financial ร้อยเหตุ-ผลครบ 4 มิติ"],
  ];
  let sy = 1.95;
  summary.forEach(([tag, title, body]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: sy, w: 11.9, h: 1.0, rectRadius: 0.08,
      fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
    });
    iconCircle(s, 0.95, sy + 0.22, 0.55, tag, GOLD, NAVY);
    s.addText(title, {
      x: 1.7, y: sy + 0.1, w: 3.0, h: 0.8,
      fontFace: THAI_HEAD, fontSize: 15, bold: true, color: WHITE, valign: "middle", margin: 0,
    });
    s.addText(body, {
      x: 4.8, y: sy + 0.1, w: 7.6, h: 0.8,
      fontFace: THAI_BODY, fontSize: 13, color: ICE, valign: "middle", margin: 0,
    });
    sy += 1.15;
  });

  s.addText(
    "ต่อไป: G1-D · EDA + Data Model + SQL (เสร็จแล้ว — เดินหน้าสู่ G1-E สไลด์รวม)",
    { x: 0.7, y: sy + 0.15, w: 11.9, h: 0.4, fontFace: THAI_BODY, fontSize: 13, italic: true, color: "9AA8D6", margin: 0 }
  );

  addFooter(s, "Source: g1-c-balanced-scorecard.md — ทุกตัวเลข reproduce ได้จาก analysis/g1b.py + analysis/g1d.py", true);
}

pres.writeFile({ fileName: "G1-C-slides.pptx" }).then(() => {
  console.log("done");
});
