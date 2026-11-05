import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// Local Qatar favourite: small baskets, so small-order fees matter. Prices, fees, availability SIMULATED.
export const merchant: Merchant = {
  id: 'karak-mqanes', name: 'Karak Mqanes', scenario: 'food', kind: 'restaurant', cuisine: 'Karak and chapati',
  tagline: 'Karak tea and chapati rolls', provenance: 'name_researched_price_estimated',
};

export const listings: Listing[] = [
  { id: 'km-talabat', platformId: 'talabat', merchantId: 'karak-mqanes', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 500, service: { kind: 'fixed', dh: 100 }, smallOrder: { belowDh: 1500, feeDh: 400 } }, eta: [15, 25] },
  { id: 'km-snoonu', platformId: 'snoonu', merchantId: 'karak-mqanes', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 400, service: { kind: 'none' }, smallOrder: { belowDh: 1500, feeDh: 300 } }, eta: [20, 30] },
  { id: 'km-rafeeq', platformId: 'rafeeq', merchantId: 'karak-mqanes', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 300, service: { kind: 'fixed', dh: 100 } }, eta: [25, 35] },
];

const ids = listings.map((l) => l.id); // talabat, snoonu, rafeeq

export const products = makeFoodProducts('karak-mqanes', ids, [
  ['km-karak-tea', 'Karak Tea', 'karak', 'Strong spiced milk tea.', 300, [300, 350, 350]],
  ['km-saffron-karak', 'Saffron Karak', 'karak', 'Karak tea with saffron.', 400, [400, 450, 450]],
  ['km-chapati-cheese', 'Chapati Cheese', 'chapati', 'Chapati roll with cheese.', 500, [500, 550, 550]],
  ['km-chapati-zaatar', 'Chapati Zaatar', 'chapati', 'Chapati roll with zaatar.', 400, [400, 450, 450]],
  ['km-chapati-nutella', 'Chapati Nutella', 'chapati', 'Chapati roll with chocolate spread.', 500, [500, 550, 550]],
  ['km-egg-paratha', 'Egg Paratha', 'chapati', 'Paratha with egg.', 600, [600, 650, 650]],
  ['km-mint-lemonade', 'Mint Lemonade', 'drinks', 'Fresh lemonade with mint.', 700, [700, 750, 750]],
], 'name_researched_price_estimated');
