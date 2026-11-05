import type { Catalog } from '../engine/types';
import { foodListings, foodMerchants, foodProducts } from './food';
import { groceryListings, groceryMerchants, groceryProducts } from './grocery';
import { pharmacyListings, pharmacyMerchants, pharmacyProducts } from './pharmacy';
import { platforms } from './platforms';
import { promotions } from './promotions';

/** Everything the engine and the app read. All data in it is simulated (see src/data/sources.ts for what was researched). */
export const catalog: Catalog = {
  platforms,
  merchants: [...foodMerchants, ...groceryMerchants, ...pharmacyMerchants],
  listings: [...foodListings, ...groceryListings, ...pharmacyListings],
  products: [...foodProducts, ...groceryProducts, ...pharmacyProducts],
  promotions,
};
