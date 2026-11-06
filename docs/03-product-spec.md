# Product spec

Full detail: the approved plan (BasketWise v2) at `C:\Users\fadhi\.claude\plans\pasted-content-id-710b-role-principal-ticklish-acorn.md`.

## Problem and user (one sentence each)
Shoppers in Qatar compare menu or shelf prices, but what they actually pay depends on delivery, service and small-order fees plus vouchers, and these differ per app.
The user is anyone in Qatar who orders food, groceries or personal care through more than one app or store.

## Solution idea (one sentence)
BasketWise compares the same basket across the apps that can deliver it and shows the final payable amount after fees and the best eligible vouchers, using clearly labelled simulated data.

## Core user journey (the demo path, under 3 minutes)
1. Open the site (QR code), pick Jollibee, add 2x 2pc Chickenjoy, 1x Jolly Spaghetti, 1x Regular Coke.
2. Compare: Keeta wins at QAR 58.00, even though its menu prices are the highest.
3. Add voucher DEMO-TB20: Talabat wins at QAR 52.60. Remove the spaghetti: the voucher stops applying and Keeta wins. Choose a Dukhan Bank card: Rafeeq wins. Switch to Fastest.

## Must-haves (MVP)
- Smart Basket Comparison: restaurants, groceries, pharmacy and personal care (one shared engine).
- Voucher Wallet and Eligibility Checker (save, edit, delete, explain why).
- Smart Sorting: Best Price and Fastest Delivery (Biggest Discount was removed on 6 Nov 2026; discount amounts still show on every card).
- Voucher Expiry Tracker (24h, 3 days, 7 days, Qatar time).
- Dashboard and mobile-first UX, local persistence.

## Nice-to-haves (only if time)
- None planned. Quality over extra features.

## Cut list (decided not to build)
- Accounts, backend, live prices or scraping, payments.
- Arabic UI, dark mode, an overall "best" score, prescription medicines.
- Separate Shops tab and non-food product-delivery shops (deferred; the data model allows adding them later).
- Real logos and images.
- Restaurants beyond the six (Jollibee, McDonald's, Karak Mqanes, Pizza Hut, Flat White, Shake Shack).

## How we will know it works
- All unit tests pass and the Jollibee hero numbers match the plan exactly.
- A stranger completes the demo path on a real Android phone and iPhone via the QR code, with no horizontal scroll and no console errors.
- Every screen says the data is simulated.
