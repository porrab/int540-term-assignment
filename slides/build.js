const pptxgen = require("pptxgenjs");

// ---------- palette ----------
const NAVY = "1E2761"; // primary
const ICE = "CADCFC"; // secondary
const GOLD = "D4A24C"; // accent
const WHITE = "FFFFFF";
const BG_LIGHT = "F5F8FE"; // very light ice tint for content slide backgrounds
const TEXT_DARK = "1E2761";
const TEXT_MUTED = "5B6B8C";
const CARD_BG = "FFFFFF";

const THAI_HEAD = "TH Sarabun New";
const THAI_BODY = "TH Sarabun New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
const PAGE_W = 13.33;
const PAGE_H = 7.5;

// ---------- helpers ----------
function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, dark) {
  slide.addText(label, {
    x: 0.5,
    y: PAGE_H - 0.42,
    w: PAGE_W - 1.6,
    h: 0.3,
    fontFace: THAI_BODY,
    fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED,
    align: "left",
    margin: 0,
  });
  slide.addText("G1-A · INT 540 Data Analytics", {
    x: PAGE_W - 3.3,
    y: PAGE_H - 0.42,
    w: 2.8,
    h: 0.3,
    fontFace: THAI_BODY,
    fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED,
    align: "right",
    margin: 0,
  });
}

function iconCircle(slide, x, y, diameter, label, fill = GOLD, textColor = NAVY) {
  slide.addShape(pres.shapes.OVAL, {
    x,
    y,
    w: diameter,
    h: diameter,
    fill: { color: fill },
    line: { type: "none" },
    shadow: freshShadow(),
  });
  slide.addText(label, {
    x,
    y,
    w: diameter,
    h: diameter,
    fontFace: THAI_HEAD,
    fontSize: diameter > 0.7 ? 20 : 15,
    bold: true,
    color: textColor,
    align: "center",
    valign: "middle",
    margin: 0,
  });
}

function statCard(slide, x, y, w, h, bigText, smallText, accent = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: CARD_BG },
    line: { type: "none" },
    shadow: freshShadow(),
  });
  slide.addText(bigText, {
    x: x + 0.12,
    y: y + 0.1,
    w: w - 0.24,
    h: h * 0.58,
    fontFace: THAI_HEAD,
    fontSize: 26,
    bold: true,
    color: accent,
    align: "center",
    valign: "bottom",
    margin: 0,
  });
  slide.addText(smallText, {
    x: x + 0.1,
    y: y + h * 0.6,
    w: w - 0.2,
    h: h * 0.38,
    fontFace: THAI_BODY,
    fontSize: 12,
    color: TEXT_MUTED,
    align: "center",
    valign: "top",
    margin: 0,
  });
}

function slideTitle(slide, kicker, title) {
  slide.addText(kicker, {
    x: 0.6,
    y: 0.35,
    w: PAGE_W - 1.2,
    h: 0.35,
    fontFace: THAI_BODY,
    fontSize: 14,
    bold: true,
    color: GOLD,
    align: "left",
    margin: 0,
    charSpacing: 1,
  });
  slide.addText(title, {
    x: 0.6,
    y: 0.68,
    w: PAGE_W - 1.2,
    h: 0.75,
    fontFace: THAI_HEAD,
    fontSize: 30,
    bold: true,
    color: TEXT_DARK,
    align: "left",
    margin: 0,
  });
}

