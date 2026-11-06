export const APP_NAME = 'Perq';
export const APP_TAGLINE = 'Compare smarter. Save more.';
export const APP_DESCRIPTION =
  "Perq compares the final total of your basket across Qatar's delivery apps and stores, after delivery fees and eligible vouchers. Simulated demo data.";

/**
 * The final Perq logo, built from assets-src/brand/perq-logo.png by `npm run images`.
 * Sizes are the real pixel sizes of the files (checked in src/lib/__tests__/brand.test.ts).
 * To change the logo: replace the source file, run `npm run images`, and update the sizes here if a test says so.
 */
export const BRAND_ASSETS = {
  mark: { src: '/brand/mark-160.webp', width: 160, height: 136 }, // the basket only
  wordmark: { src: '/brand/wordmark-160.webp', width: 160, height: 79 }, // the PeRQ lettering only
  lockup: { src: '/brand/logo-lockup-360.webp', width: 360, height: 396 }, // basket above lettering
} as const;
