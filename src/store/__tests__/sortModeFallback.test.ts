import { beforeEach, describe, expect, it } from 'vitest';
import { toUiSortMode, UI_SORT_MODES } from '../../lib/sortModes';
import { initialState, migratePersisted, useAppStore } from '../useAppStore';

const s = () => useAppStore.getState();
beforeEach(() => useAppStore.setState(initialState(1000)));

/** Saved data from before "Biggest discount" was removed. */
function oldData(sortMode: string) {
  const { readNotificationIds, ...rest } = initialState(5000);
  return JSON.parse(JSON.stringify({
    ...rest,
    baskets: { ...rest.baskets, food: { scenario: 'food', merchantId: 'jollibee', lines: [{ productId: 'jb-cj-2pc', qty: 2 }] } },
    wallet: { savedIds: ['T3', 'S2'], custom: [] },
    sortMode,
    readNotificationIds,
  }));
}

describe('Biggest discount is gone from the UI', () => {
  it('offers exactly two sort modes', () => {
    expect([...UI_SORT_MODES]).toEqual(['price', 'fastest']);
    expect(toUiSortMode('discount')).toBe('price');
    expect(toUiSortMode('fastest')).toBe('fastest');
    expect(toUiSortMode(undefined)).toBe('price');
  });

  it('a saved "discount" preference loads as Best price and keeps baskets, wallet and read alerts', () => {
    const { merge } = useAppStore.persist.getOptions();
    const saved = { ...oldData('discount'), readNotificationIds: ['T3@24h'] };
    const out = merge!(saved, s());
    expect(out.sortMode).toBe('price');
    expect(out.baskets.food.lines).toEqual([{ productId: 'jb-cj-2pc', qty: 2 }]);
    expect(out.wallet.savedIds).toEqual(['T3', 'S2']);
    expect(out.readNotificationIds).toEqual(['T3@24h']);
  });

  it('a saved "fastest" preference is kept', () => {
    const { merge } = useAppStore.persist.getOptions();
    expect(merge!(oldData('fastest'), s()).sortMode).toBe('fastest');
  });

  it('version 1 data with "discount" migrates to Best price without a reset', () => {
    const { readNotificationIds: _drop, ...v1 } = oldData('discount');
    const migrated = migratePersisted(v1, 1);
    expect(migrated.sortMode).toBe('price');
    expect(migrated.wallet.savedIds).toEqual(['T3', 'S2']);
  });

  it('setSortMode stores only the two UI modes', () => {
    s().setSortMode('fastest');
    expect(s().sortMode).toBe('fastest');
    // @ts-expect-error: the UI type does not allow "discount"
    s().setSortMode('discount');
    expect(s().sortMode).toBe('price');
  });
});
