'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useGSAPAnimations } from '@/hooks/useGSAPAnimations';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import { getPlans, getBlogs, getTaglines, getShopProducts } from '@/lib/api';
import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
const TreeScene = dynamic(() => import('@/components/TreeScene'), { ssr: false });

/* ── TYPEWRITER — single-line, no height jump ── */
const TypeWriter = ({ words }: { words: string[] }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];
      setText(isDeleting
        ? fullText.substring(0, text.length - 1)
        : fullText.substring(0, text.length + 1)
      );
      setTypingSpeed(isDeleting ? 50 : 150);
      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };
    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, words]);

  return (
    <span style={{ display: 'block', minHeight: '1.2em', textAlign: 'center', fontSize: 'clamp(3rem, 10vw, 9rem)', fontWeight: 900, color: 'var(--earth)', fontStyle: 'normal' }}>
      {text}<span style={{ animation: 'blink 1s step-end infinite', color: 'var(--earth)', fontWeight: 400 }}>|</span>
    </span>
  );
};

/* ── 3D PLANT BUTTON ── */
const Plant3DButton = ({ href, children, primary = false, onClick }: any) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    ref.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px) scale(1.04)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  };
  const Comp = href ? 'a' : 'button';
  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`btn-3d-plant ${primary ? 'btn-3d-primary' : 'btn-3d-outline'}`}
      style={{ transition: 'transform 0.18s ease, box-shadow 0.18s ease', transformStyle: 'preserve-3d', willChange: 'transform', display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
    >
      {/* Tiny floating leaf decoration */}
      <span className="btn-leaf-deco" style={{ position: 'absolute', top: -14, right: -14, color: 'var(--earth)', pointerEvents: 'none', animation: 'leafFloat 2s ease-in-out infinite' }}><IcLeaf /></span>
      {children}
    </a>
  );
};

/* ── ICONS ── */
const IcArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IcLeaf = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
const IcMap = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IcCalendar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcScissors = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
const IcDroplet = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>;
const IcSun = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
const IcChat = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IcHome = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IcShield = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IcWhatsApp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>;

/* ── COUNTER ── */
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

function Stars() {
  return <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <IcStar key={i} />)}</div>;
}

/* ── DATA ── */

const SERVICE_ITEMS = [
  { Icon: IcHome, title: 'Gardener Visit (45 mins)', desc: 'A trained gardener visit focused on deep root inspection, de-weeding, and soil health monitoring.' },
  { Icon: IcLeaf, title: 'Botanical Analysis', desc: 'Detailed diagnosis of pest presence, leaf nutrition levels, and seasonal growth optimization.' },
  { Icon: IcScissors, title: 'Precision Pruning', desc: 'Expert shaping and dead foliage removal to encourage healthy new growth cycles.' },
  { Icon: IcDroplet, title: 'Hydration Strategy', desc: 'Custom watering schedules based on plant species and specific micro-climate conditions.' },
  { Icon: IcSun, title: 'Light Optimization', desc: 'Strategic plant positioning for optimal photosynthesis and temperature regulation.' },
  { Icon: IcChat, title: 'Digital Plant Report', desc: 'Visual follow-up shared on WhatsApp including growth tracking and long-term care plans.' },
];

const REVIEWS = [
  { name: 'Priya Sharma', city: 'Noida, Sector 78', society: 'ATS Pristine', rating: 5, avatar: 'P', text: 'My balcony garden was dying. After just 2 visits from GharKaMali, every plant bounced back to life. The gardener was so knowledgeable.' },
  { name: 'Rajesh Kumar', city: 'Greater Noida West', society: 'Gaur City', rating: 5, avatar: 'R', text: 'At just ₹349 per visit, this is a steal. The gardener spent 40 minutes, trimmed everything, and identified a disease early.' },
  { name: 'Anjali Mehta', city: 'Noida, Sector 137', society: 'Supertech Capetown', rating: 5, avatar: 'A', text: 'They sent before/after photos on WhatsApp. My husband could not believe the transformation. Subscribed to monthly plan immediately.' },
  { name: 'Suresh Verma', city: 'Noida, Sector 62', society: 'Godrej Properties', rating: 5, avatar: 'S', text: 'Professional, punctual, and truly knowledgeable. My terrace garden has never looked better. Highly recommend!' },
];

