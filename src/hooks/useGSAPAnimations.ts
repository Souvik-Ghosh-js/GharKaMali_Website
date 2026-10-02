'use client';
import { useEffect } from 'react';

/**
 * Home page entrance + 3D plant-button hover. Scroll-driven motion lives in
 * useStoryScroll; this hook must not create ScrollTriggers or call
 * ScrollTrigger.refresh() on a timer (that re-measured pins mid-scroll and
 * made the page jump).
 */
export function useGSAPAnimations() {
  useEffect(() => {
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    (async () => {
      const gsap = (await import('gsap')).default;
      if (cancelled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      // ── HERO ENTRANCE (after the page loader fades) ──
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.1 } });
      tl.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, delay: 0.5 })
        .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8')
        .fromTo('.hero-cta-row', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8');
      cleanups.push(() => tl.kill());

      // ── 3D BUTTON HOVER (plant buttons) ──
      document.querySelectorAll<HTMLElement>('.btn-3d-plant').forEach(el => {
        const enter = () => gsap.to(el, { scale: 1.05, rotateX: -8, transformPerspective: 600, y: -4, duration: 0.4, ease: 'back.out(2)' });
        const leave = () => gsap.to(el, { scale: 1, rotateX: 0, y: 0, duration: 0.4, ease: 'power3.out' });
        const down = () => gsap.to(el, { scale: 0.96, rotateX: 4, y: 2, duration: 0.15 });
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mouseleave', leave);
        el.addEventListener('mousedown', down);
        el.addEventListener('mouseup', enter);
        cleanups.push(() => {
          el.removeEventListener('mouseenter', enter);
          el.removeEventListener('mouseleave', leave);
          el.removeEventListener('mousedown', down);
          el.removeEventListener('mouseup', enter);
        });
      });
    })();

    return () => {
      cancelled = true;
      cleanups.forEach(f => f());
    };
  }, []);
}
