import { beforeEach, describe, expect, it } from 'vitest';
import { initialState, isValidPersisted, migratePersisted, STORE_VERSION, useAppStore } from '../useAppStore';

const s = () => useAppStore.getState();
beforeEach(() => useAppStore.setState(initialState(1000)));

/** What a version 1 phone has saved: no readNotificationIds. */
function v1Data() {
  const { readNotificationIds: _drop, ...rest } = initialState(5000);
  return JSON.parse(JSON.stringify({
    ...rest,
    baskets: { ...rest.baskets, food: { scenario: 'food', merchantId: 'jollibee', lines: [{ productId: 'jb-cj-2pc', qty: 2 }] } },
    wallet: { savedIds: ['T3', 'S2'], custom: [] },
    sortMode: 'fastest',
  }));
}

describe('store version 2 and the v1 migration', () => {
  it('is version 2', () => {
    expect(STORE_VERSION).toBe(2);
    expect(useAppStore.persist.getOptions().version).toBe(2);
  });

  it('keeps baskets, wallet, profile, sort mode and anchor when migrating v1, and adds an empty read list', () => {
    const old = v1Data();
    const migrated = migratePersisted(old, 1);
    expect(migrated.baskets.food.lines).toEqual([{ productId: 'jb-cj-2pc', qty: 2 }]);
    expect(migrated.wallet.savedIds).toEqual(['T3', 'S2']);
    expect(migrated.sortMode).toBe('fastest');
    expect(migrated.demoAnchor).toBe(5000);
    expect(migrated.profile).toEqual(old.profile);
    expect(migrated.readNotificationIds).toEqual([]);
  });

  it('starts fresh when v1 data is damaged or the version is unknown (rejection case)', () => {
    const bad = v1Data();
    bad.sortMode = 'nope';
    expect(migratePersisted(bad, 1).wallet.savedIds).not.toEqual(['T3', 'S2']);
    expect(migratePersisted(v1Data(), 99).baskets.food.lines).toEqual([]);
    expect(migratePersisted(null, 1).readNotificationIds).toEqual([]);
  });

  it('the store merge accepts v1 shaped data (no read list) and v2 data with a read list', () => {
    const { merge } = useAppStore.persist.getOptions();
    const cur = s();
    expect(merge!(v1Data(), cur).readNotificationIds).toEqual([]);
    const v2 = { ...v1Data(), readNotificationIds: ['T3@24h'] };
    expect(merge!(v2, cur).readNotificationIds).toEqual(['T3@24h']);
    expect(merge!(v2, cur).wallet.savedIds).toEqual(['T3', 'S2']);
  });

  it('isValidPersisted accepts v1 and v2 and rejects a read list that is not text (rejection case)', () => {
    expect(isValidPersisted(v1Data())).toBe(true);
    expect(isValidPersisted({ ...v1Data(), readNotificationIds: ['a@7d'] })).toBe(true);
    expect(isValidPersisted({ ...v1Data(), readNotificationIds: [1, 2] })).toBe(false);
    expect(isValidPersisted({ ...v1Data(), readNotificationIds: 'a' })).toBe(false);
  });

  it('a damaged read list makes the merge ignore the saved data', () => {
    const { merge } = useAppStore.persist.getOptions();
    const out = merge!({ ...v1Data(), readNotificationIds: [1] }, s());
    expect(out.wallet.savedIds).toEqual(initialState().wallet.savedIds);
  });
});

describe('read notification actions', () => {
  it('marks one as read once (no duplicates)', () => {
    s().markNotificationRead('T3@24h');
    s().markNotificationRead('T3@24h');
    expect(s().readNotificationIds).toEqual(['T3@24h']);
  });
  it('marks several as read and skips ones already read', () => {
    s().markNotificationRead('a@7d');
    s().markAllNotificationsRead(['a@7d', 'b@3d', 'c@24h']);
    expect(s().readNotificationIds).toEqual(['a@7d', 'b@3d', 'c@24h']);
  });
  it('prunes ids that are no longer current', () => {
    s().markAllNotificationsRead(['a@7d', 'a@3d', 'b@24h']);
    s().pruneReadNotifications(['a@3d', 'b@24h', 'z@7d']);
    expect(s().readNotificationIds).toEqual(['a@3d', 'b@24h']);
  });
  it('Reset demo clears the read list', () => {
    s().markNotificationRead('a@7d');
    s().resetDemo();
    expect(s().readNotificationIds).toEqual([]);
  });
});
