import type { Listing, Merchant } from '../engine/types';
import { makeRetailProducts, type RetailRow } from './helpers';

// All prices, fees, delivery times and availability here are SIMULATED. The six HERO products
// (milk, India Gate, Lipton, Fairy, Tide, Lay's) are fixed by src/data/demoScenarios.ts (Hero B).
export const groceryMerchants: Merchant[] = [
  { id: 'carrefour', name: 'Carrefour', scenario: 'grocery', kind: 'store', tagline: 'Hypermarket groceries', provenance: 'name_researched_price_estimated' },
  { id: 'lulu', name: 'Lulu Hypermarket', scenario: 'grocery', kind: 'store', tagline: 'Hypermarket groceries', provenance: 'name_researched_price_estimated' },
  { id: 'ninja', name: 'Ninja', scenario: 'grocery', kind: 'store', tagline: 'Quick grocery delivery', provenance: 'name_researched_price_estimated' },
  { id: 'talabat-mart', name: 'Talabat Mart', scenario: 'grocery', kind: 'store', tagline: 'Groceries on Talabat', provenance: 'name_researched_price_estimated' },
  { id: 'rafeeq-market', name: 'Rafeeq Market', scenario: 'grocery', kind: 'store', tagline: 'Groceries on Rafeeq (simulated)', provenance: 'sample' },
];

const branch = 'Simulated store';
export const groceryListings: Listing[] = [
  { id: 'carrefour', platformId: 'carrefour', merchantId: 'carrefour', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 1000, service: { kind: 'none' } }, eta: [60, 120] },
  { id: 'lulu', platformId: 'lulu', merchantId: 'lulu', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 1000, service: { kind: 'none' } }, eta: [60, 120] },
  { id: 'ninja', platformId: 'ninja', merchantId: 'ninja', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 500, service: { kind: 'none' } }, eta: [15, 30] },
  { id: 'talabat-mart', platformId: 'talabat', merchantId: 'talabat-mart', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 700, service: { kind: 'none' }, smallOrder: { belowDh: 3000, feeDh: 500 } }, eta: [20, 35] },
  { id: 'snoonu-lulu', platformId: 'snoonu', merchantId: 'lulu', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 800, service: { kind: 'none' } }, eta: [45, 75] },
  { id: 'rafeeq-market', platformId: 'rafeeq', merchantId: 'rafeeq-market', scenario: 'grocery', branchLabel: branch,
    fees: { deliveryDh: 900, service: { kind: 'fixed', dh: 100 } }, eta: [40, 70] },
];

