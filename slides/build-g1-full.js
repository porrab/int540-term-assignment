// G1 combined deck — one continuous PowerPoint for Goal 1: A + B + C + D + closing.
// Content is the same as build.js / build-g1b.js / build-g1c.js / build-g1d.js (same
// palette/helpers), minus each section's own title/closing slide, plus section dividers
// and a single closing summary at the very end so it reads as one presentation.
//
//   npm install && node build-g1-full.js   ->  G1-slides.pptx

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

// ---------- helpers (identical across all G1 decks) ----------
function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, section, dark) {
  slide.addText(label, {
    x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 1.6, h: 0.3,
    fontFace: THAI_BODY, fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0,
  });
  slide.addText(`${section} · INT 540 Data Analytics`, {
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

function sectionDivider(kicker, title, subtitle, footNote) {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.4, y: -2.4, w: 6.2, h: 6.2, fill: { color: "263480" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.5, y: 4.8, w: 5.4, h: 5.4, fill: { color: "263480" }, line: { type: "none" } });
  s.addText(kicker, {
    x: 0.9, y: 2.9, w: 11.5, h: 0.45,
    fontFace: THAI_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0,
  });
  s.addText(title, {
    x: 0.9, y: 3.4, w: 11.5, h: 1.15,
    fontFace: THAI_HEAD, fontSize: 42, bold: true, color: WHITE, margin: 0,
  });
  s.addText(subtitle, {
    x: 0.9, y: 4.5, w: 11.2, h: 0.55,
    fontFace: THAI_BODY, fontSize: 17, color: ICE, margin: 0,
  });
  if (footNote) {
    s.addText(footNote, {
      x: 0.9, y: 6.75, w: 11.2, h: 0.4,
      fontFace: THAI_BODY, fontSize: 12.5, color: "9AA8D6", margin: 0,
    });
  }
}

// =====================================================================
// 0. Deck title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: "263480" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.4, y: 4.6, w: 5.2, h: 5.2, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("TERM ASSIGNMENT · GOAL 1", {
    x: 0.9, y: 1.75, w: 11.5, h: 0.45,
    fontFace: THAI_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0,
  });
  s.addText("Identify Business Problems, Data and Prospective Solution", {
    x: 0.9, y: 2.25, w: 11.5, h: 1.3,
    fontFace: THAI_HEAD, fontSize: 38, bold: true, color: WHITE, margin: 0,
  });
  s.addText("A: บริษัท+กลยุทธ์ · B: ปัญหาจากข้อมูลจริง · C: Balanced Scorecard · D: ข้อมูล+Data Model+SQL", {
    x: 0.9, y: 3.35, w: 11.2, h: 0.6,
    fontFace: THAI_BODY, fontSize: 17, color: ICE, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 4.35, w: 10.6, h: 0.9, rectRadius: 0.1,
    fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
  });
  s.addText([
    { text: "Dataset: ", options: { bold: true, color: GOLD } },
    { text: "Online Retail II — UCI ML Repository #502  ·  1,067,371 แถว  ·  2009-12-01 ถึง 2011-12-09  ·  ฐานคำนวณ 1,037,007 แถว £20,121,372.19", options: { color: WHITE } },
  ], {
    x: 1.15, y: 4.35, w: 10.2, h: 0.9,
    fontFace: THAI_BODY, fontSize: 13.5, valign: "middle", margin: 0,
  });

  const sections = [
    ["A", "เลือกบริษัทและวิจัยกลยุทธ์"],
    ["B", "Systems Thinking → Problem Statement"],
    ["C", "Balanced Scorecard"],
    ["D", "EDA + Data Model + SQL"],
  ];
  let sx = 0.9;
  sections.forEach(([tag, label]) => {
    iconCircle(s, sx, 5.55, 0.5, tag, GOLD, NAVY);
    s.addText(label, {
      x: sx - 0.35, y: 6.1, w: 3.0, h: 0.65,
      fontFace: THAI_BODY, fontSize: 11, color: ICE, align: "center", lineSpacingMultiple: 1.1, margin: 0,
    });
    sx += 2.85;
  });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision · นำเสนอ 1 ต.ค. 2569", {
    x: 0.9, y: 7.05, w: 11.2, h: 0.35,
    fontFace: THAI_BODY, fontSize: 12.5, color: "9AA8D6", margin: 0,
  });
}

// =====================================================================
// Section divider — A
// =====================================================================
sectionDivider(
  "ส่วนที่ 1 · G1-A",
  "เลือกบริษัทและวิจัยกลยุทธ์",
  "โปรไฟล์บริษัทจากข้อมูลจริง · Five Forces / TOWS / Value Chain · การแบ่งกลุ่มลูกค้า"
);

// ---- A1 Company Profile ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A1 · โปรไฟล์บริษัท", "ร้านค้าออนไลน์ขายของขวัญสัญชาติอังกฤษ");

  s.addText(
    "บริษัทสมมติที่สร้างจาก dataset: ร้านค้าออนไลน์ขายของขวัญ/ของแต่งบ้านแบบ all-occasion " +
      "gift-ware ไม่มีหน้าร้าน (non-store retailer) ขายทั้งลูกค้าปลีก (ซื้อเป็นของขวัญ) และลูกค้าขายส่ง " +
      "(ร้านค้าย่อย/ผู้จัดจำหน่ายซื้อไปขายต่อ) ฐานลูกค้าหลักอยู่ในสหราชอาณาจักร แต่ส่งขายไปทั่วยุโรปและอีก" +
      "หลายทวีป ช่วงข้อมูลครอบคลุมเทศกาลคริสต์มาส 2 รอบ ซึ่งเป็นช่วงพีคตามธรรมชาติของธุรกิจของขวัญ",
    { x: 0.6, y: 1.65, w: 6.6, h: 3.1, fontFace: THAI_BODY, fontSize: 16, color: TEXT_DARK, align: "left", valign: "top", lineSpacingMultiple: 1.35, margin: 0 }
  );

  const traits = [
    ["1", "Non-store retailer — ขายออนไลน์ล้วน ไม่มีหน้าร้านจริง"],
    ["2", "All-occasion gift-ware — สินค้าของขวัญ/ของแต่งบ้านหลากหลาย SKU"],
    ["3", "Dual channel — ลูกค้าปลีกรายย่อย + ลูกค้าขายส่ง (wholesaler) ในฐานเดียวกัน"],
    ["4", "UK-centric แต่ international — ขายในและนอกสหราชอาณาจักร"],
  ];
  let ty = 1.7;
  traits.forEach(([n, text]) => {
    iconCircle(s, 7.55, ty, 0.5, n, GOLD, NAVY);
    s.addText(text, { x: 8.2, y: ty - 0.05, w: 4.6, h: 0.65, fontFace: THAI_BODY, fontSize: 13.5, color: TEXT_DARK, valign: "middle", margin: 0, lineSpacingMultiple: 1.1 });
    ty += 0.85;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.05, w: 6.6, h: 1.55, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText([
    { text: "ทำไมต้องเลือกบริษัทแบบนี้:  ", options: { bold: true, color: GOLD } },
    { text: "dataset มีตัวเลขธุรกรรมจริงครบทุกด้าน (ราคา ปริมาณ ประเทศ วันที่ ลูกค้า) พอสำหรับพิสูจน์โปรไฟล์และวางกลยุทธ์ด้วยหลักฐาน ไม่ใช่การเดา", options: { color: WHITE } },
  ], { x: 0.85, y: 5.05, w: 6.1, h: 1.55, fontFace: THAI_BODY, fontSize: 13.5, valign: "middle", align: "left", lineSpacingMultiple: 1.25, margin: 0 });

  addFooter(s, "A1 — Company Profile", "G1-A");
}

// ---- A2 Evidence numbers ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A2 · พิสูจน์โปรไฟล์ด้วยตัวเลขจริง", "ตัวเลขจากไฟล์ข้อมูล ไม่ใช่การอ้างลอย ๆ");

  const stats = [["£20.12M", "ยอดขายรวม (สุทธิ)"], ["5,852", "ลูกค้าที่รู้ตัวตน"], ["4,898", "SKU ที่ขายจริง"], ["43", "ประเทศที่มีคำสั่งซื้อ"]];
  const cardW = 2.68, gap = 0.18;
  let cx = 0.6;
  stats.forEach(([big, small]) => { statCard(s, cx, 1.65, cardW, 1.25, big, small); cx += cardW + gap; });

  s.addText("สัดส่วนยอดขาย: UK vs ต่างประเทศ", { x: 0.6, y: 3.15, w: 5.6, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: TEXT_DARK, margin: 0 });
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Revenue Share", labels: ["United Kingdom", "ต่างประเทศ (42 ประเทศ)"], values: [85.71, 14.29] }], {
    x: 0.5, y: 3.55, w: 5.8, h: 3.35, chartColors: [NAVY, GOLD], showLegend: true, legendPos: "b", legendColor: TEXT_DARK, legendFontSize: 12,
    showTitle: false, showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 12, dataLabelFormatCode: '0.0"%"', holeSize: 55, showPercent: false,
  });

  s.addText("ยอดขาย 5 ตลาดต่างประเทศสูงสุด (£)", { x: 6.7, y: 3.15, w: 6, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: TEXT_DARK, margin: 0 });
  const rows = [["EIRE (ไอร์แลนด์)", "628,928.63"], ["Netherlands", "549,952.66"], ["Germany", "388,829.75"], ["France", "316,948.80"], ["Australia", "168,484.66"]];
  s.addTable([
    [{ text: "ประเทศ", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } }, { text: "ยอดขาย (£)", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, align: "right" } }],
    ...rows.map(([c, v], i) => [
      { text: c, options: { color: TEXT_DARK, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 13 } },
      { text: v, options: { color: TEXT_DARK, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 13, align: "right" } },
    ]),
  ], { x: 6.7, y: 3.6, w: 6.0, h: 2.7, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.7, 2.3], rowH: 0.45, valign: "middle" });

  s.addText("หมายเหตุ: ฐานคำนวณ = ตัดแถวยกเลิก + Quantity/Price ≤ 0 + StockCode ที่ไม่ใช่สินค้าจริงออก (ดู G1-D1–D3)", {
    x: 6.7, y: 6.4, w: 6.0, h: 0.5, fontFace: THAI_BODY, fontSize: 11, italic: true, color: TEXT_MUTED, margin: 0,
  });

  addFooter(s, "A2 — Evidence Numbers", "G1-A");
}

