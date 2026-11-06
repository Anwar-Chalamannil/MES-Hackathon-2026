// Builds pitch/Perq-MES-2026-pitch.pptx (editable: native text, shapes, table and chart).
// Run: cd presentation && npm i && node build-deck.js
const pptxgen = require('pptxgenjs');
const path = require('path');
const A = (f) => path.join(__dirname, 'assets', f);

const BLUE = '2878FF', BTN = '1A5FD6', PINK = 'FFB6D5', OFF = 'F7F7F2', NAVY = '0F1E4A', WHITE = 'FFFFFF';
const MUTED = '4A5578', LINE = 'DDE2EE', PINKTXT = '9E1F55', PALE = 'E8EFFF';
const FONT = 'Plus Jakarta Sans'; // falls back to Calibri/default if not installed
const DISCLAIMER = 'Simulated demo data. Not affiliated with the brands shown.';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 in (16:9)
pptx.title = 'Perq: the real total, across Qatar\'s delivery apps';
pptx.author = 'Team Perq';
pptx.company = 'MES Youth Hackathon 2026';

let n = 0;
function base(title, opts = {}) {
  const FOOT = opts.bg === NAVY ? NAVY : MUTED;
  const s = pptx.addSlide();
  n += 1;
  s.background = { color: opts.bg || OFF };
  if (title) {
    s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.55, w: 0.12, h: 0.75, fill: { color: BLUE }, line: { color: BLUE, width: 0 } });
    s.addText(title, { x: 0.9, y: 0.4, w: 11.8, h: 1.05, fontFace: FONT, fontSize: 32, bold: true, color: NAVY, valign: 'middle', margin: 0, fit: 'shrink' });
  }
  s.addText(`Perq  |  MES Youth Hackathon 2026`, { x: 0.6, y: 7.05, w: 6, h: 0.3, fontFace: FONT, fontSize: 10, color: FOOT, margin: 0 });
  s.addText(String(n), { x: 12.2, y: 7.05, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 10, color: FOOT, align: 'right', margin: 0 });
  return s;
}
function disclaimer(s, x = 0.6, w = 9) {
  s.addText(DISCLAIMER, { x, y: 6.7, w, h: 0.3, fontFace: FONT, fontSize: 11, italic: true, color: MUTED, margin: 0 });
}
function card(s, x, y, w, h, fill = WHITE) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.18, fill: { color: fill }, line: { color: LINE, width: 1 } });
}
function badge(s, text, x, y, w, kind) {
  const pink = kind === 'planned';
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.38, rectRadius: 0.19, fill: { color: pink ? PINK : BTN }, line: { color: pink ? PINK : BTN, width: 0 } });
  s.addText(text, { x, y, w, h: 0.38, fontFace: FONT, fontSize: 12, bold: true, color: pink ? NAVY : WHITE, align: 'center', valign: 'middle', margin: 0 });
}
function phone(s, img, x, y, h, ratio) {
  const w = h * ratio;
  s.addShape(pptx.ShapeType.roundRect, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, rectRadius: 0.22, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  s.addImage({ path: A(img), x, y, w, h });
  return w;
}
function num(s, k, x, y, d = 0.62) {
  s.addShape(pptx.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: PINK }, line: { color: PINK, width: 0 } });
  s.addText(String(k), { x, y, w: d, h: d, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0 });
}

