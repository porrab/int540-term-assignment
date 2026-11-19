// G2 PRESENTATION deck — English slides, Thai speech, ~15-minute talk + Q&A.
// Main deck 20 slides (14 + 5 demo-clip slides after 11 and 12 + a strategy map before the BSC); appendix = backup for questions (not in the 15 minutes).
// Same palette and helpers as build-g1-presentation.js so Goal 1 and Goal 2 look alike.
// Every figure comes from the Goal 2 .md deliverables (g2-a … g2-e, solution-outline)
// and data/bi/*.csv; this deck only condenses, it adds no new numbers.
//
//   npm install && node build-g2-presentation.js   ->  G2-presentation.pptx

const path = require("path");
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
const ORANGE = "E8672C";
const GREY = "B8C0CF";

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";
const DASH = path.join(__dirname, "..", "dashboard");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
const PAGE_W = 13.33;
const PAGE_H = 7.5;

function freshShadow() {
  return { type: "outer", color: "1E2761", opacity: 0.18, blur: 6, offset: 2, angle: 90 };
}
function addFooter(slide, label, dark) {
  slide.addText(label, { x: 0.5, y: PAGE_H - 0.42, w: PAGE_W - 4.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: dark ? "8895B8" : TEXT_MUTED, align: "left", margin: 0 });
  slide.addText("Term Assignment · Goal 2 · INT 540", { x: PAGE_W - 3.6, y: PAGE_H - 0.42, w: 3.1, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: dark ? "8895B8" : TEXT_MUTED, align: "right", margin: 0 });
}
function statCard(slide, x, y, w, h, bigText, smallText, accent = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: CARD_BG }, line: { type: "none" }, shadow: freshShadow() });
  slide.addText(bigText, { x: x + 0.12, y: y + 0.08, w: w - 0.24, h: h * 0.55, fontFace: FONT_HEAD, fontSize: 26, bold: true, color: accent, align: "center", valign: "bottom", margin: 0 });
  slide.addText(smallText, { x: x + 0.1, y: y + h * 0.6, w: w - 0.2, h: h * 0.38, fontFace: FONT_BODY, fontSize: 12, color: TEXT_MUTED, align: "center", valign: "top", margin: 0 });
}
function slideTitle(slide, kicker, title) {
  slide.addText(kicker, { x: 2.35, y: 0.32, w: PAGE_W - 3.0, h: 0.32, fontFace: FONT_BODY, fontSize: 14, bold: true, color: GOLD, align: "left", margin: 0, charSpacing: 1 });
  slide.addText(title, { x: 0.6, y: 0.72, w: PAGE_W - 1.2, h: 0.75, fontFace: FONT_HEAD, fontSize: 28, bold: true, color: TEXT_DARK, align: "left", valign: "top", margin: 0 });
}
function sectionTag(slide, text) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 0.32, w: 1.55, h: 0.32, rectRadius: 0.16, fill: { color: GOLD }, line: { type: "none" } });
  slide.addText(text, { x: 0.6, y: 0.32, w: 1.55, h: 0.32, fontFace: FONT_HEAD, fontSize: 11, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
}
function noteBar(slide, x, y, w, h, textRuns, fill = "FFF4E0", line = GOLD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: line, width: 1 } });
  slide.addText(textRuns, { x: x + 0.22, y, w: w - 0.44, h, fontFace: FONT_BODY, fontSize: 13.5, color: TEXT_DARK, valign: "middle", lineSpacingMultiple: 1.2, margin: 0 });
}
function card(slide, x, y, w, h, fill = CARD_BG) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { type: "none" }, shadow: freshShadow() });
}
// leftCols: column indexes holding sentences, which read better left-aligned than centred
function tableOf(header, body, fs = 12, leftCols = []) {
  const al = (j) => (j === 0 || leftCols.includes(j) ? "left" : "center");
  const head = header.map((t, i) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: fs + 0.5, align: al(i) } }));
  const rows = body.map((r, i) => r.map((cell, j) => {
    const c = typeof cell === "object" ? cell : { text: cell };
    return { text: c.text, options: { color: c.color || (j === 0 ? TEXT_DARK : TEXT_MUTED), bold: c.bold || j === 0, fill: { color: c.fill || (i % 2 === 0 ? WHITE : "EAF0FC") }, fontSize: c.fontSize || fs, align: c.align || al(j) } };
  }));
  return [head, ...rows];
}
// A formula on one line with real stacked fractions (numerator over a bar over denominator),
// so no long "a / b = c" chains. parts: strings, or {num, den} for a fraction.
// Width is estimated from the character count (Calibri, about 0.5 em per character).
function formula(slide, x, yMid, parts, fs = 13, color = TEXT_DARK) {
  const cw = (t, size) => Math.max(0.15, t.length * size * 0.0064 + 0.06);
  let cx = x;
  const lh = fs / 72 * 1.25;
  parts.forEach((p) => {
    if (typeof p === "string") {
      const w = cw(p, fs);
      slide.addText(p, { x: cx, y: yMid - lh / 2, w, h: lh, fontFace: FONT_BODY, fontSize: fs, color, align: "left", valign: "middle", margin: 0 });
      cx += w;
    } else {
      const f = fs - 1;
      const w = Math.max(cw(p.num, f), cw(p.den, f)) + 0.1;
      const fh = f / 72 * 1.25;
      slide.addText(p.num, { x: cx, y: yMid - fh - 0.02, w, h: fh, fontFace: FONT_BODY, fontSize: f, color, align: "center", valign: "bottom", margin: 0 });
      slide.addShape(pres.shapes.LINE, { x: cx + 0.04, y: yMid, w: w - 0.08, h: 0, line: { color, width: 1 } });
      slide.addText(p.den, { x: cx, y: yMid + 0.02, w, h: fh, fontFace: FONT_BODY, fontSize: f, color, align: "center", valign: "top", margin: 0 });
      cx += w + 0.04;
    }
  });
  return cx;
}
const TBL = { fontFace: FONT_BODY, border: { type: "solid", color: "D7E1F5", pt: 0.75 }, autoPage: false, valign: "middle", margin: 0.05 };
function img(slide, file, x, y, w) {
  const h = w * 1600 / 2767;
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, fill: { color: WHITE }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
  slide.addImage({ path: path.join(DASH, file), x, y, w, h });
  return h;
}
// Demo clip slide: a still frame of the clip on the left (16:9), a card on the right
// saying what the clip shows. The clips themselves (dashboard/demo-clips/*.mp4, made by
// dashboard/record_demo.py + zoom_clips.py) are played from Canva, so this deck carries
// only the poster frames (dashboard/demo-clips/posters/, tracked) and stays small.
const CLIPS = path.join(DASH, "demo-clips");
function videoSlide(kicker, title, clip, points) {
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · DASHBOARD");
  slideTitle(s, kicker, title);
  const x = 0.6, y = 1.65, w = 8.7, h = w * 9 / 16;
  s.addShape(pres.shapes.RECTANGLE, { x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, fill: { color: WHITE }, line: { color: "D7E1F5", width: 1 }, shadow: freshShadow() });
  s.addImage({ path: path.join(CLIPS, "posters", clip + ".png"), x, y, w, h });
  card(s, 9.6, y, 3.1, h);
  s.addText([
    { text: "In this clip", options: { bold: true, color: GOLD, breakLine: true } },
    ...points.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < points.length - 1, paraSpaceBefore: 6 } })),
  ], { x: 9.78, y: y + 0.12, w: 2.78, h: h - 0.24, fontFace: FONT_BODY, fontSize: 13, color: TEXT_DARK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
  addFooter(s, "Still from the screen recording of int540-g2-d1.pbix (17 Nov 2026); the clip plays in the presentation");
}
function appendixDivider() {
  const s = pres.addSlide();
  s.background = { color: "3C3C3C" };
  s.addText("APPENDIX", { x: 0.9, y: 2.9, w: 11.5, h: 0.5, fontFace: FONT_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText("Backup slides for Q&A", { x: 0.9, y: 3.4, w: 11.5, h: 1.0, fontFace: FONT_HEAD, fontSize: 34, bold: true, color: WHITE, margin: 0 });
  s.addText("Not part of the 15-minute presentation; opened only if the panel asks", { x: 0.9, y: 4.3, w: 11.2, h: 0.5, fontFace: FONT_BODY, fontSize: 15, color: "BFC7DA", margin: 0 });
}

// =====================================================================
// MAIN DECK
// =====================================================================

// ---- 1. Title ----
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: "263480" }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: -2.4, y: 4.6, w: 5.2, h: 5.2, fill: { color: "263480" }, line: { type: "none" } });
  s.addText("TERM ASSIGNMENT · GOAL 2", { x: 0.9, y: 1.6, w: 11.5, h: 0.45, fontFace: FONT_BODY, fontSize: 16, bold: true, color: GOLD, charSpacing: 2, margin: 0 });
  s.addText("Customer Health Watch: Who to Call Before They Go Silent", { x: 0.9, y: 2.1, w: 11.5, h: 1.4, fontFace: FONT_HEAD, fontSize: 38, bold: true, color: WHITE, valign: "top", margin: 0 });
  s.addText("Business Decision Improvement · clustering, classification and a Power BI dashboard", { x: 0.9, y: 3.55, w: 11.2, h: 0.5, fontFace: FONT_BODY, fontSize: 17, color: ICE, margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 4.4, w: 11.0, h: 0.9, rectRadius: 0.1, fill: { color: "263480" }, line: { color: "3C4B96", width: 1 } });
  s.addText([
    { text: "Data: ", options: { bold: true, color: GOLD } },
    { text: "Online Retail II (UCI #502)  ·  Dec 2009 – 9 Dec 2011  ·  after cleaning: 1,003,343 sales rows, £19,655,052.81, 5,852 identified customers", options: { color: WHITE } },
  ], { x: 1.15, y: 4.4, w: 10.6, h: 0.9, fontFace: FONT_BODY, fontSize: 13, valign: "middle", margin: 0 });
  s.addText("INT 540 / DSI 121 — Data Analytics for Business Decision", { x: 0.9, y: 6.75, w: 8, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, color: "9AA8D6", margin: 0 });
}

