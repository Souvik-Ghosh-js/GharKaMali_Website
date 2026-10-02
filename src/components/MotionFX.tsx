'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Site-wide motion layer (Verdant theme).
 *
 *  - Aurora backdrop, scroll progress bar (event-driven, idle when still)
 *  - Pauses infinite CSS animations (hero ambience, marquees) while offscreen
 *  - Scroll reveals: auto for section headings / cards, opt-in with [data-reveal]
 *  - Parallax: [data-parallax="0.2"]
 *  - Cursor spotlight on cards (.card, .v-glass, [data-spot]) — light only,
 *    never moves the card, so hover can't flicker at the edges.
 *
 * Writes are transform/opacity/CSS-var only and skipped when unchanged.
 * Everything heavy is off for touch devices and prefers-reduced-motion.
 */

const REVEAL_SEL = ['[data-reveal]', 'main h2', 'section h2', '.section-header', '.card'].join(',');
const SPOT_SEL = '.card, .v-glass, [data-spot]';

export default function MotionFX() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // ── Progress bar + parallax: event-driven (idle when the page is still) ──
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let parallaxEls: HTMLElement[] = [];
    const lastOff = new WeakMap<HTMLElement, number>();

    const update = () => {
      raf = 0;
      const y = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (reduce || !parallaxEls.length) return;
      // Read all rects first, then write (no layout thrash).
      const vh = innerHeight;
      const offs = parallaxEls.map(el => {
        const host = (el.parentElement || el).getBoundingClientRect();
        if (host.bottom < -200 || host.top > vh + 200) return null;
        return Math.round((host.top + host.height / 2 - vh / 2) * parseFloat(el.dataset.parallax || '0'));
      });
      parallaxEls.forEach((el, i) => {
        const o = offs[i];
        if (o === null || lastOff.get(el) === o) return;
        lastOff.set(el, o);
        el.style.transform = `translate3d(0, ${o}px, 0)`;
      });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };

    // Pause infinite CSS animations (hero ambience, marquees) while offscreen.
    const pauseIO = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('fx-paused', !e.isIntersecting));
    }, { rootMargin: '80px' });
    const watched = new WeakSet<Element>();

    let collectT: ReturnType<typeof setTimeout> | undefined;
    const collect = () => {
      parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
      document.querySelectorAll('.hero, .marquee-container, [data-anim]').forEach(el => {
        if (watched.has(el)) return;
        watched.add(el);
        pauseIO.observe(el);
      });
      schedule();
    };
    collect();
    const mo = new MutationObserver(() => { clearTimeout(collectT); collectT = setTimeout(collect, 250); });
    mo.observe(document.body, { childList: true, subtree: true });

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf); mo.disconnect(); pauseIO.disconnect(); clearTimeout(collectT);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  }, []);

  // ── Per-route binding: reveals + spotlight ───────────────────────────────
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cleanups: (() => void)[] = [];

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        // Drop the reveal classes once played so nothing lingers on the element.
        const done = (ev: AnimationEvent) => {
          if (ev.target !== el) return;
          el.removeEventListener('animationend', done);
          el.classList.remove('fx-reveal', 'fx-reveal-clip', 'fx-in');
        };
        el.addEventListener('animationend', done);
        el.classList.add('fx-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    const bindReveal = (el: HTMLElement) => {
      if (el.dataset.fxR) return;
      el.dataset.fxR = '1';
      if (reduce || el.closest('.hero, nav, header, footer, [data-no-reveal], [data-story]')) return;
      // Only hide what is still below the fold, so nothing visible ever flashes.
      if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
      const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
      el.style.setProperty('--fx-delay', `${(Math.max(0, sibs.indexOf(el)) % 6) * 60}ms`);
      el.classList.add(el.matches('h2') ? 'fx-reveal-clip' : 'fx-reveal');
      io.observe(el);
    };

    const bindSpot = (el: HTMLElement) => {
      if (el.dataset.fxS || !fine || reduce) return;
      el.dataset.fxS = '1';
      if (el.closest('[data-no-spot]')) return;
      const after = getComputedStyle(el, '::after').content;
      if (after && after !== 'none') return; // ::after already used by the card
      el.classList.add('fx-spot');
      let frame = 0, px = 0, py = 0;
      const move = (e: PointerEvent) => {
        px = e.clientX; py = e.clientY;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${Math.round(px - r.left)}px`);
          el.style.setProperty('--my', `${Math.round(py - r.top)}px`);
        });
      };
      el.addEventListener('pointermove', move, { passive: true });
      cleanups.push(() => { el.removeEventListener('pointermove', move); cancelAnimationFrame(frame); delete el.dataset.fxS; });
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(REVEAL_SEL).forEach(bindReveal);
      document.querySelectorAll<HTMLElement>(SPOT_SEL).forEach(bindSpot);
    };

    // Content arrives late (react-query), so rescan on DOM changes (debounced).
    let t: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 200); });
    const start = setTimeout(() => { scan(); mo.observe(document.body, { childList: true, subtree: true }); }, 80);
    // Safety net: never leave anything hidden that is already on screen.
    const safety = setTimeout(() => document.querySelectorAll('.fx-reveal:not(.fx-in), .fx-reveal-clip:not(.fx-in)').forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight) el.classList.remove('fx-reveal', 'fx-reveal-clip');
    }), 2500);

    return () => {
      clearTimeout(start); clearTimeout(safety); clearTimeout(t);
      mo.disconnect(); io.disconnect();
      cleanups.forEach(f => f());
    };
  }, [pathname]);

  return (
    <>
      <div className="fx-aurora" aria-hidden>
        <span /><span /><span />
      </div>
      <div ref={barRef} className="fx-progress" aria-hidden />
    </>
  );
}
