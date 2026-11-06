import { Info, X } from 'lucide-react';
import { findPromo } from '../../data/lookup';
import type { PricedOffer } from '../../engine/types';
import { promoHeadline } from '../../lib/promoDisplay';
import { useAppStore } from '../../store/useAppStore';

/**
 * Why your saved vouchers did or did not apply on this app. Applied vouchers are already in the
 * receipt, and expired ones live in the wallet, so this lists only the ones that were not used.
 */
export default function VoucherCheck({ offer }: { offer: PricedOffer }) {
  const custom = useAppStore((s) => s.wallet.custom);
  const items = offer.evaluations
    .filter((e) => !offer.applied.some((a) => a.promoId === e.promoId))
    .map((e) => ({ e, promo: findPromo(e.promoId, custom) }))
    .filter(({ e, promo }) => promo && (promo.kind === 'code' || promo.kind === 'bank') && !e.reason.startsWith('Expired'))
    .slice(0, 2);
  if (items.length === 0) return null;

  return (
    <ul className="space-y-1.5" aria-label="Vouchers not applied">
      {items.map(({ e, promo }) => (
        <li key={e.promoId} className={`flex gap-2 text-[13px] leading-snug ${e.eligible ? 'text-muted' : 'text-fail'}`}>
          {e.eligible ? <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> : <X size={15} className="mt-0.5 shrink-0" aria-hidden="true" />}
          <span>
            <strong>{promo ? promoHeadline(promo) : e.promoId}</strong>
            {promo?.code ? <> ({promo.code})</> : null}: {e.reason}
          </span>
        </li>
      ))}
    </ul>
  );
}
