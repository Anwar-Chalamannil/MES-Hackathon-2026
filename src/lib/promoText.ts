import { fmt } from '../engine/money';
import type { PromoClass, Promotion } from '../engine/types';

/** Plain-English benefit, e.g. "20% off (max QAR 15.00)". */
export function describeBenefit(p: Promotion): string {
  const b = p.benefit;
  switch (b.type) {
    case 'percent': return `${b.pct}% off${b.capDh !== undefined ? ` (max ${fmt(b.capDh)})` : ''}`;
    case 'fixed': return `${fmt(b.dh)} off`;
    case 'free_delivery': return 'Free delivery';
    case 'delivery_off': return `${fmt(b.dh)} off delivery`;
    case 'service_waiver': return 'No service fee';
    case 'sale_price': return 'Sale price';
  }
}

/** How sure we are about a record. Shown on every voucher card. */
export const CLASS_LABEL: Record<PromoClass, string> = {
  invented_demo: 'Demo',
  documented_structure: 'Documented structure',
  researched_historical: 'Historical example',
};

export const CLASS_HELP: Record<PromoClass, string> = {
  invented_demo: 'Made up for this demo. Not a real offer.',
  documented_structure: 'This kind of offer is publicly documented. The numbers here are for the demo.',
  researched_historical: 'A real past offer, shown with its real dates.',
};
