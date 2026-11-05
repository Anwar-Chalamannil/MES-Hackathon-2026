import { describe, expect, it } from 'vitest';
import { promo } from '../../engine/__tests__/fixtures';
import { initialState, isValidPersisted } from '../useAppStore';

const good = () => JSON.parse(JSON.stringify(initialState(1000)));

describe('isValidPersisted', () => {
  it('accepts a normal saved state, with and without a custom voucher', () => {
    expect(isValidPersisted(good())).toBe(true);
    const withCustom = good();
    withCustom.wallet.custom = [promo({ id: 'U1', platformId: 'talabat', origin: 'user' })];
    expect(isValidPersisted(withCustom)).toBe(true);
  });
  it('accepts baskets with items', () => {
    const s = good();
    s.baskets.food = { scenario: 'food', merchantId: 'jollibee', lines: [{ productId: 'jb-cj-2pc', qty: 3 }] };
    expect(isValidPersisted(s)).toBe(true);
  });

  it.each([
    ['null', null],
    ['a string', 'oops'],
    ['an empty object', {}],
    ['an array', []],
  ])('rejects %s (rejection case)', (_name, value) => {
    expect(isValidPersisted(value)).toBe(false);
  });

  const breakers: [string, (s: ReturnType<typeof good>) => void][] = [
    ['a missing basket', (s) => delete s.baskets.grocery],
    ['a basket for the wrong scenario', (s) => { s.baskets.food.scenario = 'grocery'; }],
    ['lines that are not a list', (s) => { s.baskets.food.lines = 'x'; }],
    ['a quantity of 0', (s) => { s.baskets.food.lines = [{ productId: 'a', qty: 0 }]; }],
    ['a quantity over the maximum', (s) => { s.baskets.food.lines = [{ productId: 'a', qty: 999 }]; }],
    ['a fractional quantity', (s) => { s.baskets.food.lines = [{ productId: 'a', qty: 1.5 }]; }],
    ['an unknown active scenario', (s) => { s.activeScenario = 'tv'; }],
    ['saved ids that are not text', (s) => { s.wallet.savedIds = [1, 2]; }],
    ['a missing wallet', (s) => delete s.wallet],
    ['a custom voucher without a benefit', (s) => { s.wallet.custom = [{ id: 'U', platformId: 'talabat', name: 'x', origin: 'user', kind: 'code' }]; }],
    ['a custom voucher of an unsafe kind', (s) => { s.wallet.custom = [{ ...promo({ id: 'U', platformId: 'talabat' }), origin: 'user', kind: 'membership' }]; }],
    ['a payment channel that does not exist', (s) => { s.profile.channel = 'bitcoin'; }],
    ['memberships that are not a list', (s) => { s.profile.memberships = 'talabat_pro'; }],
    ['an unknown sort mode', (s) => { s.sortMode = 'best'; }],
    ['a non-numeric anchor', (s) => { s.demoAnchor = 'yesterday'; }],
    ['an infinite anchor', (s) => { s.demoAnchor = Infinity; }],
  ];
  it.each(breakers)('rejects %s', (_name, damage) => {
    const s = good();
    damage(s);
    expect(isValidPersisted(s)).toBe(false);
  });
});