// ---- 2. Recap Goal 1 ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "GOAL 1 RECAP");
  slideTitle(s, "From Goal 1", "4 in 10 customers have gone silent, and no step warns anyone in time");
  statCard(s, 0.6, 1.75, 2.9, 1.35, "40.64%", "silent > 180 days (2,378 of 5,852)", RED);
  statCard(s, 3.7, 1.75, 2.9, 1.35, "205", "regulars (6+ orders) already silent", NAVY);
  statCard(s, 6.8, 1.75, 2.9, 1.35, "£781,671", "their past spend at risk (after de-duplication)", NAVY);
  statCard(s, 9.9, 1.75, 2.8, 1.35, "0%", "of weeks anyone reviews at-risk customers", GOLD);
  card(s, 0.6, 3.4, 6.0, 2.85);
  s.addText("Problem statement (Goal 1)", { x: 0.85, y: 3.55, w: 5.5, h: 0.35, fontFace: FONT_BODY, fontSize: 13, bold: true, color: GOLD, margin: 0 });
  s.addText("The shop only learns that a customer has left when total sales drop. The order → ship → invoice process has no feedback step that names the customers who are drifting away.", { x: 0.85, y: 3.95, w: 5.5, h: 2.2, fontFace: FONT_BODY, fontSize: 14, color: TEXT_DARK, lineSpacingMultiple: 1.25, valign: "top", margin: 0 });
  card(s, 6.85, 3.4, 5.85, 2.85, NAVY);
  s.addText("What Goal 2 has to show", { x: 7.1, y: 3.55, w: 5.4, h: 0.35, fontFace: FONT_BODY, fontSize: 13, bold: true, color: GOLD, margin: 0 });
  s.addText([
    { text: "5  System components", options: { breakLine: true } },
    { text: "6  Data collection and treatment", options: { breakLine: true } },
    { text: "7  UX/UI: input, interaction, output", options: { breakLine: true } },
    { text: "8  Analysis process and results", options: { breakLine: true } },
    { text: "9  Link back to the strategy (BSC)", options: {} },
  ], { x: 7.1, y: 3.95, w: 5.4, h: 2.2, fontFace: FONT_BODY, fontSize: 14.5, color: WHITE, lineSpacingMultiple: 1.3, valign: "top", margin: 0 });
  addFooter(s, "Team decisions 10 Sep: silent = no order for 180+ days · scope = whole customer base, ranked by money");
}

