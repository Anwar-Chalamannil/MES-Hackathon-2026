import { describe, expect, it } from 'vitest';
import { bestCombination } from '../optimize';
import type { OptimizeBase, Promotion, PromoEval } from '../types';
import { promo } from './fixtures';

// items 40.00, delivery 9.00, service 2.00, no small-order fee -> 51.00 before vouchers
const BASE: OptimizeBase = { itemsDh: 4000, deliveryDh: 900, serviceDh: 200, smallOrderDh: 0 };
const NONE = 5100;

const ev = (promoId: string, savingDh: number, eligible = true): PromoEval => ({
  promoId, eligible, conditions: [], savingDh, reason: '',
});
const mk = (id: string, over: Partial<Promotion> = {}) => promo({ id, platformId: 'talabat', ...over });
const ids = (r: ReturnType<typeof bestCombination>) => r.applied.map((a) => a.promoId);

describe('bestCombination basics', () => {
  it('applies nothing when nothing is eligible', () => {
    const r = bestCombination([], [], BASE);
    expect(r).toEqual({ applied: [], totalDh: NONE });
  });
  it('ignores ineligible promotions (rejection case)', () => {
    const r = bestCombination([ev('A', 1000, false)], [mk('A')], BASE);
    expect(r.applied).toEqual([]);
    expect(r.totalDh).toBe(NONE);
  });
  it('ignores sale promotions', () => {
    const r = bestCombination([ev('S', 1000)], [mk('S', { kind: 'sale', benefit: { type: 'sale_price' } })], BASE);
    expect(r.applied).toEqual([]);
  });
  it('applies a single code', () => {
    const r = bestCombination([ev('A', 800)], [mk('A')], BASE);
    expect(r.applied).toEqual([{ promoId: 'A', target: 'items', savingDh: 800 }]);
    expect(r.totalDh).toBe(NONE - 800);
  });
});

describe('stacking rules', () => {
  it('allows only one code and picks the better one', () => {
    const r = bestCombination([ev('A', 800), ev('B', 1200)], [mk('A'), mk('B')], BASE);
    expect(ids(r)).toEqual(['B']);
    expect(r.totalDh).toBe(NONE - 1200);
  });
  it('allows one code plus one bank offer when both permit it', () => {
    const code = mk('C', { stacking: { withCodes: false, withBank: true, withMembership: true, withAuto: true } });
    const bank = mk('B', { kind: 'bank', stacking: { withCodes: true, withBank: false, withMembership: true, withAuto: true } });
    const r = bestCombination([ev('C', 800), ev('B', 1000)], [code, bank], BASE);
    expect(ids(r).sort()).toEqual(['B', 'C']);
    expect(r.totalDh).toBe(NONE - 1800);
  });
  it('does not combine a code with a bank offer that forbids codes (rejection case)', () => {
    const code = mk('C'); // allows bank
    const bank = mk('B', { kind: 'bank', stacking: { withCodes: false, withBank: false, withMembership: true, withAuto: true } });
    const r = bestCombination([ev('C', 800), ev('B', 1000)], [code, bank], BASE);
    expect(ids(r)).toEqual(['B']); // best single
  });
  it('a non-combinable promotion excludes everything else', () => {
    const nc = mk('NC', { kind: 'bank', stacking: { withCodes: false, withBank: false, withMembership: false, withAuto: false } });
    const member = mk('M', { kind: 'membership', benefit: { type: 'free_delivery' }, target: 'delivery',
      stacking: { withCodes: true, withBank: true, withMembership: true, withAuto: true } });
    const r = bestCombination([ev('NC', 1000), ev('M', 900)], [nc, member], BASE);
    expect(ids(r)).toEqual(['NC']); // 10.00 alone beats 9.00 alone
  });
  it('honours withMembership:false on a code', () => {
    const code = mk('C', { stacking: { withCodes: false, withBank: true, withMembership: false, withAuto: true } });
    const member = mk('M', { kind: 'membership', target: 'delivery', stacking: { withCodes: true, withBank: true, withMembership: true, withAuto: true } });
    const r = bestCombination([ev('C', 500), ev('M', 900)], [code, member], BASE);
    expect(ids(r)).toEqual(['M']); // 9.00 > 5.00 and they cannot stack
  });
  it('searches all combinations instead of being greedy', () => {
    // X saves the most on its own but blocks the extras; M1 + M2 together save more.
    const x = mk('X', { stacking: { withCodes: false, withBank: true, withMembership: false, withAuto: false } });
    const m1 = mk('M1', { kind: 'membership', stacking: { withCodes: true, withBank: true, withMembership: true, withAuto: true } });
    const m2 = mk('M2', { kind: 'auto', stacking: { withCodes: true, withBank: true, withMembership: true, withAuto: true } });
    const r = bestCombination([ev('X', 1000), ev('M1', 700), ev('M2', 700)], [x, m1, m2], BASE);
    expect(ids(r).sort()).toEqual(['M1', 'M2']);
    expect(r.totalDh).toBe(NONE - 1400);
  });
});

