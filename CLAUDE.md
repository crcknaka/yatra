# Yatra.lv — project notes

Eleventy static site for a Latvian Ayurvedic-retreat / pilgrimage business. Deployed on Vercel.

## Tech stack

- **Eleventy 3.x** static site generator (Nunjucks templates)
- **Motion One** (npm `motion`) bundled with **esbuild** at build time — no CDN runtime dep
- **Sharp** for image optimization (webp + responsive variants)
- **Resend** (in `api/send.js` Vercel function) — contact-form delivery
- **Cloudflare Turnstile** — bot protection on contact form
- HTML / CSS / JS minified in production via `html-minifier-terser`, `clean-css`, `terser`
- No framework, no React. Vanilla DOM.

## Commands

```bash
npm install              # one-time, after clone
npm run dev              # eleventy --serve on localhost:8080
npm run build            # production build → _site/
npm run clean            # rm -rf _site
```

The build runs ALL post-processing automatically: HTML minification, CSS minification, JS minification, Motion One bundling. There is no separate watch step.

## Directory layout

```
src/                          # Eleventy input
  index.njk, celojumi.njk, pancakarma.njk, pilgrimage.njk, privacy.njk, sitemap.njk
  _includes/
    layouts/base.njk          # shared head/header/footer wrapper
    partials/
      nav.njk, footer.njk
      contact-form.njk        # journeyMode: "all" | "pancakarma" | "pilgrimage"
      contact-info.njk        # phones + Telegram/WhatsApp pills
      pieteikties.njk         # form section wrapper
      par-mums.njk            # "about us" block on home
      leaders.njk             # Swami + Toms portraits + text
      gallery.njk             # 3-col photo grid (horizontal or vertical)
  _data/
    site.js                   # url, phones, Telegram handle, Turnstile key
    journeys.js               # 3 journey options for contact-form select

locales/
  lv.json, ru.json, en.json   # ~315 keys each, full parity

js/
  i18n.js                     # lazy-loads locales/*.json on demand
  main.js                     # nav toggle, lang switcher, form submit
  home.js                     # hero slider
  rooms.js                    # room modal (pancakarma only)
  motion.js                   # esbuild entry → bundled into _site/js/motion.js

css/style.css                 # single stylesheet, BEM-ish

assets/                       # images, copied as-is to _site/assets/
  *.webp + responsive variants (-480, -800, -1200)
  gallery/
    pancakarma/, pilgrimage/  # 01..NN.webp + v01..vNN.webp (vertical)
    swami.webp, toms.webp     # leader portraits
  Standard Room/, Deluxe Room/, Kerala Cottages/  # room galleries

api/send.js                   # Vercel serverless — POSTs to Resend
scripts/
  optimize-images.mjs         # legacy: jpg → webp
  responsive-images.mjs       # generates 480/800/1200/full variants for listed images
  process-gallery.mjs         # one-shot gallery folder processor (kept for reference)
```

## i18n — how it works

- All translatable text lives in `locales/{lv,ru,en}.json`. The keys must stay in parity across all 3 files.
- Latvian is the default. The HTML is pre-rendered in LV (inline as fallback text on `data-i18n` elements).
- On page load, `js/i18n.js` warms `lv.json` in the background (for `t()` calls in other JS like form-submit states / room modal).
- If `localStorage.yatra-lang` is `ru` or `en`, that locale is fetched and applied after first paint.
- Attribute conventions:
  - `data-i18n="key"` — sets `textContent`
  - `data-i18n-html="key"` — sets `innerHTML` (use for content with `<strong>`, `<br>`, `<a>`)
  - `data-i18n-placeholder="key"` — sets `placeholder`

When adding new on-page text, **always add a `data-i18n*` attribute and corresponding key in all 3 locale files**. The audit pattern: any LV character (āēīūčļņšž) appearing on the RU or EN render = an untranslated string.

Quick locale parity check:
```bash
node -e "['lv','ru','en'].forEach(l => { const k = Object.keys(JSON.parse(require('fs').readFileSync('locales/'+l+'.json','utf8'))); console.log(l, k.length); })"
```

## Image workflow

The build does not generate variants — the helper script does. When adding a new image:

```bash
# 1) Drop original (jpg or webp) in assets/
# 2) Convert + generate responsive variants:
node scripts/responsive-images.mjs        # edit TARGETS array first
# 3) Reference in template with srcset:
<img src="/assets/foo-800.webp"
     srcset="/assets/foo-480.webp 480w, /assets/foo-800.webp 800w, /assets/foo-1200.webp 1200w, /assets/foo.webp 1600w"
     sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" decoding="async">
```

Gallery shortcut — use the `gallery.njk` partial:
```njk
{% set galleryFolder = "pancakarma" %}
{% set galleryClass = "gallery--mt-lg" %}        {# or gallery--vertical for portrait sets #}
{% set galleryItems = [
  { stem: "01", alt: "…" },
  { stem: "v02", folder: "pilgrimage", alt: "…", vertical: true }  # per-item folder override
] %}
{% include "partials/gallery.njk" %}
```

