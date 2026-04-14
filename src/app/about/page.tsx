'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20know%20more.';

/* ── Icons ── */
const IcLeaf = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
const IcHeart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IcStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IcShield = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IcMap = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IcWA = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>;

/* Avatar person SVG */
const IcPerson = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const VALUES = [
  { Icon: IcLeaf, title: 'Natural Care', desc: 'Eco-friendly, organic methods that keep your plants thriving without harming the environment.', color: '#16a34a' },
  { Icon: IcHeart, title: 'Genuine Passion', desc: 'Every expert on our team genuinely loves plants. That passion shows in every visit and every garden.', color: '#e11d48' },
  { Icon: IcStar, title: 'Quality First', desc: 'From our certified Plant Expert to our curated plant products — we never compromise on quality.', color: '#c9a84c' },
  { Icon: IcShield, title: 'Trusted & Safe', desc: 'All gardeners are background-verified and trained. Open your door with complete confidence.', color: '#0ea5e9' },
];

const STATS = [
  { num: '1,200+', label: 'Visits Done' },
  { num: '25+', label: 'Certified Experts' },
  { num: '4.9★', label: 'Avg Rating' },
  { num: '55+', label: 'Societies Served' },
];

const TEAM = [
  {
    name: 'Rohan Kapoor',
    role: 'Co-Founder & CEO',
    specialty: '🌿 Urban Gardening',
    bio: 'Rohan started GharKaMali after watching his own balcony plants die for lack of reliable help. He believes every home deserves a living green corner.',
    headerColor: 'linear-gradient(135deg, var(--forest) 0%, #065e28 100%)',
    accentColor: 'var(--forest)',
  },
  {
    name: 'Anjali Mehra',
    role: 'Head of Operations',
    specialty: '🌸 Plant Health Expert',
    bio: 'With a background in horticulture, Anjali oversees our gardener network, quality standards, and ensures every customer visit exceeds expectations.',
    headerColor: 'linear-gradient(135deg, #96794f 0%, #7a5f38 100%)',
    accentColor: 'var(--earth)',
  },
  {
    name: 'Dev Singh Rawat',
    role: 'Technology Lead',
    specialty: '💡 Product & Growth',
    bio: 'Dev builds the platform that connects plant parents with expert gardeners, making the booking experience as smooth and delightful as possible.',
    headerColor: 'linear-gradient(135deg, #0f4c5c 0%, #083d4c 100%)',
    accentColor: '#0f4c5c',
  },
];

