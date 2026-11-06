// Builds optimised brand images from the originals in assets-src/. Run with: npm run images
// R1 builds the brand set (logo cut-out, crops, favicon, app icons, social image).
// R4 extends this file with merchant, platform, product and dish images.
//
// The logo is FINAL and must not be altered. The only things done to it here are:
//   1. removing the light background (alpha from how much of the logo's own blue or pink ink each pixel holds), and
//   2. cropping and resizing. Colours, shapes and proportions are untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/brand/perq-logo.png'; // really a JPEG with a .png name; sharp reads it either way
const OUT = 'public/brand';
const OFF_WHITE = { r: 247, g: 247, b: 242 }; // #F7F7F2

const median = (arr) => arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];

/** Removes the background. Returns RGBA pixels with the logo's exact ink colours. */
async function cutOut() {
  const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // Measure the two ink colours from fully inked pixels instead of guessing them.
  const blue = [[], [], []];
  const pink = [[], [], []];
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r < 70 && b > 200) [r, g, b].forEach((v, k) => blue[k].push(v));
    else if (r > 240 && g < 190 && g > 150 && b > 190 && b < 225) [r, g, b].forEach((v, k) => pink[k].push(v));
  }
  const INK_BLUE = blue.map(median);
  const INK_PINK = pink.map(median);

  const out = Buffer.alloc(W * H * 4);
  for (let p = 0, o = 0; p < data.length; p += 3, o += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    // Blue-ish pixels fade through the red channel, pink-ish pixels through the green channel.
    const isBlue = b >= r;
    const ink = isBlue ? INK_BLUE : INK_PINK;
    const raw = isBlue ? (255 - r) / (255 - ink[0]) : (255 - g) / (255 - ink[1]);
    // Stretch so JPEG noise in the background becomes fully transparent and solid ink becomes fully opaque.
    const a = Math.min(1, Math.max(0, (raw - 0.14) / (0.9 - 0.14)));
    if (a === 0) continue; // transparent black
    const solid = a >= 1;
    out[o] = solid ? r : ink[0]; // keep the original pixel where solid; edge pixels take the true ink colour (no white fringe)
    out[o + 1] = solid ? g : ink[1];
    out[o + 2] = solid ? b : ink[2];
    out[o + 3] = Math.round(a * 255);
  }
  return { rgba: out, W, H, INK_BLUE, INK_PINK };
}

/** Finds the empty band between the basket and the lettering. */
function findSplit(rgba, W, H) {
  const rowHas = (y) => {
    for (let x = 0; x < W; x++) if (rgba[(y * W + x) * 4 + 3] > 10) return true;
    return false;
  };
  const rows = Array.from({ length: H }, (_, y) => rowHas(y));
  const first = rows.indexOf(true);
  const last = rows.lastIndexOf(true);
  // Longest run of empty rows strictly inside the artwork.
  let best = { start: -1, len: 0 };
  for (let y = first, run = 0; y <= last; y++) {
    if (!rows[y]) {
      run++;
      if (run > best.len) best = { start: y - run + 1, len: run };
    } else run = 0;
  }
  return { first, last, splitStart: best.start, splitEnd: best.start + best.len };
}

const toPng = (buf, W, H) => sharp(buf, { raw: { width: W, height: H, channels: 4 } });

async function trimmed(sharpImg, pad = 0) {
  const { data, info } = await sharpImg.png().toBuffer({ resolveWithObject: true });
  const t = await sharp(data).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  void info;
  if (!pad) return sharp(t.data);
  // Render the padding now: sharp would otherwise resize first and pad afterwards, giving the wrong final size.
  const padded = await sharp(t.data).extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp(padded);
}

async function save(img, file, opts = {}) {
  const p = path.join(OUT, file);
  const buf = file.endsWith('.webp')
    ? await img.webp({ lossless: true, effort: 6, ...opts }).toBuffer()
    : await img.png({ compressionLevel: 9, palette: false, ...opts }).toBuffer(); // full colour with a real alpha channel: never quantised to a palette
  await fs.writeFile(p, buf);
  const meta = await sharp(buf).metadata();
  console.log(`  ${file.padEnd(26)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)} ${(buf.length / 1024).toFixed(1)} KB`);
}

/** A square icon: the basket centred on a solid or transparent background. */
async function icon(markBuf, size, { fill = 0.7, bg = null } = {}) {
  const inner = Math.round(size * fill);
  const m = await sharp(markBuf).resize({ width: inner, height: inner, fit: 'inside' }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: bg ? { ...bg, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: m, gravity: 'centre' }]);
}

