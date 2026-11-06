import { X } from 'lucide-react';
import { cardPresetById, cardPresetGroups, type CardPreset } from '../../data/cardPresets';

const TIER_LABEL: Record<CardPreset['tier'], string> = {
  infinite: 'Infinite', signature: 'Signature', platinum: 'Platinum', world: 'World', unknown: 'Tier not specified',
};

/** Bank, network, tier and credit/debit, kept as four separate facts. */
export function cardFacts(c: CardPreset): string {
  return [c.bankName, c.network === 'visa' ? 'Visa' : 'Mastercard', TIER_LABEL[c.tier], c.cardType === 'credit' ? 'Credit' : 'Debit'].join(' · ');
}

/**
 * One card row: a dropdown of preset plans (nothing to type), the card's facts underneath, and an optional remove button.
 * Plans already chosen in another row are disabled so the same card cannot be added twice.
 */
export default function CardSelect({
  label, value, taken, onChange, onRemove,
}: {
  label: string;
  /** A preset id, or '' for "not chosen yet". */
  value: string;
  taken: string[];
  onChange: (presetId: string) => void;
  onRemove?: () => void;
}) {
  const preset = cardPresetById.get(value);
  const unknown = value !== '' && !preset;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">{label}</span>
          <select
            value={unknown ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-12 w-full rounded-btn border border-control bg-surface px-3 text-[16px] font-semibold"
          >
            <option value="">{unknown ? 'This card is no longer in our list' : 'Select your card'}</option>
            {cardPresetGroups().map((g) => (
              <optgroup key={g.bankName} label={g.bankName}>
                {g.cards.map((c) => (
                  <option key={c.id} value={c.id} disabled={taken.includes(c.id) && c.id !== value}>
                    {c.label}{taken.includes(c.id) && c.id !== value ? ' (already added)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${preset?.label ?? 'this card'}`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-muted active:bg-blue-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>
      {preset && <p className="px-1 text-[13px] text-muted">{cardFacts(preset)}</p>}
      {unknown && <p className="px-1 text-[13px] text-fail">This card plan is no longer in our list, so it is ignored when comparing. Remove it or pick another.</p>}
    </div>
  );
}
