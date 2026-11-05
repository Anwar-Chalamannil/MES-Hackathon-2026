import { describe, expect, it } from 'vitest';
import { APP_NAME, APP_TAGLINE } from './config';

describe('config', () => {
  it('has an app name and tagline', () => {
    expect(APP_NAME.length).toBeGreaterThan(0);
    expect(APP_TAGLINE.length).toBeGreaterThan(0);
  });
});
