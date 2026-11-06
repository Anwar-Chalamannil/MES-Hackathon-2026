import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MAX_CARDS } from '../../data/cardPresets';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import CardSelect from './CardSelect';

const PRIVACY = 'We never ask for card numbers, expiry dates or CVVs. Perq only stores which plan you hold.';

/**
 * Pick one or more cards from a list. Two modes share this component:
 * - onboarding (Home, first visit): choose, then Save & continue (or Skip). Disappears for good once answered.
 * - settings (Settings > My cards): every change is saved at once and the offers update.
 */
export default function ChooseCards({ mode, onSaved }: { mode: 'onboarding' | 'settings'; onSaved?: () => void }) {
  return mode === 'onboarding' ? <Onboarding onSaved={onSaved} /> : <Manage />;
}

function Onboarding({ onSaved }: { onSaved?: () => void }) {
  const setCards = useAppStore((s) => s.setCards);
  const setCardSetup = useAppStore((s) => s.setCardSetup);
  const [rows, setRows] = useState<string[]>(['']);
  const chosen = rows.filter(Boolean);

  const save = () => {
    setCards(chosen);
    setCardSetup('done');
    onSaved?.();
  };

  return (
    <section aria-labelledby="choose-cards-title" className="rounded-[20px] border border-line bg-surface p-4 shadow-card lg:p-5" data-testid="choose-cards">
      <h2 id="choose-cards-title" className="text-[20px] font-extrabold">Choose your cards</h2>
      <p className="mt-1 text-[14px] text-muted">Perq finds card-only offers for you. Pick every card you use, from any bank.</p>
      <div className="mt-3 space-y-3">
        {rows.map((value, i) => (
          <CardSelect
            key={i}
            label={`Card ${i + 1}`}
            value={value}
            taken={chosen}
            onChange={(id) => setRows((r) => r.map((x, j) => (j === i ? id : x)))}
            onRemove={rows.length > 1 ? () => setRows((r) => r.filter((_, j) => j !== i)) : undefined}
          />
        ))}
      </div>
      {rows.length < MAX_CARDS && (
        <button
          type="button"
          onClick={() => setRows((r) => [...r, ''])}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-[15px] font-bold text-brand"
        >
          <Plus size={18} aria-hidden="true" /> Add another card
        </button>
      )}
      <p className="mt-2 text-[12px] text-muted">{PRIVACY}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={save} disabled={chosen.length === 0}>Save &amp; continue</Button>
        <Button variant="secondary" onClick={() => { setCardSetup('skipped'); onSaved?.(); }}>Skip for now</Button>
      </div>
      <button
        type="button"
        onClick={() => { setCards([]); setCardSetup('done'); onSaved?.(); }}
        className="mt-1 inline-flex min-h-11 items-center px-1 text-[14px] font-semibold text-muted underline underline-offset-4"
      >
        I don't use a card
      </button>
    </section>
  );
}

function Manage() {
  const cards = useAppStore((s) => s.cards);
  const addCard = useAppStore((s) => s.addCard);
  const updateCard = useAppStore((s) => s.updateCard);
  const removeCard = useAppStore((s) => s.removeCard);
  const setCardSetup = useAppStore((s) => s.setCardSetup);
  const [adding, setAdding] = useState(false);
  const taken = cards.map((c) => c.presetId);
  const done = () => setCardSetup('done'); // having managed cards here counts as having answered

  return (
    <div className="space-y-3">
      {cards.length === 0 && !adding && (
        <p className="rounded-card border border-dashed border-line bg-surface p-4 text-[14px] text-muted">No cards yet. Add one to see card-only offers.</p>
      )}
      {cards.map((c, i) => (
        <CardSelect
          key={c.id}
          label={`Card ${i + 1}`}
          value={c.presetId}
          taken={taken}
          onChange={(id) => { if (id) { updateCard(c.id, id); done(); } }}
          onRemove={() => { removeCard(c.id); done(); }}
        />
      ))}
      {adding && (
        <CardSelect
          label="New card"
          value=""
          taken={taken}
          onChange={(id) => { if (id) { addCard(id); done(); setAdding(false); } }}
          onRemove={() => setAdding(false)}
        />
      )}
      {!adding && cards.length < MAX_CARDS && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand px-4 text-[15px] font-bold text-brand"
        >
          <Plus size={18} aria-hidden="true" /> Add another card
        </button>
      )}
      <p className="text-[12px] text-muted">{PRIVACY} Changes are saved automatically.</p>
    </div>
  );
}
