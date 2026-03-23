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
  { value:'service_quality', label:'Service Quality', icon:'quality' },
  { value:'late_arrival', label:'Late Arrival', icon:'⏰' },
  { value:'no_show', label:'No Show', icon:'👻' },
  { value:'rude_behavior', label:'Rude Behavior', icon:'😤' },
  { value:'billing', label:'Billing Issue', icon:'billing' },
  { value:'damage', label:'Property Damage', icon:'🏚️' },
  { value:'other', label:'Other', icon:'📝' },
] as const;

const STATUS_MAP: Record<string,[string,string]> = {
  open:        ['#DBEAFE','#1E40AF'],
  in_progress: ['#FEF3C7','#92400E'],
  resolved:    ['#DCFCE7','#14532D'],
  closed:      ['#F3F4F6','#374151'],
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
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        <div style={{ background:'linear-gradient(135deg,var(--forest),var(--forest-mid))', padding:'48px 0 80px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }} />
          <div className="container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
              <div>
                <div style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>MY ACCOUNT</div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>Help & Complaints</h1>
              </div>
              <button onClick={() => setShowForm(true)} className="btn btn-primary">+ File a Complaint</button>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop:-44, paddingBottom:80 }}>
          {/* Support info */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
            {[
              { icon:'⏱️', label:'Response Time', value:'Under 24 hours' },
              { icon:'📞', label:'Support Hours', value:'Mon–Sat, 9 AM–7 PM' },
              { icon:'✅', label:'Resolution Rate', value:'98% satisfied' },
            ].map(c => (
              <div key={c.label} style={{ background:'#fff', borderRadius:20, padding:'20px', border:'1px solid var(--border)', textAlign:'center' }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:4, color:'var(--forest)' }}>{c.value}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {cLoad ? Array(3).fill(null).map((_,i) => <div key={i} className="skeleton" style={{ height:100, borderRadius:18, marginBottom:12 }} />) :
            complaints.length === 0 ? (
              <div style={{ background:'#fff', borderRadius:24, padding:'64px 24px', textAlign:'center', border:'2px dashed var(--border)' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:16 }}>💬</div>
                <h3 style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:8 }}>No complaints filed</h3>
                <p style={{ color:'var(--text-muted)', marginBottom:24, maxWidth:320, margin:'0 auto 24px' }}>Had an issue? We're here to help. File a complaint and we'll resolve it within 24 hours.</p>
                <button onClick={() => setShowForm(true)} className="btn btn-forest">File a Complaint</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {complaints.map((c: any, i: number) => {
                  const [bg, color] = STATUS_MAP[c.status] ?? ['#F3F4F6','#374151'];
                  const typeInfo = TYPES.find(t => t.value === c.type);
                  return (
                    <div key={c.id} style={{ background:'#fff', borderRadius:20, padding:'20px 24px', border:'1px solid var(--border)', animation:`fade-up 0.5s var(--ease) ${i*60}ms both` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:'1.3rem' }}>{typeInfo?.icon ?? '📝'}</span>
                          <div>
                            <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{typeInfo?.label ?? c.type}</div>
                            <div style={{ fontSize:'0.73rem', color:'var(--text-faint)', marginTop:2 }}>Filed {c.created_at && new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                          </div>
                        </div>
                        <span style={{ display:'inline-flex', padding:'3px 12px', borderRadius:99, fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', background:bg, color }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize:'0.875rem', color:'var(--text-muted)', lineHeight:1.65 }}>{c.description}</p>
                      {c.resolution && (
                        <div style={{ marginTop:12, padding:'12px 14px', background:'rgba(22,163,74,0.06)', borderRadius:12, borderLeft:'3px solid var(--ok)' }}>
                          <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--ok)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:5 }}>Resolution</div>
                          <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.65 }}>{c.resolution}</p>
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
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth:540 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.5rem', marginBottom:6 }}>File a Complaint</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:24 }}>We take every complaint seriously and respond within 24 hours</p>

            <div style={{ marginBottom:20 }}>
              <label className="form-label">Issue Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {TYPES.map(t => (
                  <button key={t.value} onClick={() => setType(t.value)}
                    style={{ padding:'10px 8px', borderRadius:12, border:`1.5px solid ${type === t.value ? 'var(--forest)' : 'var(--border)'}`, background: type === t.value ? 'rgba(11,61,46,0.06)' : '#fff', cursor:'pointer', fontFamily:'var(--font-body)', textAlign:'center', transition:'all 0.15s' }}>
                    <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{t.icon}</div>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, color: type === t.value ? 'var(--forest)' : 'var(--text-2)' }}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label className="form-label">Priority</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['low','medium','high'] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    style={{ flex:1, padding:'9px', borderRadius:12, border:`1.5px solid ${priority === p ? 'var(--forest)' : 'var(--border)'}`, background: priority === p ? 'rgba(11,61,46,0.06)' : '#fff', color: priority === p ? 'var(--forest)' : 'var(--text-muted)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer', fontFamily:'var(--font-body)', textTransform:'capitalize', transition:'all 0.15s' }}>
                    {p === 'low' ? '🟢' : p === 'medium' ? '🟡' : '🔴'} {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Describe the Issue *</label>
              <textarea className="form-input" rows={4} placeholder="Please provide as much detail as possible..." value={desc} onChange={e => setDesc(e.target.value)} style={{ resize:'vertical' }} />
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={!desc.trim() || createMut.isPending}
                className="btn btn-forest" style={{ flex:2, justifyContent:'center', opacity: (!desc.trim() || createMut.isPending) ? 0.5 : 1 }}>
                {createMut.isPending ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
      <style>{`@media(max-width:640px){div[style*="grid-template-columns: repeat(3,1fr)"]{grid-template-columns:repeat(2,1fr) !important;}}`}</style>
    </>
  );
}
