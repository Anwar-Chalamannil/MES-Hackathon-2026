import { describe, expect, it } from 'vitest';
import { fmt, pctOf, qar } from '../money';

describe('qar', () => {
  it('converts QAR to integer dirhams', () => {
    expect(qar(17.5)).toBe(1750);
    expect(qar(0.29)).toBe(29); // 0.29 * 100 = 28.999999999999996 in floating point
    expect(qar(1.1)).toBe(110);
  });
});

describe('fmt', () => {
  it('formats dirhams as QAR with two decimals', () => {
    expect(fmt(1750)).toBe('QAR 17.50');
    expect(fmt(5)).toBe('QAR 0.05');
    expect(fmt(0)).toBe('QAR 0.00');
    expect(fmt(14825)).toBe('QAR 148.25');
  });
  it('adds thousands separators and handles negatives', () => {
    expect(fmt(123456)).toBe('QAR 1,234.56');
    expect(fmt(-1040)).toBe('-QAR 10.40');
  });
});

describe('pctOf', () => {
  it('computes exact percentages', () => {
    expect(pctOf(5200, 20)).toBe(1040);
    expect(pctOf(5400, 30)).toBe(1620);
  });
  it('rounds half up to the nearest dirham', () => {
    expect(pctOf(1050, 5)).toBe(53); // 52.5 -> 53
    expect(pctOf(1030, 5)).toBe(52); // 51.5 -> 52
    expect(pctOf(1010, 5)).toBe(51); // 50.5 -> 51
    expect(pctOf(1000, 5)).toBe(50);
    expect(pctOf(99, 10)).toBe(10); // 9.9 -> 10
    expect(pctOf(94, 10)).toBe(9); // 9.4 -> 9
  });
  it('returns integers only', () => {
    for (const base of [1, 7, 33, 199, 1234, 9999]) {
      for (const pct of [5, 10, 15, 20, 25, 30, 50]) {
        expect(Number.isInteger(pctOf(base, pct))).toBe(true);
      }
    }
  });
});
