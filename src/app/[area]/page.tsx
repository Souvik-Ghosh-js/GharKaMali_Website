import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SERVING_AREAS, fetchAreas, fetchArea, fetchTemplate, renderTpl } from '@/lib/areas';

// Pre-render the hardcoded fallback areas at build. New cities added in the
// admin City SEO page will be served on-demand via dynamicParams (default).
export function generateStaticParams() {
  return SERVING_AREAS.map(a => ({ area: a.slug }));
}

// Re-validate every 60s so admin edits propagate without a redeploy
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { area: string } }): Promise<Metadata> {
  const a = await fetchArea(params.area);
  if (!a) return {};
  const tpl = await fetchTemplate();
  const title = renderTpl(tpl.title, a.name);
  const description = renderTpl(tpl.meta_description, a.name);
  const keywords = renderTpl(tpl.meta_keywords, a.name);
  return {
    title, description, keywords,
    alternates: { canonical: `/${a.slug}` },
    openGraph: { title, description, url: `/${a.slug}`, images: ['/logo.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/logo.png'] },
  };
}

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20book%20a%20gardener%20visit.';

const FEATURES = [
  { icon: '🌿', title: 'Up to 10 plants serviced', desc: 'Complete care for all your plants in a single visit.' },
  { icon: '💧', title: 'Watering & feeding', desc: 'Right water dose plus organic compost included.' },
  { icon: '🪴', title: 'Pest & disease check', desc: 'Trained eye for early issues — fix before it spreads.' },
  { icon: '✂️', title: 'Pruning & cleaning', desc: 'Leaf cleaning, deadhead removal, healthy growth.' },
  { icon: '📋', title: 'Digital health report', desc: 'After-visit summary on WhatsApp with photos.' },
  { icon: '⭐', title: 'Verified gardeners', desc: 'Background-checked, trained, rated by neighbours.' },
];

const STEPS = [
  { n: '01', title: 'Book online', desc: 'Pick a slot at your convenience — pay only after the visit.' },
  { n: '02', title: 'Expert visits you', desc: 'Trained mali arrives on time at your home.' },
  { n: '03', title: 'Plants flourish', desc: 'Sit back. We watch over your green space.' },
];

export default async function AreaPage({ params }: { params: { area: string } }) {
  const [a, tpl, allAreas] = await Promise.all([
    fetchArea(params.area),
    fetchTemplate(),
    fetchAreas(),
  ]);
  if (!a) notFound();

  // Template-driven copy (admin → City SEO → Global Template). All occurrences
  // of {city} are replaced with the area name.
  const h1Text = renderTpl(tpl.h1, a.name);
  const aboutText = a.blurb || renderTpl(tpl.about_text, a.name);

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>

        {/* ── Hero ── */}
        <section style={{ paddingTop: 'clamp(28px, 4vw, 48px)', paddingBottom: 'clamp(36px, 5vw, 56px)', background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '5px 16px', marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c' }} />
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: 'rgba(201,168,76,0.9)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                Service Area{a.city ? ` · ${a.city}` : ''}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }}>
              {h1Text}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(0.88rem, 1.3vw, 1rem)', marginBottom: 20, lineHeight: 1.7, maxWidth: 620, marginInline: 'auto' }}>
              {aboutText}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/book" className="btn btn-primary btn-lg">Book a Visit in {a.name}</Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                💬 Chat With Us
              </a>
            </div>
          </div>
        </section>

        {/* ── What's included ── */}
        <section style={{ padding: 'clamp(56px,7vw,88px) 0', background: '#fff' }}>
          <div className="container">
            <div className="section-heading" style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="overline">What's included</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10 }}>
                Every visit in {a.name} includes
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{ padding: 22, background: 'var(--cream)', borderRadius: 18, border: '1px solid var(--border-gold)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{f.icon}</div>
                  <h3 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 6, fontSize: '1.05rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--sage)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ padding: 'clamp(56px,7vw,88px) 0', background: 'var(--cream)' }}>
          <div className="container">
            <div className="section-heading" style={{ textAlign: 'center', marginBottom: 36 }}>
              <span className="overline">How it works</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10 }}>
                Book a gardener in {a.name} in 3 steps
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
              {STEPS.map(s => (
                <div key={s.n} style={{ padding: 24, background: '#fff', borderRadius: 20, border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--earth)', lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
                  <h3 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ color: 'var(--sage)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nearby areas ── */}
        <section style={{ padding: 'clamp(40px,5vw,64px) 0', background: '#fff', borderTop: '1px solid var(--border-gold)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="overline">Nearby</span>
              <h2 style={{ fontSize: 'clamp(1.3rem,2.4vw,1.8rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 8 }}>
                We also serve these areas
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 760, margin: '0 auto' }}>
              {allAreas.filter(x => x.slug !== a.slug).slice(0, 12).map(x => (
                <Link key={x.slug} href={`/${x.slug}`}
                  style={{ padding: '7px 16px', background: 'var(--cream)', color: 'var(--forest)', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid var(--border-gold)', textDecoration: 'none' }}>
                  {x.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: 'clamp(56px,8vw,88px) 0', background: 'var(--forest)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Ready for greener plants in {a.name}?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.58)', marginBottom: 28, fontSize: '1rem', maxWidth: 480, margin: '0 auto 28px' }}>
              Book a certified plant expert visit today — starting at just ₹349.
            </p>
            <Link href="/book" className="btn btn-primary btn-xl">
              Book a Visit
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