const BEFORE_AFTER = [
  { before: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=800&fit=crop', label: 'Organic Recovery', desc: 'Revitalized a dying terrace garden using specialized organic nutrition and root cleaning.' },
  { before: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop', label: 'Pest Eradication', desc: 'Completely removed severe Mealybug infestation and restored leaf shine for 20+ pots.' },
  { before: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop', label: 'Balcony Makeover', desc: 'Corrected overwatering damage and rearranged species for optimal sunlight exposure.' },
];

/* ── MOBILE BEFORE/AFTER TOGGLE ── */
const MobileBeforeAfter = ({ items }: { items: typeof BEFORE_AFTER }) => {
  const [toggles, setToggles] = useState<boolean[]>(items.map(() => false));
  const toggle = (i: number) => setToggles(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  return (
    <div className="mobile-only container" style={{ paddingBottom: 24 }}>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 24, borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--border-gold)', background: '#fff' }}>
          <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
            <img
              src={toggles[i] ? item.after : item.before}
              alt={toggles[i] ? 'After' : 'Before'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.4s ease' }}
            />
            {/* BEFORE / AFTER label */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: toggles[i] ? 'rgba(22,163,74,0.95)' : 'rgba(220,38,38,0.95)',
              color: '#fff', padding: '5px 14px', borderRadius: 99,
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
              backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)',
              transition: 'background 0.3s ease'
            }}>
              {toggles[i] ? 'AFTER' : 'BEFORE'}
            </div>
            {/* Toggle button */}
            <button
              onClick={() => toggle(i)}
              style={{
                position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.95)', border: '1.5px solid var(--border-gold)',
                borderRadius: 99, padding: '8px 20px', fontSize: '0.78rem', fontWeight: 800,
                color: 'var(--forest)', cursor: 'pointer', backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s ease', whiteSpace: 'nowrap'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points={toggles[i] ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
              </svg>
              {toggles[i] ? 'Show Before' : 'Show After'}
            </button>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.95rem' }}>{item.label}</div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6, margin: '4px 0 0' }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const HOW_STEPS = [
  { step: '01', Icon: IcMap, title: 'Pin Your Location', desc: 'Securely share your address to find certified gardeners in your society.' },
  { step: '02', Icon: IcCalendar, title: 'Schedule Slot', desc: 'Select a convenient time. We ensure punctual arrival with all tools ready.' },
  { step: '03', Icon: IcLeaf, title: 'Complete Care', desc: 'Your gardener transforms your green space and shares a digital health report.' },
];

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20book%20a%20gardener%20visit%20for%20my%20home.';

/* ── HERO BACKGROUND SVG ANIMATION ── */
const HeroBgAnimation = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    {/* Animated gradient mesh */}
    <div className="hero-orb hero-orb-1" style={{
      position: 'absolute', top: '-20%', left: '-10%',
      width: '70vw', height: '70vw', maxWidth: 900, maxHeight: 900,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(3,65,26,0.12) 0%, rgba(3,65,26,0.04) 50%, transparent 70%)',
      filter: 'blur(40px)',
      animation: 'orbDrift1 12s ease-in-out infinite',
    }} />
    <div className="hero-orb hero-orb-2" style={{
      position: 'absolute', bottom: '-10%', right: '-5%',
      width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(237,207,135,0.15) 0%, rgba(201,168,76,0.06) 50%, transparent 70%)',
      filter: 'blur(50px)',
      animation: 'orbDrift2 15s ease-in-out infinite',
    }} />
    <div className="hero-orb" style={{
      position: 'absolute', top: '40%', left: '40%',
      width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(11,61,46,0.06) 0%, transparent 70%)',
      filter: 'blur(30px)',
      animation: 'orbDrift3 10s ease-in-out infinite',
    }} />

    {/* Floating botanical particles */}
    {[IcLeaf, IcDroplet, IcSun, IcLeaf, IcScissors, IcLeaf, IcDroplet, IcSun].map((Icon, i) => (
      <div key={i} className="hero-particle floating-leaf" style={{
        position: 'absolute',
        left: `${10 + i * 11}%`,
        top: `${15 + (i % 3) * 25}%`,
        opacity: 0.12 + (i % 3) * 0.04,
        filter: 'blur(0.5px)',
        userSelect: 'none',
        color: 'var(--forest)',
        animation: `floatLeaf${i % 4} ${4 + i * 0.8}s ease-in-out infinite`,
        animationDelay: `${i * 0.5}s`,
      }}><Icon /></div>
    ))}

    {/* Animated SVG botanical lines */}
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-100 700 Q200 400 500 500 Q800 600 1000 300 Q1200 100 1540 200" stroke="#03411a" strokeWidth="2" fill="none" className="hero-svg-path-1" />
      <path d="M-100 500 Q300 300 600 400 Q900 500 1100 200 Q1300 0 1540 100" stroke="#03411a" strokeWidth="1.5" fill="none" className="hero-svg-path-2" />
      <circle cx="400" cy="350" r="120" stroke="rgba(201,168,76,0.5)" strokeWidth="1" fill="none" className="hero-svg-circle" />
      <circle cx="1050" cy="500" r="80" stroke="rgba(3,65,26,0.4)" strokeWidth="1" fill="none" />
    </svg>

    {/* Grid dots */}
    <div className="hero-bg-grid" style={{ opacity: 0.2 }} />
  </div>
);

