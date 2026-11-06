import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { DEFAULT_PROFILE, DEFAULT_SAVED_IDS } from '../data/defaults';
import type { Basket, PersistedState, Profile, Promotion, Scenario, SortMode } from '../engine/types';

export const STORAGE_KEY = 'basketwise';
export const MAX_QTY = 20;
export const STORE_VERSION = 2;

/** Version 2 adds the ids of in-app notifications the person has already read. */
export type StoredState = PersistedState & { readNotificationIds: string[] };

const emptyBasket = (scenario: Scenario): Basket => ({ scenario, lines: [] });

/** Fresh state. demoAnchor is the moment seed promotion countdowns are measured from. */
export function initialState(now: number = Date.now()): StoredState {
  return {
    baskets: { food: emptyBasket('food'), grocery: emptyBasket('grocery'), pharmacy: emptyBasket('pharmacy') },
    activeScenario: 'food',
    wallet: { savedIds: [...DEFAULT_SAVED_IDS], custom: [] },
    profile: { ...DEFAULT_PROFILE, memberships: [...DEFAULT_PROFILE.memberships], firstOrderOn: [...DEFAULT_PROFILE.firstOrderOn] },
    sortMode: 'price',
    demoAnchor: now,
    readNotificationIds: [],
  };
}

const SCENARIOS: Scenario[] = ['food', 'grocery', 'pharmacy'];
const isStr = (x: unknown): x is string => typeof x === 'string';
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const oneOf = (x: unknown, list: readonly string[]) => isStr(x) && list.includes(x);
const strArray = (x: unknown) => Array.isArray(x) && x.every(isStr);

function validBasket(b: unknown, scenario: Scenario): boolean {
  return (
    isObj(b) && b.scenario === scenario && Array.isArray(b.lines) &&
    b.lines.every((l) => isObj(l) && isStr(l.productId) && Number.isInteger(l.qty) && (l.qty as number) >= 1 && (l.qty as number) <= MAX_QTY)
  );
}
function validCustom(c: unknown): boolean {
  if (!isObj(c)) return false;
  const expiry = isObj(c.conditions) ? c.conditions.expiry : undefined;
  return (
    isStr(c.id) && isStr(c.platformId) && isStr(c.name) && c.origin === 'user' && oneOf(c.kind, ['code', 'bank']) &&
    isObj(c.benefit) && isStr(c.benefit.type) && isObj(c.stacking) &&
    isObj(expiry) && (typeof expiry.relHours === 'number' || isStr(expiry.iso)) && strArray(c.verifyInApp)
  );
}

/**
 * Saved data from an older version, a bug or a person poking at storage can have the wrong shape.
 * Anything that fails these checks is ignored and the app starts fresh instead of crashing.
 */
export function isValidPersisted(p: unknown): p is PersistedState {
  // Version 1 had no readNotificationIds; if present (version 2) it must be a list of text.
  if (isObj(p) && 'readNotificationIds' in p && !strArray(p.readNotificationIds)) return false;
  if (!isObj(p) || !isObj(p.baskets) || !isObj(p.wallet) || !isObj(p.profile)) return false;
  const pr = p.profile;
  return (
    SCENARIOS.every((s) => validBasket((p.baskets as Record<string, unknown>)[s], s)) &&
    oneOf(p.activeScenario, SCENARIOS) &&
    strArray(p.wallet.savedIds) && Array.isArray(p.wallet.custom) && p.wallet.custom.every(validCustom) &&
    oneOf(pr.channel, ['card', 'apple_pay', 'cash']) &&
    oneOf(pr.issuer, ['dukhan', 'qnb', 'lulu_cobrand', 'other']) &&
    oneOf(pr.network, ['visa', 'mastercard']) &&
    strArray(pr.memberships) && strArray(pr.firstOrderOn) &&
    oneOf(p.sortMode, ['price', 'fastest', 'discount']) &&
    typeof p.demoAnchor === 'number' && Number.isFinite(p.demoAnchor)
  );
}

/** Turns saved version 1 data into version 2. Anything unreadable starts fresh. */
export function migratePersisted(persisted: unknown, version: number): StoredState {
  if (version === 1 && isValidPersisted(persisted)) return { ...persisted, readNotificationIds: [] };
  return initialState();
}

interface Actions {
  /** Adds one of a product. For food, a basket belongs to one restaurant: the UI asks before replacing it. */
  addItem: (scenario: Scenario, productId: string, merchantId?: string) => void;
  /** Sets a quantity. 0 or less removes the line. Capped at MAX_QTY. */
  setQty: (scenario: Scenario, productId: string, qty: number) => void;
  clearBasket: (scenario: Scenario) => void;
  /** Empties the basket and sets its restaurant. */
  startBasket: (scenario: Scenario, merchantId?: string) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setSortMode: (mode: SortMode) => void;
  setActiveScenario: (scenario: Scenario) => void;
  /** Adds a seed voucher to the wallet / removes it. */
  saveSeed: (id: string) => void;
  unsaveSeed: (id: string) => void;
  /** Your own vouchers. Only codes and bank offers are allowed (the optimiser relies on that). */
  addCustom: (promo: Promotion) => void;
  updateCustom: (promo: Promotion) => void;
  deleteCustom: (id: string) => void;
  resetDemo: () => void;
  /** Notifications: ids look like `${promoId}@${stage}`. */
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  /** Forgets read ids that no longer match any current notification. */
  pruneReadNotifications: (currentIds: string[]) => void;
}

