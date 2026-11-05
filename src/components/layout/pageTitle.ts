import { APP_NAME } from '../../config';
import { merchantById } from '../../data/lookup';

const SCENARIO_TITLE: Record<string, string> = { food: 'Food', grocery: 'Groceries', pharmacy: 'Pharmacy & care' };

/** Human page name for a path. Used for the browser tab title and the screen-reader announcement. */
export function pageName(pathname: string): string {
  const [first, second] = pathname.split('/').filter(Boolean);
  switch (first) {
    case undefined: return 'Home';
    case 'food': return second ? (merchantById.get(second)?.name ?? 'Restaurant') : 'Food delivery';
    case 'grocery': return 'Groceries';
    case 'pharmacy': return 'Pharmacy & care';
    case 'compare': return `Compare ${SCENARIO_TITLE[second ?? ''] ?? ''}`.trim();
    case 'wallet': return second === 'new' ? 'Add a voucher' : second ? 'Edit voucher' : 'Voucher wallet';
    case 'expiry': return 'Expiry tracker';
    case 'about': return 'About';
    default: return 'Page not found';
  }
}

export function pageTitle(pathname: string): string {
  return pathname === '/' ? `${APP_NAME}: compare what you actually pay` : `${pageName(pathname)} · ${APP_NAME}`;
}
