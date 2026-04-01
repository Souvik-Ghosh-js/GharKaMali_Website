'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlans } from '@/lib/api';

const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcX = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcShield = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcWA = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;

const COMPARE_FEATURES = [
  { label: 'Certified & verified gardener', basic: true, standard: true, premium: true },
  { label: 'Before & after photo proof', basic: true, standard: true, premium: true },
  { label: 'Live GPS tracking', basic: true, standard: true, premium: true },
  { label: 'Visits per month', basic: '2', standard: '4', premium: '8' },
  { label: 'Max plants covered', basic: '10', standard: '20', premium: 'Unlimited' },
  { label: 'Plant health report', basic: false, standard: true, premium: true },
  { label: 'Priority scheduling', basic: false, standard: false, premium: true },
  { label: 'Dedicated gardener', basic: false, standard: false, premium: true },
  { label: 'Free fertilizer application', basic: false, standard: true, premium: true },
  { label: '24/7 WhatsApp support', basic: false, standard: false, premium: true },
];

const FAQS = [
  { q: 'Can I change or cancel my plan anytime?', a: 'Yes. You can pause or cancel your subscription at any time with no questions asked. There are no lock-in periods or cancellation fees.' },
  { q: 'Are your gardeners background-verified?', a: 'Absolutely. Every gardener goes through a thorough background check, skill assessment, and training program before being assigned to customers.' },
  { q: "What if I'm not satisfied with the visit?", a: "We offer a 100% satisfaction guarantee. If you're not happy, we'll send a replacement gardener free of charge within 24 hours." },
  { q: 'How does the live tracking work?', a: "Once your gardener starts their journey, you'll get a live map link showing their real-time location. You'll also receive WhatsApp updates at every milestone." },
  { q: 'Can I request the same gardener every visit?', a: 'Yes, on our Premium plan you get a dedicated gardener who learns your garden over time. Standard and Basic plans try to maintain consistency but cannot guarantee the same gardener.' },
];

function CheckCell({ val }: { val: boolean | string }) {
  if (typeof val === 'string') return <span style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.9rem' }}>{val}</span>;
  return val
    ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><IcCheck/></div>
    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><IcX/></div>;
}

