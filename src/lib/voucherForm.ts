import { fmt } from '../engine/money';
import { resolveExpiry } from '../engine/time';
import type { Channel, Dh, Issuer, Membership, Network, PlatformId, Promotion, Scenario } from '../engine/types';
import { describeBenefit } from './promoText';

/** Everything the voucher form edits, as the strings and flags the form holds. */
export interface VoucherFormValues {
  platformId: PlatformId | '';
  name: string;
  code: string;
  kind: 'code' | 'bank';
  type: 'percent' | 'fixed' | 'free_delivery';
  value: string; // percent (1-90) or QAR amount
  cap: string; // QAR, percent only
  minSpend: string; // QAR
  scenarios: Scenario[]; // empty = everywhere
  channels: Channel[]; // empty = any
  issuers: Issuer[];
  networks: Network[];
  firstOrder: boolean;
  membership: Membership | '';
  expiry: string; // "YYYY-MM-DDTHH:mm" in QATAR time
  combinable: boolean;
}
export type FormErrors = Partial<Record<keyof VoucherFormValues, string>>;

const HOUR = 3_600_000;
const QATAR_OFFSET_MS = 3 * HOUR; // Qatar is UTC+3 all year

/** Epoch ms -> "YYYY-MM-DDTHH:mm" as a Qatar wall-clock time. */
export function qatarWallTime(ms: number): string {
  return new Date(ms + QATAR_OFFSET_MS).toISOString().slice(0, 16);
}
/** "YYYY-MM-DDTHH:mm" read as Qatar time -> epoch ms (NaN when invalid). */
export function parseQatarWallTime(text: string): number {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(text) ? Date.parse(`${text}:00+03:00`) : Number.NaN;
}

/** "12.5" -> 1250. Returns null for anything that is not a plain amount with at most two decimals. */
export function parseQar(text: string): Dh | null {
  const m = /^(\d{1,6})(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || 0);
}
/** 1250 -> "12.50", 1500 -> "15". */
export function qarText(dh: Dh): string {
  const cents = dh % 100;
  return `${Math.floor(dh / 100)}${cents ? `.${String(cents).padStart(2, '0')}` : ''}`;
}

export function emptyForm(nowMs: number): VoucherFormValues {
  return {
    platformId: '', name: '', code: '', kind: 'code', type: 'percent', value: '', cap: '', minSpend: '',
    scenarios: [], channels: [], issuers: [], networks: [], firstOrder: false, membership: '',
    expiry: qatarWallTime(nowMs + 7 * 24 * HOUR), combinable: true,
  };
}

export function validate(v: VoucherFormValues): FormErrors {
  const e: FormErrors = {};
  if (!v.platformId) e.platformId = 'Choose which app this voucher is for.';
  const name = v.name.trim();
  if (name.length < 2 || name.length > 40) e.name = 'Give it a name of 2 to 40 characters.';
  if (v.code.trim() && !/^[A-Za-z0-9-]{3,20}$/.test(v.code.trim())) e.code = 'Use 3 to 20 letters, numbers or hyphens.';

  if (v.type === 'percent') {
    const n = /^\d{1,2}$/.test(v.value.trim()) ? Number(v.value) : 0;
    if (n < 1 || n > 90) e.value = 'Enter a whole percentage from 1 to 90.';
    if (v.cap.trim()) {
      const cap = parseQar(v.cap);
      if (cap === null || cap <= 0) e.cap = 'Enter an amount in QAR, like 15 or 15.50.';
    }
  } else if (v.type === 'fixed') {
    const n = parseQar(v.value);
    if (n === null || n <= 0) e.value = 'Enter an amount in QAR, like 10 or 10.50.';
  }
  if (v.minSpend.trim() && parseQar(v.minSpend) === null) e.minSpend = 'Enter an amount in QAR, like 50.';

  if (!v.expiry) e.expiry = 'Choose when it expires.';
  else if (Number.isNaN(parseQatarWallTime(v.expiry))) e.expiry = 'Enter a valid date and time.';
  return e;
}

/** Builds a wallet voucher. Call only after validate() returned no errors. */
export function buildPromo(v: VoucherFormValues, id: string): Promotion {
  const code = v.code.trim().toUpperCase();
  const cap = v.cap.trim() ? (parseQar(v.cap) ?? undefined) : undefined;
  const benefit: Promotion['benefit'] =
    v.type === 'percent' ? { type: 'percent', pct: Number(v.value), ...(cap !== undefined ? { capDh: cap } : {}) }
    : v.type === 'fixed' ? { type: 'fixed', dh: parseQar(v.value) ?? 0 }
    : { type: 'free_delivery' };
  const minSpendDh = v.minSpend.trim() ? (parseQar(v.minSpend) ?? undefined) : undefined;

  const promo: Promotion = {
    id,
    platformId: v.platformId as PlatformId,
    name: v.name.trim(),
    ...(code ? { code } : {}),
    kind: v.kind,
    benefit,
    target: v.type === 'free_delivery' ? 'delivery' : 'items',
    conditions: {
      ...(minSpendDh !== undefined ? { minSpendDh } : {}),
      ...(v.scenarios.length ? { scenarios: v.scenarios } : {}),
      ...(v.channels.length ? { channels: v.channels } : {}),
      ...(v.issuers.length ? { issuers: v.issuers } : {}),
      ...(v.networks.length ? { networks: v.networks } : {}),
      ...(v.membership ? { membership: v.membership } : {}),
      ...(v.firstOrder ? { firstOrder: true } : {}),
      expiry: { iso: new Date(parseQatarWallTime(v.expiry)).toISOString() },
    },
    stacking: v.combinable
      ? { withCodes: v.kind === 'bank', withBank: v.kind === 'code', withMembership: true, withAuto: true }
      : { withCodes: false, withBank: false, withMembership: false, withAuto: false },
    verifyInApp: ['Your own voucher: check its terms in the app'],
    classification: 'invented_demo',
    confidence: 'low',
    summary: '',
    origin: 'user',
  };
  promo.summary = `${describeBenefit(promo)}${minSpendDh !== undefined ? `, on ${fmt(minSpendDh)} or more` : ''}.`;
  return promo;
}

/** Fills the form from an existing custom voucher (for editing). */
export function formFromPromo(p: Promotion): VoucherFormValues {
  const b = p.benefit;
  const c = p.conditions;
  return {
    platformId: p.platformId,
    name: p.name,
    code: p.code ?? '',
    kind: p.kind === 'bank' ? 'bank' : 'code',
    type: b.type === 'percent' ? 'percent' : b.type === 'fixed' ? 'fixed' : 'free_delivery',
    value: b.type === 'percent' ? String(b.pct) : b.type === 'fixed' ? qarText(b.dh) : '',
    cap: b.type === 'percent' && b.capDh !== undefined ? qarText(b.capDh) : '',
    minSpend: c.minSpendDh !== undefined ? qarText(c.minSpendDh) : '',
    scenarios: c.scenarios ?? [],
    channels: c.channels ?? [],
    issuers: c.issuers ?? [],
    networks: c.networks ?? [],
    firstOrder: c.firstOrder === true,
    membership: c.membership ?? '',
    expiry: qatarWallTime(resolveExpiry(c.expiry, 0)),
    combinable: Object.values(p.stacking).some(Boolean),
  };
}
