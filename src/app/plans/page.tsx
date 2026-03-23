'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlans } from '@/lib/api';

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

function CheckIcon({ checked, value }: { checked: boolean | string; value?: string }) {
  if (typeof checked === 'string') return <span style={{ fontWeight:700, color:'var(--forest)', fontSize:'0.9rem' }}>{checked}</span>;
  return checked
    ? <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(11,61,46,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>
    : <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--bg)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>;
}

const FAQS = [
  { q: 'Can I change or cancel my plan anytime?', a: 'Yes. You can pause or cancel your subscription at any time with no questions asked. There are no lock-in periods or cancellation fees.' },
  { q: 'Are your gardeners background-verified?', a: 'Absolutely. Every gardener goes through a thorough background check, skill assessment, and training program before being assigned to customers.' },
  { q: 'What if I\'m not satisfied with the visit?', a: 'We offer a 100% satisfaction guarantee. If you\'re not happy, we\'ll send a replacement gardener free of charge within 24 hours.' },
  { q: 'How does the live tracking work?', a: 'Once your gardener starts their journey, you\'ll get a live map link showing their real-time location. You\'ll also receive SMS/WhatsApp updates at every milestone.' },
  { q: 'Can I request the same gardener every visit?', a: 'Yes, on our Premium plan you get a dedicated gardener who learns your garden over time. Standard and Basic plans try to maintain consistency but cannot guarantee the same gardener.' },
];