// 1. Title
{
  const s = base(null, { bg: OFF });
  s.addShape(pptx.ShapeType.ellipse, { x: 8.0, y: 0.9, w: 5.0, h: 5.0, fill: { color: PINK }, line: { color: PINK, width: 0 } });
  phone(s, 'home-top.png', 9.2, 1.0, 5.2, 0.4621);
  s.addImage({ path: A('logo-lockup.png'), x: 0.7, y: 0.55, w: 1.45, h: 1.6 });
  s.addText([{ text: 'The menu price is not', options: { breakLine: true } }, { text: 'what you pay.' }], { x: 0.7, y: 2.4, w: 7.6, h: 1.9, fontFace: FONT, fontSize: 44, bold: true, color: NAVY, valign: 'top', margin: 0 });
  s.addText([{ text: 'Perq compares the final total', options: { breakLine: true } }, { text: 'of one basket across the delivery apps in Qatar.' }], { x: 0.7, y: 4.35, w: 7.6, h: 1.1, fontFace: FONT, fontSize: 22, color: MUTED, margin: 0, valign: 'top' });
  s.addText('MES Youth Hackathon 2026  |  Fadhil, Sadiya, Arefa', { x: 0.7, y: 5.85, w: 7.6, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: BTN, margin: 0 });
  s.addText(DISCLAIMER, { x: 0.7, y: 6.4, w: 7.6, h: 0.35, fontFace: FONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
  s.addNotes('Open with the one-line idea: the menu price is not what you pay. Introduce the team (Fadhil builds, Sadiya and Arefa research, design and test). Perq is a live web app you can open on your phone right now. Everything you will see is simulated demo data, labelled as such in the app.');
}

// 2. Hook + chart
{
  const s = base('One Jollibee order. Five very different totals.');
  s.addChart(pptx.charts.BAR, [{
    name: 'Final total (QAR)',
    labels: ['Talabat', 'Rafeeq', 'Snoonu', 'Keeta', 'Rafeeq with Dukhan Visa card offer'],
    values: [63.0, 61.5, 60.0, 58.0, 45.3],
  }], {
    x: 0.6, y: 1.65, w: 8.2, h: 4.9, barDir: 'col', barGapWidthPct: 45,
    chartColors: ['9FB7E8', '9FB7E8', '9FB7E8', '9FB7E8', BLUE],
    showValue: true, dataLabelFormatCode: '0.00', dataLabelFontFace: FONT, dataLabelFontSize: 14, dataLabelFontBold: true, dataLabelColor: NAVY, dataLabelPosition: 'outEnd',
    catAxisLabelFontFace: FONT, catAxisLabelFontSize: 11, catAxisLabelColor: NAVY,
    valAxisHidden: true, valGridLine: { style: 'none' }, valAxisMinVal: 0, valAxisMaxVal: 72,
    showLegend: false, showTitle: false,
  });
  card(s, 9.2, 1.75, 3.55, 2.35, PINK);
  s.addText('QAR 17.70', { x: 9.4, y: 1.95, w: 3.15, h: 0.9, fontFace: FONT, fontSize: 38, bold: true, color: NAVY, margin: 0 });
  s.addText('lower than the highest total, for the same food', { x: 9.4, y: 2.85, w: 3.15, h: 1.0, fontFace: FONT, fontSize: 16, color: NAVY, margin: 0, valign: 'top' });
  s.addText('2 x 2pc Chickenjoy, Jolly Spaghetti, Regular Coke. Final totals include delivery, service fees and offers. The last bar uses a Dukhan Bank Visa card offer, paid by card.', { x: 9.2, y: 4.3, w: 3.55, h: 1.8, fontFace: FONT, fontSize: 13, color: MUTED, margin: 0, valign: 'top' });
  disclaimer(s);
  s.addNotes('This is the hook. Same Jollibee order on four apps: Keeta QAR 58.00, Snoonu 60.00, Rafeeq 61.50, Talabat 63.00. With a Dukhan Bank Visa card offer paid by card, Rafeeq falls to QAR 45.30. That is QAR 17.70 below the highest total. These numbers come from our simulated demo data (src/data/demoScenarios.ts), not live prices. The point: the cheapest-looking option changes once fees, vouchers and cards are included.');
}

// 3. Problem
{
  const s = base('In Qatar, the real total is hard to see');
  const items = [
    ['Fees', 'Delivery, service and small-order fees differ by app and by basket.'],
    ['Vouchers', 'Codes have minimums, caps, first-order rules and category limits.'],
    ['Cards', 'Bank offers depend on the card, the network and how you pay.'],
    ['Expiry', 'Good offers run out before you remember to use them.'],
  ];
  items.forEach(([h, t], i) => {
    const x = 0.6 + i * 3.1;
    card(s, x, 1.9, 2.9, 3.5);
    num(s, i + 1, x + 0.3, 2.2);
    s.addText(h, { x: x + 0.3, y: 3.05, w: 2.4, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: NAVY, margin: 0 });
    s.addText(t, { x: x + 0.3, y: 3.75, w: 2.4, h: 1.5, fontFace: FONT, fontSize: 17, color: MUTED, margin: 0, valign: 'top' });
  });
  s.addText('So shoppers compare menu prices, but pay something different.', { x: 0.6, y: 5.8, w: 12.1, h: 0.55, fontFace: FONT, fontSize: 22, bold: true, color: BTN, margin: 0 });
  s.addNotes('Four things hide the real total in Qatar: fees that differ per app, vouchers with conditions, bank-card offers that need the right card and payment channel, and offers that expire. Menu prices are easy to compare; the amount you actually pay is not.');
}

// 4. Existing solutions
{
  const s = base('Today, each app only answers for itself');
  const cols = [
    ['Delivery apps', 'Show their own price, their own fees and their own offers.', 'No view of the other apps'],
    ['Voucher codes', 'Spread across apps, chats and bank pages, with fine print.', 'Easy to lose, easy to misuse'],
    ['Comparing by hand', 'Open every app, rebuild the basket, do the sums yourself.', 'Slow, so most people skip it'],
  ];
  cols.forEach(([h, t, lim], i) => {
    const x = 0.6 + i * 4.1;
    card(s, x, 1.8, 3.9, 3.7);
    s.addText(h, { x: x + 0.3, y: 2.05, w: 3.3, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: NAVY, margin: 0 });
    s.addText(t, { x: x + 0.3, y: 2.8, w: 3.3, h: 1.3, fontFace: FONT, fontSize: 18, color: MUTED, margin: 0, valign: 'top' });
    s.addShape(pptx.ShapeType.roundRect, { x: x + 0.3, y: 4.45, w: 3.3, h: 0.7, rectRadius: 0.15, fill: { color: PINK }, line: { color: PINK, width: 0 } });
    s.addText('Limit: ' + lim, { x: x + 0.3, y: 4.45, w: 3.3, h: 0.7, fontFace: FONT, fontSize: 14, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0 });
  });
  s.addText('Missing: one place that compares the final total across apps for the same basket.', { x: 0.6, y: 5.85, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 20, bold: true, color: BTN, margin: 0 });
  s.addText('Based on our team\'s own use of these apps, not a market study.', { x: 0.6, y: 6.6, w: 9, h: 0.3, fontFace: FONT, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  s.addNotes('Keep this modest. Each delivery app shows its own prices, fees and offers. Voucher codes live in many places. Doing the comparison by hand means opening every app and rebuilding the basket. As far as our team has found, there is no single place that compares the final payable total across apps. This is our own experience, not a formal market study (research notes in docs/02-research.md are still to be completed).');
}

// 5. Solution
{
  const s = base('Perq: one basket, every app, the real total');
  const pts = [
    ['Same items, same brands', 'Pick a basket once, in food, groceries or pharmacy.'],
    ['Final payable amount', 'Items, delivery, service and small-order fees, sales and eligible vouchers.'],
    ['Plain-language reasons', 'See why a voucher applied, and what is missing when it does not.'],
  ];
  pts.forEach(([h, t], i) => {
    const y = 1.85 + i * 1.55;
    num(s, i + 1, 0.7, y + 0.1);
    s.addText(h, { x: 1.6, y, w: 6.6, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: NAVY, margin: 0 });
    s.addText(t, { x: 1.6, y: y + 0.55, w: 6.6, h: 0.85, fontFace: FONT, fontSize: 16, color: MUTED, margin: 0, valign: 'top' });
  });
  s.addShape(pptx.ShapeType.ellipse, { x: 8.7, y: 1.0, w: 4.4, h: 4.4, fill: { color: PINK }, line: { color: PINK, width: 0 } });
  phone(s, 'grocery.png', 9.5, 1.3, 5.0, 0.4621);
  disclaimer(s);
  s.addNotes('Perq is a mobile-first web app. You choose a basket once; Perq works out the final amount on each app that can deliver it, including fees, sales and the vouchers you are actually eligible for, and explains the reasoning. Judges open it by QR code; no install and no account.');
}

// 6. How it works
{
  const s = base('How it works');
  const steps = [
    ['Build', 'a basket'],
    ['Compare', 'final totals'],
    ['Check', 'vouchers'],
    ['Sort', 'Best price or Fastest'],
    ['Shop', 'with the guide'],
  ];
  steps.forEach(([h, t], i) => {
    const x = 0.6 + i * 2.47, last = i === steps.length - 1;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.2, w: 2.15, h: 2.4, rectRadius: 0.2, fill: { color: last ? BTN : WHITE }, line: { color: last ? BTN : LINE, width: 1 } });
    num(s, i + 1, x + 0.22, 2.45, 0.55);
    s.addText(h, { x: x + 0.22, y: 3.15, w: 1.8, h: 0.6, fontFace: FONT, fontSize: 22, bold: true, color: last ? WHITE : NAVY, margin: 0 });
    s.addText(t, { x: x + 0.22, y: 3.75, w: 1.8, h: 0.75, fontFace: FONT, fontSize: 15, color: last ? WHITE : MUTED, margin: 0, valign: 'top' });
    if (!last) s.addShape(pptx.ShapeType.rightArrow, { x: x + 2.18, y: 3.2, w: 0.26, h: 0.4, fill: { color: BLUE }, line: { color: BLUE, width: 0 } });
  });
  card(s, 0.6, 5.0, 12.1, 1.35, PALE);
  s.addText('One pure calculation engine does the maths for every category. Same inputs always give the same answer, so every number is explainable and tested.', { x: 0.9, y: 5.1, w: 11.5, h: 1.15, fontFace: FONT, fontSize: 17, color: NAVY, margin: 0, valign: 'middle' });
  s.addNotes('Four steps. Build a basket. Perq compares the final total on each app. Voucher intelligence checks which vouchers are eligible and picks the best combination. Then you sort by Best price or Fastest, and tap Shop at the winning app for a shopping guide. Behind this is one pure TypeScript calculation engine shared by food, groceries and pharmacy; it is unit tested, so the numbers are reproducible, not hard-coded in the UI.');
}

// 7. Journey (three phones)
{
  const s = base('Watch the winner change');
  const shots = [
    ['live-1-keeta.png', 'Start', 'Keeta wins: QAR 58.00'],
    ['live-2-talabat.png', 'Add voucher DEMO-TB20', 'Talabat wins: QAR 52.60'],
    ['live-3-rafeeq.png', 'Add your Dukhan Visa Signature card', 'Rafeeq wins: QAR 45.30'],
  ];
  shots.forEach(([img, a, b], i) => {
    const x = 0.75 + i * 4.15;
    const h = 4.0;
    phone(s, img, x, 1.7, h, 0.4742);
    s.addText(a, { x: x + 2.1, y: 2.4, w: 1.9, h: 1.1, fontFace: FONT, fontSize: 14, bold: true, color: BTN, margin: 0, valign: 'top' });
    s.addText(b, { x: x + 2.1, y: 3.55, w: 1.9, h: 1.2, fontFace: FONT, fontSize: 14, color: NAVY, margin: 0, valign: 'top' });
  });
  s.addText('Same order, three changes, three different winners. The demo path takes under 3 minutes.', { x: 0.6, y: 6.1, w: 12.1, h: 0.4, fontFace: FONT, fontSize: 17, bold: true, color: NAVY, margin: 0 });
  disclaimer(s);
  s.addNotes('Walk the live demo. Step 1: Keeta wins at QAR 58.00 even though its menu prices are highest, because of free delivery for new users. Step 2: add voucher DEMO-TB20 and Talabat wins at QAR 52.60. Step 3: with a Dukhan Bank Visa Signature saved in My cards (paid by card), Rafeeq wins at QAR 45.30. If the live demo fails, use these screenshots or the recorded fallback video. All simulated.');
}

// 8. Key features
{
  const s = base('Five features, three categories');
  const f = [
    ['Smart Basket Comparison', 'Final total per app'],
    ['Voucher Wallet and Eligibility', 'Save, check, explain'],
    ['Smart Sorting', 'Best price or Fastest'],
    ['Voucher Expiry Tracker', 'In-app alerts'],
    ['Dashboard and mobile UI', 'Fast on a phone'],
  ];
  f.forEach(([h, t], i) => {
    const y = 1.55 + i * 0.88;
    num(s, i + 1, 0.7, y + 0.03, 0.6);
    s.addText(h, { x: 1.55, y, w: 6.6, h: 0.45, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0 });
    s.addText(t, { x: 1.55, y: y + 0.42, w: 6.6, h: 0.4, fontFace: FONT, fontSize: 14, color: MUTED, margin: 0 });
  });
  ['Restaurants', 'Groceries', 'Pharmacy and personal care'].forEach((c, i) => {
    const xs = [0.7, 3.0, 5.1];
    const ws = [2.1, 1.9, 3.3];
    s.addShape(pptx.ShapeType.roundRect, { x: xs[i], y: 6.25, w: ws[i], h: 0.5, rectRadius: 0.25, fill: { color: i === 1 ? PINK : PALE }, line: { color: LINE, width: 0 } });
    s.addText(c, { x: xs[i], y: 6.25, w: ws[i], h: 0.5, fontFace: FONT, fontSize: 14, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0 });
  });
  s.addShape(pptx.ShapeType.ellipse, { x: 8.9, y: 1.1, w: 4.2, h: 4.2, fill: { color: PINK }, line: { color: PINK, width: 0 } });
  phone(s, 'home-top.png', 9.6, 1.15, 4.7, 0.4621);
  s.addNotes('Five features, all built and working: basket comparison, voucher wallet with an eligibility checker, smart sorting (Best price and Fastest), a voucher expiry tracker with in-app alerts, and a responsive mobile-first dashboard. Three categories: restaurants (Talabat, Snoonu, Rafeeq, Keeta), groceries (Carrefour, Lulu, Ninja and others) and pharmacy and personal care (Wellcare, Kulud). No medicines. Saved data stays on the device.');
}

// 9. Voucher intelligence
{
  const s = base('Voucher intelligence');
  const q = [
    ['Eligibility, explained', 'A code that does not apply says why, for example "Add QAR 3.00 more".', null],
    ['Best eligible combination', 'The engine picks the best vouchers, bank offers and sales that can really be used.', null],
    ['Expiry alerts', 'Saved vouchers raise in-app alerts at 7 days, 3 days, 24 hours and after expiry.', null],
    ['Benefit-first titles', '"30% OFF" first, the cap below, then the code with one-tap Copy.', 'Live'],
  ];
  q.forEach(([h, t, tag], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.75 + Math.floor(i / 2) * 2.3;
    card(s, x, y, 5.95, 2.1);
    s.addText(h, { x: x + 0.3, y: y + 0.2, w: tag ? 3.6 : 5.3, h: 0.55, fontFace: FONT, fontSize: 21, bold: true, color: NAVY, margin: 0 });
    if (tag) badge(s, tag, x + 4.1, y + 0.25, 1.6, 'done');
    s.addText(t, { x: x + 0.3, y: y + 0.85, w: 5.3, h: 1.1, fontFace: FONT, fontSize: 18, color: MUTED, margin: 0, valign: 'top' });
  });
  s.addText('Alerts work while Perq is open. There is no push notification.', { x: 0.6, y: 6.5, w: 9, h: 0.3, fontFace: FONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
  s.addNotes('Voucher intelligence is the heart of Perq. Eligibility: every voucher is checked against the basket, the app, minimum spend, first-order rules and your profile, and a rejected voucher explains why. The optimiser chooses the best eligible combination. Expiry: saved vouchers generate in-app alerts at 7 days, 3 days, 24 hours and expired. These only show while the app is open; no background push. Benefit-first titles are live: the voucher says what you get (30% OFF, up to QAR 30), and the code sits below with a Copy button. Demo codes say they will not work in the real app.');
}

// 10. Cards + Shopping guide (both live)
{
  const s = base('Your cards, then a guide to order');
  const half = (x, img, title, lines, note) => {
    card(s, x, 1.6, 6.0, 4.9);
    phone(s, img, x + 0.3, 1.85, 4.4, 0.4621);
    badge(s, 'Live', x + 2.65, 1.9, 0.9, 'done');
    s.addText(title, { x: x + 2.65, y: 2.45, w: 3.15, h: 0.9, fontFace: FONT, fontSize: 21, bold: true, color: NAVY, margin: 0, valign: 'top' });
    s.addText(lines.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < lines.length - 1 } })), { x: x + 2.65, y: 3.4, w: 3.15, h: 2.3, fontFace: FONT, fontSize: 14, color: MUTED, margin: 0, valign: 'top', paraSpaceAfter: 6 });
    s.addText(note, { x: x + 2.65, y: 5.75, w: 3.15, h: 0.6, fontFace: FONT, fontSize: 12, bold: true, color: BTN, margin: 0, valign: 'top' });
  };
  half(0.6, 'cards.png', 'Choose your cards, once', [
    'Real Qatar card plans from a list',
    'Bank, network, tier, credit or debit',
    'Perq tries every card, keeps the best',
  ], 'No card numbers, ever.');
  half(6.75, 'guide.png', 'Shopping guide for the winner', [
    'Items to add, with a tick list',
    'Vouchers to use, codes to copy',
    'Estimated total, then open the app',
  ], 'Perq does not place the order.');
  disclaimer(s);
  s.addNotes('Both are live. Choose your cards: on first visit Perq asks which card plans you hold, from a preset list of real Qatar plans such as the Dukhan Bank Visa Signature or QNB Life Rewards Visa Infinite. No card numbers. Perq then runs the comparison for every saved card and keeps the best: with a Dukhan Visa Signature, Rafeeq drops to QAR 45.30; a Dukhan Platinum does not qualify for that offer, and the app says so. The Shopping guide: tap Shop at Rafeeq to get the items to add, the 30% OFF voucher with its code to copy, the estimated total and a link to open the app. Perq does not place orders or take payment, because no platform offers a public ordering API. Offers and codes are simulated.');
}