// ---- A3 (1/2) Five Forces + Strategy choice ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A3 · ระบุกลยุทธ์ธุรกิจ (1/2)", "Five Forces → เลือก Competitive Strategy");

  const forces = [
    ["Buyer Power", "กลาง–สูง", "ลูกค้ากระจายตัวมาก (5,852 ราย) แต่ switching cost ต่ำในตลาดของขวัญออนไลน์"],
    ["Supplier Power", "ต่ำ–กลาง", "ไม่มีข้อมูลซัพพลายเออร์ในไฟล์ แต่สินค้าทั่วไปน่าจะมีซัพพลายเออร์ทดแทนได้หลายราย"],
    ["Threat of Substitutes", "สูง", "ของขวัญซื้อได้จากร้านค้าปลีก ห้างสรรพสินค้า และแพลตฟอร์มอีคอมเมิร์ซอื่น"],
    ["Threat of New Entrants", "สูง", "ธุรกิจ non-store retail มี entry barrier ต่ำ ไม่ต้องมีหน้าร้าน"],
    ["Rivalry", "สูง", "คู่แข่งจำนวนมาก สินค้า/SKU คล้ายกันทำได้ง่าย"],
  ];
  const levelColor = { "กลาง–สูง": "B98A2E", "ต่ำ–กลาง": "5B8A5E", สูง: "B3402F" };
  const header = [
    { text: "แรงกดดัน", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } },
    { text: "ระดับ", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, align: "center" } },
    { text: "อ่านจาก dataset", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } },
  ];
  const body = forces.map(([f, lvl, ev], i) => [
    { text: f, options: { color: TEXT_DARK, bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5 } },
    { text: lvl, options: { color: levelColor[lvl] || TEXT_DARK, bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5, align: "center" } },
    { text: ev, options: { color: TEXT_MUTED, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12 } },
  ]);
  s.addTable([header, ...body], { x: 0.6, y: 1.65, w: 8.0, h: 3.9, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.1, 1.1, 4.8], rowH: 0.65, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.9, y: 1.65, w: 3.85, h: 3.9, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("กลยุทธ์ที่เลือก", { x: 9.15, y: 1.85, w: 3.4, h: 0.4, fontFace: THAI_BODY, fontSize: 13, bold: true, color: GOLD, charSpacing: 1, margin: 0 });
  s.addText("Cost Leadership", { x: 9.15, y: 2.2, w: 3.4, h: 0.55, fontFace: THAI_HEAD, fontSize: 24, bold: true, color: WHITE, margin: 0 });
  s.addText("+ Differentiation เสริม", { x: 9.15, y: 2.75, w: 3.4, h: 0.4, fontFace: THAI_BODY, fontSize: 15, color: ICE, margin: 0 });
  s.addText(
    "Broad market + บิลขนาดใหญ่ (>12 หน่วย) สร้างรายได้ถึง 99.52% → เน้นต้นทุนต่ำเป็นแกน " +
      "โดยมี SKU ดีไซน์เฉพาะตัวเสริมสำหรับกลุ่มปลีกที่จ่ายต่อหน่วยสูงกว่า (ดู A4)",
    { x: 9.15, y: 3.3, w: 3.4, h: 2.1, fontFace: THAI_BODY, fontSize: 13, color: WHITE, lineSpacingMultiple: 1.3, margin: 0 }
  );

  addFooter(s, "A3 — Five Forces & Strategy Choice", "G1-A");
}

