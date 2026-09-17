// G1 PRESENTATION deck — English, condensed for a 15-minute talk + 5-minute Q&A.
// Main deck: ~14 slides (~1 min/slide). Appendix: backup slides for anticipated
// questions (TOWS/Value Chain detail, 5V, return breakdown, full cleaning table) —
// these do NOT count against the 15-minute budget.
// Same palette/helpers as build-g1-full.js. All figures verified in the Thai .md
// deliverables (g1-a/b/c/d) — this deck only translates and condenses, no new numbers.
//
//   npm install && node build-g1-presentation.js   ->  G1-presentation.pptx

const pptxgen = require("pptxgenjs");

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

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PAGE_W = 13.33;
const PAGE_H = 7.5;

function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}

function addFooter(slide, label, dark) {
  slide.addText(label, {
    x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 1.6, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0,
  });
  slide.addText("Term Assignment · Goal 1 · INT 540", {
    x: PAGE_W - 3.6, y: PAGE_H - 0.42, w: 3.1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, color: dark ? "8895B8" : TEXT_MUTED, align: "right", margin: 0,
  });
}

function iconCircle(slide, x, y, diameter, label, fill = GOLD, textColor = NAVY) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: diameter, h: diameter, fill: { color: fill }, line: { type: "none" }, shadow: freshShadow() });
  slide.addText(label, { x, y, w: diameter, h: diameter, fontFace: FONT_HEAD, fontSize: diameter > 0.7 ? 20 : 15, bold: true, color: textColor, align: "center", valign: "middle", margin: 0 });
}

function statCard(slide, x, y, w, h, bigText, smallText, accent = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  slide.addText(bigText, { x: x + 0.12, y: y + 0.1, w: w - 0.24, h: h * 0.58, fontFace: FONT_HEAD, fontSize: 26, bold: true, color: accent, align: "center", valign: "bottom", margin: 0 });
  slide.addText(smallText, { x: x + 0.1, y: y + h * 0.6, w: w - 0.2, h: h * 0.38, fontFace: FONT_BODY, fontSize: 12, color: TEXT_MUTED, align: "center", valign: "top", margin: 0 });
}

function slideTitle(slide, kicker, title) {
  slide.addText(kicker, { x: 0.6, y: 0.35, w: PAGE_W - 1.2, h: 0.35, fontFace: FONT_BODY, fontSize: 14, bold: true, color: GOLD, align: "left", margin: 0, charSpacing: 1 });
  slide.addText(title, { x: 0.6, y: 0.68, w: PAGE_W - 1.2, h: 0.75, fontFace: FONT_HEAD, fontSize: 30, bold: true, color: TEXT_DARK, align: "left", margin: 0 });
}

function noteBar(slide, x, y, w, h, textRuns, fill = "FFF4E0", line = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: line, width: 1 } });
  slide.addText(textRuns, { x: x + 0.22, y, w: w - 0.44, h, fontFace: FONT_BODY, fontSize: 13.5, color: TEXT_DARK, valign: "middle", lineSpacingMultiple: 1.25, margin: 0 });
}

function tableOf(header, body) {
  const head = header.map((t, i) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5, align: i === 0 ? "left" : "center" } }));
  const rows = body.map((r, i) => r.map((cell, j) => {
    const c = typeof cell === "object" ? cell : { text: cell };
    return { text: c.text, options: { color: c.color || (j === 0 ? TEXT_DARK : TEXT_MUTED), bold: c.bold || j === 0, fill: { color: c.fill || (i % 2 === 0 ? WHITE : "EAF0FC") }, fontSize: c.fontSize || 12, align: j === 0 ? "left" : "center" } };
  }));
  return [head, ...rows];
}

