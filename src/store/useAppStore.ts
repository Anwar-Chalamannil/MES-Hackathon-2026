import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { DEFAULT_PROFILE, DEFAULT_SAVED_IDS } from '../data/defaults';
import type { Basket, PersistedState, Profile, Scenario, SortMode } from '../engine/types';

export const STORAGE_KEY = 'basketwise';
export const MAX_QTY = 20;

const emptyBasket = (scenario: Scenario): Basket => ({ scenario, lines: [] });

/** Fresh state. demoAnchor is the moment seed promotion countdowns are measured from. */
export function initialState(now: number = Date.now()): PersistedState {
  return {
    baskets: { food: emptyBasket('food'), grocery: emptyBasket('grocery'), pharmacy: emptyBasket('pharmacy') },
    activeScenario: 'food',
    wallet: { savedIds: [...DEFAULT_SAVED_IDS], custom: [] },
    profile: { ...DEFAULT_PROFILE, memberships: [...DEFAULT_PROFILE.memberships], firstOrderOn: [...DEFAULT_PROFILE.firstOrderOn] },
    sortMode: 'price',
    demoAnchor: now,
  };
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
  resetDemo: () => void;
}

export type AppState = PersistedState & Actions;

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

      resetDemo: () => set(initialState()),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(getStorage),
      // A different stored version means an old data shape: start fresh instead of crashing.
      migrate: () => initialState(),
      partialize: (s): PersistedState => ({
        baskets: s.baskets,
        activeScenario: s.activeScenario,
        wallet: s.wallet,
        profile: s.profile,
        sortMode: s.sortMode,
        demoAnchor: s.demoAnchor,
      }),
    },
  ),
);
