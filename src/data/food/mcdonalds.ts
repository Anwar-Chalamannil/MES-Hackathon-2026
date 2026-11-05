import type { Listing, Merchant } from '../../engine/types';
import { makeFoodProducts } from '../helpers';

// Small-order-fee demo (scenario M). Item names are public menu items. Prices, fees and availability
// are SIMULATED estimates (no official price list was found).
export const merchant: Merchant = {
  id: 'mcdonalds', name: "McDonald's", scenario: 'food', kind: 'restaurant', cuisine: 'Burgers',
  tagline: 'Burgers, nuggets and McFlurry', provenance: 'name_researched_price_estimated',
};

export const listings: Listing[] = [
  { id: 'mcd-talabat', platformId: 'talabat', merchantId: 'mcdonalds', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 600, service: { kind: 'fixed', dh: 100 }, smallOrder: { belowDh: 2500, feeDh: 500 } }, eta: [20, 30] },
  { id: 'mcd-snoonu', platformId: 'snoonu', merchantId: 'mcdonalds', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 700, service: { kind: 'none' } }, eta: [25, 35] },
  { id: 'mcd-rafeeq', platformId: 'rafeeq', merchantId: 'mcdonalds', scenario: 'food', branchLabel: 'Simulated branch',
    fees: { deliveryDh: 800, service: { kind: 'fixed', dh: 150 } }, eta: [30, 40] },
];

const ids = listings.map((l) => l.id); // talabat, snoonu, rafeeq

export const products = makeFoodProducts('mcdonalds', ids, [
  ['mcd-mcflurry-oreo', 'McFlurry Oreo', 'desserts', 'Soft serve with cookie pieces.', 900, [900, 950, 950]],
  ['mcd-bigmac-meal-m', 'Big Mac Meal (medium)', 'meals', 'Burger, medium fries and medium drink.', 2500, [2500, 2650, 2600]],
  ['mcd-bigmac', 'Big Mac', 'burgers', 'Double-layer beef burger.', 1700, [1700, 1800, 1750]],
  ['mcd-mcchicken', 'McChicken', 'burgers', 'Crispy chicken burger.', 1500, [1500, 1600, 1550]],
  ['mcd-nuggets-6', '6pc Chicken McNuggets', 'chicken', 'Six chicken nuggets.', 1600, [1600, 1700, 1650]],
  ['mcd-fries-m', 'Medium Fries', 'sides', 'Medium serving of fries.', 800, [800, 850, 850]],
  ['mcd-apple-pie', 'Apple Pie', 'desserts', 'Hot fried apple pie.', 500, [500, 550, 550]],
  ['mcd-coke-m', 'Medium Coca-Cola', 'drinks', 'Medium cola.', 600, [600, 650, 650]],
], 'name_researched_price_estimated');
