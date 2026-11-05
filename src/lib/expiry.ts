import { expiryBucket } from '../engine/time';

export type ExpiryFilter = 'all' | '24h' | '3d' | '7d' | 'expired';

export const EXPIRY_FILTERS: { value: ExpiryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '24h', label: 'Within 24 hours' },
  { value: '3d', label: 'Within 3 days' },
  { value: '7d', label: 'Within 7 days' },
  { value: 'expired', label: 'Expired' },
];

export interface Dated<T> {
  item: T;
  expiryMs: number;
}

/**
 * "Within 3 days" includes anything within 24 hours (the windows are cumulative) but never expired items.
 * Sorted by nearest expiry: active vouchers soonest first, then expired ones, most recently expired first.
 */
export function filterAndSort<T>(items: Dated<T>[], filter: ExpiryFilter, nowMs: number): Dated<T>[] {
  const keep = (x: Dated<T>) => {
    const b = expiryBucket(x.expiryMs, nowMs);
    switch (filter) {
      case 'all': return true;
      case '24h': return b === '24h';
      case '3d': return b === '24h' || b === '3d';
      case '7d': return b === '24h' || b === '3d' || b === '7d';
      case 'expired': return b === 'expired';
    }
  };
  const active = items.filter((x) => keep(x) && x.expiryMs > nowMs).sort((a, b) => a.expiryMs - b.expiryMs);
  const expired = items.filter((x) => keep(x) && x.expiryMs <= nowMs).sort((a, b) => b.expiryMs - a.expiryMs);
  return [...active, ...expired];
}
