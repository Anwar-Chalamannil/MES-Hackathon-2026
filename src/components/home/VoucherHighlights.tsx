import { useMemo } from 'react';
import { Link } from 'react-router';
import { resolveExpiry } from '../../engine/time';
import { savedPromotions } from '../../lib/notifications';
import { useNow } from '../../hooks/useNow';
import { useAppStore } from '../../store/useAppStore';
import ExpiryBadge from '../vouchers/ExpiryBadge';
import VoucherBenefit from '../vouchers/VoucherBenefit';
import { ButtonLink } from '../ui/Button';
import PlatformChip from '../ui/PlatformChip';

/** The three saved vouchers that expire soonest (expired ones are left out). */
export default function VoucherHighlights() {
  const wallet = useAppStore((s) => s.wallet);
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();

  const soonest = useMemo(
    () =>
      savedPromotions(wallet)
        .map((p) => ({ p, expiryMs: resolveExpiry(p.conditions.expiry, anchorMs) }))
        .filter((x) => x.expiryMs > nowMs)
        .sort((a, b) => a.expiryMs - b.expiryMs)
        .slice(0, 3),
    [wallet, anchorMs, nowMs],
  );

  return (
    <section aria-labelledby="highlights-title">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="highlights-title" className="text-[20px] font-extrabold">Vouchers ending soon</h2>
        <Link to="/vouchers/expiry" className="inline-flex min-h-11 items-center text-[14px] font-bold text-brand">Expiry tracker</Link>
      </div>
      {soonest.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface p-5 text-center">
          <p className="font-bold">No saved vouchers yet</p>
          <p className="mt-1 text-[14px] text-muted">Save a voucher and we will track when it ends.</p>
          <div className="mt-3 flex justify-center"><ButtonLink to="/vouchers">Discover vouchers</ButtonLink></div>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-3">
          {soonest.map(({ p, expiryMs }) => (
            <li key={p.id} data-testid="highlight" className="min-w-0">
              <Link to={`/vouchers/${p.id}`} className="block h-full rounded-card border border-line bg-surface p-4 shadow-card active:bg-blue-50">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformChip platformId={p.platformId} />
                </div>
                <div className="mt-2">
                  {/* The whole card is a link, so no Copy button here (it is on the voucher page). */}
                  <VoucherBenefit promo={p} size="sm" showCopy={false} showRequirement={false} subtitle={p.origin === 'user' ? p.name : undefined} />
                </div>
                <div className="mt-2"><ExpiryBadge expiryMs={expiryMs} nowMs={nowMs} /></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
