import { chromium, devices } from 'playwright';

const BASE = 'http://localhost:8088';

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

await page.goto(`${BASE}/`);
await page.waitForLoadState('load');
await page.waitForTimeout(800);
await page.screenshot({ path: 'scripts/screens/m01-mobile-closed.png' });

// Open the hamburger menu
await page.click('#navToggle');
await page.waitForTimeout(600);
await page.screenshot({ path: 'scripts/screens/m02-mobile-menu-open.png' });

// Check that the lang row is visible inside the menu panel
const langRowVisible = await page.$eval('.nav__lang-row', (el) => {
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return {
    display: style.display,
    opacity: style.opacity,
    width: r.width,
    height: r.height,
    inViewport: r.x >= 0 && r.right <= window.innerWidth && r.bottom > 0 && r.top < window.innerHeight,
  };
});
console.log('lang row:', langRowVisible);

// Click RU button inside the menu's lang row
await page.click('.nav__lang-row .lang__option[data-lang="ru"]');
await page.waitForTimeout(600);
const htmlLang = await page.$eval('html', (el) => el.getAttribute('data-lang'));
console.log('html[data-lang] after clicking RU:', htmlLang);

// And active state in the mobile row
const activeClass = await page.$eval(
  '.nav__lang-row .lang__option[data-lang="ru"]',
  (el) => el.classList.contains('lang__option--active')
);
console.log('RU button active class:', activeClass);

await page.screenshot({ path: 'scripts/screens/m03-mobile-ru-selected.png' });

await browser.close();
console.log('Done.');
