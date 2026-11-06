import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import type { CardPreset } from '../../data/cardPresets';
import { findPromo, merchantById, platformName } from '../../data/lookup';
import { fmt } from '../../engine/money';
import type { PricedOffer, SortMode } from '../../engine/types';
import { promoHeadline } from '../../lib/promoDisplay';
import { useAppStore } from '../../store/useAppStore';
import { ButtonLink } from '../ui/Button';
import Money from '../ui/Money';
import PlatformChip from '../ui/PlatformChip';
import Receipt from './Receipt';
import VoucherCheck from './VoucherCheck';

const STAMP: Record<SortMode, string> = { price: 'Pays least', fastest: 'Fastest', discount: 'Biggest discount' };

/**
 * One app's result. The winner is larger and carries a stamp and the explanation. On phones the receipt
 * opens with a tap; on desktop it is always open.
 */
export default function OfferCard({
  offer, cheapestDh, winner = false, mode, explanation, card, guideHref,
}: {
  offer: PricedOffer;
  cheapestDh: number;
  winner?: boolean;
  mode: SortMode;
  explanation?: string;
  /** The saved card whose bank offer made this result, if one did. */
  card?: CardPreset;
  /** Link to the Shopping Guide for this app (complete offers only). */
  guideHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const custom = useAppStore((s) => s.wallet.custom);
  const merchant = merchantById.get(offer.merchantId);
  const gap = offer.totalDh - cheapestDh;

  return (
    <article
      data-testid={winner ? 'winner' : 'offer'}
      data-listing={offer.listingId}
      className={`min-w-0 overflow-hidden rounded-card border bg-surface ${
        winner ? 'border-2 border-blue shadow-card' : 'border-line'
      }`}
    >
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <PlatformChip platformId={offer.platformId} />
            {merchant && merchant.scenario !== 'food' && <p className="mt-1 truncate text-[13px] text-muted">{merchant.name}</p>}
          </div>
          {/* The blue ring and pink pill mark the winner of the chosen sort. In Fastest mode the cheapest card also gets a "Lowest price" outline. */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            {winner && (
              <span className="rounded-full bg-pink px-3 py-1 text-[13px] font-extrabold text-pink-ink">
                {STAMP[mode]}
              </span>
            )}
            {gap === 0 && !(winner && mode === 'price') && (
              <span className="rounded-full border border-blue px-3 py-0.5 text-[13px] font-bold text-brand">Lowest price</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-muted">You pay</p>
            <Money dh={offer.totalDh} className={`font-display tracking-tight whitespace-nowrap ${winner ? 'text-[38px] leading-none' : 'text-[26px] leading-none'}`} />
          </div>
          <div className="min-w-0 text-right text-[13px] text-muted">
            <p className="flex items-center justify-end gap-1">
              <Clock size={14} aria-hidden="true" /> {offer.eta[0]}–{offer.eta[1]} min
            </p>
            {gap > 0 && <p className="font-semibold">+{fmt(gap)} vs best price</p>}
          </div>
        </div>

        {offer.applied.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Discounts applied">
            {offer.applied.map((a) => {
              const p = findPromo(a.promoId, custom);
              return (
                <li key={a.promoId} className="max-w-full truncate rounded-full bg-save/10 px-2.5 py-1 text-[12px] font-bold text-save">
                  {p ? promoHeadline(p) : a.promoId} · saves {fmt(a.savingDh)}
                </li>
              );
            })}
          </ul>
        )}

        {card && <p className="text-[13px] font-semibold text-brand" data-testid="best-with-card">Best with your {card.label}</p>}

        {winner && explanation && <p className="text-[14px] leading-snug">{explanation}</p>}

        <VoucherCheck offer={offer} />

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 w-full items-center justify-between rounded-btn border border-line px-3 text-[14px] font-bold lg:hidden"
        >
          {open ? 'Hide receipt' : 'Show receipt'}
          <ChevronDown size={18} aria-hidden="true" className={open ? 'rotate-180' : ''} />
        </button>
        <div className={open ? 'block' : 'hidden lg:block'}>
          <Receipt offer={offer} />
        </div>

        {guideHref && (
          <ButtonLink to={guideHref} variant={winner ? 'primary' : 'secondary'} className="w-full" data-testid="shop-at">
            Shop at {platformName(offer.platformId)}
          </ButtonLink>
        )}
      </div>
    </article>
  );
}
