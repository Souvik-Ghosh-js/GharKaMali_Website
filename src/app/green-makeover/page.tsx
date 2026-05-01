'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20know%20about%20the%20Green%20Makeover%20package.';

/* ── SVG ICONS ── */
const Ic = {
  Leaf: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  Arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  WA: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
  Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Map: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Truck: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  Tool: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  Palette: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  Globe: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  Pencil: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Sun: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  Office: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
};

/* ── DATA ── */
const SERVICES = [
  { Icon: Ic.Pencil, title: 'Space Planning', desc: 'Custom layout tailored to your exact dimensions and light conditions.' },
  { Icon: Ic.Leaf, title: 'Plant Selection', desc: 'Indian-climate species chosen for your specific space and care capacity.' },
  { Icon: Ic.Palette, title: 'Designer Pots', desc: 'Curated pots and planters that complement your interior aesthetic.' },
  { Icon: Ic.Grid, title: 'Arrangements', desc: 'Tiered stands and artistic compositions for maximum visual impact.' },
  { Icon: Ic.Truck, title: 'Delivery', desc: 'Full transportation of plants, pots and materials — zero hassle.' },
  { Icon: Ic.Tool, title: 'Installation', desc: 'End-to-end setup by trained green installation professionals.' },
];

const SPACES = [
  { Icon: Ic.Home, title: 'Balcony', desc: 'A curated green corner for daily calm and fresh air.', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=700&h=500&fit=crop', tag: 'Most Popular' },
  { Icon: Ic.Sun, title: 'Terrace', desc: 'An outdoor paradise for family evenings and gatherings.', img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=700&h=500&fit=crop', tag: 'Trending' },
  { Icon: Ic.Leaf, title: 'Indoor', desc: 'Natural freshness for living rooms, bedrooms and corridors.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&h=500&fit=crop', tag: 'Premium' },
  { Icon: Ic.Office, title: 'Office', desc: 'Productive workspaces that boost morale and well-being.', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&h=500&fit=crop', tag: 'Corporate' },
];

const PLANS = [
  { name: 'Basic', price: '20,000', tag: 'Essential', desc: 'Ideal for small balconies and indoor corners.', accent: false, features: ['Up to 15 plants', 'Standard pots', 'Layout design', 'Installation & transport'] },
  { name: 'Premium', price: '35,000', tag: 'Most Loved', desc: 'Medium spaces with curated design and premium species.', accent: true, features: ['Up to 35 plants', 'Designer pots & stands', 'Custom layout', 'Installation & transport', '1-month check-in'] },
  { name: 'Luxury', price: '50,000', tag: 'Full Paradise', desc: 'Rare plants, imported pots, and artistic installations.', accent: false, features: ['Unlimited plants', 'Imported premium pots', 'Architectural layout', 'Expert installation & transport', '3-month maintenance'] },
];

const WHY = [
  { Icon: Ic.Pencil, title: 'Fully Customised', desc: 'Every setup designed around your space, preferences and budget.' },
  { Icon: Ic.Globe, title: 'Indian Climate Expertise', desc: 'Plants selected to thrive in Indian heat, humidity and sunlight.' },
  { Icon: Ic.Tool, title: 'End-to-End Execution', desc: 'Design, delivery, installation — we handle everything.' },
  { Icon: Ic.Shield, title: 'Built to Last', desc: 'Setups engineered for long-term plant health, not just looks.' },
];

/* ── ANIMATED COUNTER ── */
function Ctr({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect();
        let n = 0; const step = end / 48;
        const t = setInterval(() => { n += step; if (n >= end) { setV(end); clearInterval(t); } else setV(Math.floor(n)); }, 24);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{v.toLocaleString('en-IN')}{suffix}</span>;
}

export default function GreenMakeoverPage() {
  const [activeSpace, setActiveSpace] = useState(0);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.gmr-reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('gmr-in'); obs.unobserve(e.target); } }),
      { threshold: 0.06 }
    );
    els.forEach(el => obs.observe(el));
    const t = setTimeout(() => els.forEach(el => el.classList.add('gmr-in')), 2000);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <SmoothScrollProvider>
      <Navbar transparent />

      {/* ═══ 1. HERO ═══ */}
      <section className="gmr-sec gmr-hero">
        <div className="gmr-hero-bg">
          <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1920&h=1080&fit=crop" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
        </div>
        <div className="gmr-blob b1" /><div className="gmr-blob b2" />

        <div className="gmr-hero-inner gmr-reveal">
          <div className="gmr-overline">
            <Ic.Leaf />
            Green Makeover
          </div>

          <h1 className="gmr-hero-h1">
            Transform Your Space<br />
            <span className="gmr-gold-text">into a Green Paradise</span>
          </h1>

          <p className="gmr-hero-p">
            Professional plant setups — designed, delivered &amp; installed for homes and offices.
          </p>

          <div className="gmr-hero-stats">
            {[
              { n: 500, s: '+', l: 'Setups Done' },
              { n: 4, s: ' Spaces', l: 'We Cover' },
              { n: 4.9, s: '★', l: 'Client Rating' },
            ].map((st, i) => (
              <div key={i} className="gmr-stat">
                <span className="gmr-stat-n">{st.l === 'Client Rating' ? '4.9★' : <Ctr end={st.n} suffix={st.s} />}</span>
                <span className="gmr-stat-l">{st.l}</span>
              </div>
            ))}
          </div>

          <div className="gmr-hero-actions">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="gmr-btn-ghost">
              <Ic.WA /> Book ₹299 Consultation
            </a>
          </div>

          <div className="gmr-adj-chip">
            👉 “₹299 Visit – 100% Adjustable”
          </div>
        </div>

        <div className="gmr-scroll-cue">
          <div className="gmr-scroll-dot" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ═══ 2. CONSULTATION ═══ */}
      <section className="gmr-sec gmr-split-sec" id="consult">
        <div className="gmr-split-img">
          <img src="https://images.unsplash.com/photo-1598902108854-10e335adac99?w=900&h=1100&fit=crop" alt="Expert consultation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="gmr-split-img-fade" />
          <div className="gmr-float-card">
            <div className="gmr-float-icon"><Ic.Tool /></div>
            <div>
              <div className="gmr-float-label">Expert visit</div>
              <div className="gmr-float-val">45–60 min</div>
            </div>
          </div>
        </div>

        <div className="gmr-split-content gmr-reveal">
          <div className="gmr-overline gmr-dark-overline"><Ic.Map /> Start Your Journey</div>
          <h2 className="gmr-h2">Site Visit  <span style={{ color: 'var(--gold-deep)' }}> for just ₹299</span></h2>

          <div className="gmr-checklist">
            {['Space assessment & walkthrough', 'Layout & design suggestions', 'Plant recommendations', 'Budget planning', '₹299 fully adjusted in final cost', 'No obligation, pure advice'].map((item, i) => (
              <div key={i} className="gmr-check-row">
                <div className="gmr-check-icon"><Ic.Check /></div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="gmr-zero-risk">
            <Ic.Shield />
            <span>Zero obligation. Pure expert advice. Cost adjustable.</span>
          </div>

          <div className="gmr-cta-row">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="gmr-btn-primary">
              Book on WhatsApp <Ic.Arrow />
            </a>
          </div>

          <div className="gmr-adj-chip gmr-adj-dark">
            👉 “₹299 Visit – 100% Adjustable”
          </div>
        </div>
      </section>

      {/* ═══ 3. SERVICES ═══ */}
      <section className="gmr-sec gmr-dark-sec">
        <div className="gmr-contained">
          <div className="gmr-sec-header gmr-reveal">
            <div className="gmr-overline"><Ic.Grid /> Our Services</div>
            <h2 className="gmr-h2 gmr-light-h2">Everything<br />Included</h2>
            <p className="gmr-sec-p">End-to-end green setup. You enjoy the result.</p>
          </div>

          <div className="gmr-services-grid gmr-reveal">
            {SERVICES.map((s, i) => (
              <div key={i} className="gmr-svc-card">
                <div className="gmr-svc-ic"><s.Icon /></div>
                <h3 className="gmr-svc-title">{s.title}</h3>
                <p className="gmr-svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. SPACES ═══ */}
      <section className="gmr-sec gmr-spaces-sec">
        <div className="gmr-contained">
          <div className="gmr-sec-header gmr-reveal">
            <div className="gmr-overline gmr-dark-overline"><Ic.Home /> Spaces We Transform</div>
            <h2 className="gmr-h2">Every space has<br />a green potential.</h2>
          </div>

          {/* Desktop: tab + panel */}
          <div className="gmr-spaces-layout gmr-reveal">
            <div className="gmr-space-tabs">
              {SPACES.map((sp, i) => (
                <button key={i} onClick={() => setActiveSpace(i)} className={`gmr-tab ${i === activeSpace ? 'gmr-tab-on' : ''}`}>
                  <div className="gmr-tab-ic"><sp.Icon /></div>
                  <div className="gmr-tab-body">
                    <span className="gmr-tab-name">{sp.title}</span>
                    <span className="gmr-tab-tag">{sp.tag}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              ))}
            </div>

            <div className="gmr-space-panel">
              {SPACES.map((sp, i) => (
                <div key={i} className={`gmr-panel-item ${i === activeSpace ? 'gmr-panel-on' : ''}`}>
                  <img src={sp.img} alt={sp.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="gmr-panel-overlay" />
                  <div className="gmr-panel-info">
                    <div className="gmr-panel-tag">{sp.tag}</div>
                    <h3 className="gmr-panel-title">{sp.title}</h3>
                    <p className="gmr-panel-desc">{sp.desc}</p>
                    <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="gmr-panel-btn">
                      Get a Quote <Ic.Arrow />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: horizontal scroll cards */}
          <div className="gmr-spaces-mobile gmr-reveal">
            {SPACES.map((sp, i) => (
              <div key={i} className="gmr-mob-card">
                <img src={sp.img} alt={sp.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div className="gmr-mob-card-body">
                  <div className="gmr-mob-tag">{sp.tag}</div>
                  <h3 className="gmr-mob-title"><sp.Icon /> {sp.title}</h3>
                  <p className="gmr-mob-desc">{sp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4.5 TRANSFORMATIONS GALLERY ═══ */}
      <section className="gmr-sec gmr-gallery-sec">
        <div className="gmr-gallery-content gmr-reveal">
          <div className="gmr-sec-header" style={{ marginBottom: 'clamp(24px, 4vh, 40px)' }}>
            <div className="gmr-overline gmr-dark-overline"><Ic.Star /> Real Masterpieces</div>
            <h2 className="gmr-h2">See the Transformations</h2>
            <p className="gmr-sec-p" style={{ color: 'var(--text-2)' }}>A glimpse into how we turn ordinary spaces into lush green paradises.</p>
          </div>

          <div className="gmr-marquee-wrapper">
            {/* Top Row - Moves Left */}
            <div className="gmr-marquee">
              <div className="gmr-marquee-track">
                <div className="gmr-marquee-set">
                  {[...Array(8)].map((_, i) => (
                    <div key={`m1-${i}`} className="gmr-marquee-item">
                      <img src={`/img-${i + 1}.jpeg`} alt={`Transformation ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="gmr-marquee-set">
                  {[...Array(8)].map((_, i) => (
                    <div key={`m1-dup-${i}`} className="gmr-marquee-item">
                      <img src={`/img-${i + 1}.jpeg`} alt={`Transformation ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row - Moves Right */}
            <div className="gmr-marquee gmr-marquee-reverse" style={{ marginTop: '16px' }}>
              <div className="gmr-marquee-track">
                <div className="gmr-marquee-set">
                  {[...Array(8)].map((_, i) => (
                    <div key={`m2-${i}`} className="gmr-marquee-item">
                      <img src={`/img-${i + 9}.jpeg`} alt={`Transformation ${i + 9}`} loading="lazy" />
                    </div>
                  ))}
                </div>
                <div className="gmr-marquee-set">
                  {[...Array(8)].map((_, i) => (
                    <div key={`m2-dup-${i}`} className="gmr-marquee-item">
                      <img src={`/img-${i + 9}.jpeg`} alt={`Transformation ${i + 9}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. PRICING ═══ */}
      <section className="gmr-sec gmr-dark-sec">
        <div className="gmr-contained">
          <div className="gmr-sec-header gmr-reveal">
            <h2 className="gmr-h2 gmr-light-h2 pb-2">Choose Your Setup</h2>
          </div>

          <div className="gmr-plans-grid gmr-reveal">
            {PLANS.map((plan, i) => (
              <div key={i} className={`gmr-plan ${plan.accent ? 'gmr-plan-accent' : ''}`}>
                {plan.accent && <div className="gmr-plan-badge">MOST LOVED</div>}
                <div className="gmr-plan-tag-label">{plan.tag}</div>
                <div className="gmr-plan-name">{plan.name}</div>
                <div className="gmr-plan-price">₹{plan.price}<span>starting</span></div>
                <p className="gmr-plan-desc">{plan.desc}</p>
                <hr className="gmr-plan-hr" />
                <ul className="gmr-plan-list">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="gmr-plan-li">
                      <div className={`gmr-plan-check ${plan.accent ? 'gmr-plan-check-a' : ''}`}><Ic.Check /></div>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className={`gmr-plan-btn ${plan.accent ? 'gmr-plan-btn-a' : 'gmr-plan-btn-d'}`}>
                  Get Started <Ic.Arrow />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 6. WHY + FINAL CTA ═══ */}
      <section className="gmr-sec gmr-final-sec">
        {/* Left: Why */}
        <div className="gmr-why-col gmr-reveal">
          <div className="gmr-overline gmr-dark-overline"><Ic.Shield /> Why GharKaMali</div>
          <h2 className="gmr-h2">The trusted choice<br />for green spaces.</h2>

          <div className="gmr-why-grid">
            {WHY.map((w, i) => (
              <div key={i} className="gmr-why-card">
                <div className="gmr-why-ic"><w.Icon /></div>
                <div>
                  <div className="gmr-why-title">{w.title}</div>
                  <div className="gmr-why-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA box */}
        <div className="gmr-cta-col gmr-reveal">
          <div className="gmr-cta-glow" />
          <h2 className="gmr-cta-h2">Start Today</h2>
          <p className="gmr-cta-p">Book your ₹299 expert consultation. Cost 100% adjusted in your final setup.</p>

          <div className="gmr-cta-stars">
            {[1, 2, 3, 4, 5].map(i => <Ic.Star key={i} />)}
            <span>Loved by 500+ clients</span>
          </div>

          <div className="gmr-adj-chip">
            👉 “₹299 Visit – 100% Adjustable”
          </div>

          <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="gmr-cta-wa-btn">
            <Ic.WA /> Book on WhatsApp
          </a>
        </div>
      </section>

      <Footer />

      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
        <Ic.WA />
        <div className="whatsapp-tooltip">Book Green Makeover</div>
      </a>

      <style jsx>{`
        /* ── BASE ── */
        .gmr-sec {
          width: 100%;
          height: 100vh;
          min-height: 100vh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        }

        /* ── HERO ── */
        .gmr-hero {
          background: linear-gradient(135deg, #010f06 0%, #021a09 45%, #02260c 100%);
          justify-content: center;
          padding: 0 clamp(20px,5vw,80px);
          flex-direction: column;
        }
        .gmr-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .gmr-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }
        .b1 { width: 520px; height: 520px; background: radial-gradient(circle, rgba(3,65,26,0.55) 0%, transparent 70%); top: -140px; right: -80px; animation: bfl1 9s ease-in-out infinite; }
        .b2 { width: 420px; height: 420px; background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%); bottom: -100px; left: -60px; animation: bfl2 11s ease-in-out infinite; }
        @keyframes bfl1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes bfl2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }

        .gmr-hero-inner {
          position: relative;
          z-index: 5;
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: clamp(14px,2.2vh,22px);
          padding-top: var(--nav-h);
        }

        .gmr-overline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.45);
        }
        .gmr-dark-overline { color: var(--earth) !important; }

        .gmr-hero-h1 {
          font-size: clamp(2rem,5vw,4.2rem);
          font-weight: 900;
          color: rgba(255,255,255,0.92);
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 0;
        }
        .gmr-gold-text {
          background: linear-gradient(110deg,#edcf87 0%,#f5dea0 50%,#c9a84c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gmr-h2 {
          font-size: clamp(1.8rem,3.5vw,3rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin: 0;
          color: var(--forest);
        }
        .gmr-light-h2 { color: #fff !important; }

        .gmr-hero-p {
          color: rgba(255,255,255,0.5);
          font-size: clamp(0.9rem,1.3vw,1rem);
          line-height: 1.7;
          font-weight: 500;
          max-width: 520px;
          margin: 0;
        }

        .gmr-hero-stats {
          display: flex;
          gap: clamp(12px,2.5vw,40px);
          flex-wrap: wrap;
          justify-content: center;
        }
        .gmr-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 12px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          min-width: 80px;
        }
        .gmr-stat-n {
          font-size: clamp(1.2rem,2.2vw,1.6rem);
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
        }
        .gmr-stat-l {
          font-size: 0.58rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .gmr-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .gmr-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg,var(--forest-light),var(--forest));
          color: #fff;
          padding: 13px 26px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.25s var(--ease);
          box-shadow: 0 6px 24px rgba(3,65,26,0.35);
        }
        .gmr-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(3,65,26,0.45); }

        .gmr-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.85);
          padding: 13px 26px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .gmr-btn-ghost:hover { background: rgba(255,255,255,0.13); transform: translateY(-2px); }

        .gmr-adj-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(237,207,135,0.1);
          border: 1px solid rgba(237,207,135,0.28);
          color: var(--gold);
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .gmr-adj-dark {
          background: rgba(3,65,26,0.06) !important;
          border-color: rgba(3,65,26,0.2) !important;
          color: var(--forest) !important;
          align-self: flex-start;
        }

        .gmr-scroll-cue {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: rgba(255,255,255,0.3);
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          z-index: 10;
        }
        .gmr-scroll-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--gold);
          animation: sdot 1.5s ease-in-out infinite;
        }
        @keyframes sdot { 0%,100%{transform:translateY(0);opacity:1} 50%{transform:translateY(6px);opacity:0.3} }

        /* ── CONSULTATION ── */
        .gmr-split-sec {
          background: var(--cream);
          padding: 0;
          align-items: stretch;
          flex-direction: row;
        }
        .gmr-split-img {
          flex: 0 0 48%;
          position: relative;
          overflow: hidden;
        }
        .gmr-split-img-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 55%, var(--cream) 100%);
        }
        .gmr-float-card {
          position: absolute;
          bottom: 36px;
          right: 28px;
          background: #fff;
          border-radius: 16px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: var(--sh-lg);
          border: 1px solid var(--border-gold);
        }
        .gmr-float-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: var(--forest);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gmr-float-label { font-size: 0.6rem; font-weight: 800; color: var(--sage); text-transform: uppercase; letter-spacing: 0.12em; }
        .gmr-float-val   { font-size: 1rem; font-weight: 900; color: var(--forest); }

        .gmr-split-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(14px,2.2vh,20px);
          padding: clamp(40px,5vw,80px) clamp(28px,4vw,64px);
          overflow-y: auto;
        }

        .gmr-checklist {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 16px;
        }
        .gmr-check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-2);
        }
        .gmr-check-icon {
          width: 24px; height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg,var(--gold),var(--gold-light));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--forest);
          flex-shrink: 0;
        }

        .gmr-zero-risk {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(3,65,26,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--forest);
        }

        .gmr-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .gmr-sec-p { color: rgba(255,255,255,0.45); font-size: 0.95rem; font-weight: 500; line-height: 1.6; max-width: 420px; text-align: center; margin: 0; }

        /* ── DARK SECTIONS ── */
        .gmr-dark-sec {
          background: linear-gradient(135deg,#010f06 0%,#021a09 60%,#010f06 100%);
          justify-content: center;
          padding: clamp(20px,3.5vh,48px) 0;
        }
        .gmr-contained {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 clamp(20px,4vw,80px);
          display: flex;
          flex-direction: column;
          gap: clamp(18px,2.8vh,32px);
        }
        .gmr-sec-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        /* ── SERVICES ── */
        .gmr-services-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: clamp(10px,1.5vw,18px);
        }
        .gmr-svc-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: clamp(16px,2.5vh,24px) clamp(14px,2vw,20px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .gmr-svc-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(237,207,135,0.22); transform: translateY(-4px); }
        .gmr-svc-ic { color: var(--gold); }
        .gmr-svc-title { font-size: clamp(0.85rem,1.2vw,0.95rem); font-weight: 800; color: #fff; margin: 0; }
        .gmr-svc-desc  { font-size: clamp(0.74rem,1vw,0.82rem); color: rgba(255,255,255,0.45); line-height: 1.5; margin: 0; font-weight: 500; }

        /* ── SPACES ── */
        .gmr-spaces-sec {
          background: var(--bg);
          justify-content: center;
          padding: clamp(20px,3.5vh,48px) 0;
        }
        .gmr-spaces-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 16px;
          height: clamp(280px,48vh,480px);
        }
        .gmr-space-tabs { display: flex; flex-direction: column; gap: 8px; }
        .gmr-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: #fff;
          border: 1.5px solid var(--border);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          color: var(--forest);
        }
        .gmr-tab:hover { border-color: var(--forest); }
        .gmr-tab-on { background: var(--forest) !important; border-color: var(--forest) !important; color: #fff !important; }
        .gmr-tab-ic { width: 32px; height: 32px; border-radius: 8px; background: rgba(3,65,26,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .gmr-tab-on .gmr-tab-ic { background: rgba(255,255,255,0.15); }
        .gmr-tab-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .gmr-tab-name { font-size: 0.88rem; font-weight: 800; }
        .gmr-tab-tag  { font-size: 0.6rem; font-weight: 700; color: var(--gold-deep); opacity: 0.8; }
        .gmr-tab-on .gmr-tab-tag { color: var(--gold) !important; }

        .gmr-space-panel { position: relative; border-radius: 20px; overflow: hidden; box-shadow: var(--sh-lg); }
        .gmr-panel-item {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.5s ease;
          display: flex;
          align-items: flex-end;
        }
        .gmr-panel-on { opacity: 1; pointer-events: auto; }
        .gmr-panel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(1,15,6,0.9) 0%, rgba(1,15,6,0.3) 50%, transparent 100%);
        }
        .gmr-panel-info {
          position: relative;
          z-index: 2;
          padding: clamp(20px,3vw,36px);
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .gmr-panel-tag { font-size: 0.6rem; font-weight: 900; color: var(--gold); text-transform: uppercase; letter-spacing: 0.14em; }
        .gmr-panel-title { font-size: clamp(1.3rem,2.2vw,1.9rem); font-weight: 900; margin: 0; }
        .gmr-panel-desc { font-size: 0.85rem; color: rgba(255,255,255,0.65); line-height: 1.6; margin: 0; max-width: 320px; font-weight: 500; }
        .gmr-panel-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--gold);
          color: var(--forest);
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 800;
          text-decoration: none;
          align-self: flex-start;
          transition: all 0.2s ease;
        }
        .gmr-panel-btn:hover { background: var(--gold-light); transform: translateY(-2px); }

        /* Mobile spaces */
        .gmr-spaces-mobile { display: none; gap: 12px; overflow-x: auto; padding-bottom: 8px; }
        .gmr-mob-card { min-width: 220px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: var(--sh-sm); border: 1px solid var(--border); flex-shrink: 0; }
        .gmr-mob-card-body { padding: 14px 16px; }
        .gmr-mob-tag  { font-size: 0.58rem; font-weight: 900; color: var(--gold-deep); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; }
        .gmr-mob-title { font-size: 0.95rem; font-weight: 800; color: var(--forest); margin: 0 0 6px; display: flex; align-items: center; gap: 6px; }
        .gmr-mob-desc  { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; margin: 0; }

        /* ── GALLERY MARQUEE ── */
        .gmr-gallery-sec {
          background: var(--bg);
          flex-direction: column;
          justify-content: center;
        }
        .gmr-gallery-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .gmr-marquee-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .gmr-marquee-wrapper::before,
        .gmr-marquee-wrapper::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 15vw;
          z-index: 2;
          pointer-events: none;
        }
        .gmr-marquee-wrapper::before { left: 0; background: linear-gradient(to right, var(--bg) 0%, transparent 100%); }
        .gmr-marquee-wrapper::after { right: 0; background: linear-gradient(to left, var(--bg) 0%, transparent 100%); }

        .gmr-marquee {
          display: flex;
          width: 100%;
        }
        .gmr-marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 45s linear infinite;
        }
        .gmr-marquee-reverse .gmr-marquee-track {
          animation-direction: reverse;
        }
        .gmr-marquee:hover .gmr-marquee-track {
          animation-play-state: paused;
        }
        .gmr-marquee-set {
          display: flex;
          gap: 16px;
          padding-right: 16px;
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .gmr-marquee-item {
          width: clamp(240px, 22vw, 320px);
          height: clamp(160px, 15vw, 220px);
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          box-shadow: var(--sh-sm);
          cursor: pointer;
        }
        .gmr-marquee-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s var(--ease);
        }
        .gmr-marquee-item:hover img {
          transform: scale(1.1);
        }
        .gmr-marquee-item::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          pointer-events: none;
        }

        /* ── PRICING ── */
        .gmr-plans-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: clamp(10px,1.5vw,18px);
          align-items: start;
        }
        .gmr-plan {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 20px;
          padding: clamp(18px,3vh,28px) clamp(16px,2vw,24px);
          display: flex;
          flex-direction: column;
          gap: clamp(7px,1vh,10px);
          position: relative;
          transition: all 0.3s var(--ease);
          cursor: default;
        }
        .gmr-plan:hover { transform: translateY(-5px); border-color: rgba(237,207,135,0.3); }
        .gmr-plan-accent {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(237,207,135,0.45) !important;
          transform: translateY(-8px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
        }
        .gmr-plan-accent:hover { transform: translateY(-12px) !important; }
        .gmr-plan-badge {
          position: absolute;
          top: -11px; left: 50%;
          transform: translateX(-50%);
          background: var(--gold);
          color: var(--forest);
          font-size: 0.58rem;
          font-weight: 900;
          padding: 4px 14px;
          border-radius: 99px;
          white-space: nowrap;
          letter-spacing: 0.1em;
        }
        .gmr-plan-tag-label { font-size: 0.62rem; font-weight: 900; color: var(--gold); text-transform: uppercase; letter-spacing: 0.14em; }
        .gmr-plan-name { font-size: clamp(1.1rem,1.8vw,1.4rem); font-weight: 900; color: #fff; margin: 0; }
        .gmr-plan-price {
          font-size: clamp(1.5rem,2.5vw,2rem);
          font-weight: 900;
          color: var(--gold);
          letter-spacing: -0.02em;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .gmr-plan-price span { font-size: 0.65rem; color: rgba(255,255,255,0.35); font-weight: 600; }
        .gmr-plan-desc { font-size: clamp(0.75rem,1vw,0.82rem); color: rgba(255,255,255,0.45); line-height: 1.5; margin: 0; }
        .gmr-plan-hr { border: none; height: 1px; background: rgba(255,255,255,0.07); margin: 2px 0; }
        .gmr-plan-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: clamp(4px,0.8vh,7px); }
        .gmr-plan-li { display: flex; align-items: center; gap: 7px; font-size: clamp(0.72rem,0.9vw,0.8rem); color: rgba(255,255,255,0.65); font-weight: 600; }
        .gmr-plan-check { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); flex-shrink: 0; }
        .gmr-plan-check-a { background: rgba(237,207,135,0.2) !important; color: var(--gold) !important; }
        .gmr-plan-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 18px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-top: auto;
        }
        .gmr-plan-btn-d { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #fff; }
        .gmr-plan-btn-d:hover { background: rgba(255,255,255,0.12); }
        .gmr-plan-btn-a { background: linear-gradient(135deg,var(--gold),var(--gold-deep)); color: var(--forest); box-shadow: 0 6px 20px rgba(201,168,76,0.35); }
        .gmr-plan-btn-a:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(201,168,76,0.5); }
        .gmr-plans-note { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.28); font-weight: 600; margin: 0; }

        /* ── FINAL / WHY + CTA ── */
        .gmr-final-sec {
          background: var(--bg);
          padding: 0;
          align-items: stretch;
        }
        .gmr-why-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(16px,2.5vh,28px);
          padding: clamp(40px,5vw,80px) clamp(28px,4vw,60px);
          border-right: 1px solid var(--border);
        }
        .gmr-why-grid { display: flex; flex-direction: column; gap: clamp(10px,1.8vh,16px); }
        .gmr-why-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: clamp(14px,2vh,20px);
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .gmr-why-card:hover { border-color: var(--border-gold); transform: translateX(4px); box-shadow: var(--sh-sm); }
        .gmr-why-ic { color: var(--forest); flex-shrink: 0; margin-top: 2px; }
        .gmr-why-title { font-size: 0.9rem; font-weight: 800; color: var(--forest); margin-bottom: 3px; }
        .gmr-why-desc  { font-size: 0.78rem; color: var(--text-2); line-height: 1.5; font-weight: 500; }

        .gmr-cta-col {
          flex: 0 0 42%;
          background: linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(40px,5vw,80px) clamp(28px,4vw,60px);
          gap: clamp(14px,2vh,20px);
          position: relative;
          overflow: hidden;
        }
        .gmr-cta-glow { position: absolute; top: -80px; right: -80px; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle,rgba(237,207,135,0.15) 0%,transparent 70%); pointer-events: none; }
        .gmr-cta-slot-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,100,50,0.12);
          border: 1px solid rgba(255,100,50,0.25);
          color: #ff9966;
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          align-self: flex-start;
        }
        .gmr-cta-h2 {
          font-size: clamp(1.8rem,3.5vw,3rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin: 0;
        }
        .gmr-cta-p {
          color: rgba(255,255,255,0.55);
          font-size: clamp(0.85rem,1.2vw,0.95rem);
          line-height: 1.65;
          font-weight: 500;
          max-width: 380px;
          margin: 0;
        }
        .gmr-cta-stars {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gmr-cta-stars span { color: rgba(255,255,255,0.55); font-size: 0.8rem; font-weight: 600; }
        .gmr-cta-wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #25D366;
          color: #fff;
          padding: 15px 24px;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 900;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 6px 24px rgba(37,211,102,0.3);
        }
        .gmr-cta-wa-btn:hover { background: #20b858; transform: translateY(-3px); box-shadow: 0 10px 32px rgba(37,211,102,0.45); }
        .gmr-cta-sec-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.8);
          padding: 13px 24px;
          border-radius: 14px;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .gmr-cta-sec-btn:hover { background: rgba(255,255,255,0.13); transform: translateY(-2px); }

        /* ── REVEAL ── */
        .gmr-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .gmr-reveal.gmr-in { opacity: 1; transform: translateY(0); }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .gmr-sec { height: auto; min-height: 100vh; }
          .gmr-split-sec { flex-direction: column; }
          .gmr-split-img { flex: 0 0 300px; }
          .gmr-split-img-fade { background: linear-gradient(to bottom,transparent 50%,var(--cream) 100%); }
          .gmr-float-card { display: none; }
          .gmr-split-content { padding: 32px 24px 40px; }
          .gmr-final-sec { flex-direction: column; }
          .gmr-why-col { border-right: none; border-bottom: 1px solid var(--border); padding: 40px 24px 32px; }
          .gmr-cta-col { flex: 0 0 auto; padding: 36px 24px 48px; }
          .gmr-services-grid { grid-template-columns: repeat(2,1fr); }
          .gmr-spaces-layout { display: none; }
          .gmr-spaces-mobile { display: flex; }
          .gmr-plans-grid { grid-template-columns: 1fr; gap: 12px; }
          .gmr-plan-accent { transform: none; }
        }

        @media (max-width: 768px) {
          .gmr-hero-inner { gap: 12px; padding-top: calc(var(--nav-h) + 12px); }
          .gmr-hero-stats { gap: 8px; }
          .gmr-stat { padding: 10px 12px; min-width: 70px; }
          .gmr-services-grid { grid-template-columns: 1fr; }
          .gmr-why-grid { gap: 10px; }
          .gmr-hero-h1 { font-size: clamp(1.8rem,8vw,2.8rem); }
          .gmr-checklist { grid-template-columns: 1fr; }
        }
      `}</style>
    </SmoothScrollProvider>
  );
}
