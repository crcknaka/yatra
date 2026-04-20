import { animate, inView, stagger } from "https://esm.sh/motion@12.23.12";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  // Respect user preference — let CSS handle everything, no JS animations.
  // (Reveal targets stay at their natural opacity/position because we only
  // set the "from" state when we're about to animate.)
} else {
  // --- Section reveal on scroll ---
  // Sections that animate in when they enter viewport.
  // Exclude hero (it has its own slider transition) and the page header
  // since those are above-the-fold and already visible on load.
  const revealSelector = [
    ".section:not(.hero)",
    ".journeys",
    ".itinerary",
    ".pricing",
    ".price-details",
    ".feature-row",
  ].join(", ");

  document.querySelectorAll(revealSelector).forEach((el) => {
    // Set initial state (hidden + offset) before observing, so nothing flashes.
    el.style.opacity = "0";
    el.style.transform = "translateY(28px)";
    el.style.willChange = "opacity, transform";

    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], y: [28, 0] },
          { duration: 0.7, easing: [0.22, 0.68, 0, 1] }
        ).finished.then(() => {
          el.style.willChange = "";
        });
        // inView runs once by default; no leave handler needed.
      },
      { amount: 0.15 }
    );
  });

  // --- Hero initial stagger (only the first-shown slide, only on home) ---
  const heroContent = document.querySelector(".hero-slide--active .hero__content");
  if (heroContent) {
    const items = Array.from(heroContent.children);
    // Set initial hidden state before animating in, so there's no flash.
    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(16px)";
    });
    animate(
      items,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.75, delay: stagger(0.1, { startDelay: 0.2 }), easing: [0.22, 0.68, 0, 1] }
    );
  }

  // --- Page header stagger for journey pages (breadcrumb → label → title → meta → CTA) ---
  const pageHeader = document.querySelector(".page-header__title")?.closest(".container");
  if (pageHeader && !document.querySelector(".hero-slider")) {
    const items = Array.from(pageHeader.children);
    items.forEach((item) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(16px)";
    });
    animate(
      items,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.7, delay: stagger(0.08, { startDelay: 0.1 }), easing: [0.22, 0.68, 0, 1] }
    );
  }
}
