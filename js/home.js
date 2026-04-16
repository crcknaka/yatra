// Preselect journey in contact form from ?journey=<key>
(function preselectJourney() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('journey');
  if (!key) return;
  const select = document.getElementById('journey');
  if (!select) return;
  const opt = select.querySelector(`option[data-key="${key}"]`);
  if (opt) select.value = opt.value;
})();

const slider = document.getElementById('heroSlider');
if (slider) {
  const slides = slider.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#heroDots .hero-dot');
  let current = 0;
  let timer = null;
  const interval = 6500;

  function goTo(idx) {
    slides[current].classList.remove('hero-slide--active');
    dots[current]?.classList.remove('hero-dot--active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('hero-slide--active');
    dots[current]?.classList.add('hero-dot--active');
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(current + 1), interval);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide, 10));
      start();
    });
  });

  document.getElementById('heroPrev')?.addEventListener('click', () => {
    goTo(current - 1);
    start();
  });
  document.getElementById('heroNext')?.addEventListener('click', () => {
    goTo(current + 1);
    start();
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
}
