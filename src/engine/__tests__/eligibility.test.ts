import { describe, expect, it } from 'vitest';
import { evaluate } from '../eligibility';
import { priceOffer } from '../offers';
import type { Basket, EvalContext, Profile, Promotion } from '../types';
import { ANCHOR, fixtureBasket, fixtureCatalog, fixtureProfile, HOUR, NOW, promo } from './fixtures';

const talabatListing = fixtureCatalog.listings[0];

/** Burger 20.00 x qty on Talabat. */
function ctx(over: { qty?: number; profile?: Partial<Profile>; basket?: Basket; nowMs?: number } = {}): EvalContext {
  const basket = over.basket ?? { ...fixtureBasket, lines: [{ productId: 'cafe-burger', qty: over.qty ?? 2 }] };
  return {
    offer: priceOffer(talabatListing, basket, fixtureCatalog, over.nowMs ?? NOW, ANCHOR),
    basket,
    catalog: fixtureCatalog,
    profile: { ...fixtureProfile, ...over.profile },
    nowMs: over.nowMs ?? NOW,
    anchorMs: ANCHOR,
  };
}
const p = (over: Partial<Promotion> = {}) => promo({ id: 'P', platformId: 'talabat', ...over });
const cond = (e: ReturnType<typeof evaluate>, key: string) => e.conditions.find((c) => c.key === key);

describe('discount maths', () => {
  it('percentage discount', () => {
    const e = evaluate(p({ benefit: { type: 'percent', pct: 20 } }), ctx()); // 20% of 40.00
    expect(e.eligible).toBe(true);
    expect(e.savingDh).toBe(800);
  });
  it('percentage discount stops at the maximum cap', () => {
    const e = evaluate(p({ benefit: { type: 'percent', pct: 50, capDh: 1000 } }), ctx()); // 50% = 20.00 -> cap 10.00
    expect(e.savingDh).toBe(1000);
  });
  it('percentage below the cap is not raised to the cap', () => {
    expect(evaluate(p({ benefit: { type: 'percent', pct: 10, capDh: 1000 } }), ctx()).savingDh).toBe(400);
  });
  it('fixed discount', () => {
    expect(evaluate(p({ benefit: { type: 'fixed', dh: 1000 } }), ctx()).savingDh).toBe(1000);
  });
  it('fixed discount never exceeds what it applies to', () => {
    expect(evaluate(p({ benefit: { type: 'fixed', dh: 9000 } }), ctx()).savingDh).toBe(4000);
  });
  it('free delivery saves the whole delivery fee', () => {
    const e = evaluate(p({ benefit: { type: 'free_delivery' }, target: 'delivery' }), ctx());
    expect(e.savingDh).toBe(900);
  });
  it('service waiver saves the service fee', () => {
    const e = evaluate(p({ benefit: { type: 'service_waiver' }, target: 'service' }), ctx());
    expect(e.savingDh).toBe(200);
  });
  it('sale promotions are never vouchers', () => {
    const e = evaluate(p({ kind: 'sale', benefit: { type: 'sale_price' } }), ctx());
    expect(e.eligible).toBe(false);
    expect(e.savingDh).toBe(0);
  });
});

describe('minimum spend', () => {
  const minSpend = p({ conditions: { minSpendDh: 5000, expiry: { relHours: 48 } } });
  it('is met at exactly the minimum', () => {
    const e = evaluate(p({ conditions: { minSpendDh: 4000, expiry: { relHours: 48 } } }), ctx());
    expect(e.eligible).toBe(true);
  });
  it('fails below the minimum and says how much to add (rejection case)', () => {
    const e = evaluate(minSpend, ctx()); // 40.00 vs 50.00
    expect(e.eligible).toBe(false);
    expect(e.savingDh).toBe(0);
    expect(e.reason).toContain('Add QAR 10.00 more');
    expect(cond(e, 'minSpend')?.status).toBe('failed');
  });
  it('unlocks when the basket grows', () => {
    expect(evaluate(minSpend, ctx({ qty: 3 })).eligible).toBe(true);
  });
});

describe('expiry', () => {
  it('fails when expired and says when (rejection case)', () => {
    const e = evaluate(p({ conditions: { expiry: { relHours: -20 } } }), ctx());
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('Expired 20h ago');
  });
  it('is valid until the expiry instant, then expired', () => {
    const pr = p({ conditions: { expiry: { relHours: 5 } } });
    expect(evaluate(pr, ctx({ nowMs: NOW + 5 * HOUR - 1 })).eligible).toBe(true);
    expect(evaluate(pr, ctx({ nowMs: NOW + 5 * HOUR })).eligible).toBe(false);
  });
});

