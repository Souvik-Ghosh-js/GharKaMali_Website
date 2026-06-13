'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SHOP_ENABLED } from '@/lib/features';

// Plantopedia (AI plant identification) is temporarily disabled while we polish it.
// The full implementation lives in git history — restore that file to re-enable.

const IcLeaf = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export default function PlantopediaPage() {
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: 'clamp(56px,12vw,120px) 0' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ width: 88, height: 88, borderRadius: 28, background: 'var(--bg-elevated)', border: '1.5px solid var(--border-gold)', color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
              <IcLeaf />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid var(--border-gold)', borderRadius: 99, padding: '6px 18px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Plantopedia</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 900, color: 'var(--forest)', letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 16px' }}>
              Under Development
            </h1>

            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 480 }}>
              We&apos;re building an AI plant identification &amp; care assistant — snap a photo to get instant species ID, watering, light, and health guidance. It&apos;ll be live soon. 🌱
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/book" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: 14, fontWeight: 800 }}>
                Book a gardener visit →
              </Link>
              {SHOP_ENABLED && (
              <Link href="/shop" className="btn btn-forest" style={{ padding: '14px 28px', borderRadius: 14, fontWeight: 800 }}>
                Browse the plant store
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
