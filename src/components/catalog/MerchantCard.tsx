import { Link } from 'react-router';
import { ChevronRight, Clock } from 'lucide-react';
import { listingsOfMerchant } from '../../data/lookup';
import type { Merchant } from '../../engine/types';
import MerchantLogo from '../media/MerchantLogo';
import { PlatformDots } from '../ui/PlatformChip';

export default function MerchantCard({ merchant }: { merchant: Merchant }) {
  const listings = listingsOfMerchant(merchant.id);
  const platformIds = [...new Set(listings.map((l) => l.platformId))];
  const minEta = Math.min(...listings.map((l) => l.eta[0]));
  const maxEta = Math.max(...listings.map((l) => l.eta[1]));

  return (
    <Link
      to={`/food/${merchant.id}`}
      className="flex min-h-20 items-center gap-3 rounded-card border border-line bg-surface p-3 active:bg-brand-soft"
    >
      <MerchantLogo merchant={merchant} size={56} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-bold">{merchant.name}</span>
        <span className="block truncate text-[14px] text-muted">{merchant.cuisine}</span>
        <span className="mt-1 flex items-center gap-2 text-[13px] text-muted">
          <PlatformDots platformIds={platformIds} />
          <span>{platformIds.length === 1 ? 'On 1 app' : `On ${platformIds.length} apps`}</span>
          <Clock size={13} aria-hidden="true" className="ml-1" />
          <span>{minEta}–{maxEta} min</span>
        </span>
      </span>
      <ChevronRight size={20} aria-hidden="true" className="shrink-0 text-muted" />
    </Link>
  );
}
