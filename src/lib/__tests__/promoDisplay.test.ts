import { describe, expect, it } from 'vitest';
import { catalog } from '../../data/catalog';
import { resolveExpiry } from '../../engine/time';
import type { Promotion } from '../../engine/types';
import { codeInfo, isCopyable, isDemoCode, promoDetails, promoHeadline, promoRequirement, promoShortTitle, qarShort } from '../promoDisplay';

const promo = (id: string): Promotion => {
  const p = catalog.promotions.find((x) => x.id === id);
  if (!p) throw new Error(`no promo ${id}`);
  return p;
};
const NOW = Date.UTC(2026, 10, 6, 10, 0); // 6 Nov 2026, after R2's real end date (19 Mar 2026)
const isExpired = (p: Promotion) => resolveExpiry(p.conditions.expiry, NOW) <= NOW;

describe('benefit-first headlines (one per seed promotion)', () => {
  it('every seed promotion gets a headline that is never its code', () => {
    expect(catalog.promotions).toHaveLength(27);
    for (const p of catalog.promotions) {
      const h = promoHeadline(p);
      expect(h.length, p.id).toBeGreaterThan(0);
      if (p.code) expect(h, p.id).not.toContain(p.code);
    }
  });

  it('fixed, percentage, first-order and free-delivery wording', () => {
    expect(promoHeadline(promo('S2'))).toBe('QAR 10 OFF');
    expect(promoHeadline(promo('N2'))).toBe('QAR 15 OFF Your First Order');
    expect(promoHeadline(promo('K2'))).toBe('QAR 20 OFF Your First Order');
    expect(promoHeadline(promo('T2'))).toBe('20% OFF');
    expect(promoHeadline(promo('S3'))).toBe('40% OFF Your First Order');
    expect(promoHeadline(promo('R1'))).toBe('30% OFF');
    for (const id of ['T1', 'S1', 'R3', 'K1', 'N1', 'C2', 'KU2', 'W1']) expect(promoHeadline(promo(id)), id).toBe('Free Delivery');
    for (const id of ['C3', 'L3', 'KU1', 'W2']) expect(promoHeadline(promo(id)), id).toBe('On Sale');
  });

  it('whole riyals drop the decimals, others keep them', () => {
    expect(qarShort(1000)).toBe('QAR 10');
    expect(qarShort(1250)).toBe('QAR 12.50');
  });
});

describe('details line: caps, minimums and scope are separate from the headline', () => {
  it('a percentage keeps its cap in the details, never in the headline', () => {
    expect(promoHeadline(promo('T2'))).not.toContain('15');
    expect(promoDetails(promo('T2'))).toContain('Up to QAR 15');
    expect(promoDetails(promo('T2'))).toContain('On orders above QAR 50');
    expect(promoDetails(promo('T2'))).toContain('Food');
  });
  it('minimum spend, scope, category and first-order delivery offers', () => {
    expect(promoDetails(promo('S2'))).toBe('On orders above QAR 160 · Food, Groceries');
    expect(promoDetails(promo('N3'))).toContain('Dairy only');
    expect(promoDetails(promo('W3'))).toContain('Skincare, Personal care only');
    expect(promoDetails(promo('K1'), 'Keeta')).toContain('First Keeta order');
    expect(promoDetails(promo('C2'))).toContain('Applied automatically');
    expect(promoDetails(promo('T1'))).toContain('With talabat pro');
  });
});

describe('requirements name the bank, network and channel separately', () => {
  it('bank offers', () => {
    expect(promoRequirement(promo('R1'))).toBe('Needs a Dukhan Bank Visa card, paid by card (not Apple Pay or cash)');
    expect(promoRequirement(promo('T3'))).toBe('Needs a QNB card, paid by card or Apple Pay');
    expect(promoRequirement(promo('L1'))).toContain('Mastercard');
  });
  it('memberships and offers without a requirement', () => {
    expect(promoRequirement(promo('T1'))).toBe('Needs talabat pro membership');
    expect(promoRequirement(promo('S2'))).toBe('');
  });
});

describe('codes: never invented, copy only when a live code exists', () => {
  it('14 promotions carry a code (11 code vouchers plus bank offers T3, R1, R2)', () => {
    const withCode = catalog.promotions.filter((p) => p.code);
    expect(withCode).toHaveLength(14);
    expect(withCode.filter((p) => p.kind === 'code')).toHaveLength(11);
    expect(withCode.filter((p) => p.kind === 'bank').map((p) => p.id).sort()).toEqual(['R1', 'R2', 'T3']);
  });

  it('automatic, membership and sale promotions never show or copy a code', () => {
    for (const p of catalog.promotions.filter((x) => ['auto', 'membership', 'sale'].includes(x.kind))) {
      expect(p.code, p.id).toBeUndefined();
      expect(isCopyable(p, false), p.id).toBe(false);
      expect(codeInfo(p, false).kind, p.id).toBe('none');
    }
    expect(codeInfo(promo('C3'), false)).toEqual({ kind: 'none', text: 'Sale price, no code' });
  });

  it('12 active demo codes are copyable; the expired K3 and R2 are shown greyed with no copy', () => {
    const copyable = catalog.promotions.filter((p) => isCopyable(p, isExpired(p)));
    expect(copyable).toHaveLength(12);
    expect(copyable.every((p) => isDemoCode(p.code))).toBe(true);
    expect(codeInfo(promo('K3'), true)).toEqual({ kind: 'expired', code: 'DEMO-KT25' });
    expect(codeInfo(promo('R2'), true)).toEqual({ kind: 'expired', code: 'DKB50' });
    expect(isCopyable(promo('K3'), true)).toBe(false);
  });

  it('a bank offer without a code (L1) says so instead of inventing one', () => {
    expect(codeInfo(promo('L1'), true).kind).toBe('none');
  });
});

describe('your own vouchers get the same treatment', () => {
  const mine: Promotion = {
    id: 'u1', platformId: 'talabat', name: 'Weekend treat', code: 'MYCODE', kind: 'code', origin: 'user',
    benefit: { type: 'percent', pct: 10, capDh: 500 }, target: 'items',
    conditions: { minSpendDh: 3000, expiry: { iso: '2030-01-01T00:00:00+03:00' } },
    stacking: { withCodes: false, withBank: true, withMembership: true, withAuto: true },
    verifyInApp: [], classification: 'invented_demo', confidence: 'low', summary: '',
  };
  it('headline from the benefit, name kept for the subtitle, a real code is copyable but not marked demo', () => {
    expect(promoHeadline(mine)).toBe('10% OFF');
    expect(promoDetails(mine)).toBe('Up to QAR 5 · On orders above QAR 30');
    expect(codeInfo(mine, false)).toEqual({ kind: 'copy', code: 'MYCODE', demo: false });
  });
  it('short title for alerts', () => {
    expect(promoShortTitle(mine, 'Talabat')).toBe('10% OFF at Talabat');
  });
});
