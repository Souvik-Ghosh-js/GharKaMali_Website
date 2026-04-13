'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { getMyOrders } from '@/lib/api';

const IcBox = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const IcArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const IcCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const IcTruck = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#92400E',
  processing: '#0369A1',
  shipped: '#1E40AF',
  delivered: '#14532D',
  cancelled: '#991B1B',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, authLoading, router]);

  const { data: allOrders, isLoading: bLoading } = useQuery({
    queryKey: ['my-shop-orders'],
    queryFn: getMyOrders,
    enabled: isAuthenticated
  });

  const order = (allOrders as any[])?.find(o => o.id.toString() === id);

  if (authLoading || bLoading) return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton" style={{ width: 400, height: 400, borderRadius: 32 }} />
    </div>
  );

  if (!order) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100svh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Order not found</h2>
          <Link href="/shop/orders" className="btn btn-forest">Back to Orders</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100svh', background: 'var(--bg)', paddingTop: 'calc(var(--nav-h) + 60px)', paddingBottom: 100 }}>
        <div className="container">
          
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <Link href="/shop/orders" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16, border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 99, width: 'fit-content' }}>
                <span style={{ transform: 'rotate(180deg)', display: 'flex' }}><IcArrow /></span> Back to All Orders
              </Link>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--forest)', letterSpacing: '-0.02em', marginBottom: 8 }}>Order Details</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--forest)', fontSize: '1.1rem' }}>#{order.order_number}</span>
                <div style={{ background: `${STATUS_COLORS[order.status]}15`, color: STATUS_COLORS[order.status], padding: '6px 14px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {order.status.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-faint)', marginBottom: 4 }}>Total Amount Paid</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--gold-deep)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
            
            {/* Left Column: Items */}
            <div>
              <div style={{ background: '#fff', borderRadius: 32, border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IcBox />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest)' }}>Order Items ({order.items?.length || 0})</h3>
                </div>
                <div style={{ padding: '0 32px' }}>
                  {order.items?.map((item: any, i: number) => (
                    <div key={item.id} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 0', borderBottom: i === order.items.length - 1 ? 'none' : '1px solid var(--border-light)' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg)', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={item.product?.thumbnail || item.product?.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{item.product?.name ?? 'Marketplace Item'}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '1.1rem' }}>₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>₹{Number(item.price).toLocaleString('en-IN')} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gardener Visits Associated with Order */}
              {order.mali_bookings?.length > 0 && (
                <div style={{ marginTop: 24, background: '#fff', borderRadius: 32, border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
                  <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'rgba(3,65,26,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--forest)' }}>Assigned Gardener Visits</h3>
                  </div>
                  <div style={{ padding: '0 32px' }}>
                    {order.mali_bookings.map((b: any, idx: number) => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: idx === order.mali_bookings.length - 1 ? 'none' : '1px solid var(--border-light)', padding: '24px 0' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ fontWeight: 900, fontFamily: 'monospace', color: 'var(--forest)', fontSize: '0.95rem' }}>#{b.booking_number}</div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--forest)', textTransform: 'uppercase', border: '1px solid var(--border)' }}>{b.status}</div>
                          </div>
                          <div style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 800, marginBottom: 6 }}>
                             {new Date(b.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                             {b.scheduled_time && <span style={{ color: 'var(--gold-deep)' }}> at {b.scheduled_time}</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600, lineHeight: 1.5 }} className="truncate">{b.service_address}</p>
                        </div>
                        <Link href={`/bookings/${b.id}`} className="btn btn-outline btn-sm" style={{ padding: '10px 20px', fontSize: '0.78rem', flexShrink: 0, fontWeight: 800 }}>Visit Details →</Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Timeline */}
              <div style={{ marginTop: 32, background: '#fff', borderRadius: 32, border: '1.5px solid var(--border)', padding: 32, boxShadow: 'var(--sh-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--forest)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <IcTruck /> Shipping Status
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 40px' }}>
                  <div style={{ position: 'absolute', top: 12, left: 'calc(40px + 12px)', right: 'calc(40px + 12px)', height: 2, background: 'var(--border)' }} />
                  {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                    const isDone = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= i;
                    return (
                      <div key={step} style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: 80 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDone ? 'var(--forest)' : '#fff', border: `2px solid ${isDone ? 'var(--forest)' : 'var(--border)'}`, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isDone && <IcCheck />}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isDone ? 'var(--forest)' : 'var(--text-faint)' }}>{step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Summaries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Payment Info */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 32, padding: 32, border: '1.5px solid var(--border-mid)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                    <span style={{ fontWeight: 700, color: 'var(--ok)' }}>FREE</span>
                  </div>
                  <div style={{ margin: '10px 0', borderTop: '1px dashed var(--border)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, color: 'var(--forest)' }}>
                    <span>Total</span>
                    <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: order.payment_status === 'paid' ? 'var(--ok)' : 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <IcCheck />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Payment Status</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: order.payment_status === 'paid' ? 'var(--ok)' : 'var(--warn)' }}>{order.payment_status.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div style={{ background: '#fff', borderRadius: 32, padding: 32, border: '1.5px solid var(--border)', boxShadow: 'var(--sh-xs)' }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Delivery Address</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.7, fontWeight: 500 }}>
                  {order.shipping_address}<br/>
                  {order.shipping_city} {order.shipping_pincode}
                </p>
                {order.notes && (
                  <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', borderRadius: 16, fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                    <strong>Note:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Support */}
              <div style={{ background: 'var(--forest)', borderRadius: 32, padding: 32, textAlign: 'center', color: '#fff' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 20 }}>Have an issue with your order?</p>
                <Link href="/complaints" className="btn btn-outline" style={{ background: '#fff', color: 'var(--forest)', border: 'none', width: '100%', justifyContent: 'center' }}>Contact Support</Link>
              </div>

            </div>
          </div>

        </div>
      </div>
      <Footer />
      <style>{`
        @media (max-width: 1000px) {
          .order-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