// ---- A3 (2/2) TOWS + Value Chain ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A3 · ระบุกลยุทธ์ธุรกิจ (2/2)", "TOWS ที่ผูกกับตัวเลขจริง + Value Chain");

  s.addText("TOWS — ตัวอย่าง 2 คู่ที่ผูกกับตัวเลขจริง", { x: 0.6, y: 1.6, w: 6.2, h: 0.35, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, margin: 0 });

  function towsCard(x, y, tag, title, body, color) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 6.0, h: 1.95, rectRadius: 0.08, fill: { color: CARD_BG }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: y + 0.2, w: 0.55, h: 0.55, fill: { color }, line: { type: "none" } });
    s.addText(tag, { x: x + 0.22, y: y + 0.2, w: 0.55, h: 0.55, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: x + 0.95, y: y + 0.18, w: 4.85, h: 0.35, fontFace: THAI_HEAD, fontSize: 13.5, bold: true, color: TEXT_DARK, margin: 0 });
    s.addText(body, { x: x + 0.22, y: y + 0.85, w: 5.6, h: 1.0, fontFace: THAI_BODY, fontSize: 12, color: TEXT_MUTED, lineSpacingMultiple: 1.25, margin: 0 });
  }
  towsCard(0.6, 2.0, "SO", "Strength × Opportunity", "ใช้ SKU ที่กว้าง (4,898 รายการ) จับโอกาสตามฤดูกาล — ข้อมูลครอบคลุม 2 เทศกาลคริสต์มาสเต็ม จึงควรทำ seasonal bundle/promotion ล่วงหน้าให้ตรงพีค", "5B8A5E");
  towsCard(0.6, 4.1, "WT", "Weakness × Threat", "ลูกค้าที่ซื้อครั้งเดียวแล้วหายสูงถึง 27.65% ขณะที่ threat of substitutes/new entrants สูง → ต้องมีกลยุทธ์ retention ก่อนคู่แข่งแย่งลูกค้ากลุ่มนี้ (ผูกต่อ G1-B)", "B3402F");

  s.addText("Value Chain (Porter) — ข้อมูลครอบคลุมตรงไหนบ้าง", { x: 6.95, y: 1.6, w: 5.8, h: 0.35, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, margin: 0 });
  const vcRows = [
    [{ text: "กิจกรรม", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } }, { text: "มีข้อมูลใน dataset?", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "center" } }],
    [{ text: "Outbound Logistics (Invoice/InvoiceDate)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 12 } }, { text: "✓ มี", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 12, align: "center" } }],
    [{ text: "Marketing & Sales (Price/Qty/Country)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 12 } }, { text: "✓ มี", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 12, align: "center" } }],
    [{ text: "Inbound Logistics (จัดซื้อเข้าคลัง)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 12 } }, { text: "✗ ไม่มี", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 12, align: "center" } }],
    [{ text: "Operations (ผลิต/แพ็กสินค้า)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 12 } }, { text: "✗ ไม่มี", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 12, align: "center" } }],
  ];
  s.addTable(vcRows, { x: 6.95, y: 2.0, w: 5.8, h: 2.3, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [4.0, 1.8], rowH: [0.5, 0.45, 0.45, 0.45, 0.45], valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.95, y: 4.55, w: 5.8, h: 1.5, rectRadius: 0.08, fill: { color: "EAF0FC" }, line: { type: "none" } });
  s.addText([
    { text: "ข้อจำกัดที่ต้องพูดตรง ๆ ตอนนำเสนอ: ", options: { bold: true, color: NAVY } },
    { text: "dataset ไม่มีข้อมูลต้นทุน/การผลิต — Inbound Logistics และ Operations ประเมินไม่ได้จากไฟล์นี้ ไม่ใช่การสมมติขึ้นมา", options: { color: TEXT_DARK } },
  ], { x: 7.2, y: 4.55, w: 5.3, h: 1.5, fontFace: THAI_BODY, fontSize: 12.5, valign: "middle", lineSpacingMultiple: 1.3, margin: 0 });

  addFooter(s, "A3 — TOWS & Value Chain", "G1-A");
}

// ---- A4 Retail vs Wholesale ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A4 · ลูกค้าสองกลุ่มจากขนาดตะกร้า", "เกณฑ์: 12 หน่วยต่อบิล (1 โหล — ขั้นต่ำการขายส่งทั่วไป)");

  s.addChart(pres.charts.BAR, [
    { name: "% ของบิล", labels: ["ลูกค้าปลีก (≤12 หน่วย)", "ลูกค้าขายส่ง (>12 หน่วย)"], values: [7.17, 92.83] },
    { name: "% ของยอดขาย", labels: ["ลูกค้าปลีก (≤12 หน่วย)", "ลูกค้าขายส่ง (>12 หน่วย)"], values: [0.48, 99.52] },
  ], {
    x: 0.5, y: 1.7, w: 7.1, h: 4.55, barDir: "col", barGrouping: "clustered", chartColors: ["8FA8E8", GOLD], chartColorsOpacity: 100,
    showTitle: true, title: "สัดส่วนบิลเทียบสัดส่วนยอดขาย (%)", titleFontSize: 14, titleColor: TEXT_DARK,
    showLegend: true, legendPos: "b", legendColor: TEXT_DARK, legendFontSize: 12, showValue: true, dataLabelColor: TEXT_DARK, dataLabelFontSize: 11,
    dataLabelFormatCode: '0.0"%"', dataLabelPosition: "outEnd", catAxisLabelColor: TEXT_DARK, catAxisLabelFontSize: 12,
    valAxisLabelColor: TEXT_MUTED, valAxisLabelFontSize: 10, valGridLine: { color: "E2E9F7", size: 0.75 }, catGridLine: { style: "none" },
  });

  const rows2 = [
    [{ text: "กลุ่ม", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } }, { text: "บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } }, { text: "% บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } }, { text: "% ยอดขาย", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } }, { text: "มูลค่าเฉลี่ย/บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } }],
    [{ text: "ลูกค้าปลีก", options: { color: TEXT_DARK, bold: true, fill: { color: WHITE }, fontSize: 12.5 } }, { text: "2,834", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } }, { text: "7.17%", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } }, { text: "0.48%", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } }, { text: "£34.12", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } }],
    [{ text: "ลูกค้าขายส่ง", options: { color: TEXT_DARK, bold: true, fill: { color: "EAF0FC" }, fontSize: 12.5 } }, { text: "36,683", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } }, { text: "92.83%", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } }, { text: "99.52%", options: { color: GOLD, bold: true, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } }, { text: "£545.88", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } }],
  ];
  s.addTable(rows2, { x: 7.85, y: 1.7, w: 4.9, h: 1.55, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [1.1, 0.85, 0.95, 1.0, 1.0], rowH: 0.52, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.85, y: 3.5, w: 4.9, h: 1.55, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("มูลค่าเฉลี่ยต่อบิลของกลุ่มขายส่ง", { x: 8.1, y: 3.62, w: 4.4, h: 0.35, fontFace: THAI_BODY, fontSize: 12.5, color: ICE, margin: 0 });
  s.addText("สูงกว่ากลุ่มปลีกเกือบ 16 เท่า", { x: 8.1, y: 3.95, w: 4.4, h: 0.55, fontFace: THAI_HEAD, fontSize: 21, bold: true, color: GOLD, margin: 0 });
  s.addText("(£545.88 เทียบ £34.12) และกลุ่มขายส่งสร้างรายได้เกือบทั้งหมดของบริษัท", { x: 8.1, y: 4.5, w: 4.4, h: 0.5, fontFace: THAI_BODY, fontSize: 12, color: WHITE, lineSpacingMultiple: 1.2, margin: 0 });

  s.addText("ข้อจำกัด: แบ่งกลุ่มระดับ \"บิล\" ไม่ใช่ระดับ \"ลูกค้า\" — การแบ่งกลุ่มลูกค้าอย่างเป็นทางการ (RFM + clustering) จะทำใน Goal 2 (G2-D2)", {
    x: 7.85, y: 5.25, w: 4.9, h: 0.95, fontFace: THAI_BODY, fontSize: 11, italic: true, color: TEXT_MUTED, lineSpacingMultiple: 1.25, margin: 0,
  });

  addFooter(s, "A4 — Retail vs Wholesale Segmentation", "G1-A");
}

// =====================================================================
// Section divider — B
// =====================================================================
sectionDivider(
  "ส่วนที่ 2 · G1-B",
  "ปัญหาคืออะไร และรู้ได้ยังไงว่าเป็นปัญหา",
  "Systems Thinking · Pain point จากข้อมูลจริง · Problem Statement · Customer Journey Map",
  "ฐานคำนวณ: แถวขายจริง 1,037,007 แถว · £20,121,372.19 · ลูกค้าที่ระบุตัวตนได้ 5,852 ราย (86.65% ของยอดขาย)"
);

// ---- B1 Systems Thinking ----
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
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: b.x, y: 1.75, w: 3.5, h: 2.5, rectRadius: 0.1, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
    s.addText(b.title, { x: b.x, y: 1.85, w: 3.5, h: 0.4, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, align: "center", charSpacing: 1.5, margin: 0 });
    s.addText(b.items.map((t) => ({ text: t, options: { breakLine: true } })), { x: b.x + 0.28, y: 2.3, w: 3.0, h: 1.85, fontFace: THAI_BODY, fontSize: 13, color: TEXT_DARK, bullet: { code: "2022" }, lineSpacingMultiple: 1.3, margin: 0 });
  });
  [4.25, 8.55].forEach((x) => {
    s.addText("→", { x, y: 2.65, w: 0.7, h: 0.7, fontFace: THAI_HEAD, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.55, w: 12.1, h: 0.95, rectRadius: 0.1, fill: { color: "FBE9E7" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  s.addText([
    { text: "FEEDBACK LOOP ที่ขาด — ", options: { bold: true, color: RED } },
    { text: "ระบบวัดได้แค่ “ขายได้เท่าไร” แต่ไม่มีขั้นตอนใดป้อนกลับว่า ลูกค้าคนไหนกำลังเงียบ หรือ การคืนของกระจุกที่ใคร", options: { color: TEXT_DARK } },
  ], { x: 0.9, y: 4.55, w: 11.5, h: 0.95, fontFace: THAI_BODY, fontSize: 15, valign: "middle", margin: 0 });

  noteBar(s, 0.6, 5.75, 12.1, 0.85, [
    { text: "เมื่อไม่มี feedback ระบบจึงแก้ตัวเองไม่ได้ ", options: { bold: true } },
    { text: "— นี่คือรากของ pain point ทั้ง 2 ข้อใน B3/B4 และตรงกับคาบ 13 ส.ค.: ข้อมูลมีอยู่แล้ว แต่ไม่ถูกแปลงเป็น information ที่ใช้ตัดสินใจ", options: {} },
  ]);

  addFooter(s, "ขอบเขตที่เลือก (B2): customer journey ของลูกค้าที่ซื้อซ้ำ — เส้นเดียวที่พิสูจน์ได้ด้วยข้อมูลทุกจุด", "G1-B");
}

// ---- B3 pain point 1: one-time buyers ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B3 · Pain point ที่ 1", "ลูกค้า 27.65% ซื้อครั้งเดียวแล้วไม่กลับมาอีกเลย");

  statCard(s, 0.6, 1.7, 2.85, 1.35, "27.65%", "ซื้อครั้งเดียว (1,618 ราย)", RED);
  statCard(s, 3.65, 1.7, 2.85, 1.35, "24.79%", "cohort 12 เดือนยืนยัน", RED);
  statCard(s, 6.7, 1.7, 2.85, 1.35, "56 วัน", "มัธยฐานถึงการซื้อครั้งที่ 2", NAVY);
  statCard(s, 9.75, 1.7, 2.95, 1.35, "11.4×", "ลูกค้าซื้อซ้ำสร้างรายได้มากกว่า", GREEN);

  const rows = tableOf(["จำนวนครั้งที่สั่งซื้อ", "ลูกค้า", "% ลูกค้า", "% ยอดขาย"], [
    [{ text: "1 ครั้ง", color: RED }, "1,618", { text: "27.65%", color: RED, bold: true }, { text: "3.23%", color: RED, bold: true }],
    ["2 ครั้ง", "945", "16.15%", "4.70%"],
    ["3 ครั้ง", "659", "11.26%", "4.77%"],
    ["4–5 ครั้ง", "844", "14.42%", "7.45%"],
    ["6–10 ครั้ง", "922", "15.76%", "15.18%"],
    [{ text: "11+ ครั้ง", color: GREEN }, "864", { text: "14.76%", color: GREEN, bold: true }, { text: "64.67%", color: GREEN, bold: true }],
  ]);
  s.addTable(rows, { x: 0.6, y: 3.3, w: 7.3, h: 2.7, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.5, 1.4, 1.7, 1.7], rowH: 0.38, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.2, y: 3.3, w: 4.5, h: 2.7, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("กันข้อโต้แย้งไว้ก่อน", { x: 8.45, y: 3.45, w: 4.0, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0 });
  s.addText(
    "“ลูกค้าที่เพิ่งซื้อปลายปี 2011 ยังไม่ทันกลับมา จะนับว่าหายได้ยังไง”\n\n" +
      "จึงตัด cohort เฉพาะลูกค้าที่ซื้อครั้งแรกก่อน 9 ธ.ค. 2010 — ทุกคนมีเวลาเต็ม 12 เดือน\n" +
      "จาก 4,284 ราย มี 1,062 ราย (24.79%) ที่ไม่กลับมาเลย\n\n" +
      "ใกล้เคียง 27.65% → ไม่ใช่ผลจากการตัดช่วงเวลา",
    { x: 8.45, y: 3.9, w: 4.0, h: 1.95, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.2, valign: "top", margin: 0 }
  );

  addFooter(s, "ที่มา: analysis/g1b.py — ลูกค้าที่ระบุตัวตนได้ 5,852 ราย (86.65% ของยอดขาย)", "G1-B");
}

// ---- B3 honest reading ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B3 · อ่านตัวเลขให้ตรง", "เยอะในเชิงจำนวนหัว แต่เล็กในเชิงเงิน");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.7, w: 5.9, h: 2.0, rectRadius: 0.1, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("ลูกค้าซื้อครั้งเดียว", { x: 0.85, y: 1.85, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "27.65%", options: { fontSize: 30, bold: true, color: RED } }, { text: "  ของจำนวนลูกค้า\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "3.23%", options: { fontSize: 30, bold: true, color: TEXT_MUTED } }, { text: "  ของยอดขาย", options: { fontSize: 14, color: TEXT_MUTED } },
  ], { x: 0.85, y: 2.3, w: 5.4, h: 1.25, fontFace: THAI_BODY, lineSpacingMultiple: 1.15, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.7, w: 5.9, h: 2.0, rectRadius: 0.1, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("ลูกค้าสั่ง 11+ ครั้ง", { x: 7.05, y: 1.85, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "14.76%", options: { fontSize: 30, bold: true, color: TEXT_MUTED } }, { text: "  ของจำนวนลูกค้า\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "64.67%", options: { fontSize: 30, bold: true, color: GREEN } }, { text: "  ของยอดขาย", options: { fontSize: 14, color: TEXT_MUTED } },
  ], { x: 7.05, y: 2.3, w: 5.4, h: 1.25, fontFace: THAI_BODY, lineSpacingMultiple: 1.15, margin: 0 });

  noteBar(s, 0.6, 3.95, 12.1, 0.85, [
    { text: "ถ้าแก้ปัญหาลูกค้าซื้อครั้งเดียวได้ทั้งหมด ก็ได้เงินเพิ่มไม่ถึง 4% — ", options: { bold: true, color: RED } },
    { text: "เงินจริงอยู่ที่ลูกค้าประจำ ความเสี่ยงที่แพงที่สุดจึงคือ “ลูกค้าประจำเงียบหาย” ไม่ใช่ “ลูกค้าขาจรไม่กลับมา”", options: {} },
  ]);

  const rows = tableOf(["กลุ่มลูกค้า", "จำนวน", "% ยอดขาย", "เงียบ > 180 วัน", "ยอดขายที่กลุ่มเงียบถือครอง"], [
    [{ text: "สั่ง 6+ ครั้ง", color: NAVY }, "1,786", "79.84%", "205 ราย (11.48%)", { text: "£813,004  (4.66%)", color: RED, bold: true }],
    [{ text: "สั่ง 11+ ครั้ง", color: NAVY }, "864", "64.67%", "52 ราย (6.02%)", { text: "£475,808  (2.73%)", color: RED, bold: true }],
    [{ text: "ลูกค้าทั้งหมด", color: TEXT_MUTED }, "5,852", "100%", "2,378 ราย (40.64%)", { text: "13.49% ของยอดขาย", color: TEXT_MUTED }],
  ]);
  s.addTable(rows, { x: 0.6, y: 5.1, w: 12.1, h: 1.5, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.4, 1.8, 2.0, 2.6, 3.3], rowH: 0.37, valign: "middle" });

  addFooter(s, "“เงียบ > 180 วัน” ตั้งจากข้อมูลเอง: มัธยฐานถึงการซื้อครั้งที่ 2 = 56 วัน · P75 = 133 วัน", "G1-B");
}

// ---- B4 returns headline ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B4 · Pain point ที่ 2", "การคืนของ 7.59% เป็นตัวเลขที่ใช้ไม่ได้");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1, fill: { color: "FBE9E7" }, line: { color: RED, width: 1 } });
  s.addText([
    { text: "ถ้ารายงานแบบตรง ๆ\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "-£1,526,667.86  =  7.59%", options: { fontSize: 24, bold: true, color: RED } },
    { text: "\nของยอดขาย (ใบ C 8,292 ใบ / 19,494 แถว)", options: { fontSize: 12.5, color: TEXT_MUTED } },
  ], { x: 0.9, y: 1.75, w: 5.3, h: 1.4, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1, fill: { color: "EAF5EC" }, line: { color: GREEN, width: 1 } });
  s.addText([
    { text: "ตัวเลขที่ถูกต้อง — คืนสินค้าจริง\n", options: { fontSize: 14, color: TEXT_MUTED } },
    { text: "-£726,588.95  =  3.61%", options: { fontSize: 24, bold: true, color: GREEN } },
    { text: "\nของยอดขาย (คิดเป็น 47.59% ของยอดใบ C)", options: { fontSize: 12.5, color: TEXT_MUTED } },
  ], { x: 7.1, y: 1.75, w: 5.3, h: 1.4, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  s.addText("52.41% ของยอดใบ C ไม่ใช่การคืนสินค้าเลย — เป็นรายการบัญชีที่บังเอิญถูกบันทึกเป็นใบ C", {
    x: 0.6, y: 3.35, w: 12.1, h: 0.45, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0,
  });

  const rows = tableOf(["Top 5 รายการที่ถูก “คืน” มากที่สุดตามมูลค่า", "StockCode", "มูลค่า", "ใช่สินค้าไหม"], [
    ["Manual (รายการปรับปรุงด้วยมือ)", "M", "-£423,512.60", { text: "ไม่ใช่", color: RED, bold: true }],
    ["Amazon Fee", "AMAZONFEE", "-£294,772.71", { text: "ไม่ใช่", color: RED, bold: true }],
    ["PAPER CRAFT , LITTLE BIRDIE", "23843", "-£168,469.60", { text: "ใช่", color: GREEN, bold: true }],
    ["MEDIUM CERAMIC TOP STORAGE JAR", "23166", "-£77,479.64", { text: "ใช่", color: GREEN, bold: true }],
    ["Bank Charges", "BANK CHARGES", "-£36,096.87", { text: "ไม่ใช่", color: RED, bold: true }],
  ]);
  s.addTable(rows, { x: 0.6, y: 3.9, w: 12.1, h: 2.3, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [5.5, 2.4, 2.3, 1.9], rowH: 0.38, valign: "middle" });

  addFooter(s, "ประเด็นนี้อยู่บนสไลด์เพราะแสดงว่าทีมอ่านข้อมูลจริง ไม่ได้ groupby แล้วเชื่อผลทันที", "G1-B");
}

// ---- B4 concentration + not a churn signal ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B4 · กระจุกตัว และความเข้าใจผิด", "การคืนของกระจุกที่คนไม่กี่ราย และไม่ใช่สัญญาณว่าจะเลิกซื้อ");

  statCard(s, 0.6, 1.7, 3.85, 1.4, "58.12%", "ของมูลค่าการคืน มาจากผู้คืน 1% แรก (25 ราย)", RED);
  statCard(s, 4.65, 1.7, 3.85, 1.4, "41.92%", "มาจาก 10 รายแรกเท่านั้น", RED);
  statCard(s, 8.7, 1.7, 4.0, 1.4, "-£431,531", "ยอดคืนที่ไม่มี Customer ID (750 แถว) — สอบกลับไม่ได้", TEXT_MUTED);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.35, w: 5.9, h: 2.4, rectRadius: 0.1, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("“คืนของบ่อย = กำลังจะเลิกซื้อ” ?", { x: 0.85, y: 3.5, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: "ลูกค้าซื้อซ้ำ เคยคืนของ    ", options: { fontSize: 14, color: TEXT_DARK } }, { text: "53.80%\n", options: { fontSize: 22, bold: true, color: NAVY } },
    { text: "ลูกค้าซื้อครั้งเดียว เคยคืนของ    ", options: { fontSize: 14, color: TEXT_DARK } }, { text: "13.47%", options: { fontSize: 22, bold: true, color: TEXT_MUTED } },
  ], { x: 0.85, y: 4.0, w: 5.4, h: 1.1, fontFace: THAI_BODY, lineSpacingMultiple: 1.2, margin: 0 });
  s.addText("ข้อมูลบอกตรงข้ามกับสัญชาตญาณ — ลูกค้าประจำคืนของบ่อยกว่าเกือบ 4 เท่า เพราะซื้อบ่อยกว่า จึงมีโอกาสคืนมากกว่า", {
    x: 0.85, y: 5.05, w: 5.4, h: 0.6, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_MUTED, lineSpacingMultiple: 1.15, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 3.35, w: 5.9, h: 2.4, rectRadius: 0.1, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText("สิ่งที่ห้ามเขียนบนสไลด์", { x: 7.05, y: 3.5, w: 5.4, h: 0.4, fontFace: THAI_HEAD, fontSize: 17, bold: true, color: GOLD, margin: 0 });
  s.addText(
    "ห้ามสรุปว่า “การคืนของทำนายการเลิกซื้อ” — หลักฐานเบื้องต้นบอกว่าไม่จริง\n\n" +
      "เก็บไว้เป็นสมมติฐานที่จะทดสอบจริงใน Goal 2 ตอนทำ classification (G2-D3)\n\n" +
      "อีกเรื่อง: แถว Quantity ติดลบที่ไม่ใช่ใบ C 3,457 แถว มูลค่ารวม £0.00 และ 100% ไม่มี Customer ID → เป็นการตัดสต๊อกของเสีย (damaged, smashed, thrown away) ไม่ใช่การคืนจากลูกค้า",
    { x: 7.05, y: 3.95, w: 5.4, h: 1.7, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 }
  );

  addFooter(s, "อัตราคืนของ UK 7.71% vs ต่างประเทศ 6.85% — ไม่ต่างกันมาก ปัญหาไม่ได้อยู่ที่ตลาดใดตลาดหนึ่ง", "G1-B");
}

// ---- B5 Problem statement ----
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: -2.6, w: 6.0, h: 6.0, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("B5 · PROBLEM STATEMENT", { x: 0.7, y: 0.5, w: 11.9, h: 0.4, fontFace: THAI_BODY, fontSize: 14, bold: true, color: GOLD, charSpacing: 1.5, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.1, w: 11.9, h: 2.75, rectRadius: 0.1, fill: { color: "263480" }, line: { color: GOLD, width: 1.5 } });
  s.addText(
    "ตลอด 2 ปีของข้อมูล ลูกค้าที่ระบุตัวตนได้ 5,852 ราย มีถึง 27.65% (1,618 ราย) ที่ซื้อเพียงครั้งเดียวแล้วไม่กลับมาอีก " +
      "และ 40.64% (2,378 ราย) เงียบหายเกิน 180 วัน — ในจำนวนนี้มีลูกค้าประจำที่สั่งซื้อตั้งแต่ 6 ครั้งขึ้นไปรวม 205 ราย " +
      "ซึ่งถือครองยอดขาย £813,004 (4.66% ของยอดขายจากลูกค้าที่ระบุตัวตนได้) — โดยธุรกิจไม่มีขั้นตอนใดในระบบที่ตรวจจับ " +
      "การเงียบหายนี้ได้ก่อนที่ลูกค้าจะหายไปแล้ว ทั้งที่ลูกค้าซื้อซ้ำสร้างรายได้เฉลี่ยต่อรายสูงกว่าลูกค้าซื้อครั้งเดียว 11.4 เท่า",
    { x: 1.05, y: 1.25, w: 11.2, h: 2.45, fontFace: THAI_HEAD, fontSize: 19, color: WHITE, valign: "middle", lineSpacingMultiple: 1.3, margin: 0 }
  );

  const parts = [
    ["อาการ", "ซื้อครั้งเดียวแล้วหาย / เงียบเกิน 180 วัน โดยระบบไม่รู้ตัว"],
    ["ขนาด", "27.65% (1,618 ราย) · 40.64% (2,378 ราย) · 205 รายในกลุ่มลูกค้าประจำ"],
    ["ผลกระทบ", "£813,004 = 4.66% ของยอดขาย + เสียโอกาสรายได้ที่สูงกว่า 11.4 เท่า"],
  ];
  let py = 4.15;
  parts.forEach(([tag, text]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: py, w: 1.7, h: 0.62, rectRadius: 0.08, fill: { color: GOLD }, line: { type: "none" } });
    s.addText(tag, { x: 0.7, y: py, w: 1.7, h: 0.62, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
    s.addText(text, { x: 2.6, y: py, w: 10.0, h: 0.62, fontFace: THAI_BODY, fontSize: 15, color: ICE, valign: "middle", margin: 0 });
    py += 0.72;
  });

  s.addText(
    "ทำไมแกนเป็น “ลูกค้าหาย” ไม่ใช่ “การคืนของ”: การคืนสินค้าจริง £726,589 กระจุกอยู่ที่ลูกค้าเพียง 25 ราย " +
      "แก้ได้ด้วยการคุยกับลูกค้ารายใหญ่ ไม่ต้องใช้ระบบวิเคราะห์ — ส่วนการเงียบหายกระจายทั่วฐานลูกค้า มองด้วยตาไม่เห็น ต้องใช้การวิเคราะห์ข้อมูลถึงจะเจอ",
    { x: 0.7, y: 6.5, w: 11.9, h: 0.7, fontFace: THAI_BODY, fontSize: 13, italic: true, color: "9AA8D6", lineSpacingMultiple: 1.2, margin: 0 }
  );
}

// ---- B6 Customer Journey Map ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "B6 · Customer Journey Map", "ลูกค้าหลุดตรงไหน และหลุดไปกี่ราย");

  const stages = ["1. รู้จัก & สั่งครั้งแรก", "2. รับของครั้งแรก", "3. กลับมาซื้อซ้ำ", "4. คืนของ / มีปัญหา", "5. เงียบหาย"];
  const grid = [
    ["STEPS", "เลือกสินค้า → สั่งซื้อ", "รับของ → ตรวจของ", "สั่งรอบถัดไป\n(มัธยฐาน 56 วัน)", "แจ้งคืน → ออกใบ C", "ไม่มีคำสั่งซื้ออีก"],
    ["THOUGHTS", "ราคาโอเค ลองสั่งดู", "ของครบมั้ย ตรงรูปมั้ย", "เจ้านี้ใช้ได้ สั่งเพิ่ม", "ของพัง ต้องแจ้งใคร", "ไม่มีเสียง — ลูกค้าไม่บอกลา"],
    ["TOUCHPOINTS", "เว็บ · ใบสั่งซื้อ", "พัสดุ · POSTAGE", "ใบสั่งซื้อรอบใหม่", "ใบลดหนี้ (Invoice C)", "ไม่มีเลย"],
    ["ACTORS", "ลูกค้า · ฝ่ายขาย", "ขนส่ง · คลัง", "ลูกค้า · ฝ่ายขาย", "ฝ่ายบริการ · บัญชี", "ไม่มีใครรับผิดชอบ"],
    ["EMOTIONS", "สนใจ (+)", "เฉย ๆ (0)", "พอใจ (+)", "หงุดหงิด (-)", "เฉยชา แล้วหายไป (-)"],
  ];
  const header = [{ text: "STAGE", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } }].concat(
    stages.map((t, i) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: i === 4 ? "8A2E22" : NAVY }, fontSize: 12.5, align: "center" } }))
  );
  const body = grid.map((r, i) => r.map((cell, j) => ({
    text: cell,
    options: { bold: j === 0, color: j === 0 ? NAVY : j === 5 ? RED : TEXT_DARK, fill: { color: j === 0 ? "DCE6F8" : i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: j === 0 ? 12 : 12.5, align: "left" },
  })));
  const dropRow = [
    { text: "ที่หลุด", options: { bold: true, color: NAVY, fill: { color: "DCE6F8" }, fontSize: 12 } },
    { text: "ลูกค้าที่มี ID\n5,852 ราย", options: { color: TEXT_DARK, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "—", options: { color: TEXT_MUTED, fill: { color: "FFF4E0" }, fontSize: 12.5, align: "center" } },
    { text: "หลุด 1,618 ราย\n(27.65%)", options: { bold: true, color: RED, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "2,496 ราย (42.65%)\nเคยคืนของ", options: { color: TEXT_DARK, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "2,378 ราย (40.64%)\nเงียบเกิน 180 วัน", options: { bold: true, color: RED, fill: { color: "FFE8E3" }, fontSize: 12.5 } },
  ];
  s.addTable([header, ...body, dropRow], { x: 0.45, y: 1.6, w: 12.45, h: 4.35, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [1.45, 2.2, 2.2, 2.2, 2.2, 2.2], rowH: 0.62, valign: "middle" });

  noteBar(s, 0.45, 6.1, 12.45, 0.8, [
    { text: "หลุดมากที่สุด: stage 2 → 3 ", options: { bold: true, color: RED } },
    { text: "(รับของครั้งแรกแล้วไม่กลับมา 1,618 ราย)   ·   ", options: {} },
    { text: "แพงที่สุด: stage 5 ", options: { bold: true, color: RED } },
    { text: "ซึ่งไม่มี touchpoint และไม่มีใครรับผิดชอบ — ตรงกับ feedback loop ที่ขาดใน B1", options: {} },
  ]);

  addFooter(s, "ฟอร์แมตตามภาพตัวอย่างในโจทย์: STAGE → STEPS → THOUGHTS → TOUCHPOINTS → ACTORS → EMOTIONS", "G1-B");
}

// =====================================================================
// Section divider — C
// =====================================================================
sectionDivider(
  "ส่วนที่ 3 · G1-C",
  "จะรู้ได้ยังไงว่าทางแก้ได้ผล",
  "Balanced Scorecard — Objective · KPI · Baseline & Target · Strategy Map",
  "หลักการ: ห้ามตั้ง target ลอย ๆ — ทุกตัวเลขต้องมี baseline จริงจาก G1-B/G1-D กำกับเสมอ"
);

// ---- C1/C2 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "C1–C2 · จาก Pain Point ถึง KPI", "ตรวจจับลูกค้ากำลังจะเงียบ ก่อนที่เขาจะเงียบจริง");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.65, w: 12.1, h: 1.1, rectRadius: 0.1, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText([
    { text: "Objective:  ", options: { bold: true, color: GOLD, fontSize: 16 } },
    { text: "ตรวจจับและรักษาลูกค้าที่กำลังจะเงียบ ก่อนที่เขาจะเงียบจริง — แทนที่จะรู้ตัวหลังยอดขายรวมตกไปแล้ว", options: { color: WHITE, fontSize: 16 } },
  ], { x: 0.9, y: 1.65, w: 11.5, h: 1.1, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });

  const rows = tableOf(["CSF (นามธรรม)", "KPI (ตัวเลข)"], [
    ["ฝ่ายขายใช้ระบบเตือนเป็นกิจวัตร", "% สัปดาห์ที่มีการทบทวนรายชื่อลูกค้าเสี่ยง"],
    ["ตรวจจับลูกค้าเสี่ยงได้ทันเวลา ก่อนเงียบครบเกณฑ์", "% ลูกค้าเสี่ยงสูงที่ถูกติดต่อภายใน 30 วันหลังถูกแจ้งเตือน"],
    ["ลูกค้ากลับมาซื้อซ้ำเร็วขึ้นและสม่ำเสมอขึ้น", "อัตราซื้อซ้ำ · เวลาถึงการซื้อครั้งที่ 2 · % เงียบ >180 วัน"],
    ["รายได้จากลูกค้าประจำไม่รั่วออกจากฐาน", "มูลค่าที่กู้คืนได้จากกลุ่มเสี่ยง · อัตราคืนสินค้าจริง"],
  ]);
  s.addTable(rows, { x: 0.6, y: 3.05, w: 12.1, h: 3.2, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [5.6, 6.5], rowH: 0.7, valign: "middle" });

  addFooter(s, "pain point ต้นทาง: ลูกค้าเงียบ 40.64% (ถือ 13.49% ของยอดขาย) · เวลาถึงการซื้อครั้งที่ 2 มัธยฐาน 56 วัน — ไม่มีขั้นตอนใดจับสัญญาณก่อนหน้านั้น", "G1-C");
}

