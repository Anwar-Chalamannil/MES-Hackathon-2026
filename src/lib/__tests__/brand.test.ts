import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { APP_DESCRIPTION, APP_NAME, BRAND_ASSETS } from '../../config';

const root = process.cwd();
const read = (...p: string[]) => fs.readFileSync(path.join(root, ...p));
const exists = (...p: string[]) => fs.existsSync(path.join(root, ...p));

/** Width, height and colour type of a PNG file (6 = has an alpha channel). */
function png(file: string) {
  const b = read('public', file);
  expect(b.subarray(0, 8).toString('hex'), `${file} is a real PNG`).toBe('89504e470d0a1a0a');
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25] };
}

describe('Perq name and logo files', () => {
  it('is called Perq', () => {
    expect(APP_NAME).toBe('Perq');
    expect(APP_DESCRIPTION).toContain('Perq');
  });

  it('keeps the original logo source in the project', () => {
    expect(exists('assets-src', 'brand', 'perq-logo.png')).toBe(true);
  });

  it.each(Object.entries(BRAND_ASSETS))('%s: file exists, is transparent, and its size matches the config', async (_name, asset) => {
    const file = asset.src.replace(/^\//, '');
    expect(exists('public', file), file).toBe(true);
    const meta = await sharp(path.join(root, 'public', file)).metadata();
    expect({ w: meta.width, h: meta.height }, 'config size must equal the real file size').toEqual({ w: asset.width, h: asset.height });
    expect(meta.hasAlpha, 'must have transparency (no background box)').toBe(true);
  });

  it('the full-size PNG masters are full colour with transparency, never a reduced palette', () => {
    for (const file of ['brand/mark.png', 'brand/wordmark.png', 'brand/logo-lockup.png']) {
      expect(png(file).colorType, file).toBe(6); // 6 = RGBA
    }
  });

  it.each([
    ['brand/favicon-32.png', 32, 32],
    ['brand/favicon-48.png', 48, 48],
    ['brand/apple-touch-icon.png', 180, 180],
    ['brand/icon-192.png', 192, 192],
    ['brand/icon-512.png', 512, 512],
    ['brand/icon-maskable-512.png', 512, 512],
    ['brand/og.png', 1200, 630],
  ])('%s is %ix%i', (file, w, h) => {
    expect(png(file)).toMatchObject({ w, h });
  });
});

describe('web manifest and page metadata', () => {
  const manifest = JSON.parse(read('public', 'manifest.webmanifest').toString());
  const html = read('index.html').toString();

  it('manifest uses the brand name and colours, and every icon exists at its stated size', () => {
    expect(manifest.name).toBe('Perq');
    expect(manifest.theme_color).toBe('#2878FF');
    expect(manifest.background_color).toBe('#F7F7F2');
    for (const icon of manifest.icons as { src: string; sizes: string }[]) {
      const { w, h } = png(icon.src.replace(/^\//, ''));
      expect(`${w}x${h}`, icon.src).toBe(icon.sizes);
    }
  });

  it('index.html has the Perq title, description, icons, manifest and social preview', () => {
    expect(html).toContain('<title>Perq');
    expect(html).toMatch(/name="description" content="[^"]*Perq/);
    expect(html).toContain('content="#2878FF"');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    for (const [, href] of html.matchAll(/rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g)) {
      expect(exists('public', href.replace(/^\//, '')), `icon ${href} exists`).toBe(true);
    }
  });

  it('shows no old brand name anywhere the user can see it', () => {
    // Case-sensitive on purpose: the lower-case storage key "basketwise" is kept so saved baskets survive the rename.
    expect(html).not.toMatch(/BasketWise/);
    const walk = (dir: string): string[] =>
      fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === '__tests__' ? [] : walk(p);
        return /\.(tsx?|css)$/.test(e.name) && !/\.test\./.test(e.name) ? [p] : [];
      });
    const offenders = walk('src').filter((f) => /BasketWise/.test(read(f).toString()));
    expect(offenders).toEqual([]);
  });
});
