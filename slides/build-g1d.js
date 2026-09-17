// G1-D deck — D4-D8: cleaning decisions, EDA, data model, SQL, 5V characteristics.
// Same palette and helpers as build.js (G1-A) / build-g1b.js (G1-B) / build-g1c.js (G1-C).
// Every figure here comes from ../g1-d4-d8-data-decisions.md (sourced from ../analysis/g1d-output.json).
//
//   npm install && node build-g1d.js   ->  G1-D-slides.pptx

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

// ---------- helpers (identical to build-g1b.js / build-g1c.js) ----------
function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, dark) {
  slide.addText(label, {
    x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 1.6, h: 0.3,
    fontFace: THAI_BODY, fontSize: 11,
    color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0,
  });
  slide.addText("G1-D · INT 540 Data Analytics", {
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

  s.addText("TERM ASSIGNMENT · GOAL 1 · G1-D4–D8", {
    x: 0.9, y: 1.85, w: 11.5, h: 0.45,
    fontFace: THAI_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0,
  });
  s.addText("จากไฟล์แบนราบ สู่ข้อมูลที่พร้อมวิเคราะห์จริง", {
    x: 0.9, y: 2.35, w: 11.5, h: 1.3,
    fontFace: THAI_HEAD, fontSize: 42, bold: true, color: WHITE, margin: 0,
  });
  s.addText("การตัดสินใจจัดการข้อมูล · EDA · Data Model + SQL · 5V Characteristics", {
    x: 0.9, y: 3.55, w: 11.2, h: 0.6,
    fontFace: THAI_BODY, fontSize: 18, color: ICE, margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 4.55, w: 9.4, h: 0.9, rectRadius: 0.1,
    fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
  });
  s.addText([
    { text: "ฐานคำนวณ: ", options: { bold: true, color: GOLD } },
    { text: "1,067,371 แถวดิบ → 1,037,007 แถวขายจริง (97.16%) · ตัดออกเพียง 2.84% ตามเหตุผลที่ระบุทุกข้อ", options: { color: WHITE } },
  ], {
    x: 1.15, y: 4.55, w: 9.0, h: 0.9,
    fontFace: THAI_BODY, fontSize: 14, valign: "middle", margin: 0,
  });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", {
    x: 0.9, y: 6.65, w: 8, h: 0.4,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
  s.addText("Dataset: Online Retail II (UCI #502) · ทุกตัวเลข reproduce ได้จาก analysis/g1d.py", {
    x: 0.9, y: 7.0, w: 10, h: 0.35,
    fontFace: THAI_BODY, fontSize: 13, color: "9AA8D6", margin: 0,
  });
}

// =====================================================================
// Slide 2 — D4 cleaning decisions
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D4 · ตัดสินใจจัดการข้อมูล", "ทุกปัญหามีเหตุผลกำกับ — ห้ามลบเงียบ ๆ");

  const rows = tableOf(
    ["ปัญหา (ขนาด)", "การตัดสินใจ"],
    [
      ["แถวซ้ำ (34,335 · 3.2%)", "ตัดออกก่อนคำนวณทุกตัวเลข — export ซ้ำเป๊ะ ไม่ใช่ธุรกรรมจริง 2 รายการ"],
      ["Customer ID หาย (243,007 · 22.77% แถว, 12.68% ยอดขาย)", "เก็บในยอดขายรวม แต่ตัดออกจากตัวเลขระดับลูกค้าทั้งหมด"],
      ["ใบ C / ยกเลิก (19,494 แถว, -£1,526,668)", "แยกออกจากยอดขาย ไม่ลบทิ้ง — เก็บไว้ตอบคำถามเรื่องคืนของต่างหาก"],
      ["Quantity ติดลบ นอกใบ C (3,457 แถว)", "ตัดออกจากยอดขาย (เหมือนใบ C) · ทำเครื่องหมายไว้สืบต่อใน Goal 2"],
      ["Price = 0 / ติดลบ (6,207 แถว)", "ตัดออกจากยอดขาย — ของแจกฟรี/รายการปรับปรุงบัญชี ไม่ใช่รายได้"],
      ["StockCode ไม่ใช่สินค้า (5,913 แถว)", "ตัดออกจากยอดขายสินค้าเสมอ ไม่ว่าจะอยู่ใบปกติหรือใบ C"],
    ]
  );
  s.addTable(rows, {
    x: 0.5, y: 1.55, w: 12.35, h: 4.7,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [4.6, 7.75], rowH: 0.78, valign: "middle",
  });

  addFooter(s, "ผลรวม: เหลือ 1,037,007 แถวเป็นฐานคำนวณยอดขาย (97.16%) — ตัดออกเพียง 2.84% ส่วนใหญ่คือ \"ข้อมูลจริงที่ไม่ใช่ยอดขายสินค้า\" ไม่ใช่ข้อมูลเสีย");
}

// =====================================================================
// Slide 3 — D5 EDA: seasonality + top products
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D5 · EDA (1/2)", "ฤดูกาลคริสต์มาสชัดเจน และสินค้าขายดี 2 แบบ");

  s.addChart(
    pres.charts.LINE,
    [
      {
        name: "ยอดขายรายเดือน (£)",
        labels: ["ม.ค.11", "ก.พ.11", "มี.ค.11", "เม.ย.11", "พ.ค.11", "มิ.ย.11", "ก.ค.11", "ส.ค.11", "ก.ย.11", "ต.ค.11", "พ.ย.11", "ธ.ค.11"],
        values: [671933, 508886, 691258, 516218, 741192, 738752, 689364, 736576, 1030475, 1106670, 1457746, 615493],
      },
    ],
    {
      x: 0.5, y: 1.6, w: 7.0, h: 3.5,
      chartColors: [GOLD], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 5,
      showTitle: true, title: "ยอดขายรายเดือน 2554 (£) — เห็นพีค พ.ย.", titleFontSize: 13, titleColor: TEXT_DARK,
      showLegend: false,
      catAxisLabelColor: TEXT_DARK, catAxisLabelFontSize: 9,
      valAxisLabelColor: TEXT_MUTED, valAxisLabelFontSize: 9,
      valGridLine: { color: "E2E9F7", size: 0.75 }, catGridLine: { style: "none" },
    }
  );
  statCard(s, 0.5, 5.25, 3.4, 1.15, "27.32%", "ของยอดขายทั้งปี มาจาก พ.ย.–ธ.ค.", GOLD);
  statCard(s, 4.1, 5.25, 3.4, 1.15, "£1.10M", "เฉลี่ยเดือน พ.ย.–ธ.ค. (vs £0.73M เดือนอื่น)", NAVY);

  s.addText("สินค้าขายดี — คนละแบบ ตามรายได้ vs จำนวนชิ้น", {
    x: 7.85, y: 1.6, w: 4.9, h: 0.6,
    fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, margin: 0, lineSpacingMultiple: 1.1,
  });
  const rows = tableOf(
    ["อันดับ 1", "ตามรายได้", "ตามจำนวนชิ้น"],
    [
      ["", "CAKESTAND 3 TIER\n£344,563", "WW2 GLIDERS\n110,138 ชิ้น"],
      ["อันดับ 2", "T-LIGHT HOLDER\n£263,110", "JUMBO BAG RETROSPOT\n98,349 ชิ้น"],
    ]
  );
  s.addTable(rows, {
    x: 7.85, y: 2.3, w: 4.9, h: 1.7,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [1.3, 1.8, 1.8], rowH: 0.55, valign: "middle",
  });

  noteBar(s, 7.85, 4.3, 4.9, 2.1, [
    { text: "สินค้าราคาสูงขายน้อยชิ้น ≠ สินค้าราคาถูกขายเยอะ — ", options: { bold: true } },
    { text: "ตรงกับที่ G1-A ระบุลูกค้า 2 กลุ่ม (ปลีก/ขายส่ง): กลุ่มขายส่งซื้อของราคาถูกจำนวนมาก กลุ่มปลีกซื้อของราคาสูงจำนวนน้อย", options: {} },
  ]);

  addFooter(s, "ธ.ค. 2011 ต่ำผิดปกติเพราะข้อมูลตัดที่วันที่ 9 ธ.ค. — ยังไม่ครบเดือน ไม่ใช่ยอดขายตกจริง");
}

