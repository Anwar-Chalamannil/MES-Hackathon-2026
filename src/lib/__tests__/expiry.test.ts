import { describe, expect, it } from 'vitest';
import { filterAndSort, type Dated } from '../expiry';

const HOUR = 3_600_000;
const NOW = Date.UTC(2026, 10, 5, 9, 0);
const at = (name: string, hours: number): Dated<string> => ({ item: name, expiryMs: NOW + hours * HOUR });
const names = (xs: Dated<string>[]) => xs.map((x) => x.item);

const ITEMS = [
  at('in-6-days', 144), at('in-5h', 5), at('in-2-days', 48), at('expired-20h-ago', -20),
  at('in-24h-exactly', 24), at('expired-3-days-ago', -72), at('in-30-days', 720), at('in-3-days-exactly', 72), at('in-7-days-exactly', 168),
];

describe('filterAndSort', () => {
  it('all: active vouchers soonest first, then expired, most recently expired first', () => {
    expect(names(filterAndSort(ITEMS, 'all', NOW))).toEqual([
      'in-5h', 'in-24h-exactly', 'in-2-days', 'in-3-days-exactly', 'in-6-days', 'in-7-days-exactly', 'in-30-days',
      'expired-20h-ago', 'expired-3-days-ago',
    ]);
  });
  it('within 24 hours includes exactly 24h and excludes expired', () => {
    expect(names(filterAndSort(ITEMS, '24h', NOW))).toEqual(['in-5h', 'in-24h-exactly']);
  });
  it('within 3 days is cumulative and includes exactly 72h', () => {
    expect(names(filterAndSort(ITEMS, '3d', NOW))).toEqual(['in-5h', 'in-24h-exactly', 'in-2-days', 'in-3-days-exactly']);
  });
  it('within 7 days is cumulative and includes exactly 168h but not later (rejection case)', () => {
    const r = names(filterAndSort(ITEMS, '7d', NOW));
    expect(r).toContain('in-7-days-exactly');
    expect(r).not.toContain('in-30-days');
    expect(r).not.toContain('expired-20h-ago');
  });
  it('expired shows only expired ones, most recent first', () => {
    expect(names(filterAndSort(ITEMS, 'expired', NOW))).toEqual(['expired-20h-ago', 'expired-3-days-ago']);
  });
  it('a voucher expiring this very moment counts as expired', () => {
    expect(names(filterAndSort([at('now', 0)], 'expired', NOW))).toEqual(['now']);
    expect(filterAndSort([at('now', 0)], '24h', NOW)).toEqual([]);
  });
  it('does not change the input array', () => {
    const copy = [...ITEMS];
    filterAndSort(ITEMS, 'all', NOW);
    expect(ITEMS).toEqual(copy);
  });
});
