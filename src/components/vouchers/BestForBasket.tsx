import { Sparkles } from 'lucide-react';
import { findPromo, platformName } from '../../data/lookup';
import { fmt } from '../../engine/money';
import type { Basket, Comparison } from '../../engine/types';
import { cheapestOffer } from '../../lib/promoStatus';
import { useAppStore } from '../../store/useAppStore';
import { ButtonLink } from '../ui/Button';

/** The recommendation: which saved voucher(s) give the lowest final amount for the basket right now. */
export default function BestForBasket({ comparison, basket }: { comparison: Comparison; basket: Basket }) {
  const custom = useAppStore((s) => s.wallet.custom);
  const best = cheapestOffer(comparison);

  let text = "Add items to a basket and we'll recommend the voucher that gives you the lowest final amount.";
  if (basket.lines.length > 0) {
    if (!best) {
      text = "No app in our sample can deliver your whole basket, so there is nothing to recommend yet.";
    } else if (best.applied.length === 0) {
      text = `The lowest total is ${fmt(best.totalDh)} on ${platformName(best.platformId)}. None of your saved vouchers lowers it right now.`;
    } else {
      const names = best.applied.map((a) => findPromo(a.promoId, custom)?.name ?? a.promoId).join(' + ');
      text = `Lowest final amount: ${fmt(best.totalDh)} on ${platformName(best.platformId)}, using ${names}. You save ${fmt(best.promoSavingsDh)} with vouchers.`;
    }
  }

  return (
    <section aria-labelledby="best-title" className="rounded-card border-t-4 border-brand bg-surface p-4 shadow-sm">
      <h2 id="best-title" className="flex items-center gap-2 text-[15px] font-extrabold">
        <Sparkles size={18} className="text-brand" aria-hidden="true" /> Best for your basket
      </h2>
      <p className="mt-1 text-[15px] leading-snug" data-testid="best-for-basket">{text}</p>
      {basket.lines.length > 0 && best && (
        <ButtonLink to={`/compare/${basket.scenario}`} variant="secondary" className="mt-3">See the comparison</ButtonLink>
      )}
    </section>
  );
}
