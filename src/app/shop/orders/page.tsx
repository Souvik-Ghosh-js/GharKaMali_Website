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
        <div className="container">
          
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
          {/* Grid Layout */}
          <div className="orders-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
            animation: 'fade-up 0.5s ease'
          }}>
            {isLoading ? (
              Array(6).fill(null).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 260, borderRadius: 28 }} />
              ))
            ) : !orders || (orders as any).length === 0 ? (
              <div style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', borderRadius: 28, padding: '64px 32px', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--forest)', opacity: 0.2 }}>
                  <IcShop />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', marginBottom: 8, color: 'var(--forest)' }}>No orders found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Start your garden transformation journey today.</p>
                <Link href="/shop" className="btn btn-forest" style={{ textDecoration: 'none', display: 'inline-flex' }}>Browse Marketplace</Link>
              </div>
            ) : (
              (orders as any).map((order: any, idx: number) => (
                <Link key={order.id} 
                  href={`/shop/orders/${order.id}`}
                  style={{ 
                    borderRadius: 24, 
                    position: 'relative',
                    gap: 16,
                    textDecoration: 'none',
                    animation: `fade-up 0.5s var(--ease) ${idx * 40}ms both`,
                    transition: 'all 0.3s var(--ease)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    boxShadow: 'var(--sh-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 24
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-mid)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--sh-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--sh-sm)';
                  }}
                >
                  {/* Status Indicator Bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: STATUS_COLORS[order.status] }} />

                  {/* Top: Header Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${STATUS_COLORS[order.status]}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: STATUS_COLORS[order.status], flexShrink: 0 }}>
                      <IcBox />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--forest)' }}>#{order.order_number.slice(-8)}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 600 }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <span style={{ 
                      marginLeft: 'auto',
                      fontSize:'0.6rem', fontWeight:800, color:STATUS_COLORS[order.status], 
                      background:`${STATUS_COLORS[order.status]}12`, padding:'3px 10px', 
                      borderRadius:8, textTransform:'uppercase', letterSpacing:'0.05em' 
                    }}>{order.status}</span>
                  </div>

                  {/* Middle: Items preview */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Order Items ({order.items?.length || 0})</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                      {order.items?.map((it:any) => it.product?.name).join(', ')}
                    </p>
                  </div>

                  {/* Bottom: Payment & Price */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Payment</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: order.payment_status === 'paid' ? 'var(--ok)' : 'var(--warn)' }}>{order.payment_status.toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
