import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('../assets/', import.meta.url).pathname.replace(/^\//, '');
const MAX_WIDTH = 1600;
const QUALITY = 82;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function isPhoto(path) {
  const ext = extname(path).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg';
}

async function optimize(path) {
  const outPath = path.replace(/\.(jpe?g|JPE?G)$/, '.webp');
  const img = sharp(path).rotate();
  const meta = await img.metadata();
  const pipeline = meta.width > MAX_WIDTH
    ? img.resize({ width: MAX_WIDTH })
    : img;
  await pipeline.webp({ quality: QUALITY }).toFile(outPath);
  const [before, after] = await Promise.all([stat(path), stat(outPath)]);
  return {
    path: path.replace(ROOT, 'assets/'),
    before: before.size,
    after: after.size,
    savedPct: Math.round((1 - after.size / before.size) * 100),
  };
}

const files = (await walk(ROOT)).filter(isPhoto);
console.log(`Found ${files.length} JPEGs. Converting to WebP (q=${QUALITY}, max ${MAX_WIDTH}px)...\n`);

let totalBefore = 0, totalAfter = 0;
for (const f of files) {
  try {
    const r = await optimize(f);
    totalBefore += r.before;
    totalAfter += r.after;
    console.log(`${r.savedPct.toString().padStart(3)}%  ${(r.before/1024).toFixed(0).padStart(5)} → ${(r.after/1024).toFixed(0).padStart(5)} KB  ${r.path}`);
  } catch (e) {
    console.error(`FAIL ${f}: ${e.message}`);
  }
}
const mbBefore = (totalBefore / 1024 / 1024).toFixed(2);
const mbAfter = (totalAfter / 1024 / 1024).toFixed(2);
const pct = Math.round((1 - totalAfter / totalBefore) * 100);
console.log(`\nTotal: ${mbBefore} MB → ${mbAfter} MB (-${pct}%)`);
