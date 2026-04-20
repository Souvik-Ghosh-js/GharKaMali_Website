'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { checkServiceability, getPlans, getAddons, createBooking, createSubscription, initiatePayment, getPreviousGardeners, checkGardenerAvailability, addBookingAddons } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/store/location';
const AddressPicker = dynamic(() => import('@/components/AddressPicker'), { ssr: false });

type ModalType = 'location' | 'plan' | 'addons' | 'schedule';
const TIMES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

const IcArrow = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IcChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>;
const IcX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

function StepHeader({ num, title, active, done, onClick, locked }: { num: number; title: string; active: boolean; done: boolean; onClick: () => void; locked: boolean }) {
  return (
    <div
      onClick={!locked ? onClick : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '24px 0',
        cursor: locked ? 'default' : 'pointer',
        borderBottom: active ? 'none' : '1px solid var(--border-gold)',
        opacity: locked ? 0.3 : 1,
        transition: 'all 0.4s var(--ease)'
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: done ? 'var(--forest)' : active ? 'var(--forest-mid)' : 'var(--bg-elevated)',
        color: done || active ? '#fff' : 'var(--forest)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem',
        boxShadow: active ? '0 0 20px rgba(3,65,26,0.25)' : 'none',
        transition: 'all 0.3s',
        flexShrink: 0
      }}>
        {done ? <IcCheck /> : num}
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--forest)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      {done && !active && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500, color: 'var(--sage)', textTransform: 'uppercase' }}>Change</span>}
    </div>
  );
}

function BookFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, isLoading, updateUser } = useAuth();
  const preselectId = params.get('plan') ? parseInt(params.get('plan')!) : 0;

  const { zone: globalZone, lat: globalLat, lng: globalLng, setCoords, setZone: setGlobalZone } = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zone, setZone] = useState<any>(globalZone);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<'current' | 'other'>('current');
  const [form, setForm] = useState({
    address: '', lat: 0, lng: 0, plan_id: preselectId,
    plant_count: 5, scheduled_date: '', scheduled_time: '09:00',
    addons: [] as { addon_id: number; quantity: number }[],
    auto_renew: true, notes: '', preferred_gardener_id: 0
  });

  const [addrFields, setAddrFields] = useState({ roomNo: '', building: '', area: '', city: '', state: 'Uttar Pradesh', pincode: '' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const { data: plansRaw } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const { data: addonsRaw } = useQuery({ queryKey: ['addons'], queryFn: getAddons });
  const { addService } = useCart();

  const plans: any[] = (plansRaw as any[]) ?? [];
  const addons: any[] = (addonsRaw as any[]) ?? [];
  const selectedPlan = plans.find(p => p.id === form.plan_id);

  // Auto-advance if plan is preselected
  useEffect(() => {
    if (preselectId > 0 && plans.length > 0 && activeStep === 0 && zone) {
      // Only advance once we have zone AND plan
    }
  }, [preselectId, plans, zone]);

  const updateAddr = (patch: Partial<typeof addrFields>) => {
    const next = { ...addrFields, ...patch };
    setAddrFields(next);
    const parts = [next.roomNo, next.building, next.area, next.city, next.state, next.pincode].filter(Boolean);
    setForm(f => ({ ...f, address: parts.join(', ') }));
  };


  const toggleAddon = (id: number) => {
    setForm(f => ({
      ...f, addons: f.addons.some(a => a.addon_id === id) ? f.addons.filter(a => a.addon_id !== id) : [...f.addons, { addon_id: id, quantity: 1 }]
    }));
  };

  const total = (() => {
    const planBase = Number(selectedPlan?.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : (selectedPlan?.price || 0));
    const zMin = zone?.min_plants ?? 5;
    const extraPlants = (zone && form.plant_count > zMin) ? (form.plant_count - zMin) * Number(zone.price_per_plant || 0) : 0;
    const addonsTotal = form.addons.reduce((sum, { addon_id }) => {
      const a = addons.find(x => x.id === addon_id);
      return sum + (Number(a?.price) || 0);
    }, 0);
    return planBase + extraPlants + addonsTotal;
  })();
  const handleAddToCart = () => {
    if (!selectedPlan) return;
    addService({
      id: selectedPlan.id,
      name: `Gardener Visit: ${selectedPlan.name}`,
      price: total,
      mrp: total,
      category: 'Gardening',
      icon: '',
      bookingDetails: {
        plan_id: form.plan_id,
        plan_type: selectedPlan.plan_type,
        geofence_id: zone?.id,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        service_address: form.address,
        plant_count: form.plant_count,
        addons: form.addons,
        price: total
      }
    });
    router.push('/plans'); // Or stay on page, addService already opens the cart
  };

  const isSubscriptionPlan = selectedPlan?.plan_type === 'subscription';

  const handleFinish = async () => {
    if (!form.scheduled_date && !isSubscriptionPlan) { 
      toast.error('Please select a preferred visit date'); return; 
    }
    setSubmitting(true);
    try {
      const payload: any = {
        plan_id: form.plan_id,
        geofence_id: zone?.id,
        service_address: form.address,
        service_latitude: form.lat,
        service_longitude: form.lng,
        flat_no: addrFields.roomNo,
        building: addrFields.building,
        area: addrFields.area,
        city: addrFields.city,
        state: addrFields.state,
        pincode: addrFields.pincode,
        plant_count: form.plant_count,
        addon_ids: form.addons,
        addons: form.addons,
        total_amount: total,
        preferred_gardener_id: form.preferred_gardener_id || null,
        customer_notes: form.notes
      };

      let res: any;

      if (isSubscriptionPlan) {
        res = await createSubscription({
          ...payload,
          auto_renew: form.auto_renew
        });
        toast.success('Subscription created successfully!');
        router.push('/subscriptions');
      } else {
        res = await createBooking({
          ...payload,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
        });
        if (form.addons.length > 0) {
          try {
            await addBookingAddons(res.id, form.addons.map(a => ({ addon_id: a.addon_id, quantity: a.quantity })));
          } catch (e: any) {
            console.error('Failed to add addons', e);
            toast.error(`Booking created but add-ons failed: ${e?.message || 'unknown error'}`);
          }
        }
        toast.success('Booking Successful! (Test Mode)');
        router.push(`/bookings/${res.id}`);
      }
    } catch (err: any) { 
      console.error(err);
      toast.error(err?.message || 'Booking attempt failed. Please try again or contact support.'); 
      setSubmitting(false); 
    }
  };

  useEffect(() => {
    if (globalZone && !zone) {
      setZone(globalZone);
    }
  }, [globalZone, zone]);

  useEffect(() => {
    if (globalLat && globalLng && form.lat === 0 && form.lng === 0) {
      setForm(f => ({ ...f, lat: globalLat, lng: globalLng }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLat, globalLng]);

  useEffect(() => {
    if (form.scheduled_date && zone?.id) {
      setLoadingSlots(true);
      checkGardenerAvailability(form.scheduled_date, undefined, zone.id)
        .then(setAvailableSlots)
        .finally(() => setLoadingSlots(false));
    }
  }, [form.scheduled_date, zone]);

  // Constraints for plant count
  const minPlants = zone?.min_plants || 5;
  const isOnDemand = selectedPlan?.name?.toLowerCase().includes('demand') || selectedPlan?.plan_type === 'on_demand';
  const maxPlants = isOnDemand ? 1000 : (selectedPlan?.max_plants || 50);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #eef6ee 0%, #fffdf5 55%, #f5f0e8 100%)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Navbar />

      <main style={{ flex: 1, padding: 'calc(var(--nav-h) + 24px) 16px 100px', zIndex: 10 }}>
        <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 0 }}>

          <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 10px' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, color: 'var(--forest)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              {isSubscriptionPlan ? 'Subscribe to Plan' : 'Book Your Visit'}
            </h1>
            <p style={{ color: 'var(--sage)', fontWeight: 400, fontSize: '0.95rem', lineHeight: 1.5 }}>
              {isSubscriptionPlan ? 'Set up your monthly care plan — schedule individual visits from My Subscriptions.' : 'Professional botanical care for your flourishing garden.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* STEP 1: ADDRESS */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 0 ? '40px' : '0 40px', border: activeStep === 0 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 0 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden' }}>
              <StepHeader num={1} title="Service Address" active={activeStep === 0} done={activeStep > 0} onClick={() => setActiveStep(0)} locked={false} />
              <AnimatePresence>
                {activeStep === 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* Address Mode Toggle */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setAddressMode('current');
                            if (globalLat && globalLng) {
                              setForm(f => ({ ...f, lat: globalLat, lng: globalLng }));
                              if (globalZone) setZone(globalZone);
                            } else {
                              setPickerOpen(true);
                            }
                          }}
                          style={{
                            padding: '14px', borderRadius: 16,
                            border: `2px solid ${addressMode === 'current' ? 'var(--forest)' : 'var(--border)'}`,
                            background: addressMode === 'current' ? 'rgba(3,65,26,0.04)' : '#fff',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', marginBottom: 4 }}>📍 Current Location</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 600 }}>Service at where I am now</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddressMode('other'); setPickerOpen(true); }}
                          style={{
                            padding: '14px', borderRadius: 16,
                            border: `2px solid ${addressMode === 'other' ? 'var(--forest)' : 'var(--border)'}`,
                            background: addressMode === 'other' ? 'rgba(3,65,26,0.04)' : '#fff',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', marginBottom: 4 }}>🗺 Different Location</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--sage)', fontWeight: 600 }}>Pick on map (e.g. parent's home)</div>
                        </button>
                      </div>

                      {/* Picked-location preview */}
                      {form.lat !== 0 && form.lng !== 0 && (
                        <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px dashed var(--forest-mid)', borderRadius: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Service Pin</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.45 }}>
                              {form.address || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`}
                            </div>
                            {zone?.name && <div style={{ fontSize: '0.72rem', color: 'var(--forest-mid)', fontWeight: 700, marginTop: 4 }}>✓ {zone.name}</div>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid var(--forest)', background: '#fff', color: 'var(--forest)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
                          >
                            Change
                          </button>
                        </div>
                      )}

                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                        Additional details (so gardener finds you easily)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>ROOM / FLAT NO.</label><input placeholder="e.g. B-204" value={addrFields.roomNo} onChange={e => updateAddr({ roomNo: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>BUILDING / SOCIETY</label><input placeholder="e.g. ATS Pristine" value={addrFields.building} onChange={e => updateAddr({ building: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                      </div>
                      <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>AREA / LANDMARK</label><input placeholder="Sector 150" value={addrFields.area} onChange={e => updateAddr({ area: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>CITY</label><input placeholder="e.g. Noida" value={addrFields.city} onChange={e => updateAddr({ city: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>STATE</label>
                          <select value={addrFields.state} onChange={e => updateAddr({ state: e.target.value })}
                            style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600, background: '#fff', appearance: 'none', cursor: 'pointer' }}>
                            {['Uttar Pradesh','Delhi','Haryana','Rajasthan','Maharashtra','Karnataka','Tamil Nadu','West Bengal','Gujarat','Telangana','Other'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>PINCODE</label><input placeholder="201301" maxLength={6} value={addrFields.pincode} onChange={e => updateAddr({ pincode: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                      <button
                        onClick={() => {
                          if (form.lat === 0 || form.lng === 0) {
                            toast.error('Please pin your service location first');
                            setPickerOpen(true);
                            return;
                          }
                          if (!zone) {
                            toast.error('Selected location is not serviceable');
                            return;
                          }
                          setActiveStep(1);
                        }}
                        className="btn btn-primary"
                        style={{ marginTop: 12, width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: '0.85rem' }}
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 2: PLAN SELECTION */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 1 ? '40px' : '0 40px', border: activeStep === 1 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 1 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 1 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 1 ? 'none' : 'auto' }}>
              <StepHeader num={2} title="Choose Your Care Plan" active={activeStep === 1} done={activeStep > 1} onClick={() => setActiveStep(1)} locked={activeStep < 1} />
              <AnimatePresence>
                {activeStep === 1 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                      {plans.map(p => (
                        <div key={p.id} onClick={() => setForm(f => ({ ...f, plan_id: p.id }))}
                          style={{ padding: 24, borderRadius: 24, border: `2.5px solid ${form.plan_id === p.id ? 'var(--forest)' : 'var(--border)'}`, cursor: 'pointer', background: form.plan_id === p.id ? 'rgba(3,65,26,0.03)' : '#fff', transition: 'all 0.3s' }}>
                          <h3 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--forest)', marginBottom: 6 }}>{p.name}</h3>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 12 }}>
                            ₹{p.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : p.price}
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/{p.plan_type === 'subscription' ? 'mo' : 'visit'}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', lineHeight: 1.4 }}>{p.description || 'Professional botanical care.'}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveStep(2)} disabled={!form.plan_id} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: '0.85rem' }}>Confirm Plan Selection</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: PLANT COUNT */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 2 ? '40px' : '0 40px', border: activeStep === 2 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 2 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 2 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 2 ? 'none' : 'auto' }}>
              <StepHeader num={3} title="Number of Plants" active={activeStep === 2} done={activeStep > 2} onClick={() => setActiveStep(2)} locked={activeStep < 2} />
              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 24, padding: '24px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Adjust based on your garden size</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
                        <button onClick={() => setForm(f => ({ ...f, plant_count: Math.max(minPlants, f.plant_count - 1) }))} style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: 'var(--sh-sm)', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0 }}>−</button>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, color: 'var(--forest)', fontFamily: 'var(--font-display)', minWidth: 100 }}>{form.plant_count}</div>
                        <button onClick={() => setForm(f => ({ ...f, plant_count: Math.min(maxPlants, f.plant_count + 1) }))} style={{ width: 64, height: 64, borderRadius: '50%', border: 'none', background: 'var(--forest)', color: '#fff', boxShadow: 'var(--sh-sm)', cursor: 'pointer', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0 }}>+</button>
                      </div>
                      <p style={{ marginTop: 20, color: 'var(--sage)', fontSize: '0.9rem', fontWeight: 600 }}>Min: {minPlants} · Max: {maxPlants} plants</p>
                    </div>
                    <button onClick={() => setActiveStep(3)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, marginTop: 24, fontWeight: 500, fontSize: '0.85rem' }}>Next: Add-ons</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 4: ADD-ONS */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 3 ? '40px' : '0 40px', border: activeStep === 3 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 3 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 3 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 3 ? 'none' : 'auto' }}>
              <StepHeader num={4} title="Enhance Your Visit (Add-ons)" active={activeStep === 3} done={activeStep > 3} onClick={() => setActiveStep(3)} locked={activeStep < 3} />
              <AnimatePresence>
                {activeStep === 3 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                      {addons.map(a => {
                        const sel = form.addons.some(x => x.addon_id === a.id);
                        return (
                          <div key={a.id} onClick={() => toggleAddon(a.id)}
                            style={{ padding: 20, borderRadius: 20, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, cursor: 'pointer', background: sel ? 'rgba(3,65,26,0.03)' : '#fff', transition: 'all 0.3s' }}>
                            <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.95rem', marginBottom: 4 }}>{a.name}</div>
                            <div style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '1rem' }}>+₹{a.price}</div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => setActiveStep(isSubscriptionPlan ? 5 : 4)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: '0.85rem' }}>{isSubscriptionPlan ? 'Next: Review' : 'Next: Schedule'}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 5: SCHEDULE (On-Demand only) */}
            {!isSubscriptionPlan && (
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 4 ? '40px' : '0 40px', border: activeStep === 4 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 4 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 4 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 4 ? 'none' : 'auto' }}>
              <StepHeader num={5} title="Pick Your Preferred Slot" active={activeStep === 4} done={activeStep > 4} onClick={() => setActiveStep(4)} locked={activeStep < 4} />
              <AnimatePresence>
                {activeStep === 4 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: 12, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--sage)' }}>1. Select Date</label>
                        <div style={{ position: 'relative' }}>
                          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10, paddingLeft: 12, paddingRight: 12, scrollBehavior: 'smooth' }} className="no-scrollbar" id="date-scroller">
                            {Array.from({ length: 30 }).map((_, i) => {
                              const d = new Date(); d.setDate(d.getDate() + i + 1);
                              const ds = d.toISOString().split('T')[0];
                              const sel = form.scheduled_date === ds;
                              return (
                                <div key={ds} onClick={() => setForm(f => ({ ...f, scheduled_date: ds }))}
                                  style={{ flexShrink: 0, width: 85, height: 95, borderRadius: 24, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, background: sel ? 'var(--forest)' : '#fff', color: sel ? '#fff' : 'var(--forest)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: sel ? '0 8px 20px rgba(3,65,26,0.15)' : 'none' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6, marginBottom: 4 }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                  <span style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>{d.getDate()}</span>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5, marginTop: 4 }}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Navigation Buttons for Dates */}
                          <div style={{ position: 'absolute', top: 0, bottom: 0, left: -16, right: -16, pointerEvents: 'none', zIndex: 100 }}>
                            <button onClick={() => document.getElementById('date-scroller')?.scrollBy({ left: -240, behavior: 'smooth' })} className="floating-nav-btn" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', width: 36, height: 36, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcChevronLeft /></button>
                            <button onClick={() => document.getElementById('date-scroller')?.scrollBy({ left: 240, behavior: 'smooth' })} className="floating-nav-btn" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'auto', width: 36, height: 36, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcChevronRight /></button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 800, marginBottom: 12, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--sage)' }}>2. Choose Time Slot</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                          {TIMES.map(t => {
                            const sel = form.scheduled_time === t;
                            const available = availableSlots.length === 0 || availableSlots.includes(t);
                            return (<button key={t} disabled={!available} onClick={() => setForm(f => ({ ...f, scheduled_time: t }))} style={{ padding: '12px 0', borderRadius: 14, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, background: sel ? 'var(--forest)' : available ? '#fff' : 'var(--bg-muted)', color: sel ? '#fff' : available ? 'var(--sage)' : 'var(--text-faint)', fontWeight: 800, cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>{t}</button>);
                          })}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveStep(5)} disabled={!form.scheduled_date} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, marginTop: 32, fontWeight: 500, fontSize: '0.85rem' }}>Review & Confirm Selection</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* STEP 6: SUMMARY & PAYMENT */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 5 ? '40px' : '0 40px', border: activeStep === 5 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 5 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 5 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 5 ? 'none' : 'auto' }}>
              <StepHeader num={6} title="Final Review" active={activeStep === 5} done={false} onClick={() => setActiveStep(5)} locked={activeStep < 5} />
              <AnimatePresence>
                {activeStep === 5 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: 24, padding: '24px', display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
                      <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Plan</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>{selectedPlan?.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Plants</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>{form.plant_count} Units</span>
                        </div>
                        {!isSubscriptionPlan && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Schedule</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>{form.scheduled_date} @ {form.scheduled_time}</span>
                        </div>
                        )}
                        {isSubscriptionPlan && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Visits</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>Schedule from My Subscriptions after purchase</span>
                        </div>
                        )}
                        {form.addons.length > 0 && (
                          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
                             <div style={{ color: 'var(--sage)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Selected Add-ons</div>
                             {form.addons.map(a => {
                               const addonObj = addons.find(x => x.id === a.addon_id);
                               return (
                                 <div key={a.addon_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <span style={{ color: 'var(--text-2)', fontSize: '0.9rem', fontWeight: 600 }}>{addonObj?.name}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '0.9rem' }}>+₹{addonObj?.price}</span>
                                 </div>
                               );
                             })}
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1.5px dashed var(--border)', paddingTop: 24, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--forest)' }}>Total Amount</span>
                        <span style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '1.9rem', fontFamily: 'var(--font-display)' }}>₹{total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="btn"
                      style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', borderRadius: 10, border: '1.2px solid var(--forest)', color: 'var(--forest)', fontWeight: 500, background: '#fff', fontSize: '0.8rem', marginBottom: 12 }}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleFinish}
                      disabled={submitting}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontSize: '0.85rem', boxShadow: 'var(--sh-sm)', color: '#fff', fontWeight: 600 }}
                    >
                      {submitting ? 'Initiating Payment...' : 'Buy Now'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: 'var(--sage)', fontWeight: 700 }}>100% Secure Checkout Guarantee</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>

      <AddressPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialLat={form.lat || globalLat}
        initialLng={form.lng || globalLng}
        title={addressMode === 'other' ? 'Pick service location' : 'Confirm your location'}
        onConfirm={(p) => {
          setForm(f => ({ ...f, lat: p.lat, lng: p.lng, address: p.address }));
          if (p.zone) {
            setZone(p.zone);
            setGlobalZone(p.zone);
          }
          setCoords(p.lat, p.lng, p.address);
          // Prefill city/pincode/state if user hasn't typed them
          setAddrFields(prev => ({
            ...prev,
            city: prev.city || p.city || '',
            pincode: prev.pincode || p.pincode || '',
            state: prev.state && prev.state !== 'Uttar Pradesh' ? prev.state : (p.state || prev.state),
          }));
          toast.success('Location set!');
        }}
      />

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function BookPage() {
  return (<Suspense fallback={null}><BookFlow /></Suspense>);
}
