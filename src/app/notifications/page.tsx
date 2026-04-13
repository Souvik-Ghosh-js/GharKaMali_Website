'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getNotifications, markRead, markAllRead } from '@/lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const qc = useQueryClient();
  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/notifications'); }, [isAuthenticated, isLoading]);

  const { data, isLoading: nLoad } = useQuery({ queryKey: ['notifications'], queryFn: getNotifications, enabled: isAuthenticated });
  const notifs: any[] = (data as any[]) ?? [];
  const unread = notifs.filter(n => !n.is_read).length;

  const readMut  = useMutation({ mutationFn: (id: number) => markRead(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }) });
  const allMut   = useMutation({ mutationFn: markAllRead, onSuccess: () => { toast.success('All notifications marked read'); qc.invalidateQueries({ queryKey: ['notifications'] }); } });

  const ICONS: Record<string, JSX.Element> = {
    booking: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    gardener: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    payment: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    system: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    promotion: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
  };

  if (isLoading) return null;
  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh', position: 'relative' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.1 }} />
        
        <div style={{ padding:'48px 0 80px', position:'relative', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ fontSize:'0.8rem', fontWeight:800, color:'var(--sage)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10, fontFamily: 'var(--font-mono)' }}>MY ACCOUNT</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:900, color:'var(--forest)', letterSpacing:'-0.02em' }}>Notifications</h1>
                  {unread > 0 && <span style={{ background:'var(--bg-elevated)', color:'var(--gold-deep)', padding:'6px 16px', borderRadius:99, fontSize:'0.82rem', fontWeight:800, border: '1px solid var(--border-gold)' }}>{unread} new</span>}
                </div>
              </div>
              {unread > 0 && <button onClick={() => allMut.mutate()} className="btn btn-outline btn-sm">Mark all as read</button>}
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80, position: 'relative', zIndex: 10 }}>
          <div className="card" style={{ borderRadius:28, padding: 0, overflow:'hidden', maxWidth:680 }}>
            {nLoad ? Array(6).fill(null).map((_, i) => (
              <div key={i} style={{ padding:'24px', borderBottom:'1px solid var(--border)', display:'flex', gap:16 }}>
                <div className="skeleton" style={{ width:52, height:52, borderRadius:16, flexShrink:0 }} />
                <div style={{ flex:1 }}><div className="skeleton skel-h" style={{ width:'60%', marginBottom:12 }} /><div className="skeleton skel-h" style={{ width:'40%' }} /></div>
              </div>
            )) : notifs.length === 0 ? (
              <div style={{ padding:'80px 24px', textAlign:'center' }}>
                <div style={{ color: 'var(--forest)', opacity:0.15, marginBottom:20, display:'flex', justifyContent:'center' }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div style={{ fontWeight:900, fontSize:'1.4rem', marginBottom:10, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>All caught up!</div>
                <div style={{ color:'var(--sage)', fontSize:'1rem', fontWeight:500 }}>No notifications yet. We'll keep you updated on your bookings.</div>
              </div>
            ) : notifs.map((n: any, i: number) => (
              <div key={n.id} onClick={() => !n.is_read && readMut.mutate(n.id)}
                style={{ padding:'22px 24px', borderBottom: i < notifs.length-1 ? '1px solid var(--border)' : 'none', display:'flex', gap:16, alignItems:'flex-start', background: n.is_read ? 'transparent' : 'var(--bg-elevated)', cursor: n.is_read ? 'default' : 'pointer', transition:'all 0.3s var(--ease)', animation:`fade-up 0.4s var(--ease) ${i*30}ms both` }}
                onMouseEnter={e => { if (!n.is_read) (e.currentTarget as any).style.background = '#f3f3f0'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.background = n.is_read ? 'transparent' : 'var(--bg-elevated)'; }}>
                <div style={{ width:52, height:52, borderRadius:16, background: n.is_read ? '#f9f9f9' : 'var(--bg-elevated)', border: `1px solid ${n.is_read ? 'var(--border)' : 'var(--border-gold)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0, color: n.is_read ? 'var(--sage)' : 'var(--forest)' }}>
                  {ICONS[n.type] ?? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight: n.is_read ? 500 : 800, fontSize:'1rem', marginBottom:6, lineHeight:1.5, color: n.is_read ? 'var(--sage)' : 'var(--forest)' }}>{n.message}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight:600 }}>{n.created_at && new Date(n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                </div>
                {!n.is_read && <div style={{ width:10, height:10, borderRadius:'50%', background:'var(--forest)', flexShrink:0, marginTop:8, boxShadow: '0 0 8px rgba(11,61,46,0.3)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
