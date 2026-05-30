import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Gardener Near Me | Mali Near Me | Plant Care at Home — GharKaMali',
  description: 'Looking for a gardener near me or mali near me in Noida, Greater Noida & Ghaziabad? GharKaMali sends expert gardeners to your home starting ₹349. Book now!',
  keywords: [
    'gardener near me', 'mali near me', 'plant care near me', 'garden maintenance near me',
    'home gardener noida', 'mali noida', 'balcony garden care near me',
    'plant service near me', 'gardening service noida', 'garden expert near me',
    'terrace garden care', 'indoor plant care near me', 'local gardener',
    'mali near me noida', 'plant expert near me', 'find gardener noida',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/near-me' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Gardener Near Me | Mali Near Me — GharKaMali',
    description: 'Professional gardeners & malis near you in Noida, Greater Noida, Greater Noida West & Ghaziabad. Starting ₹349/visit.',
    url: 'https://gharkamali.com/near-me',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Gardener Near Me — GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Gardener Near Me | Mali Near Me — GharKaMali',
    description: 'Professional gardeners & malis near you in Noida & NCR. Starting ₹349/visit.',
    images: [{ url: '/logo.png', alt: 'Gardener Near Me — GharKaMali' }],
  },
};

const AREAS = [
  { name: 'Noida',              sectors: 'Sector 44, 50, 62, 78, 100, 110, 118, 121, 122, 128, 132, 137, 150' },
  { name: 'Greater Noida',      sectors: 'Alpha, Beta, Gamma, Delta, Omega, Knowledge Park, Pari Chowk' },
  { name: 'Greater Noida West', sectors: 'Gaur City, Supertech Capetown, NX One, ATS Picturesque, Mahagun Mywoods' },
  { name: 'Ghaziabad',          sectors: 'Indirapuram, Vaishali, Vasundhara, Raj Nagar Extension, Crossings Republik' },
];

const SERVICES = [
  { emoji: '🌿', title: 'Mali Visit @ ₹349',         desc: 'Expert gardener visits your home for watering, pruning, and plant health check.' },
  { emoji: '📅', title: 'Monthly Subscription',       desc: 'Regular scheduled visits — weekly or bi-weekly. Best value for plant lovers.' },
  { emoji: '🏡', title: 'Garden / Balcony Makeover',  desc: 'Complete transformation of your balcony, terrace, or outdoor garden space.' },
  { emoji: '🪴', title: 'Plant Supply & Pots',        desc: 'Get fresh plants, pots, soil, and fertilizers delivered to your home.' },
  { emoji: '🐛', title: 'Pest & Disease Control',     desc: 'Identify and treat infections, pests, and plant diseases on-site.' },
  { emoji: '🏢', title: 'Corporate Landscaping',      desc: 'Office, society, and commercial green space design and maintenance.' },
];

const WHY = [
  { num: '01', title: 'Verified Experts',      desc: 'All malis are background-checked, trained, and uniformed professionals.' },
  { num: '02', title: 'Same-Day Booking',      desc: 'Book a visit for today or schedule in advance — flexible slots available.' },
  { num: '03', title: 'WhatsApp Updates',      desc: 'Receive before & after photos and plant health reports on WhatsApp after every visit.' },
  { num: '04', title: 'Affordable Pricing',    desc: 'Starting just ₹349 for a full gardening visit — no hidden charges.' },
  { num: '05', title: 'Multiple Locations',    desc: 'Serving Noida, Greater Noida, Greater Noida West, and Ghaziabad.' },
  { num: '06', title: '4.9★ Customer Rating', desc: 'Trusted by 1,200+ homes across NCR with consistently high satisfaction.' },
];

export default function NearMePage() {
  return (
    <SmoothScrollProvider>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--forest) 0%, #065e28 100%)', padding: 'clamp(90px,13vw,150px) 0 clamp(60px,8vw,90px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '6px 20px', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(201,168,76,0.9)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Noida · Greater Noida · Ghaziabad</span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(2rem,5.5vw,3.8rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 20, lineHeight: 1.1 }}>
            Gardener Near Me?<br />
            <span style={{ color: '#C9A84C' }}>GharKaMali hai na!</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1rem,1.5vw,1.15rem)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.8 }}>
            Professional <strong style={{ color: '#fff' }}>mali near you</strong> in Noida, Greater Noida &amp; Ghaziabad. We handle watering, pruning, pest control, and complete garden care — starting just <strong style={{ color: '#C9A84C' }}>₹349/visit</strong>.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary btn-lg" style={{ background: '#C9A84C', color: '#fff', border: 'none' }}>
              Book Mali Now @ ₹349 →
            </Link>
            <a href="https://wa.me/919643701701?text=Hi%20GharKaMali!%20I%20need%20a%20gardener%20near%20me." target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              💬 Chat on WhatsApp
            </a>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: 24 }}>✓ No advance payment · ✓ Verified professionals · ✓ WhatsApp updates after every visit</p>
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>What We Offer</span>
            <h2 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginTop: 10 }}>
              Gardening Services Near You
            </h2>
            <p style={{ color: 'var(--text-2)', maxWidth: 520, margin: '12px auto 0', fontSize: '0.97rem', lineHeight: 1.8 }}>
              From a quick plant health check to a full garden makeover — we bring expert gardeners to your doorstep.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 24 }}>
            {SERVICES.map(s => (
              <div key={s.title} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 20, padding: '28px 24px', transition: 'box-shadow 0.2s' }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{s.emoji}</div>
                <h3 style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '1.05rem', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section style={{ padding: 'clamp(50px,7vw,80px) 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Service Areas</span>
            <h2 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginTop: 10 }}>
              Mali Near Me — Areas We Cover
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 20 }}>
            {AREAS.map(a => (
              <div key={a.name} style={{ background: 'linear-gradient(135deg, #f0faf2, #e8f5ea)', border: '1.5px solid var(--border-gold)', borderRadius: 18, padding: '24px 20px' }}>
                <div style={{ fontWeight: 900, color: 'var(--forest)', fontSize: '1.1rem', marginBottom: 8 }}>📍 {a.name}</div>
                <div style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.7 }}>{a.sectors}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Don&apos;t see your area? <a href="https://wa.me/919643701701" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest)', fontWeight: 700, textDecoration: 'none' }}>WhatsApp us</a> — we&apos;re expanding fast.</p>
          </div>
        </div>
      </section>

      {/* Why GharKaMali */}
      <section style={{ padding: 'clamp(60px,8vw,100px) 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Why Choose Us</span>
            <h2 style={{ color: 'var(--forest)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginTop: 10 }}>
              The Best Gardener Near You
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 24 }}>
            {WHY.map(w => (
              <div key={w.num} style={{ display: 'flex', gap: 16, background: '#fff', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 20px' }}>
                <div style={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 900, color: 'var(--forest)', opacity: 0.3, paddingTop: 3 }}>{w.num}</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 6 }}>{w.title}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.7 }}>{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px,8vw,90px) 0', background: 'linear-gradient(135deg, var(--forest) 0%, #065e28 100%)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, marginBottom: 16 }}>
            Ready to Book a Gardener Near You?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: 36, lineHeight: 1.8 }}>
            Get a professional mali at your home starting ₹349 — Noida, Greater Noida &amp; Ghaziabad.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary btn-lg" style={{ background: '#C9A84C', color: '#fff', border: 'none' }}>
              Book Mali Visit @ ₹349
            </Link>
            <Link href="/services" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}>
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </SmoothScrollProvider>
  );
}
