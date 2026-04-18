'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getProfile, getPayments, walletTopup, initiatePayment } from '@/lib/api';

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
  const [payuData, setPayuData] = useState<any>(null);
  
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
  
  const balance = Number((profile as any)?.wallet_balance ?? 0);
  const finalAmount = custom ? parseInt(custom) || 0 : amount;
  
  const topupMut = useMutation({
    mutationFn: () => walletTopup(custom ? parseInt(custom) : amount, (profile as any)?.geofence_id),
    onSuccess: (res: any) => {
      if (res?.mock_success) {
        toast.success('Payment Successful! Wallet Updated.');
        setTimeout(() => {
          window.location.href = res.frontend_redirect;
        }, 1500);
        return;
      }
      if (res?.data?.params) {
        setPayuData(res.data);
        toast.loading('Redirecting to payment gateway...');
      } else {
        toast.error('Payment initiation failed');
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Auto-submit PayU form when data is ready
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
        {/* Hero */}
        <div style={{ padding: '64px 0 100px', position: 'relative', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
                <IcWallet />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--sage)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>My Wallet</span>
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--sage)', marginBottom: 8, fontWeight: 600 }}>Available Balance</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.5rem,8vw,5.5rem)', fontWeight: 900, color: 'var(--forest)', lineHeight: 1, marginBottom: 20 }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Use wallet balance on any booking or shop purchase</div>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: -56, paddingBottom: 80, position: 'relative', zIndex: 10 }}>
          <div className="wallet-grid">
            {/* Transaction history */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', marginBottom: 24, color: 'var(--forest)' }}>Transaction History</h2>
              <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 24 }}>
                {tLoad ? (
                  Array(5).fill(null).map((_, i) => (
                    <div key={i} style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                      <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skel-h" style={{ width: '50%', marginBottom: 12 }} />
                        <div className="skeleton skel-h" style={{ width: '35%' }} />
                      </div>
                      <div className="skeleton skel-h" style={{ width: 70 }} />
                    </div>
                  ))
                ) : transactions.length === 0 ? (
                  <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20, color: 'var(--sage)', opacity: 0.5 }}><IcList /></div>
                    <div style={{ fontWeight: 900, marginBottom: 10, fontSize: '1.2rem', color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>No transactions yet</div>
                    <div style={{ color: 'var(--sage)', fontSize: '0.95rem', fontWeight: 500 }}>Top up your wallet or book a visit to see transactions here</div>
                  </div>
                ) : (
                  transactions.map((tx: any, i: number) => {
                    const isCredit = tx.type === 'credit' || tx.amount > 0;
                    const txLabel = tx.description ?? (tx.type === 'topup' ? 'Wallet Top-Up' : tx.type === 'booking' ? 'Booking Payment' : 'Transaction');
                    return (
                      <div key={tx.id ?? i} style={{ padding: '20px 24px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 16, animation: `fade-up 0.4s var(--ease) ${i * 30}ms both`, transition: 'background 0.2s var(--ease)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9f9f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: isCredit ? '#DCFCE7' : '#FEE2E2', border: `1px solid ${isCredit ? '#86EFAC' : '#FCA5A5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCredit ? '#16A34A' : '#DC2626', flexShrink: 0 }}>
                          <TxIcon type={tx.type} isCredit={isCredit} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6, color: 'var(--forest)' }}>{txLabel}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            <IcClock />
                            {tx.created_at && new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: isCredit ? '#16A34A' : 'var(--forest)', flexShrink: 0 }}>
                          {isCredit ? '+' : '-'}₹{Math.abs(tx.amount)?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Top-up panel */}
            <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)' }}>
              <div className="card" style={{ padding: '36px', borderRadius: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}><IcPlus /></div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--forest)' }}>Add Money</h3>
                </div>
                {/* Quick amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
                  {AMOUNTS.map(a => (
                    <button key={a} onClick={() => { setAmount(a); setCustom(''); }}
                      style={{ padding: '14px 6px', borderRadius: 16, border: `2px solid ${!custom && amount === a ? 'var(--forest)' : 'var(--border)'}`, background: !custom && amount === a ? 'var(--forest)' : 'var(--bg)', color: !custom && amount === a ? '#fff' : 'var(--forest)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'all 0.2s var(--ease)', boxShadow: !custom && amount === a ? 'var(--sh-sm)' : 'none' }}>
                      ₹{a.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                {/* Custom */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--sage)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>CUSTOM AMOUNT</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: 'var(--forest)', fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>₹</span>
                    <input type="number" placeholder="Enter amount" value={custom}
                      onChange={e => setCustom(e.target.value)}
                      style={{ width: '100%', padding: '18px 20px 18px 44px', background: '#fff', border: '1px solid var(--border-mid)', borderRadius: 20, fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900, outline: 'none', transition: 'all 0.3s var(--ease)', color: 'var(--forest)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--forest)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--border)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }} />
                  </div>
                  {finalAmount > 0 && finalAmount < 50 && <div style={{ fontSize: '0.9rem', color: '#DC2626', marginTop: 10, fontWeight: 600 }}>Minimum top-up is ₹50</div>}
                </div>
                {/* Summary */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px', marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: 12, fontWeight: 600 }}>
                    <span style={{ color: 'var(--sage)' }}>Current balance</span>
                    <span style={{ fontWeight: 900, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>₹{balance.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: 16, fontWeight: 600 }}>
                    <span style={{ color: 'var(--sage)' }}>Adding</span>
                    <span style={{ fontWeight: 900, color: '#16A34A', fontFamily: 'var(--font-display)' }}>+₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.3rem', borderTop: '2px dashed var(--border-mid)', paddingTop: 16 }}>
                    <span style={{ color: 'var(--forest)' }}>New balance</span>
                    <span style={{ fontFamily: 'var(--font-display)', color: 'var(--forest)' }}>₹{(balance + finalAmount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button onClick={() => topupMut.mutate()} disabled={topupMut.isPending || finalAmount < 50}
                  className="btn btn-primary w-full btn-lg" style={{ justifyContent: 'center', padding: '18px', gap: 12, fontSize: '1.1rem', boxShadow: 'var(--sh-md)' }}>
                  {topupMut.isPending
                    ? <><div className="btn-spinner" /> Processing…</>
                    : <><IcTopup /> Add ₹{finalAmount.toLocaleString('en-IN')} to Wallet</>}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, fontSize: '0.8rem', color: 'var(--earth)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  <IcShield />
                  SECURED BY INDUSTRY-STANDARD ENCRYPTION
                </div>
              </div>
            </div>
          </div>
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
      <style>{`
        .wallet-grid { display: grid; grid-template-columns: 1fr 400px; gap: 24px; align-items: start; }
        @media(max-width:860px){ .wallet-grid { grid-template-columns: 1fr; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