// 11. Technology
{
  const s = base('Built to be fast, testable and simple');
  const layers = [
    ['Interface', 'React, TypeScript (strict), Tailwind, react-router, zustand (saved on the device)', BTN, WHITE],
    ['Calculation engine', 'Pure TypeScript: eligibility, best combination, sorting, explanations. Money in whole dirhams.', BLUE, WHITE],
    ['Simulated data', 'Catalogues, fees and promotions in code, each labelled as simulated', PALE, NAVY],
  ];
  layers.forEach(([h, t, fill, col], i) => {
    const y = 1.75 + i * 1.45;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y, w: 7.6, h: 1.25, rectRadius: 0.15, fill: { color: fill }, line: { color: fill, width: 0 } });
    s.addText(h, { x: 0.85, y: y + 0.1, w: 7.1, h: 0.45, fontFace: FONT, fontSize: 19, bold: true, color: col, margin: 0 });
    s.addText(t, { x: 0.85, y: y + 0.55, w: 7.1, h: 0.65, fontFace: FONT, fontSize: 15, color: col, margin: 0, valign: 'top' });
    if (i < 2) s.addShape(pptx.ShapeType.downArrow, { x: 4.2, y: y + 1.24, w: 0.3, h: 0.22, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  });
  card(s, 8.6, 1.75, 4.15, 1.9);
  s.addText([
    { text: 'Quality', options: { bold: true, fontSize: 18, color: NAVY, breakLine: true } },
    { text: '375 unit tests and 50 end-to-end tests. Automated accessibility checks (axe): 0 violations.', options: { fontSize: 15, color: MUTED } },
  ], { x: 8.8, y: 1.9, w: 3.75, h: 1.65, fontFace: FONT, margin: 0, valign: 'top' });
  card(s, 8.6, 3.85, 4.15, 1.9);
  s.addText([
    { text: 'Hosting', options: { bold: true, fontSize: 18, color: NAVY, breakLine: true } },
    { text: 'Vite static build on Vercel. No backend, no accounts, no database.', options: { fontSize: 15, color: MUTED } },
  ], { x: 8.8, y: 4.0, w: 3.75, h: 1.65, fontFace: FONT, margin: 0, valign: 'top' });
  s.addText('Demo numbers are checked by tests and never hard-coded in the interface.', { x: 0.6, y: 6.2, w: 12.1, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: BTN, margin: 0 });
  s.addNotes('Technology in one picture. React, TypeScript and Tailwind for the interface, zustand for state saved on the device, a pure calculation engine with no React inside it so it can be tested exhaustively, and simulated data in code. Vitest for 375 unit tests (including the exact demo numbers), Playwright for 50 end-to-end tests, Playwright for end-to-end flows, axe for accessibility. Deployed on Vercel as a static site: no backend, which also means no personal data is collected.');
}