// =====================================================================
// Slide 1 — Title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.OVAL, {
    x: 10.2,
    y: -2.2,
    w: 6.5,
    h: 6.5,
    fill: { color: "263480" },
    line: { type: "none" },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -2.4,
    y: 4.6,
    w: 5.2,
    h: 5.2,
    fill: { color: "263480" },
    line: { type: "none" },
  });

  s.addText("TERM ASSIGNMENT · GOAL 1 · G1-A", {
    x: 0.9,
    y: 1.85,
    w: 11.5,
    h: 0.45,
    fontFace: THAI_BODY,
    fontSize: 16,
    bold: true,
    color: GOLD,
    charSpacing: 2,
    margin: 0,
  });
  s.addText("เลือกบริษัทและวิจัยกลยุทธ์", {
    x: 0.9,
    y: 2.35,
    w: 11.5,
    h: 1.3,
    fontFace: THAI_HEAD,
    fontSize: 48,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("โปรไฟล์บริษัทจากข้อมูลจริง · Five Forces / TOWS / Value Chain · การแบ่งกลุ่มลูกค้า", {
    x: 0.9,
    y: 3.55,
    w: 10.8,
    h: 0.6,
    fontFace: THAI_BODY,
    fontSize: 18,
    color: ICE,
    margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9,
    y: 4.55,
    w: 8.3,
    h: 0.9,
    rectRadius: 0.1,
    fill: { color: "263480" },
    line: { color: "3C4B96", width: 1 },
  });
  s.addText([
    { text: "Dataset: ", options: { bold: true, color: GOLD } },
    { text: "Online Retail II — UCI ML Repository #502  ·  1,067,371 แถว  ·  2009-12-01 ถึง 2011-12-09", options: { color: WHITE } },
  ], {
    x: 1.15,
    y: 4.55,
    w: 7.9,
    h: 0.9,
    fontFace: THAI_BODY,
    fontSize: 14,
    valign: "middle",
    margin: 0,
  });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", {
    x: 0.9,
    y: 6.65,
    w: 8,
    h: 0.4,
    fontFace: THAI_BODY,
    fontSize: 13,
    color: "9AA8D6",
    margin: 0,
  });
  s.addText("3 กันยายน 2569", {
    x: 0.9,
    y: 7.0,
    w: 8,
    h: 0.35,
    fontFace: THAI_BODY,
    fontSize: 13,
    color: "9AA8D6",
    margin: 0,
  });
}

// =====================================================================
// Slide 2 — A1 Company Profile
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A1 · โปรไฟล์บริษัท", "ร้านค้าออนไลน์ขายของขวัญสัญชาติอังกฤษ");

  s.addText(
    "บริษัทสมมติที่สร้างจาก dataset: ร้านค้าออนไลน์ขายของขวัญ/ของแต่งบ้านแบบ all-occasion " +
      "gift-ware ไม่มีหน้าร้าน (non-store retailer) ขายทั้งลูกค้าปลีก (ซื้อเป็นของขวัญ) และลูกค้าขายส่ง " +
      "(ร้านค้าย่อย/ผู้จัดจำหน่ายซื้อไปขายต่อ) ฐานลูกค้าหลักอยู่ในสหราชอาณาจักร แต่ส่งขายไปทั่วยุโรปและอีก" +
      "หลายทวีป ช่วงข้อมูลครอบคลุมเทศกาลคริสต์มาส 2 รอบ ซึ่งเป็นช่วงพีคตามธรรมชาติของธุรกิจของขวัญ",
    {
      x: 0.6,
      y: 1.65,
      w: 6.6,
      h: 3.1,
      fontFace: THAI_BODY,
      fontSize: 16,
      color: TEXT_DARK,
      align: "left",
      valign: "top",
      lineSpacingMultiple: 1.35,
      margin: 0,
    }
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
    s.addText(text, {
      x: 8.2,
      y: ty - 0.05,
      w: 4.6,
      h: 0.65,
      fontFace: THAI_BODY,
      fontSize: 13.5,
      color: TEXT_DARK,
      valign: "middle",
      margin: 0,
      lineSpacingMultiple: 1.1,
    });
    ty += 0.85;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6,
    y: 5.05,
    w: 6.6,
    h: 1.55,
    rectRadius: 0.08,
    fill: { color: NAVY },
    line: { type: "none" },
    shadow: freshShadow(),
  });
  s.addText(
    [
      { text: "ทำไมต้องเลือกบริษัทแบบนี้:  ", options: { bold: true, color: GOLD } },
      {
        text: "dataset มีตัวเลขธุรกรรมจริงครบทุกด้าน (ราคา ปริมาณ ประเทศ วันที่ ลูกค้า) พอสำหรับพิสูจน์โปรไฟล์และวางกลยุทธ์ด้วยหลักฐาน ไม่ใช่การเดา",
        options: { color: WHITE },
      },
    ],
    {
      x: 0.85,
      y: 5.05,
      w: 6.1,
      h: 1.55,
      fontFace: THAI_BODY,
      fontSize: 13.5,
      valign: "middle",
      align: "left",
      lineSpacingMultiple: 1.25,
      margin: 0,
    }
  );

  addFooter(s, "A1 — Company Profile", false);
}