export default function PlansPage() {
  const [billing, setBilling] = useState<'monthly' | 'one-time'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: plansRaw, isLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const plans: any[] = (plansRaw as any[]) ?? [];
  const subPlans = plans.filter((p: any) => p.plan_type === 'subscription');
  const otPlans  = plans.filter((p: any) => p.plan_type !== 'subscription');
  const shown    = billing === 'monthly' ? subPlans : otPlans;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        {/* Hero */}
        <div style={{ background:'linear-gradient(150deg, var(--forest), var(--forest-mid))', padding:'72px 0 100px', position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'-20%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="container" style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:99, padding:'7px 18px', marginBottom:20 }}>
              <span style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.12em', color:'var(--gold-light)', textTransform:'uppercase' }}>Simple Pricing</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.8rem)', fontWeight:900, color:'#fff', marginBottom:14, letterSpacing:'-0.02em' }}>
              Invest in your <em style={{ color:'var(--gold-light)' }}>garden's</em> future
            </h1>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'1.05rem', maxWidth:480, margin:'0 auto 36px' }}>
              Transparent pricing. No hidden fees. Cancel anytime.
            </p>
            {/* Toggle */}
            <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.08)', borderRadius:99, padding:5, gap:4 }}>
              {(['monthly','one-time'] as const).map(t => (
                <button key={t} onClick={() => setBilling(t)}
                  style={{ padding:'10px 24px', borderRadius:99, border:'none', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer', transition:'all 0.25s', background: billing === t ? '#fff' : 'transparent', color: billing === t ? 'var(--forest)' : 'rgba(255,255,255,0.7)', boxShadow: billing === t ? 'var(--sh-sm)' : 'none' }}>
                  {t === 'monthly' ? 'Subscription' : 'One-Time'}
                  {t === 'monthly' && <span style={{ marginLeft:8, fontSize:'0.7rem', background:'var(--gold)', color:'var(--forest)', padding:'2px 8px', borderRadius:99, fontWeight:700 }}>Save 30%</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-56, paddingBottom:80 }}>
          {/* Plans grid */}
          {isLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:480, borderRadius:28 }} />)}
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'#fff', borderRadius:28, border:'1.5px dashed var(--border)' }}>
              <div style={{ fontSize:"3rem", marginBottom:14 }}></div>
              <h3 style={{ fontWeight:700, marginBottom:8 }}>No {billing} plans available</h3>
              <p style={{ color:'var(--text-muted)' }}>Contact us to set up a custom plan</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(shown.length, 3)},1fr)`, gap:24, alignItems:'start' }}>
              {shown.map((plan: any, idx: number) => {
                const isPopular = idx === 1 && shown.length >= 3;
                return (
                  <div key={plan.id}
                    style={{ borderRadius:28, padding:'36px 30px', position:'relative', border:`1.5px solid ${isPopular ? 'var(--forest)' : 'var(--border)'}`, background: isPopular ? 'var(--forest)' : '#fff', transform: isPopular ? 'scale(1.03)' : 'none', boxShadow: isPopular ? 'var(--sh-xl)' : 'var(--sh-xs)', transition:'all 0.3s var(--ease)', animation:`fade-up 0.6s var(--ease) ${idx*120}ms both` }}
                    onMouseEnter={e => { if (!isPopular) (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; (e.currentTarget as any).style.transform = isPopular ? 'scale(1.04) translateY(-4px)' : 'translateY(-4px)'; }}
                    onMouseLeave={e => { (e.currentTarget as any).style.boxShadow = isPopular ? 'var(--sh-xl)' : 'var(--sh-xs)'; (e.currentTarget as any).style.transform = isPopular ? 'scale(1.03)' : 'none'; }}>
                    {isPopular && (
                      <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,var(--gold),var(--gold-light))', color:'var(--forest)', padding:'6px 24px', borderRadius:99, fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(201,168,76,0.4)' }}>
                        ✨ Most Popular
                      </div>
                    )}
                    <div style={{ marginBottom:24 }}>
                      <span style={{ display:'inline-flex', padding:'4px 12px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', background: isPopular ? 'rgba(255,255,255,0.12)' : 'rgba(11,61,46,0.08)', color: isPopular ? 'rgba(255,255,255,0.8)' : 'var(--forest)' }}>
                        {plan.plan_type === 'subscription' ? 'Subscription' : 'One-Time'}
                      </span>
                      <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', color: isPopular ? '#fff' : 'var(--text)', margin:'14px 0 8px', letterSpacing:'-0.01em' }}>{plan.name}</h2>
                      {plan.description && <p style={{ fontSize:'0.85rem', color: isPopular ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', lineHeight:1.7 }}>{plan.description}</p>}
                    </div>

                    <div style={{ marginBottom:28 }}>
                      <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                        <span style={{ fontFamily:'var(--font-display)', fontSize:'3.2rem', fontWeight:900, lineHeight:1, color: isPopular ? 'var(--gold-light)' : 'var(--forest)' }}>
                          ₹{plan.price?.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize:'0.9rem', color: isPopular ? 'rgba(255,255,255,0.45)' : 'var(--text-muted)' }}>
                          /{plan.plan_type === 'subscription' ? 'month' : 'visit'}
                        </span>
                      </div>
                      {plan.plan_type === 'subscription' && (
                        <div style={{ fontSize:'0.78rem', color: isPopular ? 'rgba(255,255,255,0.4)' : 'var(--text-faint)', marginTop:4 }}>Billed monthly · Cancel anytime</div>
                      )}
                    </div>

                    <div style={{ marginBottom:32, display:'flex', flexDirection:'column', gap:11 }}>
                      {[
                        plan.visits_per_month && `${plan.visits_per_month} expert visits/month`,
                        plan.max_plants && `Up to ${plan.max_plants} plants`,
                        'Certified background-verified gardener',
                        'Live GPS tracking',
                        'Before & after photo proof',
                        'WhatsApp booking updates',
                      ].filter(Boolean).map((feat: any, i: number) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:20, height:20, borderRadius:'50%', background: isPopular ? 'rgba(255,255,255,0.15)' : 'rgba(11,61,46,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={isPopular ? '#fff' : 'var(--forest)'} strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span style={{ fontSize:'0.875rem', color: isPopular ? 'rgba(255,255,255,0.82)' : 'var(--text-2)' }}>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={`/book?plan=${plan.id}`}
                      className={`btn w-full ${isPopular ? 'btn-primary' : 'btn-forest'}`}
                      style={{ justifyContent:'center', padding:'14px' }}>
                      Get Started →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Guarantee banner */}
          <div style={{ marginTop:60, background:'linear-gradient(135deg, var(--gold-pale), #fffbef)', borderRadius:24, padding:'32px 40px', display:'flex', gap:20, alignItems:'center', border:'1px solid rgba(201,168,76,0.2)', flexWrap:'wrap' }}>
            <div style={{ fontSize:'3rem', flexShrink:0 }}>🛡️</div>
            <div>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem', marginBottom:6 }}>100% Satisfaction Guarantee</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.65 }}>Not happy with your visit? We'll send a replacement gardener free of charge within 24 hours. No questions asked.</p>
            </div>
          </div>

          {/* Comparison table */}
          {billing === 'monthly' && shown.length >= 2 && (
            <div style={{ marginTop:60 }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.8rem', textAlign:'center', marginBottom:36 }}>Full Feature Comparison</h2>
              <div style={{ background:'#fff', borderRadius:24, overflow:'hidden', border:'1px solid var(--border)', boxShadow:'var(--sh-sm)' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--forest)' }}>
                      <th style={{ padding:'18px 24px', textAlign:'left', color:'rgba(255,255,255,0.6)', fontSize:'0.8rem', fontWeight:600 }}>Feature</th>
                      {shown.slice(0,3).map((p: any) => (
                        <th key={p.id} style={{ padding:'18px 16px', textAlign:'center', color:'#fff', fontSize:'0.9rem', fontWeight:800 }}>{p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_FEATURES.map((f, i) => (
                      <tr key={f.label} style={{ background: i % 2 === 0 ? '#fff' : 'var(--bg)' }}>
                        <td style={{ padding:'14px 24px', fontSize:'0.875rem', color:'var(--text-2)', fontWeight:500 }}>{f.label}</td>
                        {[f.basic, f.standard, f.premium].slice(0, shown.length).map((v, j) => (
                          <td key={j} style={{ padding:'14px 16px', textAlign:'center' }}>
                            <CheckIcon checked={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop:60 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.8rem', textAlign:'center', marginBottom:36 }}>Frequently Asked Questions</h2>
            <div style={{ maxWidth:720, margin:'0 auto', display:'flex', flexDirection:'column', gap:10 }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:18, border:'1px solid var(--border)', overflow:'hidden', transition:'all 0.25s' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width:'100%', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'left' }}>
                    <span style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text)', flex:1 }}>{faq.q}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" style={{ flexShrink:0, marginLeft:12, transition:'transform 0.25s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding:'0 24px 20px', color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.75, animation:'fade-up 0.2s ease' }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop:60, textAlign:'center', background:'linear-gradient(135deg, var(--forest), var(--forest-mid))', borderRadius:28, padding:'56px 32px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'clamp(1.6rem,4vw,2.4rem)', color:'#fff', marginBottom:14, letterSpacing:'-0.02em', position:'relative' }}>Start with a one-time visit first</h2>
            <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:32, position:'relative', fontSize:'1rem' }}>Try our service risk-free. Subscribe when you're convinced your garden loves it.</p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
              <Link href="/book" className="btn btn-primary btn-lg">Book a Trial Visit</Link>
              <Link href="/dashboard" className="btn btn-ghost-white btn-lg">My Account →</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@media(max-width:768px){div[style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:1fr !important;} div[style*="scale(1.03)"]{transform:none !important;}}`}</style>
    </>
  );
}
