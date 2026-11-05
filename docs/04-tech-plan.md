# Tech plan

Approved plan: BasketWise v2 at `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`. Simplest option that meets the spec.

## Stack and why
| Tool | Why |
|---|---|
| Vite + React + TypeScript (strict) | Static build Vercel supports natively; types catch data mistakes. |
| Tailwind CSS v4 | Design tokens in one CSS file, fast responsive layout, no UI kit. |
| react-router | Real URLs so the phone back button works. |
| zustand (persist) | Small store with built-in localStorage and versioning. |
| vitest | Unit tests for the calculation engine and data. |
| Playwright (one spec) | One end-to-end judge journey. |
| @fontsource-variable/bricolage-grotesque, @fontsource-variable/public-sans, lucide-react | Self-hosted fonts (no Google request) and tree-shaken icons. Bricolage Grotesque for headlines and big prices, Public Sans for body text and forms (plain zeros and tabular figures, which matter for prices). |

No backend, database, auth, date library or component library.

## Data and external services
None. All data is simulated, lives in `src/data/`, and is labelled with provenance. Money is integer dirhams. Pure calculation engine in `src/engine/` (no React).

## Milestones (each working and deployed)
Dependency-based phases, no dates:
- [ ] P0 Docs
- [ ] P1 Scaffold and deploy pipeline (Vercel preset to Vite, QR code)
- [ ] P2 Frozen types and contracts
- [ ] P3 Engine and unit tests
- [ ] P4 Datasets (food and promotions, grocery, pharmacy)
- [ ] P5 Store and compare UI (restaurants end to end)
- [ ] P6 Wallet and expiry tracker
- [ ] P7 Grocery and pharmacy UI
- [ ] P8 Quality pass and real-device testing
- [ ] P9 Release and QR check

## Risks and fallbacks
- Misleading comparisons: incomplete baskets are never ranked; biggest discount shows the price gap.
- Voucher edge cases: covered by unit tests, including rejections.
- Unverified prices: everything is labelled simulated; research upgrades provenance only when a page is read directly.
- Deploy mistakes: wrong Vercel preset or SPA 404s; fixed in P1 with `vercel.json`.
- Fallback: screen recording and screenshots of the demo path in `pitch/`.
