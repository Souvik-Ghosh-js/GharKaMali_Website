'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { checkServiceability, getPlans, getAddons, createBooking, createSubscription } from '@/lib/api';

type Step = 'location'|'plan'|'addons'|'schedule'|'confirm';
const STEPS: Step[] = ['location','plan','addons','schedule','confirm'];
const LABELS = ['Location','Plan','Add-ons','Schedule','Confirm'];
const TIMES  = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

function Spin({ white=true }: { white?: boolean }) {
  return <div style={{ width:18,height:18,borderRadius:'50%',border:`2.5px solid ${white?'rgba(255,255,255,0.3)':'rgba(11,61,46,0.2)'}`,borderTopColor:white?'#fff':'var(--forest)',animation:'spin 0.7s linear infinite',flexShrink:0 }} />;
}

function BookFlow() {
  const router   = useRouter();
  const params   = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const preselect = params.get('plan') ? parseInt(params.get('plan')!) : 0;

  const [step, setStep] = useState<Step>('location');
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zone, setZone] = useState<any>(null);
  const [form, setForm] = useState({
    address:'', lat:0, lng:0, plan_id:preselect,
    plant_count:5, scheduled_date:'', scheduled_time:'09:00',
    addons:[] as {addon_id:number;quantity:number}[],
    auto_renew:true, notes:'',
  });

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/book'); }, [isAuthenticated, isLoading]);

  const { data: plansRaw } = useQuery({ queryKey:['plans'], queryFn:getPlans });
  const { data: addonsRaw } = useQuery({ queryKey:['addons'], queryFn:getAddons });
  const plans:any[]  = (plansRaw as any[]) ?? [];
  const addons:any[] = (addonsRaw as any[]) ?? [];
  const selectedPlan = plans.find((p:any) => p.id === form.plan_id);
  const stepIdx = STEPS.indexOf(step);

  const doCheck = async (lat:number, lng:number) => {
    setChecking(true);
    try {
      const res:any = await checkServiceability(lat, lng);
      if (res?.serviceable) {
        const z = res.zones?.[0] ?? res.zone;
        setZone(z); setForm(f=>({...f,lat,lng}));
        toast.success(`We serve ${z?.name ?? 'your area'}`);
        setStep('plan');
      } else { toast.error('Sorry, we don\'t serve this location yet.'); }
    } catch { toast.error('Could not verify location. Please try again.'); }
    finally { setChecking(false); }
  };

  const tryLocation = async () => {
    if (!form.address.trim()) { toast.error('Please enter your service address'); return; }
    if (form.lat && form.lng) { await doCheck(form.lat, form.lng); return; }
    if (!navigator.geolocation) { toast.error('GPS not supported on this device'); return; }
    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      async pos => { await doCheck(pos.coords.latitude, pos.coords.longitude); },
      () => { setChecking(false); toast.error('Could not detect your location. Please allow GPS access and try again.'); }
    );
  };

  const toggleAddon = (id:number) => setForm(f => ({
    ...f, addons: f.addons.some(a=>a.addon_id===id) ? f.addons.filter(a=>a.addon_id!==id) : [...f.addons,{addon_id:id,quantity:1}]
  }));

  const total = (() => {
    let t = selectedPlan?.price ?? 0;
    form.addons.forEach(({addon_id}) => { const a=addons.find(x=>x.id===addon_id); if(a)t+=a.price??0; });
    return t;
  })();

  const handleSubmit = async () => {
    if (!selectedPlan || !zone) return;
    setSubmitting(true);
    try {
      if (selectedPlan.plan_type === 'subscription') {
        await createSubscription({ plan_id:form.plan_id, zone_id:zone.id, service_address:form.address, service_latitude:form.lat, service_longitude:form.lng, plant_count:form.plant_count, auto_renew:form.auto_renew });
        toast.success('Subscription activated! Visits will be auto-scheduled.');
        router.push('/subscriptions');
      } else {
        const res:any = await createBooking({ zone_id:zone.id, scheduled_date:form.scheduled_date, scheduled_time:form.scheduled_time, service_address:form.address, service_latitude:form.lat, service_longitude:form.lng, plant_count:form.plant_count, customer_notes:form.notes });
        toast.success('Booking confirmed!');
        router.push(res?.id ? `/bookings/${res.id}` : '/bookings');
      }
    } catch(e:any) { toast.error(e.message||'Booking failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const minDate = () => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; };

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', minHeight:'100svh', paddingTop:'var(--nav-h)' }}>
        {/* Progress bar */}
        <div className="step-bar">
          <div className="container-sm">
            <div style={{ display:'flex', alignItems:'center' }}>
              {STEPS.map((s,i)=>{
                const done=i<stepIdx, active=i===stepIdx;
                return (
                  <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
                    <div className="step-item">
                      <div className={`step-circle ${done?'done':active?'active':'pending'}`}>
                        {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
                      </div>
                      <span className={`step-label ${active?'active':''}`}>{LABELS[i]}</span>
                    </div>
                    {i<STEPS.length-1 && <div className="step-connector" style={{ background: done?'var(--forest)':'var(--border)' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container-sm" style={{ padding:'40px clamp(20px,4vw,48px) 80px' }}>
          {/* ── LOCATION ── */}
          {step==='location' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'2rem', marginBottom:6, letterSpacing:'-0.02em' }}>Where do you need us?</h2>
              <p style={{ color:'var(--text-muted)', marginBottom:32, fontSize:'0.95rem' }}>We'll instantly check if your area is serviceable</p>
              <div style={{ background:'#fff', borderRadius:28, padding:32, border:'1px solid var(--border)', boxShadow:'var(--sh-sm)' }}>
                <div className="form-group">
                  <label className="form-label">Service Address *</label>
                  <textarea className="form-input" rows={3} placeholder="House/Flat No., Street, Area, City, Pincode" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} style={{ resize:'vertical' }}/>
                </div>
                <button onClick={tryLocation} disabled={checking||!form.address.trim()}
                  className="btn btn-forest w-full" style={{ justifyContent:'center', padding:'14px', opacity:(checking||!form.address.trim())?.6:1 }}>
                  {checking ? <><Spin /> Checking serviceability…</> : 'Check My Location →'}
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN ── */}
          {step==='plan' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <button onClick={()=>setStep('location')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:16,padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
              </button>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
                <div>
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'2rem', marginBottom:4, letterSpacing:'-0.02em' }}>Choose your plan</h2>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'rgba(11,61,46,0.08)', borderRadius:99, fontSize:'0.78rem', fontWeight:600, color:'var(--forest)' }}>
                    {zone?.name ?? 'Your Area'}
                  </div>
                </div>
                {/* Plant count */}
                <div style={{ background:'#fff', borderRadius:18, padding:'12px 18px', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-2)' }}>Plants:</span>
                  <button onClick={()=>setForm(f=>({...f,plant_count:Math.max(1,f.plant_count-1)}))} style={{ width:28,height:28,borderRadius:'50%',border:'1.5px solid var(--border)',background:'#fff',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
                  <span style={{ fontWeight:800, fontSize:'1.1rem', minWidth:20, textAlign:'center' }}>{form.plant_count}</span>
                  <button onClick={()=>setForm(f=>({...f,plant_count:f.plant_count+1}))} style={{ width:28,height:28,borderRadius:'50%',border:'1.5px solid var(--forest)',background:'rgba(11,61,46,0.06)',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--forest)' }}>+</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {plans.length===0 ? Array(3).fill(null).map((_,i)=><div key={i} className="skeleton" style={{height:200,borderRadius:22}}/>) :
                  plans.map((plan:any)=>{
                    const sel = form.plan_id===plan.id;
                    return (
                      <div key={plan.id} onClick={()=>setForm(f=>({...f,plan_id:plan.id}))}
                        style={{ padding:24,borderRadius:22,border:`2px solid ${sel?'var(--forest)':'var(--border)'}`,background:sel?'rgba(11,61,46,0.03)':'#fff',cursor:'pointer',transition:'all 0.25s var(--ease)',position:'relative',boxShadow:sel?'0 0 0 4px rgba(11,61,46,0.1)':'none' }}>
                        {sel && <div style={{ position:'absolute',top:12,right:12,width:24,height:24,borderRadius:'50%',background:'var(--forest)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>}
                        <span className={`badge ${plan.plan_type==='subscription'?'badge-forest':'badge-gold'}`} style={{marginBottom:12}}>{plan.plan_type==='subscription'?'Subscription':'One-Time'}</span>
                        <h3 style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.1rem',margin:'10px 0 6px' }}>{plan.name}</h3>
                        {plan.visits_per_month && <div style={{ fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:12 }}>{plan.visits_per_month} visits/mo · max {plan.max_plants??'∞'} plants</div>}
                        <div style={{ fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:900,color:'var(--forest)' }}>
                          ₹{plan.price?.toLocaleString('en-IN')}<span style={{ fontSize:'0.82rem',fontWeight:400,color:'var(--text-muted)' }}>/{plan.plan_type==='subscription'?'mo':'visit'}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:24 }}>
                <button onClick={()=>setStep('addons')} disabled={!form.plan_id}
                  className="btn btn-forest" style={{ opacity:!form.plan_id?.5:1 }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── ADD-ONS ── */}
          {step==='addons' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <button onClick={()=>setStep('plan')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:16,padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
              </button>
              <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'2rem',marginBottom:6,letterSpacing:'-0.02em' }}>Enhance your visit</h2>
              <p style={{ color:'var(--text-muted)',marginBottom:28,fontSize:'0.95rem' }}>Optional extras to get the most from your gardener's time</p>
              {addons.length===0 ? <p style={{ color:'var(--text-muted)',padding:'24px 0' }}>No add-ons available currently.</p> : (
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:14,marginBottom:28 }}>
                  {addons.map((addon:any)=>{
                    const sel = form.addons.some(a=>a.addon_id===addon.id);
                    return (
                      <div key={addon.id} onClick={()=>toggleAddon(addon.id)}
                        style={{ padding:20,borderRadius:20,border:`2px solid ${sel?'var(--forest)':'var(--border)'}`,background:sel?'rgba(11,61,46,0.03)':'#fff',cursor:'pointer',transition:'all 0.25s var(--ease)',position:'relative' }}>
                        {sel && <div style={{ position:'absolute',top:10,right:10,width:22,height:22,borderRadius:'50%',background:'var(--forest)',display:'flex',alignItems:'center',justifyContent:'center' }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg></div>}
                        <div style={{ fontWeight:700,fontSize:'0.95rem',marginBottom:5 }}>{addon.name}</div>
                        {addon.description && <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',lineHeight:1.6,marginBottom:10 }}>{addon.description}</div>}
                        <div style={{ fontFamily:'var(--font-display)',fontWeight:800,color:'var(--forest)',fontSize:'1.05rem' }}>+₹{addon.price?.toLocaleString('en-IN')}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <button onClick={()=>setStep('schedule')} style={{ background:'none',border:'none',color:'var(--text-muted)',fontFamily:'var(--font-body)',cursor:'pointer',fontWeight:500 }}>Skip for now</button>
                <button onClick={()=>setStep('schedule')} className="btn btn-forest">Continue ({form.addons.length} selected) →</button>
              </div>
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {step==='schedule' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <button onClick={()=>setStep('addons')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:16,padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
              </button>
              <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'2rem',marginBottom:6,letterSpacing:'-0.02em' }}>
                {selectedPlan?.plan_type==='subscription' ? 'Confirm your subscription' : 'When should we come?'}
              </h2>
              <p style={{ color:'var(--text-muted)',marginBottom:28,fontSize:'0.95rem' }}>
                {selectedPlan?.plan_type==='subscription' ? 'Visits are auto-scheduled Mon–Sat based on available gardeners' : 'Choose your preferred date and time slot'}
              </p>
              <div style={{ background:'#fff',borderRadius:28,padding:32,border:'1px solid var(--border)',boxShadow:'var(--sh-sm)' }}>
                {selectedPlan?.plan_type!=='subscription' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Preferred Date *</label>
                      <input type="date" className="form-input" min={minDate()} value={form.scheduled_date} onChange={e=>setForm(f=>({...f,scheduled_date:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Time</label>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
                        {TIMES.map(t=>(
                          <button key={t} onClick={()=>setForm(f=>({...f,scheduled_time:t}))}
                            style={{ padding:'10px 0',borderRadius:12,border:`1.5px solid ${form.scheduled_time===t?'var(--forest)':'var(--border)'}`,background:form.scheduled_time===t?'rgba(11,61,46,0.06)':'#fff',color:form.scheduled_time===t?'var(--forest)':'var(--text-2)',fontWeight:600,fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',transition:'all 0.2s' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Notes for Gardener <span style={{ color:'var(--text-faint)',fontWeight:400 }}>(optional)</span></label>
                  <textarea className="form-input" rows={3} placeholder="Any specific instructions, pet/allergy warnings, access codes..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ resize:'vertical' }} />
                </div>
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:20 }}>
                <button onClick={()=>setStep('confirm')} disabled={selectedPlan?.plan_type!=='subscription'&&!form.scheduled_date}
                  className="btn btn-forest" style={{ opacity:(selectedPlan?.plan_type!=='subscription'&&!form.scheduled_date)?.5:1 }}>
                  Review & Confirm →
                </button>
              </div>
            </div>
          )}

          {/* ── CONFIRM ── */}
          {step==='confirm' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <button onClick={()=>setStep('schedule')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:16,padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
              </button>
              <h2 style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'2rem',marginBottom:28,letterSpacing:'-0.02em' }}>Review your booking</h2>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:24 }}>
                <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                  {/* Location */}
                  <div style={{ background:'#fff',borderRadius:22,padding:22,border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Service Location</div>
                    <p style={{ fontSize:'0.9rem',lineHeight:1.6 }}>{form.address}</p>
                    {zone && <div style={{ display:'inline-flex',alignItems:'center',gap:6,marginTop:10,padding:'4px 12px',background:'rgba(11,61,46,0.08)',borderRadius:99,fontSize:'0.78rem',fontWeight:600,color:'var(--forest)' }}>Zone: {zone.name}</div>}
                  </div>
                  {/* Plan */}
                  <div style={{ background:'#fff',borderRadius:22,padding:22,border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Plan Details</div>
                    <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1.05rem',marginBottom:4 }}>{selectedPlan?.name}</div>
                    <div style={{ fontSize:'0.85rem',color:'var(--text-muted)' }}>{form.plant_count} plants · {selectedPlan?.plan_type==='subscription'?`${selectedPlan?.visits_per_month} visits/month`:'Single visit'}</div>
                  </div>
                  {/* Schedule */}
                  {selectedPlan?.plan_type!=='subscription'&&form.scheduled_date && (
                    <div style={{ background:'#fff',borderRadius:22,padding:22,border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10 }}>Schedule</div>
                      <div style={{ fontWeight:600,fontSize:'0.9rem' }}>{new Date(form.scheduled_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} at {form.scheduled_time}</div>
                    </div>
                  )}
                  {/* Add-ons */}
                  {form.addons.length>0 && (
                    <div style={{ background:'#fff',borderRadius:22,padding:22,border:'1px solid var(--border)' }}>
                      <div style={{ fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Add-ons</div>
                      {form.addons.map(({addon_id})=>{
                        const a=addons.find(x=>x.id===addon_id);
                        return a?<div key={addon_id} style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:'0.875rem' }}><span>{a.name}</span><span style={{ fontWeight:600 }}>₹{a.price}</span></div>:null;
                      })}
                    </div>
                  )}
                </div>

                {/* Summary box */}
                <div>
                  <div style={{ background:'#fff',borderRadius:24,padding:26,border:'1px solid var(--border)',boxShadow:'var(--sh-sm)',position:'sticky',top:'calc(var(--nav-h) + 100px)' }}>
                    <h3 style={{ fontWeight:700,fontSize:'1rem',marginBottom:20 }}>Order Summary</h3>
                    <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20,paddingBottom:16,borderBottom:'2px solid var(--border)' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.875rem' }}>
                        <span style={{ color:'var(--text-muted)' }}>{selectedPlan?.name}</span>
                        <span style={{ fontWeight:600 }}>₹{selectedPlan?.price?.toLocaleString('en-IN')}</span>
                      </div>
                      {form.addons.map(({addon_id})=>{
                        const a=addons.find(x=>x.id===addon_id);
                        return a?<div key={addon_id} style={{ display:'flex',justifyContent:'space-between',fontSize:'0.875rem' }}><span style={{ color:'var(--text-muted)' }}>{a.name}</span><span style={{ fontWeight:600 }}>₹{a.price}</span></div>:null;
                      })}
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:24 }}>
                      <span style={{ fontWeight:700,fontSize:'1rem' }}>Total</span>
                      <span style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.5rem',color:'var(--forest)' }}>
                        ₹{total.toLocaleString('en-IN')}{selectedPlan?.plan_type==='subscription'&&<span style={{ fontSize:'0.75rem',fontWeight:500,color:'var(--text-muted)' }}>/mo</span>}
                      </span>
                    </div>
                    <button onClick={handleSubmit} disabled={submitting}
                      className="btn btn-forest w-full" style={{ justifyContent:'center',padding:'14px',opacity:submitting?.7:1 }}>
                      {submitting?<><Spin />Processing…</>:<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Confirm Booking</>}
                    </button>
                    <p style={{ fontSize:'0.72rem',color:'var(--text-faint)',textAlign:'center',marginTop:10 }}>By confirming you agree to our Terms of Service</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:800px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr !important;}} @media(max-width:480px){div[style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(3,1fr) !important;}}`}</style>
    </>
  );
}

export default function BookPage() {
  return <Suspense fallback={null}><BookFlow /></Suspense>;
}
