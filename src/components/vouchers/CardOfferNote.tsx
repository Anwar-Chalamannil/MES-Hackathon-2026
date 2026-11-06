import { Link } from 'react-router';
import { CreditCard } from 'lucide-react';
import { platformName } from '../../data/lookup';
import type { Promotion } from '../../engine/types';
import { isCardOffer, matchingCards } from '../../lib/cardMatch';
import { useAppStore } from '../../store/useAppStore';

/**
 * For card-exclusive offers: a "Card offer" label and whether any of the person's saved cards match.
 * Wording says "matches in our demo data" and never promises the offer will work.
 */
export default function CardOfferNote({ promo, expired }: { promo: Promotion; expired: boolean }) {
  const cards = useAppStore((s) => s.cards);
  const channel = useAppStore((s) => s.profile.channel);
  if (!isCardOffer(promo)) return null;

  let status: React.ReactNode = null;
  if (!expired) {
    const m = matchingCards(promo, cards, channel);
    if (cards.length === 0) {
      status = <>Add your cards in <Link to="/settings" className="font-bold text-brand underline underline-offset-4">Settings</Link> to check this offer.</>;
    } else if (m.matches.length > 0) {
      status = <>Your {m.matches.map((c) => c.label).join(' and ')} matches in our demo data. Check the terms in {platformName(promo.platformId)}.</>;
    } else if (m.cantConfirm.length > 0) {
      status = <>We can't confirm the tier of {m.cantConfirm.map((c) => c.label).join(' or ')}, so this offer is not applied.</>;
    } else {
      status = 'None of your saved cards match this offer.';
    }
  }

  return (
    <div className="mt-2 space-y-1" data-testid="card-offer-note">
      <span className="inline-flex items-center gap-1 rounded-full bg-pink px-2.5 py-0.5 text-[12px] font-extrabold text-ink">
        <CreditCard size={13} aria-hidden="true" /> Card offer
      </span>
      {status && <p className="text-[13px] leading-snug text-ink">{status}</p>}
    </div>
  );
}
