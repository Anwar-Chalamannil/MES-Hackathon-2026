import type { Dh } from './types';

/** Authoring/tests only: qar(17.5) -> 1750. */
export function qar(n: number): Dh {
  return Math.round(n * 100);
}

/** fmt(1750) -> "QAR 17.50". Uses only integer maths on the dirham value. */
export function fmt(dh: Dh): string {
  const negative = dh < 0;
  const abs = Math.abs(Math.trunc(dh));
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const cents = String(abs % 100).padStart(2, '0');
  return `${negative ? '-' : ''}QAR ${whole}.${cents}`;
}

/** Percentage of an amount, rounded half up. pctOf(5200, 20) -> 1040. */
export function pctOf(baseDh: Dh, pct: number): Dh {
  return Math.floor((baseDh * pct + 50) / 100);
}
