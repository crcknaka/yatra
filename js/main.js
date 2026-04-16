// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Mobile menu: backdrop click + Escape close
const navBackdrop = document.createElement('div');
navBackdrop.className = 'nav__backdrop';
navBackdrop.setAttribute('aria-hidden', 'true');
document.body.appendChild(navBackdrop);

function openMenu() {
  navLinks.classList.add('nav__links--open');
  navBackdrop.classList.add('nav__backdrop--open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  navLinks.classList.remove('nav__links--open');
  navBackdrop.classList.remove('nav__backdrop--open');
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  navLinks.classList.contains('nav__links--open') ? closeMenu() : openMenu();
});

navBackdrop.addEventListener('click', closeMenu);

const navClose = document.getElementById('navClose');
if (navClose) navClose.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('nav__links--open')) closeMenu();
});

// Language switcher
const langToggleBtn = document.getElementById('langToggle');
const langMenu = document.getElementById('langMenu');

langToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langMenu.classList.toggle('lang__menu--open');
});

document.addEventListener('click', () => {
  langMenu.classList.remove('lang__menu--open');
});

langMenu.querySelectorAll('.lang__option').forEach(btn => {
  btn.addEventListener('click', () => {
    setLang(btn.dataset.lang);
    langMenu.classList.remove('lang__menu--open');
  });
});

// Restore saved language
const savedLang = localStorage.getItem('yatra-lang');
if (savedLang && savedLang !== 'lv') {
  setLang(savedLang);
}

// Preselect journey via [data-preselect] on in-page CTAs
document.querySelectorAll('a[data-preselect]').forEach(link => {
  link.addEventListener('click', () => {
    const select = document.getElementById('journey');
    if (!select) return;
    const opt = select.querySelector(`option[data-key="${link.dataset.preselect}"]`);
    if (opt) select.value = opt.value;
  });
});

// Form submission via Resend API
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (form) form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = t('form.sending');

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      form.classList.add('hidden');
      formSuccess.classList.remove('hidden');
      form.reset();
    } else {
      throw new Error('Submit failed');
    }
  } catch {
    btn.disabled = false;
    btn.textContent = t('form.submit');
    alert(t('form.error'));
  }
});