// 12. Differentiation (native table)
{
  const s = base('What makes Perq different');
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontFace: FONT, fontSize: 15, align: 'center', valign: 'middle' } });
  const c1 = (t) => ({ text: t, options: { bold: true, color: NAVY, fontFace: FONT, fontSize: 15, valign: 'middle' } });
  const no = (t) => ({ text: t, options: { color: MUTED, fontFace: FONT, fontSize: 14, align: 'center', valign: 'middle' } });
  const yes = (t) => ({ text: t, options: { color: NAVY, bold: true, fill: { color: PALE }, fontFace: FONT, fontSize: 14, align: 'center', valign: 'middle' } });
  const rows = [
    [hdr(''), hdr('One delivery app'), hdr('Perq')],
    [c1('Compares across apps'), no('Its own price only'), yes('Final total per app')],
    [c1('Voucher help'), no('Its own codes'), yes('Eligibility and reasons')],
    [c1('Cards and pay channel'), no('Partly, in its own flow'), yes('Part of the maths')],
    [c1('Expiry reminders'), no('Varies'), yes('In-app alerts')],
    [c1('Honesty about data'), no('Real prices'), yes('Labelled simulated demo')],
  ];
  s.addTable(rows, { x: 0.6, y: 1.7, w: 12.1, colW: [3.7, 4.2, 4.2], rowH: 0.72, border: { type: 'solid', pt: 1, color: LINE }, fill: { color: WHITE } });
  s.addText('Perq complements the apps; it does not replace them.', { x: 0.6, y: 6.2, w: 12.1, h: 0.4, fontFace: FONT, fontSize: 17, bold: true, color: BTN, margin: 0 });
  s.addText('Comparison reflects what we saw using the apps; not an audit of their features.', { x: 0.6, y: 6.65, w: 9, h: 0.3, fontFace: FONT, fontSize: 11, italic: true, color: MUTED, margin: 0 });
  s.addNotes('Differentiation without naming competitors. A single delivery app only knows its own price and its own codes. Perq compares the final total across apps, explains voucher eligibility, includes card and pay channel in the maths, and tracks expiry. It complements the apps. Our prototype uses simulated data, which we state openly. Claims about other apps reflect our own use, not an audit.');
}

