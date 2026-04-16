import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const files = [
  'index.html',
  'celojumi.html',
  'pancakarma.html',
  'pilgrimage.html',
  'js/rooms.js',
  'js/home.js',
  'js/main.js',
  'css/style.css',
];

// Swap .jpg / .jpeg to .webp EXCEPT og-image.jpg which we keep for social crawler compat.
// Works for URL-encoded paths too because we match on the extension only.
const IMG_EXT_RE = /\.(jpe?g|JPE?G)(?=["'\)])/g;

let totalReplacements = 0;
for (const rel of files) {
  const path = join(process.cwd(), rel);
  let src;
  try { src = await readFile(path, 'utf8'); } catch { continue; }

  let replacementsHere = 0;
  const out = src.replace(/([^\s"'<>(]+)\.(jpe?g|JPE?G)(?=["'\)])/g, (match, stem, ext) => {
    // Skip og-image
    if (/og-image$/i.test(stem)) return match;
    replacementsHere++;
    return `${stem}.webp`;
  });

  if (replacementsHere > 0) {
    await writeFile(path, out);
    console.log(`${rel}: ${replacementsHere} refs updated`);
    totalReplacements += replacementsHere;
  }
}
console.log(`\nTotal: ${totalReplacements} image references updated.`);