// =====================================================================
// Slide 3 — A2 Evidence numbers
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A2 · พิสูจน์โปรไฟล์ด้วยตัวเลขจริง", "ตัวเลขจากไฟล์ข้อมูล ไม่ใช่การอ้างลอย ๆ");

  const stats = [
    ["£20.12M", "ยอดขายรวม (สุทธิ)"],
    ["5,852", "ลูกค้าที่รู้ตัวตน"],
    ["4,898", "SKU ที่ขายจริง"],
    ["43", "ประเทศที่มีคำสั่งซื้อ"],
  ];
  const cardW = 2.68;
  const gap = 0.18;
  let cx = 0.6;
  stats.forEach(([big, small]) => {
    statCard(s, cx, 1.65, cardW, 1.25, big, small);
    cx += cardW + gap;
  });

  // Donut chart: UK vs international revenue
  s.addText("สัดส่วนยอดขาย: UK vs ต่างประเทศ", {
    x: 0.6,
    y: 3.15,
    w: 5.6,
    h: 0.4,
    fontFace: THAI_HEAD,
    fontSize: 16,
    bold: true,
    color: TEXT_DARK,
    margin: 0,
  });
  s.addChart(
    pres.charts.DOUGHNUT,
    [
      {
        name: "Revenue Share",
        labels: ["United Kingdom", "ต่างประเทศ (42 ประเทศ)"],
        values: [85.71, 14.29],
      },
    ],
    {
      x: 0.5,
      y: 3.55,
      w: 5.8,
      h: 3.35,
      chartColors: [NAVY, GOLD],
      showLegend: true,
      legendPos: "b",
      legendColor: TEXT_DARK,
      legendFontSize: 12,
      showTitle: false,
      showValue: true,
      dataLabelColor: WHITE,
      dataLabelFontSize: 12,
      dataLabelFormatCode: '0.0"%"',
      holeSize: 55,
      showPercent: false,
    }
  );

  // Top international markets table
  s.addText("ยอดขาย 5 ตลาดต่างประเทศสูงสุด (£)", {
    x: 6.7,
    y: 3.15,
    w: 6,
    h: 0.4,
    fontFace: THAI_HEAD,
    fontSize: 16,
    bold: true,
    color: TEXT_DARK,
    margin: 0,
  });

  const rows = [
    ["EIRE (ไอร์แลนด์)", "628,928.63"],
    ["Netherlands", "549,952.66"],
    ["Germany", "388,829.75"],
    ["France", "316,948.80"],
    ["Australia", "168,484.66"],
  ];
  const tableRows = [
    [
      { text: "ประเทศ", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } },
      { text: "ยอดขาย (£)", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, align: "right" } },
    ],
    ...rows.map(([c, v], i) => [
      { text: c, options: { color: TEXT_DARK, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 13 } },
      { text: v, options: { color: TEXT_DARK, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 13, align: "right" } },
    ]),
  ];
  s.addTable(tableRows, {
    x: 6.7,
    y: 3.6,
    w: 6.0,
    h: 2.7,
    fontFace: THAI_BODY,
    border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false,
    colW: [3.7, 2.3],
    rowH: 0.45,
    valign: "middle",
  });

  s.addText(
    "หมายเหตุ: ฐานคำนวณ = ตัดแถวยกเลิก + Quantity/Price ≤ 0 + StockCode ที่ไม่ใช่สินค้าจริงออก (ดู G1-D1–D3)",
    {
      x: 6.7,
      y: 6.4,
      w: 6.0,
      h: 0.5,
      fontFace: THAI_BODY,
      fontSize: 11,
      italic: true,
      color: TEXT_MUTED,
      margin: 0,
    }
  );

  addFooter(s, "A2 — Evidence Numbers", false);
}