function sectionTag(slide, text) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.32, w: 1.55, h: 0.32, rectRadius: 0.16, fill: { color: GOLD }, line: { type: "none" } });
  slide.addText(text, { x: 0.6, y: 0.32, w: 1.55, h: 0.32, fontFace: FONT_HEAD, fontSize: 11, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
}

function appendixDivider() {
  const s = pres.addSlide();
  s.background = { color: "3C3C3C" };
  s.addText("APPENDIX", { x: 0.9, y: 2.9, w: 11.5, h: 0.5, fontFace: FONT_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText("Backup slides for Q&A", { x: 0.9, y: 3.4, w: 11.5, h: 1.0, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: WHITE, margin: 0 });
  s.addText("Not part of the 15-minute presentation — used only if the panel asks", { x: 0.9, y: 4.3, w: 11.2, h: 0.5, fontFace: FONT_BODY, fontSize: 15, color: "BFC7DA", margin: 0 });
}

// =====================================================================
// MAIN DECK — target 15 minutes
// =====================================================================

// ---- 1. Title ----
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: "263480" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.4, y: 4.6, w: 5.2, h: 5.2, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("TERM ASSIGNMENT · GOAL 1", { x: 0.9, y: 1.75, w: 11.5, h: 0.45, fontFace: FONT_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0 });
  s.addText("Detecting Silent Customers Before They Disappear", { x: 0.9, y: 2.25, w: 11.5, h: 1.3, fontFace: FONT_HEAD, fontSize: 38, bold: true, color: WHITE, margin: 0 });
  s.addText("A UK online gift retailer · Business problem, data readiness, and measurement plan", { x: 0.9, y: 3.35, w: 11.2, h: 0.6, fontFace: FONT_BODY, fontSize: 17, color: ICE, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 4.35, w: 10.6, h: 0.9, rectRadius: 0.1, fill: { color: "263480" }, line: { color: "3C4B96", width: 1 } });
  s.addText([
    { text: "Dataset: ", options: { bold: true, color: GOLD } },
    { text: "Online Retail II — UCI ML Repository #502  ·  1,067,371 rows  ·  Dec 2009 – Dec 2011  ·  Clean sales base: 1,037,007 rows, £20,121,372.19", options: { color: WHITE } },
  ], { x: 1.15, y: 4.35, w: 10.2, h: 0.9, fontFace: FONT_BODY, fontSize: 13, valign: "middle", margin: 0 });

  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", { x: 0.9, y: 6.75, w: 8, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, color: "9AA8D6", margin: 0 });
  s.addText("15-minute presentation + 5-minute Q&A", { x: 0.9, y: 7.05, w: 8, h: 0.3, fontFace: FONT_BODY, fontSize: 11.5, color: "9AA8D6", margin: 0 });
}

// ---- 2. Company snapshot ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "COMPANY");
  slideTitle(s, "A1–A2 · Company Snapshot", "A UK gift retailer serving both retail and wholesale buyers");

  const stats = [["£20.12M", "Total net revenue"], ["5,852", "Identified customers"], ["4,898", "Active SKUs"], ["43", "Countries served"]];
  const cardW = 2.68, gap = 0.18; let cx = 0.6;
  stats.forEach(([big, small]) => { statCard(s, cx, 1.65, cardW, 1.2, big, small); cx += cardW + gap; });

  s.addText(
    "A non-store, all-occasion gift-ware retailer. Two customer types share one order stream: " +
      "retail buyers (small baskets, gifts) and wholesalers (large baskets, resell). " +
      "Core market is the UK; the rest is spread across 42 other countries.",
    { x: 0.6, y: 3.15, w: 6.4, h: 1.7, fontFace: FONT_BODY, fontSize: 15, color: TEXT_DARK, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }
  );

  s.addChart(pres.charts.DOUGHNUT, [{ name: "Revenue Share", labels: ["United Kingdom", "International (42 countries)"], values: [85.71, 14.29] }], {
    x: 6.9, y: 2.9, w: 5.8, h: 3.9, chartColors: [NAVY, GOLD], showLegend: true, legendPos: "b", legendColor: TEXT_DARK, legendFontSize: 12,
    showValue: true, dataLabelColor: WHITE, dataLabelFontSize: 12, dataLabelFormatCode: '0.0"%"', holeSize: 55,
  });

  noteBar(s, 0.6, 5.15, 6.0, 1.6, [
    { text: "Two customer segments, by basket size: ", options: { bold: true } },
    { text: "wholesale baskets (>12 units) are 92.83% of orders and 99.52% of revenue; retail baskets are the remaining, smaller share. Average wholesale order is 16x larger than retail.", options: {} },
  ]);

  addFooter(s, "Base = clean sales rows only (excludes cancellations, non-product lines, Qty/Price ≤ 0)");
}

// ---- 3. Strategy ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "STRATEGY");
  slideTitle(s, "A3–A4 · Competitive Strategy", "Cost Leadership at the core, Differentiation for the retail edge");

  const forces = [
    ["Buyer Power", "Med–High"], ["Supplier Power", "Low–Med"], ["Substitutes", "High"], ["New Entrants", "High"], ["Rivalry", "High"],
  ];
  const levelColor = { "Med–High": "B98A2E", "Low–Med": "5B8A5E", High: "B3402F" };
  const header = [{ text: "Five Forces", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13 } }, { text: "Pressure", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, align: "center" } }];
  const body = forces.map(([f, lvl], i) => [
    { text: f, options: { color: TEXT_DARK, bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5 } },
    { text: lvl, options: { color: levelColor[lvl], bold: true, fill: { color: i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: 12.5, align: "center" } },
  ]);
  s.addTable([header, ...body], { x: 0.6, y: 1.7, w: 4.6, h: 3.6, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.0, 1.6], rowH: 0.6, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.7, w: 3.3, h: 3.6, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("Chosen strategy", { x: 5.75, y: 1.9, w: 2.9, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, bold: true, color: GOLD, margin: 0 });
  s.addText("Cost Leadership", { x: 5.75, y: 2.25, w: 2.9, h: 0.55, fontFace: FONT_HEAD, fontSize: 21, bold: true, color: WHITE, margin: 0 });
  s.addText("+ light Differentiation", { x: 5.75, y: 2.75, w: 2.9, h: 0.4, fontFace: FONT_BODY, fontSize: 14, color: ICE, margin: 0 });
  s.addText("Wholesale volume (>12-unit baskets) drives 99.52% of revenue — broad-market cost focus, with select SKUs for higher-paying retail buyers.", { x: 5.75, y: 3.25, w: 2.9, h: 1.9, fontFace: FONT_BODY, fontSize: 12, color: WHITE, lineSpacingMultiple: 1.25, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.05, y: 1.7, w: 3.7, h: 3.6, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText("Strategic risk to watch", { x: 9.3, y: 1.9, w: 3.2, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, bold: true, color: GOLD, margin: 0 });
  s.addText("27.65% of customers buy once and never return — a retention gap under a high-rivalry, low-entry-barrier market where switching is easy.", { x: 9.3, y: 2.3, w: 3.2, h: 2.9, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.3, margin: 0 });

  addFooter(s, "Full TOWS matrix and Value Chain mapping — see Appendix");
}

// ---- 4. Systems gap ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "THE PROBLEM");
  slideTitle(s, "B1 · A Missing Feedback Loop", "The business measures sales, but nothing warns it before a customer goes silent");

  const boxes = [
    { x: 0.6, title: "INPUT", items: ["53,628 orders", "4,898 SKUs", "UK + 42 countries"] },
    { x: 4.9, title: "PROCESS", items: ["1. Take order", "2. Pack & ship", "3. Invoice", "4. Returns / cancellations"] },
    { x: 9.2, title: "OUTPUT", items: ["£20.1M revenue", "5,852 customers", "-£1.53M returns", "40.64% gone silent"] },
  ];
  boxes.forEach((b) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: b.x, y: 1.75, w: 3.5, h: 2.3, rectRadius: 0.1, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
    s.addText(b.title, { x: b.x, y: 1.85, w: 3.5, h: 0.4, fontFace: FONT_HEAD, fontSize: 15, bold: true, color: GOLD, align: "center", charSpacing: 1.5, margin: 0 });
    s.addText(b.items.map((t) => ({ text: t, options: { breakLine: true } })), { x: b.x + 0.28, y: 2.25, w: 3.0, h: 1.7, fontFace: FONT_BODY, fontSize: 13, color: TEXT_DARK, bullet: { code: "2022" }, lineSpacingMultiple: 1.3, margin: 0 });
  });
  [4.25, 8.55].forEach((x) => { s.addText("→", { x, y: 2.6, w: 0.7, h: 0.7, fontFace: FONT_HEAD, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 }); });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.35, w: 12.1, h: 0.95, rectRadius: 0.1, fill: { color: "FBE9E7" }, line: { color: RED, width: 1.5, dashType: "dash" } });
  s.addText([
    { text: "The missing feedback loop — ", options: { bold: true, color: RED } },
    { text: "the system knows total revenue, but no step tells anyone which customer is about to go silent, or where returns concentrate.", options: { color: TEXT_DARK } },
  ], { x: 0.9, y: 4.35, w: 11.5, h: 0.95, fontFace: FONT_BODY, fontSize: 15, valign: "middle", margin: 0 });

  noteBar(s, 0.6, 5.5, 12.1, 1.15, [
    { text: "Without feedback, the system can't self-correct — ", options: { bold: true } },
    { text: "this is the root of both pain points on the next slides, and it's exactly the gap our Goal 2 solution fills.", options: {} },
  ]);

  addFooter(s, "Scope chosen (B2): the customer journey of a repeat buyer — the one path the data can prove end to end");
}