// ---- 3. System components ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "5 · SYSTEM");
  slideTitle(s, "G2-A · Components of the solution", "Add one weekly step; the model ranks, a person decides");
  const steps = ["Take order", "Pack & ship", "Invoice", "Returns"];
  steps.forEach((t, i) => {
    const x = 0.6 + i * 2.0;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.75, w: 1.75, h: 0.7, rectRadius: 0.08, fill: { color: WHITE }, line: { color: "D7E1F5", width: 1 } });
    s.addText(t, { x, y: 1.75, w: 1.75, h: 0.7, fontFace: FONT_BODY, fontSize: 13, color: TEXT_MUTED, align: "center", valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.6, y: 1.65, w: 4.1, h: 0.9, rectRadius: 0.08, fill: { color: "FFF4E0" }, line: { color: GOLD, width: 2 } });
  s.addText([{ text: "NEW · ", options: { bold: true, color: GOLD } }, { text: "weekly customer health review → call → record result", options: { color: TEXT_DARK, bold: true } }], { x: 8.75, y: 1.65, w: 3.85, h: 0.9, fontFace: FONT_BODY, fontSize: 13, valign: "middle", margin: 0 });
  s.addText("→", { x: 7.95, y: 1.75, w: 0.6, h: 0.7, fontFace: FONT_HEAD, fontSize: 26, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
  const rows = tableOf(["Where", "Analysis", "Used by", "Decision it supports"], [
    ["① Every week (proposed: Sunday night)", "Classification (G2-D3): chance of going silent in 180 days", "System", "—"],
    ["② Rank the list", "High risk first, then by last 12 months' spend", "Sales staff", "Who to call first this week"],
    ["③ On the worklist", "Clustering (G2-D2): business-named segment", "Sales staff", "How to talk to this customer"],
    ["④ Every month", "Power BI dashboard (G2-D1)", "Sales head / executives", "Is it getting better? Add callers?"],
    ["⑤ Optional", "Association rules (G2-D5)", "Sales staff", "What to offer on the call"],
  ], 12, [1, 3]);
  s.addTable(rows, { ...TBL, x: 0.6, y: 2.85, w: 12.1, colW: [2.1, 4.5, 1.9, 3.6], rowH: 0.48 });
  noteBar(s, 0.6, 5.95, 12.1, 0.75, [
    { text: "Rule of the system: ", options: { bold: true } },
    { text: "it proposes a list with reasons. It never emails or gives a discount on its own. Results typed in by staff feed the next round: the missing feedback loop.", options: {} },
  ]);
  addFooter(s, "Business Decision Improvement is the main type; process redesign is limited to the one new step");
}

// ---- 4. Data treatment: cleansing ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "6 · DATA");
  slideTitle(s, "G2-B · Data collection and treatment", "Six cleaning steps, each with a business reason");
  s.addChart(pres.charts.BAR, [{
    name: "Rows left",
    labels: ["0 Raw file (2 sheets)", "1 Drop exact duplicates", "2 Move C-invoices to returns", "3 Drop Qty ≤ 0", "4 Drop Price ≤ 0", "5 Drop 19 non-product codes", "6 Keep rows with Customer ID"],
    values: [1067371, 1033036, 1013932, 1010539, 1007913, 1003343, 776579],
  }], {
    x: 0.5, y: 1.6, w: 7.3, h: 4.4, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [NAVY],
    showValue: true, dataLabelFormatCode: "#,##0", dataLabelFontSize: 11, dataLabelColor: TEXT_DARK, catAxisLabelFontSize: 11.5,
    valAxisHidden: true, valGridLine: { style: "none" }, catAxisLabelColor: TEXT_DARK, valAxisMinVal: 0, valAxisMaxVal: 1250000, barGapWidthPct: 45,
  });
  card(s, 8.1, 1.65, 4.6, 1.45);
  s.addText([
    { text: "Goal 1 kept 34,335 duplicate rows by mistake. ", options: { bold: true, color: RED, breakLine: true } },
    { text: "Sales base £20,121,372.19 → £19,655,052.81 (−2.32%). Customer-level figures (40.64%, 72.35% repeat) did not change.", options: { color: TEXT_DARK } },
  ], { x: 8.3, y: 1.7, w: 4.25, h: 1.35, fontFace: FONT_BODY, fontSize: 12.5, valign: "middle", margin: 0 });
  card(s, 8.1, 3.3, 4.6, 1.3);
  s.addText([
    { text: "Returns are kept, not deleted: ", options: { bold: true, breakLine: true } },
    { text: "19,104 C-invoice rows (−£1,462,050.61) go to their own table so we can see who returns.", options: {} },
  ], { x: 8.3, y: 3.35, w: 4.25, h: 1.2, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, valign: "middle", margin: 0 });
  card(s, 8.1, 4.8, 4.6, 1.2, NAVY);
  s.addText("Customer coverage", { x: 8.3, y: 4.85, w: 4.25, h: 0.3, fontFace: FONT_BODY, fontSize: 13, bold: true, color: GOLD, margin: 0 });
  formula(s, 8.3, 5.55, [{ num: "£17,068,582.72 (rows with an ID)", den: "£19,655,052.81 (all sales)" }, " = 86.84%"], 12.5, WHITE);
  noteBar(s, 0.6, 6.2, 12.1, 0.6, [{ text: "Every customer-level number in this deck covers 86.84% of sales (rows with a Customer ID).", options: { bold: true } }]);
  addFooter(s, "Step 6 does not delete sales: total revenue still uses the step-5 base");
}

// ---- 5. Features and transformation ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "6 · DATA");
  slideTitle(s, "G2-B · From receipt lines to one row per customer", "Frequency is the strongest signal; big customers stay in");
  const rows = tableOf(["Feature (5,852 customers)", "Median", "Mean", "Business question"], [
    ["Recency: days since last order", "95", "199.7", "Has the customer started to drift?"],
    ["Frequency: number of orders", "3", "6.25", "How attached are they?"],
    ["Monetary: total spend", "£856.02", "£2,916.71", "What would we lose?"],
    ["Average days between orders (4,234 with 2+ orders)", "72.8", "103.2", "The customer's own normal rhythm"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 7.6, colW: [2.9, 1.0, 1.1, 2.6], rowH: 0.5 });
  statCard(s, 8.5, 1.65, 2.05, 1.3, "69.60%", "silent when F score = 1", RED);
  statCard(s, 10.65, 1.65, 2.05, 1.3, "6.49%", "silent when F score = 5", GREEN);
  card(s, 8.5, 3.15, 4.2, 1.3);
  s.addText([
    { text: "Keep the outliers. ", options: { bold: true, color: NAVY } },
    { text: "IQR flags 619 big spenders, but they hold 64.91% of sales: the customers we most need to watch.", options: {} },
  ], { x: 8.7, y: 3.2, w: 3.85, h: 1.2, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, valign: "middle", margin: 0 });
  card(s, 0.6, 4.35, 7.6, 1.55);
  s.addText([
    { text: "For the models: log(1 + x), then z-score. ", options: { bold: true, breakLine: true } },
    { text: "Monetary skewness 25.33 → 0.27 after the log. The z-score puts days, orders and pounds on one scale. The dashboard keeps raw units and medians, because people read it, not models.", options: {} },
  ], { x: 0.8, y: 4.4, w: 7.25, h: 1.45, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, valign: "middle", margin: 0 });
  card(s, 8.5, 4.65, 4.2, 1.25, "FFF4E0");
  s.addText([
    { text: "Trap: ", options: { bold: true, color: GOLD } },
    { text: "customers who returned goods look more loyal (27.96% vs 49.58% silent), but the gap disappears within the same F score.", options: {} },
  ], { x: 8.7, y: 4.7, w: 3.85, h: 1.15, fontFace: FONT_BODY, fontSize: 12, color: TEXT_DARK, valign: "middle", margin: 0 });
  noteBar(s, 0.6, 6.1, 12.1, 0.65, [{ text: "RFM scores 1–5 use equal-frequency bins (24 Sep class). Example: customer 18073 = R3 F5 M5 (code 355).", options: {} }]);
  addFooter(s, "Output: data/customer_features.csv, one row per customer, reference date 10 Dec 2011");
}