// Price order: carrefour, lulu, ninja, talabat-mart, snoonu-lulu, rafeeq-market. null = unavailable.
const rows: RetailRow[] = [
  // ----- HERO products (fixed) -----
  { id: 'gr-almarai-milk-2l', brand: 'Almarai', name: 'Full Fat Fresh Milk', size: '2 L', category: 'dairy',
    description: 'Fresh full fat milk, 2 litre carton.', refPriceDh: 1250,
    prices: [1300, 1225, 1325, 1300, 1275, 1300], sale: { carrefour: { saleDh: 1250, promoId: 'C3' } } },
  { id: 'gr-indiagate-basmati-5kg', brand: 'India Gate', name: 'Classic Basmati Rice', size: '5 kg', category: 'rice-grains',
    description: 'Classic basmati rice, 5 kg bag.', refPriceDh: 5200,
    prices: [5200, 5250, 5500, 5400, 5150, 5350], sale: { lulu: { saleDh: 4950, promoId: 'L3' } } },
  { id: 'gr-lipton-yl-100', brand: 'Lipton', name: 'Yellow Label Black Tea', size: '100 tea bags', category: 'beverages',
    description: 'Black tea bags, 100 count.', refPriceDh: 1775,
    prices: [1775, 1725, 1850, 1825, 1775, 1800] },
  { id: 'gr-fairy-lemon-1l', brand: 'Fairy', name: 'Dishwashing Liquid', size: '1 L', variant: 'Lemon', category: 'cleaning',
    description: 'Dishwashing liquid, lemon, 1 litre.', refPriceDh: 950,
    prices: [950, 925, 1000, 975, 975, 1000] },
  { id: 'gr-tide-3kg', brand: 'Tide', name: 'Original Washing Powder', size: '3 kg', category: 'cleaning',
    description: 'Original scent laundry powder, 3 kg. Not available on Ninja in our sample.', refPriceDh: 3700,
    prices: [3750, 3475, null, 3750, 3625, 3700], sale: { carrefour: { saleDh: 3600, promoId: 'C3' } } },
  { id: 'gr-lays-salted-170g', brand: "Lay's", name: 'Classic Salted Potato Chips', size: '170 g', category: 'snacks',
    description: 'Salted potato chips, 170 g.', refPriceDh: 800,
    prices: [800, 775, 850, 825, 825, 850] },

  // ----- Other products (estimates within the data rules) -----
  { id: 'gr-almarai-laban-1l', brand: 'Almarai', name: 'Laban', size: '1 L', category: 'dairy',
    description: 'Cultured milk drink, 1 litre.', refPriceDh: 550, prices: [550, 525, 600, 575, 550, 575] },
  { id: 'gr-puck-cream-cheese-500g', brand: 'Puck', name: 'Cream Cheese Spread', size: '500 g', category: 'dairy',
    description: 'Cream cheese spread, 500 g tub.', refPriceDh: 1600, prices: [1600, 1550, 1700, 1675, 1600, 1700] },
  { id: 'gr-kiri-12', brand: 'Kiri', name: 'Cream Cheese Portions', size: '12 portions', category: 'dairy',
    description: 'Cream cheese portions, 12 pack.', refPriceDh: 1150, prices: [1150, 1100, null, 1225, 1150, 1200] },
  { id: 'gr-nadec-yoghurt-1kg', brand: 'Nadec', name: 'Plain Yoghurt', size: '1 kg', variant: 'Full fat', category: 'dairy',
    description: 'Plain full fat yoghurt, 1 kg.', refPriceDh: 850, prices: [850, 825, 925, 900, 850, 900] },
  { id: 'gr-tilda-basmati-2kg', brand: 'Tilda', name: 'Pure Basmati Rice', size: '2 kg', category: 'rice-grains',
    description: 'Pure basmati rice, 2 kg.', refPriceDh: 2900, prices: [2900, 2850, 3100, 3050, 2900, 3000] },
  { id: 'gr-barilla-spaghetti-500g', brand: 'Barilla', name: 'Spaghetti No.5', size: '500 g', category: 'rice-grains',
    description: 'Durum wheat spaghetti, 500 g.', refPriceDh: 650, prices: [650, 625, 700, 700, 650, 700] },
  { id: 'gr-rani-float-mango-6', brand: 'Rani', name: 'Float Mango Juice', size: '240 ml x 6', category: 'beverages',
    description: 'Mango juice with fruit pieces, 6 cans.', refPriceDh: 1300, prices: [1300, 1275, 1400, 1375, 1300, 1375] },
  { id: 'gr-nescafe-classic-200g', brand: 'Nescafé', name: 'Classic Instant Coffee', size: '200 g', category: 'beverages',
    description: 'Instant coffee, 200 g jar.', refPriceDh: 3800, prices: [3800, 3700, 4000, 3950, 3800, 3950] },
  { id: 'gr-rawdatain-water-1-5l-6', brand: 'Al Rawdatain', name: 'Drinking Water', size: '1.5 L x 6', category: 'beverages',
    description: 'Bottled water, 6 x 1.5 litre.', refPriceDh: 900, prices: [900, 875, 975, 950, 900, 950] },
  { id: 'gr-galaxy-milk-90g', brand: 'Galaxy', name: 'Smooth Milk Chocolate', size: '90 g', category: 'snacks',
    description: 'Milk chocolate bar, 90 g.', refPriceDh: 550, prices: [550, 525, 600, 575, 575, 600] },
  { id: 'gr-oreo-original-12', brand: 'Oreo', name: 'Original Sandwich Biscuits', size: '12 pack', category: 'snacks',
    description: 'Chocolate sandwich biscuits, 12 pack.', refPriceDh: 950, prices: [950, 925, 1025, 1000, 950, 1000] },
  { id: 'gr-americana-mixed-veg-900g', brand: 'Americana', name: 'Frozen Mixed Vegetables', size: '900 g', category: 'packaged-food',
    description: 'Frozen mixed vegetables, 900 g.', refPriceDh: 800, prices: [800, 775, 875, 850, 825, 850] },
  { id: 'gr-heinz-ketchup-570g', brand: 'Heinz', name: 'Tomato Ketchup', size: '570 g', category: 'packaged-food',
    description: 'Tomato ketchup, 570 g bottle.', refPriceDh: 1250, prices: [1250, 1225, 1350, 1300, 1275, 1325] },
  { id: 'gr-fine-tissues-5x200', brand: 'Fine', name: 'Facial Tissues', size: '5 x 200', category: 'household',
    description: 'Facial tissues, 5 boxes of 200.', refPriceDh: 2400, prices: [2400, 2350, 2575, 2500, 2450, 2525] },
];

export const groceryProducts = makeRetailProducts('grocery', groceryListings.map((l) => l.id), rows);