describe('clamping', () => {
  it('never lets savings exceed the amount they apply to', () => {
    const r = bestCombination([ev('BIG', 9000)], [mk('BIG')], BASE); // items are only 40.00
    expect(r.applied).toEqual([{ promoId: 'BIG', target: 'items', savingDh: 4000 }]);
    expect(r.totalDh).toBe(NONE - 4000);
  });
  it('does not count two free-delivery promotions twice', () => {
    const std = { withCodes: true, withBank: true, withMembership: true, withAuto: true };
    const a = mk('A1', { kind: 'membership', benefit: { type: 'free_delivery' }, target: 'delivery', stacking: std });
    const b = mk('B1', { kind: 'auto', benefit: { type: 'free_delivery' }, target: 'delivery', stacking: std });
    const r = bestCombination([ev('A1', 900), ev('B1', 900)], [a, b], BASE);
    expect(r.totalDh).toBe(NONE - 900);
    expect(ids(r)).toEqual(['A1']); // fewer promotions, then lowest id
  });
  it('clamps the sum of two item promotions and reports the clamped savings', () => {
    const std = { withCodes: true, withBank: true, withMembership: true, withAuto: true };
    const a = mk('A', { kind: 'bank', stacking: std });
    const b = mk('B', { stacking: std });
    const r = bestCombination([ev('A', 3000), ev('B', 3000)], [a, b], BASE); // 60.00 > items 40.00
    expect(r.totalDh).toBe(NONE - 4000);
    expect(r.applied.reduce((s, x) => s + x.savingDh, 0)).toBe(4000);
    expect(r.applied.find((x) => x.promoId === 'A')?.savingDh).toBe(3000);
    expect(r.applied.find((x) => x.promoId === 'B')?.savingDh).toBe(1000); // largest id is reduced first
  });
  it('never discounts the small-order fee', () => {
    const r = bestCombination([ev('BIG', 99999)], [mk('BIG')], { ...BASE, smallOrderDh: 500 });
    expect(r.totalDh).toBe(900 + 200 + 500); // only items removed
  });
});

describe('determinism', () => {
  it('gives the same answer whatever the input order', () => {
    const list = [mk('A'), mk('B'), mk('C')];
    const evals = [ev('A', 1000), ev('B', 1000), ev('C', 1000)];
    const forward = bestCombination(evals, list, BASE);
    const backward = bestCombination([...evals].reverse(), [...list].reverse(), BASE);
    expect(forward).toEqual(backward);
    expect(ids(forward)).toEqual(['A']); // equal totals: lowest id wins
  });
});

describe('many custom vouchers', () => {
  it('handles 200 codes quickly and picks the best one', () => {
    const list: Promotion[] = [];
    const evals: PromoEval[] = [];
    for (let i = 0; i < 200; i++) {
      list.push(mk(`U${String(i).padStart(3, '0')}`, { origin: 'user' }));
      evals.push(ev(`U${String(i).padStart(3, '0')}`, 100 + (i % 37) * 20));
    }
    const std = { withCodes: true, withBank: true, withMembership: true, withAuto: true };
    const extras = ['E1', 'E2', 'E3', 'E4'].map((id) => mk(id, { kind: 'auto', target: 'delivery', stacking: std }));
    list.push(...extras);
    evals.push(...extras.map((e) => ev(e.id, 200)));

    const start = performance.now();
    const r = bestCombination(evals, list, BASE);
    const ms = performance.now() - start;

    expect(ms).toBeLessThan(50);
    const bestCode = r.applied.find((a) => a.promoId.startsWith('U'));
    expect(bestCode?.savingDh).toBe(100 + 36 * 20); // 820
    // Four extras x 2.00 = 8.00 fits inside the 9.00 delivery fee, so all four are used.
    expect(r.applied.filter((a) => a.promoId.startsWith('E'))).toHaveLength(4);
    expect(r.totalDh).toBe(NONE - 820 - 800);
  });

  it('handles 100 codes and 100 bank offers quickly', () => {
    const list: Promotion[] = [];
    const evals: PromoEval[] = [];
    for (let i = 0; i < 100; i++) {
      const code = mk(`C${String(i).padStart(3, '0')}`, { origin: 'user', stacking: { withCodes: false, withBank: true, withMembership: true, withAuto: true } });
      const bank = mk(`B${String(i).padStart(3, '0')}`, { kind: 'bank', origin: 'user', stacking: { withCodes: true, withBank: false, withMembership: true, withAuto: true } });
      list.push(code, bank);
      evals.push(ev(code.id, 100 + i), ev(bank.id, 200 + i));
    }
    const start = performance.now();
    const r = bestCombination(evals, list, BASE);
    const ms = performance.now() - start;
    expect(ms).toBeLessThan(50);
    expect(ids(r).sort()).toEqual(['B099', 'C099']);
    expect(r.totalDh).toBe(NONE - 199 - 299);
  });
});
