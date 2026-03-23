'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import { getPlans, getBlogs } from '@/lib/api';

/* ── SVG ICONS ─────────────────────────────────────────── */
const IcArrow   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcCheck   = () => <svg width="9" height="9"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcCalendar= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcStar    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcLeaf    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcBot     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="4"/></svg>;
const IcMap     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcScissors= () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
const IcLawn    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 17c3.6-7 10.4-7 14 0"/><path d="M5 17c2.4-4 7.6-4 10 0"/><line x1="3" y1="20" x2="21" y2="20"/></svg>;
const IcBug     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 2l1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 4-4"/><path d="M17.47 9C19.4 8.8 21 7.1 21 5"/><path d="M18 13h4"/><path d="M21 21c0-2.1-1.7-3.9-4-4"/></svg>;
const IcFlower  = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15"/><circle cx="12" cy="12" r="3"/><path d="m8 16 1.5-1.5"/><path d="M14.5 9.5 16 8"/><path d="m8 8 1.5 1.5"/><path d="M14.5 14.5 16 16"/></svg>;
const IcDroplet = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const IcShop    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;

/* ── ANIMATED COUNTER ── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        obs.disconnect();
        let start = 0;
        const step = end / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(start));
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString('en-IN')}{suffix}</span>;
}

function FloatCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="hero-float-card" style={style}>{children}</div>;
}

/* ── SERVICE CARD ── */
function ServiceCard({ Icon, title, desc, delay }: { Icon: () => JSX.Element; title: string; desc: string; delay: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: '32px 26px', borderRadius: 24, background: hovered ? 'var(--forest)' : '#fff', border: `1.5px solid ${hovered ? 'var(--forest)' : 'var(--border)'}`, transition: 'all 0.32s var(--ease)', transform: hovered ? 'translateY(-6px)' : 'none', boxShadow: hovered ? 'var(--sh-lg)' : 'var(--sh-xs)', cursor: 'default', opacity:1 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, transition: 'all 0.32s', color: hovered ? '#fff' : 'var(--forest)', transform: hovered ? 'scale(1.1)' : 'none' }}>
        <Icon />
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: 10, color: hovered ? '#fff' : 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: '0.86rem', lineHeight: 1.72, color: hovered ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{desc}</p>
    </div>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(i => <IcStar key={i} />)}</div>;
}

const SERVICES = [
  { Icon: IcLeaf,    title: 'Plant Care & Watering',    desc: 'Precision watering schedules, soil nutrition management, and expert plant health monitoring.', delay: 0 },
  { Icon: IcScissors,title: 'Pruning & Shaping',        desc: 'Artistic pruning and structural trimming to keep every plant beautifully healthy.', delay: 80 },
  { Icon: IcLawn,    title: 'Lawn Excellence',           desc: 'Precision mowing, edging, and lawn restoration for carpet-like perfection.', delay: 160 },
  { Icon: IcBug,     title: 'Pest & Disease Control',   desc: 'Eco-friendly integrated pest management to protect your garden naturally.', delay: 240 },
  { Icon: IcFlower,  title: 'Seasonal Planting',        desc: 'Expert plant selection and placement for year-round color and vibrancy.', delay: 320 },
  { Icon: IcDroplet, title: 'Irrigation Systems',       desc: 'Smart drip irrigation design and installation for any garden size.', delay: 400 },
];

const REVIEWS = [
  { name: 'Priya Sharma',  city: 'New Delhi', rating: 5, avatar: 'P', text: 'My terrace garden transformation has been incredible. The gardener arrives on time, works meticulously, and the before/after photos they send are stunning.' },
  { name: 'Rajesh Kumar',  city: 'Gurgaon',   rating: 5, avatar: 'R', text: 'Three months into my subscription and I cannot imagine managing without Ghar Ka Mali. My plants have never been healthier.' },
  { name: 'Anjali Mehta',  city: 'Noida',     rating: 5, avatar: 'A', text: 'The AI plant identification feature is pure magic. Diagnosed a fungal infection in seconds that I had been ignoring for weeks.' },
  { name: 'Vikas Sharma',  city: 'Mumbai',    rating: 5, avatar: 'V', text: 'Premium service at a price that makes complete sense. The app is smooth, booking is instant, and the gardeners are true professionals.' },
];

