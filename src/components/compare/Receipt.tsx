import type { ReactNode } from 'react';
import { findPromo, productById } from '../../data/lookup';
import { fmt } from '../../engine/money';
import type { PricedOffer } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';

function Row({ label, amount, tone = 'normal', strong = false }: { label: ReactNode; amount: string; tone?: 'normal' | 'save'; strong?: boolean }) {
  return (
    <li className={`flex items-baseline gap-2 ${strong ? 'text-[16px] font-extrabold' : 'text-[14px]'} ${tone === 'save' ? 'text-save' : ''}`}>
      <span className="min-w-0 shrink">{label}</span>
      <span aria-hidden="true" className="mb-1 flex-1 border-b border-dotted border-line" />
      <span className="money shrink-0">{amount}</span>
    </li>
  );
}

/** Receipt-style breakdown: items, fees, every discount, final total. */
export default function Receipt({ offer }: { offer: PricedOffer }) {
  const custom = useAppStore((s) => s.wallet.custom);
  return (
    <ul className="space-y-1.5" aria-label="Price breakdown">
      {offer.lines.map((l) => (
        <Row
          key={l.productId}
          label={
            <>
              {l.qty} × {productById.get(l.productId)?.name ?? l.productId}
              {l.unitDh < l.regularDh && <span className="ml-1 text-[12px] font-semibold text-save">sale</span>}
            </>
          }
          amount={fmt(l.lineDh)}
        />
      ))}
      {offer.deliveryDh > 0 && <Row label="Delivery" amount={fmt(offer.deliveryDh)} />}
      {offer.serviceDh > 0 && <Row label="Service fee" amount={fmt(offer.serviceDh)} />}
      {offer.smallOrderDh > 0 && <Row label="Small-order fee" amount={fmt(offer.smallOrderDh)} />}
      {offer.applied.map((a) => (
        <Row key={a.promoId} tone="save" label={findPromo(a.promoId, custom)?.name ?? a.promoId} amount={`-${fmt(a.savingDh)}`} />
      ))}
      <li className="pt-1">
        <ul><Row strong label="Total" amount={fmt(offer.totalDh)} /></ul>
      </li>
    </ul>
  );
}
