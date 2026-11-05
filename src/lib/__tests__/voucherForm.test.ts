import { describe, expect, it } from 'vitest';
import { compareBasket } from '../../engine/compare';
import { ANCHOR, fixtureBasket, fixtureCatalog, fixtureProfile, NOW } from '../../engine/__tests__/fixtures';
import {
  buildPromo, emptyForm, formFromPromo, parseQar, parseQatarWallTime, qarText, qatarWallTime, validate,
  type VoucherFormValues,
} from '../voucherForm';

const valid = (over: Partial<VoucherFormValues> = {}): VoucherFormValues => ({
  ...emptyForm(NOW), platformId: 'talabat', name: 'My 20% off', type: 'percent', value: '20', ...over,
});

describe('parseQar', () => {
  it('converts amounts to whole dirhams without float errors', () => {
    expect(parseQar('12')).toBe(1200);
    expect(parseQar('12.5')).toBe(1250);
    expect(parseQar('10.50')).toBe(1050);
    expect(parseQar('0.05')).toBe(5);
    expect(parseQar('0.29')).toBe(29);
    expect(parseQar(' 7 ')).toBe(700);
  });
  it('rejects anything that is not a plain amount (rejection cases)', () => {
    for (const bad of ['', 'abc', '1.234', '-5', '1e3', '1,5', '12.', '.5']) expect(parseQar(bad), bad).toBeNull();
  });
  it('qarText is the reverse', () => {
    expect(qarText(1250)).toBe('12.50');
    expect(qarText(1500)).toBe('15');
    expect(qarText(5)).toBe('0.05');
  });
});

describe('Qatar wall time', () => {
  it('reads and writes times as UTC+3', () => {
    expect(parseQatarWallTime('2026-11-06T23:59')).toBe(Date.UTC(2026, 10, 6, 20, 59));
    expect(qatarWallTime(Date.UTC(2026, 10, 6, 20, 59))).toBe('2026-11-06T23:59');
    expect(qatarWallTime(Date.UTC(2026, 10, 6, 21, 0))).toBe('2026-11-07T00:00');
  });
  it('returns NaN for invalid text', () => {
    expect(parseQatarWallTime('tomorrow')).toBeNaN();
    expect(parseQatarWallTime('')).toBeNaN();
  });
});

describe('validate', () => {
  it('accepts a valid form', () => {
    expect(validate(valid())).toEqual({});
    expect(validate(valid({ type: 'fixed', value: '10.50', minSpend: '50', code: 'abc-123' }))).toEqual({});
    expect(validate(valid({ type: 'free_delivery', value: '' }))).toEqual({});
  });
  it('requires a platform, a name and an expiry (rejection cases)', () => {
    const e = validate({ ...emptyForm(NOW), expiry: '' });
    expect(e.platformId).toBeDefined();
    expect(e.name).toBeDefined();
    expect(e.value).toBeDefined();
    expect(e.expiry).toBeDefined();
  });
  it('limits a percentage to a whole number from 1 to 90', () => {
    for (const bad of ['0', '91', '12.5', '-5', 'ten', '']) expect(validate(valid({ value: bad })).value, bad).toBeDefined();
    for (const ok of ['1', '90', '35']) expect(validate(valid({ value: ok })).value, ok).toBeUndefined();
  });
  it('needs a positive amount for a fixed discount', () => {
    expect(validate(valid({ type: 'fixed', value: '0' })).value).toBeDefined();
    expect(validate(valid({ type: 'fixed', value: '-3' })).value).toBeDefined();
  });
  it('checks cap, minimum spend, code and expiry format', () => {
    expect(validate(valid({ cap: '0' })).cap).toBeDefined();
    expect(validate(valid({ cap: 'x' })).cap).toBeDefined();
    expect(validate(valid({ minSpend: '5.555' })).minSpend).toBeDefined();
    expect(validate(valid({ code: 'a b' })).code).toBeDefined();
    expect(validate(valid({ code: 'AB' })).code).toBeDefined();
    expect(validate(valid({ expiry: 'soon' })).expiry).toBeDefined();
  });
});

