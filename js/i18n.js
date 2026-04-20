// Lazy-loaded translations. Dictionaries live in /locales/{lang}.json and are
// fetched on first use (or on language change). Default page content is
// pre-rendered in LV, so LV fetch is only needed when JS calls t() or when
// the user switches language and comes back.

const translations = {};
const loadPromises = {};
const DEFAULT_LANG = 'lv';
let currentLang = DEFAULT_LANG;

function loadLocale(lang) {
  if (translations[lang]) return Promise.resolve(translations[lang]);
  if (loadPromises[lang]) return loadPromises[lang];

  loadPromises[lang] = fetch(`/locales/${lang}.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((dict) => {
      translations[lang] = dict || {};
      return translations[lang];
    })
    .catch(() => (translations[lang] = {}));

  return loadPromises[lang];
}

async function setLang(lang) {
  const dict = await loadLocale(lang);
  if (!dict || Object.keys(dict).length === 0) return;

  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key] != null) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.dataset.i18nHtml;
    if (dict[key] != null) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] != null) el.placeholder = dict[key];
  });

  if (dict['meta.title']) document.title = dict['meta.title'];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict['meta.description']) {
    metaDesc.content = dict['meta.description'];
  }

  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = lang.toUpperCase();

  document.querySelectorAll('.lang__option').forEach((btn) => {
    btn.classList.toggle('lang__option--active', btn.dataset.lang === lang);
  });

  try { localStorage.setItem('yatra-lang', lang); } catch {}
}

function getLang() {
  return currentLang;
}

// Synchronous lookup used by other JS (form states, modal titles).
// Returns the key as a last-resort fallback if the dict hasn't loaded yet —
// callers use this on user interaction, by which point LV has been fetched.
function t(key) {
  return (translations[currentLang] && translations[currentLang][key])
    || (translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key])
    || key;
}

// Warm up the default dictionary so t() calls from other scripts have data.
loadLocale(DEFAULT_LANG);

// Restore saved language preference (fires after DOM is ready).
(function restoreSavedLang() {
  let saved;
  try { saved = localStorage.getItem('yatra-lang'); } catch {}
  if (saved && saved !== DEFAULT_LANG) setLang(saved);
})();
