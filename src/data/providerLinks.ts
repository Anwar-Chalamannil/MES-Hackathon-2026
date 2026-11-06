import type { PlatformId } from '../engine/types';

/**
 * Where "Open the app" goes. Only links that were opened and checked are marked verified; a provider without one
 * gets plain "open the app on your phone" text instead. Perq cannot send a basket to any of these: no platform offers a
 * public customer-order or basket API (see the v5 plan, research section), so these are ordinary public pages.
 *
 * Checked 6 Nov 2026 in a browser (or with a plain request for the app-store pages):
 * - Talabat, Wellcare, Carrefour Qatar: the pages load.
 * - Ninja: the Qatar page `ananinja.com/qa/en` loads (`/qa` alone returns 404).
 * - Rafeeq: `www.gorafeeq.com/en` loads (it redirects to its Market page).
 * - Lulu: `gcc.luluhypermarket.com/en-qa/` loads in a browser (it blocks plain requests).
 * - Snoonu: its App Store listing (developer Oryxnet) loads. `snoonu.com` showed a blank page in our check, so it is not used.
 * - Kulud: its App Store listing loads; no official website was found.
 * - Keeta: no official Qatar website or store page was found, so there is no link.
 */
export interface ProviderLink {
  platformId: PlatformId;
  /** Where the link goes, said in words for the button's helper text. */
  where: 'website' | 'app store page';
  /** Present only when it was checked. */
  url?: string;
  verified: boolean;
}

export const PROVIDER_LINKS: Record<PlatformId, ProviderLink> = {
  talabat: { platformId: 'talabat', where: 'website', url: 'https://www.talabat.com/qatar', verified: true },
  snoonu: { platformId: 'snoonu', where: 'app store page', url: 'https://apps.apple.com/qa/app/snoonu-food-delivery-shopping/id1457458384', verified: true },
  rafeeq: { platformId: 'rafeeq', where: 'website', url: 'https://www.gorafeeq.com/en', verified: true },
  keeta: { platformId: 'keeta', where: 'website', verified: false },
  ninja: { platformId: 'ninja', where: 'website', url: 'https://ananinja.com/qa/en', verified: true },
  carrefour: { platformId: 'carrefour', where: 'website', url: 'https://www.carrefourqatar.com/mafqat/en/', verified: true },
  lulu: { platformId: 'lulu', where: 'website', url: 'https://gcc.luluhypermarket.com/en-qa/', verified: true },
  kulud: { platformId: 'kulud', where: 'app store page', url: 'https://apps.apple.com/qa/app/kulud-pharmacy/id1312520266', verified: true },
  wellcare: { platformId: 'wellcare', where: 'website', url: 'https://www.wellcareonline.com/', verified: true },
};

/** The link to show, or undefined when none was verified (the page then says to open the app). */
export function verifiedProviderLink(platformId: string): (ProviderLink & { url: string }) | undefined {
  const l = (PROVIDER_LINKS as Record<string, ProviderLink | undefined>)[platformId];
  return l && l.verified && l.url ? (l as ProviderLink & { url: string }) : undefined;
}
