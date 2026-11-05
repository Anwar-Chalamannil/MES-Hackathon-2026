import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// Pizza category. Not on Rafeeq in our sample (simulated availability). Prices and fees SIMULATED.
export const merchant: Merchant = {
  id: 'pizza-hut', name: 'Pizza Hut', scenario: 'food', kind: 'restaurant', cuisine: 'Pizza',
  tagline: 'Pizza, wings and sides', provenance: 'name_researched_price_estimated',
};

export const listings: Listing[] = [
  { id: 'ph-talabat', platformId: 'talabat', merchantId: 'pizza-hut', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 800, service: { kind: 'percent', pct: 2, minDh: 100, maxDh: 400 } }, eta: [30, 40] },
  { id: 'ph-snoonu', platformId: 'snoonu', merchantId: 'pizza-hut', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 600, service: { kind: 'none' } }, eta: [35, 45] },
  { id: 'ph-keeta', platformId: 'keeta', merchantId: 'pizza-hut', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 700, service: { kind: 'fixed', dh: 100 } }, eta: [35, 50] },
];

const ids = listings.map((l) => l.id); // talabat, snoonu, keeta

export const products = makeFoodProducts('pizza-hut', ids, [
  ['pzh-margherita-m', 'Margherita (medium)', 'pizza', 'Tomato sauce and cheese.', 4500, [4500, 4700, 4900]],
  ['pzh-pepperoni-m', 'Pepperoni (medium)', 'pizza', 'Pepperoni and cheese.', 5200, [5200, 5400, 5600]],
  ['pzh-super-supreme-m', 'Super Supreme (medium)', 'pizza', 'Loaded pizza with mixed toppings.', 5800, [5800, 6000, 6200]],
  ['pzh-chicken-supreme-m', 'Chicken Supreme (medium)', 'pizza', 'Chicken and vegetable pizza.', 5600, [5600, 5800, 6000]],
  ['pzh-garlic-bread', 'Garlic Bread', 'sides', 'Toasted garlic bread.', 1800, [1800, 1900, 2000]],
  ['pzh-wings-6', 'Chicken Wings (6pc)', 'sides', 'Six chicken wings.', 2800, [2800, 2900, 3000]],
  ['pzh-pepsi-1-5l', 'Pepsi 1.5L', 'drinks', 'Cola, 1.5 litre bottle.', 900, [900, 950, 1000]],
], 'name_researched_price_estimated');
