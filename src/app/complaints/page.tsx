'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { createComplaint, getMyComplaints } from '@/lib/api';

const TYPES = [
  { value:'service_quality', label:'Service Quality', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg> },
  { value:'late_arrival', label:'Late Arrival', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { value:'no_show', label:'No Show', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/><path d="M6.5 17.8c-.5-1.1-.7-2.4-.7-3.8 0-4.4 3.6-8 8-8s8 3.6 8 8c0 1.4-.2 2.7-.7 3.8"/><path d="M12 2v4"/></svg> },
  { value:'rude_behavior', label:'Rude Behavior', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { value:'billing', label:'Billing Issue', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { value:'damage', label:'Property Damage', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 21 1.9-1.9a9 9 0 1 1 12.7 0L19.5 21"/><path d="m9 11 1 1 2-2"/></svg> },
  { value:'other', label:'Other', icon: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
] as const;

const STATUS_MAP: Record<string,[string,string]> = {
  open:        ['#DBEAFE','#2563EB'],
  in_progress: ['#FEF9C3','#CA8A04'],
  resolved:    ['#DCFCE7','#16A34A'],
  closed:      ['#F3F4F6','#4B5563'],
};

export default function ComplaintsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<typeof TYPES[number]['value']>('service_quality');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/complaints'); }, [isAuthenticated, isLoading]);

  const { data, isLoading: cLoad } = useQuery({ queryKey: ['complaints'], queryFn: getMyComplaints, enabled: isAuthenticated });
  const complaints: any[] = (data as any[]) ?? [];

  const createMut = useMutation({
    mutationFn: () => createComplaint({ type, description: desc, priority }),
    onSuccess: () => {
      toast.success('Complaint filed. We\'ll respond within 24 hours.');
      setShowForm(false); setDesc(''); setType('service_quality');
      qc.invalidateQueries({ queryKey: ['complaints'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

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
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:900, color:'var(--forest)', letterSpacing:'-0.02em' }}>Help & Complaints</h1>
              </div>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">+ File a Complaint</button>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80, position: 'relative', zIndex: 10 }}>
          {/* Support info */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:14, marginBottom:32 }}>
            {[
              { Icon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label:'Response Time', value:'Under 24 hours' },
              { Icon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, label:'Support Hours', value:'Mon–Sat, 9 AM–7 PM' },
              { Icon: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, label:'Resolution Rate', value:'98% satisfied' },
            ].map((c, idx) => (
              <div key={c.label} className="card" style={{ padding:'28px', textAlign:'center', animation:`fade-up 0.5s var(--ease) ${idx*60}ms both`, borderRadius:24 }}>
                <div style={{ color:'var(--forest)', opacity:0.6, marginBottom:14, display:'flex', justifyContent:'center' }}><c.Icon/></div>
                <div style={{ fontWeight:900, fontSize:'1.2rem', marginBottom:8, color:'var(--forest)', fontFamily:'var(--font-display)' }}>{c.value}</div>
                <div style={{ fontSize:'0.9rem', color:'var(--sage)', fontWeight:600 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {cLoad ? Array(3).fill(null).map((_,i) => <div key={i} className="card skeleton" style={{ height:100, marginBottom:16, borderRadius: 24 }} />) :
            complaints.length === 0 ? (
              <div className="card" style={{ padding:'90px 24px', textAlign:'center', border: '1.5px dashed var(--border-gold)', background: 'transparent', borderRadius: 28 }}>
                <div style={{ color:'var(--forest)', opacity:0.15, marginBottom:24, display:'flex', justifyContent:'center' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 style={{ fontWeight:900, fontSize:'1.8rem', marginBottom:14, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>No complaints filed</h3>
                <p style={{ color:'var(--sage)', marginBottom:36, maxWidth:400, margin:'0 auto 36px', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 }}>Had an issue? We're here to help. File a complaint and we'll resolve it within 24 hours.</p>
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-lg" style={{ padding: '16px 32px', boxShadow: 'var(--sh-md)' }}>File a Complaint</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {complaints.map((c: any, i: number) => {
                  const [bg, color] = STATUS_MAP[c.status] ?? ['#F3F4F6','#4B5563'];
                  const typeInfo = TYPES.find(t => t.value === c.type);
                  return (
                    <div key={c.id} className="card" style={{ padding:'28px', animation:`fade-up 0.5s var(--ease) ${i*60}ms both`, borderRadius: 24 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                          <span style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)', color:'var(--forest)' }}>{typeInfo && <typeInfo.icon/>}</span>
                          <div>
                            <div style={{ fontWeight:900, fontSize:'1.1rem', color: 'var(--forest)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{typeInfo?.label ?? c.type}</div>
                            <div style={{ fontSize:'0.8rem', color:'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Filed {c.created_at && new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                          </div>
                        </div>
                        <span style={{ display:'inline-flex', padding:'5px 16px', borderRadius:99, fontSize:'0.75rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, border: `1px solid ${color}40`, color }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize:'0.95rem', color:'var(--sage)', lineHeight:1.7, fontWeight: 500 }}>{c.description}</p>
                      {c.resolution && (
                        <div style={{ marginTop:20, padding:'20px', background:'#DCFCE7', borderRadius:16, borderLeft:'4px solid #16A34A' }}>
                          <div style={{ fontSize:'0.8rem', fontWeight:800, color:'#16A34A', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:10, fontFamily: 'var(--font-mono)' }}>Resolution</div>
                          <p style={{ fontSize:'0.95rem', color:'var(--forest)', lineHeight:1.7, fontWeight: 500 }}>{c.resolution}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* File complaint modal */}
      {showForm && (
        <div className="modal-bg" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:540, padding: '36px', background: '#fff', color: 'var(--forest)' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.8rem', marginBottom:10, color: 'var(--forest)' }}>File a Complaint</h2>
            <p style={{ color:'var(--sage)', fontSize:'1rem', marginBottom:32, fontWeight: 500 }}>We take every complaint seriously and respond within 24 hours</p>

            <div style={{ marginBottom:24 }}>
              <label className="form-label">Issue Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10 }}>
                {TYPES.map(t => (
                  <button key={t.value} onClick={() => setType(t.value)}
                    style={{ padding:'14px 8px', borderRadius:16, border:`2px solid ${type === t.value ? 'var(--forest)' : 'var(--border)'}`, background: type === t.value ? 'var(--bg-elevated)' : '#fff', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'center', transition:'all 0.2s var(--ease)', color: type === t.value ? 'var(--forest)' : 'var(--sage)' }}>
                    <div style={{ marginBottom:8, display:'flex', justifyContent:'center' }}>{t.icon && <t.icon/>}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:800, color: type === t.value ? 'var(--forest)' : 'var(--sage)' }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label className="form-label">Priority</label>
              <div style={{ display:'flex', gap:10 }}>
                {(['low','medium','high'] as const).map(p => (
                    <button key={p} onClick={() => setPriority(p)}
                      style={{ flex:1, padding:'14px', borderRadius:16, border:`2px solid ${priority === p ? 'var(--forest)' : 'var(--border)'}`, background: priority === p ? 'var(--bg-elevated)' : '#fff', color: priority === p ? 'var(--forest)' : 'var(--sage)', fontWeight:800, fontSize:'0.9rem', cursor:'pointer', fontFamily:'var(--font-display)', textTransform:'capitalize', transition:'all 0.2s var(--ease)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background: p==='low'?'#16a34a':p==='medium'?'#ca8a04':'#dc2626' }}/> {p}
                    </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Describe the Issue <span style={{ color: 'var(--gold)' }}>*</span></label>
              <textarea placeholder="Please provide as much detail as possible..." value={desc} onChange={e => setDesc(e.target.value)} 
                style={{ width: '100%', minHeight: 120, resize:'vertical', background: '#fff', border: '1px solid var(--border-mid)', borderRadius: 18, padding: '18px', color: 'var(--forest)', outline: 'none', transition: 'all 0.3s var(--ease)', fontSize: '1rem', fontWeight: 500 }} 
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--border)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={!desc.trim() || createMut.isPending}
                className="btn btn-primary" style={{ flex:2, justifyContent:'center', opacity: (!desc.trim() || createMut.isPending) ? 0.5 : 1 }}>
                {createMut.isPending ? <><div className="btn-spinner" /> Submitting…</> : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
