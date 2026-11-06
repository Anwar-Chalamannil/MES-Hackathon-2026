# Perq (MES Youth Hackathon 2026)

Read `README.md` first (deadline, links). Detailed specs live in the approved plan; this file is the short handoff.

## What this is
**Perq** (formerly BasketWise) is a mobile-first web app for Qatar. It compares the same basket across delivery apps and stores and shows the **final payable amount** after item prices, delivery, service and small-order fees, sale prices and eligible vouchers. All data is **simulated and labelled as such**. Judges open it by QR code on their phones.

- **Five features:** (1) Smart Basket Comparison; (2) Voucher Wallet and Eligibility Checker; (3) Smart Sorting (Best price, Fastest; "Biggest discount" was removed from the UI, the engine still supports it); (4) Voucher Expiry Tracker; (5) Dashboard and responsive UI.
- **Three scenarios:** Restaurants (Talabat, Snoonu, Rafeeq, Keeta), Groceries (Carrefour, Lulu, Ninja, Talabat Mart, Lulu on Snoonu, Rafeeq Market), Pharmacy and personal care (Wellcare, Kulud, Wellcare on Talabat, Kulud on Snoonu). No medicines.
- **Stack:** Vite, React, TypeScript (strict), Tailwind v4, react-router, zustand (persisted), Vitest, Playwright. No backend.

