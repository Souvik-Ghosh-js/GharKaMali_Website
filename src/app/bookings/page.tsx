'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getMyBookings } from '@/lib/api';

const IcLeaf  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcCal   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcSeed  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22v-7M12 15s-4-3-4-7a6 6 0 0 1 12 0c0 4-4 7-4 7z"/></svg>;
const IcPlus  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const STATUSES = ['all','pending','assigned','en_route','in_progress','completed','cancelled'];
const STATUS_LABELS: Record<string, string> = { all:'All', pending:'Pending', assigned:'Assigned', en_route:'On the Way', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
const STATUS_STYLES: Record<string,[string,string]> = {
  pending:     ['var(--bg-elevated)','var(--gold-deep)'],
  assigned:    ['#DBEAFE','#2563EB'],
  en_route:    ['#E0F2FE','#0284C7'],
  arrived:     ['#DCFCE7','#16A34A'],
  in_progress: ['#FEF9C3','#CA8A04'],
  completed:   ['#DCFCE7','#16A34A'],
  cancelled:   ['#F3F4F6','#4B5563'],
  failed:      ['#FEE2E2','#DC2626'],
};
function StatusPill({ s }: { s: string }) {
  const [bg, color] = STATUS_STYLES[s] ?? ['#F3F4F6','#4B5563'];
  return <span style={{ padding:'4px 12px', borderRadius:99, fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color, whiteSpace:'nowrap', border: `1px solid ${color}40` }}>{s.replace(/_/g,' ')}</span>;
}

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/bookings'); }, [isAuthenticated, isLoading, router]);

  const { data, isLoading: bLoad } = useQuery({
    queryKey: ['bookings', filter, page],
    queryFn: () => getMyBookings({ ...(filter !== 'all' ? { status: filter } : {}), page, limit: 10 }),
    enabled: isAuthenticated,
  });

  const raw = data as any;
  const bookings: any[] = Array.isArray(raw) ? raw : (raw?.bookings ?? raw?.items ?? []);
  const total: number = raw?.total ?? bookings.length;
  const pages: number = raw?.pages ?? (Math.ceil(total / 10) || 1);

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh', position: 'relative' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.1 }} />

        {/* Header */}
        <div style={{ padding:'clamp(40px,8vw,64px) 0 clamp(72px,12vw,96px)', position:'relative', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div>
                <p className="overline" style={{ color:'var(--sage)', marginBottom:10 }}>MY ACCOUNT</p>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:900, color:'var(--forest)', letterSpacing:'-0.02em', margin:0 }}>My Bookings</h1>
              </div>
              <Link href="/book?type=on-demand" className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:7, padding: '16px 28px', fontSize: '1rem', boxShadow: 'var(--sh-md)' }}>
                <IcPlus /> New Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80, position: 'relative', zIndex: 10 }}>
          {/* Filter tabs */}
          <div className="card" style={{ padding:8, display:'flex', gap:6, marginBottom:32, overflowX:'auto', scrollbarWidth:'none', borderRadius: 99, border: '1px solid var(--border-mid)' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                style={{ padding:'12px 24px', borderRadius:99, border:'none', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.3s var(--ease)', flexShrink:0, background: filter === s ? 'var(--forest)' : 'transparent', color: filter === s ? '#fff' : 'var(--sage)' }}>
                {STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {bLoad ? Array(5).fill(null).map((_,i) => (
              <div key={i} className="card skeleton" style={{ padding:'24px', borderRadius: 24 }}>
                <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <div className="skeleton" style={{ width:56, height:56, borderRadius:16, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div className="skeleton skel-h" style={{ width:'40%', marginBottom:12 }} />
                    <div className="skeleton skel-h" style={{ width:'70%' }} />
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="skeleton skel-h" style={{ width:60, marginBottom:10 }} />
                    <div className="skeleton skel-h" style={{ width:40 }} />
                  </div>
                </div>
              </div>
            )) : bookings.length === 0 ? (
              <div className="card" style={{ padding:'clamp(60px,8vw,90px) 24px', textAlign:'center', border:'1.5px dashed var(--border-gold)', background: 'transparent' }}>
                <div style={{ width:80, height:80, borderRadius:'24px', background:'var(--bg-elevated)', border: '1.5px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', color:'var(--forest)' }}><IcLeaf /></div>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.8rem', marginBottom:14, color: 'var(--forest)' }}>
                  {filter === 'all' ? 'No bookings yet' : `No ${STATUS_LABELS[filter]?.toLowerCase()} bookings`}
                </h2>
                <p style={{ color:'var(--sage)', marginBottom:32, maxWidth:400, margin:'0 auto 36px', lineHeight:1.7, fontSize:'1rem', fontWeight: 500 }}>
                  {filter === 'all' ? 'Book your first expert cinematic gardener visit to get started and see the magic.' : 'Try a different status filter above to find your booked visits.'}
                </p>
                <Link href="/book?type=on-demand" className="btn btn-primary btn-lg">Book a Gardener Visit</Link>
              </div>
            ) : (
              bookings.map((b: any, i: number) => (
                <Link key={b.id} href={`/bookings/${b.id}`} className="card"
                  style={{ 
                    borderRadius: 24, 
                    padding: 24, 
                    textDecoration: 'none', 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 16, 
                    animation: `fade-up 0.5s var(--ease) ${i * 40}ms both`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                      <IcLeaf />
                    </div>
                    <StatusPill s={b.status} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'var(--forest-mid)', marginBottom: 8 }}>#{b.booking_number}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--sage)', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5, marginBottom: 12 }}>{b.service_address}</div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.72rem', color: 'var(--earth)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {b.scheduled_date && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IcCal /> {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      {b.scheduled_time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IcClock /> {b.scheduled_time}</span>}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--sage)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{b.plan?.name ?? 'Visit'}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--gold-deep)' }}>
                        {b.booking_type === 'subscription' 
                          ? (b.extra_amount > 0 ? `+₹${b.extra_amount}` : 'Covered')
                          : (b.total_amount != null ? `₹${Number(b.total_amount).toLocaleString('en-IN')}` : '—')}
                      </div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', border: '1px solid var(--border)' }}>
                      <IcArrow />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:40 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn btn-outline btn-sm" style={{ opacity:page===1?0.4:1 }}>← Prev</button>
              {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className={`btn btn-sm ${page===p?'btn-primary':'btn-outline'}`}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="btn btn-outline btn-sm" style={{ opacity:page===pages?0.4:1 }}>Next →</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