// ---- 5. Pain point 1 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "THE PROBLEM");
  slideTitle(s, "B3 · Loyal Customers Are the Real Money", "27.65% buy once — but that's only 3.23% of revenue");

  const rows = tableOf(["Customer group", "% of customers", "% of revenue"], [
    [{ text: "One-time buyers", color: RED }, { text: "27.65%", color: RED, bold: true }, { text: "3.23%", color: RED, bold: true }],
    [{ text: "11+ orders", color: GREEN }, { text: "14.76%", color: GREEN, bold: true }, { text: "64.67%", color: GREEN, bold: true }],
    [{ text: "Silent > 180 days", color: NAVY }, { text: "40.64% (2,378)", color: NAVY, bold: true }, { text: "13.49%", color: TEXT_MUTED }],
  ]);
  s.addTable(rows, { x: 0.6, y: 1.7, w: 6.7, h: 1.9, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.9, 1.9, 1.9], rowH: 0.55, valign: "middle" });

  statCard(s, 7.6, 1.7, 2.4, 1.4, "56 days", "Median time to 2nd purchase", NAVY);
  statCard(s, 10.1, 1.7, 2.6, 1.4, "11.4×", "Repeat buyers spend vs one-time", GREEN);

  noteBar(s, 0.6, 3.9, 12.1, 1.1, [
    { text: "If every one-time buyer were fixed, revenue rises less than 4%. ", options: { bold: true, color: RED } },
    { text: "The real money — and the real risk — is losing the loyal customers who are already going quiet.", options: {} },
  ]);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.25, w: 12.1, h: 1.35, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  s.addText([
    { text: "£813,004  ", options: { fontSize: 24, bold: true, color: RED } },
    { text: "in revenue is held by the 205 loyal customers (6+ orders) who have already gone silent — the value directly at risk today.", options: { fontSize: 13.5, color: TEXT_DARK } },
  ], { x: 0.9, y: 5.25, w: 11.5, h: 1.35, fontFace: FONT_BODY, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });

  addFooter(s, "Cohort check: customers who had a full 12-month window still show 24.79% never-return — confirms the pattern isn't a timing artifact");
}

