'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getMySubscriptions, cancelSubscription, pauseSubscription, resumeSubscription, selectSubscriptionDates, initiatePayment } from '@/lib/api';

const IcPause = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IcPlay  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const IcX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcLeaf  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcCal   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcRenew = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcPlus  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcArrow = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcInfo  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, [string, string, string]> = {
    active:    ['#DCFCE7', '#16A34A', '#16A34A'],
    paused:    ['#FEF9C3', '#CA8A04', '#CA8A04'],
    pending:   ['#FEE2E2', '#DC2626', '#DC2626'],
    cancelled: ['#F3F4F6', '#4B5563', '#9CA3AF'],
    expired:   ['#FEE2E2', '#DC2626', '#DC2626'],
  };
  const [bg, color, dot] = map[s] ?? map.cancelled;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', background: bg, color, border: `1px solid ${color}40` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
      {s}
    </span>
  );
}

type Confirm = { type: 'pause' | 'resume' | 'cancel'; id: number } | null;

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [acting, setActing] = useState(false);
  const [schedulingSub, setSchedulingSub] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [payuData, setPayuData] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/subscriptions');
  }, [isAuthenticated, isLoading, router]);

  const { data, isLoading: sLoad } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getMySubscriptions,
    enabled: isAuthenticated,
  });

  const subs: any[] = Array.isArray(data) ? data : ((data as any)?.items ?? []);

  const doAction = async (type: 'pause' | 'resume' | 'cancel', id: number) => {
    setActing(true);
    try {
      if (type === 'pause') await pauseSubscription(id);
      else if (type === 'resume') await resumeSubscription(id);
      else await cancelSubscription(id);
      toast.success(type === 'pause' ? 'Subscription paused.' : type === 'resume' ? 'Subscription resumed!' : 'Subscription cancelled.');
      setConfirm(null);
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch (e: any) {
      toast.error(e.message || 'Action failed. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!schedulingSub) return;
    const remaining = schedulingSub.plan.visits_per_month - (schedulingSub.scheduled_visits_count || 0);
    // Remove empty strings and filter correctly
    const validDates = selectedDates.filter(d => !!d);
    if (validDates.length !== remaining) {
      toast.error(`Please select all ${remaining} dates`);
      return;
    }
    setActing(true);
    try {
      const res: any = await selectSubscriptionDates(schedulingSub.id, validDates);
      toast.success(res?.message || 'Dates scheduled successfully!');
      setSchedulingSub(null);
      setSelectedDates([]);
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed to schedule dates. Please try again.');
    } finally {
      setActing(false);
    }
  };

  const handlePayment = async (sub: any) => {
    setActing(true);
    try {
      const res = await initiatePayment({
        type: 'subscription',
        subscription_id: sub.id,
        amount: sub.plan.price
      });
      if (res.mock_success) {
        setActing(false);
        toast.success('Payment Successful! Your plan is now active.');
        setTimeout(() => router.push(res.frontend_redirect), 1500);
        return;
      } else if (res.data?.params) {
        setPayuData(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || 'Payment initiation failed');
    } finally {
      setActing(false);
    }
  };

  useEffect(() => {
    if (payuData && payuData.params) {
      const form = document.getElementById('payu-form') as HTMLFormElement;
      if (form) form.submit();
    }
  }, [payuData]);

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', position: 'relative' }}>
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" style={{ opacity: 0.15 }} />

        {/* Header */}
        <div style={{ padding: 'clamp(40px,8vw,64px) 0 clamp(72px,12vw,96px)', position: 'relative', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="overline" style={{ color: 'var(--sage)', marginBottom: 10 }}>MY ACCOUNT</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: 'var(--forest)', letterSpacing: '-0.02em', margin: 0 }}>
                  My Subscriptions
                </h1>
              </div>
              <Link href="/plans" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '16px 28px', fontSize: '1rem', boxShadow: 'var(--sh-md)' }}>
                <IcPlus /> New Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: -44, paddingBottom: 80, position: 'relative', zIndex: 10 }}>

          {/* Loading */}
          {sLoad && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[1, 2].map(i => <div key={i} className="card skeleton" style={{ height: 190, borderRadius: 28 }} />)}
            </div>
          )}

          {/* Empty */}
          {!sLoad && subs.length === 0 && (
            <div className="card" style={{ padding: 'clamp(60px,8vw,90px) 24px', textAlign: 'center', border: '1.5px dashed var(--border-gold)', background: 'transparent' }}>
              <div style={{ width: 80, height: 80, borderRadius: '24px', background: 'var(--bg-elevated)', border: '1.5px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', color: 'var(--forest)' }}>
                <IcLeaf />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', marginBottom: 14, color: 'var(--forest)' }}>No active subscriptions</h2>
              <p style={{ color: 'var(--sage)', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 }}>
                Start a regular monthly plan and leave your cinematic garden maintenance on auto-pilot.
              </p>
              <Link href="/plans" className="btn btn-primary btn-lg">Browse Care Plans</Link>
            </div>
          )}

          {/* Subscription cards */}
          {!sLoad && subs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 24, paddingBottom: 40 }}>
              {subs.map((sub: any, i: number) => {
                const isActive = sub.status === 'active';
                const isPaused = sub.status === 'paused';
                return (
                  <div key={sub.id} className="card" style={{ padding: 0, border: `2px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`, overflow: 'hidden', boxShadow: isActive ? 'var(--sh-md)' : 'none', animation: `fade-up 0.5s var(--ease) ${i * 80}ms both`, borderRadius: 28, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: isActive ? 'var(--bg-elevated)' : 'transparent', padding: 'clamp(20px,3vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, flex: 1 }}>
                      {/* Left: Plan Info */}
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--forest)', margin: 0 }}>
                            {sub.plan?.name ?? 'Garden Plan'}
                          </h3>
                          <StatusBadge s={sub.status} />
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600 }}>
                           <span>{sub.plant_count ?? 0} plants</span>
                           <span>{sub.scheduled_visits_count ?? 0}/{sub.plan?.visits_per_month ?? '—'} visits</span>
                        </div>
                      </div>

                      {/* Center: Dates */}
                      <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                         {sub.next_visit_date && (
                           <div style={{ textAlign: 'center' }}>
                             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Next Visit</div>
                             <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.9rem' }}>{new Date(sub.next_visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                           </div>
                         )}
                         <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Price</div>
                            <div style={{ fontWeight: 900, color: 'var(--gold-deep)', fontSize: '1.25rem' }}>₹{sub.plan?.price?.toLocaleString('en-IN') ?? '—'}</div>
                         </div>
                      </div>

                      {/* Billing & Validity Details */}
                      <div style={{ width: '100%', marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.5)', borderRadius: 20, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Subscription Period</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)' }}>
                            {new Date(sub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            <span style={{ margin: '0 8px', color: 'var(--sage)' }}>→</span>
                            {new Date(sub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Paid Amount</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)' }}>₹{sub.amount_paid?.toLocaleString('en-IN') || sub.plan?.price?.toLocaleString('en-IN')}</div>
                        </div>
                        {sub.payment_id && (
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Payment ID</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sage)', fontFamily: 'monospace' }}>{sub.payment_id}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Purchased On</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest)' }}>{new Date(sub.created_at || sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        {isActive && (
                          <>
                            {(sub.scheduled_visits_count || 0) < (sub.plan?.visits_per_month || 0) && (
                              <button onClick={() => {
                                setSchedulingSub(sub);
                                setSelectedDates([]);
                                const sd = new Date(sub.start_date);
                                const now = new Date();
                                setCurrentMonth(sd > now ? sd : now);
                              }} className="btn btn-primary btn-sm" style={{ padding: '10px 18px', fontSize: '0.75rem' }}>
                                Schedule
                              </button>
                            )}
                            <button onClick={() => setConfirm({ type: 'pause', id: sub.id })} className="btn btn-outline btn-sm" style={{ padding: '10px 18px', fontSize: '0.75rem' }}>
                              Pause
                            </button>
                            <button onClick={() => setConfirm({ type: 'cancel', id: sub.id })} className="btn btn-outline btn-sm" style={{ padding: '10px 18px', fontSize: '0.75rem', borderColor: '#FCA5A5', color: '#DC2626' }}>
                              Cancel
                            </button>
                          </>
                        )}
                        {sub.status === 'pending' && (
                          <button onClick={() => handlePayment(sub)} disabled={acting} className="btn btn-primary btn-sm" style={{ padding: '8px 24px' }}>
                            {acting ? '...' : '💳 Complete Payment'}
                          </button>
                        )}
                        {isPaused && (
                          <button onClick={() => setConfirm({ type: 'resume', id: sub.id })} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IcPlay /> Resume
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upsell */}
          {!sLoad && (
            <div className="card" style={{ marginTop: 40, border: '2px dashed var(--border-gold)', background: 'var(--bg-elevated)', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: '32px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--forest)' }}>
                <IcInfo />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, marginBottom: 8, fontSize: 'clamp(1.2rem,2vw,1.4rem)', margin: '0 0 8px', color: 'var(--forest)' }}>Save more with annual billing</h3>
                <p style={{ color: 'var(--sage)', fontSize: '0.95rem', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>Lock in your rate and get 2 months completely free when you switch to annual payments.</p>
              </div>
              <Link href="/plans" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, padding: '14px 28px' }}>
                Upgrade Plan <IcArrow />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="modal-bg" onClick={() => !acting && setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ background: '#fff', color: 'var(--forest)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: confirm.type === 'cancel' ? '#FEE2E2' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: confirm.type === 'cancel' ? '#DC2626' : 'var(--forest)' }}>
              {confirm.type === 'pause' ? <IcPause /> : confirm.type === 'resume' ? <IcPlay /> : <IcX />}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', textAlign: 'center', marginBottom: 12 }}>
              {confirm.type === 'pause' ? 'Pause Subscription?' : confirm.type === 'resume' ? 'Resume Subscription?' : 'Cancel Subscription?'}
            </h2>
            <p style={{ color: 'var(--sage)', textAlign: 'center', marginBottom: 32, fontSize: '1rem', lineHeight: 1.7, fontWeight: 500 }}>
              {confirm.type === 'pause' ? 'Your visits will pause. Resume anytime — no charges while paused.' : confirm.type === 'resume' ? 'Your regular gardener visits will resume on the next scheduled date.' : 'All future visits will be permanently cancelled. This cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirm(null)} disabled={acting} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Keep Plan</button>
              <button onClick={() => doAction(confirm.type, confirm.id)} disabled={acting}
                style={{ flex: 2, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7, padding: '14px', borderRadius: 99, background: confirm.type === 'cancel' ? '#DC2626' : 'var(--forest)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', opacity: acting ? 0.6 : 1, transition: 'opacity 0.2s', boxShadow: 'var(--sh-md)' }}>
                {acting
                  ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                  : confirm.type === 'pause' ? <><IcPause /> Yes, Pause</> : confirm.type === 'resume' ? <><IcPlay /> Yes, Resume</> : <><IcX /> Yes, Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {schedulingSub && (() => {
        const remaining = schedulingSub.plan.visits_per_month - (schedulingSub.scheduled_visits_count || 0);
        const surgePrice = schedulingSub.plan.weekend_surge_price ? parseFloat(schedulingSub.plan.weekend_surge_price) : 0;
        const surgeDatesCount = selectedDates.filter(d => {
          if(!d) return false;
          // IMPORTANT: Adding T12:00:00 ensures we stay on the same day regardless of timezone
          const day = new Date(`${d}T12:00:00`).getDay();
          return day === 0 || day === 6;
        }).length;
        const totalSurge = surgeDatesCount * surgePrice;

        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 1);
        const minDateStr = minDate.toISOString().split('T')[0];

        return (
          <div className="modal-bg" onClick={() => !acting && setSchedulingSub(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, background: '#fff', color: 'var(--forest)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--forest)' }}>
                <IcCal />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', textAlign: 'center', marginBottom: 12 }}>
                Select Visit Dates
              </h2>
              <p style={{ color: 'var(--sage)', textAlign: 'center', marginBottom: 24, fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
                Please select {remaining} dates for your {schedulingSub.plan.name} plan. Avoid weekends to save on surge pricing!
              </p>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: '24px', userSelect:'none', boxShadow: 'var(--sh-xs)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <button onClick={(e) => { e.preventDefault(); const d = new Date(currentMonth); d.setMonth(d.getMonth() - 1); setCurrentMonth(d); }} type="button" style={{ width:36,height:36,borderRadius:'50%',background:'var(--bg)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center', color: 'var(--forest)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--forest)' }}>
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); const d = new Date(currentMonth); d.setMonth(d.getMonth() + 1); setCurrentMonth(d); }} type="button" style={{ width:36,height:36,borderRadius:'50%',background:'var(--bg)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center', color: 'var(--forest)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center', marginBottom: 10 }}>
                    {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{d}</div>)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {(() => {
                      const year = currentMonth.getFullYear();
                      const month = currentMonth.getMonth();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const firstDayPos = new Date(year, month, 1).getDay();
                      const days = [];
                      for (let i = 0; i < firstDayPos; i++) days.push(null);
                      for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

                      const today = new Date();
                      today.setHours(0,0,0,0);

                      const subStart = new Date(schedulingSub.start_date);
                      subStart.setHours(0,0,0,0);
                      
                      const subEnd = new Date(schedulingSub.end_date);
                      subEnd.setHours(23,59,59,999);

                      return days.map((d, i) => {
                        if (!d) return <div key={i} />;
                        const dateStr = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
                        const isPast = d <= today;
                        const isOutsideSub = d < subStart || d > subEnd;
                        const isDisabled = isPast || isOutsideSub;
                        const isSelected = selectedDates.includes(dateStr);
                        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedDates(prev => prev.filter(x => x !== dateStr));
                              } else {
                                if (selectedDates.length >= remaining) {
                                  toast.error(`You can only schedule ${remaining} visits right now.`);
                                  return;
                                }
                                setSelectedDates(prev => [...prev, dateStr]);
                              }
                            }}
                            style={{
                              aspectRatio: '1',
                              borderRadius: '50%',
                              border: isSelected ? 'none' : '1px solid transparent',
                              background: isSelected ? 'var(--forest)' : (isDisabled ? 'transparent' : (isWeekend ? '#FEE2E2' : '#F3F4F6')),
                              color: isSelected ? '#fff' : (isDisabled ? 'var(--border-mid)' : (isWeekend ? '#DC2626' : 'var(--forest)')),
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              fontWeight: isSelected ? 900 : 700,
                              fontSize: '0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              transform: isSelected ? 'scale(1.05)' : 'none',
                              boxShadow: isSelected ? 'var(--sh-sm)' : 'none'
                            }}
                          >
                            {d.getDate()}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, padding: '0 8px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--sage)', fontWeight: 600 }}>
                    Dates selected: <strong style={{ color: 'var(--forest)', fontWeight: 900 }}>{selectedDates.length}/{remaining}</strong>
                  </span>
                  {selectedDates.length > 0 && (
                    <button onClick={() => setSelectedDates([])} style={{ background:'none', border:'none', color:'var(--earth)', fontSize:'0.85rem', cursor:'pointer', textDecoration:'underline', fontWeight: 600 }}>Clear all</button>
                  )}
                </div>
              </div>

              {surgePrice > 0 && surgeDatesCount > 0 && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', padding: 20, borderRadius: 16, marginBottom: 28, color: '#DC2626', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500 }}>
                  <strong>Weekend Surge Applies:</strong> You selected {surgeDatesCount} weekend date(s). An additional surge charge of ₹{totalSurge} (₹{surgePrice} per weekend visit) will be added to your booking total for these visits.
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setSchedulingSub(null)} disabled={acting} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleScheduleSubmit} disabled={acting} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px', boxShadow: 'var(--sh-md)' }}>
                  {acting ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Processing…</> : `Confirm Dates ${totalSurge > 0 ? `(+ ₹${totalSurge})` : ''}`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
      
      {/* Hidden PayU Form */}
      {payuData && (
        <form id="payu-form" action={payuData.payu_url} method="POST" style={{ display: 'none' }}>
          {Object.entries(payuData.params).map(([key, val]: [string, any]) => (
            <input key={key} type="hidden" name={key} value={val} />
          ))}
        </form>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
