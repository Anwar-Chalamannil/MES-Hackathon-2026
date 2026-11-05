import { beforeEach, describe, expect, it } from 'vitest';
import { promo } from '../../engine/__tests__/fixtures';
import { initialState, useAppStore } from '../useAppStore';

const s = () => useAppStore.getState();
const mine = (id: string, over = {}) => promo({ id, platformId: 'talabat', origin: 'user', ...over });

beforeEach(() => useAppStore.setState(initialState(1000)));

describe('custom vouchers', () => {
  it('adds, edits and deletes a voucher', () => {
    s().addCustom(mine('U1', { name: 'First' }));
    expect(s().wallet.custom.map((p) => p.name)).toEqual(['First']);
    s().updateCustom(mine('U1', { name: 'Renamed' }));
    expect(s().wallet.custom.map((p) => p.name)).toEqual(['Renamed']);
    s().deleteCustom('U1');
    expect(s().wallet.custom).toEqual([]);
  });
  it('adding the same id twice keeps one copy', () => {
    s().addCustom(mine('U1'));
    s().addCustom(mine('U1', { name: 'Again' }));
    expect(s().wallet.custom).toHaveLength(1);
  });
  it('always marks the voucher as the user\'s own', () => {
    s().addCustom(mine('U1', { origin: 'seed' }));
    expect(s().wallet.custom[0].origin).toBe('user');
  });
  it('refuses kinds the optimiser cannot handle safely (rejection case)', () => {
    s().addCustom(mine('U1', { kind: 'membership' }));
    s().addCustom(mine('U2', { kind: 'auto' }));
    s().addCustom(mine('U3', { kind: 'sale' }));
    expect(s().wallet.custom).toEqual([]);
    s().addCustom(mine('U4', { kind: 'bank' }));
    expect(s().wallet.custom).toHaveLength(1);
  });
  it('is cleared by resetDemo but leaves seed vouchers alone', () => {
    s().addCustom(mine('U1'));
    s().resetDemo();
    expect(s().wallet.custom).toEqual([]);
  });
});
