'use client';

import { useEffect } from 'react';

// Adds elegant fade-up-on-scroll to any element with the `.reveal` class.
// Uses IntersectionObserver (no scroll listeners → great performance).
// GPU-accelerated (opacity + transform), respects prefers-reduced-motion.
export default function ScrollReveal() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.visible)'));
      if (prefersReduced) {
        els.forEach((el) => el.classList.add('visible'));
        return;
      }
      const obs = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              (e.target as HTMLElement).classList.add('visible');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      els.forEach((el) => obs.observe(el));
      return obs;
    };

    let obs = reveal();
    // Re-scan when route content changes (Next client nav)
    const t = setInterval(() => { obs = reveal(); }, 1500);
    return () => { clearInterval(t); obs?.disconnect?.(); };
  }, []);

  return null;
}