describe('scope', () => {
  it('rejects the wrong scenario', () => {
    const e = evaluate(p({ conditions: { scenarios: ['grocery'], expiry: { relHours: 48 } } }), ctx());
    expect(e.eligible).toBe(false);
    expect(e.reason).toBe('Only for Groceries');
  });
  it('rejects the wrong merchant and accepts the right one', () => {
    const wrong = p({ conditions: { merchantIds: ['someone-else'], expiry: { relHours: 48 } } });
    const right = p({ conditions: { merchantIds: ['cafe'], expiry: { relHours: 48 } } });
    expect(evaluate(wrong, ctx()).eligible).toBe(false);
    expect(evaluate(right, ctx()).eligible).toBe(true);
  });
  it('rejects a promotion from another platform', () => {
    const e = evaluate(p({ platformId: 'snoonu' }), ctx());
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('Only valid on');
  });
  it('category promotions count only matching items', () => {
    const basket: Basket = {
      ...fixtureBasket,
      lines: [{ productId: 'cafe-burger', qty: 1 }, { productId: 'cafe-cola', qty: 2 }], // 20.00 burgers, 10.00 drinks
    };
    const drinks = p({
      benefit: { type: 'percent', pct: 50 },
      conditions: { categories: ['drinks'], expiry: { relHours: 48 } },
    });
    const e = evaluate(drinks, ctx({ basket }));
    expect(e.eligible).toBe(true);
    expect(e.savingDh).toBe(500); // 50% of 10.00 only
  });
  it('category minimum spend counts only eligible items', () => {
    const basket: Basket = {
      ...fixtureBasket,
      lines: [{ productId: 'cafe-burger', qty: 1 }, { productId: 'cafe-cola', qty: 2 }],
    };
    const drinks = p({ conditions: { categories: ['drinks'], minSpendDh: 1500, expiry: { relHours: 48 } } });
    const e = evaluate(drinks, ctx({ basket })); // 10.00 of drinks < 15.00 even though the basket is 30.00
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('Add QAR 5.00 more');
  });
  it('fails when no item matches the category (rejection case)', () => {
    const e = evaluate(p({ conditions: { categories: ['skincare'], expiry: { relHours: 48 } } }), ctx());
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('No skincare items');
  });
});

describe('payment (channel, issuer, network are checked separately)', () => {
  const dukhanOnly = p({
    conditions: { channels: ['card'], issuers: ['dukhan'], networks: ['visa'], expiry: { relHours: 48 } },
  });
  it('accepts the right bank, network and channel', () => {
    const e = evaluate(dukhanOnly, ctx({ profile: { channel: 'card', issuer: 'dukhan', network: 'visa' } }));
    expect(e.eligible).toBe(true);
    expect(cond(e, 'issuer')?.status).toBe('assumed');
  });
  it('rejects the wrong bank and names it (rejection case)', () => {
    const e = evaluate(dukhanOnly, ctx({ profile: { channel: 'card', issuer: 'other', network: 'visa' } }));
    expect(e.eligible).toBe(false);
    expect(e.reason).toBe('Needs a Dukhan Bank card: you selected Other bank');
    expect(cond(e, 'issuer')?.status).toBe('failed_profile');
  });
  it('rejects the wrong network even with the right bank', () => {
    const e = evaluate(dukhanOnly, ctx({ profile: { channel: 'card', issuer: 'dukhan', network: 'mastercard' } }));
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('Needs a Visa card');
  });
  it('rejects Apple Pay when the channel is card only', () => {
    const e = evaluate(dukhanOnly, ctx({ profile: { channel: 'apple_pay', issuer: 'dukhan', network: 'visa' } }));
    expect(e.eligible).toBe(false);
    expect(e.reason).toContain('Not valid with Apple Pay');
  });
  it('cash fails bank and network requirements', () => {
    const noChannel = p({ conditions: { issuers: ['dukhan'], networks: ['visa'], expiry: { relHours: 48 } } });
    const e = evaluate(noChannel, ctx({ profile: { channel: 'cash', issuer: 'dukhan', network: 'visa' } }));
    expect(e.eligible).toBe(false);
    expect(cond(e, 'issuer')?.status).toBe('failed_profile');
    expect(cond(e, 'network')?.status).toBe('failed_profile');
  });
  it('a promotion with no payment limits accepts any payment', () => {
    expect(evaluate(p(), ctx({ profile: { channel: 'cash' } })).eligible).toBe(true);
  });
});

describe('membership and first order', () => {
  const member = p({ conditions: { membership: 'talabat_pro', expiry: { relHours: 48 } } });
  it('needs the membership (rejection case) and accepts it when selected', () => {
    const no = evaluate(member, ctx());
    expect(no.eligible).toBe(false);
    expect(no.reason).toContain('talabat pro');
    expect(evaluate(member, ctx({ profile: { memberships: ['talabat_pro'] } })).eligible).toBe(true);
  });
  it('a different membership does not count', () => {
    expect(evaluate(member, ctx({ profile: { memberships: ['snoonu_plus'] } })).eligible).toBe(false);
  });
  const first = p({ conditions: { firstOrder: true, expiry: { relHours: 48 } } });
  it('first-order promotions need a new customer on that platform (rejection case)', () => {
    expect(evaluate(first, ctx()).eligible).toBe(false);
    expect(evaluate(first, ctx({ profile: { firstOrderOn: ['snoonu'] } })).eligible).toBe(false); // wrong platform
    expect(evaluate(first, ctx({ profile: { firstOrderOn: ['talabat'] } })).eligible).toBe(true);
  });
});

describe('verify in app', () => {
  it('is shown but does not block eligibility', () => {
    const e = evaluate(p({ verifyInApp: ['Per-customer usage limit'] }), ctx());
    expect(e.eligible).toBe(true);
    const verify = e.conditions.filter((c) => c.status === 'verify');
    expect(verify).toHaveLength(1);
    expect(verify[0].message).toBe('Per-customer usage limit');
  });
});

describe('reason', () => {
  it('reports the first failing condition', () => {
    const e = evaluate(p({ conditions: { minSpendDh: 9999, membership: 'talabat_pro', expiry: { relHours: 48 } } }), ctx());
    expect(e.reason).toContain('Add QAR');
  });
  it('reports the saving when applied', () => {
    expect(evaluate(p({ benefit: { type: 'fixed', dh: 1000 } }), ctx()).reason).toBe('Applied: -QAR 10.00');
  });
});
