import sharp from 'sharp';
import { readdir, mkdir, stat, rm } from 'node:fs/promises';
import { join, basename } from 'node:path';

const SRC_ROOT = 'assets/yatra-pics';
const OUT_ROOT = 'assets/gallery';
const QUALITY = 82;

// Output structure:
//   assets/gallery/pancakarma/01.webp + 01-480.webp + 01-800.webp + 01-1200.webp
//   assets/gallery/pancakarma/v01.webp + v01-480.webp + v01-720.webp  (vertical)
//   assets/gallery/pilgrimage/...
//   assets/gallery/toms.webp + variants

const HORIZONTAL_SIZES = [480, 800, 1200];
const VERTICAL_SIZES = [480, 720];

async function listJpegs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /\.(jpe?g)$/i.test(e.name))
      .map((e) => join(dir, e.name))
      .sort();
  } catch {
    return [];
  }
}

async function processFolder(srcDir, outDir, prefix, sizes) {
  const files = await listJpegs(srcDir);
  if (!files.length) return [];
  await mkdir(outDir, { recursive: true });

  const results = [];
  let idx = 1;
  for (const file of files) {
    const num = String(idx).padStart(2, '0');
    const stem = `${prefix}${num}`;
    const fullOut = join(outDir, `${stem}.webp`);

    // Largest webp = source-quality at orig dimensions (max 1600 wide / 1080 tall)
    const meta = await sharp(file).metadata();
    const isVertical = meta.height > meta.width;
    const maxLargest = isVertical ? 1080 : 1600;

    const largestPipeline = sharp(file).rotate();
    if ((isVertical ? meta.height : meta.width) > maxLargest) {
      largestPipeline.resize(isVertical ? { height: maxLargest } : { width: maxLargest });
    }
    await largestPipeline.webp({ quality: QUALITY }).toFile(fullOut);

    for (const w of sizes) {
      const dim = isVertical ? { height: w * (meta.height / meta.width) | 0, width: w } : { width: w };
      const refDim = isVertical ? meta.height : meta.width;
      if (w >= refDim) continue;
      const variantOut = join(outDir, `${stem}-${w}.webp`);
      await sharp(file).rotate().resize({ width: w }).webp({ quality: QUALITY }).toFile(variantOut);
    }

    const s = await stat(fullOut);
    results.push({ name: stem, size: s.size, srcName: basename(file) });
    idx++;
  }
  return results;
}

console.log('Pancakarma horizontal:');
const panH = await processFolder(`${SRC_ROOT}/ajurvedas-pancakarma`, `${OUT_ROOT}/pancakarma`, '', HORIZONTAL_SIZES);
panH.forEach((r) => console.log(`  ${r.name} (${(r.size/1024).toFixed(0)} KB)  ← ${r.srcName}`));

console.log('\nPancakarma vertical:');
const panV = await processFolder(`${SRC_ROOT}/ajurvedas-pancakarma/vertical`, `${OUT_ROOT}/pancakarma`, 'v', VERTICAL_SIZES);
panV.forEach((r) => console.log(`  ${r.name} (${(r.size/1024).toFixed(0)} KB)  ← ${r.srcName}`));

console.log('\nPilgrimage horizontal:');
const pilH = await processFolder(`${SRC_ROOT}/svetcelojums_dienvidindija`, `${OUT_ROOT}/pilgrimage`, '', HORIZONTAL_SIZES);
pilH.forEach((r) => console.log(`  ${r.name} (${(r.size/1024).toFixed(0)} KB)  ← ${r.srcName}`));

console.log('\nPilgrimage vertical:');
const pilV = await processFolder(`${SRC_ROOT}/svetcelojums_dienvidindija/vertical`, `${OUT_ROOT}/pilgrimage`, 'v', VERTICAL_SIZES);
pilV.forEach((r) => console.log(`  ${r.name} (${(r.size/1024).toFixed(0)} KB)  ← ${r.srcName}`));

console.log('\nToms portrait:');
const tomFiles = await listJpegs(`${SRC_ROOT}/tom`);
if (tomFiles.length) {
  await mkdir(OUT_ROOT, { recursive: true });
  const file = tomFiles[0];
  await sharp(file).rotate().resize({ width: 720 }).webp({ quality: QUALITY }).toFile(`${OUT_ROOT}/toms.webp`);
  await sharp(file).rotate().resize({ width: 480 }).webp({ quality: QUALITY }).toFile(`${OUT_ROOT}/toms-480.webp`);
  console.log(`  toms.webp + toms-480.webp`);
}

// Cleanup originals
await rm(SRC_ROOT, { recursive: true, force: true });
console.log(`\nDeleted ${SRC_ROOT}/`);
