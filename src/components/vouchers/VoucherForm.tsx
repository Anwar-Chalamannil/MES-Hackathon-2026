import { useId, useState, type ReactNode } from 'react';
import { catalog } from '../../data/catalog';
import type { Channel, Issuer, Membership, Network, Scenario } from '../../engine/types';
import { validate, type FormErrors, type VoucherFormValues } from '../../lib/voucherForm';
import Button from '../ui/Button';
import { CHANNELS, ISSUERS, MEMBERSHIPS, NETWORKS } from '../compare/ProfileSheet';

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: 'food', label: 'Food' }, { value: 'grocery', label: 'Groceries' }, { value: 'pharmacy', label: 'Pharmacy' },
];

const input = 'min-h-11 w-full rounded-btn border border-line bg-surface px-3 text-[16px]';

function Field({ label, error, hint, id, children }: { label: string; error?: string; hint?: string; id: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[14px] font-extrabold">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-[12px] text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-[13px] font-semibold text-fail">{error}</p>}
    </div>
  );
}

function MultiChips<T extends string>({ legend, options, value, onChange }: { legend: string; options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-[14px] font-extrabold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}
              className={`min-h-11 rounded-full border px-4 text-[14px] font-semibold ${on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface'}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Add or edit a voucher. Validates on submit and shows a message under each field that needs fixing. */
export default function VoucherForm({
  initial, submitLabel, onSubmit, onCancel,
}: {
  initial: VoucherFormValues;
  submitLabel: string;
  onSubmit: (values: VoucherFormValues) => void;
  onCancel: () => void;
}) {
  const [v, setV] = useState<VoucherFormValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const uid = useId();
  const set = <K extends keyof VoucherFormValues>(key: K, value: VoucherFormValues[K]) => setV((p) => ({ ...p, [key]: value }));
  const id = (name: string) => `${uid}-${name}`;
  const aria = (name: keyof VoucherFormValues) => ({ 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `${id(name)}-error` : undefined });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(v);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="rounded-btn bg-brand-soft px-3 py-2 text-[13px] text-brand">
        Only enter voucher details. Never enter card numbers, CVVs or passwords.
      </p>

      <Field id={id('platformId')} label="App" error={errors.platformId}>
        <select id={id('platformId')} className={input} value={v.platformId} onChange={(e) => set('platformId', e.target.value as VoucherFormValues['platformId'])} {...aria('platformId')}>
          <option value="">Choose an app</option>
          {catalog.platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>

      <Field id={id('name')} label="Name" error={errors.name}>
        <input id={id('name')} className={input} value={v.name} maxLength={40} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Weekend 20% off" {...aria('name')} />
      </Field>

      <Field id={id('code')} label="Code (optional)" error={errors.code} hint="Letters, numbers and hyphens.">
        <input id={id('code')} className={input} value={v.code} maxLength={20} autoCapitalize="characters" autoCorrect="off" onChange={(e) => set('code', e.target.value)} {...aria('code')} />
      </Field>

      <Field id={id('kind')} label="Type of offer">
        <select id={id('kind')} className={input} value={v.kind} onChange={(e) => set('kind', e.target.value as 'code' | 'bank')}>
          <option value="code">Voucher code</option>
          <option value="bank">Bank card offer</option>
        </select>
      </Field>

      <Field id={id('type')} label="Discount">
        <select id={id('type')} className={input} value={v.type} onChange={(e) => set('type', e.target.value as VoucherFormValues['type'])}>
          <option value="percent">Percentage off</option>
          <option value="fixed">Fixed amount off</option>
          <option value="free_delivery">Free delivery</option>
        </select>
      </Field>

      {v.type !== 'free_delivery' && (
        <Field id={id('value')} label={v.type === 'percent' ? 'Percentage (1 to 90)' : 'Amount off (QAR)'} error={errors.value}>
          <input id={id('value')} className={input} inputMode={v.type === 'percent' ? 'numeric' : 'decimal'} value={v.value} onChange={(e) => set('value', e.target.value)} {...aria('value')} />
        </Field>
      )}
      {v.type === 'percent' && (
        <Field id={id('cap')} label="Maximum discount, QAR (optional)" error={errors.cap}>
          <input id={id('cap')} className={input} inputMode="decimal" value={v.cap} onChange={(e) => set('cap', e.target.value)} {...aria('cap')} />
        </Field>
      )}

      <Field id={id('minSpend')} label="Minimum spend, QAR (optional)" error={errors.minSpend}>
        <input id={id('minSpend')} className={input} inputMode="decimal" value={v.minSpend} onChange={(e) => set('minSpend', e.target.value)} {...aria('minSpend')} />
      </Field>

      <MultiChips<Scenario> legend="Valid for (none selected = everything)" options={SCENARIOS} value={v.scenarios} onChange={(x) => set('scenarios', x)} />
      <MultiChips<Channel> legend="Payment method (none = any)" options={CHANNELS} value={v.channels} onChange={(x) => set('channels', x)} />
      <MultiChips<Issuer> legend="Card's bank (none = any)" options={ISSUERS} value={v.issuers} onChange={(x) => set('issuers', x)} />
      <MultiChips<Network> legend="Card network (none = any)" options={NETWORKS} value={v.networks} onChange={(x) => set('networks', x)} />

      <Field id={id('membership')} label="Needs a membership">
        <select id={id('membership')} className={input} value={v.membership} onChange={(e) => set('membership', e.target.value as Membership | '')}>
          <option value="">No membership needed</option>
          {MEMBERSHIPS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </Field>

      <label className="flex min-h-11 items-center gap-3 text-[15px] font-semibold">
        <input type="checkbox" className="size-5 accent-brand" checked={v.firstOrder} onChange={(e) => set('firstOrder', e.target.checked)} />
        First order only
      </label>
      <label className="flex min-h-11 items-center gap-3 text-[15px] font-semibold">
        <input type="checkbox" className="size-5 accent-brand" checked={v.combinable} onChange={(e) => set('combinable', e.target.checked)} />
        Can be combined with other offers
      </label>

      <Field id={id('expiry')} label="Expires (Qatar time)" error={errors.expiry}>
        <input id={id('expiry')} type="datetime-local" className={input} value={v.expiry} onChange={(e) => set('expiry', e.target.value)} {...aria('expiry')} />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <button type="submit" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-btn bg-brand px-4 text-[15px] font-bold text-white active:bg-blue-800">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
