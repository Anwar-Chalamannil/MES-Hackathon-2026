import { useMemo } from 'react';
import { Link } from 'react-router';
import { cardPresetById } from '../../data/cardPresets';
import { catalog } from '../../data/catalog';
import { platformName } from '../../data/lookup';
import type { Channel, Issuer, Membership, Network, PlatformId, Scenario } from '../../engine/types';
import { useAppStore } from '../../store/useAppStore';
import Sheet from '../ui/Sheet';

export const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'card', label: 'Card' }, { value: 'apple_pay', label: 'Apple Pay' }, { value: 'cash', label: 'Cash' },
];
export const ISSUERS: { value: Issuer; label: string }[] = [
  { value: 'dukhan', label: 'Dukhan Bank' }, { value: 'qnb', label: 'QNB' },
  { value: 'lulu_cobrand', label: 'LuLu co-brand' }, { value: 'other', label: 'Other bank' },
];
export const NETWORKS: { value: Network; label: string }[] = [
  { value: 'visa', label: 'Visa' }, { value: 'mastercard', label: 'Mastercard' },
];
export const MEMBERSHIPS: { value: Membership; label: string }[] = [
  { value: 'talabat_pro', label: 'talabat pro' }, { value: 'snoonu_plus', label: 'Snoonu+' },
  { value: 'rafeeq_pro', label: 'Rafeeq Pro' }, { value: 'ninja_premium', label: 'Ninja Premium' },
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[14px] font-extrabold">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, disabled, role, children }: { on: boolean; onClick: () => void; disabled?: boolean; role: 'radio' | 'checkbox'; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-[14px] font-semibold disabled:opacity-40 ${
        on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-ink'
      }`}
    >
      {children}
    </button>
  );
}

/** Demo selections that decide which vouchers apply. Never asks for card numbers. */
export default function ProfileSheet({ scenario, open, onClose }: { scenario: Scenario; open: boolean; onClose: () => void }) {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const savedCards = useAppStore((s) => s.cards);
  const cash = profile.channel === 'cash';
  const platformIds = useMemo(
    () => [...new Set(catalog.listings.filter((l) => l.scenario === scenario).map((l) => l.platformId))] as PlatformId[],
    [scenario],
  );
  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <Sheet open={open} onClose={onClose} title="Your payment and profile">
      <div className="space-y-5">
        <p className="rounded-btn bg-brand-soft px-3 py-2 text-[13px] text-brand">
          We never ask for card numbers, CVVs or passwords. These choices only decide which offers apply.
        </p>
        <Group title="Pay with">
          {CHANNELS.map((c) => (
            <Chip key={c.value} role="radio" on={profile.channel === c.value} onClick={() => setProfile({ channel: c.value })}>{c.label}</Chip>
          ))}
        </Group>
        {savedCards.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-[14px] font-extrabold">Your cards</legend>
            <ul className="space-y-1 text-[14px]">
              {savedCards.map((c) => (
                <li key={c.id} className="font-semibold">{cardPresetById.get(c.presetId)?.label ?? 'A card no longer in our list'}</li>
              ))}
            </ul>
            <p className="text-[13px] text-muted">Perq tries every card and keeps the best result. Paying with Apple Pay or cash can switch card-only offers off.</p>
            <Link to="/settings" onClick={onClose} className="inline-flex min-h-11 items-center text-[14px] font-bold text-brand underline underline-offset-4">Manage cards</Link>
          </fieldset>
        ) : (
          <>
            <Group title="Card's bank">
              {ISSUERS.map((i) => (
                <Chip key={i.value} role="radio" disabled={cash} on={!cash && profile.issuer === i.value} onClick={() => setProfile({ issuer: i.value })}>{i.label}</Chip>
              ))}
            </Group>
            <Group title="Card network">
              {NETWORKS.map((n) => (
                <Chip key={n.value} role="radio" disabled={cash} on={!cash && profile.network === n.value} onClick={() => setProfile({ network: n.value })}>{n.label}</Chip>
              ))}
            </Group>
            <p className="-mt-3 text-[13px] text-muted">
              Or <Link to="/settings" onClick={onClose} className="font-bold text-brand underline underline-offset-4">choose your real card plans</Link>.
            </p>
          </>
        )}
        <Group title="Memberships you have">
          {MEMBERSHIPS.map((m) => (
            <Chip key={m.value} role="checkbox" on={profile.memberships.includes(m.value)} onClick={() => setProfile({ memberships: toggle(profile.memberships, m.value) })}>{m.label}</Chip>
          ))}
        </Group>
        <Group title="I'm new to (first order)">
          {platformIds.map((p) => (
            <Chip key={p} role="checkbox" on={profile.firstOrderOn.includes(p)} onClick={() => setProfile({ firstOrderOn: toggle(profile.firstOrderOn, p) })}>{platformName(p)}</Chip>
          ))}
        </Group>
      </div>
    </Sheet>
  );
}
