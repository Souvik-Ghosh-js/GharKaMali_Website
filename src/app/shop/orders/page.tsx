'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getMyOrders } from '@/lib/api';

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const IcBox   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IcArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcShop  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;

const STATUS_COLORS: Record<string, string> = {
  pending:    '#92400E',
  processing: '#0369A1',
  shipped:    '#1E40AF',
  delivered:  '#14532D',
  cancelled:  '#991B1B',
  returned:   '#374151',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, authLoading, router]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-shop-orders'],
    queryFn: getMyOrders,
    enabled: isAuthenticated
  });

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100svh', background: 'var(--bg)', paddingTop: 'calc(var(--nav-h) + 40px)', paddingBottom: 80 }}>
        <div className="container-sm">
          
          {/* Header */}
          <div style={{ marginBottom: 32, animation: 'fade-up 0.5s ease' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 12, width: 'fit-content' }}>
              <span style={{ transform: 'rotate(180deg)', display: 'flex' }}><IcArrow /></span>
              Back to Dashboard
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--forest)', letterSpacing: '-0.02em' }}>My Shop Orders</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4 }}>Track and manage your marketplace purchases</p>
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 160, borderRadius: 24 }} />
              ))
            ) : !orders || (orders as any).length === 0 ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: 28, padding: '64px 32px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-faint)' }}>
                  <IcShop />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>No orders yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Explore our premium plants and garden supplies.</p>
                <Link href="/shop" className="btn btn-forest">Browse Marketplace</Link>
              </div>
            ) : (
              (orders as any).map((order: any, idx: number) => (
                <div key={order.id} 
                  style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', animation: `fade-up 0.5s ease ${idx * 60}ms both`, boxShadow: 'var(--sh-xs)' }}>
                  
                  {/* Order Header */}
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Order ID</span>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest)', fontFamily: 'monospace' }}>{order.order_number}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{ background: `${STATUS_COLORS[order.status]}15`, color: STATUS_COLORS[order.status], padding: '6px 14px', borderRadius: 10 }}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {order.items?.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                            <IcBox />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }} className="truncate">
                              {item.product?.name ?? 'Marketplace Item'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-2)', fontSize: '0.88rem' }}>
                            ₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div style={{ padding: '16px 24px', background: 'var(--cream)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Payment: <span style={{ fontWeight: 700, color: order.payment_status === 'paid' ? 'var(--ok)' : 'var(--warn)' }}>{order.payment_status.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
