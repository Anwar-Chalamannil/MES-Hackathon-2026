import type { PricedOffer, SortMode } from '../../engine/types';
import type { CardPreset } from '../../data/cardPresets';
import OfferCard from './OfferCard';

/**
 * The highlighted result. aria-live announces a new winner to screen readers; the key re-triggers a
 * short highlight whenever the winner or its total changes.
 */
export default function WinnerCard({
  offer, cheapestDh, mode, explanation, card, guideHref,
}: {
  offer: PricedOffer;
  cheapestDh: number;
  mode: SortMode;
  explanation: string;
  card?: CardPreset;
  guideHref?: string;
}) {
  return (
    <div aria-live="polite">
      <div key={`${offer.listingId}-${offer.totalDh}`} className="winner-flash">
        <OfferCard offer={offer} cheapestDh={cheapestDh} winner mode={mode} explanation={explanation} card={card} guideHref={guideHref} />
      </div>
    </div>
  );
}