// 13. Impact and future
{
  const s = base('Impact and what comes next');
  card(s, 0.6, 1.7, 5.95, 4.75);
  s.addText('Practical impact, Qatar first', { x: 0.9, y: 1.9, w: 5.4, h: 0.5, fontFace: FONT, fontSize: 21, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: 'Fewer surprises at checkout', options: { bullet: true, breakLine: true } },
    { text: 'Use the right voucher or card before it expires', options: { bullet: true, breakLine: true } },
    { text: 'Compare food, groceries and pharmacy in one place', options: { bullet: true, breakLine: true } },
    { text: 'Our demo basket: QAR 17.70 between the highest total and the best', options: { bullet: true } },
  ], { x: 0.9, y: 2.55, w: 5.4, h: 3.7, fontFace: FONT, fontSize: 19, color: MUTED, margin: 0, valign: 'top', paraSpaceAfter: 10 });
  card(s, 6.8, 1.7, 5.95, 4.75, 'FFF1F7');
  s.addText('The honest path to real data', { x: 7.1, y: 1.9, w: 5.4, h: 0.5, fontFace: FONT, fontSize: 21, bold: true, color: NAVY, margin: 0 });
  s.addText([
    { text: 'Live prices and ordering need partnerships: we found no public customer-order API on Talabat, Snoonu, Rafeeq, Keeta, Ninja, Carrefour, Lulu, Kulud or Wellcare', options: { bullet: true, breakLine: true } },
    { text: 'Today: the Shopping guide tells you what to add and which codes to copy, then opens the app', options: { bullet: true, breakLine: true } },
    { text: 'Later: partner feeds, Arabic interface, more stores', options: { bullet: true } },
  ], { x: 7.1, y: 2.55, w: 5.4, h: 3.8, fontFace: FONT, fontSize: 19, color: MUTED, margin: 0, valign: 'top', paraSpaceAfter: 10 });
  s.addNotes('Impact: shoppers avoid surprise fees, use vouchers and cards correctly before they expire, and compare across categories. Be honest about limits: this is a prototype on simulated data. To show real prices or place real orders we would need partnerships; our research found no public customer-order API on the nine platforms (Talabat, Snoonu, Rafeeq, Keeta, Ninja, Carrefour, Lulu, Kulud, Wellcare). That is why we chose a guided approach rather than faking order placement. Roadmap: partner data, Arabic UI, more stores.');
}