// ---- C3/C4 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "C3–C4 · Baseline, Target, Measure", "2 มิติบนตั้งเลขได้ตรง ๆ · 2 มิติล่างรอ Goal 2 ยืนยัน");

  const rows = tableOf(["มิติ / KPI", "Baseline (จริง)", "Target", "วัดยังไง / ใครวัด"], [
    [{ text: "L&G — % สัปดาห์ที่ทบทวนรายชื่อ", color: NAVY }, { text: "0%", color: RED, bold: true }, "100% ตั้งแต่สัปดาห์แรก", "log การเปิด worklist · หัวหน้าฝ่ายขาย"],
    [{ text: "Internal — % ติดต่อภายใน 30 วัน", color: NAVY }, { text: "0%", color: RED, bold: true }, "≥80% ภายในไตรมาสแรก", "เทียบวันแจ้งเตือน-วันติดต่อ · หัวหน้าฝ่ายขาย"],
    [{ text: "Customer — อัตราซื้อซ้ำ", color: NAVY }, { text: "72.35%", color: GREEN, bold: true }, "รักษาไว้ไม่ให้ลดลง", "จาก transaction log · ทีมวิเคราะห์ (รายไตรมาส)"],
    [{ text: "Customer — เงียบ >180 วัน", color: NAVY }, { text: "40.64%", color: RED, bold: true }, "ลดลง — รอผล backtest Goal 2", "recency ทุกลูกค้า · ทีมวิเคราะห์ (รายเดือน)"],
    [{ text: "Financial — มูลค่าที่เสี่ยง", color: NAVY }, { text: "£813,004", color: RED, bold: true }, "กู้คืนบางส่วน — สมมติฐานรอพิสูจน์", "เทียบยอดซื้อก่อน-หลังติดต่อ · ทีม+บัญชี"],
    [{ text: "Financial — อัตราคืนสินค้าจริง", color: NAVY }, { text: "3.61%", color: TEXT_MUTED }, "ติดตามต่อ ไม่ใช่ KPI หลัก", "กรอง StockCode สินค้าจริงเท่านั้น · รายเดือน"],
  ]);
  s.addTable(rows, { x: 0.5, y: 1.55, w: 12.35, h: 4.1, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.1, 2.0, 3.1, 4.15], rowH: 0.68, valign: "middle" });

  noteBar(s, 0.5, 5.85, 12.35, 1.0, [
    { text: "ทำไม 2 มิติล่างไม่ตั้งตัวเลข target ตรง ๆ: ", options: { bold: true, color: RED } },
    { text: "ไม่มีข้อมูลแคมเปญ/กลุ่มควบคุม พิสูจน์ไม่ได้ว่าติดต่อแล้วทำให้ลูกค้ากลับมาจริงกี่ % — ตั้งเลขลอย ๆ ตรงนี้ถือว่าผิดกติกาของงาน (ห้ามตั้ง target ที่ไม่มี baseline)", options: {} },
  ], "FBE9E7", RED);

  addFooter(s, "ที่มา: g1b.py (baseline B3/B4) + g1d.py (verification) — ดู g1-c-balanced-scorecard.md", "G1-C");
}

