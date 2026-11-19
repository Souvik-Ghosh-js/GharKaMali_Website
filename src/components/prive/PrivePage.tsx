'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import s from './prive.module.css';

const RESERVE_URL = 'https://wa.me/919643701701?text=Hello%20GharKaMali%2C%20I%20would%20like%20to%20reserve%20my%20seat%20for%20Priv%C3%A9.';
const POTS = [
  { src: '/prive_pot1.jpg', ratio: 0.72 },
  { src: '/prive_pot2.jpg', ratio: 1 },
  { src: '/prive_pot3.jpg', ratio: 0.82 },
  { src: '/prive_pot4.jpg', ratio: 0.9 },
];
const FEATURES = ['Rare pumice stone', 'Handcrafted by artisans', 'Architectural forms', 'Interior & exterior luxury', 'Bespoke sizes'];
const STATEMENT = ['A', 'limited', 'collection', 'of', 'sculptural', 'planters.'];

export default function PrivePage() {
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);

  // Reveal-on-scroll: plays once per element.
  useEffect(() => {
    const els = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-reveal]') ?? []);
    if (typeof IntersectionObserver === 'undefined') { els.forEach(e => e.classList.add(s.in)); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add(s.in); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);

  // Statement: words brighten one after another as you scroll (opacity only).
  useEffect(() => {
    const h = statement.current;
    if (!h || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = Array.from(h.querySelectorAll<HTMLElement>('span'));
    let raf = 0;
    const run = () => {
      raf = 0;
      const r = h.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      words.forEach((w, i) => {
        const k = Math.min(1, Math.max(0, (p - i * 0.11) / 0.3));
        w.style.opacity = String(0.16 + 0.84 * k);
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(run); };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    run();
    return () => { window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); cancelAnimationFrame(raf); };
  }, []);

  const open = () => sheet.current?.showModal();
  const close = () => sheet.current?.close();

  return (
    <>
      <Navbar />
      <div ref={root} className={s.page}>
        {/* Hero */}
        <section className={s.hero}>
          <div className={`container ${s.heroGrid}`}>
            <div className={s.heroText}>
              <h1 className={s.wordmark}>PRIVÉ</h1>
              <p className={s.by}>by GharKaMali</p>
              <p className={s.tagline}>Artisanal planters for curated spaces.</p>
              <button type="button" className={s.cta} onClick={open}>Reserve your seat</button>
            </div>
            <div className={s.sceneWrap}>
              <Image src="/prive_scene.jpg" alt="Privé planters in a curated space" fill priority sizes="(min-width: 900px) 55vw, 100vw" className={s.scene} />
            </div>
          </div>
        </section>

        {/* Statement */}
        <section className={s.statement}>
          <div className="container">
            <h2 ref={statement} className={s.statementText}>
              {STATEMENT.map((w, i) => <span key={w + i}>{w}{i < STATEMENT.length - 1 ? ' ' : ''}</span>)}
            </h2>
          </div>
        </section>

        {/* The forms */}
        <section className="container" aria-label="The collection">
          <div className={s.forms}>
            <div className={s.col}>
              <Frame {...POTS[0]} />
              <Frame {...POTS[2]} />
            </div>
            <div className={`${s.col} ${s.colRight}`}>
              <Frame {...POTS[1]} delay={140} />
              <Frame {...POTS[3]} delay={140} />
            </div>
          </div>
        </section>

        {/* Stone interlude */}
        <div className={s.band} aria-hidden="true">
          <Image src="/prive_texture.jpg" alt="" fill sizes="100vw" className={s.bandImg} />
          <div className={s.bandFade} />
        </div>

        {/* Features */}
        <section className="container">
          <ul className={`${s.features} ${s.rise}`} data-reveal aria-label="Features">
            {FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
        </section>

        {/* Finale */}
        <section className={s.finale}>
          <div className={`container ${s.finaleInner} ${s.rise}`} data-reveal>
            <h2 className={s.finaleTitle}>Pre-order now</h2>
            <p className={s.finaleBody}>Privé is available by pre-order. Reserve a seat and we’ll contact you on WhatsApp when the collection is ready.</p>
            <button type="button" className={s.cta} onClick={open}>Reserve your seat</button>
          </div>
        </section>
      </div>

      <dialog
        ref={sheet}
        className={s.sheet}
        aria-labelledby="prive-reserve-title"
        onClick={e => { if (e.target === sheet.current) close(); }}
      >
        <h2 id="prive-reserve-title" className={s.sheetTitle}>Reserve your seat</h2>
        <p className={s.sheetBody}>We’ll message you on WhatsApp to confirm your reservation. No payment is needed now.</p>
        <a className={s.cta} href={RESERVE_URL} target="_blank" rel="noopener noreferrer" onClick={close}>Continue on WhatsApp</a>
        <button type="button" className={s.notNow} onClick={close}>Not now</button>
      </dialog>
      <Footer />
    </>
  );
}

/** A photo that unveils from the bottom upward as it enters the viewport. */
function Frame({ src, ratio, delay = 0 }: { src: string; ratio: number; delay?: number }) {
  return (
    <div className={s.frame} data-reveal style={{ aspectRatio: String(ratio), ['--d' as string]: `${delay}ms` }}>
      <Image src={src} alt="Privé sculptural planter" fill sizes="(min-width: 900px) 300px, 46vw" className={s.frameImg} />
    </div>
  );
}
