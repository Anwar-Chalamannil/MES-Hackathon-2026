import * as jollibee from './jollibee';
import * as mcdonalds from './mcdonalds';
import * as karak from './karak-mqanes';
import * as pizzaHut from './pizza-hut';
import * as flatWhite from './flat-white';
import * as shakeShack from './shake-shack';

// To add a restaurant: create a file like jollibee.ts exporting merchant, listings and products, then add it here.
const restaurants = [jollibee, mcdonalds, karak, pizzaHut, flatWhite, shakeShack];

export const foodMerchants = restaurants.map((r) => r.merchant);
export const foodListings = restaurants.flatMap((r) => r.listings);
export const foodProducts = restaurants.flatMap((r) => r.products);
