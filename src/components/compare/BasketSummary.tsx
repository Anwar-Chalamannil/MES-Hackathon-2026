import { merchantById, productById } from '../../data/lookup';
import type { Basket } from '../../engine/types';
import Button from '../ui/Button';

/** Read-only list of what is being compared, for the desktop side panel. */
export default function BasketSummary({ basket, onEdit }: { basket: Basket; onEdit: () => void }) {
  const merchant = basket.merchantId ? merchantById.get(basket.merchantId) : undefined;
  return (
    <section aria-labelledby="basket-summary" className="rounded-card border border-line bg-surface p-4 shadow-card">
      <h2 id="basket-summary" className="text-[16px] font-extrabold">Your basket</h2>
      {merchant && <p className="text-[13px] text-muted">From {merchant.name}</p>}
      <ul className="mt-3 space-y-1.5 text-[14px]">
        {basket.lines.map((l) => (
          <li key={l.productId} className="flex gap-2">
            <span className="money w-7 shrink-0 text-muted">{l.qty}×</span>
            <span className="min-w-0">{productById.get(l.productId)?.name ?? l.productId}</span>
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="mt-4 w-full" onClick={onEdit}>Edit basket</Button>
    </section>
  );
}
