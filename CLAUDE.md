# Perq (MES Youth Hackathon 2026)

Read `README.md` first (deadline, links). Detailed specs live in the approved plan; this file is the short handoff.

## What this is
**Perq** (formerly BasketWise) is a mobile-first web app for Qatar. It compares the same basket across delivery apps and stores and shows the **final payable amount** after item prices, delivery, service and small-order fees, sale prices and eligible vouchers. All data is **simulated and labelled as such**. Judges open it by QR code on their phones.

- **Five features:** (1) Smart Basket Comparison; (2) Voucher Wallet and Eligibility Checker; (3) Smart Sorting (Best price, Fastest, Biggest discount); (4) Voucher Expiry Tracker; (5) Dashboard and responsive UI.
- **Three scenarios:** Restaurants (Talabat, Snoonu, Rafeeq, Keeta), Groceries (Carrefour, Lulu, Ninja, Talabat Mart, Lulu on Snoonu, Rafeeq Market), Pharmacy and personal care (Wellcare, Kulud, Wellcare on Talabat, Kulud on Snoonu). No medicines.
- **Stack:** Vite, React, TypeScript (strict), Tailwind v4, react-router, zustand (persisted), Vitest, Playwright. No backend.

## The plan
- **Active plan (v3, approved 6 Nov 2026):** `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`. Use the top section ("Perq … v3"): design system §3, screens §4, images §5, notifications §6, functionality matrix §7, rebrand and domain §8, change map §9, tests §10, roadmap §11, handoff rules §12.
- **v2 (Appendix of the same file):** the reference for engine contracts, data, the demo spec and types. Not to be changed.

## Architecture (where things are)
| Path | What |
|---|---|
| `src/engine/` | Pure TypeScript calculation engine (money, time, offers, eligibility, optimize, compare, sort, explain). **Never edit.** |
| `src/data/` | Catalogue (`food/`, `grocery.ts`, `pharmacy.ts`), `promotions.ts`, `sources.ts`, `demoScenarios.ts` (authoritative demo numbers), `defaults.ts`, `lookup.ts` |
| `src/store/useAppStore.ts` | Persisted state (key `basketwise`, keep it). Baskets per scenario, wallet, profile, sort mode, demo anchor |
| `src/lib/` | UI-side logic (promo status, voucher form, expiry filter; v3 adds search, notifications, featured, demoBasket) |
| `src/components/`, `src/pages/` | UI. `ProductBrowse`, `OfferCard`, `Receipt`, `VoucherCard`, `Sheet`, `LiveComparison` are reused |
| `e2e/judge-flow.spec.ts` | End-to-end journeys |
| `assets-src/` → `public/img/` | Image originals and generated WebP (v3) |

## Branding (final, do not alter)
- **Logo:** final PeRQ logo (basket mark above "PeRQ"), source `assets-src/brand/perq-logo.png`. Use it **exactly as designed**: only remove the background and crop the basket for the favicon and app icons. Never recolour, redraw or replace the wordmark with text; if it's too small, make it larger. Product name in text: "Perq".
- **Colours:** blue `#2878FF`, pink `#FFB6D5`, off-white `#F7F7F2`. Buttons and links use `#1A5FD6` (white text 5.75:1). Text is navy `#0F1E4A`. **Pink is a fill only**: never white text on pink, never pink text or borders. Text on pink is navy or `#9E1F55`.
- **Font:** Plus Jakarta Sans. Icons: lucide-react.
- Real brand logos are user-supplied and shown with a "Not affiliated with the brands shown" notice.

## Design requirements
- Follow the supplied mobile and desktop references closely, adapted to our real features only. No account, wishlist, deals marketplace, location, scan or unsupported categories.
- **Mobile is the priority:** 320, 360, 390 and 430px with no horizontal scroll. Touch targets ≥44px, safe areas, bottom tabs **Home, Compare, Vouchers, Alerts**, a header with ☰ menu, logo and bell.
- **Desktop:** left sidebar, header search plus bell, right rail on Home and Compare. One shared component system.
- **Every visible control must work** (plan §7). Decorative elements must not look clickable.

## Images
- Folders: `assets-src/logos/merchants/{merchantId}`, `assets-src/logos/platforms/{platformId}`, `assets-src/products/{productId}`, `assets-src/dishes/{dishKey}`, `assets-src/brand/`. Run `npm run images` to build WebP at 160 and 480px.
- Mapping and alt text live in `src/data/images.ts`.
- Missing images show fallback tiles and **never block a phase**. Integrate files as the user uploads them.
- Never hotlink, and never download from Talabat, Snoonu or retailer sites. Dish photos come only from the user-approved Unsplash or Pexels shortlist, with credits on the About page.

