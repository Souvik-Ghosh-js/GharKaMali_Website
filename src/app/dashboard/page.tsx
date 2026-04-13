'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getProfile, getMyBookings, getMySubscriptions, getMyOrders } from '@/lib/api';

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const IcCal   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcLeaf  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcShop  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcWall  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcBrain = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14zm5 0A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></svg>;
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcPlus  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const STATUS_STYLES: Record<string,[string,string]> = {
  pending:     ['var(--bg-elevated)', 'var(--gold-deep)'],
  assigned:    ['#DBEAFE', '#2563EB'],
  en_route:    ['#E0F2FE', '#0284C7'],
  arrived:     ['#DCFCE7', '#16A34A'],
  in_progress: ['#FEF9C3', '#CA8A04'],
  completed:   ['#DCFCE7', '#16A34A'],
  cancelled:   ['#F3F4F6', '#4B5563'],
  failed:      ['#FEE2E2', '#DC2626'],
  processing:  ['#FEF9C3', '#CA8A04'],
  delivered:   ['#DCFCE7', '#16A34A'],
};
function StatusPill({ s }: { s: string }) {
  const [bg, color] = STATUS_STYLES[s] ?? ['#F3F4F6', '#4B5563'];
  return <span style={{ padding:'4px 12px', borderRadius:99, fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color, border: `1px solid ${color}40`, whiteSpace: 'nowrap', display: 'inline-block' }}>{s.replace(/_/g,' ')}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login'); }, [isAuthenticated, isLoading, router]);

  const { data: profile } = useQuery({ queryKey:['profile'], queryFn:getProfile, enabled:isAuthenticated });
  const { data: bRaw, isLoading:bLoad } = useQuery({ queryKey:['bookings-dash'], queryFn:()=>getMyBookings({limit:6}), enabled:isAuthenticated });
  const { data: sRaw } = useQuery({ queryKey:['subs-dash'], queryFn:getMySubscriptions, enabled:isAuthenticated });
  const { data: oRaw, isLoading:oLoad } = useQuery({ queryKey:['orders-dash'], queryFn:getMyOrders, enabled:isAuthenticated });

  const pr: any = profile;
  const bookings: any[] = Array.isArray(bRaw) ? bRaw : ((bRaw as any)?.bookings ?? (bRaw as any)?.items ?? []);
  const totalBookings: number = (bRaw as any)?.total ?? bookings.length;
  const subs: any[]     = Array.isArray(sRaw) ? sRaw : ((sRaw as any)?.subscriptions ?? (sRaw as any)?.items ?? []);
  const orders: any[]    = Array.isArray(oRaw) ? oRaw : [];
  const activeSub = subs.find((s:any) => s.status === 'active');
  const balance = Number(pr?.wallet_balance ?? 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'calc(100svh - var(--nav-h))', background:'var(--bg)', paddingTop:'var(--nav-h)', position: 'relative' }}>
        <div className="hero-bg-grid" style={{ opacity: 0.15 }} />

        {/* Hero */}
        <div style={{ padding:'clamp(40px,6vw,60px) 0 clamp(72px,10vw,96px)', position:'relative', zIndex: 10 }}>
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
              <div>
                <p style={{ fontSize:'0.82rem', color:'var(--sage)', marginBottom:6, fontWeight:700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{greeting},</p>
                <h1 style={{ fontFamily:'var(--font-display)', color:'var(--forest)', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:900, letterSpacing:'-0.02em', marginBottom:20 }}>
                  {user?.name ?? 'Welcome back'}
                </h1>
                <div className="dash-stat-row" style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[
                    { label:'Wallet Balance', value:`₹${balance.toLocaleString('en-IN')}`, hi:true },
                    { label:'Active Plans',   value:subs.filter((s:any)=>s.status==='active').length },
                    { label:'Shop Orders',    value:orders.length },
                    { label:'Total Bookings', value:totalBookings },
                  ].map(stat => (
                    <div key={stat.label} className="dash-stat-card" style={{ background:'#fff', border:(stat.hi ? '2px solid var(--gold)' : '1px solid var(--border-mid)'), borderRadius:16, padding:'16px 24px', boxShadow: 'var(--sh-xs)' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color:stat.hi?'var(--gold-deep)':'var(--forest)', lineHeight:1 }}>{stat.value}</div>
                      <div style={{ fontSize:'0.75rem', color:stat.hi?'var(--earth)':'var(--sage)', marginTop:6, fontWeight:700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/book?type=on-demand" className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0, padding: '16px 28px', fontSize: '1rem', boxShadow: 'var(--sh-md)' }}>
                <IcPlus /> Book New Visit
              </Link>
            </div>
          </div>
        </div>

        <div className="container dash-main-container" style={{ position: 'relative', zIndex: 11, marginTop:-44, paddingBottom:72 }}>

          {/* Quick actions */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:32 }} className="quick-grid">
            {[
              { href:'/book?type=on-demand', label:'Book Visit', Icon:IcCal, bg:'#fff', color:'var(--forest)' },
              { href:'/shop/orders',         label:'My Orders',  Icon:IcShop, bg:'#fff', color:'var(--forest)' },
              { href:'/plantopedia',        label:'AI Vision',  Icon:IcBrain, bg:'var(--forest)', color:'#fff' },
              { href:'/shop',               label:'Marketplace',Icon:IcShop, bg:'#fff', color:'var(--forest)' },
              { href:'/wallet',             label:'Wallet',     Icon:IcWall, bg:'#fff', color:'var(--forest)' },
            ].map(({ href, label, Icon, bg, color }) => (
              <Link key={href} href={href}
                className="card"
                style={{ background: bg, display:'flex', flexDirection:'column', alignItems:'center', gap:12, padding:'clamp(20px,3vw,28px) 12px', borderRadius:24, textDecoration:'none', transition:'all 0.3s var(--ease)' }}>
                <div style={{ width:56, height:56, borderRadius:16, background: color === '#fff' ? 'rgba(255,255,255,0.1)' : 'var(--bg-elevated)', border: `1px solid ${color === '#fff' ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                  <Icon />
                </div>
                <span style={{ fontSize:'0.8rem', fontWeight:800, color: color === '#fff' ? '#fff' : 'var(--forest)', textAlign:'center', lineHeight:1.2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </Link>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:28, alignItems:'start' }} className="dash-grid">

            {/* Bookings & Orders */}
            <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
              
              {/* Bookings */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color: 'var(--forest)', margin:0 }}>Recent Bookings</h2>
                  <Link href="/bookings" style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.85rem', color:'var(--earth)', fontWeight:800, textDecoration:'none', textTransform: 'uppercase' }}>
                    View all <IcArrow />
                  </Link>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {bLoad ? Array(3).fill(null).map((_,i) => (
                    <div key={i} className="card skeleton" style={{ borderRadius:24, padding:24, height: 90 }} />
                  )) : bookings.length === 0 ? (
                    <div className="card" style={{ borderRadius:28, padding:'50px 24px', textAlign:'center', border:'1.5px dashed var(--border-gold)', background: 'transparent', boxShadow: 'none' }}>
                      <div style={{ width: 60, height: 60, margin: '0 auto 16px', color: 'var(--gold)', background: 'var(--bg-elevated)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcCal /></div>
                      <p style={{ color:'var(--earth)', fontSize:'1rem', fontWeight: 700 }}>No recent visits booked.</p>
                      <Link href="/book" style={{ color:'var(--forest)', fontWeight:800, fontSize:'0.9rem', marginTop:12, display:'inline-block', textDecoration: 'underline' }}>Book your first visit</Link>
                    </div>
                  ) : bookings.map((b:any, i:number) => (
                    <Link key={b.id} href={`/bookings/${b.id}`}
                      className="card dash-list-card"
                      style={{ borderRadius:24, padding:'20px 24px', textDecoration:'none' }}>
                      <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg-elevated)', border: '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--forest)' }}><IcLeaf /></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                          <span style={{ fontWeight:900, fontSize:'0.95rem', fontFamily:'var(--font-mono)', color:'var(--forest)' }}>{b.booking_number}</span>
                          <StatusPill s={b.status} />
                        </div>
                        <div style={{ fontSize:'0.85rem', color:'var(--sage)', fontWeight: 600 }} className="truncate">{b.service_address}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'var(--gold-deep)', fontSize:'1.15rem' }}>₹{Number(b.total_amount).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--sage)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{new Date(b.scheduled_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} {b.scheduled_time && `at ${b.scheduled_time}`}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Shop Orders */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.4rem', color: 'var(--forest)', margin:0 }}>Marketplace Orders</h2>
                  <Link href="/shop/orders" style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.85rem', color:'var(--earth)', fontWeight:800, textDecoration:'none', textTransform: 'uppercase' }}>
                    Tracking history <IcArrow />
                  </Link>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {oLoad ? Array(2).fill(null).map((_,i) => (
                    <div key={i} className="card skeleton" style={{ borderRadius:24, padding:24, height: 90 }} />
                  )) : orders.length === 0 ? (
                    <div className="card" style={{ borderRadius:28, padding:'50px 24px', textAlign:'center', border:'1.5px dashed var(--border-gold)', background: 'transparent', boxShadow: 'none' }}>
                      <div style={{ width: 60, height: 60, margin: '0 auto 16px', color: 'var(--gold)', background: 'var(--bg-elevated)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcShop /></div>
                      <p style={{ color:'var(--earth)', fontSize:'1rem', fontWeight: 700 }}>You haven't ordered any plants yet.</p>
                      <Link href="/shop" style={{ color:'var(--forest)', fontWeight:800, fontSize:'0.9rem', marginTop:12, display:'inline-block', textDecoration: 'underline' }}>Go to Shop</Link>
                    </div>
                  ) : orders.slice(0, 3).map((o:any, i:number) => (
                    <Link key={o.id} href="/shop/orders"
                      className="card dash-list-card"
                      style={{ borderRadius:24, padding:'20px 24px', textDecoration:'none' }}>
                      <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg)', border: '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--forest)' }}><IcShop /></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                          <span style={{ fontWeight:900, fontSize:'0.95rem', fontFamily:'var(--font-mono)', color:'var(--forest)' }}>{o.order_number}</span>
                          <StatusPill s={o.status} />
                        </div>
                        <div style={{ fontSize:'0.85rem', color:'var(--sage)', fontWeight: 600 }}>{o.items?.length ?? 0} items purchased</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--gold-deep)', fontSize:'1.15rem' }}>₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--sage)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Active subscription */}
              {activeSub ? (
                <div style={{ background:'var(--forest)', borderRadius:32, padding:'clamp(30px,4vw,40px)', position:'relative', overflow:'hidden', border: '2px solid var(--border)', boxShadow: 'var(--sh-lg)' }}>
                  <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(201,168,76,0.3)', filter: 'blur(50px)' }} />
                  <p style={{ fontSize:'0.8rem', fontWeight:900, color:'var(--gold-light)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12, fontFamily: 'var(--font-mono)' }}>Active Plan</p>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:900, color:'#fff', fontSize:'1.8rem', marginBottom:8, lineHeight: 1.1 }}>{activeSub.plan?.name}</h3>
                  <p style={{ fontSize:'0.9rem', color:'var(--cream)', opacity: 0.9, marginBottom:32, fontWeight: 500 }}>{activeSub.plan?.visits_per_month} visits/mo · {activeSub.plant_count} plants</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem, 4vw, 2.2rem)', fontWeight:900, color:'var(--gold)' }}>₹{activeSub.plan?.price?.toLocaleString('en-IN')}<span style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.7)', fontWeight:600 }}>/mo</span></span>
                    <Link href="/subscriptions" style={{ background:'#fff', color:'var(--forest)', padding:'10px 24px', borderRadius:99, fontSize:'0.9rem', fontWeight:800, textDecoration:'none', boxShadow: 'var(--sh-sm)', whiteSpace: 'nowrap' }}>Manage</Link>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ borderRadius:32, padding:'clamp(32px,4vw,40px)', textAlign:'center', border: '1.5px solid var(--border-gold)' }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:'var(--bg-elevated)', border: '1.5px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--forest)' }}><IcLeaf /></div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:900, marginBottom:12, fontSize:'1.5rem', color:'var(--forest)' }}>Start a Subscription</h3>
                  <p style={{ color:'var(--sage)', fontSize:'0.95rem', lineHeight:1.65, marginBottom:28, fontWeight: 600 }}>Save up to 30% with monthly cinematic garden care plans</p>
                  <Link href="/plans" className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}>Compare Plans</Link>
                </div>
              )}

              {/* AI feature promo */}
              <Link href="/plantopedia" className="card" style={{ textDecoration:'none', borderRadius:28, padding:'24px', display:'flex', gap:20, alignItems:'center', border: '1px solid var(--border-gold)' }}>
                <div style={{ width:60, height:60, borderRadius:16, background:'var(--bg-elevated)', border:'1px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--earth)' }}><IcBrain /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:'1.05rem', color:'var(--forest)', marginBottom:4 }}>Botanical AI Vision</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--sage)', fontWeight: 600 }}>Upload photo · instant disease diagnosis</div>
                </div>
                <span style={{ color:'var(--forest)', display:'flex' }}><IcArrow /></span>
              </Link>

              {/* Shop promo */}
              <Link href="/shop" className="card" style={{ textDecoration:'none', borderRadius:28, padding:'24px', display:'flex', gap:20, alignItems:'center', border: '1px solid var(--border)' }}>
                <div style={{ width:60, height:60, borderRadius:16, background:'var(--bg)', border: '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--forest)' }}><IcShop /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:900, fontSize:'1.05rem', color:'var(--forest)', marginBottom:4 }}>Botanical Supply</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--sage)', fontWeight: 600 }}>Curated organic plants & premium tools</div>
                </div>
                <span style={{ color:'var(--forest)', display:'flex' }}><IcArrow /></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style jsx>{`
        .dash-list-card { display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
        .dash-list-card:hover { transform: translateY(-2px); }
        @media(max-width:960px) { .dash-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:640px) { 
          .dash-main-container { margin-top: 0 !important; }
          .dash-grid { overflow-x: hidden !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          .dash-grid * { min-width: 0 !important; max-width: 100% !important; overflow-wrap: break-word !important; word-break: break-word !important; box-sizing: border-box !important; }
          .container { padding: 0 16px !important; }
          .quick-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; margin: 0 0 24px 0 !important; }
          .quick-grid > a { padding: 16px 10px !important; height: auto !important; }
          .dash-stat-row { flex-wrap: wrap !important; gap: 8px !important; }
          .dash-stat-card { flex: 1 1 calc(50% - 8px) !important; padding: 12px 14px !important; }
          .card { width: 100% !important; padding: 20px !important; border-radius: 24px !important; }
          .dash-list-card { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .dash-list-card > div:first-child { width: 44px !important; height: 44px !important; margin: 0 !important; flex-shrink: 0 !important; }
          .dash-list-card > div:nth-child(2) { width: 100% !important; flex: none !important; display: flex !important; flex-direction: column !important; gap: 8px !important; }
          .dash-list-card > div:nth-child(2) > div:first-child {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 10px !important;
            margin-bottom: 4px !important;
          }
          .dash-list-card > div:last-child { 
            text-align: left !important; 
            width: 100% !important; 
            border-top: 1.5px dashed var(--border-gold); 
            padding-top: 14px !important; 
            margin-top: 6px !important; 
            display: flex !important; 
            flex-direction: row !important;
            justify-content: space-between !important; 
            align-items: flex-end !important; 
          }
          .dash-list-card > div:last-child > div:first-child { font-size: 1.25rem !important; line-height: 1 !important; }
          .dash-list-card > div:last-child > div:last-child { font-size: 0.75rem !important; opacity: 0.8; }
          .truncate { white-space: normal !important; word-break: break-word !important; display: block !important; }
          h2, h3 { font-size: 1.2rem !important; }
        }
      `}</style>
    </>
  );
}
