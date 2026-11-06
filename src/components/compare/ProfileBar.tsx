import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { cardPresetById } from '../../data/cardPresets';
import { platformName } from '../../data/lookup';
import type { Scenario } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';
import ProfileSheet, { CHANNELS, ISSUERS, MEMBERSHIPS, NETWORKS } from './ProfileSheet';

const label = <T extends string>(list: { value: T; label: string }[], v: T) => list.find((x) => x.value === v)?.label ?? v;

/** One-line summary of the demo profile; tap to change it. */
export default function ProfileBar({ scenario }: { scenario: Scenario }) {
  const profile = useAppStore((s) => s.profile);
  const savedCards = useAppStore((s) => s.cards);
  const [open, setOpen] = useState(false);

  const parts = [
    profile.channel !== 'card'
      ? label(CHANNELS, profile.channel)
      : savedCards.length > 0
        ? `${savedCards.length} saved card${savedCards.length > 1 ? 's' : ''}: ${cardPresetById.get(savedCards[0].presetId)?.label ?? 'card'}${savedCards.length > 1 ? ` +${savedCards.length - 1}` : ''}`
        : `${label(NETWORKS, profile.network)} card, ${label(ISSUERS, profile.issuer)}`,
    profile.memberships.length ? profile.memberships.map((m) => label(MEMBERSHIPS, m)).join(', ') : 'No memberships',
    profile.firstOrderOn.length ? `New to ${profile.firstOrderOn.map(platformName).join(', ')}` : 'Existing customer',
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center gap-3 rounded-card border border-line bg-surface px-3 py-2 text-left active:bg-brand-soft"
      >
        <SlidersHorizontal size={20} className="shrink-0 text-brand" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-muted">Offers are checked for</span>
          <span className="block text-[14px] leading-snug font-bold">{parts.join(', ')}</span>
        </span>
        <span className="shrink-0 text-[13px] font-bold text-brand">Change</span>
      </button>
      <ProfileSheet scenario={scenario} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