// ---- 6. Pain point 2 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "THE PROBLEM");
  slideTitle(s, "B4 · Returns: the Real Number Is 3.61%, Not 7.59%", "A naive read overstates returns by more than 2x");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1, fill: { color: "FBE9E7" }, line: { color: RED, width: 1 } });
  s.addText([
    { text: "Naive reading\n", options: { fontSize: 13, color: TEXT_MUTED } },
    { text: "-£1,526,668  =  7.59%", options: { fontSize: 22, bold: true, color: RED } },
    { text: "\nof revenue — includes non-return line items", options: { fontSize: 12, color: TEXT_MUTED } },
  ], { x: 0.9, y: 1.75, w: 5.3, h: 1.4, fontFace: FONT_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.8, y: 1.7, w: 5.9, h: 1.5, rectRadius: 0.1, fill: { color: "EAF5EC" }, line: { color: GREEN, width: 1 } });
  s.addText([
    { text: "Correct — real product returns\n", options: { fontSize: 13, color: TEXT_MUTED } },
    { text: "-£726,589  =  3.61%", options: { fontSize: 22, bold: true, color: GREEN } },
    { text: "\nof revenue — 47.59% of the credit-note total", options: { fontSize: 12, color: TEXT_MUTED } },
  ], { x: 7.1, y: 1.75, w: 5.3, h: 1.4, fontFace: FONT_BODY, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  noteBar(s, 0.6, 3.45, 12.1, 1.1, [
    { text: "52.41% of credit-note value isn't a return at all — ", options: { bold: true, color: RED } },
    { text: "it's Manual adjustments, Amazon fees, and bank charges that happen to share the same \"C-invoice\" mechanism as returns. Counting them as returns overstates the problem 2x.", options: {} },
  ]);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.75, w: 12.1, h: 1.85, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText("What we will NOT claim on stage", { x: 0.85, y: 4.9, w: 11.6, h: 0.35, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: GOLD, margin: 0 });
  s.addText(
    "\"Returning a product means a customer is about to churn\" — the data says the opposite: repeat buyers return 53.80% of the time vs. 13.47% for one-time buyers (they simply order more, so they return more). We keep this as an untested hypothesis for Goal 2, not a conclusion.",
    { x: 0.85, y: 5.25, w: 11.6, h: 1.25, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.25, margin: 0 }
  );

  addFooter(s, "Return-code detail (Manual, AmazonFee, Bank Charges breakdown) — see Appendix");
}

// ---- 7. Problem statement ----
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: -2.6, w: 6.0, h: 6.0, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("B5 · PROBLEM STATEMENT", { x: 0.7, y: 0.5, w: 11.9, h: 0.4, fontFace: FONT_BODY, fontSize: 14, bold: true, color: GOLD, charSpacing: 1.5, margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 1.1, w: 11.9, h: 2.9, rectRadius: 0.1, fill: { color: "263480" }, line: { color: GOLD, width: 1.5 } });
  s.addText(
    "Across two years of data, 27.65% (1,618) of our 5,852 identified customers bought only once and never returned, " +
      "and 40.64% (2,378) have gone silent for more than 180 days — including 205 loyal customers (6+ orders) holding " +
      "£813,004 in revenue. The business has no step that detects this before a customer is already gone, even though " +
      "repeat buyers generate 11.4x more revenue per head than one-time buyers.",
    { x: 1.05, y: 1.25, w: 11.2, h: 2.6, fontFace: FONT_HEAD, fontSize: 18, color: WHITE, valign: "middle", lineSpacingMultiple: 1.3, margin: 0 }
  );

  const parts = [
    ["Symptom", "Buys once and vanishes, or goes silent past 180 days, with no system aware of it"],
    ["Size", "27.65% (1,618) · 40.64% (2,378) · 205 of them are loyal customers"],
    ["Impact", "£813,004 = 4.66% of revenue at risk today + lost upside from 11.4x higher-value repeat buyers"],
  ];
  let py = 4.3;
  parts.forEach(([tag, text]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: py, w: 1.7, h: 0.62, rectRadius: 0.08, fill: { color: GOLD }, line: { type: "none" } });
    s.addText(tag, { x: 0.7, y: py, w: 1.7, h: 0.62, fontFace: FONT_HEAD, fontSize: 15, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
    s.addText(text, { x: 2.6, y: py, w: 10.0, h: 0.62, fontFace: FONT_BODY, fontSize: 14.5, color: ICE, valign: "middle", margin: 0 });
    py += 0.72;
  });

  s.addText(
    "Why \"silent customers,\" not \"returns\": real returns (£726,589) sit with just 25 customers — solved with a phone call. " +
      "Going silent is spread across the whole base, invisible without analysis.",
    { x: 0.7, y: 6.65, w: 11.9, h: 0.6, fontFace: FONT_BODY, fontSize: 12.5, italic: true, color: "9AA8D6", lineSpacingMultiple: 1.2, margin: 0 }
  );
}

// ---- 8. Customer Journey Map ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "THE PROBLEM");
  slideTitle(s, "B6 · Customer Journey Map", "Where customers drop off, and how many");

  const stages = ["1. First order", "2. Receives goods", "3. Repeat purchase", "4. Return / issue", "5. Goes silent"];
  const grid = [
    ["STEPS", "Browse → order", "Receive → check", "Reorders (56d median)", "Files return → credit note", "No further orders"],
    ["TOUCHPOINTS", "Website · order form", "Parcel · postage", "New order form", "Credit note (Invoice C)", "None"],
    ["ACTORS", "Customer · sales", "Carrier · warehouse", "Customer · sales", "Support · accounting", "No one owns this"],
    ["EMOTIONS", "Interested (+)", "Neutral (0)", "Satisfied (+)", "Frustrated (-)", "Disengaged, then gone (-)"],
  ];
  const header = [{ text: "STAGE", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12.5 } }].concat(
    stages.map((t, i) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: i === 4 ? "8A2E22" : NAVY }, fontSize: 12.5, align: "center" } }))
  );
  const body = grid.map((r, i) => r.map((cell, j) => ({ text: cell, options: { bold: j === 0, color: j === 0 ? NAVY : j === 5 ? RED : TEXT_DARK, fill: { color: j === 0 ? "DCE6F8" : i % 2 === 0 ? WHITE : "EAF0FC" }, fontSize: j === 0 ? 12 : 12.5, align: "left" } })));
  const dropRow = [
    { text: "Drop-off", options: { bold: true, color: NAVY, fill: { color: "DCE6F8" }, fontSize: 12 } },
    { text: "5,852 identified", options: { color: TEXT_DARK, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "—", options: { color: TEXT_MUTED, fill: { color: "FFF4E0" }, fontSize: 12.5, align: "center" } },
    { text: "1,618 lost (27.65%)", options: { bold: true, color: RED, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "42.65% ever returned", options: { color: TEXT_DARK, fill: { color: "FFF4E0" }, fontSize: 12.5 } },
    { text: "2,378 silent >180d (40.64%)", options: { bold: true, color: RED, fill: { color: "FFE8E3" }, fontSize: 12.5 } },
  ];
  s.addTable([header, ...body, dropRow], { x: 0.45, y: 1.6, w: 12.45, h: 3.9, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [1.55, 2.18, 2.18, 2.18, 2.18, 2.18], rowH: 0.62, valign: "middle" });

  noteBar(s, 0.45, 5.7, 12.45, 0.9, [
    { text: "Biggest drop: stage 2→3 ", options: { bold: true, color: RED } },
    { text: "(1,618 never return after first order). ", options: {} },
    { text: "Most costly: stage 5 ", options: { bold: true, color: RED } },
    { text: "— no touchpoint, no owner. This is exactly the feedback loop our Goal 2 solution adds.", options: {} },
  ]);

  addFooter(s, "Format follows the brief's sample journey map: STAGE → STEPS → TOUCHPOINTS → ACTORS → EMOTIONS");
}

// ---- 9. BSC Objective + KPI ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "MEASUREMENT");
  slideTitle(s, "C1–C2 · From Pain Point to KPI", "Objective: catch a silent customer before they're gone");

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.65, w: 12.1, h: 1.0, rectRadius: 0.1, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText([
    { text: "Objective:  ", options: { bold: true, color: GOLD, fontSize: 15 } },
    { text: "Detect and retain customers who are about to go silent — before revenue has already dropped.", options: { color: WHITE, fontSize: 15 } },
  ], { x: 0.9, y: 1.65, w: 11.5, h: 1.0, fontFace: FONT_BODY, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });

  const rows = tableOf(["CSF", "KPI"], [
    ["Sales team reviews the at-risk list every week", "% of weeks with a completed review"],
    ["At-risk customers get contacted in time", "% of high-risk customers contacted within 30 days of alert"],
    ["Customers return faster and more often", "Repeat rate · time to 2nd purchase · % silent >180 days"],
    ["Loyal-customer revenue stops leaking away", "Value recovered from at-risk group · true return rate"],
  ]);
  s.addTable(rows, { x: 0.6, y: 2.9, w: 12.1, h: 3.2, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [5.6, 6.5], rowH: 0.7, valign: "middle" });

  addFooter(s, "Rule: no target without a real baseline — see next slide");
}

