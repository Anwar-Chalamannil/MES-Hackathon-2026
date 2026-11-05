import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// Single-platform edge case: only on Talabat in our simulated data, so there is nothing to compare.
export const merchant: Merchant = {
  id: 'shake-shack', name: 'Shake Shack', scenario: 'food', kind: 'restaurant', cuisine: 'Burgers',
  tagline: 'Burgers, fries and shakes', provenance: 'name_researched_price_estimated',
};

export const listings: Listing[] = [
  { id: 'ss-talabat', platformId: 'talabat', merchantId: 'shake-shack', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 1000, service: { kind: 'fixed', dh: 200 } }, eta: [30, 45] },
];

const ids = listings.map((l) => l.id);

export const products = makeFoodProducts('shake-shack', ids, [
  ['ss-shackburger', 'ShackBurger (single)', 'burgers', 'Cheeseburger with lettuce, tomato and sauce.', 2800, [2800]],
  ['ss-smokeshack', 'SmokeShack', 'burgers', 'Cheeseburger with bacon.', 3200, [3200]],
  ['ss-chickn-shack', "Chick'n Shack", 'burgers', 'Crispy chicken sandwich.', 2900, [2900]],
  ['ss-crinkle-fries', 'Crinkle Cut Fries', 'sides', 'Crinkle-cut fries.', 1400, [1400]],
  ['ss-vanilla-shake', 'Vanilla Shake', 'drinks', 'Hand-spun vanilla shake.', 2200, [2200]],
  ['ss-lemonade', 'Lemonade', 'drinks', 'Fresh lemonade.', 1200, [1200]],
], 'name_researched_price_estimated');
