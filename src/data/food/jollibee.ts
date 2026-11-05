import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// HERO A. Reference prices were read on jollibee.qa/menu (5 Nov 2026). Platform prices, fees,
// delivery times and availability are SIMULATED. Do not change these numbers without updating
// src/data/demoScenarios.ts.
export const merchant: Merchant = {
  id: 'jollibee', name: 'Jollibee', scenario: 'food', kind: 'restaurant', cuisine: 'Fried chicken',
  tagline: 'Chickenjoy, spaghetti and burgers', provenance: 'researched', sourceId: 'jollibee-menu',
};

export const listings: Listing[] = [
  { id: 'jb-talabat', platformId: 'talabat', merchantId: 'jollibee', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 900, service: { kind: 'fixed', dh: 200 } }, eta: [25, 35] },
  { id: 'jb-snoonu', platformId: 'snoonu', merchantId: 'jollibee', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 500, service: { kind: 'none' } }, eta: [30, 40] },
  { id: 'jb-rafeeq', platformId: 'rafeeq', merchantId: 'jollibee', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 600, service: { kind: 'fixed', dh: 150 } }, eta: [35, 45] },
  { id: 'jb-keeta', platformId: 'keeta', merchantId: 'jollibee', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 800, service: { kind: 'fixed', dh: 100 } }, eta: [40, 50] },
];

const ids = listings.map((l) => l.id); // talabat, snoonu, rafeeq, keeta

export const products = makeFoodProducts('jollibee', ids, [
  ['jb-cj-1pc', '1pc Chickenjoy', 'chicken', 'Fried chicken, one piece.', 1000, [1000, 1050, 1050, 1100]],
  ['jb-cj-2pc', '2pc Chickenjoy', 'chicken', 'Fried chicken, two pieces.', 1700, [1700, 1800, 1750, 1850]],
  ['jb-bucket-6pc', '6pc Bucket Feast', 'chicken', 'Six pieces of fried chicken to share.', 7100, [7100, 7400, 7300, 7600]],
  ['jb-yumburger', 'Yumburger', 'burgers', 'Single burger.', 700, [700, 750, 750, 800]],
  ['jb-spaghetti', 'Jolly Spaghetti', 'pasta', 'Spaghetti with sauce.', 1300, [1300, 1350, 1350, 1400]],
  ['jb-fries-reg', 'Regular Fries', 'sides', 'Regular serving of fries.', 700, [700, 750, 700, 750]],
  ['jb-coke-reg', 'Regular Coke', 'drinks', 'Regular cola.', 500, [500, 550, 550, 600]],
  ['jb-sundae-choc', 'Chocolate Sundae', 'desserts', 'Soft serve with chocolate sauce. Not on Keeta in our sample.', 600, [600, 650, 650, null]],
], 'researched', 'jollibee-menu');
