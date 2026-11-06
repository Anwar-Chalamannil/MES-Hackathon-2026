import { describe, expect, it } from 'vitest';
import { cardPresetById, type CardPreset } from '../../data/cardPresets';
import { catalog } from '../../data/catalog';
import { DEFAULT_PROFILE, DEFAULT_SAVED_IDS } from '../../data/defaults';
import { heroBasket } from '../demoBasket';
import { compareBasket } from '../../engine/compare';
import type { CompareInput, Profile } from '../../engine/types';
import { compareWithCards } from '../cardComparison';
import { cardMeetsOffer, matchingCards } from '../cardMatch';

const ANCHOR = Date.UTC(2026, 10, 6, 10, 0);
const card = (id: string): CardPreset => cardPresetById.get(id)!;
const SIG = card('dukhan-visa-signature');
const PLAT = card('dukhan-visa-platinum');
const INF = card('dukhan-visa-infinite');
const QNB = card('qnb-life-rewards-visa-infinite');

const input = (over: { saved?: string[]; profile?: Partial<Profile> } = {}): CompareInput => ({
  catalog,
  basket: heroBasket(),
  wallet: { savedIds: [...DEFAULT_SAVED_IDS, ...(over.saved ?? [])], custom: [] },
  profile: { ...DEFAULT_PROFILE, ...(over.profile ?? {}) },
  nowMs: ANCHOR,
  anchorMs: ANCHOR,
  mode: 'price',
});
const total = (c: ReturnType<typeof compareWithCards>, listingId: string) => c.ranked.find((o) => o.listingId === listingId)?.totalDh;

describe('compareWithCards', () => {
  it('with no cards the result equals the engine result exactly', () => {
    for (const mode of ['price', 'fastest'] as const) {
      const i = { ...input({ saved: ['T2'] }), mode };
      const { cardFor, ...rest } = compareWithCards(i, []);
      expect(rest).toEqual(compareBasket(i));
      expect(cardFor).toEqual({});
    }
  });

  it('a Dukhan Visa Signature qualifies for R1 on Rafeeq: 45.30 and Rafeeq wins (Hero A step A4)', () => {
    const c = compareWithCards(input({ saved: ['T2'] }), [SIG]);
    expect(total(c, 'jb-rafeeq')).toBe(4530);
    expect(c.winnerId).toBe('jb-rafeeq');
    expect(c.cardFor['jb-rafeeq']?.id).toBe('dukhan-visa-signature');
    expect(total(c, 'jb-talabat')).toBe(5260);
  });

  it('a Dukhan Visa Platinum fails the tier rule, but every other valid discount still applies', () => {
    const c = compareWithCards(input({ saved: ['T2'] }), [PLAT]);
    expect(total(c, 'jb-rafeeq')).toBe(6150); // R1 not applied, nothing else on Rafeeq to lose
    expect(total(c, 'jb-talabat')).toBe(5260); // TB20 still applied for this card
    expect(total(c, 'jb-keeta')).toBe(5800); // Keeta free delivery still applied
    expect(total(c, 'jb-snoonu')).toBe(6000);
    expect(c.winnerId).toBe('jb-talabat');
    expect(c.cardFor['jb-rafeeq']).toBeUndefined();
  });

  it('Platinum plus Signature: the Signature supplies R1, and the totals never get worse than either card alone', () => {
    const both = compareWithCards(input({ saved: ['T2'] }), [PLAT, SIG]);
    expect(total(both, 'jb-rafeeq')).toBe(4530);
    expect(both.cardFor['jb-rafeeq']?.id).toBe('dukhan-visa-signature');
    const alone = compareWithCards(input({ saved: ['T2'] }), [PLAT]);
    for (const o of alone.ranked) expect(total(both, o.listingId)!).toBeLessThanOrEqual(o.totalDh);
  });

  it('a card of another bank leaves the Dukhan offer unused, and a QNB card unlocks QNB offers only where they fit', () => {
    const c = compareWithCards(input(), [QNB]);
    expect(total(c, 'jb-rafeeq')).toBe(6150);
    // T3 (QNB 15%) needs QAR 80 on Talabat; the basket is QAR 52 so it does not apply.
    expect(total(c, 'jb-talabat')).toBe(6300);
  });

  it('paying with Apple Pay stops R1 even with a Signature card (step A5)', () => {
    const c = compareWithCards(input({ saved: ['T2'], profile: { channel: 'apple_pay' } }), [SIG]);
    expect(total(c, 'jb-rafeeq')).toBe(6150);
    expect(c.winnerId).toBe('jb-talabat');
  });

  it('a Dukhan Infinite card also qualifies for R1 (tier rule lists signature and infinite)', () => {
    expect(total(compareWithCards(input(), [INF]), 'jb-rafeeq')).toBe(4530);
  });

  it('a profile that still says Dukhan does not leak card offers once the person has cards', () => {
    const legacy = { issuer: 'dukhan' as const };
    expect(total(compareWithCards(input({ profile: legacy }), [PLAT]), 'jb-rafeeq')).toBe(6150);
    // ...but with no cards the old profile behaves exactly as before.
    expect(total(compareWithCards(input({ profile: legacy }), []), 'jb-rafeeq')).toBe(4530);
  });

  it('the winner and explanation follow the chosen sort mode', () => {
    const c = compareWithCards({ ...input({ saved: ['T2'] }), mode: 'fastest' }, [SIG]);
    expect(c.explanation.length).toBeGreaterThan(0);
    expect(c.ranked[0].eta[1]).toBeLessThanOrEqual(c.ranked[1].eta[1]);
  });
});

describe('cardMeetsOffer', () => {
  const R1 = catalog.promotions.find((p) => p.id === 'R1')!;
  const T3 = catalog.promotions.find((p) => p.id === 'T3')!;
  it('separates bank, network, tier and channel', () => {
    expect(cardMeetsOffer(SIG, R1, 'card').status).toBe('matches');
    expect(cardMeetsOffer(PLAT, R1, 'card').status).toBe('no_match'); // tier
    expect(cardMeetsOffer(card('qnb-qatar-airways-mastercard-world'), R1).message).toContain('Different bank');
    expect(cardMeetsOffer(SIG, R1, 'apple_pay').status).toBe('no_match'); // channel
    expect(cardMeetsOffer(QNB, T3, 'card').status).toBe('matches'); // no tier rule for T3
    expect(cardMeetsOffer(card('qnb-qatar-airways-mastercard-world'), R1).status).toBe('no_match');
  });
  it('an unknown tier cannot be confirmed for an offer with a tier rule, and "matches" never says guaranteed', () => {
    const unknownDukhan: CardPreset = { ...SIG, id: 'x', tier: 'unknown' };
    expect(cardMeetsOffer(unknownDukhan, R1, 'card').status).toBe('cant_confirm');
    expect(cardMeetsOffer(SIG, R1, 'card').message.toLowerCase()).not.toContain('guarantee');
  });
  it('matchingCards lists matches and skips saved cards whose preset no longer exists', () => {
    const saved = [{ id: 'a', presetId: 'dukhan-visa-signature' }, { id: 'b', presetId: 'gone' }, { id: 'c', presetId: 'dukhan-visa-platinum' }];
    const m = matchingCards(R1, saved, 'card');
    expect(m.matches.map((x) => x.id)).toEqual(['dukhan-visa-signature']);
    expect(m.cantConfirm).toEqual([]);
  });
});