// =====================================================================
// Slide 4 — D5 EDA: country + basket
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D5 · EDA (2/2)", "กระจายตามประเทศ และมูลค่าตะกร้า");

  s.addChart(
    pres.charts.DOUGHNUT,
    [{ name: "Revenue Share", labels: ["United Kingdom", "ต่างประเทศ (42 ประเทศ)"], values: [85.71, 14.29] }],
    {
      x: 0.5, y: 1.6, w: 5.6, h: 3.3,
      chartColors: [NAVY, GOLD], showLegend: true, legendPos: "b", legendColor: TEXT_DARK, legendFontSize: 12,
      showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 12, dataLabelFormatCode: '0.0"%"', holeSize: 55,
    }
  );

  s.addText("มูลค่าตะกร้าต่อ 1 ใบเสร็จ (£)", {
    x: 6.5, y: 1.6, w: 6.2, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: TEXT_DARK, margin: 0,
  });
  const rows = tableOf(
    ["สถิติ", "ค่า (£)"],
    [
      ["P25", "152.55"], ["มัธยฐาน", { text: "303.22", bold: true, color: NAVY }],
      ["เฉลี่ย", { text: "509.18", bold: true, color: GOLD }], ["P75", "496.30"], ["P95", "1,450.64"],
    ]
  );
  s.addTable(rows, {
    x: 6.5, y: 2.05, w: 6.2, h: 2.4,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [3.1, 3.1], rowH: 0.4, valign: "middle",
  });

  noteBar(s, 0.5, 5.15, 12.2, 1.4, [
    { text: "เฉลี่ย (£509) สูงกว่ามัธยฐาน (£303) มาก — ", options: { bold: true } },
    { text: "แปลว่ามีตะกร้าขนาดใหญ่ผิดปกติ (ลูกค้าขายส่ง) ดึงค่าเฉลี่ยขึ้น สอดคล้องกับ P95 ที่กระโดดไปถึง £1,450 · ยืนยันการมีลูกค้า 2 กลุ่มอีกครั้งด้วยมุมมองคนละมุมจาก G1-A · นอก UK ประเทศที่ขายดีสุด: EIRE, Netherlands, Germany, France", options: {} },
  ]);

  addFooter(s, "UK ครองยอดขาย 85.71% — ธุรกิจกระจุกตัวหนัก เป็นความเสี่ยงเชิงกลยุทธ์ที่ต้องพูดถึง");
}

