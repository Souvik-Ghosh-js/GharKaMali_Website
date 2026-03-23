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

  const ICONS: Record<string, string> = { booking: 'cal', gardener: 'user', payment: 'card', system: 'cog', promotion: 'gift' };

  if (isLoading) return null;
  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        <div style={{ background:'linear-gradient(135deg,var(--forest),var(--forest-mid))', padding:'48px 0 80px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>MY ACCOUNT</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>Notifications</h1>
                  {unread > 0 && <span style={{ background:'var(--gold)', color:'var(--forest)', padding:'3px 12px', borderRadius:99, fontSize:'0.78rem', fontWeight:800 }}>{unread} new</span>}
                </div>
              </div>
              {unread > 0 && <button onClick={() => allMut.mutate()} className="btn btn-ghost-white btn-sm">Mark all as read</button>}
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80 }}>
          <div style={{ background:'#fff', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', maxWidth:680 }}>
            {nLoad ? Array(6).fill(null).map((_, i) => (
              <div key={i} style={{ padding:'16px 22px', borderBottom:'1px solid var(--border)', display:'flex', gap:12 }}>
                <div className="skeleton" style={{ width:44, height:44, borderRadius:12, flexShrink:0 }} />
                <div style={{ flex:1 }}><div className="skeleton skel-h" style={{ width:'60%', marginBottom:8 }} /><div className="skeleton skel-h" style={{ width:'40%' }} /></div>
              </div>
            )) : notifs.length === 0 ? (
              <div style={{ padding:'64px 24px', textAlign:'center' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:16 }}>🔔</div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:8 }}>All caught up!</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>No notifications yet. We'll keep you updated on your bookings.</div>
              </div>
            ) : notifs.map((n: any, i: number) => (
              <div key={n.id} onClick={() => !n.is_read && readMut.mutate(n.id)}
                style={{ padding:'16px 22px', borderBottom: i < notifs.length-1 ? '1px solid var(--border)' : 'none', display:'flex', gap:14, alignItems:'flex-start', background: n.is_read ? '#fff' : 'rgba(11,61,46,0.025)', cursor: n.is_read ? 'default' : 'pointer', transition:'background 0.2s', animation:`fade-up 0.4s var(--ease) ${i*30}ms both` }}
                onMouseEnter={e => { if (!n.is_read) (e.currentTarget as any).style.background = 'rgba(11,61,46,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.background = n.is_read ? '#fff' : 'rgba(11,61,46,0.025)'; }}>
                <div style={{ width:44, height:44, borderRadius:14, background: n.is_read ? 'var(--bg)' : 'rgba(11,61,46,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                  {ICONS[n.type] ?? '🔔'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize:'0.88rem', marginBottom:4, lineHeight:1.45 }}>{n.message}</div>
                  <div style={{ fontSize:'0.73rem', color:'var(--text-faint)' }}>{n.created_at && new Date(n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
                </div>
                {!n.is_read && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--forest)', flexShrink:0, marginTop:6 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
