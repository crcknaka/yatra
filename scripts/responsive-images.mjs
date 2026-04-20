import sharp from 'sharp';
import { stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Key images that benefit from responsive sizing (LCP / hero / large cards)
// Format: source path relative to assets/
const TARGETS = [
  'tea.webp',
  'about.webp',
  'Kerala Cottages/cottage.webp',
  'Standard Room/std room.webp',
  'Deluxe Room/Deluxe-new.webp',
];

const SIZES = [480, 800, 1200, 1600];
const QUALITY = 82;

async function makeVariants(relPath) {
  const src = `assets/${relPath}`;
  if (!existsSync(src)) {
    console.warn(`SKIP (missing): ${src}`);
    return;
  }

  const meta = await sharp(src).metadata();
  const stem = src.replace(/\.webp$/, '');

  const results = [];
  for (const w of SIZES) {
    if (w >= meta.width) continue; // don't upscale
    const out = `${stem}-${w}.webp`;
    await sharp(src).resize({ width: w }).webp({ quality: QUALITY }).toFile(out);
    const s = await stat(out);
    results.push(`${w}w → ${(s.size / 1024).toFixed(0)} KB`);
  }
  console.log(`${relPath} (orig ${meta.width}px)  ${results.join(', ')}`);
}

for (const t of TARGETS) {
  await makeVariants(t);
}
console.log('\nDone.');