// =====================================================================
// Slide 5 — D6 Data model
// =====================================================================
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
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: t.x, y: 1.65, w: 2.6, h: 1.7, rectRadius: 0.08,
      fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow(),
    });
    s.addText(t.name, {
      x: t.x, y: 1.75, w: 2.6, h: 0.4, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: GOLD, align: "center", margin: 0,
    });
    s.addText(t.fields, {
      x: t.x + 0.15, y: 2.2, w: 2.3, h: 1.1, fontFace: THAI_BODY, fontSize: 11.5, color: WHITE, lineSpacingMultiple: 1.25, margin: 0,
    });
  });
  [3.25, 6.4, 9.55].forEach((x) => {
    s.addText("→", { x, y: 2.15, w: 0.5, h: 0.7, fontFace: THAI_HEAD, fontSize: 22, bold: true, color: TEXT_DARK, align: "center", valign: "middle", margin: 0 });
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 3.7, w: 12.1, h: 1.55, rectRadius: 0.1,
    fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 },
  });
  s.addText([
    { text: "ทำไม Price อยู่ที่ INVOICE_LINE ไม่ใช่ PRODUCT:  ", options: { bold: true, color: GOLD } },
    { text: "ทดลองเก็บราคาเดียวต่อสินค้า (median) ที่ PRODUCT ก่อน แล้วพบว่าราคาสินค้าเดียวกันเปลี่ยนตามเวลา/ลูกค้า ทำให้ยอดขายที่ JOIN คำนวณคลาดจากยอดขายจริงได้เกือบ 4 เท่าในบางประเทศ — ระบบวางบิลจริงล็อกราคาไว้ ณ วันที่ขาย ไม่อ้างอิงราคาปัจจุบันย้อนหลัง จึงย้าย Price มาไว้ที่ INVOICE_LINE", options: { color: TEXT_DARK } },
  ], { x: 0.9, y: 3.7, w: 11.5, h: 1.55, fontFace: THAI_BODY, fontSize: 13.5, valign: "middle", lineSpacingMultiple: 1.25, margin: 0 });

  noteBar(s, 0.6, 5.55, 12.1, 1.35, [
    { text: "ปัญหา flat file ที่เจอจริง: ", options: { bold: true, color: RED } },
    { text: "ไม่มี foreign key เชื่อมใบ C กลับไปใบขายเดิม (จับคู่ได้แค่ Customer ID + StockCode + วันที่ใกล้กัน) · ราคาสินค้าปนอยู่ทุกแถวไม่มีที่เก็บแยก · Description สะกดต่างกันในหลายแถว — ปัญหาคลาสสิกของ traditional file environment ตรงตามที่เรียนคาบ 27 ส.ค.", options: {} },
  ], "FBE9E7", RED);

  addFooter(s, "จำนวนแถวจริง: CUSTOMER 5,852 · PRODUCT 4,898 · INVOICE 36,594 · INVOICE_LINE 802,634");
}

