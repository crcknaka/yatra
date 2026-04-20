import { chromium } from 'playwright';

const BASE = 'http://localhost:8088';

const browser = await chromium.launch({ headless: false, slowMo: 250 });
const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
const page = await context.newPage();

page.on('pageerror', (err) => console.log('[pageerror]', err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[console.error]', msg.text());
});

console.log('→ index');
await page.goto(`${BASE}/`);
await page.waitForLoadState('load');

// Check that Motion One initial animations fired (opacity should be 1 after anim)
await page.waitForTimeout(1200);
const heroOpacity = await page.$eval('.hero-slide--active .hero__label', (el) =>
  getComputedStyle(el).opacity
);
console.log('hero label opacity after mount:', heroOpacity);

await page.screenshot({ path: 'scripts/screens/01-index-top.png' });

// Scroll to Par mums to trigger scroll reveal
await page.evaluate(() => {
  document.querySelector('#par-mums')?.scrollIntoView({ behavior: 'smooth' });
});
await page.waitForTimeout(1400);
const parmumsOpacity = await page.$eval('#par-mums', (el) => getComputedStyle(el).opacity);
console.log('par-mums opacity after reveal:', parmumsOpacity);
await page.screenshot({ path: 'scripts/screens/02-index-parmums.png' });

// Pieteikties section
await page.evaluate(() => document.querySelector('#pieteikties')?.scrollIntoView({ behavior: 'smooth' }));
await page.waitForTimeout(1400);
await page.screenshot({ path: 'scripts/screens/03-index-form.png' });

// celojumi
console.log('→ celojumi');
await page.goto(`${BASE}/celojumi`);
await page.waitForLoadState('load');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'scripts/screens/04-celojumi.png' });

// Hover on journey card
const firstCard = page.locator('.journey-card').first();
await firstCard.hover();
await page.waitForTimeout(600);
await page.screenshot({ path: 'scripts/screens/05-celojumi-hover.png' });

// pancakarma
console.log('→ pancakarma');
await page.goto(`${BASE}/pancakarma`);
await page.waitForLoadState('load');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'scripts/screens/06-pancakarma-top.png' });

// Scroll to form
await page.evaluate(() => document.querySelector('#pieteikties')?.scrollIntoView({ behavior: 'smooth' }));
await page.waitForTimeout(1400);
const selectOptions = await page.$$eval('#journey option', (opts) => opts.map((o) => o.textContent.trim()));
console.log('pancakarma form options:', selectOptions);
await page.screenshot({ path: 'scripts/screens/07-pancakarma-form.png' });

// pilgrimage
console.log('→ pilgrimage');
await page.goto(`${BASE}/pilgrimage`);
await page.waitForLoadState('load');
await page.waitForTimeout(1200);
await page.evaluate(() => document.querySelector('#pieteikties')?.scrollIntoView({ behavior: 'smooth' }));
await page.waitForTimeout(1400);
const lockedJourney = await page.$eval('.form__journey-locked', (el) => el.textContent.trim()).catch(() => null);
console.log('pilgrimage locked journey text:', lockedJourney);
await page.screenshot({ path: 'scripts/screens/08-pilgrimage-form.png' });

// Check Motion library actually loaded
const motionLoaded = await page.evaluate(() =>
  [...performance.getEntriesByType('resource')]
    .filter((r) => r.name.includes('motion'))
    .map((r) => ({ name: r.name, ok: r.transferSize > 0 || r.decodedBodySize > 0 }))
);
console.log('motion network:', motionLoaded);

await browser.close();
console.log('Done.');