// ---- 6. UX/UI ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "7 · UX/UI");
  slideTitle(s, "G2-C · Input, interaction and output", "Three screens for two users; staff type in only the call result");
  const rows = tableOf(["Screen", "Type", "User · when"], [
    ["① Worklist", "Output + interaction", "Sales staff · Monday morning"],
    ["② Record the call", "Input (3 fields)", "Sales staff · after each call"],
    ["③ Monthly overview", "Output (Power BI)", "Sales head · monthly"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 5.4, colW: [1.8, 1.7, 1.9], rowH: 0.48 });
  card(s, 0.6, 3.7, 5.4, 2.95);
  s.addText([
    { text: "Design choices", options: { bold: true, color: GOLD, breakLine: true } },
    { text: "Risk shown as High / Medium / Low, not %: the model's scores run higher than reality.", options: { bullet: true, breakLine: true } },
    { text: "Days since last order sit next to the customer's usual gap; red past 3×.", options: { bullet: true, breakLine: true } },
    { text: "One-time buyers say \"One purchase\" instead of a gap.", options: { bullet: true, breakLine: true } },
    { text: "Call result: reached or not, reason for stopping (pick list), contact date. The date measures \"contacted within 30 days\".", options: { bullet: true, breakLine: true } },
    { text: "Filter by risk, segment, country; right-click a customer for their order history.", options: { bullet: true } },
  ], { x: 0.8, y: 3.75, w: 5.05, h: 2.85, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
  const h = img(s, "int540-g2-d1-page2-worklist.png", 6.3, 1.7, 6.4);
  s.addText("Worklist screen in Power BI: top 50 High-risk customers, £116,303.26 in last-12-month spend", { x: 6.3, y: 1.75 + h + 0.08, w: 6.4, h: 0.4, fontFace: FONT_BODY, fontSize: 11.5, italic: true, color: TEXT_MUTED, margin: 0 });
  addFooter(s, "Mock-up of all three screens: mockup/g2-c-mockup.html");
}

// ---- 7. Clustering: choose k ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · ANALYSIS");
  slideTitle(s, "G2-D2 · k-means on RFM: choosing k", "k = 4 separates the regulars who are slipping away");
  s.addChart(pres.charts.BAR, [{ name: "SSE", labels: ["k=2", "k=3", "k=4", "k=5", "k=6", "k=7", "k=8"], values: [8571, 6357, 4948, 4128, 3578, 3204, 2915] }], {
    x: 0.5, y: 1.6, w: 6.6, h: 3.9, barDir: "col", chartColors: [GREY, GREY, NAVY, GREY, GREY, GREY, GREY], showValue: true, dataLabelFormatCode: "#,##0", dataLabelFontSize: 11,
    catAxisLabelFontSize: 12, valAxisHidden: true, valGridLine: { style: "none" }, showTitle: true, title: "SSE (within-cluster distance)", titleFontSize: 12, titleColor: TEXT_MUTED, barGapWidthPct: 40,
  });
  const rows = tableOf(["k", "SSE drop", "Silhouette", "Min ARI (10 seeds)", "Smallest"], [
    ["2", "—", "0.4385", "0.99", "39.5%"],
    ["3", "25.8%", "0.3472", "1.00", "20.2%"],
    [{ text: "4", bold: true, fill: "FFF4E0" }, { text: "22.2%", bold: true, fill: "FFF4E0", color: TEXT_DARK }, { text: "0.3652", bold: true, fill: "FFF4E0", color: TEXT_DARK }, { text: "0.95", bold: true, fill: "FFF4E0", color: TEXT_DARK }, { text: "19.0%", bold: true, fill: "FFF4E0", color: TEXT_DARK }],
    ["5", "16.6%", "0.3416", "0.93", "7.6%"],
    ["8", "9.0%", "0.2962", "0.67", "5.9%"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 7.4, y: 1.7, w: 5.3, colW: [0.6, 1.0, 1.1, 1.5, 1.1], rowH: 0.42 });
  card(s, 7.4, 4.45, 5.3, 1.05);
  formula(s, 7.6, 4.97, ["SSE drop from k = 3 to k = 4:  ", { num: "6,357 − 4,948", den: "6,357" }, " = 22.2%"], 13);
  noteBar(s, 0.6, 5.75, 12.1, 0.95, [
    { text: "Why not k = 2 (best silhouette)? ", options: { bold: true } },
    { text: "It only splits big active buyers from small lapsed ones. As in class, we pick k by business purpose. Silhouette 0.37 is moderate: segments are for action, not natural types.", options: {} },
  ]);
  addFooter(s, "Inputs: log + z-score of R, F, M · KMeans n_init = 10 · k tried 2–8 (k = 6, 7 left out of the table)");
}

// ---- 8. Segments ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · ANALYSIS");
  slideTitle(s, "G2-D2 · Four customer segments", "Loyal wholesale: 19% of customers, 72% of revenue");
  s.addChart(pres.charts.BAR, [
    { name: "% of customers", labels: ["Loyal wholesale", "Slipping regulars", "Recent, still small", "Lapsed one-off"], values: [18.97, 25.09, 20.85, 35.10] },
    { name: "% of revenue", labels: ["Loyal wholesale", "Slipping regulars", "Recent, still small", "Lapsed one-off"], values: [71.58, 18.46, 5.87, 4.09] },
  ], {
    x: 0.5, y: 1.6, w: 6.4, h: 4.3, barDir: "bar", barGrouping: "clustered", catAxisOrientation: "maxMin", chartColors: [GREY, NAVY], showValue: true, dataLabelFormatCode: '0.0"%"',
    dataLabelFontSize: 11, catAxisLabelFontSize: 12, valAxisHidden: true, valGridLine: { style: "none" }, showLegend: true, legendPos: "b", legendFontSize: 12, valAxisMaxVal: 85, barGapWidthPct: 35,
  });
  const rows = tableOf(["Segment", "Silent >180d", "Action for sales"], [
    ["Loyal wholesale", "1.17%", "Protect: top of the list the moment the model warns"],
    [{ text: "Slipping regulars", color: ORANGE }, { text: "45.10%", color: ORANGE, bold: true }, "Win back: £1,403,372 past spend among the silent"],
    ["Recent, still small", "0%", "Grow: get the next order sooner"],
    ["Lapsed one-off", "82.91%", "No calls: low-cost bulk email"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 7.2, y: 1.7, w: 5.5, colW: [1.65, 1.05, 2.8], rowH: 0.62 });
  noteBar(s, 7.2, 4.95, 5.5, 0.95, [{ text: "Customer 18073 is a Slipping regular: F and M score 5, but R only 3.", options: {} }], "EAF0FC", "9AA8D6");
  noteBar(s, 0.6, 6.1, 12.1, 0.65, [
    { text: "Careful: ", options: { bold: true } },
    { text: "Recency is both an input and the definition of \"silent\", so the % silent per segment describes; it does not predict. Prediction is the next slide.", options: {} },
  ]);
  addFooter(s, "Names come from each cluster's medians, so re-running (cluster numbers may swap) keeps the same names");
}

// ---- 9. Classification setup ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · ANALYSIS");
  slideTitle(s, "G2-D3 · Predicting who goes silent in the next 180 days", "Train on one period, test on a later one the model never saw");
  const lane = (y, label, cut, n, silent, color) => {
    s.addText(label, { x: 0.6, y, w: 1.6, h: 0.6, fontFace: FONT_BODY, fontSize: 13, bold: true, color: TEXT_DARK, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 2.3, y: y + 0.12, w: 3.2, h: 0.36, fill: { color: "D7E1F5" }, line: { type: "none" } });
    s.addText("features: orders before the cut-off", { x: 2.3, y: y + 0.12, w: 3.2, h: 0.36, fontFace: FONT_BODY, fontSize: 11, color: TEXT_DARK, align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 5.55, y: y + 0.12, w: 2.2, h: 0.36, fill: { color }, line: { type: "none" } });
    s.addText("label: no order in 180 days?", { x: 5.55, y: y + 0.12, w: 2.2, h: 0.36, fontFace: FONT_BODY, fontSize: 11, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(cut, { x: 7.9, y, w: 1.75, h: 0.6, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, valign: "middle", margin: 0 });
    formula(s, 9.75, y + 0.3, [{ num: silent + " went silent", den: n + " active" }, " = " + (label === "Train" ? "48.12%" : "30.03%")], 12.5);
  };
  lane(1.65, "Train", "cut-off 9 Dec 2010", "3,477", "1,673", NAVY);
  lane(2.3, "Test", "cut-off 9 Jun 2011", "2,634", "791", GOLD);
  const rows = tableOf(["Model", "AUC (train, 5-fold CV)", "AUC (test)", "Note"], [
    ["Rule: sort by days since last order", "—", "0.668", "No model"],
    [{ text: "Logistic regression", bold: true }, "0.782 ± 0.017", { text: "0.778", bold: true, color: TEXT_DARK }, "Chosen type; weighted version 0.777 (next slide)"],
    ["Decision tree (depth 4)", "0.756 ± 0.018", "0.755", "Used to explain rules"],
    ["Random forest", "0.775 ± 0.018", "0.784", "Within 1 SD of logistic"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 0.6, y: 3.15, w: 12.1, colW: [3.6, 2.4, 1.6, 4.5], rowH: 0.45 });
  noteBar(s, 0.6, 5.55, 5.9, 1.15, [
    { text: "Only active customers ", options: { bold: true } },
    { text: "(last order ≤ 180 days ago). Those already silent need no prediction. 13 features, all from before the cut-off.", options: {} },
  ]);
  noteBar(s, 6.8, 5.55, 5.9, 1.15, [
    { text: "Returns are not a warning sign: ", options: { bold: true } },
    { text: "with other features held fixed, the \"has returned\" coefficient is −0.42 (less likely to go silent).", options: {} },
  ], "EAF0FC", "9AA8D6");
  addFooter(s, "48% vs 30%: the train cut-off is early December, so it includes one-off Christmas buyers (seasonality)");
}

// ---- 10. Classification result ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · RESULTS");
  slideTitle(s, "G2-D3 · If sales can make 50 calls", "The model's list finds 15 truly silent customers; the simple rule finds 9");
  s.addChart(pres.charts.BAR, [{ name: "Truly silent in the top 50", labels: ["Rule: no order ≥ 54 days", "Model, unweighted", "Model weighted by spend (chosen)", "Weighted, ranked by P × spend"], values: [9, 24, 15, 10] }], {
    x: 0.5, y: 1.6, w: 6.3, h: 3.2, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [GREY, GREY, NAVY, GREY], showValue: true, dataLabelFontSize: 12, dataLabelColor: TEXT_DARK,
    catAxisLabelFontSize: 11.5, valAxisHidden: true, valGridLine: { style: "none" }, valAxisMaxVal: 30, showTitle: true, title: "Customers who really went silent, of 50 called", titleFontSize: 12, titleColor: TEXT_MUTED, barGapWidthPct: 40,
  });
  const rows = tableOf(["Top 50 list", "Hit rate", "Their 12-month spend"], [
    ["Rule ≥ 54 days", "9 of 50 (18.0%)", "£99,596"],
    ["Unweighted model", "24 of 50 (48.0%)", "£37,402"],
    [{ text: "Weighted model (chosen)", bold: true, fill: "FFF4E0" }, { text: "15 of 50 (30.0%)", bold: true, fill: "FFF4E0", color: TEXT_DARK }, { text: "£112,332", bold: true, fill: "FFF4E0", color: TEXT_DARK }],
    ["Ranked by P × spend", "10 of 50 (20.0%)", "£118,707"],
  ], 12);
  s.addTable(rows, { ...TBL, x: 7.1, y: 1.7, w: 5.6, colW: [2.2, 1.7, 1.7], rowH: 0.45 });
  const cm = tableOf(["Test set, P ≥ 0.5", "Predicted silent", "Predicted active"], [
    ["Actually silent", { text: "TP 594", bold: true, color: GREEN }, { text: "FN 197", color: RED }],
    ["Actually active", { text: "FP 600", color: RED }, { text: "TN 1,243", bold: true, color: GREEN }],
  ], 12);
  s.addTable(cm, { ...TBL, x: 7.1, y: 4.0, w: 5.6, colW: [2.2, 1.7, 1.7], rowH: 0.4 });
  formula(s, 7.1, 5.6, ["Recall ", { num: "594", den: "791" }, " = 75.09%   Precision ", { num: "594", den: "1,194" }, " = 49.75%   F1 0.5985"], 11.5);
  noteBar(s, 0.6, 5.0, 6.2, 0.8, [{ text: "Weighting each customer by 12-month spend moves bigger customers up, so the list protects more money.", options: {} }], "EAF0FC", "9AA8D6");
  noteBar(s, 0.6, 6.05, 12.1, 0.75, [
    { text: "Honest reading: ", options: { bold: true, color: RED } },
    { text: "30% is not high. Accuracy 69.74% is just below guessing \"active\" for everyone (69.97%), but that guess finds 0 silent customers.", options: {} },
  ]);
  addFooter(s, "Spend = last 12 months' spend of the customers who really went silent · 250-list results in the appendix");
}

// ---- 11. Power BI overview ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · DASHBOARD");
  slideTitle(s, "G2-D1 · Power BI: the monthly view for executives", "Top chart: % of customers silent over 180 days, at each month-end");
  const h = img(s, "int540-g2-d1-page1-overview.png", 0.6, 1.6, 7.9);
  card(s, 8.8, 1.6, 3.9, h);
  s.addText([
    { text: "Demo path", options: { bold: true, color: GOLD, breakLine: true } },
    { text: "1  Read the top chart: 21% (Dec 2010) → 30% (Mar 2011)", options: { breakLine: true } },
    { text: "2  May 2011 jumps to 45.23%: right-click → drill through", options: { breakLine: true } },
    { text: "3  Slice: Segment = Slipping regulars", options: { breakLine: true } },
    { text: "4  Dice: right-click segment or country → Worklist", options: { breakLine: true } },
    { text: "5  Filter: Risk = High → one customer's orders", options: {} },
  ], { x: 9.0, y: 1.7, w: 3.55, h: h - 0.2, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.25, valign: "top", margin: 0 });
  noteBar(s, 0.6, 6.35, 12.1, 0.55, [{ text: "Star schema: fact_sales, fact_returns, fact_customer_month + 3 dims. Every card matched the Python results before use.", options: {} }]);
  addFooter(s, "Data covers Dec 2009 – 9 Dec 2011: the monthly update is simulated by moving the cut-off");
}

// ---- 11a–11b. Demo clips 1–2 (then slide 12 frames the decision) ----
videoSlide("G2-D1 · Demo 1 of 5 · Read the overview", "Silent customers nearly doubled in a year: 21.07% → 40.64%", "clip1-overview", [
  "Cards: 40.64% silent at 9 Dec 2011; 966 customers at high risk (from the model)",
  "Top chart: 21.07% (Dec 2010) → 29.67% (Mar 2011) → 45.23% (May 2011)",
  "Segments: Loyal wholesale are 19.0% of customers but 71.6% of revenue",
]);
videoSlide("G2-D1 · Demo 2 of 5 · Drill through", "May 2011: 987 customers went silent, most last ordered Oct–Nov 2010", "clip2-drill-may-2011", [
  "Right-click 2011-05 → Drill through → Month drill",
  "987 = silent at end of May, still active at end of March",
  "Last order: 396 in Oct, 563 in Nov, 28 in Dec 2010",
]);

// ---- 12. Drill: month ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "8 · DASHBOARD");
  slideTitle(s, "G2-D1 · Drill through: May 2011", "987 newly silent customers, mostly buyers from Oct–Nov 2010");
  const h = img(s, "int540-g2-d1-page3-month-drill.png", 0.6, 1.6, 7.4);
  statCard(s, 8.3, 1.6, 2.1, 1.3, "987", "silent at end of May, active at end of March", NAVY);
  statCard(s, 10.6, 1.6, 2.1, 1.3, "396 + 563", "last ordered Oct + Nov 2010 (28 in Dec)", ORANGE);
  card(s, 8.3, 3.1, 4.4, 1.6, "FFF4E0");
  s.addText([
    { text: "Decision this suggests (not yet tested): ", options: { bold: true, color: GOLD, breakLine: true } },
    { text: "follow up customers who arrive before the holidays within 1–2 months, instead of waiting 6.", options: {} },
  ], { x: 8.5, y: 3.15, w: 4.05, h: 1.5, fontFace: FONT_BODY, fontSize: 13, color: TEXT_DARK, valign: "middle", margin: 0 });
  card(s, 8.3, 4.9, 4.4, 1.35);
  s.addText([
    { text: "Aug → Dec 2011: ", options: { bold: true } },
    { text: "the total falls 46.78% → 40.64%, but silent regulars (6+ orders) rise 201 → 205. One headline number hides this.", options: {} },
  ], { x: 8.5, y: 4.95, w: 4.05, h: 1.25, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, valign: "middle", margin: 0 });
  s.addText("Month-drill page after right-clicking 2011-05 on the top chart", { x: 0.6, y: 1.65 + h + 0.08, w: 7.4, h: 0.35, fontFace: FONT_BODY, fontSize: 11.5, italic: true, color: TEXT_MUTED, margin: 0 });
  addFooter(s, "987 = silent at end of May but active two month-ends earlier; not the sum of monthly newly_silent (1,023)");
}

// ---- 12a–12c. Demo clips 3–5: slice, dice, one customer ----
videoSlide("G2-D1 · Demo 3 of 5 · Slice", "Slipping regulars: 45.10% silent, 52 at high risk", "clip3-segment-slicer", [
  "Segment slicer = Slipping regulars",
  "Every card and chart on the page follows the slicer",
]);
videoSlide("G2-D1 · Demo 4 of 5 · Dice", "18 of the top 50 high-risk customers are Slipping regulars", "clip4-drill-worklist", [
  "Right-click the segment bar → Drill through → Worklist",
  "Worklist = top 50 High-risk customers by 12-month spend",
  "Days since last order turn red past 3× the customer's usual gap",
]);
videoSlide("G2-D1 · Demo 5 of 5 · One customer", "Customer 18073 ordered every 7.5 days, now silent for 114", "clip5-customer-18073", [
  "Right-click a customer → Drill through → Customer history",
  "Last order 17 Aug 2011: the caller sees what they bought before phoning",
]);

// ---- 12d. Strategy map (asked for by the lecturer, class 19 Nov) ----
// Same four BSC objectives, KPIs and baselines as the next slide, drawn as cause and effect.
// Read bottom-up. The gold row is where the Goal 2 model acts; the rows above are expected, not yet tested.
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "9 · STRATEGY");
  slideTitle(s, "G2-E · Strategy map", "The model acts at Internal Process; the gains above it need a pilot");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.55, w: 12.1, h: 0.5, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
  s.addText([
    { text: "Strategy: ", options: { bold: true, color: GOLD } },
    { text: "cost leadership: keep frequent wholesale buyers without cutting prices (our interpretation, no cost data)", options: { color: WHITE } },
  ], { x: 0.8, y: 1.55, w: 11.7, h: 0.5, fontFace: FONT_BODY, fontSize: 14, valign: "middle", margin: 0 });
  // top (Financial) to bottom (Learning & Growth)
  const layers = [
    { p: "Financial", obj: "Keep revenue from frequent buyers", kpi: "Spend of silent regulars at risk · baseline £781,671",
      g2: "The 15 truly silent customers in our top 50 hold £112,332 (rule: £99,596); recovering it needs the pilot", st: "Found, not yet recovered", stc: GOLD },
    { p: "Customer", obj: "Fewer active customers go silent", kpi: "% of active customers silent within 180 days · baseline 30.03%",
      g2: "Depends on how many called customers come back", st: "Needs pilot", stc: GOLD },
    { p: "Internal Process", obj: "Call high-risk customers before 180 days", kpi: "% of high-risk customers contacted within 30 days · baseline 0%",
      g2: "Flagged list (1,194 customers) caught 594 of the 791 who went silent (75.09%)", st: "Proven: detection", stc: GREEN, hot: true },
    { p: "Learning & Growth", obj: "Staff review the list every week", kpi: "% of weeks the list is reviewed · baseline 0%",
      g2: "The weekly Worklist screen makes this review measurable; no usage data yet", st: "Measured in use", stc: GOLD },
  ];
  const y0 = 2.25, rh = 0.9, gap = 0.22;
  layers.forEach((L, i) => {
    const y = y0 + i * (rh + gap);
    const fill = L.hot ? "FFF4E0" : CARD_BG;
    s.addText(L.p, { x: 0.6, y, w: 1.9, h: rh, fontFace: FONT_HEAD, fontSize: 14, bold: true, color: NAVY, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.55, y, w: 4.75, h: rh, rectRadius: 0.08, fill: { color: fill }, line: L.hot ? { color: GOLD, width: 2 } : { type: "none" }, shadow: freshShadow() });
    s.addText([
      { text: L.obj, options: { bold: true, color: TEXT_DARK, fontSize: 14, breakLine: true } },
      { text: L.kpi, options: { color: TEXT_MUTED, fontSize: 11 } },
    ], { x: 2.72, y, w: 4.45, h: rh, fontFace: FONT_BODY, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.55, y, w: 5.15, h: rh, rectRadius: 0.08, fill: { color: L.hot ? "FFF4E0" : "EAF0FC" }, line: L.hot ? { color: GOLD, width: 2 } : { type: "none" } });
    s.addText([
      { text: L.hot ? "Goal 2 model acts here: " : "Goal 2: ", options: { bold: true, color: L.hot ? GOLD : NAVY } },
      { text: L.g2, options: { color: TEXT_DARK } },
    ], { x: 7.72, y: y + 0.06, w: 3.45, h: rh - 0.12, fontFace: FONT_BODY, fontSize: 12, valign: "middle", margin: 0 });
    s.addText(L.st, { x: 11.15, y, w: 1.45, h: rh, fontFace: FONT_BODY, fontSize: 11.5, bold: true, color: L.stc, align: "center", valign: "middle", margin: 0 });
    if (i < layers.length - 1) {
      // arrow points up: from the lower box (row i+1) to this one
      s.addShape(pres.shapes.UP_ARROW, { x: 4.75, y: y + rh + 0.02, w: 0.35, h: gap - 0.04, fill: { color: GOLD }, line: { type: "none" } });
    }
  });
  addFooter(s, "Read bottom-up · KPIs and baselines as in the Balanced Scorecard on the next slide");
}

