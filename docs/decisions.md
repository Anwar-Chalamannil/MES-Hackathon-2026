# Decision log

One line each: date, decision, why, who agreed.

| Date | Decision | Why | Agreed by |
|---|---|---|---|
| 2026-11-05 | Build BasketWise: a basket comparison app for restaurants, groceries and pharmacy, five features | Final payable amount differs from menu price | Fadhil, Sadiya, Arefa |
| 2026-11-05 | Six restaurants only; no Shops tab (non-food shops deferred) | Less data to verify, same engine | Fadhil |
| 2026-11-05 | Real brand names as text, no logos, everything labelled simulated | Credible but honest | Fadhil |
| 2026-11-05 | Stack: Vite, React, TypeScript, Tailwind, zustand, vitest | Simplest static build for Vercel | Fadhil |
| 2026-11-06 | New visual identity: cool pearl and gulf teal, fonts Bricolage Grotesque and Public Sans, home page hero is a live comparison. Maroon is reserved for the lowest total. | The first design (cream, maroon, rounded cards) looked like a template. The home page now shows the idea in 5 seconds. **Proposed by Claude, needs Sadiya and Arefa's review.** | Fadhil (pending team) |
| 2026-11-06 | **Superseded the row above:** product renamed **Perq**, with the final PeRQ logo, colours #2878FF blue, #FFB6D5 pink, #F7F7F2 off-white, and font Plus Jakarta Sans (plan v3) | Team brand and design references. Buttons and links use the deeper blue #1A5FD6 because white on #2878FF is only 4.0:1. Pink is never used for text. | Fadhil (v3 approved) |
| 2026-11-06 | **Replaces "no logos" (5 Nov):** real brand logos supplied by the team may be shown, with a visible "Not affiliated with the brands shown" notice | Makes restaurant and store cards recognisable. Team accepts the trademark risk for a school prototype. | Fadhil |
| 2026-11-06 | Notifications are in-app only (while Perq is open). No browser or background push | Push needs a server and permission prompts; not worth it for the prototype | Fadhil |
| 2026-11-06 | **Smart Sorting is two modes: Best price and Fastest.** "Biggest discount" is removed from the UI (the engine still supports it, unchanged). Saved "discount" preferences load as Best price without resetting baskets or vouchers | Fadhil's decision (plan v5). Discount amounts still show on every card | Fadhil |
| 2026-11-06 | **Vouchers are titled by their benefit** ("QAR 10 OFF", "20% OFF", "Free Delivery"); the code sits below in small text with a Copy button. Existing codes and promotion ids are unchanged | Customers care about the benefit, not the code. Suggested new codes (TAL20, CAR40, ...) would clash with existing benefits and the DEMO- rule, so they were not adopted | Fadhil |
| 2026-11-06 | **Choose your cards + Settings > My cards:** users pick real Qatar card plans from a preset list (bank, network, tier, credit or debit). Only a preset id is stored, never card details. Card offers are matched on bank, network and tier in demo data, never promised | Plan v5. Tier rules live in `cardOfferRules.ts` because the engine only checks bank, network and channel | Fadhil |
| 2026-11-06 | **Guided Checkout instead of order placement.** Perq gives a Shopping guide and links to the app; it does not place orders or copy the basket | No public customer-order or basket API was found for any of the 9 platforms (merchant APIs only: Talabat Partner API, Keeta Order API). Provider links are only those verified on 6 Nov; Keeta has none | Fadhil |
