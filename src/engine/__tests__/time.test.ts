import { describe, expect, it } from 'vitest';
import { countdown, expiryBucket, formatQatar, resolveExpiry } from '../time';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const ANCHOR = Date.UTC(2026, 10, 5, 9, 0); // 12:00 Qatar

describe('resolveExpiry', () => {
  it('adds relHours to the anchor', () => {
    expect(resolveExpiry({ relHours: 5 }, ANCHOR)).toBe(ANCHOR + 5 * HOUR);
    expect(resolveExpiry({ relHours: -20 }, ANCHOR)).toBe(ANCHOR - 20 * HOUR);
  });
  it('parses absolute ISO dates with an offset', () => {
    expect(resolveExpiry({ iso: '2026-03-19T23:59:00+03:00' }, ANCHOR)).toBe(Date.UTC(2026, 2, 19, 20, 59));
  });
  it('rejects an invalid date instead of silently never expiring', () => {
    expect(() => resolveExpiry({ iso: 'not a date' }, ANCHOR)).toThrow();
  });
});

describe('countdown', () => {
  it('formats hours and minutes', () => {
    expect(countdown(ANCHOR + 5 * HOUR + 12 * 60_000, ANCHOR)).toEqual({ expired: false, label: '5h 12m' });
    expect(countdown(ANCHOR + 5 * HOUR, ANCHOR).label).toBe('5h');
    expect(countdown(ANCHOR + 45 * 60_000, ANCHOR).label).toBe('45m');
    expect(countdown(ANCHOR + 30_000, ANCHOR).label).toBe('less than 1m');
  });
  it('formats days', () => {
    expect(countdown(ANCHOR + 49 * HOUR, ANCHOR).label).toBe('2 days');
    expect(countdown(ANCHOR + 30 * HOUR, ANCHOR).label).toBe('1 day');
  });
  it('is expired at the expiry instant and after (rejection case)', () => {
    expect(countdown(ANCHOR, ANCHOR).expired).toBe(true);
    expect(countdown(ANCHOR - 1000, ANCHOR)).toEqual({ expired: true, label: 'Expired just now' });
    expect(countdown(ANCHOR + 1, ANCHOR).expired).toBe(false);
  });
  it('labels how long ago it expired', () => {
    expect(countdown(ANCHOR - 20 * HOUR, ANCHOR).label).toBe('Expired 20h ago');
    expect(countdown(ANCHOR - 5 * 60_000, ANCHOR).label).toBe('Expired 5m ago');
    expect(countdown(ANCHOR - DAY, ANCHOR).label).toBe('Expired 1 day ago');
    expect(countdown(ANCHOR - 3 * DAY, ANCHOR).label).toBe('Expired 3 days ago');
  });
});

describe('expiryBucket', () => {
  it('uses inclusive upper bounds', () => {
    expect(expiryBucket(ANCHOR - 1, ANCHOR)).toBe('expired');
    expect(expiryBucket(ANCHOR, ANCHOR)).toBe('expired');
    expect(expiryBucket(ANCHOR + 1, ANCHOR)).toBe('24h');
    expect(expiryBucket(ANCHOR + DAY, ANCHOR)).toBe('24h');
    expect(expiryBucket(ANCHOR + DAY + 1, ANCHOR)).toBe('3d');
    expect(expiryBucket(ANCHOR + 3 * DAY, ANCHOR)).toBe('3d');
    expect(expiryBucket(ANCHOR + 3 * DAY + 1, ANCHOR)).toBe('7d');
    expect(expiryBucket(ANCHOR + 7 * DAY, ANCHOR)).toBe('7d');
    expect(expiryBucket(ANCHOR + 7 * DAY + 1, ANCHOR)).toBe('later');
  });
});

describe('formatQatar', () => {
  it('shows Qatar time (UTC+3) whatever the device timezone', () => {
    expect(formatQatar(Date.UTC(2026, 10, 6, 20, 59))).toBe('Fri 6 Nov, 23:59 (Qatar)');
  });
  it('rolls over to the next day after 21:00 UTC', () => {
    expect(formatQatar(Date.UTC(2026, 10, 6, 21, 0))).toBe('Sat 7 Nov, 00:00 (Qatar)');
  });
});