// =====================================================================
// Slide 6 — D7 SQL join
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "D7 · SQL ที่ JOIN ตอบคำถามธุรกิจ", "นอก UK ประเทศไหนสร้างรายได้มากที่สุด");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.6, w: 12.1, h: 1.55, rectRadius: 0.08,
    fill: { color: NAVY }, line: { type: "none" },
  });
  s.addText(
    "SELECT c.Country, COUNT(DISTINCT c.Customer_ID) n_customers, COUNT(DISTINCT i.Invoice) n_orders,\n" +
      "       ROUND(SUM(il.Quantity * il.Price), 2) revenue_gbp\n" +
      "FROM CUSTOMER c JOIN INVOICE i ON i.Customer_ID = c.Customer_ID\n" +
      "JOIN INVOICE_LINE il ON il.Invoice = i.Invoice JOIN PRODUCT p ON p.StockCode = il.StockCode\n" +
      "WHERE c.Country != 'United Kingdom' GROUP BY c.Country ORDER BY revenue_gbp DESC LIMIT 10;",
    { x: 0.85, y: 1.68, w: 11.6, h: 1.4, fontFace: "Consolas", fontSize: 12, color: ICE, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 }
  );

  const rows = tableOf(
    ["Country", "n_customers", "n_orders", "revenue_gbp"],
    [
      [{ text: "EIRE", color: GOLD, bold: true }, "3", "528", { text: "591,536.65", bold: true }],
      ["Netherlands", "22", "216", "549,952.66"],
      ["Germany", "106", "752", "388,732.70"],
      ["France", "93", "592", "315,544.07"],
      ["Australia", "14", "87", "169,137.44"],
    ]
  );
  s.addTable(rows, {
    x: 0.6, y: 3.4, w: 7.1, h: 2.55,
    fontFace: THAI_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 },
    autoPage: false, colW: [2.3, 1.5, 1.5, 1.8], rowH: 0.42, valign: "middle",
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.95, y: 3.4, w: 4.8, h: 2.55, rectRadius: 0.08,
    fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow(),
  });
  s.addText("สังเกตที่พูดบนเวทีได้", {
    x: 8.2, y: 3.55, w: 4.3, h: 0.4, fontFace: THAI_HEAD, fontSize: 16, bold: true, color: GOLD, margin: 0,
  });
  s.addText(
    "EIRE มีลูกค้าแค่ 3 ราย แต่รายได้สูงสุดนอก UK และมี 528 ออเดอร์ (เฉลี่ย 176 ออเดอร์/ราย)\n\n" +
      "ตรงข้ามกับ Germany ที่มีลูกค้า 106 รายแต่รายได้ต่ำกว่า\n\n" +
      "แปลว่า EIRE เป็นลูกค้าขายส่งรายใหญ่ไม่กี่ราย — concentration risk ต่างจากตลาดที่กระจายลูกค้ามากกว่า",
    { x: 8.2, y: 4.0, w: 4.3, h: 1.9, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.2, valign: "top", margin: 0 }
  );

  addFooter(s, "รันจริงด้วย SQLite ใน analysis/g1d.py — ตัวเลขใกล้เคียงยอดขายจริงใน D5 (คลาดไม่เกิน 1-2% ส่วนใหญ่ ดูเหตุผลใน g1-d4-d8-data-decisions.md)");
}