## Notifications
In-app only (no push, no browser permission prompts). Generate them from **saved** vouchers' expiry (demo anchor plus `expiryBucket`) at four stages: 7d, 3d, 24h, and expired (shown only if expired within the last 7 days). Id `${promoId}@${stage}`, so there are no duplicates. Read state is persisted as `readNotificationIds` (store version 2 with a real v1 migration). Show the unread count on the bell and the Alerts tab; tapping an alert marks it read and opens `/vouchers/:id`; provide Mark all as read. Never claim alerts arrive while the app is closed.

## Critical rules
- **Preserve:** the engine, datasets, promotions, `demoScenarios.ts` and their tests, all working journeys, persistence, the simulated-data disclosures, routes (add redirects for renamed ones) and the Vercel config.
- Never change an expected number to make a test pass. Never hard-code results in the UI.
- Add only the dependencies named in the plan (Plus Jakarta Sans fonts, `sharp` as a devDependency).
- Never commit secrets. Ask Fadhil before **every git push and any production or Vercel change**.
- Do not edit `docs/` content the team wrote; add to it. Log decisions in `docs/decisions.md` and tests in `docs/testing.md`.
- Put Qatar first; keep the demo path under 3 minutes, with a fallback recording.

## Testing and acceptance (after every phase)
- `npm test` (unit, data and demo tests must all pass), `npm run build`, `npm run test:e2e`.
- Check 320, 390 and 1280px in the browser pane. No overflow, and no console errors.
- Before release: axe shows 0 violations on every route; Lighthouse mobile ≥90 for Performance and Accessibility; the team tests on a real Android phone and iPhone via the QR code and logs it in `docs/testing.md`.

## Phase order (plan §11)
R1 Brand foundation → R2 Logic (store v2, notifications, search, featured) → R3 Shell and routes → R4 Image system → R5 Home → R6 Screens → R7 Asset integration (repeat as files arrive) → R8 QA → R9 Domain (`perq-qatar.vercel.app` first; keep the old URL; update the QR).

## Status (6 Nov 2026)
- **Done and live** at https://mes-hackathon-2026.vercel.app/: the full MVP (all five features, three scenarios), the quality pass and the interim redesign (commit `cda41ed`). 230 unit tests and 3 e2e tests pass.
- **v3 approved. R1 (brand foundation) is DONE, committed (`beb361e`), pushed and live** at the old URL, which now shows Perq. It added: the Perq name and metadata, the exact brand tokens in `src/styles/index.css`, Plus Jakarta Sans, the `Logo` component (`mark`, `wordmark`, `inline`, `lockup`), the transparent logo cut-out and icons built by `npm run images` into `public/brand/`, `manifest.webmanifest`, and the brand and contrast tests. 272 unit tests, 3 e2e tests, axe (0 violations) and the build pass. The shell, Home and screens still use the old layout (R3 to R6 change them).
- **R2 (logic) is DONE:** store version 2 with a real v1 migration (`readNotificationIds`, `markNotificationRead`, `markAllNotificationsRead`, `pruneReadNotifications`), `src/lib/{notifications,search,featured,demoBasket}.ts` and `src/hooks/useNotifications.ts`, all tested (322 unit tests, 3 e2e).
- **R3 (shell and routes) is DONE:** `AppHeader`, `MenuSheet`, `Sidebar`, 4-tab `BottomNav` with badges, `NotificationBell`, pages `Search`, `CompareHub`, `VoucherDetail`, `Notifications`; routes `/vouchers`, `/vouchers/new`, `/vouchers/expiry`, `/vouchers/:id`, `/vouchers/:id/edit` with redirects from `/wallet*` and `/expiry`; `Sheet` now renders in a portal. 13 e2e tests (`e2e/judge-flow.spec.ts`, `e2e/shell.spec.ts`).
- **Next: R4 (image system).** Notes for later phases: the header wordmark can be made larger if the pale pink lettering is hard to read; `index.html` still points `og:image` at the old domain until R9; the user is gathering logos and product photos for `assets-src/` (never block on them).

## Team and working style
| Person | Responsibility |
|---|---|
| Fadhil | Primary developer, works with Claude Code |
| Sadiya and Arefa | Research, design review, device testing, pitch |

Fadhil is a beginner: explain simply, work in small phases, report what changed, the test results and what to check by hand.

## Deploying
Vercel (Vite preset) auto-deploys every push to `main`. Never push a broken build.

## When the event ends
Ask whether the build should graduate to `../../../portfolio/projects/`. If yes, move it there and leave a note here saying where it went.
