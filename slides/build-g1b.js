// G1-B deck — Systems Thinking, problem statement, customer journey map.
// Same palette and helpers as build.js (G1-A) so the two decks read as one set.
// Every figure here comes from ../analysis/g1b-output.json (see ../g1-b-problem-statement.md).
//
//   npm install && node build-g1b.js   ->  G1-B-slides.pptx

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

// ---------- helpers ----------
function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, dark) {
  slide.addText(label, {
    x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 1.6, h: 0.3,
    fontFace: THAI_BODY, fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0,
  });
  slide.addText("G1-B · INT 540 Data Analytics", {
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

function tableOf(header, body, opts) {
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

  s.addText("TERM ASSIGNMENT · GOAL 1 · G1-B", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.45,
    fontFace: THAI_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0,
  });
  s.addText("ปัญหาคืออะไร และรู้ได้ยังไงว่าเป็นปัญหา", {
    x: 0.9, y: 2.35, w: 11.5, h: 1.3,
    fontFace: THAI_HEAD, fontSize: 46, bold: true, color: WHITE, margin: 0,
  });
  s.addText("Systems Thinking · Pain point จากข้อมูลจริง · Problem Statement · Customer Journey Map", {
    x: 0.9, y: 3.55, w: 11.2, h: 0.6,
    fontFace: THAI_BODY, fontSize: 18, color: ICE, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 4.55, w: 9.4, h: 0.9, rectRadius: 0.1,
    fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
  });
  s.addText([
    { text: "ฐานคำนวณ: ", options: { bold: true, color: GOLD } },
    { text: "แถวขายจริง 1,037,007 แถว · £20,121,372.19 · ลูกค้าที่ระบุตัวตนได้ 5,852 ราย (86.65% ของยอดขาย)", options: { color: WHITE } },
  ], {
    x: 1.15, y: 4.55, w: 9.0, h: 0.9,
    fontFace: THAI_BODY, fontSize: 14, valign: "middle", margin: 0,
  });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", {
    x: 0.9, y: 6.65, w: 8, h: 0.4,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
  s.addText("Dataset: Online Retail II (UCI #502) · ทุกตัวเลข reproduce ได้จาก analysis/g1b.py", {
    x: 0.9, y: 7.0, w: 10, h: 0.35,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
}

// =====================================================================
// Slide 2 — B1 Systems Thinking model
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B1 · Systems Thinking", "ระบบขายครบทุกขั้น ยกเว้นขั้นที่บอกว่าลูกค้ากำลังจะหาย");

  const boxes = [
    { x: 0.6, title: "INPUT", items: ["คำสั่งซื้อ 53,628 ใบ", "สินค้า 4,898 SKU", "ลูกค้า UK + 42 ประเทศ"] },
    { x: 4.9, title: "PROCESS", items: ["1. รับคำสั่งซื้อ", "2. จัดของ / ส่งของ", "3. ออกใบแจ้งหนี้", "4. รับคืน / ยกเลิก (8,292 ใบ)"] },
    { x: 9.2, title: "OUTPUT", items: ["ยอดขาย £20.1M", "ลูกค้า 5,852 ราย", "คืนของ -£1.53M", "ลูกค้าเงียบ 40.64%"] },
  ];
  boxes.forEach((b) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: b.x, y: 1.75, w: 3.5, h: 2.5, rectRadius: 0.1,
      fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
    });
    s.addText(b.title, {
      x: b.x, y: 1.85, w: 3.5, h: 0.4,
      fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, align: "center", charSpacing: 1.5, margin: 0,
    });
    s.addText(b.items.map((t) => ({ text: t, options: { breakLine: true } })), {
      x: b.x + 0.28, y: 2.3, w: 3.0, h: 1.85,
      fontFace: THAI_BODY, fontSize: 13, color: TEXT_DARK, bullet: { code: "2022" },
      lineSpacingMultiple: 1.3, margin: 0,
    });
  });
  [4.25, 8.55].forEach((x) => {
    s.addText("→", {
      x, y: 2.65, w: 0.7, h: 0.7,
      fontFace: THAI_HEAD, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0,
    });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 4.55, w: 12.1, h: 0.95, rectRadius: 0.1,
    fill: { color: "FBE9E7" }, line: { color: RED, width: 1.5, dashType: "dash" },
  });
  s.addText([
    { text: "❌ FEEDBACK LOOP ที่ขาด — ", options: { bold: true, color: RED } },
    { text: "ระบบวัดได้แค่ “ขายได้เท่าไร” แต่ไม่มีขั้นตอนใดป้อนกลับว่า ลูกค้าคนไหนกำลังเงียบ หรือ การคืนของกระจุกที่ใคร", options: { color: TEXT_DARK } },
  ], {
    x: 0.9, y: 4.55, w: 11.5, h: 0.95,
    fontFace: THAI_BODY, fontSize: 15, valign: "middle", margin: 0,
  });

  noteBar(s, 0.6, 5.75, 12.1, 0.85, [
    { text: "เมื่อไม่มี feedback ระบบจึงแก้ตัวเองไม่ได้ ", options: { bold: true } },
    { text: "— นี่คือรากของ pain point ทั้ง 2 ข้อใน B3/B4 และตรงกับคาบ 13 ส.ค.: ข้อมูลมีอยู่แล้ว แต่ไม่ถูกแปลงเป็น information ที่ใช้ตัดสินใจ", options: {} },
  ]);

  addFooter(s, "ขอบเขตที่เลือก (B2): customer journey ของลูกค้าที่ซื้อซ้ำ — เส้นเดียวที่พิสูจน์ได้ด้วยข้อมูลทุกจุด");
}

