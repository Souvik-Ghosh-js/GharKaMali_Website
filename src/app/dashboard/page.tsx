'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getProfile, getMyBookings, getMySubscriptions } from '@/lib/api';

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const IcCal   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcLeaf  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcShop  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcWall  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcBrain = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14zm5 0A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></svg>;
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcPlus  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcStar  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

const STATUS_STYLES: Record<string,[string,string]> = {
  pending:     ['#FEF3C7','#92400E'], assigned:    ['#DBEAFE','#1E40AF'],
  en_route:    ['#E0F2FE','#0369A1'], arrived:     ['#DCFCE7','#166534'],
  in_progress: ['#FEF9C3','#854D0E'], completed:   ['#DCFCE7','#14532D'],
  cancelled:   ['#F3F4F6','#374151'], failed:      ['#FEE2E2','#991B1B'],
};
function StatusPill({ s }: { s: string }) {
  const [bg, color] = STATUS_STYLES[s] ?? ['#F3F4F6','#374151'];
  return <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color }}>{s.replace(/_/g,' ')}</span>;
}

const QUICK_ACTIONS = [
  { href:'/book',       label:'Book Visit',      Icon:IcCal,   bg:'var(--forest)', color:'#fff' },
  { href:'/plantopedia',label:'Identify Plant',  Icon:IcBrain, bg:'var(--cream)',  color:'var(--forest)' },
  { href:'/shop',       label:'Shop',            Icon:IcShop,  bg:'var(--gold-pale)',color:'var(--earth)' },
  { href:'/wallet',     label:'Wallet',          Icon:IcWall,  bg:'var(--cream)',  color:'var(--forest)' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); }, [isAuthenticated, isLoading, router]);

  const { data: profile } = useQuery({ queryKey:['profile'], queryFn:getProfile, enabled:isAuthenticated });
  const { data: bRaw, isLoading:bLoad } = useQuery({ queryKey:['bookings-dash'], queryFn:()=>getMyBookings({limit:6}), enabled:isAuthenticated });
  const { data: sRaw } = useQuery({ queryKey:['subs-dash'], queryFn:getMySubscriptions, enabled:isAuthenticated });

  const pr: any = profile;
  const bookings: any[] = Array.isArray(bRaw) ? bRaw : ((bRaw as any)?.items ?? []);
  const subs: any[]     = Array.isArray(sRaw)  ? sRaw  : [];
  const activeSub = subs.find((s:any) => s.status === 'active');
  const balance = pr?.wallet_balance ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'calc(100svh - var(--nav-h))', background:'var(--bg)', paddingTop:'var(--nav-h)' }}>

        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)', padding:'clamp(40px,6vw,60px) 0 clamp(72px,10vw,96px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'-25%', right:'-8%', width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
              <div>
                <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', marginBottom:6, fontWeight:500 }}>{greeting},</p>
                <h1 style={{ fontFamily:'var(--font-display)', color:'#fff', fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:900, letterSpacing:'-0.02em', marginBottom:20 }}>
                  {user?.name ?? 'Welcome back'}
                </h1>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[
                    { label:'Wallet Balance', value:`₹${balance.toLocaleString('en-IN')}`, hi:true },
                    { label:'Active Plans',   value:subs.filter((s:any)=>s.status==='active').length },
                    { label:'Total Bookings', value:bookings.length },
                  ].map(stat => (
                    <div key={stat.label} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:14, padding:'12px 18px' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.25rem', color:stat.hi?'var(--gold-light)':'rgba(255,255,255,0.85)', lineHeight:1 }}>{stat.value}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', marginTop:4, fontWeight:500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/book" className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
                <IcPlus /> Book New Visit
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:72 }}>

          {/* Quick actions */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24, position:'relative', zIndex:1, overflow:'visible' }} className="quick-grid">
            {QUICK_ACTIONS.map(({ href, label, Icon, bg, color }) => (
              <Link key={href} href={href}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'clamp(16px,3vw,24px) 12px', background:'#fff', borderRadius:20, border:'1px solid var(--border)', textDecoration:'none', transition:'all 0.3s var(--ease)', position:'relative', zIndex:0 }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform='translateY(-4px)'; (e.currentTarget as any).style.boxShadow='var(--sh-md)'; (e.currentTarget as any).style.zIndex='2'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform='none'; (e.currentTarget as any).style.boxShadow='none'; (e.currentTarget as any).style.zIndex='0'; }}>
                <div style={{ width:52, height:52, borderRadius:16, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                  <Icon />
                </div>
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-2)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
              </Link>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }} className="dash-grid">

            {/* Bookings */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.2rem', margin:0 }}>Recent Bookings</h2>
                <Link href="/bookings" style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.83rem', color:'var(--forest)', fontWeight:600, textDecoration:'none' }}>
                  View all <IcArrow />
                </Link>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {bLoad ? Array(4).fill(null).map((_,i) => (
                  <div key={i} style={{ background:'#fff', borderRadius:18, padding:18, border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', gap:12 }}>
                      <div className="skeleton" style={{ width:48,height:48,borderRadius:14,flexShrink:0 }} />
                      <div style={{ flex:1 }}><div className="skeleton skel-h" style={{ width:'40%',marginBottom:10 }} /><div className="skeleton skel-h" style={{ width:'68%' }} /></div>
                      <div><div className="skeleton skel-h" style={{ width:56,marginBottom:8 }} /><div className="skeleton skel-h" style={{ width:44 }} /></div>
                    </div>
                  </div>
                )) : bookings.length === 0 ? (
                  <div style={{ background:'#fff', borderRadius:24, padding:'clamp(40px,6vw,64px) 24px', textAlign:'center', border:'2px dashed var(--border)' }}>
                    <div style={{ width:64, height:64, borderRadius:18, background:'rgba(11,61,46,0.07)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'var(--forest)' }}><IcCal /></div>
                    <h3 style={{ fontWeight:700, marginBottom:8, fontFamily:'var(--font-display)' }}>No bookings yet</h3>
                    <p style={{ color:'var(--text-muted)', marginBottom:20, fontSize:'0.9rem' }}>Book your first expert gardener visit today</p>
                    <Link href="/book" className="btn btn-forest">Book Now</Link>
                  </div>
                ) : bookings.map((b:any, i:number) => (
                  <Link key={b.id} href={`/bookings/${b.id}`}
                    style={{ background:'#fff', borderRadius:20, padding:'16px 18px', border:'1px solid var(--border)', textDecoration:'none', display:'flex', alignItems:'center', gap:14, transition:'all 0.25s var(--ease)', animation:`fade-up 0.5s var(--ease) ${i*40}ms both` }}
                    onMouseEnter={e => { (e.currentTarget as any).style.boxShadow='var(--sh)'; (e.currentTarget as any).style.transform='translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as any).style.boxShadow='none'; (e.currentTarget as any).style.transform='none'; }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:'rgba(11,61,46,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--forest)' }}>
                      <IcLeaf />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                        <span style={{ fontWeight:700, fontSize:'0.85rem', fontFamily:'monospace', letterSpacing:'0.04em' }}>{b.booking_number}</span>
                        <StatusPill s={b.status} />
                      </div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.service_address}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--forest)', fontSize:'1rem' }}>₹{b.total_amount?.toLocaleString('en-IN') ?? '—'}</div>
                      <div style={{ fontSize:'0.73rem', color:'var(--text-faint)', marginTop:3 }}>
                        {b.scheduled_date && new Date(b.scheduled_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                      </div>
                    </div>
                    <span style={{ color:'var(--text-faint)', display:'flex', flexShrink:0 }}><IcArrow /></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Active subscription */}
              {activeSub ? (
                <div style={{ background:'var(--forest)', borderRadius:24, padding:'clamp(20px,4vw,26px)', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-24, right:-24, width:120, height:120, borderRadius:'50%', background:'rgba(201,168,76,0.09)' }} />
                  <p style={{ fontSize:'0.7rem', fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Active Plan</p>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'#fff', fontSize:'1.1rem', marginBottom:6 }}>{activeSub.plan?.name}</h3>
                  <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', marginBottom:20 }}>{activeSub.plan?.visits_per_month} visits/mo · {activeSub.plant_count} plants</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1.7rem', fontWeight:900, color:'var(--gold-light)' }}>₹{activeSub.plan?.price?.toLocaleString('en-IN')}<span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.35)', fontWeight:400 }}>/mo</span></span>
                    <Link href="/subscriptions" style={{ background:'rgba(255,255,255,0.10)', color:'#fff', padding:'8px 16px', borderRadius:99, fontSize:'0.8rem', fontWeight:600, textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)' }}>Manage</Link>
                  </div>
                </div>
              ) : (
                <div style={{ background:'linear-gradient(135deg,var(--gold-pale),#fffbef)', borderRadius:24, padding:'clamp(18px,4vw,24px)', border:'1.5px solid rgba(201,168,76,0.25)', textAlign:'center' }}>
                  <div style={{ width:52, height:52, borderRadius:16, background:'rgba(201,168,76,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', color:'var(--earth)' }}><IcLeaf /></div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:8, fontSize:'1rem' }}>Start a Subscription</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', lineHeight:1.65, marginBottom:16 }}>Save up to 30% with monthly garden care plans</p>
                  <Link href="/plans" className="btn btn-forest btn-sm" style={{ width:'100%', justifyContent:'center' }}>View Plans</Link>
                </div>
              )}

              {/* AI feature promo */}
              <Link href="/plantopedia" style={{ textDecoration:'none', background:'var(--forest)', borderRadius:22, padding:'20px 22px', display:'flex', gap:14, alignItems:'center', transition:'all 0.25s var(--ease)' }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform='translateY(-2px)'; (e.currentTarget as any).style.boxShadow='var(--sh-md)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform='none'; (e.currentTarget as any).style.boxShadow='none'; }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--gold-light)' }}><IcBrain /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', color:'#fff', marginBottom:3 }}>AI Plant Identifier</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.55)' }}>Upload photo · instant results</div>
                </div>
                <span style={{ color:'rgba(255,255,255,0.35)', display:'flex' }}><IcArrow /></span>
              </Link>

              {/* Shop promo */}
              <Link href="/shop" style={{ textDecoration:'none', background:'#fff', borderRadius:22, padding:'20px 22px', display:'flex', gap:14, alignItems:'center', border:'1px solid var(--border)', transition:'all 0.25s var(--ease)' }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform='translateY(-2px)'; (e.currentTarget as any).style.boxShadow='var(--sh)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform='none'; (e.currentTarget as any).style.boxShadow='none'; }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'var(--gold-pale)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--earth)' }}><IcShop /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--text)', marginBottom:3 }}>Garden Shop</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Plants, tools & accessories</div>
                </div>
                <span style={{ color:'var(--text-faint)', display:'flex' }}><IcArrow /></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`
        @media(max-width:900px) { .dash-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:640px) { .quick-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media(max-width:360px) { .quick-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </>
  );
}
