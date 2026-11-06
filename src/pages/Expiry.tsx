import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { catalog } from '../data/catalog';
import { resolveExpiry } from '../engine/time';
import type { Promotion } from '../engine/types';
import { EXPIRY_FILTERS, filterAndSort, type Dated, type ExpiryFilter } from '../lib/expiry';
import { describeBenefit } from '../lib/promoText';
import ExpiryBadge from '../components/vouchers/ExpiryBadge';
import WalletTabs from '../components/vouchers/WalletTabs';
import { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import PlatformChip from '../components/ui/PlatformChip';
import { useNow } from '../hooks/useNow';
import { useAppStore } from '../store/useAppStore';

export default function Expiry() {
  const savedIds = useAppStore((s) => s.wallet.savedIds);
  const custom = useAppStore((s) => s.wallet.custom);
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();
  const [filter, setFilter] = useState<ExpiryFilter>('all');

  const saved = useMemo<Dated<Promotion>[]>(
    () =>
      [...custom, ...catalog.promotions.filter((p) => (p.kind === 'code' || p.kind === 'bank') && savedIds.includes(p.id))].map((p) => ({
        item: p,
        expiryMs: resolveExpiry(p.conditions.expiry, anchorMs),
      })),
    [custom, savedIds, anchorMs],
  );
  const rows = filterAndSort(saved, filter, nowMs);
  const countFor = (f: ExpiryFilter) => filterAndSort(saved, f, nowMs).length;

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-[24px] font-extrabold tracking-tight">Expiry tracker</h1>
        <p className="mt-1 text-[15px] text-muted">Your saved vouchers, soonest to expire first. Times are Qatar time.</p>
      </div>
      <WalletTabs />

      <div role="group" aria-label="Filter by expiry" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {EXPIRY_FILTERS.map((f) => {
          const on = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 min-h-11 rounded-full border px-4 text-[14px] font-semibold ${on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-muted'}`}
            >
              {f.label} ({countFor(f.value)})
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={saved.length === 0 ? 'No saved vouchers' : 'No vouchers match'}
          text={saved.length === 0 ? 'Save a voucher in the wallet to track when it expires.' : 'Try another filter.'}
        >
          {saved.length === 0 && <ButtonLink to="/vouchers">Open vouchers</ButtonLink>}
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ item: p, expiryMs }) => (
            <li key={p.id} data-testid="expiry-row" data-promo={p.id} className={`min-w-0 rounded-card border bg-surface p-4 ${expiryMs <= nowMs ? 'border-fail/40' : 'border-line'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <PlatformChip platformId={p.platformId} />
                {p.code && <code className="rounded bg-brand-soft px-1.5 py-0.5 text-[12px] font-bold text-brand">{p.code}</code>}
              </div>
              <p className="mt-2 text-[17px] leading-tight font-extrabold">
                <Link to={`/vouchers/${p.id}`} className="underline-offset-4 hover:underline">{describeBenefit(p)}</Link>
              </p>
              <p className="text-[14px] text-muted">{p.name}</p>
              <div className="mt-3"><ExpiryBadge expiryMs={expiryMs} nowMs={nowMs} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