export default function AboutPage() {
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Hero stagger
      gsap.fromTo('.about-hero > *',
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
      );

      // Stats pop in
      gsap.fromTo('.about-stat',
        { opacity: 0, scale: 0.85, y: 20 },
        {
          opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.about-stats-row', start: 'top 85%' }
        }
      );

      // Mission text
      gsap.fromTo('.mission-left',
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.mission-section', start: 'top 78%' }
        }
      );
      gsap.fromTo('.mission-right',
        { opacity: 0, x: 40 },
        {
          opacity: 1, x: 0, duration: 0.8, delay: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: '.mission-section', start: 'top 78%' }
        }
      );

      // Value cards
      gsap.fromTo('.value-card-item',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.values-section', start: 'top 80%' }
        }
      );

      // Team cards
      gsap.fromTo('.team-card-item',
        { opacity: 0, y: 70, rotateX: 10, transformPerspective: 800 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.18, ease: 'power3.out',
          scrollTrigger: { trigger: '.team-section', start: 'top 78%' }
        }
      );

      // Section headings slide in
      gsap.utils.toArray('.section-heading').forEach((el: any) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' }
          }
        );
      });
    };
    init();
  }, []);

  return (
    <SmoothScrollProvider>
      {/* transparent so navbar stays invisible until scroll on dark hero */}
      <Navbar transparent />

      {/* ══ HERO ══ */}
      <section style={{ paddingTop: 'calc(var(--nav-h) + 80px)', paddingBottom: 100, background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
        {/* decorative orbs */}
        <div style={{ position: 'absolute', top: -120, right: -100, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* leaf decoration */}
        <div style={{ position: 'absolute', top: '20%', right: '8%', opacity: 0.07, transform: 'rotate(30deg) scale(6)', color: '#fff', pointerEvents: 'none' }}><IcLeaf /></div>

        <div className="container about-hero" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '6px 20px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(201,168,76,0.9)', textTransform: 'uppercase', letterSpacing: '0.22em' }}>Our Story</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.4rem,6vw,4.2rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 22 }}>
            We make plant care<br /><span style={{ color: '#c9a84c' }}>simple & joyful</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(1rem,1.8vw,1.15rem)', marginBottom: 44, lineHeight: 1.85 }}>
            GharKaMali was born from a simple belief — every home deserves a thriving green space, and every plant parent deserves expert help to make it happen.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book?type=on-demand" className="btn btn-primary btn-xl">Book a Visit</Link>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem', backdropFilter: 'blur(8px)', transition: 'all 0.25s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
            >
              <IcWA /> Chat With Us
            </a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ background: '#fff', padding: '56px 0', borderBottom: '1px solid var(--border-gold)' }}>
        <div className="container about-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
          {STATS.map((s, i) => (
            <div key={i} className="about-stat" style={{ textAlign: 'center', padding: '28px 16px', background: 'var(--cream)', borderRadius: 20, border: '1.5px solid var(--border-gold)', transition: 'all 0.3s ease', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = 'var(--sh-md)'; el.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--border-gold)'; }}
            >
              <div style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--forest)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section className="mission-section" style={{ padding: 'clamp(64px,8vw,104px) 0', background: 'var(--cream)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(36px,5vw,72px)', alignItems: 'center' }}>
          <div className="mission-left">
            <span className="overline">Our Mission</span>
            <h2 className="section-heading" style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10, marginBottom: 22, lineHeight: 1.15 }}>
              Expert plant care at<br />your doorstep
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.9, fontSize: '1.02rem', fontWeight: 500, marginBottom: 18 }}>
              In today's busy lifestyle, many people love plants but struggle to maintain them. Lack of time, knowledge, and reliable help means countless plants go neglected.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.9, fontSize: '1.02rem', fontWeight: 500 }}>
              GharKaMali bridges that gap — connecting plant parents with certified, background-verified experts who visit your home starting at just{' '}
              <strong style={{ color: 'var(--forest)', fontWeight: 800 }}>₹349 per visit</strong>.
            </p>
          </div>

          <div className="mission-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Certified Plant Expert', bg: 'var(--forest)', color: '#fff', Icon: IcShield },
              { label: 'WhatsApp Reports', bg: '#fff', color: 'var(--forest)', Icon: IcWA },
              { label: 'Organic Methods', bg: '#fff', color: 'var(--forest)', Icon: IcLeaf },
              { label: 'Noida & Gr. Noida', bg: 'var(--cream-dark)', color: 'var(--forest)', Icon: IcMap },
            ].map((item, i) => (
              <div key={i}
                style={{ padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: item.bg, borderRadius: 20, border: '1.5px solid var(--border-gold)', textAlign: 'center', boxShadow: 'var(--sh-sm)', transition: 'all 0.28s ease' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-6px) scale(1.03)'; el.style.boxShadow = 'var(--sh-lg)'; el.style.borderColor = 'var(--gold)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = 'var(--sh-sm)'; el.style.borderColor = 'var(--border-gold)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: item.bg === 'var(--forest)' ? 'rgba(255,255,255,0.15)' : 'rgba(3,65,26,0.06)', color: item.color, marginBottom: 12 }}>
                  <item.Icon />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: item.color, lineHeight: 1.3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="values-section" style={{ padding: 'clamp(64px,8vw,104px) 0', background: '#fff' }}>
        <div className="container">
          <div className="section-heading" style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
            <span className="overline">What We Stand For</span>
            <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10 }}>Our values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} className="value-card-item"
                style={{ padding: '36px 28px', background: 'var(--cream)', borderRadius: 28, border: '1.5px solid var(--border-gold)', boxShadow: 'var(--sh-sm)', transition: 'all 0.32s cubic-bezier(0.22,1,0.36,1)', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-10px) scale(1.02)'; el.style.boxShadow = '0 24px 60px rgba(3,65,26,0.18)'; el.style.borderColor = v.color; el.style.background = '#fff'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = 'var(--sh-sm)'; el.style.borderColor = 'var(--border-gold)'; el.style.background = 'var(--cream)'; }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 18, background: `${v.color}18`, border: `1.5px solid ${v.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: v.color, marginBottom: 22, transition: 'all 0.28s ease' }}>
                  <v.Icon />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 12 }}>{v.title}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.8, fontSize: '0.92rem', fontWeight: 500, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section className="team-section" style={{ padding: 'clamp(64px,8vw,104px) 0', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        {/* bg leaf decoration */}
        <div style={{ position: 'absolute', bottom: -40, left: -60, opacity: 0.04, transform: 'scale(12) rotate(-20deg)', color: 'var(--forest)', pointerEvents: 'none' }}><IcLeaf /></div>

        <div className="container">
          <div className="section-heading" style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
            <span className="overline">The People Behind It</span>
            <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10 }}>Meet the team</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '1rem', marginTop: 12, maxWidth: 480, margin: '12px auto 0', fontWeight: 500 }}>
              A small but passionate team on a mission to green every balcony in India.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {TEAM.map((member, i) => (
              <div key={i} className="team-card-item"
                style={{ borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: 'var(--sh-md)', border: '1.5px solid var(--border-gold)', transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)', cursor: 'default' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-14px)'; el.style.boxShadow = '0 32px 80px rgba(3,65,26,0.22)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = 'var(--sh-md)'; }}
              >
                {/* Colored header */}
                <div style={{ height: 120, background: member.headerColor, position: 'relative', overflow: 'hidden' }}>
                  {/* decorative large leaf in header bg */}
                  <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.12, transform: 'scale(5) rotate(20deg)', color: '#fff', pointerEvents: 'none' }}><IcLeaf /></div>
                  {/* small badge top-left */}
                  <div style={{ position: 'absolute', top: 14, left: 16, background: 'rgba(255,255,255,0.18)', borderRadius: 99, padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.1em', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {member.specialty}
                  </div>
                </div>

                {/* Avatar bridging header + content */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: -40, position: 'relative', zIndex: 2 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fff', border: '4px solid #fff', boxShadow: `0 8px 28px ${member.accentColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'box-shadow 0.3s ease' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${member.headerColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <IcPerson size={36} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 26px 30px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 4 }}>{member.name}</h3>
                  <div style={{ display: 'inline-block', background: `${member.accentColor}18`, color: member.accentColor, borderRadius: 99, padding: '4px 14px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, border: `1px solid ${member.accentColor}30` }}>
                    {member.role}
                  </div>
                  <p style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHERE WE SERVE ══ */}
      <section style={{ padding: 'clamp(56px,7vw,88px) 0', background: '#fff', borderTop: '1px solid var(--border-gold)' }}>
        <div className="container">
          <div className="section-heading" style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="overline">Coverage Area</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, color: 'var(--forest)', marginTop: 10 }}>Where we serve</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, color: 'var(--forest)' }}>
            <IcMap />
            <span style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', fontWeight: 800, color: 'var(--forest)' }}>Noida & Greater Noida</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
            {['ATS Pristine', 'Gaur City', 'Supertech Capetown', 'Godrej Properties', 'Mahagun Moderne', 'Sikka Karmic Greens', 'Amrapali Silicon City', 'Sector 62', 'Sector 78', 'Sector 137', '+ 45 more societies'].map((loc, i) => (
              <span key={i} style={{ padding: '8px 18px', background: i === 10 ? 'var(--forest)' : 'var(--cream)', color: i === 10 ? '#fff' : 'var(--forest)', borderRadius: 99, fontSize: '0.82rem', fontWeight: 700, border: '1.5px solid var(--border-gold)' }}>
                {loc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: 'clamp(64px,8vw,104px) 0', background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to transform your green space?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.58)', marginBottom: 40, fontSize: '1.05rem', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 40px' }}>
            Book a certified plant expert visit today — starting at just ₹349.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book?type=on-demand"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', background: '#c9a84c', color: '#fff', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 8px 32px rgba(201,168,76,0.45)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(201,168,76,0.55)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,168,76,0.45)'; }}
            >
              Book Visit Now →
            </Link>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 30px', background: '#25D366', color: '#fff', borderRadius: 14, fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 8px 32px rgba(37,211,102,0.4)', transition: 'all 0.25s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <IcWA /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.35)} }
        .team-card-item:hover > div:nth-child(2) > div { box-shadow: 0 12px 36px rgba(3,65,26,0.3) !important; }
      `}</style>
    </SmoothScrollProvider>
  );
}
