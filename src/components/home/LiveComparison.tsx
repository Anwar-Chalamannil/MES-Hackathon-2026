import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { catalog } from '../../data/catalog';
import { DEFAULT_PROFILE, DEFAULT_SAVED_IDS } from '../../data/defaults';
import { platformById, promoById } from '../../data/lookup';
import { compareBasket } from '../../engine/compare';
import { fmt } from '../../engine/money';
import type { Basket } from '../../engine/types';
import { useNow } from '../../hooks/useNow';
import { promoHeadline } from '../../lib/promoDisplay';
import { useAppStore } from '../../store/useAppStore';

// Hero A from the demo spec: the same Jollibee meal on four apps.
const MEAL: Basket = {
  scenario: 'food',
  merchantId: 'jollibee',
  lines: [
    { productId: 'jb-cj-2pc', qty: 2 },
    { productId: 'jb-spaghetti', qty: 1 },
    { productId: 'jb-coke-reg', qty: 1 },
  ],
};

const TOGGLES = [
  { key: 'keeta', label: "I'm new to Keeta" },
  { key: 'voucher', label: 'I add voucher DEMO-TB20' },
  { key: 'card', label: 'I pay with a Dukhan Bank card' },
] as const;
type ToggleKey = (typeof TOGGLES)[number]['key'];

/**
 * The home page's live demo. It runs the real comparison engine on a fixed basket, so what you see here is exactly
 * what the Compare page would show. Flipping a toggle changes the profile or wallet and the tags re-order.
 */
export default function LiveComparison() {
  const anchorMs = useAppStore((s) => s.demoAnchor);
  const nowMs = useNow();
  const [on, setOn] = useState<Record<ToggleKey, boolean>>({ keeta: true, voucher: false, card: false });

  const comparison = useMemo(
    () =>
      compareBasket({
        catalog,
        basket: MEAL,
        wallet: { savedIds: on.voucher ? [...DEFAULT_SAVED_IDS, 'T2'] : [...DEFAULT_SAVED_IDS], custom: [] },
        profile: { ...DEFAULT_PROFILE, issuer: on.card ? 'dukhan' : 'other', firstOrderOn: on.keeta ? ['keeta'] : [] },
        nowMs,
        anchorMs,
        mode: 'price',
      }),
    [on, nowMs, anchorMs],
  );

  // Slide tags to their new position when the order changes (FLIP). Skipped when the person prefers reduced motion.
  const list = useRef<HTMLOListElement>(null);
  const previousTops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const tops = new Map<string, number>();
    for (const child of Array.from(ol.children) as HTMLElement[]) {
      const id = child.dataset.id ?? '';
      tops.set(id, child.offsetTop);
      const before = previousTops.current.get(id);
      if (before !== undefined && Math.abs(before - child.offsetTop) > 1) {
        child.style.transition = 'none';
        child.style.transform = `translateY(${before - child.offsetTop}px)`;
        requestAnimationFrame(() => {
          child.style.transition = 'transform 320ms cubic-bezier(0.2, 0.8, 0.2, 1)';
          child.style.transform = '';
        });
      }
    }
    previousTops.current = tops;
  });

  const lowest = comparison.ranked[0]?.totalDh ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-snug">
        <span className="text-muted">The same Jollibee order: </span>
        <span className="font-semibold">2 × 2pc Chickenjoy, Jolly Spaghetti, Regular Coke</span>
      </p>

      <ol ref={list} aria-label="Total on each app, lowest first" className="space-y-2">
        {comparison.ranked.map((o, i) => {
          const winner = i === 0;
          const platform = platformById.get(o.platformId);
          // Short, human labels: the benefit headline ("30% OFF", "Free Delivery"), with the actual saving.
          const note = o.applied
            .map((a) => {
              const p = promoById.get(a.promoId);
              return `${p ? promoHeadline(p) : a.promoId} −${fmt(a.savingDh)}`;
            })
            .join(', ');
          return (
            <li
              key={o.listingId}
              data-id={o.listingId}
              data-testid="hero-tag"
              className={`flex items-center gap-3 rounded-[14px] border px-3.5 py-2.5 ${
                winner ? 'border-2 border-blue bg-surface text-ink shadow-card' : 'border-line bg-surface text-ink'
              }`}
            >
              <span aria-hidden="true" className="size-3 shrink-0 rounded-full "  style={{ background: platform?.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-[18px] leading-tight font-bold">{platform?.name}</p>
                <p className="truncate text-[13px] text-muted">
                  {note || `${o.eta[0]}–${o.eta[1]} min`}
                </p>
              </div>
              <div className="text-right">
                <p className="money text-[22px] leading-none font-extrabold tracking-tight">{fmt(o.totalDh)}</p>
                {winner ? (
                  <span className="mt-1 inline-block rounded-full bg-pink px-2.5 py-0.5 text-[12px] font-extrabold text-pink-ink">Pays least</span>
                ) : (
                  <p className="mt-1 text-[13px] font-semibold text-muted">{`+${fmt(o.totalDh - lowest)}`}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <fieldset className="space-y-2">
        <legend className="text-[15px] font-bold">What changes if…</legend>
        <div className="flex flex-wrap gap-2">
          {TOGGLES.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-pressed={on[t.key]}
              onClick={() => setOn((p) => ({ ...p, [t.key]: !p[t.key] }))}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold ${
                on[t.key] ? 'border-brand bg-brand text-white' : 'border-control bg-surface text-ink active:bg-blue-50'
              }`}
            >
              {on[t.key] && <Check size={16} aria-hidden="true" />}
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <p aria-live="polite" className="min-h-[3.25rem] text-[15px] leading-snug" data-testid="hero-explanation">
        {comparison.explanation}
      </p>
    </div>
  );
}