// ---- 13. BSC interpretation ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "9 · STRATEGY");
  slideTitle(s, "G2-E · Back to the Balanced Scorecard", "Goal 2 proves early detection; win-back needs a pilot");
  const P = (t) => ({ text: t, color: GREEN, bold: true });
  const N = (t) => ({ text: t, color: GOLD, bold: true });
  const rows = tableOf(["Perspective", "KPI", "Baseline", "What Goal 2 shows", "Status"], [
    ["Learning & Growth", "% of weeks the list is reviewed", "0%", "Screens and flow that make it measurable", N("Measured in use")],
    ["Internal Process", "% of high-risk customers contacted within 30 days", "0%", "Flagged list caught 594 of the 791 who went silent (75.09%), before 180 days", P("Proven: detection")],
    ["Customer", "% of active customers who go silent within 180 days (new KPI)", "30.03%", "Not yet: depends on the win-back rate", N("Needs pilot")],
    ["Financial", "Spend of silent regulars at risk", "£781,671", "Top 50: £112,332 vs £99,596 for the rule", P("Proven: finding")],
  ], 11.5, [1, 3]);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 12.1, colW: [1.9, 3.1, 1.2, 4.3, 1.6], rowH: 0.6 });
  noteBar(s, 0.6, 5.3, 12.1, 0.85, [
    { text: "Why the KPI changed (team, 5 Nov): ", options: { bold: true } },
    { text: "40.64% counts every customer who ever bought, so new customers and seasons move it (21% → 47% → 40.64%). The active-to-silent rate isolates what the system can change.", options: {} },
  ]);
  noteBar(s, 0.6, 6.3, 12.1, 0.62, [
    { text: "Strategy link: ", options: { bold: true } },
    { text: "cost leadership relies on frequent wholesale buyers; keeping them by targeted calls avoids price cuts (interpretation, no cost data).", options: {} },
  ], "EAF0FC", "9AA8D6");
  addFooter(s, "Strategy map: weekly review (L&G) → contact before 180 days (Process) → fewer go silent (Customer) → revenue kept (Financial)");
}

