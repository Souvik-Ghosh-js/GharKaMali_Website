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
  pending:['#FEF3C7','#92400E'], assigned:['#DBEAFE','#1E40AF'],
  en_route:['#E0F2FE','#0369A1'], arrived:['#DCFCE7','#166534'],
  in_progress:['#FEF9C3','#854D0E'], completed:['#DCFCE7','#14532D'],
  cancelled:['#F3F4F6','#374151'], failed:['#FEE2E2','#991B1B'],
};
function StatusPill({ s }: { s: string }) {
  const [bg, color] = STATUS_STYLES[s] ?? ['#F3F4F6','#374151'];
  return <span style={{ padding:'3px 10px', borderRadius:99, fontSize:'0.67rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color, whiteSpace:'nowrap' }}>{s.replace(/_/g,' ')}</span>;
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

  // Robust safe extraction — handles both array and {items:[]} shapes
  const raw = data as any;
  const bookings: any[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
  const total: number = raw?.total ?? bookings.length;
  const pages = Math.ceil(total / 10) || 1;

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)', padding:'clamp(40px,8vw,64px) 0 clamp(72px,12vw,96px)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div>
                <p className="overline" style={{ color:'rgba(255,255,255,0.45)', marginBottom:10 }}>MY ACCOUNT</p>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em', margin:0 }}>My Bookings</h1>
              </div>
              <Link href="/book" className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:7 }}>
                <IcPlus /> New Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80 }}>
          {/* Filter tabs */}
          <div style={{ background:'#fff', borderRadius:18, padding:5, display:'flex', gap:4, marginBottom:24, overflowX:'auto', border:'1px solid var(--border)', boxShadow:'var(--sh-sm)', scrollbarWidth:'none' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                style={{ padding:'9px 14px', borderRadius:13, border:'none', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s', flexShrink:0, background: filter === s ? 'var(--forest)' : 'transparent', color: filter === s ? '#fff' : 'var(--text-muted)' }}>
                {STATUS_LABELS[s] ?? s}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {bLoad ? Array(5).fill(null).map((_,i) => (
              <div key={i} style={{ background:'#fff', borderRadius:22, padding:'18px 20px', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div className="skeleton" style={{ width:50, height:50, borderRadius:14, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div className="skeleton skel-h" style={{ width:'42%', marginBottom:10 }} />
                    <div className="skeleton skel-h" style={{ width:'68%' }} />
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="skeleton skel-h" style={{ width:56, marginBottom:8 }} />
                    <div className="skeleton skel-h" style={{ width:44 }} />
                  </div>
                </div>
              </div>
            )) : bookings.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:28, padding:'clamp(52px,8vw,80px) 24px', textAlign:'center', border:'2px dashed var(--border)' }}>
                <div style={{ width:72, height:72, borderRadius:20, background:'rgba(11,61,46,0.07)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', color:'var(--forest)' }}><IcLeaf /></div>
                <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.4rem', marginBottom:10 }}>
                  {filter === 'all' ? 'No bookings yet' : `No ${STATUS_LABELS[filter]?.toLowerCase()} bookings`}
                </h2>
                <p style={{ color:'var(--text-muted)', marginBottom:28, maxWidth:320, margin:'0 auto 28px', lineHeight:1.7, fontSize:'0.9rem' }}>
                  {filter === 'all' ? 'Book your first expert gardener visit to get started' : 'Try a different status filter above'}
                </p>
                <Link href="/book" className="btn btn-forest">Book a Gardener</Link>
              </div>
            ) : bookings.map((b: any, i: number) => (
              <Link key={b.id} href={`/bookings/${b.id}`}
                style={{ background:'#fff', borderRadius:22, padding:'clamp(14px,3vw,18px) clamp(16px,3vw,22px)', border:'1px solid var(--border)', textDecoration:'none', display:'flex', alignItems:'center', gap:14, transition:'all 0.25s var(--ease)', animation:`fade-up 0.5s var(--ease) ${i*40}ms both` }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform='translateY(-3px)'; (e.currentTarget as any).style.boxShadow='var(--sh-md)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform='none'; (e.currentTarget as any).style.boxShadow='none'; }}>
                <div style={{ width:50, height:50, borderRadius:14, background:'rgba(11,61,46,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--forest)' }}>
                  <IcLeaf />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, fontSize:'0.85rem', fontFamily:'monospace', color:'var(--text)', letterSpacing:'0.04em' }}>{b.booking_number}</span>
                    <StatusPill s={b.status} />
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:5 }}>{b.service_address}</div>
                  <div style={{ display:'flex', gap:12, fontSize:'0.73rem', color:'var(--text-faint)', flexWrap:'wrap' }}>
                    {b.scheduled_date && (
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <IcCal /> {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    )}
                    {b.scheduled_time && <span style={{ display:'flex', alignItems:'center', gap:4 }}><IcClock /> {b.scheduled_time}</span>}
                    {b.plant_count != null && <span style={{ display:'flex', alignItems:'center', gap:4 }}><IcSeed /> {b.plant_count} plants</span>}
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.1rem', color:'var(--forest)' }}>
                    {b.total_amount != null ? `₹${b.total_amount.toLocaleString('en-IN')}` : '—'}
                  </div>
                  <div style={{ fontSize:'0.73rem', color:'var(--text-faint)', marginTop:3 }}>{b.plan?.name ?? 'Visit'}</div>
                </div>
                <span style={{ color:'var(--text-faint)', display:'flex', flexShrink:0 }}><IcArrow /></span>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn btn-outline btn-sm" style={{ opacity:page===1?0.4:1 }}>← Prev</button>
              {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className={`btn btn-sm ${page===p?'btn-forest':'btn-outline'}`}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="btn btn-outline btn-sm" style={{ opacity:page===pages?0.4:1 }}>Next →</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </>
  );
}
