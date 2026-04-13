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
