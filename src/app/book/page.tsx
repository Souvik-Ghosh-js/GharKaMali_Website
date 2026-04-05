'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Calendar from '@/components/Calendar';
import { useAuth } from '@/store/auth';
import { checkServiceability, getPlans, getAddons, createBooking, createSubscription, initiatePayment, getPreviousGardeners, checkGardenerAvailability } from '@/lib/api';
import { useCart } from '@/store/cart';

type Step = 'location'|'plan'|'addons'|'schedule'|'confirm';
const STEPS: Step[] = ['location','plan','addons','schedule','confirm'];
const LABELS = ['Location','Plan','Add-ons','Schedule','Confirm'];
const TIMES  = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

function Spin({ white=true }: { white?: boolean }) {
  return <div style={{ width:18,height:18,borderRadius:'50%',border:`2.5px solid ${white?'rgba(255,255,255,0.3)':'rgba(11,61,46,0.2)'}`,borderTopColor:white?'#fff':'var(--forest)',animation:'spin 0.7s linear infinite',flexShrink:0 }} />;
}

/* --- STEP ICONS --- */
const StepIcMap   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const StepIcPlan  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const StepIcPlus  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const StepIcCal   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const StepIcOk    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const StepIcUser  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const STEP_ICONS = [StepIcMap, StepIcPlan, StepIcPlus, StepIcCal, StepIcOk];

