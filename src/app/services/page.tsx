// "Our Services" index — server-rendered for SEO. Content comes from the
// backend's GET /service-details (single source of truth shared with the
// customer app); each card links to the /services/[slug] detail page.
import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ServiceIcon } from '@/components/ServiceDetailContent';
import type { ServiceDetail } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';
const SITE = 'https://gharkamali.com';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Our Services — GharKaMali | What’s Included, Pricing & FAQs',
  description: 'Explore all 15 GharKaMali gardening services — plant care visits, garden setups, lawn care, pest control and more. See exactly what’s included, how it’s done, and get answers to common questions.',
  keywords: [
    'gardening services noida', 'plant care service', 'mali service details',
    'balcony garden setup', 'terrace garden setup', 'lawn installation',
    'plant repotting', 'plant pest control', 'kitchen garden setup',
    'vertical garden', 'office plant maintenance', 'landscape design',
    'gharkamali services', 'gardening faqs',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: `${SITE}/services` },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Our Services — GharKaMali',
    description: 'All 15 professional gardening services — what’s included, what’s not, how it’s done, and FAQs.',
    url: `${SITE}/services`,
    images: [{ url: `${SITE}/logo.png`, width: 1200, height: 630, alt: 'GharKaMali Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Our Services — GharKaMali',
    description: 'All 15 professional gardening services — what’s included, how it’s done, and FAQs.',
    images: [{ url: `${SITE}/logo.png`, alt: 'GharKaMali Services' }],
  },
};

async function fetchServices(): Promise<ServiceDetail[]> {
  try {
    const res = await fetch(`${API_BASE}/service-details`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

const IcArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <>
      <Navbar transparent />

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(110px, 14vw, 170px)',
        paddingBottom: 'clamp(40px, 5vw, 64px)',
        background: 'linear-gradient(160deg, #021a09 0%, #03411a 60%, #065e28 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Everything your garden<br />
            <span style={{ color: '#4ade80' }}>needs, done right</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 28px' }}>
            {services.length || 15} professional services — from a one-time care visit to full landscape design.
            See what&apos;s included, what&apos;s not, and get answers instantly.
          </p>
          <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4ade80', color: '#03411a', padding: '13px 28px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '0.92rem' }}>
            Book a Service <IcArrow />
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ background: 'var(--bg)', padding: 'clamp(32px, 5vw, 64px) 0' }}>
        <div className="container">
          {services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-2)', fontWeight: 600, marginBottom: 16 }}>
                We couldn&apos;t load the service list right now. Please refresh the page, or reach us on WhatsApp.
              </p>
              <a href="https://wa.me/919643701701" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex' }}>Chat on WhatsApp</a>
            </div>
          ) : (
            <div className="svcx-grid">
              {services.map(s => (
                <Link key={s.slug} href={`/services/${s.slug}`} className="svcx-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(3,65,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                      <ServiceIcon slug={s.slug} />
                    </div>
                    <h2 style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--forest)', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{s.name}</h2>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{s.overview}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {s.includes.length} inclusions · {s.faqs.length} FAQs
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 800, color: 'var(--forest)' }}>
                      View details <IcArrow />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        .svcx-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .svcx-card {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 22px;
          text-decoration: none;
          box-shadow: var(--sh-xs);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .svcx-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--sh-sm);
          border-color: var(--border-strong);
        }
      `}</style>
    </>
  );
}
