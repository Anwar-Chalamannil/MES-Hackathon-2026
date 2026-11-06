# Perq pitch deck: slide plan

File: `Perq-MES-2026-pitch.pptx` (14 slides, 16:9, native editable text, shapes, table and bar chart, speaker notes on every slide). Rebuild with `cd presentation && npm i && node build-deck.js`.

Design: blue #2878FF, buttons #1A5FD6, pink #FFB6D5 (fill only), off-white #F7F7F2, navy #0F1E4A text. Font: Plus Jakarta Sans (not installed on the build machine: PowerPoint falls back to a default font; install the font from Google Fonts before presenting for the exact look; boxes have spare room).

| # | Slide | Message | Status labels |
|---|---|---|---|
| 1 | Title | The menu price is not what you pay | |
| 2 | Hook (bar chart) | Same Jollibee order: Talabat 63.00, Rafeeq 61.50, Snoonu 60.00, Keeta 58.00, Rafeeq with Dukhan Visa card offer 45.30 | simulated |
| 3 | Problem | Fees, vouchers, cards, expiry hide the real total | |
| 4 | Existing solutions | Each app answers only for itself (modest, own experience) | |
| 5 | Solution | One basket, every app, the real total | simulated |
| 6 | How it works | Build, Compare, Check vouchers, Sort (Best price or Fastest) | |
| 7 | Journey | Winner changes: Keeta 58.00, Talabat 52.60, Rafeeq 45.30 | simulated |
| 8 | Features | Five features, three categories | |
| 9 | Voucher intelligence | Eligibility, best combination, expiry alerts, benefit-first titles | benefit-first = Implemented |
| 10 | Your cards, then a guide to order | Both live: Choose your cards (preset plans, no card numbers) and the Shopping guide (items, codes to copy, estimated total, open the app; no order placement) | phones: cards.png, guide.png |
| 11 | Technology | React, TypeScript, Tailwind, pure engine, zustand, Vitest, Playwright, Vercel, no backend | |
| 12 | Differentiation | Table: one delivery app vs Perq | |
| 13 | Impact and future | Real data and ordering need partnerships (no public customer-order API found) | |
| 14 | Close | QR code and perq-qatar.vercel.app | simulated |

3-minute cut (the pitch limit): use 1, 2, 5, 7, 9/10 (one), 11, 14 and keep the rest as backup for questions.

Screenshots in `assets/` come from `brag-output/work/shots/`: `home-top`, `grocery`, `live-1-keeta`, `live-2-talabat`, `live-3-rafeeq`. The older `compare.png`, `alerts.png` (show "Biggest discount" and code-first titles) and `featured.png`, `menu.png` are copied but unused: retake after S1 and V1 are live if you want them.