For above-the-fold (hero, first journey-card on celojumi) drop `loading="lazy"` and add `fetchpriority="high"`.

For images NOT in our pipeline (e.g. Pexels source jpg), prefer the workflow:
1. Source jpg into a temp folder
2. Sharp script: `.rotate().resize({width}).webp({quality: 82})`
3. Delete original .jpg, keep only .webp + variants

## Contact form

- Frontend submits JSON to `/api/send` (Vercel serverless).
- The function (`api/send.js`) verifies Cloudflare Turnstile, then sends an email via Resend.
- Required env vars on Vercel: `RESEND_API_KEY`, `CONTACT_EMAIL`, `FROM_EMAIL`, `TURNSTILE_SECRET_KEY`.
- The form's "journey" dropdown is rendered from `_data/journeys.js`. Form variants per page:
  - **index**: all 3 options visible
  - **pancakarma**: only the 2 Pančakarma options
  - **pilgrimage**: locked field (no dropdown) — only pilgrimage, sent via hidden input

## Design system / accents

- Two-tone gold palette: `--c-accent: #8b6914` (dark gold for buttons/text) + `--c-gold: #c9a84c` (bright gold for highlights/dividers)
- Section titles have a 60px gold gradient underline (`.section__title::after`)
- Numbered feature cards — apply `.features--numbered` to a `.features` grid; counter() auto-numbers them with italic Playfair `01..NN` in the corner
- Form is wrapped in a card with a gold accent stripe on top
- Hero CTA in nav: filled gold on dark hero, filled accent on light-bg pages
- All hover effects guarded with `@media (hover: hover)` to avoid sticky hover on touch
- Animations: Motion One does scroll-reveal (with skip-if-already-in-viewport guard), hero stagger, page-header stagger
- `prefers-reduced-motion` is respected globally via CSS reset + JS guard in motion.js

## Vercel deployment

`vercel.json` sets:
- `buildCommand: npm run build`, `outputDirectory: _site`
- `cleanUrls: true` (so `/pancakarma` works, not just `/pancakarma.html`)
- Security headers: HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, narrow Permissions-Policy
- Cache-Control: `assets/*` 1 year immutable; `css|js/*` 1 hour revalidate

The `/api/*` directory is auto-detected by Vercel as serverless functions (separate from the Eleventy output).

## Local dev — common gotchas

- **Mac**: All `package.json` scripts use POSIX (`rm -rf`) and work as-is on macOS/Linux. No changes needed.
- **Sharp**: Will auto-install the right native binary for your platform on `npm install`. If it ever errors after switching between Mac/Windows, run `npm rebuild sharp`.
- **Motion One bundling**: The `.eleventy.js` esbuild step bundles `js/motion.js` and writes to `_site/js/motion.js`, overwriting the passthrough copy. Don't pass-through-copy motion.js to a different path.
- **Cloudflare Turnstile on localhost**: The widget will show errors in the console (`Trusted Types`, `Private Access Token`, `xr-spatial-tracking`) — these come from inside the Turnstile iframe, not our code. Captcha still works.
- **Locales**: when editing locale files, keep JSON valid (commas, quotes). Run the parity check (see i18n section) before committing — divergent key counts = bugs.
- **Static images at /assets/**: NEVER hand-edit committed `*.webp` files. Regenerate from source via Sharp script so quality stays consistent.

## Contact data

Phones, Telegram handle (`NarayanaToms`), Turnstile site key live in `src/_data/site.js`. Email destination for the form is `CONTACT_EMAIL` env var on Vercel — defaults to `toms.liepins@gmail.com` if unset (see `api/send.js`).

## Style/convention notes

- Tone: informal LV "Tu" form used (matched by informal Russian "ты" and direct English "you"). Keep consistent.
- Brand names that stay unchanged across all locales: Yatra, Bhakti Marga, Atma Kriya, Toms Liepiņš
- Latvian-only chars (āēīūčļņšž) on RU/EN pages = a missed translation. Audit by viewing each page in each language.
- The Pančakarma vs Panchakarma spelling: LV uses Pančakarma, RU uses Панчакарма, EN uses Panchakarma. Don't homogenize.

## Things to leave alone unless you know why

- `js/i18n.js` lazy-load logic — already optimized so LV users pay zero extra cost
- The two stacked `<img class="hero__bg">` images on index — they sync with hero slider via `data-bg-for` and CSS opacity transitions
- The `.features--numbered` CSS counter mechanism — adding/removing items renumbers automatically
- `_data/journeys.js` — single source of truth for form select values. Change here, not in templates.
- Privacy page — uses i18n. Don't reintroduce hardcoded LV.

## When something breaks

- "page renders but text is wrong on RU/EN" → audit translations (look for LV-specific chars on non-LV render)
- "hero bg doesn't transition" → check `data-bg-for` attrs match slide indices
- "Sharp build error" → `npm rebuild sharp` (especially after switching platforms)
- "Vercel build fails" → check Node version (Eleventy 3 requires ≥18). Set in Vercel project settings if needed.
- "Form submits but no email" → check Vercel env vars; check Turnstile site key in `_data/site.js` matches secret in env