describe('buildPromo', () => {
  it('builds a percent voucher with a cap, minimum spend and Qatar-time expiry', () => {
    const p = buildPromo(valid({ cap: '5', minSpend: '30', code: 'save-20', expiry: '2026-11-10T23:59' }), 'U1');
    expect(p).toMatchObject({
      id: 'U1', origin: 'user', platformId: 'talabat', code: 'SAVE-20', kind: 'code', target: 'items',
      benefit: { type: 'percent', pct: 20, capDh: 500 },
      conditions: { minSpendDh: 3000, expiry: { iso: '2026-11-10T20:59:00.000Z' } },
    });
    expect(p.summary).toBe('20% off (max QAR 5.00), on QAR 30.00 or more.');
  });
  it('free delivery targets delivery; fixed needs no cap', () => {
    expect(buildPromo(valid({ type: 'free_delivery', value: '' }), 'U2')).toMatchObject({ target: 'delivery', benefit: { type: 'free_delivery' } });
    expect(buildPromo(valid({ type: 'fixed', value: '7.5' }), 'U3').benefit).toEqual({ type: 'fixed', dh: 750 });
  });
  it('sets stacking from the "combine" choice', () => {
    expect(buildPromo(valid({ combinable: false }), 'U4').stacking).toEqual({ withCodes: false, withBank: false, withMembership: false, withAuto: false });
    expect(buildPromo(valid({ kind: 'code' }), 'U5').stacking.withCodes).toBe(false); // one code per order
    expect(buildPromo(valid({ kind: 'bank' }), 'U6').stacking.withBank).toBe(false); // one bank offer per order
  });
  it('keeps payment limits, scenarios, membership and first-order', () => {
    const p = buildPromo(valid({
      kind: 'bank', issuers: ['qnb'], networks: ['visa'], channels: ['card'], scenarios: ['food'], membership: 'talabat_pro', firstOrder: true,
    }), 'U7');
    expect(p.conditions).toMatchObject({ issuers: ['qnb'], networks: ['visa'], channels: ['card'], scenarios: ['food'], membership: 'talabat_pro', firstOrder: true });
  });
  it('round-trips through the edit form', () => {
    const v = valid({ code: 'SAVE-20', cap: '5.50', minSpend: '30', expiry: '2026-11-10T23:59', kind: 'bank', issuers: ['dukhan'] });
    expect(formFromPromo(buildPromo(v, 'U8'))).toEqual(v);
    const fixed = valid({ type: 'fixed', value: '10.50' });
    expect(formFromPromo(buildPromo(fixed, 'U9'))).toEqual(fixed);
  });
});

describe('a custom voucher changes the comparison', () => {
  const run = (promoValues: Partial<VoucherFormValues>) =>
    compareBasket({
      catalog: fixtureCatalog, basket: fixtureBasket, wallet: { savedIds: [], custom: [buildPromo(valid(promoValues), 'U')] },
      profile: fixtureProfile, nowMs: NOW, anchorMs: ANCHOR, mode: 'price',
    }).ranked.find((o) => o.listingId === 'cafe-talabat')!;

  it('applies, respecting its cap', () => {
    expect(run({ cap: '5' }).totalDh).toBe(5100 - 500); // 20% of 40.00 = 8.00, capped at 5.00
  });
  it('is rejected when the minimum spend is not met', () => {
    const o = run({ minSpend: '100' });
    expect(o.totalDh).toBe(5100);
    expect(o.evaluations[0].reason).toContain('Add QAR 60.00 more');
  });
  it('is rejected when it has expired (rejection case)', () => {
    const o = run({ expiry: '2026-11-04T10:00' }); // before NOW (5 Nov 12:00 Qatar)
    expect(o.totalDh).toBe(5100);
    expect(o.evaluations[0].reason).toContain('Expired');
  });
});