// ---- C5 Strategy map ----
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
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: by, w: 7.2, h: bh, rectRadius: 0.08, fill: { color: d.color }, line: { type: "none" }, shadow: freshShadow() });
    s.addText(d.title, { x: 0.85, y: by + 0.08, w: 2.2, h: bh - 0.16, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, valign: "middle", margin: 0 });
    s.addText([{ text: d.obj + "\n", options: { bold: true, color: WHITE, fontSize: 12.5 } }, { text: d.kpi, options: { color: ICE, fontSize: 11 } }], { x: 3.15, y: by + 0.06, w: 4.55, h: bh - 0.12, fontFace: THAI_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });
    if (by > 1.6) {
      s.addText("↑", { x: 3.9, y: by - 0.32, w: 0.5, h: 0.32, fontFace: THAI_HEAD, fontSize: 18, bold: true, color: NAVY, align: "center", margin: 0 });
    }
    by += bh + 0.28;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.1, y: 1.6, w: 4.6, h: 5.15, rectRadius: 0.1, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText("การคืนของอยู่ตรงไหนใน BSC", { x: 8.35, y: 1.78, w: 4.1, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0 });
  s.addText(
    "แยก 2 ตัวชี้วัดตามคำตัดสิน 10 ก.ย.:\n\n" +
      "อัตราคืนสินค้าจริง 3.61% → KPI มิติ Customer/Financial ที่ฝ่ายขายมีผลได้\n\n" +
      "รายการปรับปรุง/ค่าธรรมเนียม £800,079 → ไม่ใช่ KPI ของ solution นี้ เป็นเรื่องบัญชี ไม่ผูกกับ objective เรื่องลูกค้า",
    { x: 8.35, y: 2.3, w: 4.1, h: 4.2, fontFace: THAI_BODY, fontSize: 13, color: TEXT_DARK, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }
  );

  addFooter(s, "ทุกลูกศรอ่านจากล่างขึ้นบน: L&G ทำได้ก่อน → Internal Process ตามมา → Customer ดีขึ้น → Financial รักษาไว้ได้", "G1-C");
}

