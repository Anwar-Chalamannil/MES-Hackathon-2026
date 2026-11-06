import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_CARDS } from '../../data/cardPresets';
import { initialState, migratePersisted, sanitizeCards, useAppStore } from '../useAppStore';

const s = () => useAppStore.getState();
beforeEach(() => useAppStore.setState(initialState(1000)));

/** What a version 2 phone has saved: read alerts but no cards. */
function v2Data() {
  const { cards: _c, cardSetup: _s, ...rest } = initialState(5000);
  return JSON.parse(JSON.stringify({
    ...rest,
    baskets: { ...rest.baskets, food: { scenario: 'food', merchantId: 'jollibee', lines: [{ productId: 'jb-cj-2pc', qty: 2 }] } },
    wallet: { savedIds: ['T3', 'S2'], custom: [] },
    sortMode: 'discount',
    readNotificationIds: ['T3@24h'],
  }));
}

describe('cards in the store (version 3)', () => {
  it('starts with no cards and onboarding pending', () => {
    expect(s().cards).toEqual([]);
    expect(s().cardSetup).toBe('pending');
  });

  it('v2 data migrates: baskets, wallet and read alerts kept, discount sort falls back, onboarding pending', () => {
    const m = migratePersisted(v2Data(), 2);
    expect(m.baskets.food.lines).toEqual([{ productId: 'jb-cj-2pc', qty: 2 }]);
    expect(m.wallet.savedIds).toEqual(['T3', 'S2']);
    expect(m.readNotificationIds).toEqual(['T3@24h']);
    expect(m.sortMode).toBe('price');
    expect(m.cards).toEqual([]);
    expect(m.cardSetup).toBe('pending');
  });

  it('the merge defaults missing cards and keeps saved ones', () => {
    const { merge } = useAppStore.persist.getOptions();
    expect(merge!(v2Data(), s()).cards).toEqual([]);
    const withCards = { ...v2Data(), cards: [{ id: 'c1', presetId: 'dukhan-visa-signature' }], cardSetup: 'done' };
    const out = merge!(withCards, s());
    expect(out.cards).toEqual([{ id: 'c1', presetId: 'dukhan-visa-signature' }]);
    expect(out.cardSetup).toBe('done');
    expect(out.wallet.savedIds).toEqual(['T3', 'S2']);
  });

  it('a broken card entry is dropped without losing the others or resetting anything', () => {
    const { merge } = useAppStore.persist.getOptions();
    const messy = { ...v2Data(), cards: [{ id: 'c1', presetId: 'dukhan-visa-signature' }, 5, { id: 2 }, null, { id: 'c1b', presetId: 'dukhan-visa-signature' }], cardSetup: 'banana' };
    const out = merge!(messy, s());
    expect(out.cards).toEqual([{ id: 'c1', presetId: 'dukhan-visa-signature' }]);
    expect(out.cardSetup).toBe('pending');
    expect(out.baskets.food.lines).toHaveLength(1);
  });

  it('a card whose preset was removed is kept (Settings explains it); only the cap and duplicates are enforced', () => {
    expect(sanitizeCards([{ id: 'a', presetId: 'gone' }])).toEqual([{ id: 'a', presetId: 'gone' }]);
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `i${i}`, presetId: `p${i}` }));
    expect(sanitizeCards(many)).toHaveLength(MAX_CARDS);
    expect(sanitizeCards('nope')).toEqual([]);
  });

  it('add, edit, remove and set cards; no duplicates', () => {
    s().addCard('dukhan-visa-signature');
    s().addCard('dukhan-visa-signature');
    s().addCard('qnb-life-rewards-visa-infinite');
    expect(s().cards.map((c) => c.presetId)).toEqual(['dukhan-visa-signature', 'qnb-life-rewards-visa-infinite']);
    const first = s().cards[0].id;
    s().updateCard(first, 'dukhan-visa-infinite');
    expect(s().cards[0].presetId).toBe('dukhan-visa-infinite');
    s().updateCard(first, 'qnb-life-rewards-visa-infinite'); // already added: ignored
    expect(s().cards[0].presetId).toBe('dukhan-visa-infinite');
    s().removeCard(first);
    expect(s().cards.map((c) => c.presetId)).toEqual(['qnb-life-rewards-visa-infinite']);
    s().setCards(['dukhan-visa-platinum', 'qnb-life-rewards-visa-infinite', 'dukhan-visa-platinum']);
    expect(s().cards.map((c) => c.presetId)).toEqual(['dukhan-visa-platinum', 'qnb-life-rewards-visa-infinite']);
  });

  it('never stores anything but a preset pointer', () => {
    s().addCard('dukhan-visa-signature');
    expect(Object.keys(s().cards[0]).sort()).toEqual(['id', 'presetId']);
  });

  it('Reset demo clears the cards and brings onboarding back', () => {
    s().addCard('dukhan-visa-signature');
    s().setCardSetup('done');
    s().resetDemo();
    expect(s().cards).toEqual([]);
    expect(s().cardSetup).toBe('pending');
  });
});
