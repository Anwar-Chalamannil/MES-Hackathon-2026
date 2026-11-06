# MES Youth Hackathon 2026 (first edition)

## Deadline
**Final project submission: Sat 7 Nov 2026, 3:00-3:15 PM (Qatar time).** Live pitches and judging follow, 3:15-5:00 PM.

## Judging criteria
Innovation · Problem understanding · Potential impact · Technical execution · Presentation

## Links
- Live site: https://perq-qatar.vercel.app/ (the older address https://mes-hackathon-2026.vercel.app/ still works)
- Repo: https://github.com/Anwar-Chalamannil/MES-Hackathon-2026
- Event: meshackathon.com · info@meshackathon.com

## What Perq is
Perq is a mobile-first web app for Qatar that compares the same basket across delivery apps and stores and shows the **final payable amount** (item prices, delivery, service and small-order fees, sale prices, eligible vouchers). All prices, fees and vouchers are **simulated demo data, not affiliated with the brands shown**. No backend, no accounts.

Hero example (Jollibee: 2 x 2pc Chickenjoy, Jolly Spaghetti, Regular Coke): Keeta QAR 58.00, Snoonu 60.00, Rafeeq 61.50, Talabat 63.00. With voucher DEMO-TB20 Talabat drops to 52.60, and with a Dukhan Bank Visa Signature card (paid by card) Rafeeq drops to 45.30 (source: `src/data/demoScenarios.ts`).

## Features (all live at https://perq-qatar.vercel.app/, commit `125f4d8`, 6 Nov 2026)
- **Smart Basket Comparison** for restaurants, groceries, and pharmacy and personal care (one shared engine).
- **Voucher Wallet and Eligibility Checker:** save, add your own, edit, delete, and see why each voucher applies or not.
- **Benefit-first vouchers:** every voucher is titled by what you get ("QAR 10 OFF", "20% OFF", "Free Delivery"); the cap sits underneath ("Up to QAR 15"), and the code is small below it with a **Copy code** button. Demo codes say they will not work in the real app. Automatic offers and sales never show a code.
- **Smart Sorting:** **Best price** and **Fastest**. ("Biggest discount" was removed from the UI; discount amounts still show on every card.)
- **Choose your cards and Settings > My cards:** pick real Qatar card plans from a list (for example Dukhan Bank Visa Signature, QNB Life Rewards Visa Infinite, Doha Bank LuLu Platinum Mastercard). No card numbers are ever asked for. Perq tries every saved card and keeps the best result; card-only offers say whether your card matches in the demo data.
- **Shopping guide (Guided Checkout):** after comparing, "Shop at {app}" opens a checklist of items to add, vouchers to use (with codes to copy), what applies automatically, the estimated total and a verified link to the app. Perq does **not** place orders or take payment: no public customer-order API exists on any of the nine platforms.
- **Voucher Expiry Tracker and in-app alerts** (7 days, 3 days, 24 hours, expired), shown while Perq is open.
- **Dashboard** (Home, categories, featured savings, live comparison) and a responsive, mobile-first UI.
- Perq brand, Doha hero photo, merchant and platform logos, product and dish photos with credits.

## Still to do
- Real-phone test on Android and iPhone via the QR code (Sadiya, Arefa), logged in `docs/testing.md`.
- Fill `docs/01-challenge-brief.md` and `docs/02-research.md` (still templates).
- Rehearse the pitch under 3 minutes.

## Status
- [x] Vercel project connected; pushing to `main` redeploys (ask Fadhil before every push).
- [ ] Challenge text pasted into `docs/01-challenge-brief.md` and research written in `docs/02-research.md` (both still templates).
- [x] Product spec agreed (`docs/03-product-spec.md`), tech plan approved (`docs/04-tech-plan.md`).
- [x] MVP, v3 redesign, images and rebrand, and v5 (sorting, vouchers, cards, Shopping guide) live.
- [x] Automated tests: 375 unit and 50 end-to-end tests pass; axe 0 violations on all main routes at 320, 390 and 1280px (`docs/testing.md`).
- [ ] Tested on a real Android phone and iPhone via the QR code (Sadiya, Arefa)
- [x] Pitch deck: `pitch/Perq-MES-2026-pitch.pptx` (editable); [ ] rehearsed under 3 minutes
- [ ] Backups saved (slides and project) and submitted per organisers' instructions
- [x] Promo and fallback videos made (`brag-output-2026-11-06-192040/brag.mp4` shows the v5 features). They are gitignored, so keep copies elsewhere.

## Team
| Person | Responsibility |
|---|---|
| Fadhil | Primary developer, using Claude Code |
| Sadiya and Arefa | Research, design, evaluation, testing, presentation |
| All three | Brainstorming and important decisions |

Principles: problem first · MVP first · incremental · reliable testing · good UI/UX · minimal complexity.

## How we work
1. **Understand:** write the challenge in `docs/01-challenge-brief.md`, then research in `docs/02-research.md`.
2. **Define:** agree the product in `docs/03-product-spec.md`. Keep must-haves short and write down what we cut.
3. **Plan:** Fadhil and Claude fill `docs/04-tech-plan.md`. Simplest stack that works.
4. **Build and test:** small milestones. Sadiya and Arefa log every test and feedback in `docs/testing.md`.
5. **Pitch:** deck outline and script in `pitch/`.
6. Record every team decision in `docs/decisions.md`.

## Folder map
| Path | What it is |
|---|---|
| `README.md` | This overview, for the whole team |
| `CLAUDE.md` | Standing instructions for Claude Code |
| `docs/` | Brief, research, spec, tech plan, decisions, testing, food photo shortlist |
| `pitch/` | Pitch deck (`Perq-MES-2026-pitch.pptx`), outline, script and the QR code (`qr.png`) |
| `src/`, `e2e/` | The Perq app (React) and its tests; `index.html` is the Vite entry |

## Pitch rules
- Pitch deck required (template provided at the event; follow organisers' submission instructions).
- 3 minutes total per team, demo included. Explain each member's contribution. Judges may ask questions.
- Any prototype or MVP is allowed. Say what works and what still needs development.

## Event facts
- MES Indian School, Doha. Free. Team of 3, same school, Grades 9-12. A teacher or school representative must stay with the team.
- Bring: laptop, chargers, everything the team needs. Keep a backup of slides and project.
- Uniform required Thu and Fri; optional Sat.
- **Thu 5 Nov, Discover:** check-in 5:30 PM. Challenge reveal about 6:55 PM, Q&A about 7:05 PM, rules and submission briefing about 7:35 PM, work session to 8:00 PM.
- **Fri 6 Nov, Build:** 3:00-8:00 PM. Work sessions, workshop on digital payments (5:15 PM), mentoring.
- **Sat 7 Nov, Present:** check-in 8:30 AM. Final development 2:35-3:00 PM, submission 3:00-3:15 PM, pitches 3:15-5:00 PM, awards about 6:50 PM.
- The challenge is only revealed on Day 1; no prepared solution is needed.

Source: `MYH2026-Information-for-Participating-Schools-1.pdf` (organisers' school brief).