// =====================================================================
// Slide 3 — B3 pain point 1: one-time buyers
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B3 · Pain point ที่ 1", "ลูกค้า 27.65% ซื้อครั้งเดียวแล้วไม่กลับมาอีกเลย");

  statCard(s, 0.6, 1.7, 2.85, 1.35, "27.65%", "ซื้อครั้งเดียว (1,618 ราย)", RED);
  statCard(s, 3.65, 1.7, 2.85, 1.35, "24.79%", "cohort 12 เดือนยืนยัน", RED);
  statCard(s, 6.7, 1.7, 2.85, 1.35, "56 วัน", "มัธยฐานถึงการซื้อครั้งที่ 2", NAVY);
  statCard(s, 9.75, 1.7, 2.95, 1.35, "11.4×", "ลูกค้าซื้อซ้ำสร้างรายได้มากกว่า", GREEN);

  const rows = tableOf(
    ["จำนวนครั้งที่สั่งซื้อ", "ลูกค้า", "% ลูกค้า", "% ยอดขาย"],
    [
      [{ text: "1 ครั้ง", color: RED }, "1,618", { text: "27.65%", color: RED, bold: true }, { text: "3.23%", color: RED, bold: true }],
      ["2 ครั้ง", "945", "16.15%", "4.70%"],
      ["3 ครั้ง", "659", "11.26%", "4.77%"],
      ["4–5 ครั้ง", "844", "14.42%", "7.45%"],
      ["6–10 ครั้ง", "922", "15.76%", "15.18%"],
      [{ text: "11+ ครั้ง", color: GREEN }, "864", { text: "14.76%", color: GREEN, bold: true }, { text: "64.67%", color: GREEN, bold: true }],
    ]
  );
  s.addTable(rows, {
    x: 0.6, y: 3.3, w: 7.3, h: 2.7,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [2.5, 1.4, 1.7, 1.7], rowH: 0.38, valign: "middle",
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.2, y: 3.3, w: 4.5, h: 2.7, rectRadius: 0.08,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText("กันข้อโต้แย้งไว้ก่อน", {
    x: 8.45, y: 3.45, w: 4.0, h: 0.4,
    fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0,
  });
  s.addText(
    "“ลูกค้าที่เพิ่งซื้อปลายปี 2011 ยังไม่ทันกลับมา จะนับว่าหายได้ยังไง”\n\n" +
      "จึงตัด cohort เฉพาะลูกค้าที่ซื้อครั้งแรกก่อน 9 ธ.ค. 2010 — ทุกคนมีเวลาเต็ม 12 เดือน\n" +
      "จาก 4,284 ราย มี 1,062 ราย (24.79%) ที่ไม่กลับมาเลย\n\n" +
      "ใกล้เคียง 27.65% → ไม่ใช่ผลจากการตัดช่วงเวลา",
    {
      x: 8.45, y: 3.9, w: 4.0, h: 1.95,
      fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.2, valign: "top", margin: 0,
    }
  );

  addFooter(s, "ที่มา: analysis/g1b.py — ลูกค้าที่ระบุตัวตนได้ 5,852 ราย (86.65% ของยอดขาย)");
}

// =====================================================================
// Slide 4 — B3 honest reading: heads vs money
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B3 · อ่านตัวเลขให้ตรง", "เยอะในเชิงจำนวนหัว แต่เล็กในเชิงเงิน");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.7, w: 5.9, h: 2.0, rectRadius: 0.1,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText("ลูกค้าซื้อครั้งเดียว", { x: 0.85, y: 1.85, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "27.65%", options: { fontSize: 30, bold: true, color: RED } },
    { text: "  ของจำนวนลูกค้า\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "3.23%", options: { fontSize: 30, bold: true, color: TEXT_MUTED } },
    { text: "  ของยอดขาย", options: { fontSize: 14, color: TEXT_MUTED } },
  ], { x: 0.85, y: 2.3, w: 5.4, h: 1.25, fontFace: THAI_BODY, lineSpacingMultiple: 1.15, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.7, w: 5.9, h: 2.0, rectRadius: 0.1,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText("ลูกค้าสั่ง 11+ ครั้ง", { x: 7.05, y: 1.85, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "14.76%", options: { fontSize: 30, bold: true, color: TEXT_MUTED } },
    { text: "  ของจำนวนลูกค้า\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "64.67%", options: { fontSize: 30, bold: true, color: GREEN } },
    { text: "  ของยอดขาย", options: { fontSize: 14, color: TEXT_MUTED } },
  ], { x: 7.05, y: 2.3, w: 5.4, h: 1.25, fontFace: THAI_BODY, lineSpacingMultiple: 1.15, margin: 0 });

  noteBar(s, 0.6, 3.95, 12.1, 0.85, [
    { text: "ถ้าแก้ปัญหาลูกค้าซื้อครั้งเดียวได้ทั้งหมด ก็ได้เงินเพิ่มไม่ถึง 4% — ", options: { bold: true, color: RED } },
    { text: "เงินจริงอยู่ที่ลูกค้าประจำ ความเสี่ยงที่แพงที่สุดจึงคือ “ลูกค้าประจำเงียบหาย” ไม่ใช่ “ลูกค้าขาจรไม่กลับมา”", options: {} },
  ]);

  const rows = tableOf(
    ["กลุ่มลูกค้า", "จำนวน", "% ยอดขาย", "เงียบ > 180 วัน", "ยอดขายที่กลุ่มเงียบถือครอง"],
    [
      [{ text: "สั่ง 6+ ครั้ง", color: NAVY }, "1,786", "79.84%", "205 ราย (11.48%)", { text: "£813,004  (4.66%)", color: RED, bold: true }],
      [{ text: "สั่ง 11+ ครั้ง", color: NAVY }, "864", "64.67%", "52 ราย (6.02%)", { text: "£475,808  (2.73%)", color: RED, bold: true }],
      [{ text: "ลูกค้าทั้งหมด", color: TEXT_MUTED }, "5,852", "100%", "2,378 ราย (40.64%)", { text: "13.49% ของยอดขาย", color: TEXT_MUTED }],
    ]
  );
  s.addTable(rows, {
    x: 0.6, y: 5.1, w: 12.1, h: 1.5,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [2.4, 1.8, 2.0, 2.6, 3.3], rowH: 0.37, valign: "middle",
  });

  addFooter(s, "“เงียบ > 180 วัน” ตั้งจากข้อมูลเอง: มัธยฐานถึงการซื้อครั้งที่ 2 = 56 วัน · P75 = 133 วัน");
}

// =====================================================================
// Slide 5 — B4 returns headline + the trap
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B4 · Pain point ที่ 2", "การคืนของ 7.59% เป็นตัวเลขที่ใช้ไม่ได้");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1,
    fill: { color: "FBE9E7" }, line: { color: RED, width: 1 },
  });
  s.addText([
    { text: "ถ้ารายงานแบบตรง ๆ\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "-£1,526,667.86  =  7.59%", options: { fontSize: 24, bold: true, color: RED } },
    { text: "\nของยอดขาย (ใบ C 8,292 ใบ / 19,494 แถว)", options: { fontSize: 12.5, color: TEXT_MUTED } },
  ], { x: 0.9, y: 1.75, w: 5.3, h: 1.4, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1,
    fill: { color: "EAF5EC" }, line: { color: GREEN, width: 1 },
  });
  s.addText([
    { text: "ตัวเลขที่ถูกต้อง — คืนสินค้าจริง\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "-£726,588.95  =  3.61%", options: { fontSize: 24, bold: true, color: GREEN } },
    { text: "\nของยอดขาย (คิดเป็น 47.59% ของยอดใบ C)", options: { fontSize: 12.5, color: TEXT_MUTED } },
  ], { x: 7.1, y: 1.75, w: 5.3, h: 1.4, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  s.addText("52.41% ของยอดใบ C ไม่ใช่การคืนสินค้าเลย — เป็นรายการบัญชีที่บังเอิญถูกบันทึกเป็นใบ C", {
    x: 0.6, y: 3.35, w: 12.1, h: 0.45,
    fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0,
  });

  const rows = tableOf(
    ["Top 5 รายการที่ถูก “คืน” มากที่สุดตามมูลค่า", "StockCode", "มูลค่า", "ใช่สินค้าไหม"],
    [
      ["Manual (รายการปรับปรุงด้วยมือ)", "M", "-£423,512.60", { text: "ไม่ใช่", color: RED, bold: true }],
      ["Amazon Fee", "AMAZONFEE", "-£294,772.71", { text: "ไม่ใช่", color: RED, bold: true }],
      ["PAPER CRAFT , LITTLE BIRDIE", "23843", "-£168,469.60", { text: "ใช่", color: GREEN, bold: true }],
      ["MEDIUM CERAMIC TOP STORAGE JAR", "23166", "-£77,479.64", { text: "ใช่", color: GREEN, bold: true }],
      ["Bank Charges", "BANK CHARGES", "-£33,997.91", { text: "ไม่ใช่", color: RED, bold: true }],
    ]
  );
  s.addTable(rows, {
    x: 0.6, y: 3.9, w: 12.1, h: 2.3,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [5.5, 2.4, 2.3, 1.9], rowH: 0.38, valign: "middle",
  });

  addFooter(s, "ประเด็นนี้อยู่บนสไลด์เพราะแสดงว่าทีมอ่านข้อมูลจริง ไม่ได้ groupby แล้วเชื่อผลทันที");
}

// =====================================================================
// Slide 6 — B4 concentration + returns are not a churn signal
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B4 · กระจุกตัว และความเข้าใจผิด", "การคืนของกระจุกที่คนไม่กี่ราย และไม่ใช่สัญญาณว่าจะเลิกซื้อ");

  statCard(s, 0.6, 1.7, 3.85, 1.4, "58.12%", "ของมูลค่าการคืน มาจากผู้คืน 1% แรก (25 ราย)", RED);
  statCard(s, 4.65, 1.7, 3.85, 1.4, "41.92%", "มาจาก 10 รายแรกเท่านั้น", RED);
  statCard(s, 8.7, 1.7, 4.0, 1.4, "-£431,531", "ยอดคืนที่ไม่มี Customer ID (750 แถว) — สอบกลับไม่ได้", TEXT_MUTED);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 3.35, w: 5.9, h: 2.4, rectRadius: 0.1,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText("“คืนของบ่อย = กำลังจะเลิกซื้อ” ?", {
    x: 0.85, y: 3.5, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0,
  });
  s.addText([
    { text: "ลูกค้าซื้อซ้ำ เคยคืนของ    ", options: { fontSize: 14, color: TEXT_DARK } },
    { text: "53.80%\n", options: { fontSize: 22, bold: true, color: NAVY } },
    { text: "ลูกค้าซื้อครั้งเดียว เคยคืนของ    ", options: { fontSize: 14, color: TEXT_DARK } },
    { text: "13.47%", options: { fontSize: 22, bold: true, color: TEXT_MUTED } },
  ], { x: 0.85, y: 4.0, w: 5.4, h: 1.1, fontFace: THAI_BODY, lineSpacingMultiple: 1.2, margin: 0 });
  s.addText("ข้อมูลบอกตรงข้ามกับสัญชาตญาณ — ลูกค้าประจำคืนของบ่อยกว่าเกือบ 4 เท่า เพราะซื้อบ่อยกว่า จึงมีโอกาสคืนมากกว่า", {
    x: 0.85, y: 5.05, w: 5.4, h: 0.6, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_MUTED, lineSpacingMultiple: 1.15, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 3.35, w: 5.9, h: 2.4, rectRadius: 0.1,
    fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 },
  });
  s.addText("สิ่งที่ห้ามเขียนบนสไลด์", {
    x: 7.05, y: 3.5, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: GOLD, margin: 0,
  });
  s.addText(
    "ห้ามสรุปว่า “การคืนของทำนายการเลิกซื้อ” — หลักฐานเบื้องต้นบอกว่าไม่จริง\n\n" +
      "เก็บไว้เป็นสมมติฐานที่จะทดสอบจริงใน Goal 2 ตอนทำ classification (G2-D3)\n\n" +
      "อีกเรื่อง: แถว Quantity ติดลบที่ไม่ใช่ใบ C 3,457 แถว มูลค่ารวม £0.00 และ 100% ไม่มี Customer ID → เป็นการตัดสต๊อกของเสีย (damaged, smashed, thrown away) ไม่ใช่การคืนจากลูกค้า",
    { x: 7.05, y: 3.95, w: 5.4, h: 1.7, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 }
  );

  addFooter(s, "อัตราคืนของ UK 7.71% vs ต่างประเทศ 6.85% — ไม่ต่างกันมาก ปัญหาไม่ได้อยู่ที่ตลาดใดตลาดหนึ่ง");
}

// =====================================================================
// Slide 7 — B5 Problem statement
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: -2.6, w: 6.0, h: 6.0, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("B5 · PROBLEM STATEMENT", {
    x: 0.7, y: 0.5, w: 11.9, h: 0.4,
    fontFace: THAI_BODY, fontSize: 14, bold: true, color: GOLD, charSpacing: 1.5, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 1.1, w: 11.9, h: 2.75, rectRadius: 0.1,
    fill: { color: "263480" }, line: { color: GOLD, width: 1.5 },
  });
  s.addText(
    "ตลอด 2 ปีของข้อมูล ลูกค้าที่ระบุตัวตนได้ 5,852 ราย มีถึง 27.65% (1,618 ราย) ที่ซื้อเพียงครั้งเดียวแล้วไม่กลับมาอีก " +
      "และ 40.64% (2,378 ราย) เงียบหายเกิน 180 วัน — ในจำนวนนี้มีลูกค้าประจำที่สั่งซื้อตั้งแต่ 6 ครั้งขึ้นไปรวม 205 ราย " +
      "ซึ่งถือครองยอดขาย £813,004 (4.66% ของยอดขายจากลูกค้าที่ระบุตัวตนได้) — โดยธุรกิจไม่มีขั้นตอนใดในระบบที่ตรวจจับ " +
      "การเงียบหายนี้ได้ก่อนที่ลูกค้าจะหายไปแล้ว ทั้งที่ลูกค้าซื้อซ้ำสร้างรายได้เฉลี่ยต่อรายสูงกว่าลูกค้าซื้อครั้งเดียว 11.4 เท่า",
    {
      x: 1.05, y: 1.25, w: 11.2, h: 2.45,
      fontFace: THAI_HEAD, fontSize: 19, color: WHITE, valign: "middle", lineSpacingMultiple: 1.3, margin: 0,
    }
  );

  const parts = [
    ["อาการ", "ซื้อครั้งเดียวแล้วหาย / เงียบเกิน 180 วัน โดยระบบไม่รู้ตัว"],
    ["ขนาด", "27.65% (1,618 ราย) · 40.64% (2,378 ราย) · 205 รายในกลุ่มลูกค้าประจำ"],
    ["ผลกระทบ", "£813,004 = 4.66% ของยอดขาย + เสียโอกาสรายได้ที่สูงกว่า 11.4 เท่า"],
  ];
  let py = 4.15;
  parts.forEach(([tag, text]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: py, w: 1.7, h: 0.62, rectRadius: 0.08,
      fill: { color: GOLD }, line: { type: "none" },
    });
    s.addText(tag, {
      x: 0.7, y: py, w: 1.7, h: 0.62,
      fontFace: THAI_HEAD, fontSize: 15, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0,
    });
    s.addText(text, {
      x: 2.6, y: py, w: 10.0, h: 0.62,
      fontFace: THAI_BODY, fontSize: 15, color: ICE, valign: "middle", margin: 0,
    });
    py += 0.72;
  });

  s.addText(
    "ทำไมแกนเป็น “ลูกค้าหาย” ไม่ใช่ “การคืนของ”: การคืนสินค้าจริง £726,589 กระจุกอยู่ที่ลูกค้าเพียง 25 ราย " +
      "แก้ได้ด้วยการคุยกับลูกค้ารายใหญ่ ไม่ต้องใช้ระบบวิเคราะห์ — ส่วนการเงียบหายกระจายทั่วฐานลูกค้า มองด้วยตาไม่เห็น ต้องใช้การวิเคราะห์ข้อมูลถึงจะเจอ",
    { x: 0.7, y: 6.5, w: 11.9, h: 0.7, fontFace: THAI_BODY, fontSize: 13, italic: true, color: "9AA8D6", lineSpacingMultiple: 1.2, margin: 0 }
  );
}