// ---- 14. Impact, limits, next step ----
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "9 · STRATEGY");
  slideTitle(s, "G2-E · What it could be worth, and what we cannot prove", "The main gain is sales time: 15 real cases per 50 calls instead of 9");
  s.addChart(pres.charts.BAR, [
    { name: "Model (15 silent in top 50)", labels: ["10% won back", "20% won back", "30% won back"], values: [11200, 22500, 33700] },
    { name: "Rule (9 silent in top 50)", labels: ["10% won back", "20% won back", "30% won back"], values: [10000, 19900, 29900] },
  ], {
    x: 0.5, y: 1.6, w: 6.3, h: 3.6, barDir: "col", barGrouping: "clustered", chartColors: [NAVY, GREY], showValue: true, dataLabelFormatCode: '"£"#,##0', dataLabelFontSize: 10, barGapWidthPct: 70,
    catAxisLabelFontSize: 12, valAxisHidden: true, valGridLine: { style: "none" }, showLegend: true, legendPos: "b", legendFontSize: 11.5, showTitle: true, title: "12-month spend of customers won back (assumed rates)", titleFontSize: 12, titleColor: TEXT_MUTED,
  });
  s.addText("Scenario = £112,332 (model) or £99,596 (rule) × assumed win-back rate, rounded. Revenue, not profit.", { x: 0.6, y: 5.25, w: 6.2, h: 0.4, fontFace: FONT_BODY, fontSize: 11.5, italic: true, color: TEXT_MUTED, margin: 0 });
  card(s, 7.1, 1.65, 5.6, 2.55);
  s.addText([
    { text: "Limits we state ourselves", options: { bold: true, color: RED, breakLine: true } },
    { text: "Data is 2009–2011, only one out-of-time test", options: { bullet: true, breakLine: true } },
    { text: "No cost data: revenue, not profit", options: { bullet: true, breakLine: true } },
    { text: "No campaign data: win-back rate is assumed", options: { bullet: true, breakLine: true } },
    { text: "Strong seasonality; scores rank well but overstate risk", options: { bullet: true, breakLine: true } },
    { text: "Customer figures cover 86.84% of sales", options: { bullet: true } },
  ], { x: 7.3, y: 1.7, w: 5.25, h: 2.45, fontFace: FONT_BODY, fontSize: 12.5, color: TEXT_DARK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
  card(s, 7.1, 4.4, 5.6, 1.25, NAVY);
  s.addText([
    { text: "Next step: one 180-day pilot with a control group", options: { bold: true, color: GOLD, breakLine: true } },
    { text: "Split flagged customers at random: call one half, not the other, then compare silent rates.", options: { color: WHITE } },
  ], { x: 7.3, y: 4.45, w: 5.25, h: 1.15, fontFace: FONT_BODY, fontSize: 12.5, valign: "middle", margin: 0 });
  noteBar(s, 0.6, 5.9, 12.1, 0.85, [
    { text: "Conclusion: ", options: { bold: true } },
    { text: "the system adds the missing feedback step. It finds customers before they reach 180 days and ranks them by money; the pilot will measure how many come back.", options: {} },
  ]);
  addFooter(s, "Money gap between model and rule at 50 calls: £112,332 − £99,596 = £12,736 (one test period)");
}

// =====================================================================
// APPENDIX
// =====================================================================
appendixDivider();

// A1 model build steps
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "APPENDIX A1");
  slideTitle(s, "How the classification model was built", "Model choices used training data only; the chosen model was tested once");
  const rows = tableOf(["#", "Step", "Detail"], [
    ["1", "Customer table at each cut-off", "Features from orders before the cut-off; keep customers with recency ≤ 180 days"],
    ["2", "Label", "1 = no invoice in the 180 days after the cut-off"],
    ["3", "13 features", "R, F, M, 12-month net spend, basket value, lines and units, tenure, average gap, gap ratio (recency divided by average gap + 1), return rate, has returned, is UK"],
    ["4", "Pre-processing (logistic)", "11 skewed features: log(1 + x) then standardise; 2 binary: standardise; inside one pipeline fitted on train"],
    ["5", "Compare models", "Stratified 5-fold CV, AUC · tree depth 4, min leaf 50 · forest 400 trees, min leaf 20"],
    ["6", "Choose weighting", "CV on train: weight = 12-month spend + 1 captured 19.06% of lost spend vs square root of spend 18.96%, none 16.01%"],
    ["7", "Test once", "Cut-off 9 Jun 2011: P ≥ 0.5, sort by spend, top 50 vs rule ≥ 54 days (rule set to flag about as many: 1,200 vs 1,194)"],
    ["8", "Use", "Refit on train + test; score 3,474 active customers at 10 Dec 2011 → High (P ≥ 50%) 966, Medium 603, Low 1,905"],
  ], 11.5, [1, 2]);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 12.1, colW: [0.45, 2.6, 9.05], rowH: 0.56 });
  addFooter(s, "Python / scikit-learn, random_state = 42 · analysis/g2d3.py");
}

