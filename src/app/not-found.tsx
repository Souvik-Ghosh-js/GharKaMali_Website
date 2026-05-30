import Link from 'next/link';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Page not found',
  description: "We couldn't find the page you're looking for.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.12 }} />
        <div className="hero-orb hero-orb-2" style={{ opacity: 0.08 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100svh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: 560 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sage)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 18, fontFamily: 'var(--font-mono)' }}>
              ERROR 404
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(5rem, 18vw, 9rem)',
              fontWeight: 900,
              color: 'var(--forest)',
              letterSpacing: '-0.04em',
              lineHeight: 1,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--forest) 0%, var(--earth) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              404
            </h1>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)', fontWeight: 900, color: 'var(--forest)', letterSpacing: '-0.02em', marginBottom: 14 }}>
              This page wandered off the path.
            </h2>

            <p style={{ color: 'var(--sage)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.7, marginBottom: 36, maxWidth: 440, marginInline: 'auto' }}>
              The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved. Let&rsquo;s get you back to growing something beautiful.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="btn btn-primary" style={{ padding: '14px 28px', boxShadow: 'var(--sh-md)' }}>
                Back to Home
              </Link>
              <Link href="/book" className="btn btn-outline" style={{ padding: '14px 28px' }}>
                Book a Visit
              </Link>
            </div>

            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px dashed var(--border-gold)', display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { href: '/plans',        label: 'Care Plans' },
                { href: '/shop',         label: 'Plant Store' },
                { href: '/plantopedia',  label: 'AI Vision' },
                { href: '/about',        label: 'About Us' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)', textDecoration: 'none', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