// =====================================================================
// Slide 4 — A3a Five Forces + Strategy choice
// =====================================================================
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
  const header = [
    { text: "แรงกดดัน", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } },
    { text: "ระดับ", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, align: "center" } },
    { text: "อ่านจาก dataset", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } },
  ];
  const levelColor = { "กลาง–สูง": "B98A2E", "ต่ำ–กลาง": "5B8A5E", สูง: "B3402F" };
  const body = forces.map(([f, lvl, ev], i) => [
    { text: f, options: { color: TEXT_DARK, bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5 } },
    { text: lvl, options: { color: levelColor[lvl] || TEXT_DARK, bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5, align: "center" } },
    { text: ev, options: { color: TEXT_MUTED, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12 } },
  ]);
  s.addTable([header, ...body], {
    x: 0.6,
    y: 1.65,
    w: 8.0,
    h: 3.9,
    fontFace: THAI_BODY,
    border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false,
    colW: [2.1, 1.1, 4.8],
    rowH: 0.65,
    valign: "middle",
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.9,
    y: 1.65,
    w: 3.85,
    h: 3.9,
    rectRadius: 0.08,
    fill: { color: NAVY },
    line: { type: "none" },
    shadow: freshShadow(),
  });
  s.addText("กลยุทธ์ที่เลือก", {
    x: 9.15,
    y: 1.85,
    w: 3.4,
    h: 0.4,
    fontFace: THAI_BODY,
    fontSize: 13,
    bold: true,
    color: GOLD,
    charSpacing: 1,
    margin: 0,
  });
  s.addText("Cost Leadership", {
    x: 9.15,
    y: 2.2,
    w: 3.4,
    h: 0.55,
    fontFace: THAI_HEAD,
    fontSize: 24,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("+ Differentiation เสริม", {
    x: 9.15,
    y: 2.75,
    w: 3.4,
    h: 0.4,
    fontFace: THAI_BODY,
    fontSize: 15,
    color: ICE,
    margin: 0,
  });
  s.addText(
    "Broad market + บิลขนาดใหญ่ (>12 หน่วย) สร้างรายได้ถึง 99.52% → เน้นต้นทุนต่ำเป็นแกน " +
      "โดยมี SKU ดีไซน์เฉพาะตัวเสริมสำหรับกลุ่มปลีกที่จ่ายต่อหน่วยสูงกว่า (ดู A4)",
    {
      x: 9.15,
      y: 3.3,
      w: 3.4,
      h: 2.1,
      fontFace: THAI_BODY,
      fontSize: 13,
      color: WHITE,
      lineSpacingMultiple: 1.3,
      margin: 0,
    }
  );

  addFooter(s, "A3 — Five Forces & Strategy Choice", false);
}

// =====================================================================
// Slide 5 — A3b TOWS + Value Chain
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A3 · ระบุกลยุทธ์ธุรกิจ (2/2)", "TOWS ที่ผูกกับตัวเลขจริง + Value Chain");

  // TOWS — two evidence-backed quadrants
  s.addText("TOWS — ตัวอย่าง 2 คู่ที่ผูกกับตัวเลขจริง", {
    x: 0.6,
    y: 1.6,
    w: 6.2,
    h: 0.35,
    fontFace: THAI_HEAD,
    fontSize: 15,
    bold: true,
    color: TEXT_DARK,
    margin: 0,
  });

  function towsCard(x, y, tag, title, body, color) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 6.0,
      h: 1.95,
      rectRadius: 0.08,
      fill: { color: CARD_BG },
      line: { color: "D7E1F5", width: 1 },
      shadow: freshShadow(),
    });
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: y + 0.2, w: 0.55, h: 0.55, fill: { color }, line: { type: "none" } });
    s.addText(tag, {
      x: x + 0.22,
      y: y + 0.2,
      w: 0.55,
      h: 0.55,
      fontFace: THAI_HEAD,
      fontSize: 15,
      bold: true,
      color: WHITE,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    s.addText(title, {
      x: x + 0.95,
      y: y + 0.18,
      w: 4.85,
      h: 0.35,
      fontFace: THAI_HEAD,
      fontSize: 13.5,
      bold: true,
      color: TEXT_DARK,
      margin: 0,
    });
    s.addText(body, {
      x: x + 0.22,
      y: y + 0.85,
      w: 5.6,
      h: 1.0,
      fontFace: THAI_BODY,
      fontSize: 12,
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.25,
      margin: 0,
    });
  }

  towsCard(
    0.6,
    2.0,
    "SO",
    "Strength × Opportunity",
    "ใช้ SKU ที่กว้าง (4,898 รายการ) จับโอกาสตามฤดูกาล — ข้อมูลครอบคลุม 2 เทศกาลคริสต์มาสเต็ม จึงควรทำ seasonal bundle/promotion ล่วงหน้าให้ตรงพีค",
    "5B8A5E"
  );
  towsCard(
    0.6,
    4.1,
    "WT",
    "Weakness × Threat",
    "ลูกค้าที่ซื้อครั้งเดียวแล้วหายสูงถึง 27.65% ขณะที่ threat of substitutes/new entrants สูง → ต้องมีกลยุทธ์ retention ก่อนคู่แข่งแย่งลูกค้ากลุ่มนี้ (ผูกต่อ G1-B)",
    "B3402F"
  );

  // Value chain
  s.addText("Value Chain (Porter) — ข้อมูลครอบคลุมตรงไหนบ้าง", {
    x: 6.95,
    y: 1.6,
    w: 5.8,
    h: 0.35,
    fontFace: THAI_HEAD,
    fontSize: 15,
    bold: true,
    color: TEXT_DARK,
    margin: 0,
  });

  const vcRows = [
    [
      { text: "กิจกรรม", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } },
      { text: "มีข้อมูลใน dataset?", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "center" } },
    ],
    [
      { text: "Outbound Logistics (Invoice/InvoiceDate)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 12 } },
      { text: "✓ มี", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 12, align: "center" } },
    ],
    [
      { text: "Marketing & Sales (Price/Qty/Country)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 12 } },
      { text: "✓ มี", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 12, align: "center" } },
    ],
    [
      { text: "Inbound Logistics (จัดซื้อเข้าคลัง)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 12 } },
      { text: "✗ ไม่มี", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 12, align: "center" } },
    ],
    [
      { text: "Operations (ผลิต/แพ็กสินค้า)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 12 } },
      { text: "✗ ไม่มี", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 12, align: "center" } },
    ],
  ];
  s.addTable(vcRows, {
    x: 6.95,
    y: 2.0,
    w: 5.8,
    h: 2.3,
    fontFace: THAI_BODY,
    border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false,
    colW: [4.0, 1.8],
    rowH: [0.5, 0.45, 0.45, 0.45, 0.45],
    valign: "middle",
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.95,
    y: 4.55,
    w: 5.8,
    h: 1.5,
    rectRadius: 0.08,
    fill: { color: "EAF0FC" },
    line: { type: "none" },
  });
  s.addText(
    [
      { text: "ข้อจำกัดที่ต้องพูดตรง ๆ ตอนนำเสนอ: ", options: { bold: true, color: NAVY } },
      {
        text: "dataset ไม่มีข้อมูลต้นทุน/การผลิต — Inbound Logistics และ Operations ประเมินไม่ได้จากไฟล์นี้ ไม่ใช่การสมมติขึ้นมา",
        options: { color: TEXT_DARK },
      },
    ],
    {
      x: 7.2,
      y: 4.55,
      w: 5.3,
      h: 1.5,
      fontFace: THAI_BODY,
      fontSize: 12.5,
      valign: "middle",
      lineSpacingMultiple: 1.3,
      margin: 0,
    }
  );

  addFooter(s, "A3 — TOWS & Value Chain", false);
}

