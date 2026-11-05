import type {
  AppliedPromo, Dh, OptimizeBase, OptimizeResult, Promotion, PromoEval, PromoTarget,
} from './types';

interface Cand {
  id: string;
  p: Promotion;
  saving: Dh;
}

/** Safety limit: seed data has at most 4 auto/membership promos per platform. */
const MAX_EXTRAS = 10;
const TARGET_ORDER: PromoTarget[] = ['items', 'delivery', 'service'];

const allows = (p: Promotion, kind: Promotion['kind']): boolean => {
  switch (kind) {
    case 'code': return p.stacking.withCodes;
    case 'bank': return p.stacking.withBank;
    case 'membership': return p.stacking.withMembership;
    case 'auto': return p.stacking.withAuto;
    default: return false;
  }
};
const compatible = (a: Cand, b: Cand) => allows(a.p, b.p.kind) && allows(b.p, a.p.kind);
const byId = (a: Cand, b: Cand) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Structured enumeration: at most one code, at most one bank offer, and any valid subset of the
 * auto/membership extras. Cost is (codes+1) x (banks+1) x 2^extras, so it grows linearly with
 * the number of saved vouchers. Savings are summed per target and clamped once to that target's
 * amount, so the result does not depend on the order of promotions.
 * Ties: lowest total, then fewer promotions, then lexicographic promotion ids.
 */
export function bestCombination(
  eligible: PromoEval[],
  promos: Promotion[],
  base: OptimizeBase,
): OptimizeResult {
  const promoById = new Map(promos.map((p) => [p.id, p]));
  const cands: Cand[] = [];
  for (const e of eligible) {
    const p = promoById.get(e.promoId);
    if (!p || !e.eligible || e.savingDh <= 0 || p.kind === 'sale') continue;
    cands.push({ id: p.id, p, saving: e.savingDh });
  }
  cands.sort(byId);

  const codes = cands.filter((c) => c.p.kind === 'code');
  const banks = cands.filter((c) => c.p.kind === 'bank');
  const extras = cands
    .filter((c) => c.p.kind === 'membership' || c.p.kind === 'auto')
    .sort((a, b) => b.saving - a.saving || byId(a, b))
    .slice(0, MAX_EXTRAS)
    .sort(byId);

  const fixed = base.itemsDh + base.deliveryDh + base.serviceDh + base.smallOrderDh;
  const totalFor = (items: Dh, delivery: Dh, service: Dh) =>
    fixed - Math.min(items, base.itemsDh) - Math.min(delivery, base.deliveryDh) - Math.min(service, base.serviceDh);

  let bestTotal = fixed;
  let bestCombo: Cand[] = [];

  const idsKey = (combo: Cand[]) => combo.map((c) => c.id).sort().join(',');
  const consider = (total: Dh, count: number, build: () => Cand[]) => {
    if (total > bestTotal) return;
    if (total === bestTotal) {
      if (count > bestCombo.length) return;
      if (count === bestCombo.length) {
        const combo = build();
        if (idsKey(combo) >= idsKey(bestCombo)) return;
        bestCombo = combo;
        return;
      }
    }
    bestTotal = total;
    bestCombo = build();
  };

  for (let mask = 0; mask < 1 << extras.length; mask++) {
    const sel = extras.filter((_, i) => (mask >> i) & 1);
    let valid = true;
    for (let i = 0; i < sel.length && valid; i++) {
      for (let j = i + 1; j < sel.length; j++) {
        if (!compatible(sel[i], sel[j])) { valid = false; break; }
      }
    }
    if (!valid) continue;

    const sums: Record<PromoTarget, Dh> = { items: 0, delivery: 0, service: 0 };
    for (const c of sel) sums[c.p.target] += c.saving;

    const codeOpts: (Cand | null)[] = [null, ...codes.filter((c) => sel.every((x) => compatible(c, x)))];
    const bankOpts: (Cand | null)[] = [null, ...banks.filter((b) => sel.every((x) => compatible(b, x)))];

    for (const code of codeOpts) {
      for (const bank of bankOpts) {
        if (code && bank && !compatible(code, bank)) continue;
        const items = sums.items + (code?.p.target === 'items' ? code.saving : 0) + (bank?.p.target === 'items' ? bank.saving : 0);
        const delivery = sums.delivery + (code?.p.target === 'delivery' ? code.saving : 0) + (bank?.p.target === 'delivery' ? bank.saving : 0);
        const service = sums.service + (code?.p.target === 'service' ? code.saving : 0) + (bank?.p.target === 'service' ? bank.saving : 0);
        consider(
          totalFor(items, delivery, service),
          sel.length + (code ? 1 : 0) + (bank ? 1 : 0),
          () => [...sel, ...(code ? [code] : []), ...(bank ? [bank] : [])],
        );
      }
    }
  }

  return { applied: toApplied(bestCombo, base), totalDh: bestTotal };
}

/** Clamps each target to its amount; any excess is taken from the promotion with the largest id first. */
function toApplied(combo: Cand[], base: OptimizeBase): AppliedPromo[] {
  const cap: Record<PromoTarget, Dh> = { items: base.itemsDh, delivery: base.deliveryDh, service: base.serviceDh };
  const out: AppliedPromo[] = [];
  for (const target of TARGET_ORDER) {
    const inTarget = combo.filter((c) => c.p.target === target).sort(byId);
    let excess = inTarget.reduce((s, c) => s + c.saving, 0) - cap[target];
    const reduced = new Map<string, Dh>(inTarget.map((c) => [c.id, c.saving]));
    for (const c of [...inTarget].reverse()) {
      if (excess <= 0) break;
      const cut = Math.min(reduced.get(c.id)!, excess);
      reduced.set(c.id, reduced.get(c.id)! - cut);
      excess -= cut;
    }
    for (const c of inTarget) {
      const savingDh = reduced.get(c.id)!;
      if (savingDh > 0) out.push({ promoId: c.id, target, savingDh });
    }
  }
  return out;
}
