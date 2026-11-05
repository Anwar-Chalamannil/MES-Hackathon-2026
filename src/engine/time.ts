import type { Expiry, ExpiryBucket } from './types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Seed promos use relHours from the demo anchor; others use an absolute ISO time. Returns epoch ms. */
export function resolveExpiry(e: Expiry, anchorMs: number): number {
  if ('relHours' in e) return anchorMs + e.relHours * HOUR;
  const ms = Date.parse(e.iso);
  if (Number.isNaN(ms)) throw new Error(`Invalid expiry date: ${e.iso}`);
  return ms;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * A promotion expires AT its expiry instant: now >= expiry means expired.
 * Labels: "5h 12m", "2 days", "Expired 1 day ago".
 */
export function countdown(expiryMs: number, nowMs: number): { expired: boolean; label: string } {
  const diff = expiryMs - nowMs;
  if (diff <= 0) {
    const ago = -diff;
    if (ago < MIN) return { expired: true, label: 'Expired just now' };
    if (ago < HOUR) return { expired: true, label: `Expired ${Math.floor(ago / MIN)}m ago` };
    if (ago < DAY) return { expired: true, label: `Expired ${Math.floor(ago / HOUR)}h ago` };
    return { expired: true, label: `Expired ${plural(Math.floor(ago / DAY), 'day')} ago` };
  }
  if (diff < MIN) return { expired: false, label: 'less than 1m' };
  if (diff < HOUR) return { expired: false, label: `${Math.floor(diff / MIN)}m` };
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    const m = Math.floor((diff % HOUR) / MIN);
    return { expired: false, label: m === 0 ? `${h}h` : `${h}h ${m}m` };
  }
  return { expired: false, label: plural(Math.floor(diff / DAY), 'day') };
}

/** Upper bounds are inclusive: exactly 24h is '24h', exactly 72h is '3d', exactly 168h is '7d'. */
export function expiryBucket(expiryMs: number, nowMs: number): ExpiryBucket {
  const diff = expiryMs - nowMs;
  if (diff <= 0) return 'expired';
  if (diff <= DAY) return '24h';
  if (diff <= 3 * DAY) return '3d';
  if (diff <= 7 * DAY) return '7d';
  return 'later';
}

const qatarParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Qatar',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Example: "Fri 6 Nov, 23:59 (Qatar)". Always Asia/Qatar, whatever the device timezone. */
export function formatQatar(ms: number): string {
  const p: Record<string, string> = {};
  for (const part of qatarParts.formatToParts(new Date(ms))) p[part.type] = part.value;
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute} (Qatar)`;
}
