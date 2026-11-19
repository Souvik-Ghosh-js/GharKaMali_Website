'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: '400', display: 'swap' });
const POTS = ['/prive_pot1.jpg', '/prive_pot2.jpg', '/prive_pot3.jpg', '/prive_pot4.jpg'];
const FEATURES = ['Rare pumice stone', 'Handcrafted by artisans', 'Architectural forms', 'Interior & exterior luxury', 'Bespoke sizes'];

/** Home-page section for Privé, laid out like the Green Makeover section. */
export default function PriveHomeSection() {
  return (
    <section
      className="section gm-home-section v-pod prive-home"
      id="prive"
      data-no-reveal
      style={{ overflow: 'hidden', padding: 0, marginTop: 24, background: 'radial-gradient(circle at 100% 0%, #34584A 0%, #1F3D30 55%, #19332A 100%)' }}
    >
      <div className="gm-home-inner">
        <div className="gm-home-left prive-home-left">
          <div className="prive-arches" aria-hidden="true">
            {POTS.map((src, i) => (
              <div key={src} className="prive-arch" style={{ marginBottom: i % 2 ? 28 : 0 }}>
                <Image src={src} alt="" fill sizes="(max-width: 768px) 22vw, 14vw" style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="gm-home-right">
          <h2
            className={`${cinzel.className} prive-home-mark`}
            style={{
              margin: 0, fontWeight: 400, letterSpacing: '0.14em', lineHeight: 1, fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
              background: 'linear-gradient(180deg, #F6E3B0 0%, #D6B26C 60%, #EBD096 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
            }}
          >
            PRIVÉ
          </h2>
          <p className="gm-home-sub" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1rem, 1.4vw, 1.15rem)' }}>
            Artisanal planters for curated spaces.
          </p>
          <div className="gm-home-rule" />
          <p className="gm-home-sub">A limited collection of sculptural planters.</p>
          <ul className="prive-home-list">
            {FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <Link href="/prive" className="gm-home-cta">
            Reserve your seat
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
        </div>
      </div>
      <style jsx global>{`
        .prive-home .gm-home-cta { background: #DDBF82 !important; color: #13281D !important; box-shadow: 0 10px 30px -8px rgba(221,191,130,.45) !important; }
        .prive-home .gm-home-cta:hover { background: #ebd096 !important; }
        .prive-home-left { display: flex; align-items: center; justify-content: center; padding: 40px 24px; min-height: 300px; }
        .prive-arches { display: flex; align-items: flex-end; gap: clamp(8px, 1.4vw, 18px); width: 100%; max-width: 640px; }
        .prive-arch { position: relative; flex: 1; aspect-ratio: 0.62; overflow: hidden; border-radius: 200px 200px 3px 3px; border: 0.8px solid rgba(221,191,130,.45); }
        .prive-home-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; max-width: 420px; }
        .prive-home-list li { padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(221,191,130,.3); color: rgba(255,255,255,.85); font-size: .85rem; }
        @media (max-width: 768px) {
          .prive-home-left { height: auto; max-height: none; padding: 36px 24px 8px; min-height: 0; }
          .prive-home-mark { font-size: clamp(2.6rem, 14vw, 3.6rem) !important; }
        }
      `}</style>
    </section>
  );
}