// =====================================================================
// Slide 8 — B6 Customer Journey Map
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B6 · Customer Journey Map", "ลูกค้าหลุดตรงไหน และหลุดไปกี่ราย");

  const stages = [
    "1. รู้จัก & สั่งครั้งแรก",
    "2. รับของครั้งแรก",
    "3. กลับมาซื้อซ้ำ",
    "4. คืนของ / มีปัญหา",
    "5. เงียบหาย",
  ];
  const grid = [
    ["STEPS", "เลือกสินค้า → สั่งซื้อ → ออกใบแจ้งหนี้", "รับของ → ตรวจของ", "สั่งรอบถัดไป (มัธยฐาน 56 วัน)", "แจ้งคืน → ออกใบ C → คืนเงิน", "ไม่มีคำสั่งซื้ออีก"],
    ["THOUGHTS", "“ราคาโอเค ลองสั่งดูก่อน”", "“ของครบมั้ย ตรงรูปมั้ย”", "“เจ้านี้ใช้ได้ สั่งเพิ่มเลย”", "“ของไม่ครบ/พัง ต้องแจ้งใคร”", "(ไม่มีเสียง — ลูกค้าไม่บอกลา)"],
    ["TOUCHPOINTS", "เว็บ / แคตตาล็อก · ใบสั่งซื้อ", "พัสดุ · POSTAGE", "ใบสั่งซื้อรอบใหม่", "ใบลดหนี้ (Invoice C)", "❌ ไม่มี touchpoint ใด ๆ"],
    ["ACTORS", "ลูกค้า · ฝ่ายขาย", "ขนส่ง · คลัง", "ลูกค้า · ฝ่ายขาย", "ฝ่ายบริการ · บัญชี", "— ไม่มีใครรับผิดชอบ"],
    ["EMOTIONS", "🙂 สนใจ", "😐 เฉย ๆ / 🙁 ถ้าของมีปัญหา", "🙂 พอใจ", "😠 หงุดหงิด → 🙂 ถ้าแก้ได้", "😶 เฉยชา แล้วหายไป"],
  ];

  const header = [{ text: "STAGE", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 11.5 } }].concat(
    stages.map((t, i) => ({
      text: t,
      options: { bold: true, color: i === 4 ? "FFD9D2" : WHITE, fill: { color: i === 4 ? "8A2E22" : NAVY }, fontSize: 11.5, align: "center" },
    }))
  );
  const body = grid.map((r, i) =>
    r.map((cell, j) => ({
      text: cell,
      options: {
        bold: j === 0,
        color: j === 0 ? NAVY : j === 5 ? RED : TEXT_MUTED,
        fill: { color: j === 0 ? "DCE6F8" : i % 2 === 0 ? WHITE : "EAF0FC" },
        fontSize: j === 0 ? 11 : 10.5,
        align: j === 0 ? "left" : "left",
      },
    }))
  );
  const dropRow = [
    { text: "📉 ที่หลุด", options: { bold: true, color: NAVY, fill: { color: "DCE6F8" }, fontSize: 11 } },
    { text: "ลูกค้าที่มี ID 5,852 ราย", options: { color: TEXT_MUTED, fill: { color: "FFF4E0" }, fontSize: 10.5 } },
    { text: "—", options: { color: TEXT_MUTED, fill: { color: "FFF4E0" }, fontSize: 10.5, align: "center" } },
    { text: "หลุด 1,618 ราย (27.65%) ไม่กลับมาเลย · cohort ยืนยัน 24.79%", options: { bold: true, color: RED, fill: { color: "FFF4E0" }, fontSize: 10.5 } },
    { text: "2,496 ราย (42.65%) เคยคืนของ · คืนสินค้าจริง £726,589 (3.61%)", options: { color: TEXT_DARK, fill: { color: "FFF4E0" }, fontSize: 10.5 } },
    { text: "2,378 ราย (40.64%) เงียบเกิน 180 วัน = 13.49% ของยอดขาย", options: { bold: true, color: RED, fill: { color: "FFE8E3" }, fontSize: 10.5 } },
  ];

  s.addTable([header, ...body, dropRow], {
    x: 0.45, y: 1.6, w: 12.45, h: 4.3,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [1.35, 2.22, 2.22, 2.22, 2.22, 2.22], valign: "middle",
  });

  noteBar(s, 0.45, 6.05, 12.45, 0.85, [
    { text: "จุดที่คนหลุดมากที่สุด: stage 2 → 3 ", options: { bold: true, color: RED } },
    { text: "(รับของครั้งแรกแล้วไม่กลับมา 1,618 ราย)  ·  ", options: {} },
    { text: "จุดที่แพงที่สุด: stage 5 ", options: { bold: true, color: RED } },
    { text: "ซึ่งไม่มี touchpoint และไม่มี actor รับผิดชอบเลย — ตรงกับ feedback loop ที่ขาดใน B1", options: {} },
  ]);

  addFooter(s, "ฟอร์แมตตามภาพตัวอย่างในโจทย์: STAGE → STEPS → THOUGHTS → TOUCHPOINTS → ACTORS → EMOTIONS");
}