// =====================================================================
// Slide 6 — A4 Retail vs Wholesale segmentation
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "A4 · ลูกค้าสองกลุ่มจากขนาดตะกร้า", "เกณฑ์: 12 หน่วยต่อบิล (1 โหล — ขั้นต่ำการขายส่งทั่วไป)");

  s.addChart(
    pres.charts.BAR,
    [
      {
        name: "% ของบิล",
        labels: ["ลูกค้าปลีก (≤12 หน่วย)", "ลูกค้าขายส่ง (>12 หน่วย)"],
        values: [7.17, 92.83],
      },
      {
        name: "% ของยอดขาย",
        labels: ["ลูกค้าปลีก (≤12 หน่วย)", "ลูกค้าขายส่ง (>12 หน่วย)"],
        values: [0.48, 99.52],
      },
    ],
    {
      x: 0.5,
      y: 1.7,
      w: 7.1,
      h: 4.55,
      barDir: "col",
      barGrouping: "clustered",
      chartColors: [ICE.replace("CADCFC", "8FA8E8"), GOLD],
      chartColorsOpacity: 100,
      showTitle: true,
      title: "สัดส่วนบิลเทียบสัดส่วนยอดขาย (%)",
      titleFontSize: 14,
      titleColor: TEXT_DARK,
      showLegend: true,
      legendPos: "b",
      legendColor: TEXT_DARK,
      legendFontSize: 12,
      showValue: true,
      dataLabelColor: TEXT_DARK,
      dataLabelFontSize: 11,
      dataLabelFormatCode: '0.0"%"',
      dataLabelPosition: "outEnd",
      catAxisLabelColor: TEXT_DARK,
      catAxisLabelFontSize: 12,
      valAxisLabelColor: TEXT_MUTED,
      valAxisLabelFontSize: 10,
      valGridLine: { color: "E2E9F7", size: 0.75 },
      catGridLine: { style: "none" },
    }
  );

  const rows2 = [
    [
      { text: "กลุ่ม", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } },
      { text: "บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } },
      { text: "% บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } },
      { text: "% ยอดขาย", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } },
      { text: "มูลค่าเฉลี่ย/บิล", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: "right" } },
    ],
    [
      { text: "ลูกค้าปลีก", options: { color: TEXT_DARK, bold: true, fill: { color: WHITE }, fontSize: 12.5 } },
      { text: "2,834", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } },
      { text: "7.17%", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } },
      { text: "0.48%", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } },
      { text: "£34.12", options: { color: TEXT_DARK, fill: { color: WHITE }, fontSize: 12.5, align: "right" } },
    ],
    [
      { text: "ลูกค้าขายส่ง", options: { color: TEXT_DARK, bold: true, fill: { color: "EAF0FC" }, fontSize: 12.5 } },
      { text: "36,683", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } },
      { text: "92.83%", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } },
      { text: "99.52%", options: { color: GOLD, bold: true, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } },
      { text: "£545.88", options: { color: TEXT_DARK, fill: { color: "EAF0FC" }, fontSize: 12.5, align: "right" } },
    ],
  ];
  s.addTable(rows2, {
    x: 7.85,
    y: 1.7,
    w: 4.9,
    h: 1.55,
    fontFace: THAI_BODY,
    border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false,
    colW: [1.1, 0.85, 0.95, 1.0, 1.0],
    rowH: 0.52,
    valign: "middle",
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.85,
    y: 3.5,
    w: 4.9,
    h: 1.55,
    rectRadius: 0.08,
    fill: { color: NAVY },
    line: { type: "none" },
    shadow: freshShadow(),
  });
  s.addText("มูลค่าเฉลี่ยต่อบิลของกลุ่มขายส่ง", {
    x: 8.1,
    y: 3.62,
    w: 4.4,
    h: 0.35,
    fontFace: THAI_BODY,
    fontSize: 12.5,
    color: ICE,
    margin: 0,
  });
  s.addText("สูงกว่ากลุ่มปลีกเกือบ 16 เท่า", {
    x: 8.1,
    y: 3.95,
    w: 4.4,
    h: 0.55,
    fontFace: THAI_HEAD,
    fontSize: 21,
    bold: true,
    color: GOLD,
    margin: 0,
  });
  s.addText("(£545.88 เทียบ £34.12) และกลุ่มขายส่งสร้างรายได้เกือบทั้งหมดของบริษัท", {
    x: 8.1,
    y: 4.5,
    w: 4.4,
    h: 0.5,
    fontFace: THAI_BODY,
    fontSize: 12,
    color: WHITE,
    lineSpacingMultiple: 1.2,
    margin: 0,
  });

  s.addText(
    "ข้อจำกัด: แบ่งกลุ่มระดับ \"บิล\" ไม่ใช่ระดับ \"ลูกค้า\" — การแบ่งกลุ่มลูกค้าอย่างเป็นทางการ (RFM + clustering) จะทำใน Goal 2 (G2-D2)",
    {
      x: 7.85,
      y: 5.25,
      w: 4.9,
      h: 0.95,
      fontFace: THAI_BODY,
      fontSize: 11,
      italic: true,
      color: TEXT_MUTED,
      lineSpacingMultiple: 1.25,
      margin: 0,
    }
  );

  addFooter(s, "A4 — Retail vs Wholesale Segmentation", false);
}

