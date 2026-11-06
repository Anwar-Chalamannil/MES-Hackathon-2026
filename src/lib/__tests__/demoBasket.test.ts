import { beforeEach, describe, expect, it } from 'vitest';
import { heroBasket, loadBasket, loadDemoBasket, wouldReplaceFood } from '../demoBasket';
import { initialState, useAppStore } from '../../store/useAppStore';

const s = () => useAppStore.getState();
beforeEach(() => useAppStore.setState(initialState(1000)));

describe('demo basket loader', () => {
  it('loads the Hero A basket with the right items and quantities', () => {
    expect(loadDemoBasket()).toBe('food');
    expect(s().baskets.food.merchantId).toBe('jollibee');
    expect(s().baskets.food.lines).toEqual([
      { productId: 'jb-cj-2pc', qty: 2 },
      { productId: 'jb-spaghetti', qty: 1 },
      { productId: 'jb-coke-reg', qty: 1 },
    ]);
    expect(s().activeScenario).toBe('food');
  });
  it('replaces whatever was in that basket, not adding to it', () => {
    s().addItem('food', 'jb-yumburger', 'jollibee');
    loadDemoBasket();
    expect(s().baskets.food.lines.map((l) => l.productId)).not.toContain('jb-yumburger');
  });
  it('leaves the other categories alone', () => {
    s().addItem('grocery', 'gr-almarai-milk-2l');
    loadDemoBasket();
    expect(s().baskets.grocery.lines).toHaveLength(1);
  });
  it('loads a grocery basket without a restaurant', () => {
    loadBasket({ scenario: 'grocery', lines: [{ productId: 'gr-almarai-milk-2l', qty: 3 }] });
    expect(s().baskets.grocery.lines).toEqual([{ productId: 'gr-almarai-milk-2l', qty: 3 }]);
    expect(s().baskets.grocery.merchantId).toBeUndefined();
  });
  it('asks first only when a different restaurant basket would be replaced', () => {
    const hero = heroBasket();
    expect(wouldReplaceFood(hero)).toBe(false); // empty basket
    s().addItem('food', 'mcd-bigmac', 'mcdonalds');
    expect(wouldReplaceFood(hero)).toBe(true);
    s().startBasket('food', 'jollibee');
    s().addItem('food', 'jb-yumburger', 'jollibee');
    expect(wouldReplaceFood(hero)).toBe(false); // same restaurant
  });
  it('a grocery basket never needs confirmation', () => {
    s().addItem('food', 'mcd-bigmac', 'mcdonalds');
    expect(wouldReplaceFood({ scenario: 'grocery', lines: [] })).toBe(false);
  });
});
