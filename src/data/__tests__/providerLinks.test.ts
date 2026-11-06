import { describe, expect, it } from 'vitest';
import { catalog } from '../catalog';
import { PROVIDER_LINKS, verifiedProviderLink } from '../providerLinks';

describe('provider links', () => {
  it('every platform is listed once', () => {
    expect(Object.keys(PROVIDER_LINKS).sort()).toEqual(catalog.platforms.map((p) => p.id).sort());
  });
  it('only verified links with an https address are ever returned', () => {
    for (const l of Object.values(PROVIDER_LINKS)) {
      const found = verifiedProviderLink(l.platformId);
      if (l.verified) {
        expect(l.url, l.platformId).toMatch(/^https:\/\//);
        expect(found?.url).toBe(l.url);
      } else {
        expect(found, l.platformId).toBeUndefined();
      }
    }
  });
  it('Keeta has no verified link; Snoonu and Kulud use their store pages; an unknown platform gets none', () => {
    expect(verifiedProviderLink('keeta')).toBeUndefined();
    expect(verifiedProviderLink('snoonu')?.where).toBe('app store page');
    expect(verifiedProviderLink('kulud')?.where).toBe('app store page');
    expect(verifiedProviderLink('nope')).toBeUndefined();
  });
});
