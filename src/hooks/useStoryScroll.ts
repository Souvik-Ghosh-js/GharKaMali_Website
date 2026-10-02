'use client';
import { useEffect } from 'react';

/**
 * Home page scroll story. Each section is a "beat" scrubbed to the scrollbar,
 * so it plays forward and backward with the reader. Elements are found by
 * [data-story="..."] hooks in page.tsx; missing hooks are simply skipped.
 */
export function useStoryScroll(deps: unknown[] = []) {
  useEffect(() => {
    let mm: any;
    let ro: ResizeObserver | undefined;
    let killed = false;

    (async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (killed) return;
      gsap.registerPlugin(ScrollTrigger);
      // Mobile URL-bar show/hide must not re-measure pins mid-scroll.
      ScrollTrigger.config({ ignoreMobileResize: true });

      const q = (s: string) => document.querySelector<HTMLElement>(s);
      const qa = (s: string) => gsap.utils.toArray<HTMLElement>(s);

      mm = gsap.matchMedia();
      mm.add(
        {
          desktop: '(min-width: 1025px)',
          motion: '(prefers-reduced-motion: no-preference)',
        },
        (ctx: any) => {
          const { desktop, motion } = ctx.conditions;
          if (!motion) return;

          // ── 1. HERO: shrink into a card, layers drift at different depths ──
          const hero = q('[data-story="hero"]');
          if (hero) {
            const tl = gsap.timeline({
              scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
            });
            // Transform-only (GPU) — clip-path here repainted the whole hero every frame.
            tl.fromTo(hero, { scale: 1 }, { scale: 0.94, ease: 'none' }, 0)
              .to('[data-story="hero-media"]', { yPercent: 18, scale: 1.12, ease: 'none' }, 0)
              .to('[data-story="hero-copy"]', { y: -140, opacity: 0, ease: 'none' }, 0)
              .to('[data-story="hero-stats"]', { y: -260, ease: 'none' }, 0)
              .to('[data-story="hero-orbit"]', { rotate: 50, scale: 1.25, ease: 'none' }, 0)
              .to('.fx-scroll-cue', { opacity: 0, ease: 'none', duration: 0.2 }, 0);
          }

          // ── Section eyebrow rules draw themselves ──
          qa('[data-story-rule]').forEach(el => {
            gsap.fromTo(el, { scaleX: 0 }, {
              scaleX: 1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 60%', scrub: true },
            });
          });

          // ── Headings: masked word rise ──
          qa('[data-story="title"]').forEach(el => {
            const words = el.querySelectorAll('.fx-w > i');
            if (!words.length) return;
            gsap.fromTo(words, { yPercent: 110 }, {
              yPercent: 0, stagger: 0.06, ease: 'power3.out', duration: 1,
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
            });
          });

          // ── Word-by-word ink fill (read-along) ──
          qa('[data-story="fill"]').forEach(el => {
            const words = el.querySelectorAll('.fx-w');
            gsap.fromTo(words, { opacity: 0.14 }, {
              opacity: 1, stagger: 0.1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
            });
          });

          // ── 2. NCR: city pins scatter in and settle ──
          const pills = qa('[data-story="city"]');
          if (pills.length) {
            gsap.fromTo(pills, {
              opacity: 0,
              x: (i: number) => [-160, 120, -80, 180, -200, 90, 0][i % 7],
              y: (i: number) => [80, -60, 120, 40, -90, 140, 160][i % 7],
              rotate: (i: number) => [-14, 10, -6, 16, -10, 8, 0][i % 7],
              scale: 0.7,
            }, {
              opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, ease: 'none', stagger: 0.04,
              scrollTrigger: { trigger: pills[0].parentElement, start: 'top 95%', end: 'top 50%', scrub: 1 },
            });
          }

          // ── 3. WHY CHOOSE: problems light up, photo straightens ──
          qa('[data-story="problem"]').forEach((el, i) => {
            gsap.fromTo(el, desktop ? { opacity: 0.2, x: -40 } : { opacity: 0.2, y: 24 }, {
              opacity: 1, x: 0, y: 0, ease: 'none',
              scrollTrigger: { trigger: el, start: `top ${88 - i * 4}%`, end: `top ${62 - i * 4}%`, scrub: true },
            });
          });
          const photo = q('[data-story="photo"]');
          if (photo) {
            gsap.fromTo(photo, { rotate: 7, y: 80, scale: 0.92 }, {
              rotate: -1.5, y: -20, scale: 1, ease: 'none',
              scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom 40%', scrub: true },
            });
          }

          // ── 4. TICKER: skews with scroll velocity ──
          const ticker = q('[data-story="ticker"]');
          if (ticker) {
            const skew = gsap.quickTo(ticker, 'skewX', { duration: 0.4, ease: 'power3' });
            ScrollTrigger.create({
              trigger: ticker, start: 'top bottom', end: 'bottom top',
              onUpdate: (self: any) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -250)),
              onLeave: () => skew(0), onLeaveBack: () => skew(0),
            });
          }

          // ── 5. ₹349 VISIT: cards deal in one by one ──
          const utils = qa('[data-story="utility"]');
          if (utils.length) {
            gsap.fromTo(utils, { opacity: 0, y: 140, rotateX: -35, rotateZ: (i: number) => (i - 2) * 4 }, {
              opacity: 1, y: 0, rotateX: 0, rotateZ: 0, stagger: 0.12, ease: 'none',
              transformPerspective: 900,
              scrollTrigger: { trigger: utils[0].parentElement, start: 'top 95%', end: 'top 35%', scrub: 1 },
            });
          }

          // ── 6. STEPS: pin, draw the line, fan the cards out of a stack ──
          const steps = q('[data-story="steps"]');
          const stepCards = qa('[data-story="step"]');
          if (desktop && steps && stepCards.length) {
            // No GSAP pin: pinning re-parents React's DOM (crashes on route change).
            // The section is tall and its content is position:sticky (CSS), so
            // we just scrub across the section's scroll length.
            const tl = gsap.timeline({
              scrollTrigger: { trigger: steps.closest('section'), start: 'top top', end: 'bottom bottom', scrub: 1 },
            });
            tl.fromTo('[data-story="step-line"]', { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 3 }, 0);
            stepCards.forEach((c, i) => {
              // Start as a visible stack behind the centre card, then fan out.
              const toCentre = (1 - i) * (c.offsetWidth * 0.92);
              tl.fromTo(c, { x: toCentre, scale: i === 1 ? 1 : 0.86, opacity: i === 1 ? 1 : 0.55, rotate: (1 - i) * -5, zIndex: i === 1 ? 3 : 1 },
                           { x: 0, scale: 1, opacity: 1, rotate: 0, ease: 'power2.out', duration: 1.4 }, i === 1 ? 0 : 0.6 + Math.abs(i - 1) * 0.2);
            });
          }

          // ── 7. MAKEOVER: curtain opens, headline slides in from both sides ──
          const gm = q('[data-story="makeover"]');
          if (gm) {
            gsap.fromTo(gm, { scale: 0.9 }, {
              scale: 1, ease: 'none',
              scrollTrigger: { trigger: gm, start: 'top bottom', end: 'top 15%', scrub: true },
            });
            const tl = gsap.timeline({
              scrollTrigger: { trigger: gm, start: 'top 75%', end: 'top 10%', scrub: 1 },
            });
            tl.fromTo('.gm-hl-white', { xPercent: -60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none' }, 0)
              .fromTo('.gm-hl-gold', { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'none' }, 0)
              .fromTo('.gm-home-rule', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0.3)
              .fromTo(['.gm-home-sub', '.gm-adjustable-badge', '.gm-home-cta'], { y: 40, opacity: 0 },
                      { y: 0, opacity: 1, stagger: 0.15, ease: 'none' }, 0.4)
              .fromTo('.gm-home-left', { scale: 1.15 }, { scale: 1, ease: 'none' }, 0);
          }

          // ── 8. VALUES: cards flip up ──
          const values = qa('[data-story="value"]');
          if (values.length) {
            gsap.fromTo(values, { opacity: 0, rotateY: -40, x: 60 }, {
              opacity: 1, rotateY: 0, x: 0, stagger: 0.12, ease: 'none', transformPerspective: 1000,
              scrollTrigger: { trigger: values[0].parentElement, start: 'top 90%', end: 'top 40%', scrub: 1 },
            });
          }

          // ── 9. FINAL CTA: box zooms up from the video ──
          const cta = q('[data-story="cta"]');
          if (cta) {
            gsap.fromTo(cta, { scale: 0.82, y: 80, opacity: 0.4 }, {
              scale: 1, y: 0, opacity: 1, ease: 'none',
              scrollTrigger: { trigger: cta, start: 'top bottom', end: 'center 60%', scrub: true },
            });
          }

          // ── Services banner + plans: rise in 3D ──
          qa('[data-story="rise"]').forEach(el => {
            gsap.fromTo(el, { y: 120, rotateX: 18, opacity: 0, transformPerspective: 1200 }, {
              y: 0, rotateX: 0, opacity: 1, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true },
            });
          });

          // ── Blog images: wipe open + inner parallax ──
          qa('[data-story="wipe"]').forEach(el => {
            gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, {
              clipPath: 'inset(0% 0% 0% 0% round 24px)', ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: true },
            });
            const img = el.querySelector('img');
            if (img) gsap.fromTo(img, { scale: 1.3, yPercent: -8 }, {
              scale: 1.05, yPercent: 8, ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            });
          });
        },
      );

      // Re-measure only when the page height really changes (images, API data).
      let lastH = document.documentElement.scrollHeight;
      let t: ReturnType<typeof setTimeout> | undefined;
      ro = new ResizeObserver(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastH) < 4) return;
        lastH = h;
        clearTimeout(t);
        t = setTimeout(() => ScrollTrigger.refresh(), 300);
      });
      ro.observe(document.body);
    })();

    return () => {
      killed = true;
      ro?.disconnect();
      mm?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