## The plan
- **ACTIVE PLAN: v5 (approved 6 Nov 2026), top section "Perq v5" of the same file below.** Phases S1 two sort modes → V1 benefit-first vouchers and C1 card logic → C2 Choose cards and Settings › My cards → G1 Shopping Guide (no order placement) → Q QA. **All six are implemented in the working folder but NOT yet committed or pushed (6 Nov, 375 unit and 50 e2e tests, axe 0).** §0 "Corrections" in v5 override the rest. Ask Fadhil before every commit, push or deploy. The v4 "demo order" draft in that file was rejected: do not build it.
- **v3 (done, reference for design and structure):** `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`. Use the top section ("Perq … v3"): design system §3, screens §4, images §5, notifications §6, functionality matrix §7, rebrand and domain §8, change map §9, tests §10, roadmap §11, handoff rules §12.
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
- **Done and live** at https://perq-qatar.vercel.app/ (old address mes-hackathon-2026.vercel.app kept): the full MVP (all five features, three scenarios), the quality pass and the interim redesign (commit `cda41ed`). 230 unit tests and 3 e2e tests pass.
- **v3 approved. R1 (brand foundation) is DONE, committed (`beb361e`), pushed and live** at the old URL, which now shows Perq. It added: the Perq name and metadata, the exact brand tokens in `src/styles/index.css`, Plus Jakarta Sans, the `Logo` component (`mark`, `wordmark`, `inline`, `lockup`), the transparent logo cut-out and icons built by `npm run images` into `public/brand/`, `manifest.webmanifest`, and the brand and contrast tests. 272 unit tests, 3 e2e tests, axe (0 violations) and the build pass. The shell, Home and screens still use the old layout (R3 to R6 change them).
- **R2 (logic) is DONE:** store version 2 with a real v1 migration (`readNotificationIds`, `markNotificationRead`, `markAllNotificationsRead`, `pruneReadNotifications`), `src/lib/{notifications,search,featured,demoBasket}.ts` and `src/hooks/useNotifications.ts`, all tested (322 unit tests, 3 e2e).
- **R3 (shell and routes) is DONE:** `AppHeader`, `MenuSheet`, `Sidebar`, 4-tab `BottomNav` with badges, `NotificationBell`, pages `Search`, `CompareHub`, `VoucherDetail`, `Notifications`; routes `/vouchers`, `/vouchers/new`, `/vouchers/expiry`, `/vouchers/:id`, `/vouchers/:id/edit` with redirects from `/wallet*` and `/expiry`; `Sheet` now renders in a portal. 13 e2e tests (`e2e/judge-flow.spec.ts`, `e2e/shell.spec.ts`).
- **R4 (image system) is DONE:** `npm run images` also builds `public/img/{merchants,platforms,products,dishes}` (WebP 160/480, SVG copied) from `assets-src/` and writes `src/data/imageFiles.generated.ts`; `src/data/images.ts` (dish key map, alt text, `DISH_CREDITS`), `components/media/{Img,ProductThumb,MerchantLogo}` with fallback tiles, wired into `ProductRow`, `MerchantCard`, `PlatformChip`, Search. No assets are supplied yet, so every image is a fallback. Dish photos need an entry in `DISH_CREDITS` (a test enforces it).
- **R5 (Home) is DONE:** `components/home/{HeroBanner,SkylineArt,CategoryTiles,FeaturedSavings,VoucherHighlights}`, restyled `LiveComparison` (blue ring + pink "Pays least"), `lib/compareTarget.ts`; the live comparison is one component placed in a right rail by the grid on desktop. 25 e2e tests.
- **R6 (screens) is DONE:** compare winner = 2px blue ring + pink "Pays least" pill, desktop side panel (`BasketSummary`, profile, Try a voucher), `BestForBasket` names the basket with a category switch, Vouchers page title, About "Images and credits" (reads `DISH_CREDITS`). 29 e2e tests.
- **R7 (asset integration), round 1 DONE:** 12 merchant logos and 9 platform logos integrated (`lulu-hypermarket.png` renamed to `lulu.png`; McDonald's fake checkerboard cleaned in `build-images.mjs`). Round 2: 29 of 30 grocery/pharmacy product photos (missing: `bioderma` is still JPEG XL and unreadable; re-save as JPG). Round 3: 36 Pexels dish photos with credits (`DISH_CREDITS`, listed in `docs/food-photo-shortlist.md`; FALLBACK rows are weak matches to replace later). Run `npm run images` when more files arrive. R8 (QA) is DONE:** axe 0 violations on 19 routes at 320/390/1280 plus open sheets; Lighthouse a11y 100, best-practices 100, performance 93 (devtools throttling; 74-88 under default simulated throttling, caused by a headless software-GPU paint task). Real-phone testing is still outstanding (see `docs/testing.md`).
- **R9 (domain) is DONE:** `perq-qatar.vercel.app` verified (all routes 200), `og:url`/`og:image` and README updated, `pitch/qr.png` regenerated. Remaining: real-phone tests by Sadiya and Arefa, upload logos/photos (R7), fallback recording.

- **Later changes (6 Nov, after R9):** Home hero uses the Doha skyline photo (`assets-src/hero/doha-skyline.jpg`, built to `public/img/hero/` by `npm run images`; falls back to `SkylineArt`). Rafeeq's colour is now purple `#7A1FD6` and Ninja's is teal `#12B5C0` (`src/data/platforms.ts`). All grocery product photos are in; only `ph-bioderma-sensibio-250ml.jpg` is still missing because the file is JPEG XL (re-save as JPG). Dish photos: 36 Pexels photos with credits, keys and alt text in `src/data/images.ts`, the shortlist with weak FALLBACK matches (Jolly Spaghetti, McFlurry, Egg Paratha, Iced Americano) in `docs/food-photo-shortlist.md`.
- **v5 (implemented, uncommitted):** `lib/sortModes.ts` (Best price and Fastest only; saved `discount` loads as `price`), `lib/promoDisplay.ts` + `components/vouchers/VoucherBenefit.tsx` + `ui/CopyCodeButton.tsx` (benefit-first titles; demo codes say they won't work in the real app), `data/cardPresets.ts` + `cardOfferRules.ts` + `lib/cardMatch.ts` + `lib/cardComparison.ts` (store version 3: `cards`, `cardSetup`; `useComparison` tries every saved card, engine untouched), `components/cards/*`, `pages/Settings.tsx` (`/settings`), onboarding card on Home while `cardSetup === 'pending'`, `pages/ShoppingGuide.tsx` (`/guide/:scenario/:listingId`) + `data/providerLinks.ts` (only verified links; Keeta has none; Snoonu and Kulud use App Store pages). Real ordering is not possible (no public customer-order API): the guide is a checklist. Docs-and-deck work by a helper agent sits in `.claude/worktrees/agent-a3c09cd55036dc6f8/` (`presentation/Perq-MES-2026-pitch.pptx`, 14 slides) and is **not merged**: merge after committing, and merge CLAUDE.md and README.md by hand.
- **Promo video: DONE.** `brag-output/brag.mp4` (20s, 1920×1080, music), poster `brag.jpg`, caption `share-copy.txt`; all in `brag-output/` (gitignored, so keep a copy elsewhere). Six scenes: price-tag hook, logo reveal, winner changes (58.00 → 52.60 → 45.30), alerts, three categories, outro with the URL. Sources: `work/video.html` (each frame is `render(t)`), `work/frames.mjs` (600 frames), `work/music.cjs` (120 BPM WAV). Re-encode with ffmpeg 9 from winget (`Gyan.FFmpeg`): `ffmpeg -framerate 30 -i work/frames/f%04d.png -i work/music.wav -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest brag.mp4`.

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