const SHOP_PREVIEW = [
  { name: 'Premium Potting Mix',    price: '₹499', cat: 'Soil & Compost',  badge: 'Bestseller', Icon: () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" fill="rgba(11,61,46,0.1)"/><path d="M12 7c-1.2 1.5-1.8 3-1.8 3.8 0 1.2.8 2 1.8 2.4.9-.4 1.8-1.2 1.8-2.4 0-.8-.6-2.3-1.8-3.8z" fill="rgba(11,61,46,0.2)"/></svg> },
  { name: 'Neem Oil Spray',         price: '₹299', cat: 'Pest Control',    badge: 'Organic',    Icon: () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="rgba(11,61,46,0.1)"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg> },
  { name: 'Terracotta Pot Set',     price: '₹899', cat: 'Pots & Planters', badge: 'New',        Icon: () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 2h6l1 5H8z" fill="rgba(11,61,46,0.08)"/><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7" fill="rgba(11,61,46,0.06)"/></svg> },
  { name: 'Plant Growth Booster',   price: '₹649', cat: 'Fertilizers',     badge: 'Top Rated',  Icon: () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" fill="rgba(11,61,46,0.06)"/></svg> },
];

const HOW_STEPS = [
  { step: '01', Icon: IcMap,     title: 'Enter Your Location',  desc: 'Share your address. We instantly check serviceability and show available gardeners near you.',           color: 'var(--forest)' },
  { step: '02', Icon: IcCalendar,title: 'Choose & Confirm',     desc: 'Pick a plan, select your preferred date and time. Get instant confirmation with a secure OTP.',          color: 'var(--gold)' },
  { step: '03', Icon: IcLeaf,    title: 'Relax & Enjoy',        desc: 'Track your gardener live, verify their arrival with OTP, receive before/after photo proof.',             color: 'var(--forest-light)' },
];

export default function HomePage() {
  useScrollReveal();
  const { data: plansRaw } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const { data: blogsRaw } = useQuery({ queryKey: ['blogs-home'], queryFn: () => getBlogs({ limit: 4 }) });

  const plans: any[] = (plansRaw as any[]) ?? [];
  const blogs: any[] = (blogsRaw as any)?.items ?? (blogsRaw as any[]) ?? [];
  const subPlans = plans.filter((p: any) => p.plan_type === 'subscription').slice(0, 3);

  return (
    <>
      <Navbar transparent />

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Floating cards (desktop) */}
        <FloatCard style={{ top: '18%', right: '6%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(201,168,76,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)' }}><IcLeaf /></div>
            <div>
              <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.52)', fontWeight: 600, letterSpacing: '0.08em' }}>GARDENER ARRIVING</div>
              <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>Rajesh • 12 min away</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['en_route','arrived','in_progress'].map((s, i) => (
              <div key={s} style={{ height: 3, flex: 1, borderRadius: 99, background: i === 0 ? '#C9A84C' : 'rgba(255,255,255,0.13)' }} />
            ))}
          </div>
        </FloatCard>

        <FloatCard style={{ bottom: '25%', right: '18%', animationDelay: '2s' }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.52)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>AI IDENTIFIED</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(201,168,76,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)' }}><IcBot /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Hibiscus Rosa</div>
                <div style={{ fontSize: '0.7rem', color: '#C9A84C' }}>98% confidence</div>
              </div>
            </div>
          </div>
        </FloatCard>

        <FloatCard style={{ top: '52%', right: '4%', animationDelay: '4s' }}>
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#C9A84C', fontFamily: 'var(--font-display)' }}>4.9</div>
            <div style={{ display: 'flex', gap: 2, justifyContent: 'center', margin: '3px 0' }}>{[1,2,3,4,5].map(i => <IcStar key={i} />)}</div>
            <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.52)', letterSpacing: '0.06em', marginTop: 2 }}>AVERAGE RATING</div>
          </div>
        </FloatCard>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, paddingTop: 'var(--nav-h)' }}>
            <div className="hero-badge anim-fade-up">
              <div className="hero-badge-dot" />
              <span className="hero-badge-text">India's #1 Garden Care Platform</span>
            </div>
            <h1 className="display-1 hero-title anim-fade-up delay-100">
              Your Garden<br />
              <em className="accent">Deserves</em> the{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Very Best
                <svg style={{ position: 'absolute', bottom: -8, left: 0, width: '100%', height: 12 }} viewBox="0 0 400 12" preserveAspectRatio="none">
                  <path d="M2 8 Q100 2 200 8 Q300 14 398 8" stroke="#C9A84C" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="lead hero-subtitle anim-fade-up delay-200">
              Book certified gardeners in minutes. We handle everything — watering, pruning, fertilizing, pest control. Your dream garden, effortlessly maintained.
            </p>
            <div className="hero-cta-row anim-fade-up delay-300">
              <Link href="/book" className="btn btn-primary btn-xl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Book a Gardener <IcArrow />
              </Link>
              <Link href="/plans" className="btn btn-ghost-white btn-xl">View Plans</Link>
              <Link href="/plantopedia" className="btn btn-ghost-white btn-xl" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IcBot /> Identify Plant
              </Link>
            </div>
            {/* Trust row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' }} className="anim-fade-up delay-400">
              <div style={{ display: 'flex', gap: 0 }}>
                {['P','R','A','V','S'].map((l, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: `hsl(${i * 40 + 120},40%,35%)`, border: '2px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: 5 - i }}>{l}</div>
                ))}
              </div>
              <div style={{ fontSize: '0.80rem', color: 'rgba(255,255,255,0.62)' }}>
                <span style={{ color: '#C9A84C', fontWeight: 700 }}>10,000+ homeowners</span> trust us
              </div>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Stars />
                <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.80rem', marginLeft: 4 }}>4.9/5</span>
              </div>
            </div>
            {/* Stats */}
            <div className="hero-stats anim-fade-up delay-500">
              {[
                { num: 10000, suffix: '+', label: 'Happy Customers' },
                { num: 500,   suffix: '+', label: 'Expert Gardeners' },
                { num: 50,    suffix: '+', label: 'Cities Served' },
                { num: 98,    suffix: '%', label: 'Satisfaction Rate' },
              ].map(s => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-num"><Counter end={s.num} suffix={s.suffix} /></div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: 80, display: 'block' }}>
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" fill="var(--bg)"/>
          </svg>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header reveal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
              <span className="overline" style={{ color: 'var(--gold)' }}>Simple Process</span>
              <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
            </div>
            <h2 className="h1">Garden care in 3 simple steps</h2>
            <p className="lead" style={{ marginTop: 12 }}>From booking to beautiful — we handle everything in between</p>
          </div>
          <div className="how-grid">
            <div style={{ position: 'absolute', top: '64px', left: 'calc(16.6% + 20px)', right: 'calc(16.6% + 20px)', height: 2, background: 'linear-gradient(90deg, var(--forest), var(--gold), var(--forest))', opacity: 0.16, zIndex: 0 }} />
            {HOW_STEPS.map((s, i) => (
              <div key={i} className={`reveal delay-${i + 1}`} style={{ textAlign: 'center', padding: '38px 24px 34px', borderRadius: 26, background: '#fff', border: '1.5px solid var(--border)', position: 'relative', zIndex: 1, boxShadow: 'var(--sh-xs)' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: i === 1 ? 'var(--gold-pale)' : 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: i === 1 ? 'var(--earth)' : 'var(--forest)' }}>
                  <s.Icon />
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: s.color, letterSpacing: '0.14em', marginBottom: 10 }}>{s.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: 10, color: 'var(--text)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-header reveal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
              <span className="overline" style={{ color: 'var(--gold)' }}>Our Services</span>
              <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
            </div>
            <h2 className="h1">Complete garden care solutions</h2>
            <p className="lead" style={{ marginTop: 12 }}>Every service your garden could ever need — done by certified professionals</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(296px, 1fr))', gap: 20 }}>
            {SERVICES.map(s => <ServiceCard key={s.title} {...s} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/book" className="btn btn-forest btn-lg">Book Any Service</Link>
          </div>
        </div>
      </section>

      {/* ═══ PLANS ═══ */}
      {subPlans.length > 0 && (
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div className="section-header reveal">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
                <span className="overline" style={{ color: 'var(--gold)' }}>Subscription Plans</span>
                <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
              </div>
              <h2 className="h1">Regular care, exceptional results</h2>
              <p className="lead" style={{ marginTop: 12 }}>Save up to 30% with monthly subscriptions. Pause or cancel anytime.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28, alignItems: 'start' }}>
              {subPlans.map((plan: any, idx: number) => {
                const isPopular = idx === 1 && subPlans.length === 3;
                return (
                  <div key={plan.id} className={`plan-card ${isPopular ? 'featured' : ''}`} style={{ transform: isPopular ? 'scale(1.04)' : 'none' }}>
                    {isPopular && <div className="plan-popular-tag">Most Popular</div>}
                    <div style={{ marginBottom: 20 }}>
                      <span className={`badge ${isPopular ? '' : 'badge-forest'}`} style={isPopular ? { background: 'rgba(255,255,255,0.13)', color: 'rgba(255,255,255,0.82)' } : {}}>Subscription</span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: isPopular ? '#fff' : 'var(--text)', margin: '14px 0 8px' }}>{plan.name}</h3>
                      {plan.description && <p style={{ fontSize: '0.85rem', color: isPopular ? 'rgba(255,255,255,0.62)' : 'var(--text-muted)', lineHeight: 1.7 }}>{plan.description}</p>}
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 900, color: isPopular ? 'var(--gold-light)' : 'var(--forest)', lineHeight: 1 }}>₹{plan.price?.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: '0.88rem', color: isPopular ? 'rgba(255,255,255,0.48)' : 'var(--text-muted)', marginLeft: 4 }}>/month</span>
                    </div>
                    <div style={{ marginBottom: 32 }}>
                      {[
                        plan.visits_per_month && `${plan.visits_per_month} expert visits/month`,
                        plan.max_plants && `Up to ${plan.max_plants} plants`,
                        'Certified & background-verified gardener',
                        'Live GPS tracking',
                        'Before & after photo proof',
                        'WhatsApp updates',
                      ].filter(Boolean).map((feat: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: isPopular ? 'rgba(255,255,255,0.14)' : 'rgba(11,61,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isPopular ? '#fff' : 'var(--forest)'} strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span style={{ fontSize: '0.875rem', color: isPopular ? 'rgba(255,255,255,0.82)' : 'var(--text-2)' }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                    <Link href={`/book?plan=${plan.id}`} className={`btn w-full ${isPopular ? 'btn-primary' : 'btn-forest'}`} style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7 }}>
                      Get Started <IcArrow />
                    </Link>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link href="/plans" className="btn btn-outline">Compare All Plans</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ AI PLANTOPEDIA BANNER ═══ */}
      <section className="section" style={{ background: 'var(--cream)', overflow: 'hidden' }}>
        <div className="container">
          <div className="ai-banner-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
                <span className="overline" style={{ color: 'var(--gold)' }}>AI Powered</span>
              </div>
              <h2 className="h1" style={{ marginBottom: 16 }}>
                Identify <em style={{ fontStyle: 'italic', color: 'var(--forest-light)' }}>any plant</em>{' '}in seconds
              </h2>
              <p className="lead" style={{ marginBottom: 32 }}>
                Upload a photo of any plant. Our AI instantly identifies the species with care instructions, watering schedules, fertilizer tips, and disease diagnosis.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
                {[
                  { Icon: IcBot,     text: '98% identification accuracy powered by plant.id API' },
                  { Icon: IcDroplet, text: 'Custom watering and sunlight schedules' },
                  { Icon: IcFlower,  text: 'Disease detection and treatment recommendations' },
                  { Icon: IcLeaf,    text: 'Complete plant history saved to your account' },
                ].map(f => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(11,61,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}><f.Icon /></div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, marginTop: 4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/plantopedia" className="btn btn-forest btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <IcBot /> Try AI Identification Free
              </Link>
            </div>
            {/* Phone mockup */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 300, height: 400, borderRadius: 28, background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)', boxShadow: 'var(--sh-xl)', position: 'relative', overflow: 'hidden', animation: 'float-card 5s ease-in-out infinite' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'rgba(255,255,255,0.7)' }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="rgba(201,168,76,0.25)"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 14, padding: '14px 18px', width: '100%', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', marginBottom: 4, letterSpacing: '0.08em' }}>IDENTIFIED PLANT</div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>Hibiscus Rosa-sinensis</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gold-light)', marginTop: 3 }}>China Rose · 98% match</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                    {[{ l: 'Water', v: 'Daily' }, { l: 'Sun', v: 'Full sun' }, { l: 'Temp', v: '18–35°C' }, { l: 'Soil', v: 'Well-drained' }].map(c => (
                      <div key={c.l} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '9px 11px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.42)' }}>{c.l}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.80rem', color: '#fff', marginTop: 2 }}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '5%', left: '0', background: 'rgba(201,168,76,0.11)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 11, padding: '9px 13px', backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)' }}>
                  <IcBot /> AI POWERED
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '8%', left: '-4%', background: '#fff', borderRadius: 14, padding: '11px 15px', boxShadow: 'var(--sh)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>Diseases detected</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.88rem', color: 'var(--ok)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Healthy plant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHOP PREVIEW ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
                <span className="overline" style={{ color: 'var(--gold)' }}>Garden Shop</span>
              </div>
              <h2 className="h1">Premium products for your garden</h2>
            </div>
            <Link href="/shop" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              Browse All <IcArrow />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {SHOP_PREVIEW.map((p, i) => (
              <Link key={i} href="/shop" style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.3s var(--ease)', display: 'block',  }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-5px)'; (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                <div style={{ height: 180, background: `linear-gradient(135deg, hsl(${i*50+120},22%,90%) 0%, hsl(${i*50+140},18%,84%) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--forest)' }}>
                  <p.Icon />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>{p.badge}</span>
                  </div>
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.cat}</div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 10, color: 'var(--text)', lineHeight: 1.3 }}>{p.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.08rem', color: 'var(--forest)' }}>{p.price}</span>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <IcShop />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

{/* ═══ REVIEWS ═══ */}
<section className="section" style={{ background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(30,122,88,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
  <div className="container" style={{ position: 'relative', zIndex: 1 }}>
    <div className="section-header reveal">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--gold)' }}>Testimonials</span>
        <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
      </div>
      <h2 className="h1" style={{ color: '#fff' }}>Loved by 10,000+ homeowners</h2>
      <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '1rem', marginTop: 12 }}>Real stories from real garden lovers across India</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {REVIEWS.map((r, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: 24, transform: i % 2 === 1 ? 'translateY(20px)' : 'none', backdropFilter: 'blur(8px)' }}>
          <Stars />
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.86rem', lineHeight: 1.8, margin: '14px 0 18px', fontStyle: 'italic' }}>"{r.text}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${i * 80 + 120},40%,35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.88rem', flexShrink: 0 }}>{r.avatar}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>{r.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.42)' }}>{r.city}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ═══ BLOGS ═══ */}
      {blogs.length > 0 && (
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ height: 1, width: 36, background: 'var(--gold)' }} />
                  <span className="overline" style={{ color: 'var(--gold)' }}>Garden Tips</span>
                </div>
                <h2 className="h1">From our blog</h2>
              </div>
              <Link href="/blogs" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>View All <IcArrow /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {blogs.slice(0, 3).map((b: any, i: number) => (
                <Link key={b.id} href={`/blogs/${b.slug}`} style={{ display: 'block', borderRadius: 22, overflow: 'hidden', textDecoration: 'none', background: '#fff', border: '1px solid var(--border)', transition: 'all 0.3s var(--ease)',  }}
                  onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-5px)'; (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                  <div style={{ height: 200, overflow: 'hidden' }}>
                    {b.cover_image
                      ? <img src={b.cover_image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s var(--ease)' }} />
                      : <div style={{ height: '100%', background: `linear-gradient(135deg, hsl(${i*40+140},30%,28%) 0%, hsl(${i*40+160},26%,22%) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}><IcLeaf /></div>}
                  </div>
                  <div style={{ padding: '20px 22px 24px' }}>
                    {b.category && <span className="badge badge-forest" style={{ marginBottom: 10 }}>{b.category}</span>}
                    <h3 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 8, lineHeight: 1.4, color: 'var(--text)' }}>{b.title}</h3>
                    {b.excerpt && <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>{b.excerpt?.slice(0, 110)}...</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: 'var(--text-faint)' }}>
                      <IcCalendar />
                      {b.created_at && new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: '100px 0', background: 'linear-gradient(150deg, var(--forest) 0%, var(--forest-mid) 60%, var(--forest-light) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ height: 1, width: 36, background: 'rgba(201,168,76,0.45)' }} />
            <span style={{ fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--gold)' }}>Get Started Today</span>
            <div style={{ height: 1, width: 36, background: 'rgba(201,168,76,0.45)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.8rem)', fontWeight: 900, color: '#fff', marginBottom: 18, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready for a Beautiful Garden?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.8 }}>
            Join 10,000+ homeowners who trust Ghar Ka Mali. First visit includes a free garden consultation.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary btn-xl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Book Your First Visit <IcArrow />
            </Link>
            <Link href="/plans" className="btn btn-ghost-white btn-xl">Explore Plans</Link>
          </div>
        </div>
      </section>

      <Footer />
      <style>{`
        .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; position:relative; }
        .ai-banner-grid { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; }
        @media(max-width:900px){ div[style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr) !important;} div[style*="repeat(4,1fr)"]{grid-template-columns:repeat(2,1fr) !important;} }
        @media(max-width:768px){ .how-grid{grid-template-columns:1fr;} .ai-banner-grid{grid-template-columns:1fr; gap:32px;} div[style*="translateY(20px)"]{transform:none !important;} }
        @media(max-width:520px){ div[style*="repeat(4,1fr)"]{grid-template-columns:1fr !important;} div[style*="repeat(2,1fr)"]{grid-template-columns:1fr !important;} }
        @keyframes float-card{0%,100%{transform:translateY(0)}33%{transform:translateY(-10px)}66%{transform:translateY(-5px)}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.55;transform:scale(1.5)}}
        @keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>
    </>
  );
}
