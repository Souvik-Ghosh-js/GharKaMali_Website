// /services/[slug] — SEO-friendly detail page for one service. Server-rendered
// (mirrors the blogs/cities pattern: direct fetch + generateMetadata) with the
// shared ServiceDetailContent renderer, so the page, the services index and the
// booking-flow modal always show identical backend-driven content.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceDetailContent, { ServiceIcon } from '@/components/ServiceDetailContent';
import type { ServiceDetail } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';
const SITE = 'https://gharkamali.com';

export const revalidate = 3600;

async function fetchService(slug: string): Promise<ServiceDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/service-details?slug=${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const svc = json?.data ?? json;
    return svc && svc.slug ? (svc as ServiceDetail) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const svc = await fetchService(params.slug);

  if (!svc) {
    return {
      title: 'Service Not Found — GharKaMali',
      robots: { index: false },
    };
  }

  const title = `${svc.name} — GharKaMali | What’s Included & FAQs`;
  const desc = `${svc.overview} See what’s included, what’s not, how it’s done, and FAQs — then book online.`.slice(0, 160);
  const url = `${SITE}/services/${svc.slug}`;

  return {
    title,
    description: desc,
    keywords: [
      svc.name.toLowerCase(), `${svc.name.toLowerCase()} noida`, 'gharkamali',
      'gardening service', 'mali service', 'plant care', 'gardening faqs',
    ],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'GharKaMali',
      title,
      description: desc,
      url,
      images: [{ url: `${SITE}/logo.png`, width: 1200, height: 630, alt: svc.name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gharkamali',
      creator: '@gharkamali',
      title,
      description: desc,
      images: [{ url: `${SITE}/logo.png`, alt: svc.name }],
    },
  };
}

const IcArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const svc = await fetchService(params.slug);
  if (!svc) notFound();

  // FAQ rich-result schema (same pattern as the booking page's FAQPage schema).
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: svc.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar transparent />

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(110px, 14vw, 160px)',
        paddingBottom: 'clamp(36px, 5vw, 56px)',
        background: 'linear-gradient(160deg, #021a09 0%, #03411a 60%, #065e28 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700, marginBottom: 20 }}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><IcArrow /></span> All Services
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', flexShrink: 0 }}>
              <ServiceIcon slug={svc.slug} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{svc.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', margin: 0, lineHeight: 1.7, maxWidth: 560 }}>{svc.overview}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Detail body */}
      <section style={{ background: 'transparent', padding: 'clamp(32px, 5vw, 64px) 0' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', boxShadow: 'var(--sh-xs)', padding: 'clamp(20px, 3vw, 36px)' }}>
            <ServiceDetailContent service={svc} showOverview={false} />

            {/* CTA */}
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--forest)', color: '#fff', padding: '13px 24px', borderRadius: 12, fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem' }}>
                Book {svc.name} <IcArrow />
              </Link>
              <Link href="/plans" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', color: 'var(--forest)', padding: '13px 24px', borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', border: '1.5px solid var(--border-mid)' }}>
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