// ---- 10. BSC Target + Strategy Map ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "MEASUREMENT");
  slideTitle(s, "C3–C5 · Baseline, Target, Strategy Map", "The two process KPIs get hard targets; the outcome KPIs wait for Goal 2");

  const rows = tableOf(["KPI", "Baseline", "Target"], [
    ["% weeks reviewed", { text: "0%", color: RED, bold: true }, "100% from week one"],
    ["% contacted within 30 days", { text: "0%", color: RED, bold: true }, "≥80% within one quarter"],
    ["Repeat purchase rate", { text: "72.35%", color: GREEN, bold: true }, "Hold — don't let it fall"],
    ["Silent > 180 days", { text: "40.64%", color: RED, bold: true }, "Reduce — target set after Goal 2 backtest"],
    ["Value at risk (loyal, silent)", { text: "£813,004", color: RED, bold: true }, "Partial recovery — hypothesis, not a number yet"],
  ]);
  s.addTable(rows, { x: 0.5, y: 1.55, w: 7.6, h: 3.6, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.0, 2.1, 2.5], rowH: 0.72, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.3, y: 1.55, w: 4.4, h: 3.6, rectRadius: 0.1, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
  s.addText("Strategy map", { x: 8.55, y: 1.72, w: 3.9, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, bold: true, color: GOLD, margin: 0 });
  const chain = ["Learning & Growth: sales uses the list weekly", "Internal Process: at-risk contacted in time", "Customer: repeat sooner, silent less", "Financial: loyal-customer revenue holds"];
  let cy = 2.15;
  chain.forEach((t, i) => {
    s.addText(t, { x: 8.55, y: cy, w: 3.9, h: 0.6, fontFace: FONT_BODY, fontSize: 12, color: i === chain.length - 1 ? GOLD : ICE, bold: i === chain.length - 1, lineSpacingMultiple: 1.15, margin: 0 });
    if (i < chain.length - 1) s.addText("↓", { x: 10.35, y: cy + 0.55, w: 0.3, h: 0.25, fontFace: FONT_HEAD, fontSize: 14, color: GOLD, align: "center", margin: 0 });
    cy += 0.8;
  });

  noteBar(s, 0.5, 5.4, 12.2, 1.4, [
    { text: "Why two targets are still open: ", options: { bold: true, color: RED } },
    { text: "there's no campaign or control-group data to prove that contacting an at-risk customer actually brings them back. Setting a made-up number here would break the course's own rule — no target without a real baseline. This is a documented limitation, not an oversight.", options: {} },
  ], "FBE9E7", RED);

  addFooter(s, "Full baseline table with sources — see Appendix");
}

// ---- 11. Data cleaning decisions ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "DATA READY");
  slideTitle(s, "D4 · Cleaning Decisions, Not Silent Deletions", "97.16% of rows kept — every exclusion has a stated reason");

  const rows = tableOf(["Issue found", "Decision"], [
    ["Duplicate rows (34,335 · 3.2%)", "Dropped before any calculation — exact re-exported duplicates"],
    ["Missing Customer ID (22.77% rows, 12.68% revenue)", "Kept in total revenue; excluded from all customer-level metrics"],
    ["Cancellations / C-invoices (19,494 rows, -£1.53M)", "Separated from sales, analyzed as its own topic — not deleted"],
    ["Negative qty outside C-invoices (3,457 rows)", "Excluded from sales; flagged for follow-up in Goal 2"],
    ["Price = 0 / negative (6,207 rows)", "Excluded — free/sample items or accounting adjustments, not revenue"],
    ["Non-product codes: POST, M, FEE, etc. (5,913 rows)", "Always excluded from product sales, in both normal and C-invoices"],
  ]);
  s.addTable(rows, { x: 0.5, y: 1.55, w: 12.35, h: 4.5, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [5.0, 7.35], rowH: 0.72, valign: "middle" });

  addFooter(s, "Net result: 1,067,371 raw rows → 1,037,007 clean sales rows (97.16%)");
}

