'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlans } from '@/lib/api';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcX = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--err)" strokeWidth="3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcShield = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

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
    ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><IcCheck/></div>
    : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}><IcX/></div>;
}

function PlanCarousel({ items }: { items: any[] }) {
  // Use 7 copies for perfect endless loop
  const copies = 7;
  const multiItems = Array(copies).fill(items).flat();
  
  const [activeIdx, setActiveIdx] = useState(items.length * Math.floor(copies / 2));
  const [isJumping, setIsJumping] = useState(false);
  
  const cardWidth = 360;
  const gap = 32;
  const step = cardWidth + gap;
  
  const handlePrev = () => setActiveIdx(prev => prev - 1);
  const handleNext = () => setActiveIdx(prev => prev + 1);

  useEffect(() => {
    const minIdx = items.length;
    const maxIdx = items.length * (copies - 1) - 1;
    if (activeIdx > maxIdx) {
      setIsJumping(true);
      setActiveIdx(items.length * Math.floor(copies / 2));
      setTimeout(() => setIsJumping(false), 50);
    } else if (activeIdx < minIdx) {
      setIsJumping(true);
      setActiveIdx(items.length * (Math.floor(copies / 2) + 1));
      setTimeout(() => setIsJumping(false), 50);
    }
  }, [activeIdx, items.length]);

  return (
    <section style={{ overflow: 'hidden', padding: '100px 0', position: 'relative', background: 'var(--bg)' }}>
      {/* Background radial glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100vw', height: '800px', background: 'radial-gradient(circle at center, rgba(3,65,26,0.02) 0%, transparent 60%)', pointerEvents: 'none' }} />

      {/* Nav Controls */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', zIndex: 100, pointerEvents: 'none' }}>
        <button onClick={handlePrev} className="p-nav-btn" style={{ pointerEvents: 'auto', transform: 'translateX(-10px) rotate(180deg)' }}><IcArrow /></button>
        <button onClick={handleNext} className="p-nav-btn" style={{ pointerEvents: 'auto', transform: 'translateX(10px)' }}><IcArrow /></button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 620, alignItems: 'center' }}>
        <motion.div
          animate={{ x: -(activeIdx * step) }}
          transition={isJumping ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 30, mass: 1 }}
          style={{ display: 'flex', gap: gap, alignItems: 'center', position: 'absolute', left: `calc(50% - ${cardWidth/2}px)` }}
        >
          {multiItems.map((plan, i) => {
            const isCenter = i === activeIdx;
            const isDark = plan.name?.toLowerCase().includes('standard');
            
            return (
              <motion.div
                key={`${plan.id}-${i}`}
                initial={false}
                animate={{ 
                  scale: isCenter ? 1.08 : 0.85,
                  opacity: isCenter ? 1 : 0.45,
                  y: isCenter ? 0 : 25,
                  rotateY: isCenter ? 0 : (i < activeIdx ? 12 : -12),
                  z: isCenter ? 80 : 0
                }}
                transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                style={{ width: cardWidth, flexShrink: 0, cursor: 'pointer' }}
                onClick={() => setActiveIdx(i)}
              >
                <div className={`p-card ${isDark ? 'dark' : ''}`} style={{ 
                  background: isDark ? 'var(--forest)' : '#fff',
                  borderRadius: 40,
                  border: isCenter ? '2.5px solid var(--gold)' : '1px solid var(--border)',
                  padding: '52px 40px',
                  height: 620,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isCenter ? '0 60px 120px rgba(3,65,26,0.3), 0 0 45px rgba(201,168,76,0.2)' : 'var(--sh-sm)',
                  transition: 'border 0.4s var(--ease)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {isCenter && (
                     <div style={{ position: 'absolute', top: 16, right: 32, background: 'var(--gold)', color: 'var(--forest)', padding: '7px 20px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 20 }}>
                        FEATURED PLAN
                     </div>
                  )}

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.6)' : 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14 }}>{plan.plan_type}</div>
                  <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: isDark ? '#fff' : 'var(--forest)', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.05 }}>{plan.name}</h3>
                  <p style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-2)', fontSize: '1rem', marginBottom: 40, lineHeight: 1.7, flexShrink: 0 }}>{plan.description || 'Premium botanical luxury for your flourishing space.'}</p>

                  <div style={{ marginBottom: 44 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '3.4rem', fontWeight: 900, color: isDark ? 'var(--gold)' : 'var(--forest)', fontFamily: 'var(--font-display)', lineHeight: 0.9 }}>₹{plan.price}</span>
                      <span style={{ fontSize: '1.25rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--sage)', fontWeight: 700 }}>/mo</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: 44 }}>
                    {(Array.isArray(plan.features) ? plan.features : []).slice(0, 5).map((f: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.92rem', color: isDark ? 'rgba(255,255,255,0.8)' : 'var(--forest)', fontWeight: 700 }}>
                        <span style={{ color: isDark ? 'var(--gold)' : 'var(--forest)', opacity: 0.75 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg></span>
                        {f}
                      </div>
                    ))}
                  </div>

                  <Link href={`/book?plan=${plan.id}`} className={`btn ${isDark ? 'btn-primary' : 'btn-forest'}`} style={{ width: '100%', justifyContent: 'center', padding: '20px', fontSize: '1rem', fontWeight: 900, borderRadius: 24, marginTop: 'auto' }}>
                    Choose Selection
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style jsx>{`
        .p-nav-btn { width: 64px; height: 64px; border-radius: 50%; border: 1px solid var(--border-strong); background: #fff; color: var(--forest); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--sh-lg); transition: all 0.3s; }
        .p-nav-btn:hover { background: var(--forest); color: #fff; transform: scale(1.1); }
        .p-card { transform-style: preserve-3d; }
      `}</style>
    </section>
  );
}

