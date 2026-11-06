import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Reads the real design tokens from src/styles/index.css so the rules below cannot drift from the app.
const css = fs.readFileSync(path.join(process.cwd(), 'src/styles/index.css'), 'utf8');
const tok = (name: string): string => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`Missing colour token --color-${name}`);
  return m[1].toLowerCase();
};

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
/** A colour at a given opacity over another (how `bg-save/10` renders on white). */
const over = (fg: string, bg: string, alpha: number) =>
  '#' + rgb(fg).map((c, i) => Math.round((c * alpha + rgb(bg)[i] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join('');

const WHITE = '#ffffff';

describe('Perq brand colours', () => {
  it('uses the three brand colours exactly', () => {
    expect(tok('blue')).toBe('#2878ff');
    expect(tok('pink')).toBe('#ffb6d5');
    expect(tok('bg')).toBe('#f7f7f2');
  });
});

describe('text contrast (WCAG AA, at least 4.5:1)', () => {
  const pairs: [string, string, string][] = [
    ['ink', 'bg', 'body text on the app background'],
    ['ink', 'surface', 'body text on cards'],
    ['ink', 'pink', 'navy text on pink'],
    ['ink', 'pink-50', 'navy text on the notice'],
    ['ink', 'blue-50', 'navy text on selected chips'],
    ['muted', 'bg', 'secondary text on the background'],
    ['muted', 'surface', 'secondary text on cards'],
    ['blue-700', 'bg', 'links on the background'],
    ['blue-700', 'surface', 'links on cards'],
    ['blue-700', 'blue-50', 'blue text on selected chips'],
    ['brand', 'bg', 'brand-coloured text on the background'],
    ['brand', 'brand-soft', 'brand-coloured text on soft blue'],
    ['pink-ink', 'pink', 'savings text on pink'],
    ['pink-ink', 'pink-50', 'savings text on the pink wash'],
    ['pink-ink', 'surface', 'savings text on cards'],
    ['success', 'surface', 'success text'],
    ['warn', 'surface', 'warning text'],
    ['fail', 'surface', 'error text'],
  ];
  it.each(pairs)('%s on %s (%s)', (fg, bg) => {
    expect(ratio(tok(fg), tok(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it('white text on buttons (blue-700 and brand) passes', () => {
    expect(ratio(WHITE, tok('blue-700'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(WHITE, tok('brand'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(WHITE, tok('blue-800'))).toBeGreaterThanOrEqual(4.5);
  });

  it('tinted badges stay readable (success and warn at 10% on white)', () => {
    for (const name of ['success', 'warn']) {
      expect(ratio(tok(name), over(tok(name), WHITE, 0.1)), name).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('the rules that keep pink safe', () => {
  it('white text on pink fails, which is why it is forbidden (rejection case)', () => {
    expect(ratio(WHITE, tok('pink'))).toBeLessThan(3);
  });
  it('the exact brand blue is too light for white button text, which is why buttons use blue-700', () => {
    expect(ratio(WHITE, tok('blue'))).toBeLessThan(4.5);
    expect(ratio(WHITE, tok('blue-700'))).toBeGreaterThanOrEqual(4.5);
  });
  it('pink alone is not a visible boundary against the background', () => {
    expect(ratio(tok('pink'), tok('bg'))).toBeLessThan(3);
  });
});

describe('non-text contrast (at least 3:1)', () => {
  it('brand blue (focus ring, selected borders) on the background and on cards', () => {
    expect(ratio(tok('blue'), tok('bg'))).toBeGreaterThanOrEqual(3);
    expect(ratio(tok('blue'), tok('surface'))).toBeGreaterThanOrEqual(3);
  });
  it('input and stepper borders on cards', () => {
    expect(ratio(tok('control'), tok('surface'))).toBeGreaterThanOrEqual(3);
  });
});