export default function PlansPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: plansRaw, isLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const plans: any[] = (plansRaw as any[]) ?? [];
  const subPlans = plans.filter((p: any) => p.plan_type === 'subscription');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // 3D canvas hero
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    const hexagons: { x: number; y: number; r: number; opacity: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < 18; i++) {
      hexagons.push({ x: Math.random() * W, y: Math.random() * H, r: 30 + Math.random() * 60, opacity: 0.03 + Math.random() * 0.06, phase: Math.random() * Math.PI * 2, speed: 0.005 + Math.random() * 0.01 });
    }
    const drawHex = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; i === 0 ? ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)) : ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
      ctx.closePath();
    };

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, W, H);
      // Gradient bg
      const grd = ctx.createLinearGradient(0, 0, W, H);
      grd.addColorStop(0, 'rgba(3,65,26,0.08)'); grd.addColorStop(1, 'rgba(201,168,76,0.05)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      // Hexagons
      hexagons.forEach(h => {
        const scale = 1 + 0.1 * Math.sin(t * h.speed * 60 + h.phase);
        drawHex(h.x, h.y, h.r * scale);
        ctx.strokeStyle = `rgba(3,65,26,${h.opacity})`;
        ctx.lineWidth = 1.5; ctx.stroke();
        // Inner hex
        drawHex(h.x, h.y, h.r * scale * 0.6);
        ctx.strokeStyle = `rgba(201,168,76,${h.opacity * 0.6})`;
        ctx.lineWidth = 0.8; ctx.stroke();
      });
      // Flowing lines
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y = H * (0.3 + s * 0.2) + Math.sin((x / W) * Math.PI * 4 + t + s) * 40;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${s === 0 ? '3,65,26' : s === 1 ? '201,168,76' : '16,163,74'},0.06)`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // GSAP
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo('.plans-hero-inner > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.2 });

      gsap.utils.toArray('.plan-card-3d').forEach((card: any, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 100, rotateX: 20, scale: 0.9, transformPerspective: 1000 },
          { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.1, delay: 0.3 + i * 0.15, ease: 'power4.out',
            scrollTrigger: { trigger: card, start: 'top 92%' } }
        );
        card.addEventListener('mouseenter', () => gsap.to(card, { y: -10, rotateX: -6, transformPerspective: 1000, duration: 0.35, ease: 'power2.out', boxShadow: '0 40px 100px rgba(3,65,26,0.3)' }));
        card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, rotateX: 0, duration: 0.4, ease: 'power3.out' }));
      });

      gsap.fromTo('.guarantee-banner', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.9, scrollTrigger: { trigger: '.guarantee-banner', start: 'top 88%' } });
      gsap.utils.toArray('.faq-item-animate').forEach((el: any, i) => {
        gsap.fromTo(el, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.7, delay: i * 0.07, scrollTrigger: { trigger: el, start: 'top 92%' } });
      });
    };
    init();
  }, []);

  return (
    <>
      <Navbar/>
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>

        {/* ── HERO with 3D canvas ── */}
        <div style={{ position: 'relative', padding: '80px 0 120px', overflow: 'hidden', textAlign: 'center' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>
          {/* Glowing orbs */}
          <div style={{ position: 'absolute', top: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'orbDrift2 12s ease-in-out infinite' }}/>
          <div style={{ position: 'absolute', bottom: 0, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'orbDrift1 9s ease-in-out infinite' }}/>

          <div className="container plans-hero-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '8px 22px', marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', animation: 'badgePulse 2s infinite' }}/>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Simple Pricing · No Lock-in</span>
            </div>
            <h1 className="display-1" style={{ color: 'var(--forest)', letterSpacing: '-0.03em', marginBottom: 20 }}>
              Invest in your <em style={{ color: 'var(--earth)', fontStyle: 'italic' }}>garden's</em> future
            </h1>
            <p style={{ fontSize: 'clamp(1rem,1.6vw,1.2rem)', color: 'var(--text-2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8, fontWeight: 500 }}>
              Transparent pricing. No hidden fees. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="container" style={{ marginTop: -60, paddingBottom: 100 }}>

          {/* ── PLAN CARDS ── */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 520, borderRadius: 28, background: 'var(--bg-elevated)', animation: 'shimmer 1.5s ease infinite' }}/>)}
            </div>
          ) : plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 28, border: '1.5px dashed var(--border)' }}>
              <div style={{ color: 'var(--forest)', opacity: 0.3, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              </div>
              <h3 style={{ color: 'var(--forest)', marginBottom: 8 }}>Plans coming soon</h3>
              <p style={{ color: 'var(--sage)' }}>Contact us for a custom plan</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: 24, alignItems: 'start' }}>
              {plans.map((plan: any, idx) => {
                const isPopular = idx === 1 && plans.length >= 3;
                const isDark = isPopular;
                return (
                  <div key={plan.id || idx} className="plan-card-3d"
                    style={{ position: 'relative', background: isDark ? 'var(--forest)' : '#fff', border: `2px solid ${isDark ? 'transparent' : 'var(--border-gold)'}`, borderRadius: 32, padding: '44px 36px', boxShadow: isDark ? '0 30px 80px rgba(3,65,26,0.35)' : 'var(--sh-sm)', transformStyle: 'preserve-3d', willChange: 'transform', transition: 'transform 0.35s, box-shadow 0.35s', opacity: 0 }}
                  >
                    {isDark && <div style={{ position: 'absolute', inset: 0, borderRadius: 32, background: 'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(3,65,26,0.05) 100%)', pointerEvents: 'none' }}/>}
                    {isPopular && (
                      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#c9a84c,#f5dea0,#c9a84c)', color: 'var(--forest)', padding: '6px 24px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        MOST POPULAR
                      </div>
                    )}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <span style={{ display: 'inline-block', padding: '4px 14px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(3,65,26,0.06)', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, color: isDark ? 'rgba(201,168,76,0.9)' : 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                        {plan.plan_type === 'subscription' ? 'Subscription' : 'On-demand'}
                      </span>
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: isDark ? '#fff' : 'var(--forest)', marginBottom: 8, letterSpacing: '-0.01em' }}>{plan.name}</h2>
                      {plan.description && <p style={{ fontSize: '0.88rem', color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--sage)', lineHeight: 1.7, marginBottom: 24 }}>{plan.description}</p>}

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 'clamp(2.8rem,5vw,3.5rem)', fontWeight: 900, lineHeight: 1, color: isDark ? 'var(--gold)' : 'var(--earth)' }}>₹{plan.price?.toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: '1rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--sage)' }}>/{plan.plan_type === 'subscription' ? 'mo' : 'visit'}</span>
                      </div>
                      {plan.plan_type === 'subscription' && <p style={{ fontSize: '0.78rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--earth)', marginBottom: 28 }}>Billed monthly · Cancel anytime</p>}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                        {[plan.visits_per_month && `${plan.visits_per_month} expert visits/month`, plan.max_plants && `Up to ${plan.max_plants} plants covered`, 'Certified & verified gardener', 'Before & after photo proof', 'WhatsApp digital report'].filter(Boolean).map((feat: any, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: isDark ? 'rgba(74,222,128,0.15)' : '#DCFCE7', border: `1px solid ${isDark ? 'rgba(74,222,128,0.3)' : '#86EFAC'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#4ADE80' : '#16A34A'} strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span style={{ fontSize: '0.88rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'var(--forest)', fontWeight: 600 }}>{feat}</span>
                          </div>
                        ))}
                      </div>

                      <Link href={`/book?plan=${plan.id}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 24px', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', background: isDark ? '#fff' : 'var(--forest)', color: isDark ? 'var(--forest)' : '#fff', textDecoration: 'none', transition: 'all 0.25s', boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.15)' : 'var(--sh-sm)' }}>
                        Get Started <IcArrow/>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Guarantee */}
          <div className="guarantee-banner" style={{ marginTop: 60, padding: '32px 40px', background: '#fff', border: '1.5px solid var(--border-gold)', borderRadius: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--sh-sm)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(3,65,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}><IcShield/></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 5, color: 'var(--forest)' }}>100% Satisfaction Guarantee</h3>
              <p style={{ color: 'var(--sage)', fontSize: '0.88rem', lineHeight: 1.7 }}>Not happy with your visit? We'll send a replacement gardener free of charge within 24 hours. No questions asked.</p>
            </div>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#dcfce7', color: '#16a34a', borderRadius: 14, fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <IcWA/> Chat with Us
            </a>
          </div>

          {/* Comparison table */}
          {subPlans.length >= 2 && (
            <div style={{ marginTop: 72 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2.2rem)', textAlign: 'center', marginBottom: 40, color: 'var(--forest)' }}>Feature Comparison</h2>
              <div style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-sm)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr style={{ background: 'var(--forest)' }}>
                      <th style={{ padding: '18px 24px', textAlign: 'left', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feature</th>
                      {subPlans.slice(0, 3).map((p: any) => (
                        <th key={p.id || p.name} style={{ padding: '18px 20px', textAlign: 'center', color: 'var(--gold)', fontSize: '1rem', fontWeight: 900 }}>{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_FEATURES.map((f, i) => (
                      <tr key={f.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-elevated)' : '#fff' }}>
                        <td style={{ padding: '14px 24px', fontSize: '0.88rem', color: 'var(--forest)', fontWeight: 700 }}>{f.label}</td>
                        {[f.basic, f.standard, f.premium].slice(0, subPlans.length).map((v, j) => (
                          <td key={j} style={{ padding: '14px 20px', textAlign: 'center' }}><CheckCell val={v}/></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop: 72 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem,3vw,2rem)', textAlign: 'center', marginBottom: 40, color: 'var(--forest)' }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item-animate" style={{ background: '#fff', borderRadius: 18, border: `1.5px solid ${openFaq === i ? 'var(--border-mid)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left', background: openFaq === i ? 'rgba(3,65,26,0.02)' : 'transparent' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--forest)', flex: 1, paddingRight: 16 }}>{faq.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" style={{ flexShrink: 0, transition: 'transform 0.25s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {openFaq === i && <div style={{ padding: '0 24px 20px', fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--text-2)', borderTop: '1px solid var(--border)' }}>{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 80, padding: 'clamp(48px,8vw,72px) clamp(24px,6vw,56px)', background: 'var(--forest)', borderRadius: 40, textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'var(--sh-xl)' }}>
            <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,3rem)', color: '#fff', marginBottom: 14, letterSpacing: '-0.03em' }}>Start with a risk-free trial visit</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 40px', fontSize: '1rem', lineHeight: 1.8 }}>Subscribe when you're convinced your garden loves it.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/book?type=on-demand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', background: '#fff', color: 'var(--forest)', borderRadius: 16, fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none' }}>Book a Trial Visit <IcArrow/></Link>
                <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>My Account <IcArrow/></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      <style jsx global>{`
        @media(max-width:768px){
          [style*="repeat(3, 1fr)"]{grid-template-columns:1fr!important}
          .plan-card-3d{min-width:unset!important}
        }
        .skeleton{background:linear-gradient(90deg,var(--bg-elevated) 25%,var(--cream-dark) 50%,var(--bg-elevated) 75%);background-size:200% 100%;animation:shimmer 1.5s ease infinite;border-radius:10px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </>
  );
}