// ---- 12. EDA highlights ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "DATA READY");
  slideTitle(s, "D5 · What the Data Shows", "A clear Christmas peak, two customer sizes, one dominant market");

  statCard(s, 0.6, 1.65, 2.85, 1.3, "27.32%", "of yearly revenue in Nov–Dec", GOLD);
  statCard(s, 3.65, 1.65, 2.85, 1.3, "85.71%", "of revenue from the UK", NAVY);
  statCard(s, 6.7, 1.65, 2.85, 1.3, "£303", "median basket (mean £509)", GREEN);
  statCard(s, 9.75, 1.65, 2.95, 1.3, "43", "countries, long tail beyond UK", TEXT_MUTED);

  s.addChart(pres.charts.LINE, [{
    name: "Monthly revenue (£)",
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [671933, 508886, 691258, 516218, 741192, 738752, 689364, 736576, 1030475, 1106670, 1457746, 615493],
  }], {
    x: 0.5, y: 3.2, w: 6.9, h: 3.5, chartColors: [GOLD], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 4,
    showTitle: true, title: "2011 monthly revenue (£)", titleFontSize: 12, titleColor: TEXT_DARK, showLegend: false,
    catAxisLabelColor: TEXT_DARK, catAxisLabelFontSize: 9, valAxisLabelColor: TEXT_MUTED, valAxisLabelFontSize: 9,
    valGridLine: { color: "E2E9F7", size: 0.75 }, catGridLine: { style: "none" },
  });

  noteBar(s, 7.65, 3.2, 5.15, 3.5, [
    { text: "Mean basket (£509) sitting well above the median (£303) confirms the two customer types: ", options: { bold: true } },
    { text: "a long tail of large wholesale orders pulls the average up. Top products differ by revenue (high-price cakestand) vs. by units (low-price gliders sold in bulk) — same two-segment story from a different angle.", options: {} },
  ]);

  addFooter(s, "Dec 2011 dips because the data cuts off on Dec 9 — not a real sales drop");
}

// ---- 13. Data model + SQL ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "DATA READY");
  slideTitle(s, "D6–D7 · Data Model and a Working SQL Query", "Flat file → 4 normalized tables → a real business answer");

  const tables = [
    { name: "CUSTOMER", fields: "Customer_ID [PK]\nCountry", x: 0.5 },
    { name: "INVOICE", fields: "Invoice [PK]\nInvoiceDate\nCustomer_ID [FK]", x: 3.55 },
    { name: "INVOICE_LINE", fields: "Invoice [FK]\nStockCode [FK]\nQuantity, Price", x: 6.6 },
    { name: "PRODUCT", fields: "StockCode [PK]\nDescription", x: 9.65 },
  ];
  tables.forEach((t) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: t.x, y: 1.6, w: 2.45, h: 1.35, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" }, shadow: freshShadow() });
    s.addText(t.name, { x: t.x, y: 1.68, w: 2.45, h: 0.35, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: GOLD, align: "center", margin: 0 });
    s.addText(t.fields, { x: t.x + 0.15, y: 2.05, w: 2.15, h: 0.85, fontFace: FONT_BODY, fontSize: 10.5, color: WHITE, lineSpacingMultiple: 1.2, margin: 0 });
  });
  [3.1, 6.15, 9.2].forEach((x) => { s.addText("→", { x, y: 2.05, w: 0.45, h: 0.6, fontFace: FONT_HEAD, fontSize: 18, bold: true, color: TEXT_DARK, align: "center", valign: "middle", margin: 0 }); });

  s.addText([
    { text: "Design note:  ", options: { bold: true, color: GOLD } },
    { text: "Price lives on INVOICE_LINE, not PRODUCT — a single per-product price distorted JOIN revenue by up to 4x in testing, because prices change over time. Real invoicing locks price at time of sale.", options: { color: TEXT_MUTED } },
  ], { x: 0.5, y: 3.15, w: 12.3, h: 0.6, fontFace: FONT_BODY, fontSize: 11.5, lineSpacingMultiple: 1.2, margin: 0 });

  s.addText("Business question: which non-UK country generates the most revenue?", { x: 0.5, y: 3.85, w: 12.3, h: 0.4, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: TEXT_DARK, margin: 0 });
  const rows = tableOf(["Country", "Customers", "Orders", "Revenue (£)"], [
    [{ text: "EIRE", color: GOLD, bold: true }, "3", "528", { text: "591,536.65", bold: true }],
    ["Netherlands", "22", "216", "549,952.66"],
    ["Germany", "106", "752", "388,732.70"],
  ]);
  s.addTable(rows, { x: 0.5, y: 4.3, w: 7.0, h: 1.8, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [2.2, 1.6, 1.6, 1.6], rowH: 0.45, valign: "middle" });

  noteBar(s, 7.7, 4.3, 5.1, 1.85, [
    { text: "EIRE: 3 customers, 528 orders, top non-UK revenue. ", options: { bold: true } },
    { text: "A concentration risk — a few large wholesale accounts, unlike Germany's broader base.", options: {} },
  ]);

  addFooter(s, "SQL runs live in analysis/g1d.py via SQLite · 5V data characteristics — see Appendix");
}

