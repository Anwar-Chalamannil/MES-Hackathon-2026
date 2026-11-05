import { merchantById, productById } from '../../data/lookup';
import type { PricedOffer } from '../../engine/types';
import PlatformChip from '../ui/PlatformChip';

/** Apps that cannot deliver the whole basket. They are never ranked and never mixed with another merchant. */
export default function IncompleteList({ offers }: { offers: PricedOffer[] }) {
  if (offers.length === 0) return null;
  return (
    <section aria-labelledby="incomplete-title" className="space-y-2">
      <h2 id="incomplete-title" className="text-[15px] font-extrabold">Can't deliver your full basket</h2>
      <ul className="space-y-2">
        {offers.map((o) => (
          <li key={o.listingId} data-testid="incomplete" className="rounded-card border border-line bg-surface/60 p-3">
            <div className="flex items-center gap-2">
              <PlatformChip platformId={o.platformId} />
              {merchantById.get(o.merchantId)?.scenario !== 'food' && (
                <span className="truncate text-[13px] text-muted">{merchantById.get(o.merchantId)?.name}</span>
              )}
            </div>
            <p className="mt-2 text-[14px] text-muted">
              Missing: <strong className="text-ink">{o.missing.map((id) => productById.get(id)?.name ?? id).join(', ')}</strong>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
