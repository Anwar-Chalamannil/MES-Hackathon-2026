import { describe, expect, it } from 'vitest';
import { DEFAULT_SAVED_IDS } from '../../data/defaults';
import { promo } from '../../engine/__tests__/fixtures';
import type { Wallet } from '../../engine/types';
import { buildNotifications, EXPIRED_ALERT_WINDOW_MS, formatBadge } from '../notifications';

const HOUR = 3_600_000;
const ANCHOR = Date.UTC(2026, 10, 5, 9, 0);
const fresh = { savedIds: [...DEFAULT_SAVED_IDS], custom: [] };
const ids = (w: Wallet = fresh, now = ANCHOR) => buildNotifications(w, ANCHOR, now).map((n) => n.id);

describe('notifications on a fresh device', () => {
  it('gives exactly the 10 planned alerts', () => {
    expect(ids().sort()).toEqual(
      ['K3@expired', 'KU3@3d', 'N2@7d', 'N3@24h', 'R1@3d', 'S2@7d', 'S3@24h', 'T3@24h', 'K2@7d', 'W3@7d'].sort(),
    );
  });
  it('leaves out old historical vouchers (R2, L1) and unsaved or automatic offers', () => {
    const all = ids();
    for (const x of ['R2', 'L1', 'T2', 'C1', 'T1', 'K1', 'C3']) expect(all.some((i) => i.startsWith(`${x}@`)), x).toBe(false);
  });
  it('is newest first', () => {
    const list = buildNotifications(fresh, ANCHOR, ANCHOR);
    const times = list.map((n) => n.triggerMs);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
  it('has no duplicate ids', () => {
    const all = ids();
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('stages and boundaries', () => {
  const at = (hoursLeft: number) => {
    const p = promo({ id: 'X1', platformId: 'talabat', kind: 'code', conditions: { expiry: { relHours: 0 } } });
    const w = { savedIds: [], custom: [{ ...p, origin: 'user' as const }] };
    return buildNotifications(w, ANCHOR, ANCHOR - hoursLeft * HOUR)[0]?.id;
  };
  it('exactly 24h, 72h and 168h left belong to the nearer stage', () => {
    expect(at(24)).toBe('X1@24h');
    expect(at(72)).toBe('X1@3d');
    expect(at(168)).toBe('X1@7d');
  });
  it('just over each boundary moves to the next stage', () => {
    expect(at(24.01)).toBe('X1@3d');
    expect(at(72.01)).toBe('X1@7d');
    expect(at(168.01)).toBeUndefined();
  });
  it('expired shows only within 7 days of expiry (rejection case beyond it)', () => {
    expect(at(0)).toBe('X1@expired');
    expect(at(-1)).toBe('X1@expired');
    const edge = EXPIRED_ALERT_WINDOW_MS / HOUR;
    expect(at(-edge)).toBe('X1@expired');
    expect(at(-edge - 0.01)).toBeUndefined();
  });
  it('moving to a new stage gives a new id (so it is unread again)', () => {
    const p = promo({ id: 'X2', platformId: 'talabat', kind: 'code', conditions: { expiry: { relHours: 100 } } });
    const w = { savedIds: [], custom: [{ ...p, origin: 'user' as const }] };
    expect(buildNotifications(w, ANCHOR, ANCHOR)[0].id).toBe('X2@7d');
    expect(buildNotifications(w, ANCHOR, ANCHOR + 40 * HOUR)[0].id).toBe('X2@3d');
  });
});

describe('which vouchers count', () => {
  it('includes custom vouchers and ignores unsaved seed codes', () => {
    const p = promo({ id: 'U9', platformId: 'snoonu', kind: 'code', conditions: { expiry: { relHours: 10 } } });
    const w = { savedIds: [], custom: [{ ...p, origin: 'user' as const }] };
    expect(ids(w)).toEqual(['U9@24h']);
    // T2 (DEMO-TB20) expires in 48h but is not saved, so it makes no alert until it is saved
    expect(ids({ ...w, savedIds: ['T2'] })).toEqual(['U9@24h', 'T2@3d']);
  });
  it('an empty wallet gives none', () => {
    expect(ids({ savedIds: [], custom: [] })).toEqual([]);
  });
  it('is deterministic for the same inputs', () => {
    expect(ids()).toEqual(ids());
  });
  it('titles name the voucher and what is happening', () => {
    const n = buildNotifications(fresh, ANCHOR, ANCHOR).find((x) => x.id === 'K3@expired')!;
    expect(n.title).toContain('DEMO-KT25');
    expect(n.title).toContain('expired');
    expect(n.message).toContain('Keeta');
  });
});

describe('badge text', () => {
  it.each([[0, '0'], [3, '3'], [9, '9'], [10, '9+'], [57, '9+']])('%i shows %s', (n, text) => {
    expect(formatBadge(n)).toBe(text);
  });
});