// ---- 14. Summary ----
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -2.6, y: -2.6, w: 6, h: 6, fill: { color: "263480" }, line: { type: "none" } });

  s.addText("Summary & What's Next", { x: 0.7, y: 0.5, w: 11.9, h: 0.65, fontFace: FONT_HEAD, fontSize: 32, bold: true, color: WHITE, margin: 0 });
  s.addText("Company, problem, measurement, and data — all grounded in real numbers", { x: 0.7, y: 1.1, w: 11.5, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: ICE, margin: 0 });

  const summary = [
    ["A", "Company & strategy", "UK gift retailer · Cost Leadership + light Differentiation"],
    ["B", "Problem", "27.65% one-time buyers, 40.64% silent >180d, £813,004 at risk"],
    ["C", "Balanced Scorecard", "Objective → KPI → baseline/target across 4 dimensions"],
    ["D", "Data readiness", "6 cleaning decisions, EDA, 4-table model, working SQL"],
  ];
  let sy = 1.7;
  summary.forEach(([tag, title, body]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: sy, w: 11.9, h: 0.95, rectRadius: 0.08, fill: { color: "263480" }, line: { color: "3C4B96", width: 1 } });
    iconCircle(s, 0.95, sy + 0.2, 0.55, tag, GOLD, NAVY);
    s.addText(title, { x: 1.7, y: sy + 0.08, w: 3.2, h: 0.78, fontFace: FONT_HEAD, fontSize: 14.5, bold: true, color: WHITE, valign: "middle", margin: 0 });
    s.addText(body, { x: 5.0, y: sy + 0.08, w: 7.4, h: 0.78, fontFace: FONT_BODY, fontSize: 12.5, color: ICE, valign: "middle", margin: 0 });
    sy += 1.08;
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: sy + 0.05, w: 11.9, h: 0.9, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText([
    { text: "Honest limits: ", options: { bold: true, color: NAVY } },
    { text: "customer-level metrics cover 86.65% of revenue (22.77% of rows lack a Customer ID); no cost or campaign data — we can prove who goes silent, not yet that outreach brings them back.", options: { color: TEXT_DARK } },
  ], { x: 0.95, y: sy + 0.05, w: 11.4, h: 0.9, fontFace: FONT_BODY, fontSize: 12, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });

  addFooter(s, "Next: Goal 2 — RFM segmentation, churn prediction, and a real dashboard (Nov 26)", true);
}

// =====================================================================
// APPENDIX — backup for Q&A, not part of the 15-minute talk
// =====================================================================
appendixDivider();

// ---- Appendix 1: TOWS + Value Chain ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "Appendix · TOWS & Value Chain", "Full strategic mapping behind the strategy slide");

  function towsCard(x, y, tag, title, body, color) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 6.0, h: 1.95, rectRadius: 0.08, fill: { color: CARD_BG }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: y + 0.2, w: 0.55, h: 0.55, fill: { color }, line: { type: "none" } });
    s.addText(tag, { x: x + 0.22, y: y + 0.2, w: 0.55, h: 0.55, fontFace: FONT_HEAD, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(title, { x: x + 0.95, y: y + 0.18, w: 4.85, h: 0.35, fontFace: FONT_HEAD, fontSize: 13.5, bold: true, color: TEXT_DARK, margin: 0 });
    s.addText(body, { x: x + 0.22, y: y + 0.85, w: 5.6, h: 1.0, fontFace: FONT_BODY, fontSize: 11.5, color: TEXT_MUTED, lineSpacingMultiple: 1.2, margin: 0 });
  }
  towsCard(0.6, 1.6, "SO", "Strength × Opportunity", "Broad SKU range (4,898 items) captures seasonal demand — two full Christmas cycles in the data support pre-planned seasonal bundles.", "5B8A5E");
  towsCard(0.6, 3.7, "WT", "Weakness × Threat", "27.65% one-time-buyer rate, combined with high substitute/entrant threat, means a retention strategy is needed before competitors capture these customers.", "B3402F");

  const vcRows = [
    [{ text: "Value Chain activity", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12 } }, { text: "In dataset?", options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 12, align: "center" } }],
    [{ text: "Outbound Logistics (Invoice/Date)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 11.5 } }, { text: "Yes", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 11.5, align: "center" } }],
    [{ text: "Marketing & Sales (Price/Qty/Country)", options: { color: TEXT_DARK, fill: { color: "EAF6EC" }, fontSize: 11.5 } }, { text: "Yes", options: { color: "2E7D32", bold: true, fill: { color: "EAF6EC" }, fontSize: 11.5, align: "center" } }],
    [{ text: "Inbound Logistics (procurement)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 11.5 } }, { text: "No", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 11.5, align: "center" } }],
    [{ text: "Operations (manufacturing/packing)", options: { color: TEXT_DARK, fill: { color: "FCEEEC" }, fontSize: 11.5 } }, { text: "No", options: { color: "B3402F", bold: true, fill: { color: "FCEEEC" }, fontSize: 11.5, align: "center" } }],
  ];
  s.addTable(vcRows, { x: 6.95, y: 1.6, w: 5.8, h: 2.2, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [4.0, 1.8], rowH: 0.44, valign: "middle" });

  noteBar(s, 6.95, 4.05, 5.8, 1.6, [
    { text: "Limitation to state directly: ", options: { bold: true, color: NAVY } },
    { text: "no cost/production data exists in this dataset — Inbound Logistics and Operations can't be evaluated. This is a stated gap, not an assumption.", options: {} },
  ], "EAF0FC", NAVY);

  addFooter(s, "Appendix 1 of 5", true);
}

// ---- Appendix 2: Return-code detail ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "Appendix · What's Inside a Credit Note", "Why the naive 7.59% return rate is wrong");

  const rows = tableOf(["Top 5 items by return value", "Code", "Value", "Real product?"], [
    ["Manual adjustment", "M", "-£423,512.60", { text: "No", color: RED, bold: true }],
    ["Amazon Fee", "AMAZONFEE", "-£294,772.71", { text: "No", color: RED, bold: true }],
    ["PAPER CRAFT, LITTLE BIRDIE", "23843", "-£168,469.60", { text: "Yes", color: GREEN, bold: true }],
    ["MEDIUM CERAMIC TOP STORAGE JAR", "23166", "-£77,479.64", { text: "Yes", color: GREEN, bold: true }],
    ["Bank Charges", "BANK CHARGES", "-£36,096.87", { text: "No", color: RED, bold: true }],
  ]);
  s.addTable(rows, { x: 0.6, y: 1.6, w: 12.1, h: 2.3, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [5.5, 2.4, 2.3, 1.9], rowH: 0.4, valign: "middle" });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.1, w: 12.1, h: 2.1, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 1 } });
  s.addText(
    "Why fee lines end up on \"return\" invoices: the system has no other way to reverse a fee or issue a non-product refund, so it reuses the same C-invoice mechanism as real returns. Proof these are line types, not \"C-invoice-only\" codes: the same codes appear as positive amounts on ordinary invoices too (e.g. M: 888 rows +£340,731 on normal invoices vs. 538 rows -£423,513 on C-invoices).",
    { x: 0.9, y: 4.3, w: 11.5, h: 1.7, fontFace: FONT_BODY, fontSize: 13, color: TEXT_DARK, lineSpacingMultiple: 1.3, valign: "top", margin: 0 }
  );

  addFooter(s, "Appendix 2 of 5", true);
}