// 14. Final
{
  const s = base(null, { bg: NAVY });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.2, w: 4.8, h: 4.8, rectRadius: 0.25, fill: { color: WHITE }, line: { color: WHITE, width: 0 } });
  s.addImage({ path: A('qr.png'), x: 1.05, y: 1.45, w: 4.3, h: 4.3 });
  s.addText('Try Perq on your phone', { x: 6.2, y: 1.2, w: 6.6, h: 1.0, fontFace: FONT, fontSize: 38, bold: true, color: WHITE, margin: 0, valign: 'middle' });
  s.addShape(pptx.ShapeType.roundRect, { x: 6.2, y: 2.5, w: 6.4, h: 0.95, rectRadius: 0.2, fill: { color: PINK }, line: { color: PINK, width: 0 } });
  s.addText('perq-qatar.vercel.app', { x: 6.2, y: 2.5, w: 6.4, h: 0.95, fontFace: FONT, fontSize: 30, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0 });
  s.addText('The menu price is not what you pay. Perq shows what you actually pay.', { x: 6.2, y: 3.8, w: 6.4, h: 1.0, fontFace: FONT, fontSize: 20, color: WHITE, margin: 0, valign: 'top' });
  s.addText('Fadhil: build   |   Sadiya and Arefa: research, design, testing, pitch', { x: 6.2, y: 5.0, w: 6.6, h: 0.5, fontFace: FONT, fontSize: 14, color: 'C9D6F2', margin: 0 });
  s.addText(DISCLAIMER, { x: 0.8, y: 6.4, w: 11, h: 0.35, fontFace: FONT, fontSize: 12, italic: true, color: 'C9D6F2', margin: 0 });
  s.addNotes('Close with the call to action: scan the QR code and try the Jollibee demo basket on your own phone. The site is live at perq-qatar.vercel.app. Restate the idea in one line, thank the judges, and invite questions. Remind them it is simulated data. Each member\'s contribution: Fadhil built the app with Claude Code; Sadiya and Arefa did research, design review, device testing and the pitch (confirm wording with the team).');
}

pptx.writeFile({ fileName: path.join(__dirname, '..', 'pitch', 'Perq-MES-2026-pitch.pptx') }).then((f) => console.log('wrote', f));