export type AppState = StoredState & Actions;

// localStorage can be missing or throw (private windows, blocked storage). Fall back to memory.
const memory = new Map<string, string>();
const memoryStorage: StateStorage = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};
function getStorage(): StateStorage {
  try {
    const ls = globalThis.localStorage;
    ls.setItem('__bw_test', '1');
    ls.removeItem('__bw_test');
    return ls;
  } catch {
    return memoryStorage;
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState(),

      addItem: (scenario, productId, merchantId) =>
        set((s) => {
          const b = s.baskets[scenario];
          const existing = b.lines.find((l) => l.productId === productId);
          const lines = existing
            ? b.lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l))
            : [...b.lines, { productId, qty: 1 }];
          const nextMerchant = scenario === 'food' ? (b.lines.length === 0 ? merchantId : (b.merchantId ?? merchantId)) : undefined;
          return {
            activeScenario: scenario,
            baskets: { ...s.baskets, [scenario]: { ...b, merchantId: nextMerchant, lines } },
          };
        }),

      setQty: (scenario, productId, qty) =>
        set((s) => {
          const b = s.baskets[scenario];
          const lines =
            qty <= 0
              ? b.lines.filter((l) => l.productId !== productId)
              : b.lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(MAX_QTY, Math.floor(qty)) } : l));
          return { baskets: { ...s.baskets, [scenario]: { ...b, lines } } };
        }),

      clearBasket: (scenario) =>
        set((s) => ({ baskets: { ...s.baskets, [scenario]: { scenario, lines: [] } } })),

      startBasket: (scenario, merchantId) =>
        set((s) => ({
          activeScenario: scenario,
          baskets: { ...s.baskets, [scenario]: { scenario, merchantId: scenario === 'food' ? merchantId : undefined, lines: [] } },
        })),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setSortMode: (sortMode) => set({ sortMode }),
      setActiveScenario: (activeScenario) => set({ activeScenario }),

      saveSeed: (id) =>
        set((s) => (s.wallet.savedIds.includes(id) ? s : { wallet: { ...s.wallet, savedIds: [...s.wallet.savedIds, id] } })),
      unsaveSeed: (id) =>
        set((s) => ({ wallet: { ...s.wallet, savedIds: s.wallet.savedIds.filter((x) => x !== id) } })),

      addCustom: (promo) =>
        set((s) =>
          promo.kind !== 'code' && promo.kind !== 'bank'
            ? s
            : { wallet: { ...s.wallet, custom: [...s.wallet.custom.filter((p) => p.id !== promo.id), { ...promo, origin: 'user' }] } },
        ),
      updateCustom: (promo) =>
        set((s) => ({
          wallet: { ...s.wallet, custom: s.wallet.custom.map((p) => (p.id === promo.id ? { ...promo, origin: 'user' } : p)) },
        })),
      deleteCustom: (id) =>
        set((s) => ({ wallet: { ...s.wallet, custom: s.wallet.custom.filter((p) => p.id !== id) } })),

      resetDemo: () => set(initialState()),

      markNotificationRead: (id) =>
        set((s) => (s.readNotificationIds.includes(id) ? s : { readNotificationIds: [...s.readNotificationIds, id] })),
      markAllNotificationsRead: (ids) =>
        set((s) => {
          const add = ids.filter((id) => !s.readNotificationIds.includes(id));
          return add.length === 0 ? s : { readNotificationIds: [...s.readNotificationIds, ...add] };
        }),
      pruneReadNotifications: (currentIds) =>
        set((s) => {
          const keep = s.readNotificationIds.filter((id) => currentIds.includes(id));
          return keep.length === s.readNotificationIds.length ? s : { readNotificationIds: keep };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(getStorage),
      // Version 1 data is carried over; any other shape starts fresh instead of crashing.
      migrate: (persisted, version) => migratePersisted(persisted, version),
      merge: (persisted, current) =>
        isValidPersisted(persisted)
          ? { ...current, ...persisted, readNotificationIds: (persisted as Partial<StoredState>).readNotificationIds ?? [] }
          : current,
      partialize: (s): StoredState => ({
        baskets: s.baskets,
        activeScenario: s.activeScenario,
        wallet: s.wallet,
        profile: s.profile,
        sortMode: s.sortMode,
        demoAnchor: s.demoAnchor,
        readNotificationIds: s.readNotificationIds,
      }),
    },
  ),
);