/* BASlider removed — images now change via GSAP scroll */

export default function HomePage() {
  useGSAPAnimations();
  const { data: plansRaw } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const { data: blogsRaw } = useQuery({ queryKey: ['blogs-home'], queryFn: () => getBlogs({ limit: 4 }) });
  const { data: shopRaw } = useQuery({ queryKey: ['shop-preview'], queryFn: () => getShopProducts({ limit: 4 }) });

  const plans: any[] = (plansRaw as any[]) ?? [];
  const blogs: any[] = (blogsRaw as any)?.items ?? (blogsRaw as any[]) ?? [];
  const shopProducts: any[] = (shopRaw as any) ?? [];

  return (
    <SmoothScrollProvider>
      <PageLoader />
      <Navbar transparent />
      <TreeScene />

      {/* ═══ HERO ═══ */}
      <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, rgba(11,61,46,0.03) 0%, rgba(255,249,225,1) 40%, rgba(255,249,225,1) 70%, rgba(237,207,135,0.08) 100%)', zIndex: 5, isolation: 'isolate' }}>
        <HeroBgAnimation />

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="hero-content-box" style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', paddingTop: '160px', paddingBottom: '100px' }}>

            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)', borderRadius: 99, padding: '8px 20px', marginBottom: 32, fontSize: '0.78rem', fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s ease infinite', display: 'inline-block' }} />
              <span style={{ color: 'var(--forest)' }}>Redefining Botanical Excellence in Noida</span>
            </div>

            {/* Hero title — SINGLE LINE title, everything on one row */}
            {/* Hero title — Multi-row centered layout */}
            <h1 className="hero-title" style={{ color: 'var(--forest)', letterSpacing: '-0.04em', marginBottom: 28, lineHeight: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span className="display-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800 }}>Plants ki</span>
              
              <TypeWriter words={['tension?', 'bimari?', 'growth?', 'care?']} />
              
              <div className="display-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', fontStyle: 'normal', color: 'var(--earth)', display: 'block', marginTop: 10 }}>GharKaMali <span style={{ color: 'var(--forest)' }}>hai na.</span></div>
            </h1>

            <p className="hero-subtitle" style={{ maxWidth: 640, margin: '0 auto 44px', fontWeight: 500, color: 'var(--text-2)', fontSize: 'clamp(1rem, 1.6vw, 1.18rem)', lineHeight: 1.8 }}>
              Certified realistic plant care experts at your home starting just{' '}
              <strong style={{ color: 'var(--earth)', fontWeight: 800 }}>₹349</strong>.
              Ensuring your green spaces thrive in every season.
            </p>

            <div className="hero-cta-row" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36, position: 'relative' }}>
              <Link href="/book?type=on-demand" className="btn btn-primary btn-xl btn-3d-plant" style={{ position: 'relative', overflow: 'visible' }}>
                Book Professional Visit <IcArrow />
              </Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xl btn-3d-plant" style={{ borderColor: 'var(--forest)', color: 'var(--forest)', position: 'relative', overflow: 'visible' }}>
                <IcWhatsApp /> Chat with Experts
              </a>
            </div>

            <div className="hero-trust-line" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.85)', border: '1px solid var(--border-mid)', borderRadius: 99, padding: '12px 24px', boxShadow: 'var(--sh-sm)', marginBottom: 24 }}>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--forest-light)', border: '2px solid #fff', marginLeft: i > 1 ? -10 : 0, position: 'relative', zIndex: 10 - i }} />
                ))}
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--forest)', fontWeight: 700 }}>
                Trusted by <span style={{ color: 'var(--earth)' }}>1,000+ Plant Parents</span> in Noida & Greater Noida
              </div>
            </div>

            <div className="hero-stats" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40, opacity: 1, position: 'relative', zIndex: 10 }}>
              {[
                { num: 1200, suffix: '+', label: 'Visits Done' },
                { num: 25, suffix: '+', label: 'Certified Malis' },
                { num: 4.9, suffix: '★', label: 'Avg Rating' },
                { num: 55, suffix: '+', label: 'Societies' },
              ].map(s => (
                <div key={s.label} className="hero-stat" style={{ background: '#fff', border: '1.5px solid var(--border-gold)', borderRadius: 20, padding: '20px 28px', minWidth: 120, boxShadow: 'var(--sh-sm)', textAlign: 'center', opacity: 1 }}>
                  <div style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--forest)', lineHeight: 1 }}>
                    {s.label === 'Avg Rating' ? `4.9★` : <Counter end={s.num} suffix={s.suffix} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ═══ SERVICES + BEFORE/AFTER SPLIT SCROLL ═══ */}
      <section className="ba-split-section section-no-gap" id="services" style={{ background: 'var(--bg)', position: 'relative', zIndex: 10 }}>
        {/* Single section heading */}
        <div className="container" style={{ paddingTop: 20, paddingBottom: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <span className="overline">Our Services & Transformations</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8, marginBottom: 12 }}>Scroll to Explore</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', fontWeight: 500, maxWidth: 520, margin: '0 auto' }}>
              Watch real transformations unfold as you discover every service we bring to your doorstep.
            </p>
          </div>
        </div>

        {/* Desktop split */}
        <div className="ba-split-layout desktop-only">
          {/* LEFT — pinned image area */}
          <div className="ba-split-left desktop-only" style={{ zIndex: 5, paddingTop: '35vh', paddingBottom: '30vh' }}>
            <div className="ba-image-stack" style={{ position: 'relative', width: '100%', maxWidth: 540, aspectRatio: '4/3', borderRadius: 28, overflow: 'hidden', border: '2px solid var(--border-gold)', boxShadow: 'var(--sh-xl)', background: 'var(--bg-elevated)' }}>
              {BEFORE_AFTER.map((item, i) => (
                <div key={i} className={`ba-pair ba-pair-${i}`} style={{ position: i === 0 ? 'relative' : 'absolute', inset: 0, width: '100%', height: '100%', opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 }}>
                  {/* AFTER full bg */}
                  <img src={item.after} alt={`After - ${item.label}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {/* BEFORE overlaid, clips via GSAP */}
                  <div className="ba-before-clip" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 3, clipPath: 'inset(0 0% 0 0)', overflow: 'hidden' }}>
                    <img src={item.before} alt={`Before - ${item.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                  {/* Labels */}
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, background: 'rgba(220,38,38,0.95)', color: '#fff', padding: '5px 14px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap', display: 'inline-flex', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}>BEFORE</div>
                  <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: 'rgba(22,163,74,0.95)', color: '#fff', padding: '5px 14px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap', display: 'inline-flex', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}>AFTER</div>
                </div>
              ))}
              {/* Progress bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(0,0,0,0.1)', zIndex: 15 }}>
                <div className="ba-progress-bar" style={{ height: '100%', width: '33%', background: 'var(--gold)', borderRadius: 4, transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1)' }} />
              </div>
            </div>
            {/* Caption area */}
            <div className="ba-caption" style={{ marginTop: 24, textAlign: 'center', maxWidth: 540 }}>
              <div className="ba-caption-label" style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '1.2rem', marginBottom: 6, letterSpacing: '-0.01em' }}>{BEFORE_AFTER[0].label}</div>
              <p className="ba-caption-desc" style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: 500, opacity: 0.9 }}>{BEFORE_AFTER[0].desc}</p>
            </div>
          </div>

          {/* RIGHT — scrolling service cards */}
          <div className="ba-split-right">
            {SERVICE_ITEMS.map((s, i) => (
              <div key={i} className="service-card-cinematic" style={{ background: '#fff', border: '1.5px solid var(--border-gold)', borderRadius: 28, padding: 40, marginBottom: 32, boxShadow: 'var(--sh-sm)', opacity: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', marginBottom: 20, border: '1.5px solid var(--border-gold)' }}>
                  <s.Icon />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.8, fontWeight: 500 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile fallback — with before/after toggle */}
        <MobileBeforeAfter items={BEFORE_AFTER} />
        <div className="mobile-only container" style={{ paddingBottom: 0 }}>
          {SERVICE_ITEMS.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 22, padding: 28, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest)', marginBottom: 6 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section" style={{ background: '#fff', position: 'relative', zIndex: 11 }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="overline">Streamlined System</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8 }}>Booking to bloom in 3 steps</h2>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 36 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={i} className="how-card" style={{ padding: 44, background: 'var(--cream)', borderRadius: 36, border: '1px solid var(--border-gold)', textAlign: 'center', transition: 'all 0.4s var(--ease)', transformStyle: 'preserve-3d', willChange: 'transform' }}>
                <div style={{ width: 84, height: 84, borderRadius: '28%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: 'var(--forest)', border: '2px solid var(--gold)', boxShadow: 'var(--sh-sm)' }}>
                  <s.Icon />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--earth)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Step {s.step}</div>
                <h3 style={{ color: 'var(--forest)', fontSize: '1.5rem', fontWeight: 900, marginBottom: 14 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SHOP PREVIEW ═══ */}
      {shopProducts?.length > 0 && (
        <section className="section" style={{ background: 'var(--bg)', position: 'relative', zIndex: 11, borderTop: '1px solid var(--border-mid)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 20 }}>
              <div style={{ maxWidth: 540 }}>
                <span className="overline">GharKaMali Market</span>
                <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8 }}>Premium Plant Utilities</h2>
                <p className="lead">Curated organic fertilizers, elite tools, and exotic species.</p>
              </div>
              <Link href="/shop" className="btn btn-outline btn-3d-plant" style={{ background: '#fff', fontWeight: 700, borderColor: 'var(--forest)', color: 'var(--forest)', position: 'relative', overflow: 'visible' }}>
                Explore Marketplace
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
              {shopProducts?.length > 0 ? shopProducts.slice(0, 4).map((p: any, idx: number) => (
                <Link key={p._id || p.id || idx} href={`/shop/${p.slug || p._id || p.id}`} className="card shop-card-animate" style={{ padding: 10, borderRadius: 22, display: 'block', textDecoration: 'none' }}>
                  <div style={{ position: 'relative', width: '100%', height: 240, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
                    <img src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1597055110188-591ff1130d2e?w=600&h=600&fit=crop'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--forest)', color: '#fff', fontSize: '0.72rem', padding: '5px 10px', borderRadius: 99, fontWeight: 700 }}>₹{p.price}</div>
                  </div>
                  <div style={{ padding: '0 6px 6px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--earth)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 3 }}>{p.category?.name || p.category || 'Premium Care'}</div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--forest)', fontWeight: 800, marginBottom: 6 }}>{p.name}</h3>
                    <div style={{ display: 'flex', gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <IcStar key={i} />)}</div>
                  </div>
                </Link>
              )) : null}
            </div>
          </div>
        </section>
      )}
      {/* ═══ FINAL CTA ═══ */}
      <section className="section final-cta" id="cta" style={{ background: 'var(--cream)', borderTop: '1px solid var(--border-gold)' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ background: '#fff', padding: 'clamp(48px,8vw,80px) clamp(24px,6vw,60px)', borderRadius: 52, border: '2px solid var(--gold)', boxShadow: 'var(--sh-xl)', position: 'relative', overflow: 'hidden' }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,207,135,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -40, bottom: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 900, color: 'var(--forest)', marginBottom: 24, lineHeight: 1.1, position: 'relative', fontStyle: 'normal' }}>
              Ready for a Professional<br />
              <span style={{ fontStyle: 'normal', color: 'var(--earth)' }}>Garden Transformation?</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.95rem,1.4vw,1.2rem)', maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.8, fontWeight: 500 }}>
              Join Noida's most elite plant care society. Secure your spot for a premium visit and let our realistic experts handle the rest.
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/book?type=on-demand" className="btn btn-primary btn-xl btn-3d-plant" style={{ position: 'relative', overflow: 'visible' }}>
                Book Your Slot <IcArrow />
              </Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-xl btn-3d-plant" style={{ background: '#fff', border: '2px solid var(--forest)', color: 'var(--forest)', position: 'relative', overflow: 'visible' }}>
                <IcWhatsApp /> Discuss on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section trust-section" id="testimonials" style={{ background: '#fff', zIndex: 11, paddingBottom: 100 }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="overline">Social Proof</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8 }}>Voices from Noida Societies</h2>
            <p style={{ color: 'var(--text-2)', marginTop: 12, fontSize: '0.9rem', opacity: 0.7 }}>Hover to pause</p>
          </div>
        </div>
        {/* Infinite Marquee — duplicated for seamless loop */}
        <div className="testimonials-marquee-outer" style={{ paddingBottom: 8 }}>
          <div className="testimonials-marquee-track">
            {/* Original set */}
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div key={i} className="testimonial-marquee-card">
                <Stars />
                <p style={{ color: 'var(--forest)', fontSize: '1rem', lineHeight: 1.7, margin: '16px 0', fontStyle: 'normal', fontWeight: 600 }}>
                  &ldquo;{r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '25%', background: 'var(--bg-elevated)', border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--forest)' }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--earth)', fontWeight: 700 }}>{r.society}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ BLOG JOURNAL ═══ */}
      {blogs?.length > 0 && (
        <section className="section" style={{ background: 'var(--cream)', position: 'relative', zIndex: 11, borderTop: '1px solid var(--border-gold)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <span className="overline">Botanical Journal</span>
              <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8 }}>Learn Realistic Plant Care</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
              {blogs?.length > 0 ? blogs.slice(0, 3).map((b: any) => (
                <Link key={b._id} href={`/blogs/${b.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: 18, textDecoration: 'none' }}>
                  <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', aspectRatio: '16/10', boxShadow: 'var(--sh-sm)' }}>
                    <img src={b.thumbnail || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=500&fit=crop'} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.92)', padding: '6px 16px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800, color: 'var(--forest)', backdropFilter: 'blur(8px)' }}>{b.category?.name || 'Expert Tips'}</div>
                  </div>
                  <div style={{ padding: '0 8px' }}>
                    <h3 style={{ fontSize: '1.35rem', color: 'var(--forest)', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{b.title}</h3>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.8 }}>Expert insights on modern plant care and garden health...</p>
                  </div>
                </Link>
              )) : null}
            </div>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link href="/blogs" className="btn btn-forest btn-lg btn-3d-plant" style={{ position: 'relative', overflow: 'visible' }}>View All Articles</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PLANS PREVIEW ═══ */}
      {plans.length > 0 && (
        <section className="section" style={{ background: 'var(--bg)', zIndex: 11, borderTop: '1px solid var(--border)', paddingBottom: 120 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span className="overline" style={{ color: 'var(--forest)', opacity: 0.5 }}>Subscription Experience</span>
              <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12, letterSpacing: '-0.02em' }}>Choose Your botanical <span style={{ color: 'var(--earth)', fontStyle: 'normal' }}>wellness journey</span></h2>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginBottom: 64 }}>
              {plans.slice(0, 2).map((plan: any, i: number) => {
                const isDark = i === 1;
                return (
                  <div key={plan._id || i} className="plan-home-card" style={{ 
                    flex: '1 1 420px',
                    maxWidth: 500,
                    background: isDark ? 'var(--forest)' : '#fff', 
                    border: `1.5px solid ${isDark ? 'transparent' : 'var(--border-gold)'}`, 
                    borderRadius: 40, 
                    padding: '52px 48px', 
                    position: 'relative', 
                    boxShadow: isDark ? 'var(--sh-xl)' : 'var(--sh-md)',
                    transition: 'all 0.4s var(--ease)',
                  }}>
                    {isDark && <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--forest)', padding: '6px 20px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 15px rgba(201,168,76,0.4)', zIndex: 5 }}>MOST RECOMMENDED</div>}
                    
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>{plan.plan_type}</div>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: isDark ? '#fff' : 'var(--forest)', marginBottom: 12, letterSpacing: '-0.02em' }}>{plan.name}</h3>
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-2)', fontSize: '1rem', marginBottom: 40, lineHeight: 1.7 }}>{plan.description || 'Elevate your living space with our premium botanical maintenance plans.'}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 44 }}>
                      <span style={{ fontSize: '3.4rem', fontWeight: 900, color: isDark ? 'var(--gold)' : 'var(--forest)', letterSpacing: '-0.02em' }}>₹{plan.price}</span>
                      <span style={{ fontSize: '1.2rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--sage)', fontWeight: 600 }}>/month</span>
                    </div>
                    
                    <Link href={`/book?plan=${plan.id}`} className={`btn ${isDark ? 'btn-primary' : 'btn-forest'} btn-lg`} style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: '0.95rem' }}>
                      Start Selection →
                    </Link>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 1.5, background: 'linear-gradient(90deg, transparent, var(--border-gold), transparent)', marginBottom: 48, maxWidth: 400, margin: '0 auto 48px' }} />
              <Link href="/plans" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--forest)', color: 'var(--forest)', padding: '16px 52px', fontSize: '1rem', fontWeight: 800 }}>
                View All Exclusive Plans
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* ═══ FLOATING WHATSAPP ═══ */}
      <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
        <IcWhatsApp />
        <div className="whatsapp-tooltip">Need Help? Chat with Us</div>
      </a>

      <style jsx global>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.3)} }
        @keyframes leafFloat0 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(12deg)} }
        @keyframes leafFloat1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-15px) rotate(-8deg)} }
        @keyframes leafFloat2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-25px) rotate(15deg)} }
        @keyframes leafFloat3 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(-10deg)} }
        @keyframes orbDrift1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.08)} }
        @keyframes orbDrift2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,25px) scale(1.06)} }
        @keyframes orbDrift3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-40px) scale(0.94)} }
        @keyframes leafFloat { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-12px) rotate(8deg)} 66%{transform:translateY(-6px) rotate(-5deg)} }
        
        .section-no-gap { padding-top: 0 !important; }
        @media (max-width: 768px) {
          .hero-content-box { padding-top: 0 !important; padding-bottom: 0 !important; }
          .hero-title { margin-bottom: 32px !important; gap: 4px !important; }
          .hero-subtitle { margin-bottom: 30px !important; }
          .hero-cta-row { margin-bottom: 24px !important; gap: 12px !important; }
          .hero-stats { margin-top: 40px !important; }
          .ba-split-section { overflow-x: hidden; }
        }
        .plans-carousel-track::-webkit-scrollbar { height: 4px; }
        .plans-carousel-track::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 99px; }

        /* 3D Button Base Styles */
        .btn-3d-plant {
          position: relative;
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .btn-3d-plant:hover {
          transform: perspective(600px) translateY(-4px) !important;
          box-shadow: 0 20px 50px rgba(3,65,26,0.25), 0 8px 20px rgba(3,65,26,0.15) !important;
        }
        .btn-3d-plant:active {
          transform: perspective(600px) translateY(-1px) !important;
        }
        .btn-leaf-deco {
          animation: leafFloat 2.5s ease-in-out infinite;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .btn-3d-plant:hover .btn-leaf-deco {
          opacity: 1;
        }

        /* Hero SVG path animations */
        .hero-svg-path-1 {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawPath 4s ease forwards 0.5s;
        }
        .hero-svg-path-2 {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: drawPath 5s ease forwards 1s;
        }
        .hero-svg-circle {
          stroke-dasharray: 754;
          stroke-dashoffset: 754;
          animation: drawPath 3s ease forwards 0.8s;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        
        /* Hero bg grid */
        .hero-bg-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(3,65,26,0.12) 1px, transparent 1px);
          background-size: 48px 48px;
        }
      `}</style>
    </SmoothScrollProvider>
  );
}
