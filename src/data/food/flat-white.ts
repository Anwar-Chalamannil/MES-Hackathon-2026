import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// Coffee category. Prices, fees and availability SIMULATED.
export const merchant: Merchant = {
  id: 'flat-white', name: 'Flat White', scenario: 'food', kind: 'restaurant', cuisine: 'Specialty coffee',
  tagline: 'Specialty coffee and bakery', provenance: 'name_researched_price_estimated',
};

export const listings: Listing[] = [
  { id: 'fw-talabat', platformId: 'talabat', merchantId: 'flat-white', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 700, service: { kind: 'fixed', dh: 100 }, smallOrder: { belowDh: 2000, feeDh: 400 } }, eta: [20, 30] },
  { id: 'fw-snoonu', platformId: 'snoonu', merchantId: 'flat-white', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 600, service: { kind: 'none' } }, eta: [25, 35] },
];

const ids = listings.map((l) => l.id); // talabat, snoonu

export const products = makeFoodProducts('flat-white', ids, [
  ['fw-flat-white', 'Flat White', 'coffee', 'Espresso with steamed milk.', 1800, [1800, 1900]],
  ['fw-spanish-latte', 'Spanish Latte', 'coffee', 'Latte sweetened with condensed milk.', 2000, [2000, 2100]],
  ['fw-cappuccino', 'Cappuccino', 'coffee', 'Espresso with foamed milk.', 1800, [1800, 1900]],
  ['fw-iced-americano', 'Iced Americano', 'coffee', 'Espresso over ice and water.', 1700, [1700, 1800]],
  ['fw-butter-croissant', 'Butter Croissant', 'bakery', 'Flaky butter croissant.', 1500, [1500, 1600]],
  ['fw-banana-bread', 'Banana Bread', 'bakery', 'Slice of banana bread.', 1400, [1400, 1500]],
], 'name_researched_price_estimated');
