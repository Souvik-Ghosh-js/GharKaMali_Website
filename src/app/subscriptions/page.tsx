'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getMySubscriptions, cancelSubscription, pauseSubscription, resumeSubscription } from '@/lib/api';

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
    active:    ['#DCFCE7', '#14532D', '#16A34A'],
    paused:    ['#FEF3C7', '#92400E', '#D97706'],
    cancelled: ['#F3F4F6', '#374151', '#9CA3AF'],
    expired:   ['#FEE2E2', '#991B1B', '#EF4444'],
  };
  const [bg, color, dot] = map[s] ?? map.cancelled;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: bg, color }}>
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

  if (isLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)', padding: 'clamp(40px,8vw,64px) 0 clamp(72px,12vw,96px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-25%', right: '-8%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p className="overline" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>MY ACCOUNT</p>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                  My Subscriptions
                </h1>
              </div>
              <Link href="/plans" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <IcPlus /> New Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="container" style={{ marginTop: -44, paddingBottom: 80 }}>

          {/* Loading */}
          {sLoad && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 190, borderRadius: 24 }} />)}
            </div>
          )}

          {/* Empty */}
          {!sLoad && subs.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 28, padding: 'clamp(52px,8vw,80px) 24px', textAlign: 'center', border: '2px dashed var(--border)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(11,61,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--forest)' }}>
                <IcLeaf />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', marginBottom: 10 }}>No active subscriptions</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.7, fontSize: '0.9rem' }}>
                Subscribe to a monthly plan and save up to 30% on every gardener visit
              </p>
              <Link href="/plans" className="btn btn-forest">Browse Plans</Link>
            </div>
          )}

          {/* Subscription cards */}
          {!sLoad && subs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subs.map((sub: any, i: number) => {
                const isActive = sub.status === 'active';
                const isPaused = sub.status === 'paused';
                return (
                  <div key={sub.id} style={{ background: '#fff', borderRadius: 24, border: `1.5px solid ${isActive ? 'rgba(11,61,46,0.14)' : 'var(--border)'}`, overflow: 'hidden', boxShadow: isActive ? 'var(--sh-sm)' : 'none', animation: `fade-up 0.5s var(--ease) ${i * 80}ms both` }}>

                    {/* Top banner */}
                    <div style={{ background: isActive ? 'linear-gradient(135deg, var(--forest) 0%, var(--forest-mid) 100%)' : 'var(--bg)', padding: 'clamp(20px,4vw,28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1rem,3vw,1.25rem)', color: isActive ? '#fff' : 'var(--text)', margin: 0 }}>
                            {sub.plan?.name ?? 'Garden Plan'}
                          </h3>
                          <StatusBadge s={sub.status} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: isActive ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)', margin: 0 }}>
                          {sub.plant_count ?? 0} plants &nbsp;·&nbsp; {sub.plan?.visits_per_month ?? '—'} visits/month
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,2rem)', color: isActive ? 'var(--gold-light)' : 'var(--forest)', lineHeight: 1 }}>
                          ₹{sub.plan?.price?.toLocaleString('en-IN') ?? '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: isActive ? 'rgba(255,255,255,0.4)' : 'var(--text-faint)', marginTop: 4 }}>per month</div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div style={{ padding: 'clamp(14px,3vw,20px) clamp(20px,4vw,28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 'clamp(10px,2vw,20px)', flexWrap: 'wrap' }}>
                        {sub.start_date && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--text-faint)', display: 'flex' }}><IcCal /></span>
                            Started {new Date(sub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {sub.next_visit_date && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--forest)', display: 'flex' }}><IcLeaf /></span>
                            Next {new Date(sub.next_visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                        {sub.auto_renew !== undefined && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex' }}><IcRenew /></span>
                            Auto-renew: {sub.auto_renew ? 'On' : 'Off'}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        {isActive && (
                          <>
                            <button onClick={() => setConfirm({ type: 'pause', id: sub.id })} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <IcPause /> Pause
                            </button>
                            <button onClick={() => setConfirm({ type: 'cancel', id: sub.id })}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, background: 'rgba(220,38,38,0.07)', color: 'var(--err)', border: '1px solid rgba(220,38,38,0.14)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'background 0.2s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.13)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.07)')}>
                              <IcX /> Cancel
                            </button>
                          </>
                        )}
                        {isPaused && (
                          <button onClick={() => setConfirm({ type: 'resume', id: sub.id })} className="btn btn-forest btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <div style={{ marginTop: 40, background: 'linear-gradient(135deg, var(--gold-pale), #fffbef)', borderRadius: 24, padding: 'clamp(22px,4vw,36px)', border: '1px solid rgba(201,168,76,0.22)', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--earth)' }}>
                <IcInfo />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 5, fontSize: 'clamp(0.95rem,2vw,1.1rem)', margin: '0 0 5px' }}>Save more with annual billing</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>Lock in your rate and get 2 months free when you switch to annual payment.</p>
              </div>
              <Link href="/plans" className="btn btn-forest btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                Explore Plans <IcArrow />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="modal-bg" onClick={() => !acting && setConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: confirm.type === 'cancel' ? 'rgba(220,38,38,0.1)' : 'rgba(11,61,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: confirm.type === 'cancel' ? 'var(--err)' : 'var(--forest)' }}>
              {confirm.type === 'pause' ? <IcPause /> : confirm.type === 'resume' ? <IcPlay /> : <IcX />}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', textAlign: 'center', marginBottom: 10 }}>
              {confirm.type === 'pause' ? 'Pause Subscription?' : confirm.type === 'resume' ? 'Resume Subscription?' : 'Cancel Subscription?'}
            </h2>
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, fontSize: '0.9rem', lineHeight: 1.7 }}>
              {confirm.type === 'pause' ? 'Your visits will pause. Resume anytime — no charges while paused.' : confirm.type === 'resume' ? 'Your regular gardener visits will resume on the next scheduled date.' : 'All future visits will be permanently cancelled. This cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirm(null)} disabled={acting} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Keep Plan</button>
              <button onClick={() => doAction(confirm.type, confirm.id)} disabled={acting}
                style={{ flex: 2, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7, padding: '13px', borderRadius: 99, background: confirm.type === 'cancel' ? 'var(--err)' : 'var(--forest)', color: '#fff', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: acting ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                {acting
                  ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Processing…</>
                  : confirm.type === 'pause' ? <><IcPause /> Yes, Pause</> : confirm.type === 'resume' ? <><IcPlay /> Yes, Resume</> : <><IcX /> Yes, Cancel</>}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
