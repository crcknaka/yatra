import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const context = await browser.newContext({ ...devices['iPhone 13'], hasTouch: false });
const page = await context.newPage();

await page.goto('http://localhost:8088/');
await page.waitForLoadState('load');
await page.waitForTimeout(600);
await page.click('#navToggle');
await page.waitForTimeout(500);

const activeBtn = page.locator('.nav__lang-row .lang__option[data-lang="lv"]');

const before = await activeBtn.evaluate((el) => getComputedStyle(el).color);
console.log('active LV color before hover:', before);

await activeBtn.hover();
await page.waitForTimeout(400);

const hovered = await activeBtn.evaluate((el) => getComputedStyle(el).color);
console.log('active LV color on hover:   ', hovered);

console.log('same? ', before === hovered);

await page.screenshot({ path: 'scripts/screens/m04-mobile-hover-active.png' });

// And non-active hover still works
const ruBtn = page.locator('.nav__lang-row .lang__option[data-lang="ru"]');
const ruBefore = await ruBtn.evaluate((el) => getComputedStyle(el).color);
await ruBtn.hover();
await page.waitForTimeout(400);
const ruHovered = await ruBtn.evaluate((el) => getComputedStyle(el).color);
console.log('RU color before/after hover:', ruBefore, '→', ruHovered);

await browser.close();