// =====================================================================
// Slide 7 — D8 5V characteristics
// =====================================================================
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
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: vy, w: 12.1, h: 0.92, rectRadius: 0.08,
      fill: { color: CARD_BG }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow(),
    });
    s.addShape(pres.shapes.OVAL, { x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fill: { color }, line: { type: "none" } });
    s.addText(name[0], {
      x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fontFace: THAI_HEAD, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    s.addText(name, {
      x: 1.65, y: vy + 0.1, w: 1.9, h: 0.72, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, valign: "middle", margin: 0,
    });
    s.addText(desc, {
      x: 3.6, y: vy + 0.1, w: 8.9, h: 0.72, fontFace: THAI_BODY, fontSize: 12.5, color: TEXT_MUTED, valign: "middle", lineSpacingMultiple: 1.15, margin: 0,
    });
    vy += 1.02;
  });

  addFooter(s, "ข้อสรุป: relational database ที่มีปริมาณค่อนข้างมาก ไม่ใช่ Big Data เต็มรูปแบบ — Volume ผ่าน แต่ Velocity/Variety ไม่เข้าเกณฑ์ 5V ครบ");
}

// =====================================================================
// Slide 8 — Summary / closing
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: 4.4, w: 5.6, h: 5.6, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("สรุป G1-D4–D8", {
    x: 0.7, y: 0.6, w: 11.9, h: 0.7,
    fontFace: THAI_HEAD, fontSize: 34, bold: true, color: WHITE, margin: 0,
  });
  s.addText("ข้อมูลพร้อมใช้จริง — ตัดสินใจ + ตรวจสอบครบทุกขั้น", {
    x: 0.7, y: 1.2, w: 11.9, h: 0.4,
    fontFace: THAI_BODY, fontSize: 15, color: ICE, margin: 0,
  });

  const summary = [
    ["D4", "ตัดสินใจจัดการข้อมูล", "6 ปัญหา พร้อมเหตุผล — ตัดออกจริงแค่ 2.84% ของแถวทั้งหมด"],
    ["D5", "EDA", "ฤดูกาลคริสต์มาส (27.32%) · สินค้าขายดี 2 แบบ · UK 85.71% · มูลค่าตะกร้า"],
    ["D6", "Data Model", "4 ตาราง PK/FK — แก้บั๊กราคาสินค้าจนยอดขายตรงกับไฟล์ดิบ"],
    ["D7–D8", "SQL + 5V", "JOIN ตอบคำถามธุรกิจได้จริง · Veracity คือจุดเสี่ยงสุดของข้อมูลชุดนี้"],
  ];
  let sy = 1.95;
  summary.forEach(([tag, title, body]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.7, y: sy, w: 11.9, h: 1.0, rectRadius: 0.08,
      fill: { color: "263480" }, line: { color: "3C4B96", width: 1 },
    });
    iconCircle(s, 0.95, sy + 0.22, 0.55, tag, GOLD, NAVY);
    s.addText(title, {
      x: 1.7, y: sy + 0.1, w: 3.0, h: 0.8, fontFace: THAI_HEAD, fontSize: 15, bold: true, color: WHITE, valign: "middle", margin: 0,
    });
    s.addText(body, {
      x: 4.8, y: sy + 0.1, w: 7.6, h: 0.8, fontFace: THAI_BODY, fontSize: 13, color: ICE, valign: "middle", margin: 0,
    });
    sy += 1.15;
  });

  s.addText(
    "ต่อไป: G1-E — รวมสไลด์ A+B+C+D เป็นเด็คเดียว แล้วซ้อมนำเสนอ",
    { x: 0.7, y: sy + 0.15, w: 11.9, h: 0.4, fontFace: THAI_BODY, fontSize: 13, italic: true, color: "9AA8D6", margin: 0 }
  );

  addFooter(s, "ทุกตัวเลขในเด็คนี้ reproduce ได้: unzip -o data/online_retail_II.csv.zip -d data && python3 analysis/g1d.py", true);
}

pres.writeFile({ fileName: "G1-D-slides.pptx" }).then(() => {
  console.log("done");
});
