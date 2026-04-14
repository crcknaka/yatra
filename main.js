// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('nav__links--open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav__links--open');
  });
});

// Language switcher
const langToggle = document.getElementById('langToggle');
const langMenu = document.getElementById('langMenu');

langToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  langMenu.classList.toggle('lang__menu--open');
});

document.addEventListener('click', () => {
  langMenu.classList.remove('lang__menu--open');
});

langMenu.querySelectorAll('.lang__option').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    langToggle.textContent = lang.toUpperCase();
    langMenu.querySelectorAll('.lang__option').forEach(b => b.classList.remove('lang__option--active'));
    btn.classList.add('lang__option--active');
    langMenu.classList.remove('lang__menu--open');
    localStorage.setItem('yatra-lang', lang);
  });
});

// Restore saved language
const savedLang = localStorage.getItem('yatra-lang');
if (savedLang && savedLang !== 'lv') {
  langMenu.querySelector(`[data-lang="${savedLang}"]`)?.click();
}

// Form submission via Resend API
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Nosūta...';

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
    btn.textContent = 'Nosūtīt pieteikumu';
    alert('Kļūda nosūtot formu. Lūdzu, sazinieties ar mums pa e-pastu vai tālruni.');
  }
});
