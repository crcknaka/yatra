import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 250 });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

await page.goto('http://localhost:8088/');
await page.waitForLoadState('load');
await page.waitForTimeout(700);

// Header lang (outside menu panel) must be hidden on mobile
const headerLangDisplay = await page.$eval('.lang', (el) => getComputedStyle(el).display);
console.log('header .lang display:', headerLangDisplay);

await page.screenshot({ path: 'scripts/screens/m05-mobile-header-only.png' });

// Menu still has its own lang row
await page.click('#navToggle');
await page.waitForTimeout(500);
const rowVisible = await page.$eval('.nav__lang-row', (el) => getComputedStyle(el).display);
console.log('mobile panel .nav__lang-row display:', rowVisible);
await page.screenshot({ path: 'scripts/screens/m06-mobile-menu-open.png' });

await browser.close();