// =====================================================================
// Slide 7 — Summary / closing
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.OVAL, {
    x: -2.6,
    y: -2.6,
    w: 6,
    h: 6,
    fill: { color: "263480" },
    line: { type: "none" },
  });

  s.addText("สรุป G1-A", {
    x: 0.7,
    y: 0.55,
    w: 10,
    h: 0.7,
    fontFace: THAI_HEAD,
    fontSize: 34,
    bold: true,
    color: WHITE,
    margin: 0,
  });
  s.addText("โปรไฟล์บริษัทและกลยุทธ์ — พร้อมเดินหน้าสู่ G1-B", {
    x: 0.7,
    y: 1.2,
    w: 10,
    h: 0.4,
    fontFace: THAI_BODY,
    fontSize: 15,
    color: ICE,
    margin: 0,
  });

  const summary = [
    ["A1", "โปรไฟล์บริษัท", "ร้านค้าออนไลน์ของขวัญ UK ไม่มีหน้าร้าน ขายทั้งปลีก+ส่ง"],
    ["A2", "ตัวเลขจริง", "ยอดขาย £20.12M · UK 85.71% · 43 ประเทศ · ลูกค้า 5,852 ราย"],
    ["A3", "กลยุทธ์", "Cost Leadership เป็นแกน + Differentiation เสริมกลุ่มปลีก"],
    ["A4", "แบ่งกลุ่มลูกค้า", "ขายส่ง 92.83% ของบิล สร้างรายได้ 99.52% ของยอดขาย"],
  ];
  let sy = 1.95;
  summary.forEach(([tag, title, body]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7,
      y: sy,
      w: 11.9,
      h: 1.0,
      rectRadius: 0.08,
      fill: { color: "263480" },
      line: { color: "3C4B96", width: 1 },
    });
    iconCircle(s, 0.95, sy + 0.22, 0.55, tag, GOLD, NAVY);
    s.addText(title, {
      x: 1.7,
      y: sy + 0.1,
      w: 3.0,
      h: 0.8,
      fontFace: THAI_HEAD,
      fontSize: 15,
      bold: true,
      color: WHITE,
      valign: "middle",
      margin: 0,
    });
    s.addText(body, {
      x: 4.8,
      y: sy + 0.1,
      w: 7.6,
      h: 0.8,
      fontFace: THAI_BODY,
      fontSize: 13,
      color: ICE,
      valign: "middle",
      margin: 0,
    });
    sy += 1.15;
  });

  s.addText(
    "ต่อไป: G1-B · Systems Thinking → problem statement (นัดตรวจร่วมกันวันที่ 10 ก.ย.)",
    {
      x: 0.7,
      y: sy + 0.15,
      w: 11.9,
      h: 0.4,
      fontFace: THAI_BODY,
      fontSize: 13,
      italic: true,
      color: "9AA8D6",
      margin: 0,
    }
  );

  addFooter(s, "Source: UCI ML Repository — Online Retail II (Chen, 2019)", true);
}

pres.writeFile({ fileName: "G1-A-slides.pptx" }).then(() => {
  console.log("done");
});
