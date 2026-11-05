import { describe, expect, it } from 'vitest';
import { catalog } from '../catalog';
import { DEFAULT_SAVED_IDS } from '../defaults';
import { DEMO_SCENARIOS } from '../demoScenarios';
import { compareBasket } from '../../engine/compare';
import { explainGap } from '../../engine/explain';

// Fixed demo clock: 12:00 Qatar time on 5 Nov 2026. Seed promo expiries are relative to this anchor.
const ANCHOR = Date.UTC(2026, 10, 5, 9, 0);

describe.each(DEMO_SCENARIOS)('$title', (scenario) => {
  it.each(scenario.steps)('$id: $action', (step) => {
    const input = {
      catalog,
      basket: step.basket,
      wallet: { savedIds: [...DEFAULT_SAVED_IDS, ...step.addSaved], custom: [] },
      profile: step.profile,
      nowMs: ANCHOR,
      anchorMs: ANCHOR,
      mode: step.mode,
    };
    const result = compareBasket(input);
    const all = [...result.ranked, ...result.incomplete];
    const find = (listingId: string) => all.find((o) => o.listingId === listingId);

    expect(result.singlePlatform).toBe(step.expect.singlePlatform ?? false);
    expect(result.winnerId).toBe(step.expect.winner);

    for (const [listingId, expected] of Object.entries(step.expect.totals)) {
      if (expected === 'incomplete') {
        expect(result.incomplete.map((o) => o.listingId), listingId).toContain(listingId);
      } else {
        expect(find(listingId)?.totalDh, `${listingId} total`).toBe(expected);
      }
    }

    for (const r of step.expect.rejections ?? []) {
      const ev = find(r.listingId)?.evaluations.find((e) => e.promoId === r.promoId);
      expect(ev, `${r.promoId} evaluated on ${r.listingId}`).toBeDefined();
      expect(ev?.eligible, `${r.promoId} must be ineligible`).toBe(false);
      expect(ev?.reason).toContain(r.reasonIncludes);
    }

    for (const check of step.expect.modeChecks ?? []) {
      expect(compareBasket({ ...input, mode: check.mode }).winnerId, `mode ${check.mode}`).toBe(check.winner);
    }

    if (step.expect.gap) {
      const best = compareBasket({ ...input, mode: 'price' }).ranked[0];
      const winner = result.ranked[0];
      expect(winner.totalDh - best.totalDh).toBe(step.expect.gap.dh);
      expect(explainGap(winner, best)).toContain(step.expect.gap.textIncludes);
    }
  });
});