// =====================================================================
// Section divider — D
// =====================================================================
sectionDivider(
  "ส่วนที่ 4 · G1-D",
  "จากไฟล์แบนราบ สู่ข้อมูลที่พร้อมวิเคราะห์จริง",
  "การตัดสินใจจัดการข้อมูล · EDA · Data Model + SQL · 5V Characteristics",
  "ฐานคำนวณ: 1,067,371 แถวดิบ → 1,037,007 แถวขายจริง (97.16%) · ตัดออกเพียง 2.84% ตามเหตุผลที่ระบุทุกข้อ"
);

// ---- D4 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D4 · ตัดสินใจจัดการข้อมูล", "ทุกปัญหามีเหตุผลกำกับ — ห้ามลบเงียบ ๆ");

  const rows = tableOf(["ปัญหา (ขนาด)", "การตัดสินใจ"], [
    ["แถวซ้ำ (34,335 · 3.2%)", "ตัดออกก่อนคำนวณทุกตัวเลข — export ซ้ำเป๊ะ ไม่ใช่ธุรกรรมจริง 2 รายการ"],
    ["Customer ID หาย (243,007 · 22.77% แถว, 12.68% ยอดขาย)", "เก็บในยอดขายรวม แต่ตัดออกจากตัวเลขระดับลูกค้าทั้งหมด"],
    ["ใบ C / ยกเลิก (19,494 แถว, -£1,526,668)", "แยกออกจากยอดขาย ไม่ลบทิ้ง — เก็บไว้ตอบคำถามเรื่องคืนของต่างหาก"],
    ["Quantity ติดลบ นอกใบ C (3,457 แถว)", "ตัดออกจากยอดขาย (เหมือนใบ C) · ทำเครื่องหมายไว้สืบต่อใน Goal 2"],
    ["Price = 0 / ติดลบ (6,207 แถว)", "ตัดออกจากยอดขาย — ของแจกฟรี/รายการปรับปรุงบัญชี ไม่ใช่รายได้"],
    ["StockCode ไม่ใช่สินค้า (5,913 แถว)", "ตัดออกจากยอดขายสินค้าเสมอ ไม่ว่าจะอยู่ใบปกติหรือใบ C"],
  ]);
  s.addTable(rows, { x: 0.5, y: 1.55, w: 12.35, h: 4.7, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [4.6, 7.75], rowH: 0.78, valign: "middle" });

  addFooter(s, "ผลรวม: เหลือ 1,037,007 แถวเป็นฐานคำนวณยอดขาย (97.16%) — ตัดออกเพียง 2.84% ส่วนใหญ่คือ \"ข้อมูลจริงที่ไม่ใช่ยอดขายสินค้า\" ไม่ใช่ข้อมูลเสีย", "G1-D");
}