export default function PlansPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: plansRaw, isLoading } = useQuery({ queryKey:['plans'], queryFn:getPlans });
  const plans: any[] = (plansRaw as any[]) ?? [];
  const subPlans = plans.filter((p:any) => p.plan_type === 'subscription');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = canvas.parentElement?.offsetHeight || 600; };
    resize(); window.addEventListener('resize', resize);
    const W = canvas.width, H = canvas.height;
    const pts = Array.from({length:30}, () => ({ x:Math.random()*W, y:Math.random()*H, r:60+Math.random()*120, o:0.02+Math.random()*0.05 }));
    let t = 0;
    const draw = () => {
      t += 0.008; ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y + Math.sin(t + p.x/100)*30, p.r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(3,65,26,${p.o})`; ctx.lineWidth = 1.5; ctx.stroke();
      });
      requestAnimationFrame(draw);
    };
    draw();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <SmoothScrollProvider>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        
        {/* HERO SECTION */}
        <div style={{ position:'relative', padding:'100px 0 160px', overflow:'hidden', textAlign:'center', background:'linear-gradient(to bottom, rgba(3,65,26,0.05), transparent)' }}>
          <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
          <div className="container" style={{ position:'relative', zIndex:5 }}>
             <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(201,168,76,0.15)', border:'1.5px solid var(--gold)', borderRadius:99, padding:'10px 24px', marginBottom:32 }}>
                <span className="pulse-dot" />
                <span style={{ fontSize:'0.75rem', fontWeight:800, color:'var(--earth)', textTransform:'uppercase', letterSpacing:'0.25em' }}>Elevated Botanical Living</span>
             </div>
             <h1 className="display-1" style={{ color:'var(--forest)', marginBottom:24, letterSpacing:'-0.03em' }}>
               Invest in your <span style={{ fontStyle:'normal', color:'var(--earth)' }}>garden’s</span> future
             </h1>
             <p style={{ fontSize:'1.2rem', color:'var(--sage)', maxWidth:520, margin:'0 auto', lineHeight:1.8, fontWeight:500 }}>
               Transparent pricing. Certified experts. No lock-in periods.<br/>Just flourish and bloom.
             </p>
          </div>
        </div>

        <div className="container" style={{ marginTop:-120, paddingBottom:120 }}>
          {isLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:32 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:560, borderRadius:40 }} />)}
            </div>
          ) : plans.length === 0 ? (
             <div style={{ textAlign:'center', padding:100, background:'#fff', borderRadius:40, border:'2px dashed var(--border-gold)' }}>
               <h3 style={{ color:'var(--forest)', fontSize:'1.5rem', fontWeight:900 }}>Crafting premium plans...</h3>
               <p style={{ color:'var(--sage)', marginTop:12 }}>Contact our concierge for bespoke garden care.</p>
             </div>
          ) : (
             <PlanCarousel items={plans} />
          )}

          {/* Guarantee Banner */}
          <div className="guarantee-premium" style={{ marginTop: 80, padding: '48px 56px', background: '#fff', border: '2px solid var(--gold)', borderRadius: 40, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', boxShadow: 'var(--sh-lg)', position:'relative', overflow:'hidden' }}>
            <div className="guarantee-icon" style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0, border:'1.5px solid var(--border-gold)' }}><IcShield/></div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 8, color: 'var(--forest)' }}>100% Satisfaction Guarantee</h3>
              <p style={{ color: 'var(--sage)', fontSize: '1rem', lineHeight: 1.8, fontWeight:500 }}>Not completely wowed by your visit? We’ll send a replacement expert free of charge within 24 hours. Your garden’s happiness is our priority.</p>
            </div>
            <a href="https://wa.me/919876543210" className="btn btn-primary" style={{ padding:'18px 36px', borderRadius:18, fontWeight:900 }}>Discuss with Concierge</a>
          </div>

          {/* Comparison table */}
          {subPlans.length >= 2 && (
            <div style={{ marginTop: 100 }}>
              <div style={{ textAlign:'center', marginBottom:52 }}>
                <span className="overline">Feature Breakdown</span>
                <h2 className="display-2" style={{ color: 'var(--forest)', marginTop: 8 }}>Compare Exclusive Benefits</h2>
              </div>
              <div style={{ borderRadius: 32, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: 'var(--sh-md)', background:'#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ background: 'var(--forest)' }}>
                      <th style={{ padding: '24px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Luxury Feature</th>
                      {subPlans.slice(0, 3).map((p: any) => (
                        <th key={p.id || p.name} style={{ padding: '24px', textAlign: 'center', color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}>{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_FEATURES.map((f, i) => (
                      <tr key={f.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'rgba(3,65,26,0.01)' : '#fff' }}>
                        <td style={{ padding: '20px 24px', fontSize: '0.95rem', color: 'var(--forest)', fontWeight: 700 }}>{f.label}</td>
                        {[f.basic, f.standard, f.premium].slice(0, subPlans.length).map((v, j) => (
                          <td key={j} style={{ padding: '20px', textAlign: 'center' }}><CheckCell val={v}/></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop: 120 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', textAlign: 'center', marginBottom: 52, color: 'var(--forest)' }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth: 800, margin: '0 auto', display:'flex', flexDirection:'column', gap:16 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:24, border:`1.5px solid ${openFaq===i?'var(--forest)':'var(--border)'}`, overflow:'hidden', transition:'all 0.3s var(--ease)' }}>
                  <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width:'100%', padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', background:'none', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--forest)' }}>{faq.q}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" style={{ transform:openFaq===i?'rotate(180deg)':'none', transition:'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <AnimatePresence>
                    {openFaq===i && (
                      <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.3 }}>
                        <div style={{ padding:'0 32px 32px', color:'var(--sage)', lineHeight:1.8, fontSize:'1.05rem', fontWeight:500 }}>{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx global>{`
        .pulse-dot { width:10px; height:10px; border-radius:50%; background:var(--gold); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform:scale(1); opacity:1; } 50% { transform:scale(1.5); opacity:0.5; } 100% { transform:scale(1); opacity:1; } }
        .skeleton { background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--border-gold) 50%, var(--bg-elevated) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </SmoothScrollProvider>
  );
}
