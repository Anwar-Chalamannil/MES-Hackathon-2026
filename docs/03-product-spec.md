# Product spec

Full detail: the approved plan (Perq v5 on top, v3 design below it, BasketWise v2 engine and data as the appendix) at `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`.

## Problem and user (one sentence each)
Shoppers in Qatar compare menu or shelf prices, but what they actually pay depends on delivery, service and small-order fees plus vouchers, and these differ per app.
The user is anyone in Qatar who orders food, groceries or personal care through more than one app or store.

## Solution idea (one sentence)
Perq (called BasketWise on 5 Nov) compares the same basket across the apps that can deliver it and shows the final payable amount after fees and the best eligible vouchers, using clearly labelled simulated data.

## Core user journey (the demo path, under 3 minutes)
1. Open the site (QR code), pick Jollibee, add 2x 2pc Chickenjoy, 1x Jolly Spaghetti, 1x Regular Coke.
2. Compare: Keeta wins at QAR 58.00, even though its menu prices are the highest.
3. Add voucher DEMO-TB20: Talabat wins at QAR 52.60. Remove the spaghetti: the voucher stops applying and Keeta wins. Pick the Dukhan Bank Visa Signature in your cards (pay by card): Rafeeq wins at QAR 45.30. Switch to Fastest.

## Must-haves (MVP)
- Smart Basket Comparison: restaurants, groceries, pharmacy and personal care (one shared engine).
- Voucher Wallet and Eligibility Checker (save, edit, delete, explain why).
- Smart Sorting: Best price and Fastest. ("Biggest discount" was in the first spec and was removed from the UI on 6 Nov; the engine still supports it, unused.)
- Voucher Expiry Tracker (24h, 3 days, 7 days, Qatar time).
- Dashboard and mobile-first UX, local persistence.

## Added on 6 Nov (plan v5, live)
- Benefit-first voucher titles with a Copy code button.
- Choose your cards (one-time, on Home) and Settings > My cards: preset card plans, no card numbers. Card-only offers are matched on bank, network and tier in the demo data.
- Shopping guide (Guided Checkout): what to add, which codes to copy, what applies automatically, the estimated total and a verified link to the app. No order placement.
- Demo path extension: after step 3, tap "Shop at Rafeeq" to show the guide and copy DEMO-DKB30.

## Cut list (decided not to build)
- Accounts, backend, live prices or scraping, payments.
- Arabic UI, dark mode, an overall "best" score, prescription medicines.
- Separate Shops tab and non-food product-delivery shops (deferred; the app has four tabs: Home, Compare, Vouchers, Alerts).
- ~~Real logos and images~~ (reversed 6 Nov: team-supplied logos and photos are now used, with a "Not affiliated with the brands shown" notice).
- Placing real orders or payments (no public order API; Guided Checkout only guides).
- Restaurants beyond the six (Jollibee, McDonald's, Karak Mqanes, Pizza Hut, Flat White, Shake Shack).

## How we will know it works
- All unit tests pass and the Jollibee hero numbers match the plan exactly.
- A stranger completes the demo path on a real Android phone and iPhone via the QR code, with no horizontal scroll and no console errors.
- Every screen says the data is simulated.
