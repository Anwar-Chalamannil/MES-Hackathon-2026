import type { Listing, Merchant } from '../engine/types';
import { makeRetailProducts, type RetailRow } from './helpers';

// Skincare, personal care and baby care only. NO medicines of any kind. All prices, fees,
// delivery times and availability are SIMULATED. The three HERO products are fixed by
// src/data/demoScenarios.ts (Hero C).
export const pharmacyMerchants: Merchant[] = [
  { id: 'wellcare', name: 'Wellcare Pharmacy', scenario: 'pharmacy', kind: 'pharmacy', tagline: 'Skincare and personal care', provenance: 'name_researched_price_estimated' },
  { id: 'kulud', name: 'Kulud Pharmacy', scenario: 'pharmacy', kind: 'pharmacy', tagline: 'Skincare and personal care', provenance: 'name_researched_price_estimated' },
];

const branch = 'Simulated store';
export const pharmacyListings: Listing[] = [
  { id: 'wellcare', platformId: 'wellcare', merchantId: 'wellcare', scenario: 'pharmacy', branchLabel: branch,
    fees: { deliveryDh: 1000, service: { kind: 'none' } }, eta: [60, 120] },
  { id: 'kulud', platformId: 'kulud', merchantId: 'kulud', scenario: 'pharmacy', branchLabel: branch,
    fees: { deliveryDh: 1200, service: { kind: 'none' } }, eta: [60, 120] },
  { id: 'talabat-wellcare', platformId: 'talabat', merchantId: 'wellcare', scenario: 'pharmacy', branchLabel: branch,
    fees: { deliveryDh: 800, service: { kind: 'fixed', dh: 200 } }, eta: [30, 45] },
  { id: 'snoonu-kulud', platformId: 'snoonu', merchantId: 'kulud', scenario: 'pharmacy', branchLabel: branch,
    fees: { deliveryDh: 700, service: { kind: 'none' } }, eta: [30, 45] },
];

// Price order: wellcare, kulud, talabat-wellcare, snoonu-kulud. null = unavailable.
const rows: RetailRow[] = [
  // ----- HERO products (fixed) -----
  { id: 'ph-cerave-cream-340g', brand: 'CeraVe', name: 'Moisturising Cream', size: '340 g', variant: 'For dry to very dry skin',
    category: 'skincare', description: 'Daily moisturising cream with ceramides, 340 g tub.', refPriceDh: 7200,
    prices: [7200, 7500, 7500, 7600], sale: { kulud: { saleDh: 6000, promoId: 'KU1' } } },
  { id: 'ph-cerave-cleanser-236ml', brand: 'CeraVe', name: 'Hydrating Cleanser', size: '236 ml', variant: 'Normal to dry skin',
    category: 'skincare', description: 'Gentle hydrating face and body cleanser, 236 ml.', refPriceDh: 5800,
    prices: [5800, 6000, 6000, 6100], sale: { kulud: { saleDh: 4800, promoId: 'KU1' } } },
  { id: 'ph-lrp-anthelios-50ml', brand: 'La Roche-Posay', name: 'Anthelios UVMune 400 Sunscreen', size: '50 ml', variant: 'SPF50+',
    category: 'skincare', description: 'Daily face sunscreen, SPF50+, 50 ml.', refPriceDh: 9800,
    prices: [9800, 9500, 9800, 9700], sale: { wellcare: { saleDh: 7350, promoId: 'W2' } } },

  // ----- Other products (estimates within the data rules) -----
  { id: 'ph-cetaphil-cleanser-236ml', brand: 'Cetaphil', name: 'Gentle Skin Cleanser', size: '236 ml', variant: 'All skin types',
    category: 'skincare', description: 'Gentle non-foaming cleanser, 236 ml.', refPriceDh: 5500, prices: [5500, 5400, 5800, 5750] },
  { id: 'ph-ordinary-niacinamide-30ml', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%', size: '30 ml', variant: 'Serum',
    category: 'skincare', description: 'Blemish-focused face serum, 30 ml.', refPriceDh: 4500, prices: [4500, 4600, 4800, 4700] },
  { id: 'ph-bioderma-sensibio-250ml', brand: 'Bioderma', name: 'Sensibio H2O', size: '250 ml', variant: 'Micellar water',
    category: 'skincare', description: 'Micellar cleansing water for sensitive skin, 250 ml.', refPriceDh: 6500, prices: [6500, 6400, 6800, 6700] },
  { id: 'ph-vaseline-aloe-400ml', brand: 'Vaseline', name: 'Intensive Care Aloe Soothing Lotion', size: '400 ml', variant: 'Aloe',
    category: 'skincare', description: 'Body lotion with aloe, 400 ml.', refPriceDh: 2500, prices: [2500, 2450, 2650, 2600] },
  { id: 'ph-nivea-lip-4-8g', brand: 'Nivea', name: 'Lip Care Original', size: '4.8 g', variant: 'Original',
    category: 'personal-care', description: 'Moisturising lip balm stick, 4.8 g.', refPriceDh: 1200, prices: [1200, 1150, 1275, 1250] },
  { id: 'ph-sensodyne-repair-75ml', brand: 'Sensodyne', name: 'Repair & Protect Toothpaste', size: '75 ml', variant: 'Repair & Protect',
    category: 'personal-care', description: 'Toothpaste for sensitive teeth, 75 ml.', refPriceDh: 2800, prices: [2800, 2750, 2950, 2900] },
  { id: 'ph-johnsons-baby-shampoo-500ml', brand: "Johnson's", name: 'Baby Shampoo', size: '500 ml', variant: 'No more tears',
    category: 'baby-care', description: 'Gentle baby shampoo, 500 ml.', refPriceDh: 2200, prices: [2200, 2150, 2325, 2300] },
];

export const pharmacyProducts = makeRetailProducts('pharmacy', pharmacyListings.map((l) => l.id), rows);