// A2 kNN and 10-fold
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "APPENDIX A2");
  slideTitle(s, "All models on the test set, including kNN from class", "Weighting, not the model type, explains most of the money gap");
  const rows = tableOf(["Model", "Accuracy", "Precision", "Recall", "F1", "AUC", "Top 50: silent / spend", "Top 250: silent / spend"], [
    [{ text: "Logistic, weighted (chosen)", bold: true }, "69.74%", "49.75%", "75.09%", "0.5985", "0.7774", "30.0% / £112,332", "38.0% / £202,871"],
    ["Logistic, unweighted", "71.72%", "52.41%", "63.34%", "0.5736", "0.7783", "48.0% / £37,402", "42.8% / £100,710"],
    ["Random forest", "71.91%", "52.40%", "70.29%", "0.6004", "0.7835", "56.0% / £38,893", "42.4% / £105,065"],
    ["Decision tree (depth 4)", "64.16%", "43.77%", "67.89%", "0.5322", "0.7552", "18.0% / £39,361", "26.0% / £116,064"],
    ["kNN k = 101", "71.15%", "51.61%", "62.71%", "0.5662", "0.7687", "48.0% / £29,870", "41.6% / £88,012"],
    ["kNN k = 9", "70.24%", "50.35%", "62.96%", "0.5596", "0.7447", "30.0% / £46,729", "32.0% / £111,940"],
  ], 11.5);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 12.1, colW: [2.5, 1.05, 1.05, 1.0, 0.9, 0.9, 2.35, 2.35], rowH: 0.5 });
  noteBar(s, 0.6, 5.4, 12.1, 1.2, [
    { text: "k for kNN chosen by 10-fold CV on train (k ≥ 31 within 1 SD of each other). ", options: { bold: true } },
    { text: "Random forest has slightly higher F1 and AUC; the chosen model captures more money at the top of the list and its coefficients can be explained. Weighted random forest was not tried.", options: {} },
  ]);
  addFooter(s, "Top-N lists: flag P ≥ 50%, then sort by 12-month spend · spend = 12-month spend of customers who really went silent");
}