// ---- Appendix 3: 5V characteristics ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "Appendix · Data Characteristics (5V)", "Volume is fine — Veracity is the real risk");

  const v = [
    ["Volume", "1,067,371 rows — enough for the course's bar (≥1,000), smaller than true Big Data", GREEN],
    ["Velocity", "Batch/historical — a one-time export, not a live stream", TEXT_MUTED],
    ["Variety", "Structured only — one flat 8-column table, no images or free text", TEXT_MUTED],
    ["Veracity", "Lower than it first looks — proven: return rate reads 2x too high if not filtered correctly", RED],
    ["Value", "High — directly answers churn, returns, and which market to prioritize", GREEN],
  ];
  let vy = 1.65;
  v.forEach(([name, desc, color]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: vy, w: 12.1, h: 0.92, rectRadius: 0.08, fill: { color: CARD_BG }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
    s.addShape(pres.shapes.OVAL, { x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fill: { color }, line: { type: "none" } });
    s.addText(name[0], { x: 0.85, y: vy + 0.16, w: 0.6, h: 0.6, fontFace: FONT_HEAD, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(name, { x: 1.65, y: vy + 0.1, w: 1.9, h: 0.72, fontFace: FONT_HEAD, fontSize: 15, bold: true, color: TEXT_DARK, valign: "middle", margin: 0 });
    s.addText(desc, { x: 3.6, y: vy + 0.1, w: 8.9, h: 0.72, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_MUTED, valign: "middle", lineSpacingMultiple: 1.15, margin: 0 });
    vy += 1.02;
  });

  addFooter(s, "Appendix 3 of 5", true);
}

// ---- Appendix 4: Full baseline/target table with sources ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "Appendix · Full BSC Baseline Sources", "Every number traces back to a script that reproduces it");

  const rows = tableOf(["KPI", "Baseline", "Source"], [
    ["% weeks reviewed", "0%", "New process — no historical data needed"],
    ["% contacted within 30 days", "0%", "New process — no historical data needed"],
    ["Repeat purchase rate", "72.35%", "analysis/g1b.py — B3 order-count distribution"],
    ["Silent > 180 days", "40.64% (2,378 customers)", "analysis/g1b.py — B3 recency calculation"],
    ["Value at risk (loyal, silent)", "£813,004", "analysis/g1b.py — 6+ order customers, silent >180d"],
    ["True return rate", "3.61% (£726,589)", "analysis/g1b.py — B4, product-only C-invoice lines"],
  ]);
  s.addTable(rows, { x: 0.5, y: 1.6, w: 12.35, h: 4.2, fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, colW: [3.6, 3.2, 5.55], rowH: 0.7, valign: "middle" });

  addFooter(s, "Appendix 4 of 5", true);
}

// ---- Appendix 5: What's next (Goal 2 teaser) ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  slideTitle(s, "Appendix · Goal 2 Preview", "How the Balanced Scorecard becomes a working system");

  const steps = [
    ["1", "Data prep + RFM", "Recency, Frequency, Monetary features per customer"],
    ["2", "Clustering", "Segment customers into named, business-readable groups"],
    ["3", "Classification", "Predict who will go silent past 180 days"],
    ["4", "Ranking", "Risk score × customer value → a prioritized outreach list"],
    ["5", "Dashboard", "Weekly worklist for sales + executive overview"],
  ];
  let sy = 1.7;
  steps.forEach(([n, title, body]) => {
    iconCircle(s, 0.6, sy, 0.55, n, GOLD, NAVY);
    s.addText(title, { x: 1.4, y: sy - 0.05, w: 3.2, h: 0.65, fontFace: FONT_HEAD, fontSize: 14.5, bold: true, color: TEXT_DARK, valign: "middle", margin: 0 });
    s.addText(body, { x: 4.7, y: sy - 0.05, w: 8.0, h: 0.65, fontFace: FONT_BODY, fontSize: 13, color: TEXT_MUTED, valign: "middle", margin: 0 });
    sy += 0.85;
  });

  noteBar(s, 0.6, sy + 0.15, 12.1, 1.1, [
    { text: "Validated already: ", options: { bold: true, color: GREEN } },
    { text: "a time-split backtest shows 36.92% of a 4,282-customer cohort never returns within 12 months — a balanced enough split to train a real classifier without needing resampling.", options: {} },
  ], "EAF5EC", GREEN);

  addFooter(s, "Appendix 5 of 5", true);
}

pres.writeFile({ fileName: "G1-presentation.pptx" }).then(() => {
  console.log("done");
});
