'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getProfile, getPayments, walletTopup } from '@/lib/api';

const AMOUNTS = [100, 250, 500, 1000, 2000, 5000];
/* Icons */
const IcWallet  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcArrowUp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const IcArrowDn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const IcTopup   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IcLeaf    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcClock   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcList    = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcShield  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcPlus    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

function TxIcon({ type, isCredit }: { type: string; isCredit: boolean }) {
  if (type === 'topup') return <IcTopup />;
  if (type === 'booking') return <IcLeaf />;
  return isCredit ? <IcArrowUp /> : <IcArrowDn />;
}

export default function WalletPage() {
  useScrollReveal();
  const router = useRouter();
  const { isAuthenticated, isLoading, updateUser } = useAuth();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState('');
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/wallet');
  }, [isAuthenticated, isLoading, router]);
  
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: isAuthenticated });
  
  /* Bug fix: getPayments returns { items, total } or raw array */
  const { data: txRaw, isLoading: tLoad } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getPayments(1, 20),
    enabled: isAuthenticated,
  });
  
  const transactions: any[] = Array.isArray(txRaw)
    ? txRaw
    : Array.isArray((txRaw as any)?.items)
    ? (txRaw as any).items
    : [];
  
  const balance = (profile as any)?.wallet_balance ?? 0;
  const finalAmount = custom ? parseInt(custom) || 0 : amount;
  
  const topupMut = useMutation({
    mutationFn: () => walletTopup(custom ? parseInt(custom) : amount),
    onSuccess: () => {
      const added = custom ? parseInt(custom) : amount;
      updateUser({ wallet_balance: balance + added });
      toast.success(`₹${added.toLocaleString('en-IN')} added to wallet successfully`);
      setCustom('');
    },
    onError: (e: any) => toast.error(e.message),
  });
  
  if (isLoading) return null;
  
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--forest), var(--forest-mid))', padding: '48px 0 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)' }}>
                <IcWallet />
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.13em', textTransform: 'uppercase' }}>My Wallet</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.52)', marginBottom: 8 }}>Available Balance</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,7vw,4.8rem)', fontWeight: 900, color: 'var(--gold-light)', lineHeight: 1, marginBottom: 8 }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)' }}>Use wallet balance on any booking</div>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: -56, paddingBottom: 80 }}>
          <div className="wallet-grid">
            {/* Transaction history */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 18 }}>Transaction History</h2>
              <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {tLoad ? (
                  Array(5).fill(null).map((_, i) => (
                    <div key={i} style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skel-h" style={{ width: '50%', marginBottom: 8 }} />
                        <div className="skeleton skel-h" style={{ width: '35%' }} />
                      </div>
                      <div className="skeleton skel-h" style={{ width: 64 }} />
                    </div>
                  ))
                ) : transactions.length === 0 ? (
                  <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--forest)', opacity: 0.2 }}><IcList /></div>
                    <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '1rem' }}>No transactions yet</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Top up your wallet or book a visit to see transactions here</div>
                  </div>
                ) : (
                  transactions.map((tx: any, i: number) => {
                    const isCredit = tx.type === 'credit' || tx.amount > 0;
                    const txLabel = tx.description ?? (tx.type === 'topup' ? 'Wallet Top-Up' : tx.type === 'booking' ? 'Booking Payment' : 'Transaction');
                    return (
                      <div key={tx.id ?? i} style={{ padding: '16px 22px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 14, animation: `fade-up 0.4s var(--ease) ${i * 30}ms both` }}>
                        <div style={{ width: 44, height: 44, borderRadius: 13, background: isCredit ? 'rgba(22,163,74,0.09)' : 'rgba(220,38,38,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCredit ? 'var(--ok)' : 'var(--err)', flexShrink: 0 }}>
                          <TxIcon type={tx.type} isCredit={isCredit} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 3, color: 'var(--text)' }}>{txLabel}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: 'var(--text-faint)' }}>
                            <IcClock />
                            {tx.created_at && new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: isCredit ? 'var(--ok)' : 'var(--err)', flexShrink: 0 }}>
                          {isCredit ? '+' : '-'}₹{Math.abs(tx.amount)?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Top-up panel */}
            <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>
              <div style={{ background: '#fff', borderRadius: 24, padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}><IcPlus /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>Add Money</h3>
                </div>
                {/* Quick amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                  {AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom(''); }}
                      style={{ padding: '11px 8px', borderRadius: 11, border: `1.5px solid ${!custom && amount === a ? 'var(--forest)' : 'var(--border)'}`, background: !custom && amount === a ? 'rgba(11,61,46,0.05)' : '#fff', color: !custom && amount === a ? 'var(--forest)' : 'var(--text-2)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                      ₹{a.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                {/* Custom */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Custom Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '1rem' }}>₹</span>
                    <input type="number" placeholder="Enter amount" value={custom}
                      onChange={e => setCustom(e.target.value)}
                      style={{ width: '100%', padding: '11px 13px 11px 28px', background: 'var(--bg)', border: '1.5px solid var(--border-mid)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, outline: 'none', transition: 'all 0.2s' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,61,46,0.09)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }} />
                  </div>
                  {finalAmount > 0 && finalAmount < 50 && <div style={{ fontSize: '0.73rem', color: 'var(--err)', marginTop: 6 }}>Minimum top-up is ₹50</div>}
                </div>
                {/* Summary */}
                <div style={{ background: 'var(--cream)', borderRadius: 13, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current balance</span>
                    <span style={{ fontWeight: 600 }}>₹{balance.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Adding</span>
                    <span style={{ fontWeight: 600, color: 'var(--ok)' }}>+₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <span>New balance</span>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>₹{(balance + finalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button onClick={() => topupMut.mutate()} disabled={topupMut.isPending || finalAmount < 50}
                  className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '13px', gap: 8 }}>
                  {topupMut.isPending
                    ? <><div className="btn-spinner" /> Processing…</>
                    : <><IcTopup /> Add ₹{finalAmount.toLocaleString('en-IN')} to Wallet</>}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: '0.71rem', color: 'var(--text-faint)' }}>
                  <IcShield />
                  Secured by industry-standard encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        .wallet-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; align-items: start; }
        @media(max-width:860px){ .wallet-grid { grid-template-columns: 1fr; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}