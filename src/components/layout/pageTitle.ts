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
    case 'search': return 'Search';
    case 'notifications': return 'Alerts';
    case 'vouchers': return second === 'new' ? 'Add a voucher' : second === 'expiry' ? 'Expiry tracker' : second ? 'Voucher' : 'Vouchers';
    case 'compare': return second ? `Compare ${SCENARIO_TITLE[second] ?? ''}`.trim() : 'Compare';
    case 'guide': return 'Shopping guide';
    case 'settings': return 'My cards';
    case 'about': return 'About';
    default: return 'Page not found';
  }
}

export function pageTitle(pathname: string): string {
  return pathname === '/' ? `${APP_NAME}: compare smarter, save more` : `${pageName(pathname)} · ${APP_NAME}`;
}