function BookFlow() {
  const router   = useRouter();
  const params   = useSearchParams();
  const qc       = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();
  const { addService } = useCart();
  const preselect = params.get('plan') ? parseInt(params.get('plan')!) : 0;

  const [step, setStep] = useState<Step>('location');
  const [coordMode, setCoordMode] = useState<'auto'|'manual'>('auto');
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payuData, setPayuData] = useState<any>(null);
  const [zone, setZone] = useState<any>(null);
  const [form, setForm] = useState({
    address:'', lat:0, lng:0, plan_id:preselect,
    plant_count:5, scheduled_date:'', scheduled_time:'09:00',
    addons:[] as {addon_id:number;quantity:number}[],
    auto_renew:true, notes:'', preferred_gardener_id: 0
  });

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/book'); }, [isAuthenticated, isLoading, router]);

  const { data: plansRaw } = useQuery({ queryKey:['plans'], queryFn:getPlans });
  const { data: addonsRaw } = useQuery({ queryKey:['addons'], queryFn:getAddons });
  const { data: prevGardeners = [] } = useQuery({ 
    queryKey:['prev-gardeners'], 
    queryFn:getPreviousGardeners,
    enabled: isAuthenticated
  });
  
  const typeFilter = params.get('type'); // e.g. 'one-time' or 'on-demand'
  
  const plans:any[] = ((plansRaw as any[]) ?? []).filter((p: any) => {
    if (typeFilter === 'one-time' || typeFilter === 'on-demand') return p.plan_type !== 'subscription';
    return true;
  });

  // Availability Check Effect
  useEffect(() => {
    if (form.scheduled_date && zone?.id && step === 'schedule') {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const slots = await checkGardenerAvailability(
            form.scheduled_date, 
            form.preferred_gardener_id || undefined, 
            zone.id
          );
          setAvailableSlots(slots);
          
          // Selection logic: if current time is not available, try to pick the first available one
          if (slots.length > 0 && !slots.includes(form.scheduled_time)) {
             setForm(f => ({ ...f, scheduled_time: slots[0] }));
          }
        } catch (e) {
          console.error('Failed to fetch slots', e);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [form.scheduled_date, form.preferred_gardener_id, zone?.id, step]);

  // Auto-select plan if only one exists in the filtered list (e.g. for on-demand)
  useEffect(() => {
    if (plans.length > 0 && !form.plan_id) {
      if (typeFilter === 'on-demand' || (typeFilter === 'one-time' && plans.length === 1)) {
        setForm(f => ({ ...f, plan_id: plans[0].id }));
      }
    }
  }, [plans, typeFilter, form.plan_id]);
  
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
        // If it's a specific on-demand request, we ALWAYS show the plan details step
        // Otherwise, if a plan was pre-selected (e.g. from the plans page), we can skip to addons
        if (typeFilter === 'on-demand') {
          setStep('plan');
        } else {
          setStep(form.plan_id ? 'addons' : 'plan');
        }
      } else { toast.error('Sorry, we don\'t serve this location yet.'); }
    } catch { toast.error('Could not verify location. Please try again.'); }
    finally { setChecking(false); }
  };

  const tryLocation = async () => {
    if (!form.address.trim()) { toast.error('Please enter your service address'); return; }
    if (coordMode === 'manual') {
      if (!form.lat || !form.lng) { toast.error('Please enter both latitude and longitude'); return; }
      await doCheck(form.lat, form.lng); return;
    }
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
    const planBase = Number(selectedPlan?.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : (selectedPlan?.price || 0));
    
    let extraPlants = 0;
    if (zone && form.plant_count > (zone.min_plants || 1)) {
      extraPlants = (form.plant_count - (zone.min_plants || 1)) * Number(zone.price_per_plant || 0);
    }

    const addonsBase = form.addons.reduce((sum, {addon_id}) => {
      const a = addons.find(x => x.id === addon_id);
      return sum + (Number(a?.price) || 0);
    }, 0);

    const val = planBase + extraPlants + addonsBase;
    return isNaN(val) ? 0 : val;
  })();

  const handleSubmit = async () => {
    if (!selectedPlan || !zone) return;
    setSubmitting(true);
    try {
      let bookingId = null;
      let subscriptionId = null;
      let amount = total;

      if (selectedPlan.plan_type === 'subscription') {
        const sub: any = await createSubscription({ 
          plan_id: form.plan_id, 
          zone_id: zone.id, 
          service_address: form.address, 
          service_latitude: form.lat, 
          service_longitude: form.lng, 
          plant_count: form.plant_count, 
          preferred_gardener_id: form.preferred_gardener_id || null,
          auto_renew: form.auto_renew 
        });
        subscriptionId = sub.id;
        amount = sub.amount_paid || selectedPlan.price;
      } else {
        const res: any = await createBooking({ 
          zone_id: zone.id, 
          scheduled_date: form.scheduled_date, 
          scheduled_time: form.scheduled_time, 
          service_address: form.address, 
          service_latitude: form.lat, 
          service_longitude: form.lng, 
          plant_count: form.plant_count, 
          preferred_gardener_id: form.preferred_gardener_id || null,
          customer_notes: form.notes 
        });
        bookingId = res.id;
        amount = res.total_amount || total;
      }

      // Initiate PayU Payment
      const payu = await initiatePayment({
        type: selectedPlan.plan_type === 'subscription' ? 'subscription' : 'booking',
        booking_id: bookingId,
        subscription_id: subscriptionId,
        amount: amount
      });

      if (payu?.mock_success) {
        setSubmitting(false);
        toast.success('Payment Successful! Redirecting...', { duration: 3000 });
        setTimeout(() => {
          router.push(payu.frontend_redirect);
        }, 1500);
        return;
      }

      if (payu?.data?.params) {
        setPayuData(payu.data);
        // We'll auto-submit the form in a useEffect
        toast.loading('Redirecting to payment gateway...');
      } else {
        throw new Error('Payment initiation failed');
      }

    } catch(e: any) { 
      toast.error(e.message || 'Booking failed. Please try again.'); 
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedPlan || !zone) return;
    
    addService({
      id: Math.floor(Date.now() / 1000), // temp unique id
      name: `${selectedPlan.name} (${form.plant_count} plants)`,
      price: total,
      mrp: total,
      category: 'Gardener Visit',
      icon: 'plant',
      bookingDetails: {
        plan_id: form.plan_id,
        zone_id: zone.id,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        service_address: form.address,
        service_latitude: form.lat,
        service_longitude: form.lng,
        plant_count: form.plant_count,
        addons: form.addons,
        notes: form.notes,
        price: total
      }
    });
    
    toast.success('Visit added to your cart!', { icon: '🧑‍🌾' });
  };

  // Auto-submit PayU form when data is ready
  useEffect(() => {
    if (payuData && payuData.params) {
      const form = document.getElementById('payu-form') as HTMLFormElement;
      if (form) form.submit();
    }
  }, [payuData]);

  const getLocalDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const minDate = () => { 
    const d = new Date(); 
    if (d.getHours() >= 14) {
      d.setDate(d.getDate() + 1); 
    }
    return getLocalDateString(d); 
  };

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', minHeight:'100svh', paddingTop:'var(--nav-h)', position:'relative' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.1 }} />
        {/* Progress bar */}
        <div className="step-bar">
          <div className="container">
            <div style={{ display:'flex', alignItems:'center' }}>
              {STEPS.map((s,i)=>{
                const done=i<stepIdx, active=i===stepIdx;
                return (
                  <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:'none' }}>
                    <div className="step-item">
                      <div className={`step-circle ${done?'done':active?'active':'pending'}`}>
                        {done ? <StepIcOk /> : <div style={{ transform: 'scale(1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {(() => {
                              const Icon = STEP_ICONS[i];
                              return <Icon />;
                            })()}
                        </div>}
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

        <div className="container" style={{ padding:'40px clamp(20px,4vw,48px) 80px', position: 'relative', zIndex: 10 }}>
          {/* ── LOCATION ── */}
          {step==='location' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2rem', marginBottom:6, letterSpacing:'-0.02em', color:'var(--forest)' }}>Where do you need us?</h2>
              <p style={{ color:'var(--sage)', marginBottom:32, fontSize:'1rem', fontWeight:500 }}>We'll instantly check if your area is serviceable</p>
              <div className="card" style={{ padding:36, borderRadius: 28 }}>
                <div className="form-group">
                  <label className="form-label">Service Address *</label>
                  <textarea rows={3} placeholder="House/Flat No., Street, Area, City, Pincode" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} 
                    style={{ width:'100%', minHeight:100, resize:'vertical', background:'#fff', border:'1px solid var(--border-mid)', borderRadius:18, padding:'18px', color:'var(--forest)', outline:'none', transition:'all 0.3s var(--ease)', fontSize:'1rem', fontWeight:500 }} 
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--border)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                {/* Coordinate mode toggle */}
                <div style={{ display:'flex', background:'var(--bg-elevated)', borderRadius:16, padding:5, marginBottom:20, gap:4, border:'1px solid var(--border)' }}>
                  {(['auto','manual'] as const).map(mode => (
                    <button key={mode} onClick={() => setCoordMode(mode)}
                      style={{ flex:1, padding:'12px 0', borderRadius:12, border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontWeight:800, fontSize:'0.9rem', transition:'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: coordMode === mode ? 'var(--forest)' : 'transparent',
                        color: coordMode === mode ? '#fff' : 'var(--sage)',
                        boxShadow: coordMode === mode ? 'var(--sh-sm)' : 'none' }}>
                      {mode === 'auto' ? <><StepIcMap /> GPS Detect</> : <><StepIcPlan /> Manual Entry</>}
                    </button>
                  ))}
                </div>
                {coordMode === 'manual' && (
                  <div className="form-row" style={{ marginBottom:20 }}>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Latitude</label>
                      <input type="number" step="any" placeholder="e.g. 12.9279" value={form.lat||''} onChange={e=>setForm(f=>({...f,lat:parseFloat(e.target.value)||0}))}
                        style={{ width:'100%', background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:'14px 18px', color:'var(--forest)', outline:'none', fontWeight:700 }} />
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label">Longitude</label>
                      <input type="number" step="any" placeholder="e.g. 77.6271" value={form.lng||''} onChange={e=>setForm(f=>({...f,lng:parseFloat(e.target.value)||0}))}
                        style={{ width:'100%', background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:'14px 18px', color:'var(--forest)', outline:'none', fontWeight:700 }} />
                    </div>
                  </div>
                )}
                <button onClick={tryLocation} disabled={checking||!form.address.trim()}
                  className="btn btn-primary w-full" style={{ justifyContent:'center', padding:'14px', opacity:(checking||!form.address.trim())?.6:1 }}>
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
                  <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'2rem', marginBottom:4, letterSpacing:'-0.02em', color: 'var(--forest)' }}>
                    {typeFilter === 'on-demand' ? 'Your On-demand Visit' : 'Choose your plan'}
                  </h2>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', background:'var(--bg-elevated)', borderRadius:99, fontSize:'0.82rem', fontWeight:800, color:'var(--forest)', border:'1px solid var(--border)' }}>
                    {zone?.name ?? 'Your Area'}
                  </div>
                </div>
                {/* Plant count */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ background:'var(--bg-elevated)', borderRadius:20, padding:'14px 20px', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14 }}>
                    <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--sage)' }}>Plants:</span>
                    <button onClick={()=>setForm(f=>({...f,plant_count:Math.max(1,f.plant_count-1)}))} style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--border)',background:'#fff',color:'var(--forest)',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900 }}>−</button>
                    <span style={{ fontWeight:900, fontSize:'1.3rem', minWidth:24, textAlign:'center', color:'var(--forest)', fontFamily:'var(--font-display)' }}>{form.plant_count}</span>
                    <button onClick={()=>setForm(f=>({...f,plant_count:f.plant_count+1}))} style={{ width:32,height:32,borderRadius:'50%',border:'1px solid var(--forest)',background:'var(--forest)',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900 }}>+</button>
                  </div>
                  {zone?.price_per_plant > 0 && form.plant_count > zone.min_plants && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>
                      +₹{zone.price_per_plant} per extra plant
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection: 'column', gap:20, position:'relative', zIndex: 10 }}>
                {plans.length===0 ? Array(3).fill(null).map((_,i)=><div key={i} className="card skeleton" style={{height:140, borderRadius:28}}/>) :
                  plans.map((plan:any)=>{
                    const sel = form.plan_id===plan.id;
                    let displayPrice = plan.price ?? 0;
                    if (plan.plan_type !== 'subscription' && zone?.base_price != null) {
                      displayPrice = parseFloat(zone.base_price);
                    }
                    return (
                      <div key={plan.id} onClick={()=>setForm(f=>({...f,plan_id:plan.id}))}
                        style={{ 
                          borderRadius:32, 
                          border:`2.5px solid ${sel?'var(--forest)':'var(--border)'}`, 
                          background: sel ? 'var(--bg-elevated)' : '#fff', 
                          cursor:'pointer', 
                          transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                          overflow:'hidden', 
                          boxShadow:sel?'var(--sh-md)':'var(--sh-xs)', 
                          transform:sel?'translateX(8px)':'translateX(0)', 
                          zIndex:sel?2:1, 
                          position:'relative', 
                          display:'flex', 
                          flexDirection: 'row',
                          alignItems: 'stretch',
                          minHeight: 160
                        }}>
                        
                        {plan.is_best_value === 1 && (
                          <div style={{ position:'absolute', top:0, left:0, background:'var(--gold)', color:'#fff', fontSize:'0.65rem', fontWeight:900, padding:'4px 16px', borderBottomRightRadius:12, textTransform:'uppercase', letterSpacing:'0.1em', zIndex: 10 }}>
                            Best Value
                          </div>
                        )}
              
                        {/* Left Info: Name & Price */}
                        <div style={{ padding:'40px 32px', display:'flex', flex: '1.2', flexDirection:'row', alignItems:'center', gap: 32, borderRight: '1px solid var(--border-light)' }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:'1.6rem', marginBottom:8, color: 'var(--forest)', letterSpacing: '-0.02em' }}>{plan.name}</h3>
                            <div style={{ fontSize:'0.9rem', fontWeight:600, color: 'var(--sage)' }}>
                              {plan.plan_summary || `Up to ${plan.max_plants} Healthy Plants`}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: 140 }}>
                            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'flex-end', color: 'var(--forest)', lineHeight:1 }}>
                              <span style={{ fontSize:'1rem', fontWeight:700, marginTop:6 }}>₹</span>
                              <span style={{ fontSize:'3rem', fontWeight:900, fontFamily: 'var(--font-display)' }}>{displayPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ fontSize:'0.75rem', fontWeight:800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                              {plan.price_subtitle || (plan.plan_type==='subscription'?'Per Month':'Per Visit')}
                            </div>
                          </div>
                        </div>
              
                        {/* Middle: Features Checklist */}
                        <div style={{ padding:'32px 40px', flex:'2', display:'flex', flexWrap: 'wrap', alignContent: 'center', gap:'12px 24px', background: sel ? 'rgba(11,61,46,0.02)' : 'transparent' }}>
                          {(Array.isArray(plan.features) ? plan.features.slice(0, 4) : []).map((feat:string, i:number) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize:'0.85rem', color:'var(--text-muted)', fontWeight:600, width: 'calc(50% - 12px)' }}>
                              <span style={{ color: 'var(--ok)', flexShrink: 0 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                              {feat}
                            </div>
                          ))}
                        </div>

                        {/* Right: Select Indicator */}
                        <div style={{ width: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid var(--border-light)', background: sel ? 'var(--forest)' : 'var(--bg-elevated)', transition: 'all 0.3s' }}>
                           <div style={{ 
                             width: 40, height: 40, borderRadius: '50%', 
                             background: sel ? '#fff' : 'transparent', 
                             border: `2px solid ${sel ? '#fff' : 'var(--border-mid)'}`,
                             display: 'flex', alignItems: 'center', justifyContent: 'center',
                             color: sel ? 'var(--forest)' : 'var(--text-faint)'
                           }}>
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                           </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:24 }}>
                <button onClick={()=>setStep('addons')} disabled={!form.plan_id}
                  className="btn btn-primary" style={{ opacity:!form.plan_id?.5:1 }}>
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
              <h2 style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2rem',marginBottom:6,letterSpacing:'-0.02em', color: 'var(--forest)' }}>Enhance your visit</h2>
              <p style={{ color:'var(--sage)',marginBottom:28,fontSize:'1rem',fontWeight:500 }}>Optional extras to get the most from your gardener's time</p>
              {addons.length===0 ? <p style={{ color:'var(--sage)',padding:'24px 0' }}>No add-ons available currently.</p> : (
                <div style={{ display:'flex', flexDirection: 'column', gap:12, marginBottom:28 }}>
                  {addons.map((addon:any)=>{
                    const sel = form.addons.some(a=>a.addon_id===addon.id);
                    return (
                      <div key={addon.id} onClick={()=>toggleAddon(addon.id)}
                        className="card"
                        style={{ 
                          padding:'20px 28px',
                          border:`2px solid ${sel?'var(--forest)':'var(--border)'}`,
                          background:sel?'var(--bg-elevated)':'#fff',
                          cursor:'pointer',
                          transition:'all 0.2s ease',
                          position:'relative',
                          borderRadius:24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 20
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            background: sel ? 'var(--forest)' : 'var(--bg-elevated)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: sel ? '#fff' : 'var(--forest)',
                            transition: 'all 0.25s'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div>
                            <div style={{ fontWeight:800,fontSize:'1.05rem', color:'var(--forest)' }}>{addon.name}</div>
                            {addon.description && <div style={{ fontSize:'0.85rem',color:'var(--sage)',fontWeight:500 }}>{addon.description}</div>}
                          </div>
                        </div>
                        <div style={{ fontFamily:'var(--font-display)',fontWeight:900,color:'var(--gold-deep)',fontSize:'1.2rem', minWidth: 100, textAlign: 'right' }}>
                          +₹{addon.price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <button onClick={()=>setStep('schedule')} style={{ background:'none',border:'none',color:'var(--text-muted)',fontFamily:'var(--font-body)',cursor:'pointer',fontWeight:500 }}>Skip for now</button>
                <button onClick={()=>setStep('schedule')} className="btn btn-primary">Continue ({form.addons.length} selected) →</button>
              </div>
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {step==='schedule' && (
            <div style={{ animation:'slide-up 0.4s var(--ease)' }}>
              <button onClick={()=>setStep('addons')} style={{ display:'flex',alignItems:'center',gap:5,background:'none',border:'none',color:'var(--text-muted)',fontSize:'0.85rem',cursor:'pointer',fontFamily:'var(--font-body)',marginBottom:16,padding:0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> Back
              </button>
              <h2 style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2rem',marginBottom:6,letterSpacing:'-0.02em', color:'var(--forest)' }}>
                {selectedPlan?.plan_type==='subscription' ? 'Confirm your subscription' : 'When should we come?'}
              </h2>
              <p style={{ color:'var(--sage)',marginBottom:20,fontSize:'1rem',fontWeight:500 }}>
                {selectedPlan?.plan_type==='subscription' ? 'You will be able to choose your visit dates after checkout' : 'Choose your preferred date and time slot'}
              </p>
              {selectedPlan?.plan_type!=='subscription' && form.scheduled_date && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'10px 20px', background:'var(--forest)', color:'#fff', borderRadius:16, marginBottom:24, fontSize:'0.9rem', fontWeight:800, animation:'fade-in 0.3s ease' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(form.scheduled_date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })} at {form.scheduled_time}
                </div>
              )}
              <div className="card" style={{ padding:36, borderRadius:28, marginBottom: 24 }}>
                {selectedPlan?.plan_type!=='subscription' && (
                  <>
                    {/* Gardener Selection */}
                    <div className="form-group" style={{ marginBottom: 32 }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Choose a Gardener
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)' }}>Optional</span>
                      </label>
                      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
                        {/* System Assign */}
                        <div onClick={() => setForm(f => ({ ...f, preferred_gardener_id: 0 }))}
                          style={{ 
                            minWidth: 100, padding: '16px 14px', borderRadius: 20, cursor: 'pointer', border: `2.5px solid ${form.preferred_gardener_id === 0 ? 'var(--forest)' : 'var(--border)'}`, 
                            background: form.preferred_gardener_id === 0 ? 'var(--bg-elevated)' : '#fff', transition: 'all 0.2s', textAlign: 'center', flexShrink: 0 
                          }}>
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-elevated)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--forest)' }}>Best Available</div>
                        </div>

                        {/* Previous Gardeners */}
                        {prevGardeners.map((g: any) => {
                          const sel = form.preferred_gardener_id === g.id;
                          return (
                            <div key={g.id} onClick={() => setForm(f => ({ ...f, preferred_gardener_id: g.id }))}
                              style={{ 
                                minWidth: 120, padding: '16px 14px', borderRadius: 20, cursor: 'pointer', border: `2.5px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, 
                                background: sel ? 'var(--bg-elevated)' : '#fff', transition: 'all 0.2s', textAlign: 'center', flexShrink: 0 
                              }}>
                              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <img src={g.profile_image || '/placeholder-user.png'} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
                                <span style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>★</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--sage)' }}>{g.gardenerProfile?.rating || 'New'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Select Date *</label>
                      <Calendar 
                        value={form.scheduled_date} 
                        onChange={d => setForm(f => ({ ...f, scheduled_date: d }))}
                        minDate={minDate()}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Time</label>
                      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10 }}>
                        {TIMES.map(t => {
                          const isAvailable = availableSlots.includes(t);
                          const isToday = form.scheduled_date === getLocalDateString(new Date());
                          const currentHour = new Date().getHours();
                          const isTooEarly = isToday && parseInt(t.split(':')[0]) < currentHour + 4;
                          const active = form.scheduled_time === t;

                          return (
                            <button key={t} onClick={() => isAvailable && !isTooEarly && setForm(f => ({ ...f, scheduled_time: t }))}
                              disabled={!isAvailable || isTooEarly}
                              style={{ 
                                padding: '12px 0', borderRadius: 14, border: `2px solid ${active ? 'var(--forest)' : isAvailable && !isTooEarly ? 'var(--border)' : 'var(--border-light)'}`, 
                                background: active ? 'var(--bg-elevated)' : isAvailable && !isTooEarly ? '#fff' : 'var(--bg-muted)', 
                                color: active ? 'var(--forest)' : isAvailable && !isTooEarly ? 'var(--sage)' : 'var(--text-faint)', 
                                fontWeight: 800, fontSize: '0.9rem', cursor: isAvailable && !isTooEarly ? 'pointer' : 'not-allowed', 
                                fontFamily: 'var(--font-body)', transition: 'all 0.2s', position: 'relative' 
                              }}>
                              {t}
                              {!isAvailable && !isTooEarly && <div style={{ position: 'absolute', bottom: -18, left: 0, right: 0, fontSize: '0.6rem', color: 'var(--error)', fontWeight: 700 }}>Busy</div>}
                            </button>
                          );
                        })}
                        {loadingSlots && <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: 10 }}><Spin white={false} /></div>}
                        {!loadingSlots && availableSlots.length === 0 && <div style={{ gridColumn: '1 / -1', color: 'var(--error)', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>No availability found for this date. Try another date or a different gardener.</div>}
                      </div>
                    </div>
                  </>
                )}
                <div className="form-group" style={{marginBottom:0}}>
                  <label className="form-label">Notes for Gardener <span style={{ color:'var(--text-faint)',fontWeight:400 }}>(optional)</span></label>
                  <textarea rows={3} placeholder="Any specific instructions, pet/allergy warnings, access codes..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} 
                    style={{ width:'100%', background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:'14px 18px', color:'var(--forest)', outline:'none', resize:'vertical', fontWeight:500 }} />
                </div>
              </div>
              <div style={{ display:'flex',justifyContent:'flex-end',marginTop:20 }}>
                <button onClick={()=>setStep('confirm')} disabled={selectedPlan?.plan_type!=='subscription'&&!form.scheduled_date}
                  className="btn btn-primary" style={{ opacity:(selectedPlan?.plan_type!=='subscription'&&!form.scheduled_date)?.5:1 }}>
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
                  <div className="card" style={{ padding:26, borderRadius:24 }}>
                    <div style={{ fontSize:'0.75rem',fontWeight:800,color:'var(--sage)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Service Location</div>
                    <p style={{ fontSize:'0.95rem',lineHeight:1.6, color:'var(--forest)', fontWeight:600 }}>{form.address}</p>
                    {zone && <div style={{ display:'inline-flex',alignItems:'center',gap:6,marginTop:10,padding:'6px 14px',background:'var(--bg-elevated)',borderRadius:99,fontSize:'0.82rem',fontWeight:700,color:'var(--forest)',border:'1px solid var(--border)' }}>Zone: {zone.name}</div>}
                  </div>
                  {/* Plan */}
                  <div className="card" style={{ padding:26, borderRadius:24 }}>
                    <div style={{ fontSize:'0.75rem',fontWeight:800,color:'var(--sage)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Plan Details</div>
                    <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.15rem',marginBottom:6, color:'var(--forest)' }}>{selectedPlan?.name}</div>
                    <div style={{ fontSize:'0.9rem',color:'var(--sage)',fontWeight:600 }}>{form.plant_count} plants · {selectedPlan?.plan_type==='subscription'?`${selectedPlan?.visits_per_month} visits/month`:'Single visit'}</div>
                  </div>
                  {/* Schedule */}
                  {selectedPlan?.plan_type!=='subscription'&&form.scheduled_date && (
                    <div className="card" style={{ padding:26, borderRadius:24 }}>
                      <div style={{ fontSize:'0.75rem',fontWeight:800,color:'var(--sage)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12 }}>Schedule</div>
                      <div style={{ fontWeight:700,fontSize:'0.95rem', color:'var(--forest)' }}>{new Date(form.scheduled_date).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} at {form.scheduled_time}</div>
                    </div>
                  )}
                  {/* Add-ons */}
                  {form.addons.length>0 && (
                    <div className="card" style={{ padding:26, borderRadius:24 }}>
                      <div style={{ fontSize:'0.75rem',fontWeight:800,color:'var(--sage)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:14 }}>Add-ons</div>
                      {form.addons.map(({addon_id})=>{
                        const a=addons.find(x=>x.id===addon_id);
                        return a?<div key={addon_id} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:'0.95rem', color:'var(--forest)',fontWeight:600 }}><span>{a.name}</span><span style={{ fontWeight:800, color: 'var(--gold-deep)' }}>+₹{a.price}</span></div>:null;
                      })}
                    </div>
                  )}
                </div>

                {/* Summary box */}
                <div>
                  <div className="card" style={{ padding:32, position:'sticky', top:'calc(var(--nav-h) + 40px)', border: '2px solid var(--border)', borderRadius:28, boxShadow: 'var(--sh-md)' }}>
                    <h3 style={{ fontWeight:900,fontSize:'1.2rem',marginBottom:24, color:'var(--forest)', fontFamily:'var(--font-display)' }}>Order Summary</h3>
                    <div style={{ display:'flex',flexDirection:'column',gap:14,marginBottom:24,paddingBottom:24,borderBottom:'1px solid var(--border-mid)' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.95rem' }}>
                        <span style={{ color:'var(--sage)', fontWeight:600 }}>{selectedPlan?.name || 'Visit Base Price'}</span>
                        <span style={{ fontWeight:800, color:'var(--forest)' }}>₹{Number(selectedPlan?.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : (selectedPlan?.price ?? 0)).toLocaleString('en-IN')}</span>
                      </div>
                      {zone && form.plant_count > (zone.min_plants || 1) && (
                        <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.95rem' }}>
                          <span style={{ color:'var(--sage)', fontWeight:600 }}>Extra Plants ({form.plant_count - zone.min_plants})</span>
                          <span style={{ fontWeight:800, color:'var(--forest)' }}>+₹{Number((form.plant_count - zone.min_plants) * (parseFloat(zone.price_per_plant) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {form.addons.map(({addon_id})=>{
                        const a=addons.find(x=>x.id===addon_id);
                        return a?<div key={addon_id} style={{ display:'flex',justifyContent:'space-between',fontSize:'0.95rem' }}><span style={{ color:'var(--sage)', fontWeight:600 }}>{a.name}</span><span style={{ fontWeight:800, color:'var(--forest)' }}>+₹{Number(a.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>:null;
                      })}
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:32 }}>
                      <span style={{ fontWeight:900,fontSize:'1.2rem', color:'var(--forest)' }}>TOTAL TO PAY (FIXED)</span>
                      <span style={{ fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2rem',color:'var(--gold-deep)' }}>
                        ₹{Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{selectedPlan?.plan_type==='subscription'&&<span style={{ fontSize:'0.8rem',fontWeight:500,color:'var(--sage)' }}>/mo</span>}
                      </span>
                    </div>
                    {/* Market Upsell */}
                    <div style={{ background:'rgba(212,163,115,0.08)', border:'1.5px dashed var(--gold)', borderRadius:20, padding:'16px 20px', marginBottom:20 }}>
                       <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-deep)" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          <span style={{ fontWeight:800, fontSize:'0.85rem', color:'var(--gold-deep)' }}>Professional Tip</span>
                       </div>
                       <p style={{ fontSize:'0.8rem', color:'var(--sage)', fontWeight:600, lineHeight:1.5, marginBottom:12 }}>
                         Garden needs more life? Pick fresh organic plants from our marketplace and have them delivered before your visit!
                       </p>
                       <button onClick={() => router.push('/shop')} style={{ background:'var(--gold-deep)', color:'#fff', border:'none', padding:'8px 16px', borderRadius:99, fontSize:'0.75rem', fontWeight:800, cursor:'pointer', transition:'all 0.2s' }}
                         onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                         onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                         Visit Marketplace →
                       </button>
                    </div>

                    <button onClick={handleAddToCart}
                      className="btn btn-outline w-full" style={{ justifyContent:'center',padding:'14px', marginBottom:12, borderColor:'var(--forest)', color:'var(--forest)', fontWeight:800 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> 
                      Add to Cart & Shop Plants
                    </button>

                    <button onClick={handleSubmit} disabled={submitting}
                      className="btn btn-primary w-full" style={{ justifyContent:'center',padding:'16px',opacity:submitting?.7:1 }}>
                      {submitting?<><Spin />Processing…</>:<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Pay Now</>}
                    </button>
                    <p style={{ fontSize:'0.7rem',color:'var(--text-faint)',textAlign:'center',marginTop:14, lineHeight:1.5 }}>Payments are secure and encrypted.<br/>Tax included in total amount.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Hidden PayU Form */}
      {payuData && (
        <form id="payu-form" action={payuData.payu_url} method="POST" style={{ display: 'none' }}>
          {Object.entries(payuData.params).map(([key, val]: [string, any]) => (
            <input key={key} type="hidden" name={key} value={val} />
          ))}
        </form>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:800px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr !important;}} @media(max-width:480px){div[style*="grid-template-columns: repeat(4,1fr)"]{grid-template-columns:repeat(3,1fr) !important;}}`}</style>
    </>
  );
}

export default function BookPage() {
  return <Suspense fallback={null}><BookFlow /></Suspense>;
}