// =====================================================================
// Slide 9 — limitations + what's next
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: 4.4, w: 5.6, h: 5.6, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("สรุป B และข้อจำกัดที่ต้องพูดเอง", {
    x: 0.7, y: 0.6, w: 11.9, h: 0.8,
    fontFace: THAI_HEAD, fontSize: 32, bold: true, color: WHITE, margin: 0,
  });

  const cards = [
    ["ข้อจำกัดของข้อมูล", "ตัวเลขระดับลูกค้าทั้งหมดคำนวณจากแถวที่มี Customer ID เท่านั้น — Customer ID หาย 22.77% ของแถว คิดเป็น 13.35% ของยอดขาย ดังนั้นครอบคลุม 86.65% ของยอดขาย ไม่ใช่ 100%"],
    ["ส่งต่อให้ G1-C (BSC)", "baseline พร้อมใช้: repeat rate 72.35% · one-time 27.65% · silent >180d 40.64% · return rate สินค้าจริง 3.61% · มัธยฐานถึงการซื้อครั้งที่ 2 = 56 วัน"],
    ["ส่งต่อให้ G1-D4 และ Goal 2", "D4 ต้องตัดสินใจ 3 เรื่อง: แถวตัดสต๊อก 3,457 แถว · StockCode ที่ไม่ใช่สินค้าในใบ C £800,079 · แถวไม่มี Customer ID 22.77% — และ G2-D3 ต้องทดสอบว่าการคืนของทำนายการเลิกซื้อได้จริงไหม"],
  ];
  let cy = 1.7;
  cards.forEach(([title, body], i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: cy, w: 11.9, h: 1.5, rectRadius: 0.1,
      fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
    });
    iconCircle(s, 1.0, cy + 0.45, 0.6, String(i + 1), GOLD, NAVY);
    s.addText(title, {
      x: 1.85, y: cy + 0.18, w: 10.4, h: 0.4,
      fontFace: THAI_HEAD, fontSize: 17, bold: true, color: GOLD, margin: 0,
    });
    s.addText(body, {
      x: 1.85, y: cy + 0.58, w: 10.4, h: 0.8,
      fontFace: THAI_BODY, fontSize: 13, color: ICE, lineSpacingMultiple: 1.2, valign: "top", margin: 0,
    });
    cy += 1.65;
  });

  addFooter(s, "ทุกตัวเลขในเด็คนี้ reproduce ได้: unzip -o data/online_retail_II.csv.zip -d data && python3 analysis/g1b.py", true);
}

pres.writeFile({ fileName: "G1-B-slides.pptx" }).then(() => {
  console.log("done");
});