// ---- D5 (1/2) ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D5 · EDA (1/2)", "ฤดูกาลคริสต์มาสชัดเจน และสินค้าขายดี 2 แบบ");

  s.addChart(pres.charts.LINE, [{
    name: "ยอดขายรายเดือน (£)",
    labels: ["ม.ค.11", "ก.พ.11", "มี.ค.11", "เม.ย.11", "พ.ค.11", "มิ.ย.11", "ก.ค.11", "ส.ค.11", "ก.ย.11", "ต.ค.11", "พ.ย.11", "ธ.ค.11"],
    values: [671933, 508886, 691258, 516218, 741192, 738752, 689364, 736576, 1030475, 1106670, 1457746, 615493],
  }], {
    x: 0.5, y: 1.6, w: 7.0, h: 3.5, chartColors: [GOLD], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 5,
    showTitle: true, title: "ยอดขายรายเดือน 2554 (£) — เห็นพีค พ.ย.", titleFontSize: 13, titleColor: TEXT_DARK, showLegend: false,
    catAxisLabelColor: TEXT_DARK, catAxisLabelFontSize: 9, valAxisLabelColor: TEXT_MUTED, valAxisLabelFontSize: 9,
    valGridLine: { color: "E2E9F7", size: 0.75 }, catGridLine: { style: "none" },
  });
  statCard(s, 0.5, 5.25, 3.4, 1.15, "27.32%", "ของยอดขายทั้งปี มาจาก พ.ย.–ธ.ค.", GOLD);
  statCard(s, 4.1, 5.25, 3.4, 1.15, "£1.10M", "เฉลี่ยเดือน พ.ย.–ธ.ค. (vs £0.73M เดือนอื่น)", NAVY);

  s.addText("สินค้าขายดี — คนละแบบ ตามรายได้ vs จำนวนชิ้น", { x: 7.85, y: 1.6, w: 4.9, h: 0.6, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, margin: 0, lineSpacingMultiple: 1.1 });
  const rows = tableOf(["อันดับ 1", "ตามรายได้", "ตามจำนวนชิ้น"], [
    ["", "CAKESTAND 3 TIER\n£344,563", "WW2 GLIDERS\n110,138 ชิ้น"],
    ["อันดับ 2", "T-LIGHT HOLDER\n£263,110", "JUMBO BAG RETROSPOT\n98,349 ชิ้น"],
  ]);
  s.addTable(rows, { x: 7.85, y: 2.3, w: 4.9, h: 1.7, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [1.3, 1.8, 1.8], rowH: 0.55, valign: "middle" });

  noteBar(s, 7.85, 4.3, 4.9, 2.1, [
    { text: "สินค้าราคาสูงขายน้อยชิ้น ≠ สินค้าราคาถูกขายเยอะ — ", options: { bold: true } },
    { text: "ตรงกับที่ G1-A ระบุลูกค้า 2 กลุ่ม (ปลีก/ขายส่ง): กลุ่มขายส่งซื้อของราคาถูกจำนวนมาก กลุ่มปลีกซื้อของราคาสูงจำนวนน้อย", options: {} },
  ]);

  addFooter(s, "ธ.ค. 2011 ต่ำผิดปกติเพราะข้อมูลตัดที่วันที่ 9 ธ.ค. — ยังไม่ครบเดือน ไม่ใช่ยอดขายตกจริง", "G1-D");
}

// ---- D5 (2/2) ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D5 · EDA (2/2)", "กระจายตามประเทศ และมูลค่าตะกร้า");

  s.addChart(pres.charts.DOUGHNUT, [{ name: "Revenue Share", labels: ["United Kingdom", "ต่างประเทศ (42 ประเทศ)"], values: [85.71, 14.29] }], {
    x: 0.5, y: 1.6, w: 5.6, h: 3.3, chartColors: [NAVY, GOLD], showLegend: true, legendPos: "b", legendColor: TEXT_DARK, legendFontSize: 12,
    showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 12, dataLabelFormatCode: '0.0"%"', holeSize: 55,
  });

  s.addText("มูลค่าตะกร้าต่อ 1 ใบเสร็จ (£)", { x: 6.5, y: 1.6, w: 6.2, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: TEXT_DARK, margin: 0 });
  const rows = tableOf(["สถิติ", "ค่า (£)"], [
    ["P25", "152.55"], ["มัธยฐาน", { text: "303.22", bold: true, color: NAVY }], ["เฉลี่ย", { text: "509.18", bold: true, color: GOLD }], ["P75", "496.30"], ["P95", "1,450.64"],
  ]);
  s.addTable(rows, { x: 6.5, y: 2.05, w: 6.2, h: 2.4, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.1, 3.1], rowH: 0.4, valign: "middle" });

  noteBar(s, 0.5, 5.15, 12.2, 1.4, [
    { text: "เฉลี่ย (£509) สูงกว่ามัธยฐาน (£303) มาก — ", options: { bold: true } },
    { text: "แปลว่ามีตะกร้าขนาดใหญ่ผิดปกติ (ลูกค้าขายส่ง) ดึงค่าเฉลี่ยขึ้น สอดคล้องกับ P95 ที่กระโดดไปถึง £1,450 · ยืนยันการมีลูกค้า 2 กลุ่มอีกครั้งด้วยมุมมองคนละมุมจาก G1-A · นอก UK ประเทศที่ขายดีสุด: EIRE, Netherlands, Germany, France", options: {} },
  ]);

  addFooter(s, "UK ครองยอดขาย 85.71% — ธุรกิจกระจุกตัวหนัก เป็นความเสี่ยงเชิงกลยุทธ์ที่ต้องพูดถึง", "G1-D");
}

