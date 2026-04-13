'use client';
import { useEffect, useRef } from 'react';

export function useGSAPAnimations() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let interval: any;

    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { TextPlugin } = await import('gsap/TextPlugin');
      gsap.registerPlugin(ScrollTrigger, TextPlugin);

      interval = setInterval(() => ScrollTrigger.refresh(), 2000);
      window.addEventListener('load', () => ScrollTrigger.refresh());

      // ── HERO ENTRANCE ──────────────────────────────────────────────────
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
      heroTl.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, delay: 0.5 })
            .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, '-=0.9')
            .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.9')
            .fromTo('.hero-cta-row', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.9')
            .fromTo('.hero-trust-line', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1 }, '-=0.7')
            .fromTo('.hero-stat', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.15 }, '-=0.7');

      // ── MOUSE TRACKING FOR HERO (Tree related) ──────────────────────────
      const heroSection = document.querySelector('.hero');
      const heroOrbs = document.querySelectorAll('.hero-orb');
      const heroParticles = document.querySelectorAll('.hero-particle');

      if (heroSection) {
        heroOrbs.forEach((orb, i) => {
          gsap.to(orb, {
            y: -180 - i * 90, opacity: 0.1,
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
          });
        });

        const onMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          const xPct = (clientX / innerWidth - 0.5) * 2;
          const yPct = (clientY / innerHeight - 0.5) * 2;

          heroOrbs.forEach((orb, i) => {
            const depth = (i + 1) * 18;
            gsap.to(orb, { x: xPct * depth, y: yPct * depth, duration: 1.2, ease: 'power2.out' });
          });

          heroParticles.forEach((p, i) => {
            const depth = (i + 1) * 8;
            gsap.to(p, { x: xPct * depth, y: yPct * depth, duration: 2, ease: 'power2.out' });
          });
        };
        heroSection.addEventListener('mousemove', onMouseMove as any);
      }

      // ── 3D BUTTON HOVER ANIMATIONS (Plants) ─────────────────────────────
      const buttons3D = document.querySelectorAll('.btn-3d-plant');
      buttons3D.forEach((btn) => {
        const el = btn as HTMLElement;
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { scale: 1.05, rotateX: -8, transformPerspective: 600, y: -4, duration: 0.4, ease: 'back.out(2)' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { scale: 1, rotateX: 0, y: 0, duration: 0.4, ease: 'power3.out' });
        });
        el.addEventListener('mousedown', () => {
          gsap.to(el, { scale: 0.96, rotateX: 4, y: 2, duration: 0.15 });
        });
        el.addEventListener('mouseup', () => {
          gsap.to(el, { scale: 1.05, rotateX: -8, y: -4, duration: 0.3, ease: 'back.out(2)' });
        });
      });

      // ── SPLIT SCROLLER: BA images + Service cards ────────────────────────
      const splitLayout = document.querySelector('.ba-split-layout');
      const serviceCards = gsap.utils.toArray('.service-card-cinematic') as HTMLElement[];
      const baPairs = gsap.utils.toArray('.ba-pair') as HTMLElement[];
      const progressBar = document.querySelector('.ba-progress-bar') as HTMLElement;
      const captionLabel = document.querySelector('.ba-caption-label') as HTMLElement;
      const captionDesc = document.querySelector('.ba-caption-desc') as HTMLElement;

      // BA data for caption updates
      const BA_DATA = [
        { label: 'Organic Recovery', desc: 'Revitalized a dying terrace garden using specialized organic nutrition and root cleaning.' },
        { label: 'Pest Eradication', desc: 'Completely removed severe Mealybug infestation and restored leaf shine for 20+ pots.' },
        { label: 'Balcony Makeover', desc: 'Corrected overwatering damage and rearranged species for optimal sunlight exposure.' },
      ];

      if (splitLayout && serviceCards.length > 0) {
        // Pin the RIGHT section (images) using GSAP
        const rightSection = document.querySelector('.ba-split-right');
        if (rightSection) {
          ScrollTrigger.create({
            trigger: splitLayout,
            start: 'top top', 
            end: 'bottom bottom', 
            pin: rightSection,
            pinSpacing: false, 
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: (self) => {
              // Ensure width is ALWAYS 50vw of the viewport width when pinned
              if (self.pin) {
                gsap.set(self.pin, { width: '50vw' });
              }
            }
          });
        }

        // Init BA pairs — first visible, rest hidden
        baPairs.forEach((pair, idx) => {
          if (idx === 0) {
            gsap.set(pair, { opacity: 1, position: 'relative' });
          } else {
            gsap.set(pair, { opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
          }
          // Init clip — show BEFORE fully
          const clip = pair.querySelector('.ba-before-clip');
          if (clip) gsap.set(clip, { clipPath: 'inset(0 0% 0 0)' });
        });

        let currentBAIndex = 0;

        // For each service card: fade it in + trigger BA transitions
        serviceCards.forEach((card, i) => {
          // Service card entrance
          gsap.set(card, { opacity: 0, y: 40 });
          ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
          });

          // Map service cards to BA pairs (2 cards per 1 transformation)
          const baIdx = Math.min(Math.floor(i / 2), baPairs.length - 1);

          ScrollTrigger.create({
            trigger: card,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => {
              // Swap BA pair if needed
              if (baIdx !== currentBAIndex) {
                baPairs.forEach((p, pi) => {
                  if (pi === baIdx) {
                    gsap.to(p, { opacity: 1, duration: 0.4 });
                  } else {
                    gsap.to(p, { opacity: 0, duration: 0.3 });
                  }
                });
                currentBAIndex = baIdx;
              }

              // Animate the clip: reveal AFTER by clipping away BEFORE
              const clip = baPairs[baIdx]?.querySelector('.ba-before-clip');
              if (clip) {
                gsap.to(clip, { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power2.inOut' });
              }

              // Update progress bar
              if (progressBar) {
                progressBar.style.width = `${((baIdx + 1) / baPairs.length) * 100}%`;
              }

              // Update caption
              if (captionLabel && BA_DATA[baIdx]) captionLabel.textContent = BA_DATA[baIdx].label;
              if (captionDesc && BA_DATA[baIdx]) captionDesc.textContent = BA_DATA[baIdx].desc;
            },
            onLeaveBack: () => {
              // When scrolling back, show BEFORE again
              const clip = baPairs[baIdx]?.querySelector('.ba-before-clip');
              if (clip) {
                gsap.to(clip, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.inOut' });
              }

              // Swap back if needed
              const prevIdx = Math.max(0, baIdx - 1);
              if (baIdx > 0 && baIdx === currentBAIndex) {
                baPairs.forEach((p, pi) => {
                  gsap.to(p, { opacity: pi === prevIdx ? 1 : 0, duration: 0.4 });
                });
                currentBAIndex = prevIdx;
                if (progressBar) progressBar.style.width = `${((prevIdx + 1) / baPairs.length) * 100}%`;
                if (captionLabel && BA_DATA[prevIdx]) captionLabel.textContent = BA_DATA[prevIdx].label;
                if (captionDesc && BA_DATA[prevIdx]) captionDesc.textContent = BA_DATA[prevIdx].desc;
              }
            },
          });
        });
      }

      setTimeout(() => ScrollTrigger.refresh(), 1500);
    };

    init();

    return () => {
      import('gsap/ScrollTrigger').then((mod) => {
        if (mod?.ScrollTrigger) mod.ScrollTrigger.getAll().forEach((t) => t.kill());
      });
      clearInterval(interval);
    };
  }, []);
}
