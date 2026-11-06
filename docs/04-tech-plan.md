# Tech plan

Active plan: Perq v5 (benefit-first vouchers, My Cards, Guided Checkout; top of the file), built on v3 (design) and the BasketWise v2 engine and data plan (appendix) at `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`. Simplest option that meets the spec.

## Stack and why
| Tool | Why |
|---|---|
| Vite + React + TypeScript (strict) | Static build Vercel supports natively; types catch data mistakes. |
| Tailwind CSS v4 | Design tokens in one CSS file, fast responsive layout, no UI kit. |
| react-router | Real URLs so the phone back button works. |
| zustand (persist) | Small store with built-in localStorage and versioning (store version 3: adds saved cards; older saved data is migrated, never wiped). |
| vitest | Unit tests for the calculation engine and data. |
| Playwright (eight specs, 50 tests) | End-to-end journeys: judge flow, shell, home, screens, images, benefit-first vouchers, cards, Shopping guide. |
| @fontsource-variable/plus-jakarta-sans, lucide-react | Self-hosted font (no Google request) and tree-shaken icons. Plus Jakarta Sans matches the Perq references. |
| sharp (dev only) | Build-time image tool (`npm run images`): removes the logo background, crops the basket icon, and makes WebP and icon sizes. Never shipped to users. |
| @types/node (dev only) | Types for the tests that read files (brand assets, design-token contrast). |

No backend, database, auth, date library or component library.

## Data and external services
None. All data is simulated, lives in `src/data/`, and is labelled with provenance. Money is integer dirhams. Pure calculation engine in `src/engine/` (no React).

## Milestones (each working and deployed)
Dependency-based phases, no dates:
- [x] P0 to P9: MVP (docs, scaffold, types, engine, datasets, store and compare UI, wallet and expiry, grocery and pharmacy, quality pass, release)
- [x] R1 to R9: v3 redesign (brand, logic, shell, images, Home, screens, asset integration, QA, domain)
- [x] S1 two sort modes, V1 benefit-first vouchers, C1 card logic, C2 Choose cards plus Settings > My cards, G1 Shopping guide (live, commit `125f4d8`)
- [x] Q automated QA: 375 unit and 50 e2e tests, axe 0 violations
- [ ] Real-device test (Android and iPhone)

## Risks and fallbacks
- Misleading comparisons: incomplete baskets are never ranked; every winner card shows its price gap to the cheapest.
- Voucher edge cases: covered by unit tests, including rejections.
- Unverified prices: everything is labelled simulated; research upgrades provenance only when a page is read directly.
- Deploy mistakes: wrong Vercel preset or SPA 404s; fixed in P1 with `vercel.json`.
- Fallback: screen recording and screenshots of the demo path in `pitch/`.
