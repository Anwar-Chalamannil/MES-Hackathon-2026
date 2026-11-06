import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { platformName } from '../../data/lookup';
import { fmt } from '../../engine/money';
import { loadBasket, wouldReplaceFood } from '../../lib/demoBasket';
import { featuredSavings, type FeaturedSaving } from '../../lib/featured';
import { merchantById } from '../../data/lookup';
import { useAppStore } from '../../store/useAppStore';
import ReplaceBasketDialog from '../basket/ReplaceBasketDialog';
import Button from '../ui/Button';

/** Three baskets worked out by the real comparison engine. Nothing here is typed in by hand. */
export default function FeaturedSavings() {
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const foodMerchant = useAppStore((s) => s.baskets.food.merchantId);
  const items = useMemo(() => featuredSavings(anchorMs), [anchorMs]);
  const navigate = useNavigate();
  const [pending, setPending] = useState<FeaturedSaving | null>(null);

  const open = (f: FeaturedSaving) => navigate(`/compare/${loadBasket(f.basket)}`);
  const start = (f: FeaturedSaving) => (wouldReplaceFood(f.basket) ? setPending(f) : open(f));

  return (
    <section aria-labelledby="featured-title">
      <h2 id="featured-title" className="mb-3 text-[20px] font-extrabold">Featured savings</h2>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {items.map((f) => (
          <li key={f.stepId} data-testid="featured-card" data-scenario={f.scenario} className="w-[78%] max-w-[320px] shrink-0 snap-start sm:w-[46%] lg:w-auto lg:max-w-none">
            <article className="flex h-full flex-col justify-between rounded-[18px] border border-line bg-surface p-4 shadow-card">
              <span className="self-start rounded-full bg-pink px-3 py-1 text-[13px] font-extrabold text-pink-ink">
                Save {fmt(f.saveDh)}
              </span>
              <h3 className="mt-3 text-[17px] leading-tight font-extrabold">{f.title}</h3>
              <p className="mt-0.5 text-[13px] text-muted">
                {f.itemCount} {f.itemCount === 1 ? 'item' : 'items'}
                {f.basket.merchantId ? ` from ${merchantById.get(f.basket.merchantId)?.name}` : ''}
              </p>
              <dl className="mt-3 space-y-2 text-[14px]">
                <div>
                  <dt className="text-[12px] text-muted">Lowest total</dt>
                  <dd className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{platformName(f.winner.platformId)}</span>
                    <span className="money whitespace-nowrap text-brand">{fmt(f.winner.totalDh)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-muted">Highest total</dt>
                  <dd className="flex items-baseline justify-between gap-2">
                    <span>{platformName(f.highest.platformId)}</span>
                    <span className="money whitespace-nowrap">{fmt(f.highest.totalDh)}</span>
                  </dd>
                </div>
              </dl>
              <Button
                variant="secondary"
                className="mt-4 w-full rounded-full px-2 text-[14px] whitespace-nowrap"
                onClick={() => start(f)}
                aria-label={`Compare this basket: ${f.title}`}
              >
                Compare this basket
              </Button>
            </article>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[12px] text-muted">Demo baskets with the demo wallet and a Visa card. Simulated prices.</p>

      <ReplaceBasketDialog
        open={pending !== null}
        fromName={foodMerchant ? (merchantById.get(foodMerchant)?.name ?? 'current') : 'current'}
        toName={pending?.basket.merchantId ? (merchantById.get(pending.basket.merchantId)?.name ?? '') : ''}
        onConfirm={() => { if (pending) open(pending); setPending(null); }}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