// A3 regression
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "APPENDIX A3");
  slideTitle(s, "G2-D4 · Regression: tried, not used", "Half of last year's spend predicts the next 6 months better than the models");
  const rows = tableOf(["Method (test set, 2,634 customers)", "MAE per customer", "Spearman rank", "Top 250 hold % of real spend"], [
    [{ text: "Half of last 12 months' spend (no model)", bold: true }, { text: "£742.36", bold: true, color: TEXT_DARK }, "0.654", "58.18%"],
    ["Linear regression (log target)", "£1,384.81", "0.627", "56.46%"],
    ["Random forest", "£1,115.65", "0.640", "57.76%"],
  ], 12.5);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.75, w: 12.1, colW: [4.6, 2.5, 2.3, 2.7], rowH: 0.55 });
  noteBar(s, 0.6, 4.2, 12.1, 1.2, [
    { text: "Linear model passes the F-test (F = 137.48, adjusted R² 0.3379), ", options: { bold: true } },
    { text: "but residuals form a U shape, probably because almost half of customers buy nothing in the window. Out of time it still loses to the simple guess, so the worklist ranks by past 12-month spend.", options: {} },
  ]);
  noteBar(s, 0.6, 5.6, 12.1, 0.9, [{ text: "Monthly forecast for the dashboard: same month last year missed by 5.4% vs 12.3% for a trend + month-dummy model, so the dashboard shows net sales vs last year.", options: {} }], "EAF0FC", "9AA8D6");
  addFooter(s, "Target: net spend in the 180 days after the cut-off · same train/test split as G2-D3");
}

// A4 association
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "APPENDIX A4");
  slideTitle(s, "G2-D5 · Association rules: a talking point for calls", "525 rules, mostly the same product in another colour");
  const rows = tableOf(["If the customer bought", "Offer", "Confidence", "Lift", "Support", "Conviction"], [
    ["GREEN REGENCY TEACUP AND SAUCER", "ROSES REGENCY TEACUP AND SAUCER", "79.70%", "27.3", "2.06%", "4.78"],
    ["SWEETHEART CERAMIC TRINKET BOX", "STRAWBERRY CERAMIC TRINKET BOX", "73.19%", "14.1", "2.34%", "3.54"],
    ["RED HANGING HEART T-LIGHT HOLDER", "WHITE HANGING HEART T-LIGHT HOLDER", "70.82%", "5.3", "3.16%", "2.97"],
    ["JUMBO BAG STRAWBERRY", "JUMBO BAG RED RETROSPOT", "62.88%", "7.1", "2.60%", "2.45"],
    ["JUMBO BAG PINK POLKADOT", "JUMBO BAG RED RETROSPOT", "60.22%", "6.8", "2.91%", "2.29"],
  ], 11.5);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 12.1, colW: [3.5, 3.5, 1.4, 1.1, 1.3, 1.3], rowH: 0.5 });
  noteBar(s, 0.6, 5.0, 12.1, 1.3, [
    { text: "Setup: ", options: { bold: true } },
    { text: "36,594 baskets of identified customers, items in ≥ 1% of baskets, FP-growth, confidence ≥ 30% and lift > 1. Lift is the same both ways; conviction is not, and each rule shown is the direction with the higher conviction. Rules show what sells together; they do not show that an offer brings a customer back.", options: {} },
  ]);
  addFooter(s, "Kept as backup (team decision 5 Nov); terms checked against the 12 Nov class (support, confidence, lift, conviction)");
}

// A5 BI model and checks
{
  const s = pres.addSlide();
  s.background = { color: BG_LIGHT };
  sectionTag(s, "APPENDIX A5");
  slideTitle(s, "Power BI data model and number checks", "Each dashboard figure was matched to the Python result before use");
  const rows = tableOf(["Table", "Rows", "Role"], [
    ["fact_sales", "1,003,343", "One row per receipt line · £19,655,052.81"],
    ["fact_returns", "17,915", "Product returns · −£716,495.53 (3.65%)"],
    ["fact_customer_month", "86,764", "Each customer at 19 points (18 month-ends + 9 Dec 2011): status at that point"],
    ["dim_customer", "5,853", "5,852 customers + Unknown · segment, risk band, worklist rank"],
    ["dim_product / dim_date", "4,741 / 739", "Products · day → month → year (marked as date table)"],
  ], 11.5);
  s.addTable(rows, { ...TBL, x: 0.6, y: 1.65, w: 7.2, colW: [2.2, 1.3, 3.7], rowH: 0.52 });
  const chk = tableOf(["Check", "Expected = on screen"], [
    ["Revenue", "£19,655,052.81"], ["Customers / Silent %", "5,852 / 40.64%"], ["High risk / Top 50 spend", "966 / £116,303.26"],
    ["May 2011: silent / newly silent", "45.23% / 987"], ["Nov 2011 net sales vs last year", "£1,427,124.54 / £1,394,601.80"],
  ], 11.5);
  s.addTable(chk, { ...TBL, x: 8.1, y: 1.65, w: 4.6, colW: [2.2, 2.4], rowH: 0.52 });
  noteBar(s, 0.6, 5.15, 12.1, 1.3, [
    { text: "Why Power BI (team, 5 Nov): ", options: { bold: true } },
    { text: "the raw file has 1,067,371 rows, above Excel's 1,048,576-row limit, and Power BI links several tables without merging. Built from code (build_pbip.py) and refreshed from CSV, so it can be rebuilt.", options: {} },
  ]);
  addFooter(s, "8 relationships, many-to-one, single direction · hidden Checks page holds the comparison");
}

pres.writeFile({ fileName: path.join(__dirname, "G2-presentation.pptx") }).then((f) => console.log("wrote", f));