// ---- D6 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D6 · Data Model", "จาก Flat File (Traditional File Environment) สู่ 4 ตาราง Normalize");

  const tables = [
    { name: "CUSTOMER", fields: "Customer_ID [PK]\nCountry", x: 0.6 },
    { name: "INVOICE", fields: "Invoice [PK]\nInvoiceDate\nCustomer_ID [FK]", x: 3.75 },
    { name: "INVOICE_LINE", fields: "Invoice [FK]\nStockCode [FK]\nQuantity\nPrice", x: 6.9 },
    { name: "PRODUCT", fields: "StockCode [PK]\nDescription", x: 10.05 },
  ];
  tables.forEach((t) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: t.x, y: 1.65, w: 2.6, h: 1.7, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
    s.addText(t.name, { x: t.x, y: 1.75, w: 2.6, h: 0.4, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, align: "center", margin: 0 });
    s.addText(t.fields, { x: t.x + 0.15, y: 2.2, w: 2.3, h: 1.1, fontFace: THAI_BODY, fontSize: 11.5, color: WHITE, lineSpacingMultiple: 1.25, margin: 0 });
  });
  [3.25, 6.4, 9.55].forEach((x) => {
    s.addText("→", { x, y: 2.15, w: 0.5, h: 0.7, fontFace: THAI_HEAD, fontSize: 22, bold: true, color: TEXT_DARK, align: "center", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.7, w: 12.1, h: 1.55, rectRadius: 0.1, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText([
    { text: "ทำไม Price อยู่ที่ INVOICE_LINE ไม่ใช่ PRODUCT:  ", options: { bold: true, color: GOLD } },
    { text: "ทดลองเก็บราคาเดียวต่อสินค้า (median) ที่ PRODUCT ก่อน แล้วพบว่าราคาสินค้าเดียวกันเปลี่ยนตามเวลา/ลูกค้า ทำให้ยอดขายที่ JOIN คำนวณคลาดจากยอดขายจริงได้เกือบ 4 เท่าในบางประเทศ — ระบบวางบิลจริงล็อกราคาไว้ ณ วันที่ขาย ไม่อ้างอิงราคาปัจจุบันย้อนหลัง จึงย้าย Price มาไว้ที่ INVOICE_LINE", options: { color: TEXT_DARK } },
  ], { x: 0.9, y: 3.7, w: 11.5, h: 1.55, fontFace: THAI_BODY, fontSize: 13.5, valign: "middle", lineSpacingMultiple: 1.25, margin: 0 });

  noteBar(s, 0.6, 5.55, 12.1, 1.35, [
    { text: "ปัญหา flat file ที่เจอจริง: ", options: { bold: true, color: RED } },
    { text: "ไม่มี foreign key เชื่อมใบ C กลับไปใบขายเดิม (จับคู่ได้แค่ Customer ID + StockCode + วันที่ใกล้กัน) · ราคาสินค้าปนอยู่ทุกแถวไม่มีที่เก็บแยก · Description สะกดต่างกันในหลายแถว — ปัญหาคลาสสิกของ traditional file environment ตรงตามที่เรียนคาบ 27 ส.ค.", options: {} },
  ], "FBE9E7", RED);

  addFooter(s, "จำนวนแถวจริง: CUSTOMER 5,852 · PRODUCT 4,898 · INVOICE 36,594 · INVOICE_LINE 802,634", "G1-D");
}

// ---- D7 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D7 · SQL ที่ JOIN ตอบคำถามธุรกิจ", "นอก UK ประเทศไหนสร้างรายได้มากที่สุด");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.6, w: 12.1, h: 1.55, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(
    "SELECT c.Country, COUNT(DISTINCT c.Customer_ID) n_customers, COUNT(DISTINCT i.Invoice) n_orders,\n" +
      "       ROUND(SUM(il.Quantity * il.Price), 2) revenue_gbp\n" +
      "FROM CUSTOMER c JOIN INVOICE i ON i.Customer_ID = c.Customer_ID\n" +
      "JOIN INVOICE_LINE il ON il.Invoice = i.Invoice JOIN PRODUCT p ON p.StockCode = il.StockCode\n" +
      "WHERE c.Country != 'United Kingdom' GROUP BY c.Country ORDER BY revenue_gbp DESC LIMIT 10;",
    { x: 0.85, y: 1.68, w: 11.6, h: 1.4, fontFace: "Consolas", fontSize: 12, color: ICE, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 }
  );

  const rows = tableOf(["Country", "n_customers", "n_orders", "revenue_gbp"], [
    [{ text: "EIRE", color: GOLD, bold: true }, "3", "528", { text: "591,536.65", bold: true }],
    ["Netherlands", "22", "216", "549,952.66"],
    ["Germany", "106", "752", "388,732.70"],
    ["France", "93", "592", "315,544.07"],
    ["Australia", "14", "87", "169,137.44"],
  ]);
  s.addTable(rows, { x: 0.6, y: 3.4, w: 7.1, h: 2.55, fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.3, 1.5, 1.5, 1.8], rowH: 0.42, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.95, y: 3.4, w: 4.8, h: 2.55, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("สังเกตที่พูดบนเวทีได้", { x: 8.2, y: 3.55, w: 4.3, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0 });
  s.addText(
    "EIRE มีลูกค้าแค่ 3 ราย แต่รายได้สูงสุดนอก UK และมี 528 ออเดอร์ (เฉลี่ย 176 ออเดอร์/ราย)\n\n" +
      "ตรงข้ามกับ Germany ที่มีลูกค้า 106 รายแต่รายได้ต่ำกว่า\n\n" +
      "แปลว่า EIRE เป็นลูกค้าขายส่งรายใหญ่ไม่กี่ราย — concentration risk ต่างจากตลาดที่กระจายลูกค้ามากกว่า",
    { x: 8.2, y: 4.0, w: 4.3, h: 1.9, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.2, valign: "top", margin: 0 }
  );

  addFooter(s, "รันจริงด้วย SQLite ใน analysis/g1d.py — ตัวเลขใกล้เคียงยอดขายจริงใน D5 (คลาดไม่เกิน 1-2% ส่วนใหญ่ ดูเหตุผลใน g1-d4-d8-data-decisions.md)", "G1-D");
}

// ---- D8 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D8 · Characteristics ของข้อมูล", "5V — จุดที่ต้องระวังที่สุดคือ Veracity");

  const v = [
    ["Volume", "1,067,371 แถว — \"มากพอ\" ตามเกณฑ์ (≥1,000) แต่เล็กกว่า Big Data จริง", GREEN],
    ["Velocity", "Batch/historical — export ครั้งเดียว ไม่ใช่ streaming", TEXT_MUTED],
    ["Variety", "Structured เท่านั้น — ตารางแบน 8 คอลัมน์ ไม่มีรูป/ข้อความอิสระปน", TEXT_MUTED],
    ["Veracity", "ต่ำกว่าที่ดูตอนแรก — พิสูจน์แล้ว: อัตราคืนของผิดได้ 2 เท่า (7.59% vs 3.61%) ถ้ากรองไม่ถูก", RED],
    ["Value", "สูง — ตอบได้ตรงว่าลูกค้าเงียบเท่าไร คืนของกี่ % ตลาดไหนควรโฟกัส ใช้ตั้ง KPI ได้จริง", GREEN],
  ];
  let vy = 1.65;
  v.forEach(([name, desc, color]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: vy, w: 12.1, h: 0.92, rectRadius: 0.08, fill: { color: CARD_BG }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
    s.addShape(pres.shapes.OVAL, { x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fill: { color }, line: { type: "none" } });
    s.addText(name[0], { x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fontFace: THAI_HEAD, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(name, { x: 1.65, y: vy + 0.1, w: 1.9, h: 0.72, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, valign: "middle", margin: 0 });
    s.addText(desc, { x: 3.6, y: vy + 0.1, w: 8.9, h: 0.72, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_MUTED, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });
    vy += 1.02;
  });

  addFooter(s, "ข้อสรุป: relational database ที่มีปริมาณค่อนข้างมาก ไม่ใช่ Big Data เต็มรูปแบบ — Volume ผ่าน แต่ Velocity/Variety ไม่เข้าเกณฑ์ 5V ครบ", "G1-D");
}

// =====================================================================
// Final closing — one summary for the whole Goal 1 deck
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: -2.6, w: 6, h: 6, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("สรุป Goal 1", { x: 0.7, y: 0.45, w: 10, h: 0.65, fontFace: THAI_HEAD, fontSize: 32, bold: true, color: WHITE, margin: 0 });
  s.addText("บริษัท + ปัญหา + ตัววัด + ข้อมูลพร้อมใช้ — พร้อมเดินหน้าสู่ Goal 2", { x: 0.7, y: 1.05, w: 11, h: 0.4, fontFace: THAI_BODY, fontSize: 15, color: ICE, margin: 0 });

  const summary = [
    ["A", "บริษัท + กลยุทธ์", "ร้านของขวัญ UK · Cost Leadership + Differentiation · ลูกค้าปลีก/ขายส่ง"],
    ["B", "ปัญหาจากข้อมูลจริง", "27.65% ซื้อครั้งเดียว · 40.64% เงียบ >180 วัน · £813,004 มูลค่าเสี่ยง"],
    ["C", "Balanced Scorecard", "Objective → KPI → baseline/target 4 มิติ · ห้ามตั้งเลขลอย ๆ"],
    ["D", "ข้อมูลพร้อมวิเคราะห์", "6 การตัดสินใจ + EDA + 4 ตาราง PK/FK + SQL รันได้จริง + 5V"],
  ];
  let sy = 1.65;
  summary.forEach(([tag, title, body]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: sy, w: 11.9, h: 1.0, rectRadius: 0.08, fill: { color: "263480" }, line: { color: "3C4B96", width: 1 } });
    iconCircle(s, 0.95, sy + 0.22, 0.55, tag, GOLD, NAVY);
    s.addText(title, { x: 1.7, y: sy + 0.1, w: 3.0, h: 0.8, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: WHITE, valign: "middle", margin: 0 });
    s.addText(body, { x: 4.8, y: sy + 0.1, w: 7.6, h: 0.8, fontFace: THAI_BODY, fontSize: 13, color: ICE, valign: "middle", margin: 0 });
    sy += 1.12;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: sy + 0.1, w: 11.9, h: 0.95, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText([
    { text: "ข้อจำกัดที่พูดเอง: ", options: { bold: true, color: NAVY } },
    { text: "ตัวเลขระดับลูกค้าครอบคลุม 86.65% ของยอดขาย (Customer ID หาย 22.77%) · ไม่มีข้อมูลต้นทุน/แคมเปญ — พิสูจน์ได้ว่า \"ใคร\" จะเงียบ แต่พิสูจน์ไม่ได้ว่าติดต่อแล้วทำให้กลับมาจริงกี่ %", options: { color: TEXT_DARK } },
  ], { x: 0.95, y: sy + 0.1, w: 11.4, h: 0.95, fontFace: THAI_BODY, fontSize: 12.5, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });

  addFooter(s, "ต่อไป: G1-E2–E6 ใส่ตัวเลขจริงทุกจุด → สรุป 1 หน้า → ซ้อม → อัปโหลด PPT ภายใน 30 ก.ย. · นำเสนอ 1 ต.ค.", "G1", true);
}

pres.writeFile({ fileName: "G1-slides.pptx" }).then(() => {
  console.log("done");
});
