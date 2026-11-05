import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SAVED_IDS } from '../../data/defaults';
import { initialState, MAX_QTY, useAppStore } from '../useAppStore';

const s = () => useAppStore.getState();

beforeEach(() => useAppStore.setState(initialState(1000)));

describe('basket', () => {
  it('adds an item with quantity 1 and increases it on repeat adds', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    expect(s().baskets.food.lines).toEqual([{ productId: 'jb-cj-2pc', qty: 2 }]);
    expect(s().baskets.food.merchantId).toBe('jollibee');
  });
  it('updates quantity with setQty', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().setQty('food', 'jb-cj-2pc', 5);
    expect(s().baskets.food.lines[0].qty).toBe(5);
  });
  it('removes a line when the quantity reaches 0 (and ignores negatives)', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().setQty('food', 'jb-cj-2pc', 0);
    expect(s().baskets.food.lines).toEqual([]);
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().setQty('food', 'jb-cj-2pc', -3);
    expect(s().baskets.food.lines).toEqual([]);
  });
  it('caps the quantity at the maximum (rejection case)', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().setQty('food', 'jb-cj-2pc', 999);
    expect(s().baskets.food.lines[0].qty).toBe(MAX_QTY);
    for (let i = 0; i < 5; i++) s().addItem('food', 'jb-cj-2pc', 'jollibee');
    expect(s().baskets.food.lines[0].qty).toBe(MAX_QTY);
  });
  it('startBasket replaces the old restaurant basket', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().startBasket('food', 'mcdonalds');
    expect(s().baskets.food).toEqual({ scenario: 'food', merchantId: 'mcdonalds', lines: [] });
  });
  it('an emptied basket can switch restaurant by adding', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().setQty('food', 'jb-cj-2pc', 0);
    s().addItem('food', 'mcd-bigmac', 'mcdonalds');
    expect(s().baskets.food.merchantId).toBe('mcdonalds');
  });
  it('keeps the three scenario baskets separate', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().addItem('grocery', 'gr-tide-3kg');
    expect(s().baskets.food.lines).toHaveLength(1);
    expect(s().baskets.grocery.lines).toEqual([{ productId: 'gr-tide-3kg', qty: 1 }]);
    expect(s().baskets.grocery.merchantId).toBeUndefined();
    s().clearBasket('grocery');
    expect(s().baskets.grocery.lines).toEqual([]);
    expect(s().baskets.food.lines).toHaveLength(1);
  });
});

describe('wallet, profile and reset', () => {
  it('starts with the default saved vouchers', () => {
    expect(s().wallet.savedIds).toEqual(DEFAULT_SAVED_IDS);
  });
  it('saves and unsaves a seed voucher without duplicates', () => {
    s().saveSeed('T2');
    s().saveSeed('T2');
    expect(s().wallet.savedIds.filter((x) => x === 'T2')).toHaveLength(1);
    s().unsaveSeed('T2');
    expect(s().wallet.savedIds).not.toContain('T2');
  });
  it('updates the profile partially', () => {
    s().setProfile({ issuer: 'dukhan' });
    expect(s().profile).toMatchObject({ channel: 'card', issuer: 'dukhan', network: 'visa' });
  });
  it('resetDemo restores everything and starts a new anchor', () => {
    s().addItem('food', 'jb-cj-2pc', 'jollibee');
    s().saveSeed('T2');
    s().setProfile({ issuer: 'dukhan' });
    s().setSortMode('fastest');
    const before = s().demoAnchor;
    s().resetDemo();
    expect(s().baskets.food.lines).toEqual([]);
    expect(s().wallet.savedIds).toEqual(DEFAULT_SAVED_IDS);
    expect(s().profile.issuer).toBe('other');
    expect(s().sortMode).toBe('price');
    expect(s().demoAnchor).not.toBe(before);
  });
});
