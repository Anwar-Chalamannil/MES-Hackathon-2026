import { describe, expect, it } from 'vitest';
import { APP_NAME, APP_TAGLINE } from './config';

describe('config', () => {
  it('has the Perq name and tagline', () => {
    expect(APP_NAME).toBe('Perq');
    expect(APP_TAGLINE).toBe('Compare smarter. Save more.');
  });
});