async function buildBrand() {
  await fs.mkdir(OUT, { recursive: true });
  const { rgba, W, H, INK_BLUE, INK_PINK } = await cutOut();
  console.log(`Logo ink colours measured: blue rgb(${INK_BLUE}) pink rgb(${INK_PINK})`);
  const { first, last, splitStart, splitEnd } = findSplit(rgba, W, H);
  console.log(`Artwork rows ${first}-${last}; gap between basket and lettering: rows ${splitStart}-${splitEnd}`);

  const full = toPng(rgba, W, H);
  const markRaw = toPng(rgba, W, H).extract({ left: 0, top: 0, width: W, height: splitStart });
  const wordRaw = toPng(rgba, W, H).extract({ left: 0, top: splitEnd, width: W, height: H - splitEnd });

  const lockup = await trimmed(full, 6);
  const mark = await trimmed(markRaw, 4);
  const word = await trimmed(wordRaw, 4);

  console.log('Brand images:');
  // Full-size masters, plus right-sized copies for the UI (the header logo displays at about 40px high, so 160px wide is plenty at 2x).
  // PNG masters, plus lossless WebP copies (identical pixels, about half the size) for the UI.
  await save(lockup.clone(), 'logo-lockup.png');
  await save(lockup.clone().resize({ width: 360 }), 'logo-lockup-360.webp');
  await save(mark.clone(), 'mark.png');
  await save(mark.clone().resize({ width: 160 }), 'mark-160.webp');
  await save(word.clone(), 'wordmark.png');
  await save(word.clone().resize({ width: 160 }), 'wordmark-160.webp');

  const markBuf = await mark.clone().png().toBuffer();
  // Browser tab, home-screen and app icons use the basket only (letters are unreadable at icon sizes).
  await save(await icon(markBuf, 32, { fill: 0.94 }), 'favicon-32.png');
  await save(await icon(markBuf, 48, { fill: 0.94 }), 'favicon-48.png');
  await save(await icon(markBuf, 180, { fill: 0.66, bg: OFF_WHITE }), 'apple-touch-icon.png');
  await save(await icon(markBuf, 192, { fill: 0.66, bg: OFF_WHITE }), 'icon-192.png');
  await save(await icon(markBuf, 512, { fill: 0.66, bg: OFF_WHITE }), 'icon-512.png');
  await save(await icon(markBuf, 512, { fill: 0.5, bg: OFF_WHITE }), 'icon-maskable-512.png'); // safe zone for maskable icons

  // Social preview image (1200x630): the full logo centred on the brand off-white.
  const lockBuf = await lockup.clone().resize({ height: 470, fit: 'inside' }).png().toBuffer();
  const og = sharp({ create: { width: 1200, height: 630, channels: 4, background: { ...OFF_WHITE, alpha: 1 } } }).composite([{ input: lockBuf, gravity: 'centre' }]);
  await save(og, 'og.png');

  // Review sheet (not shipped): the logo on the three surfaces it will appear on.
  const tile = async (bg) => sharp({ create: { width: 420, height: 480, channels: 4, background: bg } })
    .composite([{ input: await lockup.clone().resize({ height: 400, fit: 'inside' }).png().toBuffer(), gravity: 'centre' }]).png().toBuffer();
  const tiles = [OFF_WHITE, { r: 255, g: 255, b: 255 }, { r: 40, g: 120, b: 255 }, { r: 128, g: 128, b: 128 }].map((c) => ({ ...c, alpha: 1 }));
  const bufs = await Promise.all(tiles.map(tile));
  await sharp({ create: { width: 420 * 4, height: 480, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite(bufs.map((input, i) => ({ input, left: i * 420, top: 0 }))).png().toFile('assets-src/brand/_review-sheet.png');
  console.log('Review sheet: assets-src/brand/_review-sheet.png');
}

// ---------------------------------------------------------------------------------------------
// Merchant and platform logos, product photos and dish photos (R4).
// Put originals in assets-src/<folder>/<id>.<png|jpg|jpeg|webp|svg>. The id is the file name.
// Output: public/img/<kind>/<id>-160.webp and -480.webp (SVG logos are copied as they are), plus
// src/data/imageFiles.generated.ts, the list of what exists, so the app never requests a missing file.
// Files whose name starts with "_" are ignored. With no originals the app uses designed fallback tiles.
// ---------------------------------------------------------------------------------------------
const KINDS = [
  { kind: 'merchants', dir: 'assets-src/logos/merchants', logo: true },
  { kind: 'platforms', dir: 'assets-src/logos/platforms', logo: true },
  { kind: 'products', dir: 'assets-src/products', logo: false },
  { kind: 'dishes', dir: 'assets-src/dishes', logo: false },
  { kind: 'hero', dir: 'assets-src/hero', logo: false, wide: true }, // wide banner photos: 800 and 1600px wide, not cropped square
];
const SIZES = [160, 480];
const IMAGE_EXT = /\.(png|jpe?g|webp|svg)$/i;

// Some supplied logos have a fake transparency checkerboard baked into their pixels. For these ids, the light grey and
// white squares connected to the picture's edge are made really transparent (the logo itself is untouched).
const CLEAN_CHECKERBOARD = new Set(['merchants/mcdonalds']);
async function removeEdgeCheckerboard(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const neutral = (i) => { const r = data[i], g = data[i + 1], b = data[i + 2]; return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && r > 190; };
  const seen = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || !neutral(p * 4)) continue;
    seen[p] = 1;
    data[p * 4 + 3] = 0;
    const x = p % W;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

async function buildAssets() {
  const found = {};
  for (const { kind, dir, logo, wide } of KINDS) {
    found[kind] = {};
    const outDir = path.join('public/img', kind);
    await fs.rm(outDir, { recursive: true, force: true }); // generated: always rebuilt from the originals
    let names = [];
    try { names = await fs.readdir(dir); } catch { /* folder not created yet */ }
    const files = names.filter((n) => IMAGE_EXT.test(n) && !n.startsWith('_')).sort();
    if (files.length === 0) continue;
    await fs.mkdir(outDir, { recursive: true });
    console.log(`${kind}:`);
    for (const name of files) {
      const id = name.replace(IMAGE_EXT, '');
      const input = path.join(dir, name);
      if (/\.svg$/i.test(name)) {
        await fs.copyFile(input, path.join(outDir, `${id}.svg`));
        found[kind][id] = { ext: 'svg' };
        console.log(`  ${id.padEnd(32)} svg (copied)`);
        continue;
      }
      const source = CLEAN_CHECKERBOARD.has(`${kind}/${id}`) ? await removeEdgeCheckerboard(input) : input;
      let meta;
      try { meta = await sharp(input).metadata(); } catch (e) { console.warn(`  ${name}: cannot read, skipped (${e.message})`); continue; }
      for (const size of wide ? [800, 1600] : SIZES) {
        // Logos keep their shape inside a square on a transparent background. Photos are cropped to a square around the centre.
        const img = sharp(source).rotate().resize(wide ? { width: size, withoutEnlargement: true } : logo
          ? { width: size, height: size, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: false }
          : { width: size, height: size, fit: 'cover', position: 'centre' });
        const buf = await img.webp({ quality: logo ? 92 : wide ? 72 : 80, effort: 5 }).toBuffer();
        await fs.writeFile(path.join(outDir, `${id}-${size}.webp`), buf);
      }
      found[kind][id] = { ext: 'webp' };
      const note = Math.min(meta.width ?? 0, meta.height ?? 0) < 480 ? ' (small original: looks soft at 480px)' : '';
      console.log(`  ${id.padEnd(32)} ${meta.width}x${meta.height}${note}`);
    }
  }
  const body = Object.entries(found)
    .map(([kind, items]) => `  ${kind}: {${Object.entries(items).map(([id, v]) => ` '${id}': '${v.ext}'`).join(',')} },`)
    .join('\n');
  await fs.writeFile(
    'src/data/imageFiles.generated.ts',
    `// GENERATED by scripts/build-images.mjs (npm run images). Do not edit by hand.\n// Which image files exist in public/img, by kind and id.\nexport type ImageExt = 'webp' | 'svg';\nexport const IMAGE_FILES: Record<'merchants' | 'platforms' | 'products' | 'dishes' | 'hero', Record<string, ImageExt>> = {\n${body}\n};\n`,
  );
  const total = Object.values(found).reduce((n, o) => n + Object.keys(o).length, 0);
  console.log(`Image list written: src/data/imageFiles.generated.ts (${total} images)`);
}

await buildBrand();
await buildAssets();
