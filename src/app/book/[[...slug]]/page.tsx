'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { slugify } from '@/lib/slug';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import StateSelect from '@/components/StateSelect';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { checkServiceability, getPlans, getAddons, createBooking, createSubscription, getPreviousGardeners, checkGardenerAvailability, submitContact } from '@/lib/api';
import { payWithRazorpay } from '@/lib/razorpay';
import { v, firstError, sanitize } from '@/lib/validators';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/store/location';
import Spinner from '@/components/Spinner';
const AddressPicker = dynamic(() => import('@/components/AddressPicker'), { ssr: false });

type ModalType = 'location' | 'plan' | 'addons' | 'schedule';
const TIMES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
// "Additional Plants Requiring Care" — flat ₹25 per plant. 100+ is a custom quote.
const ADDITIONAL_PLANT_RATE = 25;
const PLANT_OPTIONS = [5, 10, 25, 30, 40, 50, 60, 70, 80, 100];
const GST_RATE = 0.18; // 18% GST added on top of every booking/plan

const IcArrow = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IcChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IcCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>;
const IcX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcPin = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcMapAlt = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
// Instant-booking icons (removed from UI) — kept commented for easy re-enable.
// const IcBolt = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
// const IcCalendarDot = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

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
      <h3 style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)', fontWeight: 600, color: 'var(--forest)', margin: 0, letterSpacing: '-0.01em', overflowWrap: 'break-word', wordBreak: 'normal' }}>{title}</h3>
      {done && !active && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 500, color: 'var(--sage)', textTransform: 'uppercase' }}>Change</span>}
    </div>
  );
}

function BookFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const routeParams = useParams();
  const { isAuthenticated, isLoading, updateUser } = useAuth();
  // Plan can come from the route (/book/premium-monthly) or, for backward
  // compatibility, the legacy ?plan=<id> query string. The slug is resolved to
  // a plan id once the plans list loads (see effect below).
  const planSlugParam = Array.isArray(routeParams?.slug) ? routeParams.slug[0] : undefined;
  const legacyPlanId = params.get('plan') ? parseInt(params.get('plan')!) : 0;

  const { zone: globalZone, lat: globalLat, lng: globalLng, setCoords, setZone: setGlobalZone } = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zone, setZone] = useState<any>(globalZone);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<'current' | 'other'>('current');
  const [form, setForm] = useState({
    address: '', lat: 0, lng: 0, plan_id: legacyPlanId,
    plant_count: 0, scheduled_date: '', scheduled_time: '09:00',
    addons: [] as { addon_id: number; quantity: number }[],
    auto_renew: true, notes: '', preferred_gardener_id: 0
  });

  const [addrFields, setAddrFields] = useState({ roomNo: '', building: '', area: '', city: '', state: 'Uttar Pradesh', pincode: '' });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [noGardenersInZone, setNoGardenersInZone] = useState(false);
  // Instant booking has been removed from the UI. All on-demand bookings are
  // scheduled (user picks date + slot). To re-enable instant, restore the
  // `bookingMode`/`instantInfo` state + instant blocks from git history.
  // const [bookingMode, setBookingMode] = useState<'instant' | 'schedule'>('schedule');
  // const [instantInfo, setInstantInfo] = useState<{ available: boolean; eta_minutes: number; gardener_count?: number; reason?: string | null } | null>(null);
  // const [checkingInstant, setCheckingInstant] = useState(false);
  // "Additional Plants Requiring Care" — chip selection + 100+ custom-quote lead.
  const [customQuote, setCustomQuote] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  const { data: plansRaw } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const { data: addonsRaw } = useQuery({ queryKey: ['addons'], queryFn: getAddons });
  const { addService } = useCart();

  const plans: any[] = (plansRaw as any[]) ?? [];
  const addons: any[] = (addonsRaw as any[]) ?? [];
  const selectedPlan = plans.find(p => p.id === form.plan_id);

  // Resolve the plan slug from the route (/book/premium-monthly) to a plan id
  // once the plans list loads, and preselect it.
  useEffect(() => {
    if (!planSlugParam || plans.length === 0) return;
    const match = plans.find(p => (p.slug || slugify(p.name)) === planSlugParam);
    if (match && form.plan_id !== match.id) {
      setForm(f => ({ ...f, plan_id: match.id }));
    }
  }, [planSlugParam, plans]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // 100+ plants → capture a lead (name + mobile) into the admin contacts inbox.
  const submitCustomQuote = async () => {
    if (!leadName.trim() || leadPhone.length !== 10) { toast.error('Enter your name and a valid 10-digit mobile number'); return; }
    setLeadSubmitting(true);
    try {
      await submitContact({
        name: leadName.trim(),
        phone: leadPhone,
        message: `Custom quote — 100+ plants${selectedPlan ? ` (interested in ${selectedPlan.name})` : ''}.${form.address ? ` Address: ${form.address}.` : ''}`,
        geofence_id: zone?.id,
      });
      toast.success('Thanks! Our team will contact you with a custom quote.');
      setLeadName(''); setLeadPhone('');
    } catch (e: any) {
      toast.error(e?.message || 'Could not submit — please reach us on WhatsApp.');
    } finally { setLeadSubmitting(false); }
  };

  const total = (() => {
    const planBase = Number(selectedPlan?.plan_type !== 'subscription' && zone?.base_price != null ? zone.base_price : (selectedPlan?.price || 0));
    const plantCost = form.plant_count * ADDITIONAL_PLANT_RATE; // ₹25 per plant
    const addonsTotal = form.addons.reduce((sum, { addon_id }) => {
      const a = addons.find(x => x.id === addon_id);
      return sum + (Number(a?.price) || 0);
    }, 0);
    const subtotal = planBase + plantCost + addonsTotal;
    return Math.round(subtotal * (1 + GST_RATE) * 100) / 100; // + 18% GST
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
    if (customQuote) {
      toast.error('For 100+ plants, please request a custom quote in the Additional Plants step.');
      setActiveStep(2);
      return;
    }
    if (!isSubscriptionPlan && !form.scheduled_date) {
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
          auto_renew: form.auto_renew,
          payment_method: 'razorpay',
        });
        const pay = await payWithRazorpay({ type: 'subscription', subscription_id: res.id });
        if (pay.ok) {
          toast.success('Subscription activated!');
          router.push('/subscriptions');
        } else {
          // On cancel/failure the backend has voided the unpaid subscription.
          toast(pay.cancelled ? 'Payment cancelled — subscription not placed.' : (pay.message || 'Payment failed'), { icon: '⚠️' });
          setSubmitting(false);
        }
      } else {
        // On-demand bookings are always scheduled (instant booking removed).
        res = await createBooking({
          ...payload,
          is_instant: false,
          scheduled_date: form.scheduled_date,
          scheduled_time: form.scheduled_time,
        });
        // Add-ons are already persisted and included in total_amount by createBooking
        // (it reads `addons` from the payload). Do NOT call addBookingAddons here — that
        // would create duplicate add-on rows and double-charge the customer.
        const pay = await payWithRazorpay({ type: 'booking', booking_id: res.id });
        if (pay.ok) {
          toast.success('Booking confirmed & paid!');
          router.push(`/bookings/${res.id}`);
        } else {
          // On cancel/failure the backend has voided the unpaid booking.
          toast(pay.cancelled ? 'Payment cancelled — booking not placed.' : (pay.message || 'Payment failed'), { icon: '⚠️' });
          setSubmitting(false);
        }
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

  // ── INSTANT BOOKING REMOVED ────────────────────────────────────────────────
  // The instant-availability fetch + force-schedule effects are disabled.
  // // Fetch instant availability whenever zone changes (on-demand only).
  // useEffect(() => {
  //   if (!zone?.id || isSubscriptionPlan) { setInstantInfo(null); return; }
  //   setCheckingInstant(true);
  //   checkInstantAvailability(zone.id)
  //     .then((res: any) => setInstantInfo(res))
  //     .catch(() => setInstantInfo({ available: false, eta_minutes: 0 }))
  //     .finally(() => setCheckingInstant(false));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [zone?.id, isSubscriptionPlan]);
  //
  // // If instant is disabled OR no gardener is free, force schedule mode.
  // useEffect(() => {
  //   if (!instantInfo) return;
  //   if (bookingMode === 'instant' && (instantInfo.eta_minutes <= 0 || !instantInfo.available)) {
  //     setBookingMode('schedule');
  //   }
  // }, [instantInfo, bookingMode]);

  useEffect(() => {
    if (form.scheduled_date && zone?.id) {
      setLoadingSlots(true);
      setSlotsLoaded(false);
      setNoGardenersInZone(false);
      checkGardenerAvailability(form.scheduled_date, undefined, zone.id)
        .then((res: any) => {
          const slots: string[] = Array.isArray(res) ? res : (res?.available_slots ?? []);
          setAvailableSlots(slots);
          setNoGardenersInZone(res?.no_gardeners_in_zone === true || slots.length === 0);
        })
        .catch(() => { setAvailableSlots([]); setNoGardenersInZone(false); })
        .finally(() => { setLoadingSlots(false); setSlotsLoaded(true); });
    } else {
      setSlotsLoaded(false);
      setNoGardenersInZone(false);
    }
  }, [form.scheduled_date, zone]);

  const bookFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I book a gardening service with GharKaMali?',
        acceptedAnswer: { '@type': 'Answer', text: 'Select your plan (Basic, Standard, or Premium), choose your preferred date and time slot, enter your address, and complete the payment. A certified plant expert will arrive at your doorstep at the scheduled time.' },
      },
      {
        '@type': 'Question',
        name: 'What gardening plans does GharKaMali offer?',
        acceptedAnswer: { '@type': 'Answer', text: 'GharKaMali offers three subscription plans: Basic (2 visits/month, up to 10 plants), Standard (4 visits/month, up to 20 plants with fertilizer), and Premium (8 visits/month, unlimited plants with a dedicated expert and 24/7 WhatsApp support). Plans start at ₹349.' },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel or reschedule my gardening booking?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can reschedule or cancel your booking from the My Bookings section in your account. Cancellations made 24 hours in advance are eligible for a full refund to your original payment method.' },
      },
      {
        '@type': 'Question',
        name: 'Does GharKaMali service my area?',
        acceptedAnswer: { '@type': 'Answer', text: 'GharKaMali currently serves Noida and Greater Noida. Enter your pincode on the booking page — you will immediately see whether your area is serviceable and which slots are available.' },
      },
    ],
  };

  // Auth gate — show a friendly prompt instead of technical errors
  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #eef6ee 0%, #fffdf5 55%, #f5f0e8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 28, padding: '48px 36px', boxShadow: 'var(--sh-lg)', border: '1.5px solid var(--border-gold)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(3,65,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--forest)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 10 }}>Please Log In to Book</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 28, fontWeight: 500 }}>
              You need an account to book a visit. It only takes a minute to sign up — then you can track visits, manage bookings, and more.
            </p>
            <a
              href={`/login?next=/book${typeof window !== 'undefined' ? encodeURIComponent(window.location.search) : ''}`}
              style={{ display: 'block', width: '100%', padding: '15px', background: 'var(--forest)', color: '#fff', borderRadius: 14, fontWeight: 800, fontSize: '1rem', textDecoration: 'none', textAlign: 'center', boxShadow: '0 8px 24px rgba(3,65,26,0.2)', marginBottom: 12, transition: 'all 0.2s' }}
            >
              Log In to Continue
            </a>
            <a href="/login?mode=signup" style={{ display: 'block', width: '100%', padding: '14px', background: 'transparent', color: 'var(--forest)', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', textAlign: 'center', border: '1.5px solid var(--border-mid)' }}>
              Create Free Account
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookFaqSchema) }} />
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
            <div className={activeStep === 0 ? 'book-step-active' : 'book-step-inactive'} style={{ background: '#fff', borderRadius: 32, padding: activeStep === 0 ? '40px' : '0 40px', border: activeStep === 0 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 0 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden' }}>
              <StepHeader num={1} title="Service Address" active={activeStep === 0} done={activeStep > 0} onClick={() => setActiveStep(0)} locked={false} />
              <AnimatePresence>
                {activeStep === 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {/* Address Mode Toggle */}
                      <div className="book-addr-toggle" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><IcPin /> Current Location</div>
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
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><IcMapAlt /> Different Location</div>
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

                      <div className="book-addr-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>ROOM / FLAT NO.</label><input placeholder="e.g. B-204" value={addrFields.roomNo} maxLength={10} onChange={e => updateAddr({ roomNo: sanitize.addressLine(e.target.value, 10) })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>BUILDING / SOCIETY</label><input placeholder="e.g. ATS Pristine" value={addrFields.building} maxLength={60} onChange={e => updateAddr({ building: sanitize.addressLine(e.target.value, 60) })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                      </div>
                      <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>AREA / LANDMARK</label><input placeholder="Sector 150" value={addrFields.area} maxLength={80} onChange={e => updateAddr({ area: sanitize.addressLine(e.target.value, 80) })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                      <div className="book-addr-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>CITY</label><input placeholder="e.g. Noida" value={addrFields.city} maxLength={40} onChange={e => updateAddr({ city: sanitize.city(e.target.value) })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>STATE</label>
                          <StateSelect value={addrFields.state} onChange={s => updateAddr({ state: s })}
                            inputStyle={{ padding: 14, borderRadius: 14 }} />
                        </div>
                      </div>
                      <div><label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', marginBottom: 6, display: 'block' }}>PINCODE</label><input placeholder="201301" inputMode="numeric" maxLength={6} value={addrFields.pincode} onChange={e => updateAddr({ pincode: sanitize.pincode(e.target.value) })} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', fontWeight: 600 }} /></div>
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
                          const err = firstError([
                            v.addressLine(addrFields.roomNo,   { field: 'flat/room number', min: 1, max: 10 }),
                            v.addressLine(addrFields.building, { field: 'building',         min: 2, max: 60 }),
                            v.addressLine(addrFields.area,     { field: 'area/landmark',    min: 2, max: 80 }),
                            v.city(addrFields.city),
                            v.pincode(addrFields.pincode),
                          ]);
                          if (err) { toast.error(err); return; }
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
            <div className={activeStep === 1 ? 'book-step-active' : 'book-step-inactive'} style={{ background: '#fff', borderRadius: 32, padding: activeStep === 1 ? '40px' : '0 40px', border: activeStep === 1 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 1 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 1 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 1 ? 'none' : 'auto' }}>
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
                          {/* Strip any stale "up to N plants" phrase from the admin description —
                              the plant coverage is shown authoritatively by the badge below (max_plants). */}
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', lineHeight: 1.4 }}>{(p.description || 'Professional botanical care.').replace(/[—-]?\s*\d+\s*visits?\s*\/?\s*month/gi, '').replace(/\.?\s*(up to|upto)\s*\d+\s*plants?\.?/gi, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,—-])/g, '$1').replace(/[—-]\s*$/, '').trim() || 'Professional botanical care.'}</div>
                          {p.max_plants ? <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 800, color: 'var(--forest)', background: 'rgba(3,65,26,0.07)', padding: '5px 11px', borderRadius: 99 }}>🌿 Includes up to {p.max_plants} plants</div> : null}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveStep(2)} disabled={!form.plan_id} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: '0.85rem' }}>Confirm Plan Selection</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 3: PLANT COUNT */}
            <div className={activeStep === 2 ? 'book-step-active' : 'book-step-inactive'} style={{ background: '#fff', borderRadius: 32, padding: activeStep === 2 ? '40px' : '0 40px', border: activeStep === 2 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 2 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 2 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 2 ? 'none' : 'auto' }}>
              <StepHeader num={3} title="Additional Plants Requiring Care" active={activeStep === 2} done={activeStep > 2} onClick={() => setActiveStep(2)} locked={activeStep < 2} />
              <AnimatePresence>
                {activeStep === 2 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <p style={{ color: 'var(--sage)', fontWeight: 600, fontSize: '0.9rem', marginBottom: 18 }}>
                      Your plan {selectedPlan?.max_plants ? `covers up to ${selectedPlan.max_plants} plants` : 'covers its included plants'}. Add extra only if you need more — ₹{ADDITIONAL_PLANT_RATE} per plant (optional).
                    </p>

                    {/* Selectable plant-count chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                      {(() => { const sel = !customQuote && form.plant_count === 0; return (
                        <button onClick={() => { setCustomQuote(false); setForm(f => ({ ...f, plant_count: 0 })); }}
                          style={{ flex: '1 0 92px', padding: '14px 12px', borderRadius: 16, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, background: sel ? 'var(--forest)' : '#fff', color: sel ? '#fff' : 'var(--forest)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>None</div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: sel ? 0.92 : 0.6 }}>Plan only · ₹0</div>
                        </button>
                      ); })()}
                      {PLANT_OPTIONS.map(n => {
                        const sel = !customQuote && form.plant_count === n;
                        return (
                          <button key={n} onClick={() => { setCustomQuote(false); setForm(f => ({ ...f, plant_count: n })); }}
                            style={{ flex: '1 0 92px', padding: '14px 12px', borderRadius: 16, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, background: sel ? 'var(--forest)' : '#fff', color: sel ? '#fff' : 'var(--forest)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>{n}</div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: sel ? 0.92 : 0.6 }}>Plants · ₹{(n * ADDITIONAL_PLANT_RATE).toLocaleString('en-IN')}</div>
                          </button>
                        );
                      })}
                      <button onClick={() => setCustomQuote(true)}
                        style={{ flex: '1 0 92px', padding: '14px 12px', borderRadius: 16, border: `2px solid ${customQuote ? 'var(--gold)' : 'var(--border)'}`, background: customQuote ? 'var(--gold)' : '#fff', color: 'var(--forest)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.05rem' }}>100+</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7 }}>Custom Quote</div>
                      </button>
                    </div>

                    {!customQuote ? (
                      <>
                        <div style={{ background: 'var(--bg-elevated)', borderRadius: 16, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>{form.plant_count === 0 ? 'No additional plants (plan only)' : `${form.plant_count} plants × ₹${ADDITIONAL_PLANT_RATE}`}</span>
                          <span style={{ fontWeight: 900, color: 'var(--forest)', fontSize: '1.2rem' }}>+₹{(form.plant_count * ADDITIONAL_PLANT_RATE).toLocaleString('en-IN')}</span>
                        </div>
                        <button onClick={() => setActiveStep(isSubscriptionPlan ? 5 : 4)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, fontWeight: 500, fontSize: '0.85rem' }}>{isSubscriptionPlan ? 'Next: Review' : 'Next: Schedule'}</button>
                      </>
                    ) : (
                      <div style={{ background: 'rgba(3,65,26,0.04)', border: '1.5px solid var(--border-gold)', borderRadius: 18, padding: 24 }}>
                        <p style={{ color: 'var(--forest)', fontWeight: 700, marginBottom: 16, lineHeight: 1.6, fontSize: '0.95rem' }}>
                          Please share your requirement. Our team will contact you with a custom quote.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <input value={leadName} onChange={e => setLeadName(e.target.value)} placeholder="Your name"
                            style={{ padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500, outline: 'none' }} />
                          <input value={leadPhone} onChange={e => setLeadPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" maxLength={10} placeholder="Mobile number"
                            style={{ padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500, outline: 'none' }} />
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={submitCustomQuote} disabled={leadSubmitting || !leadName.trim() || leadPhone.length !== 10}
                              className="btn btn-primary" style={{ flex: '1 1 170px', justifyContent: 'center', padding: '12px', fontWeight: 700, fontSize: '0.85rem' }}>
                              {leadSubmitting ? 'Submitting…' : 'Request Custom Quote'}
                            </button>
                            <a href={`https://wa.me/919876543210?text=${encodeURIComponent('Hi GharKaMali! I need a custom quote for 100+ plants.')}`} target="_blank" rel="noopener noreferrer"
                              className="btn btn-forest" style={{ flex: '0 0 auto', justifyContent: 'center', padding: '12px 18px', gap: 8, display: 'inline-flex', alignItems: 'center' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.2.2-.4.1-.2 0-.3 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2z"/><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.2-1.2l-.3-.2-3 .9.9-2.9-.2-.3A8 8 0 1 1 12 20z"/></svg>
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STEP 4: ADD-ONS — hidden for now (set the guard back to true to re-enable) */}
            {false && (
            <div className={activeStep === 3 ? 'book-step-active' : 'book-step-inactive'} style={{ background: '#fff', borderRadius: 32, padding: activeStep === 3 ? '40px' : '0 40px', border: activeStep === 3 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 3 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 3 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 3 ? 'none' : 'auto' }}>
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
            )}

            {/* STEP 5: SCHEDULE (On-Demand only) */}
            {!isSubscriptionPlan && (
            <div className={activeStep === 4 ? 'book-step-active' : 'book-step-inactive'} style={{ background: '#fff', borderRadius: 32, padding: activeStep === 4 ? '40px' : '0 40px', border: activeStep === 4 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 4 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 4 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 4 ? 'none' : 'auto' }}>
              <StepHeader num={4} title="Pick Your Preferred Slot" active={activeStep === 4} done={activeStep > 4} onClick={() => setActiveStep(4)} locked={activeStep < 4} />
              <AnimatePresence>
                {activeStep === 4 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ paddingBottom: 40, borderTop: '1px solid var(--border-gold)', paddingTop: 32 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* ── INSTANT BOOKING REMOVED ──────────────────────────────
                          The Instant vs Schedule toggle and instant-availability
                          notes are commented out. All on-demand bookings are now
                          scheduled. Restore from git history to re-enable instant.

                      {INSTANT vs SCHEDULE toggle, "Checking instant availability…",
                       "Instant booking isn't available", and the instant
                       confirmation card all lived here.}
                      ──────────────────────────────────────────────────────────── */}

                      <>
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
                        {loadingSlots && (
                          <div style={{ padding: '16px 0', color: 'var(--sage)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Spinner size={15} color="var(--sage)" /> Checking availability...
                          </div>
                        )}
                        {!loadingSlots && slotsLoaded && noGardenersInZone && (
                          <div style={{ padding: '16px', borderRadius: 14, background: '#fff8e1', border: '1.5px solid #f5c842', color: '#7a5c00', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12 }}>
                            No gardeners available in your area for this date. Please try a different date.
                          </div>
                        )}
                        {!noGardenersInZone && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                          {TIMES.map(t => {
                            const sel = form.scheduled_time === t;
                            const available = !slotsLoaded || availableSlots.includes(t);
                            return (<button key={t} disabled={!available} onClick={() => setForm(f => ({ ...f, scheduled_time: t }))} style={{ padding: '12px 0', borderRadius: 14, border: `2px solid ${sel ? 'var(--forest)' : 'var(--border)'}`, background: sel ? 'var(--forest)' : available ? '#fff' : 'var(--bg-muted)', color: sel ? '#fff' : available ? 'var(--sage)' : 'var(--text-faint)', fontWeight: 800, cursor: available ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>{t}</button>);
                          })}
                        </div>
                        )}
                      </div>
                      </>
                    </div>
                    <button onClick={() => setActiveStep(5)} disabled={!form.scheduled_date || loadingSlots || noGardenersInZone || !availableSlots.includes(form.scheduled_time)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', borderRadius: 10, marginTop: 32, fontWeight: 500, fontSize: '0.85rem' }}>Review & Confirm Selection</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* STEP 6: SUMMARY & PAYMENT */}
            <div style={{ background: '#fff', borderRadius: 32, padding: activeStep === 5 ? '40px' : '0 40px', border: activeStep === 5 ? '2px solid var(--forest)' : '1px solid var(--border)', boxShadow: activeStep === 5 ? '0 8px 40px rgba(3,65,26,0.12)' : 'none', overflow: 'hidden', filter: activeStep < 5 ? 'blur(4px)' : 'none', pointerEvents: activeStep < 5 ? 'none' : 'auto' }}>
              <StepHeader num={isSubscriptionPlan ? 4 : 5} title="Final Review" active={activeStep === 5} done={false} onClick={() => setActiveStep(5)} locked={activeStep < 5} />
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
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Additional Plants</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>{form.plant_count === 0 ? 'None (plan only)' : `${form.plant_count} × ₹${ADDITIONAL_PLANT_RATE} = +₹${(form.plant_count * ADDITIONAL_PLANT_RATE).toLocaleString('en-IN')}`}</span>
                        </div>
                        {!isSubscriptionPlan && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Schedule</span>
                          <span style={{ fontWeight: 800, color: 'var(--forest)' }}>
                            {`${form.scheduled_date} @ ${form.scheduled_time}`}
                          </span>
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

                      {/* Subtotal + 18% GST */}
                      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>Subtotal (excl. GST)</span>
                          <span style={{ fontWeight: 700, color: 'var(--forest)' }}>₹{(total / (1 + GST_RATE)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: '0.9rem' }}>GST (18%)</span>
                          <span style={{ fontWeight: 700, color: 'var(--forest)' }}>+₹{(total - total / (1 + GST_RATE)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
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
                      {submitting ? <><Spinner size={16} color="#fff" /> Initiating Payment...</> : 'Buy Now'}
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
    </>
  );
}

export default function BookPage() {
  return (<Suspense fallback={null}><BookFlow /></Suspense>);
}
