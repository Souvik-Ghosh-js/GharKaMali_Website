'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useGSAPAnimations } from '@/hooks/useGSAPAnimations';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import { getPlans, getBlogs, getTaglines, getShopProducts, getPublicReviews } from '@/lib/api';
import dynamic from 'next/dynamic';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
const ValleyScene = dynamic(() => import('@/components/ValleyScene'), { ssr: false });

/* ── TYPEWRITER — absolutely smooth, zero layout shift ── */
const TypeWriter = ({ words, style, className }: { words: string[]; style?: React.CSSProperties; className?: string }) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');

  useEffect(() => {
    const speed = isDeleting ? 35 : 100;
    timerRef.current = setTimeout(() => {
      const i = loopNum % words.length;
      const fullText = words[i];
      if (!isDeleting) {
        const next = fullText.substring(0, text.length + 1);
        setText(next);
        if (next === fullText) {
          timerRef.current = setTimeout(() => setIsDeleting(true), 2400);
          return;
        }
      } else {
        const next = fullText.substring(0, text.length - 1);
        setText(next);
        if (next === '') { setIsDeleting(false); setLoopNum(n => n + 1); }
      }
    }, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, isDeleting, loopNum, words]);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.offsetHeight);
    }
  }, [text]);

  return (
    <div
      className={`typewriter-container ${className || ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        height: '1.5em',
        overflow: 'hidden',
        lineHeight: 1.25,
        ...style,
      }}
    >
      <span ref={contentRef} style={{
        fontSize: '1.2rem',
        color: 'var(--gold)',
        fontWeight: 700,
        fontStyle: 'italic',
        opacity: 1,
        whiteSpace: 'nowrap'
      }}>
        {text}
      </span>
      <span style={{
        animation: 'blink 0.9s step-end infinite',
        opacity: 0.8,
        fontWeight: 300,
        color: 'var(--gold)',
        fontSize: '1.2rem',
        marginLeft: '4px'
      }}>|</span>
    </div>
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

const AppDownloadPopup = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div className="app-popup-overlay" onClick={() => setShow(false)}>
      <div className="app-popup-box" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={() => setShow(false)}>×</button>
        <div className="app-popup-icon"><IcLeaf /></div>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 12 }}>Join the Green Club</h3>
        <p style={{ color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>
          Download the GharKaMali app to track your plant growth, get digital health reports, and manage bookings instantly.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>Download App Now</button>
          <div style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 600 }}>Available on Play Store & App Store</div>
        </div>
      </div>
    </div>
  );
};

/* ── DATA ── */

const SERVICE_ITEMS = [
  { Icon: IcHome, title: 'Plant Expert Visit (45 mins)', desc: 'A trained plant expert visit focused on deep root inspection, de-weeding, and soil health monitoring.' },
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
  { before: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=800&fit=crop', label: 'Expert Pruning', desc: 'Precise shaping and dead foliage removal to encourage lush new growth and symmetry.' },
  { before: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&h=800&fit=crop', label: 'Soil Health', desc: 'Deep root analysis and custom organic fertilizer application for thriving plants.' },
  { before: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=800&h=800&fit=crop', after: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop', label: 'Digital Report', desc: 'Real-time plant health analytics and WhatsApp-based before/after photo documentation.' },
];

/* ── INTERACTIVE SERVICES ACCORDION & MOBILE ── */
const ServicesAccordion = () => {
  const [active, setActive] = useState(0);

  return (
    <>
      <div className="desktop-only" style={{ display: 'flex', height: '540px', gap: '20px', width: '100%' }}>
        {SERVICE_ITEMS.map((s, i) => {
          const isActive = active === i;
          const transformation = BEFORE_AFTER[i] || BEFORE_AFTER[0];
          return (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              style={{
                flex: isActive ? 6 : 1,
                position: 'relative',
                borderRadius: '32px',
                overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                cursor: 'pointer',
                boxShadow: isActive ? '0 20px 60px rgba(3,65,26,0.2)' : '0 4px 10px rgba(3,65,26,0.05)'
              }}
            >
              {/* Background Image */}
              <img
                src={transformation.after}
                alt={s.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: isActive ? 'none' : 'grayscale(30%) brightness(0.8)' }}
              />

              {/* Gradient Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: isActive ? 'linear-gradient(to top, rgba(3,65,26,0.95) 0%, rgba(3,65,26,0.4) 40%, transparent 100%)' : 'rgba(3,65,26,0.6)', transition: 'background 0.6s' }} />

              {/* Icon Overlay for inactive tabs */}
              <div style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                transition: 'all 0.6s ease',
                display: isActive ? 'none' : 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ color: '#fff', width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon />
                </div>
              </div>

              {/* Active Content */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '40px',
                color: '#fff',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease 0.2s',
                pointerEvents: isActive ? 'auto' : 'none'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, backdropFilter: 'blur(8px)' }}>
                  {transformation.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ color: '#fff', width: 64, height: 64, flexShrink: 0, borderRadius: '20px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(237,207,135,0.3)' }}>
                    <s.Icon />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px 0', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{s.title}</h3>
                    <p style={{ fontSize: '1rem', fontWeight: 500, margin: 0, opacity: 0.9, maxWidth: 500, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* MOBILE LIST */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
        {SERVICE_ITEMS.map((s, i) => {
          const transformation = BEFORE_AFTER[i] || BEFORE_AFTER[0];
          return (
            <div key={i} style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', boxShadow: 'var(--sh-md)', background: '#fff' }}>
              <div style={{ height: 220, position: 'relative' }}>
                <img src={transformation.after} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(3,65,26,0.9) 0%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', backdropFilter: 'blur(8px)' }}>
                  {transformation.label}
                </div>
              </div>
              <div style={{ padding: 24, display: 'flex', gap: 16 }}>
                <div style={{ color: '#fff', width: 50, height: 50, flexShrink: 0, borderRadius: '16px', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest)', margin: '0 0 6px 0' }}>{s.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
};

const HOW_STEPS = [
  { step: '01', Icon: IcMap, title: 'Pin Your Location', desc: 'Securely share your address to find certified plant experts in your society.' },
  { step: '02', Icon: IcCalendar, title: 'Schedule Slot', desc: 'Select a convenient time. We ensure punctual arrival with all tools ready.' },
  { step: '03', Icon: IcLeaf, title: 'Complete Care', desc: 'Your plant expert transforms your green space and shares a digital health report.' },
];

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20book%20a%20gardener%20visit%20for%20my%20home.';

/* ── HERO SLIDESHOW ── */
const HeroSlideshow = () => {
  const images = [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&h=900&fit=crop'
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const it = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(it);
  }, [images.length]);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', background: '#000' }}>
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === idx ? 0.7 : 0,
              transition: 'opacity 1.5s ease-in-out',
              transform: i === idx ? 'scale(1.05)' : 'scale(1)',
              transitionDelay: i === idx ? '0s' : '0s',
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />
    </>
  );
};

/* ── MARQUEE ── */
const Marquee = () => {
  const items = [
    { text: 'Trusted by 1,000+ Plant Parents', Icon: IcShield },
    { text: 'Background Verified Experts', Icon: IcShield },
    { text: '2-Day Intensive Training', Icon: IcScissors },
    { text: 'Certified Realistic Care', Icon: IcLeaf },
    { text: 'Serving Noida & Greater Noida', Icon: IcMap },
  ];
  return (
    <div style={{ background: 'var(--forest)', padding: '20px 0', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="marquee-container" style={{ maskImage: 'none', gap: '40px' }}>
        <div className="marquee-scroller" style={{ gap: '60px', animationDuration: '30s' }}>
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fff', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--gold)' }}><item.Icon /></span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CityMarquee = ({ zones }: { zones: any[] }) => {
  if (!zones?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', overflow: 'hidden' }}>
      <div className="marquee-container" style={{ gap: '60px' }}>
        <div className="marquee-scroller" style={{ animationDuration: '40s', gap: '80px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '80px' }}>
              {zones.map((z, zi) => (
                <div key={zi} style={{ display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--earth)' }}><IcMap /></span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>NOW SERVING: {z.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


/* BASlider removed — images now change via GSAP scroll */

export default function HomePage() {
  useGSAPAnimations();
  const { data: plansRaw } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const { data: blogsRaw } = useQuery({ queryKey: ['blogs-home'], queryFn: () => getBlogs({ limit: 4 }) });
  const { data: shopRaw } = useQuery({ queryKey: ['shop-preview'], queryFn: () => getShopProducts({ limit: 12 }) });
  const { data: taglinesRaw } = useQuery({ queryKey: ['taglines'], queryFn: getTaglines });
  const { data: zonesRaw } = useQuery({ queryKey: ['zones'], queryFn: () => fetch('https://gkm.gobt.in/api/zones').then(r => r.json()).then(j => j.data ?? j) });
  const { data: reviewsRaw } = useQuery({ queryKey: ['public-reviews'], queryFn: () => getPublicReviews({ limit: 12 }) });

  const plans: any[] = (plansRaw as any[]) ?? [];
  const blogs: any[] = (blogsRaw as any)?.items ?? (Array.isArray(blogsRaw) ? blogsRaw : []);
  const shopProducts: any[] = (shopRaw as any) ?? [];
  const zones: any[] = (zonesRaw as any[]) ?? [];
  const publicReviews: any[] = reviewsRaw?.reviews || (Array.isArray(reviewsRaw) ? reviewsRaw : []);
  const activeReviews = publicReviews.length > 0 ? publicReviews : REVIEWS;

  const taglineItems = (taglinesRaw as any[]) ?? [];
  const dynamicWords = taglineItems.length > 0
    ? taglineItems.map(t => t.text || t.tagline || (typeof t === 'string' ? t : 'care?'))
    : [
      'Plants ki tension? GharKaMali hai na.',
      'Plants ki bimari? GharKaMali hai na.',
      'Plants ki growth? GharKaMali hai na.',
      'Plants ki care? GharKaMali hai na.'
    ];

  // ── Before/After scroll tracking ──
  const [activeBA, setActiveBA] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // Slider position (0-100)
  const isDragging = useRef(false);
  const baCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    const container = document.querySelector('.ba-slider-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  useEffect(() => {
    const observers = baCardRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveBA(i); },
        { threshold: 0.35, rootMargin: '-15% 0px -15% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // ── Steps section scroll-reveal ──
  const [stepsVisible, setStepsVisible] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stepsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStepsVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(stepsRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Global section scroll-reveal ──
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.s-reveal');
    const show = (el: Element) => el.classList.add('in-view');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { show(e.target); obs.unobserve(e.target); } }),
      { threshold: 0.05, rootMargin: '0px 0px -4% 0px' }
    );
    els.forEach(el => obs.observe(el));
    // Fallback: show anything still hidden after 1.6s
    const t = setTimeout(() => els.forEach(show), 1600);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <SmoothScrollProvider>
      <PageLoader />
      <Navbar transparent />

      {/* ═══ HERO ═══ */}
      <section className="section hero s-reveal" id="hero" style={{ position: 'relative', overflow: 'hidden', background: '#000' }}>
        <HeroSlideshow />

        <div className="container" style={{ position: 'relative', zIndex: 5 }}>
          <div className="hero-split-layout">

            <div className="hero-left-col">
              <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 99, padding: '8px 20px', marginBottom: 32, fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s ease infinite', display: 'inline-block' }} />
                <span>Professional gardening made simple</span>
              </div>

              {/* Hero title structure */}
              <div style={{ marginBottom: 20, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Row 1: Typewriter */}
                <TypeWriter words={dynamicWords} />

                {/* Row 2: Brand + Tag */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span className="typewriter-gradient" style={{
                    fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    color: '#fff',
                    textShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    lineHeight: 1.1
                  }}>
                    GharKaMali
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    fontStyle: 'italic'
                  }}>
                    hai na!
                  </span>
                </div>
              </div>

              <p className="hero-subtitle" style={{ maxWidth: 580, marginBottom: 44, fontWeight: 500, color: 'rgba(255,255,255,0.92)', textShadow: '0 2px 8px rgba(0,0,0,0.4)', fontSize: 'clamp(1rem, 1.4vw, 1.18rem)', lineHeight: 1.8 }}>
                Certified realistic plant care experts at your home starting just{' '}
                <strong style={{ color: 'var(--gold)', fontWeight: 800 }}>₹349</strong>.
                Ensuring your green spaces thrive in every season.
              </p>

              <div className="hero-cta-row" style={{ display: 'flex', gap: 14, justifyContent: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
                <Link href="/book?type=on-demand" className="btn btn-primary btn-lg btn-3d-plant" style={{ position: 'relative', overflow: 'visible', padding: '12px 28px' }}>
                  Book Professional Visit <IcArrow />
                </Link>
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg btn-3d-plant" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', position: 'relative', overflow: 'visible', padding: '12px 28px' }}>
                  <IcWhatsApp /> Chat with Experts
                </a>
              </div>
            </div>

            <div className="hero-right-col" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              width: '100%',
              maxWidth: '340px',
            }}>
              {[
                { num: 1200, suffix: '+', label: 'Visits Done' },
                { num: 25, suffix: '+', label: 'Certified Experts' },
                { num: 4.9, suffix: '★', label: 'Avg Rating' },
                { num: 55, suffix: '+', label: 'Societies' },
              ].map(s => (
                <div key={s.label} className="hero-stat-card" style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div className="stat-num" style={{
                    fontSize: 'clamp(1.3rem, 2vw, 1.8rem)',
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}>
                    {s.label === 'Avg Rating' ? `4.9★` : <Counter end={s.num} suffix={s.suffix} />}
                  </div>
                  <div style={{
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}>{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div style={{ padding: '0', width: '100%', position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          <Marquee />
          <CityMarquee zones={zones} />
        </div>
      </section>



      {/* ═══ PROFESSIONAL GARDENING MADE SIMPLE ═══ */}
      <section className="section s-reveal" style={{ background: '#fff', overflow: 'hidden' }}>
        <div className="container">
          <div className="prof-gardening-grid">
            <div className="prof-gardening-content s-reveal s-reveal-d1">
              <span className="overline" style={{ color: 'var(--earth)' }}>Service Excellence</span>
              <h2 className="display-2 heading-two-tone" style={{ marginTop: 12, textAlign: 'left', width: 'auto' }}>Professional gardening <br /> made <span>simple.</span></h2>
              <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', marginTop: 24, lineHeight: 1.8, maxWidth: 500, fontWeight: 500 }}>
                We bring the expertise of certified horticulturists to your doorstep. From regular maintenance to complete transformations, we ensure your green space stays vibrant and healthy through science-backed protocols.
              </p>

              <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Personalized plant care plans',
                  'Organic and sustainable practices',
                  'Transparent pricing with no hidden costs',
                  'Expert advice for every plant species'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--forest)', fontWeight: 700 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', boxShadow: 'var(--sh-sm)' }}>✓</div>
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 44 }}>
                <Link href="/book" className="btn btn-primary btn-lg">Book Professional Visit</Link>
              </div>
            </div>

            <div className="prof-gardening-visual s-reveal s-reveal-d2" style={{ position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--sh-xl)', border: '8px solid #fff', transform: 'rotate(1.5deg)' }}>
                <img src="https://images.unsplash.com/photo-1598902108854-10e335adac99?w=1200&h=800&fit=crop" alt="Balcony Transformation" style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(3,65,26,0.85)', color: '#fff', padding: '8px 20px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, backdropFilter: 'blur(12px)', boxShadow: 'var(--sh-sm)' }}>TRANSFORMATION COMPLETE</div>
              </div>

              {/* Floating Badge */}
              <div style={{ position: 'absolute', bottom: -30, right: -10, background: 'var(--forest)', color: '#fff', padding: '24px', borderRadius: '40px 40px 0 40px', boxShadow: 'var(--sh-lg)', textAlign: 'center', width: 150, height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, transform: 'rotate(-4deg)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--gold)' }}>4.9/5</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Ticker */}
        <div className="s-reveal s-reveal-d3" style={{ marginTop: 100, background: 'var(--bg-elevated)', padding: '28px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <div className="marquee-container" style={{ maskImage: 'none' }}>
            <div className="marquee-scroller" style={{ animationDuration: '25s', gap: '80px' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>2 Days Intensive Training</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>Background Verified Experts</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>Eco-friendly Solutions</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ═══ PLANT UTILITIES ═══ */}
      <section className="section s-reveal" style={{ background: 'var(--bg-sage)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,80px)' }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Proactive Maintenance</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Plant Utilities</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', maxWidth: 540, margin: '14px auto 0', lineHeight: 1.7, fontWeight: 500 }}>
              Essential protocols maintained by our experts for every plant in your care.
            </p>
          </div>

          {/* Utilities Grid - Precise 3-2 Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px'
          }}>
            {[
              { title: 'Watering Strategy', desc: 'Precision moisture monitoring for every species.', Icon: IcDroplet },
              { title: 'Organic Nutrition', desc: 'Premium fertilizers for lush green growth.', Icon: IcLeaf },
              { title: 'Pest Screening', desc: 'Proactive detection of infestations and diseases.', Icon: IcShield },
              { title: 'Growth Pruning', desc: 'Shaping plants for better health and aesthetics.', Icon: IcScissors },
              { title: 'Soil Restoration', desc: 'Revitalizing soil health with organic amendments.', Icon: IcMap },
            ].map((item, i) => (
              <div
                key={i}
                className="utility-card"
                style={{
                  gridColumn: i < 3 ? 'span 2' : (i === 3 ? '2 / span 2' : '4 / span 2'),
                  background: '#fff',
                  padding: 'clamp(30px, 4vh, 45px) 30px',
                  border: '1.5px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 28,
                  boxShadow: 'var(--sh-sm)',
                  transition: 'all 0.3s ease-out',
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: 'var(--forest)', width: 64, height: 64, borderRadius: '20px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px solid var(--border-gold)' }}>
                  <item.Icon />
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--forest)', fontWeight: 800, marginBottom: 12 }}>{item.title}</h3>
                <p style={{ color: 'var(--sage)', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <style jsx>{`
          .utility-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 32px rgba(3, 65, 26, 0.1) !important;
            border-color: var(--gold) !important;
          }
          @media (min-width: 1025px) {
            .utility-card:nth-child(1), .utility-card:nth-child(2), .utility-card:nth-child(3) { grid-column: span 2; }
            .utility-card:nth-child(4) { grid-column: 2 / span 2; }
            .utility-card:nth-child(5) { grid-column: 4 / span 2; }
          }
          @media (max-width: 1024px) {
            div { grid-template-columns: repeat(2, 1fr) !important; padding: 10px !important; }
            .utility-card { grid-column: span 1 !important; padding: 30px 20px !important; }
          }
          @media (max-width: 768px) {
            div { grid-template-columns: 1fr !important; }
          }
        `}</style>
        </div>
      </section>


      {/* ═══ HOW IT WORKS — horizontal GSAP-style stack-expand ═══ */}
      <section className="section s-reveal" style={{ position: 'relative', zIndex: 11, overflow: 'hidden', padding: 'clamp(56px,9vw,130px) 0 clamp(72px,10vw,140px)' }}>
        {/* Subtle radial blob decorations */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'clamp(40px,6vw,80px)' }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Streamlined System</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Booking to bloom in 3 steps</h2>
          </div>

          {/* Desktop: horizontal row with GSAP-style expand from stack */}
          <div
            ref={stepsRef}
            className="steps-row desktop-only"
            style={{ position: 'relative', justifyContent: 'center' }}
          >
            {/* Connector line behind cards */}
            <div style={{ position: 'absolute', top: '50%', left: '8%', right: '8%', height: 2, background: 'linear-gradient(90deg, var(--forest), var(--gold), var(--forest))', opacity: 0.15, zIndex: 0, transform: 'translateY(-50%)', pointerEvents: 'none' }} />

            {HOW_STEPS.map((s, i) => (
              <div
                key={i}
                className="step-card-wrap"
                style={{
                  flex: '1 1 0',
                  padding: '0 clamp(8px,1.5vw,20px)',
                  position: 'relative',
                  zIndex: 1,
                  opacity: stepsVisible ? 1 : 0,
                  transform: stepsVisible
                    ? 'translateX(0) scale(1)'
                    : `translateX(${i === 0 ? '80px' : i === 2 ? '-80px' : '0'}) scale(0.82)`,
                  transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${i * 0.18}s, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${i * 0.18}s`,
                }}
              >
                <div style={{
                  background: i === 1 ? 'var(--forest)' : 'rgba(255,255,255,0.82)',
                  backdropFilter: i === 1 ? 'none' : 'blur(12px)',
                  WebkitBackdropFilter: i === 1 ? 'none' : 'blur(12px)',
                  borderRadius: 'clamp(24px,3vw,40px)',
                  border: i === 1 ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(3,65,26,0.07)',
                  padding: 'clamp(28px,3.5vw,52px) clamp(20px,2.5vw,36px)',
                  textAlign: 'center',
                  boxShadow: i === 1 ? '0 24px 80px rgba(3,65,26,0.35), 0 8px 32px rgba(3,65,26,0.2)' : '0 4px 24px rgba(3,65,26,0.06), 0 1px 4px rgba(3,65,26,0.04)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: i === 1 ? 'translateY(-18px)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}>
                  {/* Subtle glow for center card */}
                  {i === 1 && <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: i === 1 ? 'rgba(255,255,255,0.12)' : 'var(--forest)', color: '#fff', borderRadius: 99, padding: '5px 16px', fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 28, position: 'relative', zIndex: 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                    Step {s.step}
                  </div>
                  <div style={{ width: 76, height: 76, borderRadius: '30%', background: i === 1 ? 'rgba(255,255,255,0.15)' : 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#fff', boxShadow: i === 1 ? 'none' : '0 10px 30px rgba(3,65,26,0.25)', position: 'relative', zIndex: 1 }}>
                    <s.Icon />
                  </div>
                  <h3 style={{ color: i === 1 ? '#fff' : 'var(--forest)', fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontWeight: 900, marginBottom: 14, position: 'relative', zIndex: 1 }}>{s.title}</h3>
                  <p style={{ color: i === 1 ? 'rgba(255,255,255,0.78)' : 'var(--text-2)', lineHeight: 1.8, fontSize: 'clamp(0.85rem,1.1vw,0.98rem)', fontWeight: 500, margin: 0, position: 'relative', zIndex: 1 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: vertical stack */}
          <div className="mobile-only mobile-steps-flex" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {HOW_STEPS.map((s, i) => (
              <div key={i} style={{ background: i === 1 ? 'var(--forest)' : '#fff', borderRadius: 22, border: i === 1 ? 'none' : '1.5px solid var(--border-gold)', padding: '22px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: i === 1 ? 'var(--sh-xl)' : 'var(--sh-sm)' }}>
                <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: '22%', background: i === 1 ? 'rgba(255,255,255,0.15)' : 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <s.Icon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: i === 1 ? 'rgba(255,255,255,0.7)' : 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>Step {s.step}</div>
                  <h3 style={{ color: i === 1 ? '#fff' : 'var(--forest)', fontSize: '1.15rem', fontWeight: 900, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: i === 1 ? 'rgba(255,255,255,0.88)' : 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.65, margin: 0, fontWeight: 700 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BRAND STORY ═══ */}
      <section className="section brand-story-section s-reveal" id="brand-story" style={{ background: 'linear-gradient(180deg, #fff 0%, #eef7ee 60%, #e2f0e2 100%)' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -40, left: '10%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: '8%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 32 }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Our Brand Story</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Professional gardening made simple</h2>
          </div>

          <div className="brand-story-grid">
            {/* Left Column: Vision & Values */}
            <div className="brand-story-left">
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: 'var(--forest)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--earth)' }}><IcSun /></span> Our Vision
                </h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>
                  At GharKaMali, our vision is to make plant care simple, reliable, and accessible for every home. In today&apos;s busy lifestyle, many people love plants but struggle to maintain them due to lack of time or proper guidance. We aim to become a trusted platform for professional plant care services that help homes and communities keep their plants healthy, green, and thriving.
                </p>
              </div>

              <div>
                <h3 style={{ color: 'var(--forest)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--earth)' }}><IcShield /></span> Our Values
                </h3>
                <div className="values-grid">
                  {[
                    { title: 'Trust', desc: 'Providing reliable and honest services that customers can depend on.' },
                    { title: 'Care', desc: 'Treating every plant with attention, responsibility, and genuine care.' },
                    { title: 'Quality', desc: 'Delivering professional gardening solutions that actually work.' },
                    { title: 'Sustainability', desc: 'Encouraging greener homes and healthier living spaces.' }
                  ].map((v, i) => (
                    <div key={i} className="value-card">
                      <div style={{ fontWeight: 600, color: 'var(--forest)', marginBottom: 6, fontSize: '1rem' }}>{v.title}</div>
                      <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Journey */}
            <div className="journey-card">
              {/* Decoration */}
              <div className="journey-card-deco" />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ color: 'var(--forest)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--earth)' }}><IcLeaf /></span> From Scratch
                </h3>
                <div style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: '0.9rem', fontWeight: 400 }}>
                  <p style={{ marginBottom: 12 }}>Every journey begins with a small problem. We noticed that many people love plants but taking care of them is not always easy. Busy schedules, lack of plant care knowledge, and difficulty finding a reliable plant expert often lead to plants slowly losing their health.</p>
                  <p style={{ marginBottom: 12 }}>This everyday problem sparked the idea of GharKaMali – a reliable and trustworthy platform for plant care. The journey was not easy. There were many challenges, rejections, and countless sleepless nights while building the right team, creating systems, and solving day-to-day problems.</p>
                  <p style={{ marginBottom: 12 }}>Step by step, the belief in the vision kept growing stronger. What started as a simple idea gradually became a dream to build something that could truly help people and contribute positively to society.</p>
                  <p className="journey-milestone" style={{
                    color: '#011208',
                    fontWeight: 400,
                    fontSize: '0.95rem',
                    lineHeight: 1.7
                  }}>
                    Today, we are proud to share an important milestone – the GharKaMali website is now live, serving homes in Noida and Greater Noida West. And this is just the beginning of our journey to help homes keep their plants healthy and green.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHOP PREVIEW ═══ */}
      {shopProducts?.length > 0 && (
        <section className="section marketplace-section s-reveal" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52, flexWrap: 'wrap', gap: 20 }}>
              <div style={{ maxWidth: 540 }}>
                <div className="section-divider-line" style={{ margin: '0 0 16px' }} />
                <span className="overline overline-dot">GharKaMali Market</span>
                <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 10 }}>Premium Plant Utilities</h2>
                <p className="lead">Curated organic fertilizers, elite tools, and exotic species.</p>
              </div>
              <Link href="/shop" className="btn btn-outline btn-3d-plant" style={{ background: '#fff', fontWeight: 700, borderColor: 'var(--forest)', color: 'var(--forest)', position: 'relative', overflow: 'visible' }}>
                Explore Marketplace
              </Link>
            </div>
            <div className="marketplace-container" style={{ position: 'relative', margin: '0 -20px', padding: '0 20px' }}>
              <div className="testimonials-marquee-outer" id="shop-track" style={{
                padding: '20px 0',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}>
                <div className="shop-marquee-track" style={{
                  display: 'flex',
                  gap: '24px',
                  width: 'max-content',
                  animation: 'marquee-shop 40s linear infinite'
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
                  onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
                >
                  {[...shopProducts, ...shopProducts].map((p: any, idx: number) => (
                    <Link key={`${p._id || p.id}-${idx}`} href={`/shop/${p.slug || p._id || p.id}`} className="card shop-card-animate" style={{
                      padding: 12,
                      borderRadius: 24,
                      display: 'block',
                      textDecoration: 'none',
                      width: '300px',
                      flexShrink: 0,
                      border: '1px solid var(--border)',
                      background: '#fff',
                      boxShadow: 'var(--sh-sm)',
                      transition: 'transform 0.3s ease'
                    }}>
                      <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                        <img src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1597055110188-591ff1130d2e?w=600&h=600&fit=crop'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--forest)', color: '#fff', fontSize: '0.75rem', padding: '6px 12px', borderRadius: 99, fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>₹{p.price}</div>
                      </div>
                      <div style={{ padding: '0 4px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{p.category?.name || p.category || 'Premium Care'}</div>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--forest)', fontWeight: 900, marginBottom: 10, lineHeight: 1.2 }}>{p.name}</h3>
                        <div style={{ display: 'flex', gap: 2 }}><Stars /></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons - Aligned left/right over the cards */}
              <div className="marketplace-nav-buttons" style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 10, padding: '0 10px' }}>
                <button
                  onClick={() => document.getElementById('shop-track')?.scrollBy({ left: -324, behavior: 'smooth' })}
                  className="btn btn-white btn-sm" style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, boxShadow: 'var(--sh-md)', border: '1px solid var(--border)', pointerEvents: 'auto' }}
                >
                  <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}><IcArrow /></span>
                </button>
                <button
                  onClick={() => document.getElementById('shop-track')?.scrollBy({ left: 324, behavior: 'smooth' })}
                  className="btn btn-white btn-sm" style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, boxShadow: 'var(--sh-md)', border: '1px solid var(--border)', pointerEvents: 'auto' }}
                >
                  <IcArrow />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* ═══ FINAL CTA ═══ */}
      <section className="section final-cta s-reveal" id="cta">
        {/* Light gardening video background */}
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, opacity: 0.18 }}>
          <source src="/bg.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(145deg, rgba(255,252,234,0.94) 0%, rgba(240,252,244,0.92) 50%, rgba(255,252,234,0.94) 100%)', pointerEvents: 'none' }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="final-cta-box" style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: 'clamp(36px,6vw,80px) clamp(20px,5vw,60px)', borderRadius: 'clamp(28px,5vw,52px)', border: '1.5px solid rgba(201,168,76,0.35)', boxShadow: '0 20px 80px rgba(3,65,26,0.10), 0 4px 20px rgba(3,65,26,0.07)', position: 'relative', overflow: 'hidden' }}>
            {/* Soft radial glows */}
            <div style={{ position: 'absolute', right: -60, top: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(237,207,135,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -40, bottom: -40, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <h2 className="heading-two-tone" style={{ fontSize: 'clamp(2rem,5.5vw,4.2rem)', fontWeight: 900, marginBottom: 24, lineHeight: 1.1, position: 'relative', fontStyle: 'normal' }}>
              Ready for a Professional<br />
              <span>Garden Transformation?</span>
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 'clamp(0.95rem,1.4vw,1.2rem)', maxWidth: 640, margin: '0 auto 44px', lineHeight: 1.8, fontWeight: 500 }}>
              Join Noida's most elite plant care society. Secure your spot for a premium visit and let our realistic experts handle the rest.
            </p>
            <div className="final-cta-actions" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
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
      <section className="section trust-section s-reveal" id="testimonials">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 52 }}>
            <div className="section-divider-line" />
            <span className="overline overline-dot">Social Proof</span>
            <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Voices from Noida Societies</h2>
          </div>
        </div>
        {/* Infinite Marquee — duplicated for seamless loop */}
        <div className="testimonials-marquee-outer" style={{ paddingBottom: 8 }}>
          <div className="testimonials-marquee-track">
            {/* Original set */}
            {[...activeReviews, ...activeReviews].map((r, i) => (
              <div key={i} className="testimonial-marquee-card">
                <Stars />
                <p style={{ color: 'var(--forest)', fontSize: '1rem', lineHeight: 1.7, margin: '16px 0', fontStyle: 'normal', fontWeight: 600 }}>
                  &ldquo;{r.comment || r.text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '25%', background: 'var(--bg-elevated)', border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                    {r.customer?.name?.[0] || r.avatar || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--forest)' }}>{r.customer?.name || r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--earth)', fontWeight: 700 }}>{r.customer?.city || r.society}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.city || 'Noida'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ BLOG JOURNAL ═══ */}
      {blogs?.length > 0 && (
        <section className="section s-reveal" style={{ position: 'relative', zIndex: 11 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div className="section-divider-line" />
              <span className="overline overline-dot">Botanical Journal</span>
              <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12 }}>Learn Realistic Plant Care</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
              {blogs?.length > 0 ? blogs.slice(0, 3).map((b: any, bi: number) => (
                <Link key={b._id} href={`/blogs/${b.slug}`} className={`s-reveal s-reveal-d${bi + 1}`} style={{ display: 'flex', flexDirection: 'column', gap: 18, textDecoration: 'none' }}>
                  <div className="blog-img-zoom" style={{ position: 'relative', aspectRatio: '16/10' }}>
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
        <section className="section s-reveal" style={{ zIndex: 11 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div className="section-divider-line" />
              <span className="overline overline-dot">Subscription Experience</span>
              <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 12, letterSpacing: '-0.02em' }}>Pick Your <span style={{ color: 'var(--earth)', fontStyle: 'normal' }}>Botanical Plan</span></h2>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', marginBottom: 64 }}>
              {(plans.filter((p: any) => p.is_featured === 1).length > 0
                ? plans.filter((p: any) => p.is_featured === 1)
                : plans.slice(0, 3)
              ).map((plan: any, i: number) => {
                const isDark = i === 1;
                return (
                  <div key={plan._id || i} className="plan-home-card" style={{
                    flex: '1 1 min(360px, calc(100vw - 40px))',
                    maxWidth: 420,
                    background: isDark ? 'var(--forest)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: isDark ? 'none' : 'blur(12px)',
                    WebkitBackdropFilter: isDark ? 'none' : 'blur(12px)',
                    border: `1.5px solid ${isDark ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.35)'}`,
                    borderRadius: 'clamp(24px,4vw,32px)',
                    padding: '32px 28px',
                    position: 'relative',
                    boxShadow: isDark ? 'var(--sh-xl)' : 'var(--sh-md)',
                    transition: 'all 0.4s var(--ease)',
                  }}>
                    {plan.is_best_value === 1 && <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--forest)', padding: '4px 16px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(201,168,76,0.3)', zIndex: 5 }}>BEST VALUE</div>}

                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{plan.plan_type}</div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: isDark ? '#fff' : 'var(--forest)', marginBottom: 10, letterSpacing: '-0.02em' }}>{plan.name}</h3>
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-2)', fontSize: '0.92rem', marginBottom: 32, lineHeight: 1.6 }}>{plan.tagline || plan.description || 'Elevate your living space with our premium botanical maintenance plans.'}</p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 36 }}>
                      <span style={{ fontSize: '2.8rem', fontWeight: 900, color: isDark ? 'var(--gold)' : 'var(--forest)', letterSpacing: '-0.02er' }}>₹{plan.price}</span>
                      <span style={{ fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--sage)', fontWeight: 600 }}>/month</span>
                    </div>

                    <Link href={`/book?plan=${plan.id}`} className={`btn ${isDark ? 'btn-primary' : 'btn-forest'} btn-lg`} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.88rem' }}>
                      {plan.plan_type === 'subscription' ? 'Subscribe Now →' : 'Book a Visit →'}
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
      <AppDownloadPopup />
    </SmoothScrollProvider>
  );
}
