'use client';
import { useState } from 'react';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createOrder } from '@/lib/api';
import { useAuth } from '@/store/auth';

/* Icons */
const IcX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const IcCart = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
const IcArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const IcLeaf = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>;
const IcCheck = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;

/* Product icon map */
const PRODUCT_ICONS: Record<string, () => JSX.Element> = {
  tool: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  service: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  default: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
};

function getProductIcon(icon: string, type?: string) {
  if (type === 'service') return PRODUCT_ICONS.service;
  return icon && PRODUCT_ICONS[icon] ? PRODUCT_ICONS[icon] : PRODUCT_ICONS.default;
}

type CheckoutStep = 'cart' | 'address' | 'processing' | 'success';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice, clearCart, wantsMali } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [maliBooked, setMaliBooked] = useState<any>(null);

  if (!isOpen) return null;

  const total = totalItems();
  const price = totalPrice();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setStep('processing');

    try {
      const payload: any = {
        items: items.filter(i => !i.type || i.type === 'product').map(i => ({ product_id: i.id, quantity: i.qty })),
        shipping_address: address,
        shipping_city: city,
        shipping_pincode: pincode,
        // Book a Mali options
        service_bookings: items.filter(i => i.type === 'service').map(i => i.bookingDetails),
        book_mali: wantsMali || items.some(i => i.type === 'service'),
        service_address_for_mali: items.find(i => i.type === 'service')?.bookingDetails?.service_address || address,
      };

      const result: any = await createOrder(payload);
      setOrderNum(result?.order_number || result?.txnid || 'GKM-ORD-' + Date.now());
      setMaliBooked(wantsMali ? (result?.mali_booking || { status: 'pending' }) : null);
      setStep('success');
      clearCart();
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please try again.');
      setStep('address');
    }
  };

  const handleClose = () => {
    closeCart();
    setTimeout(() => {
      setStep('cart');
      setAddress('');
      setCity('');
      setPincode('');
      setOrderNum('');
      setMaliBooked(null);
    }, 400);
  };

  return (
    <>
      <div className="cart-overlay" onClick={handleClose} />
      <div className="cart-drawer" style={{ background: '#fff', color: 'var(--forest)' }}>
        {/* Header */}
        <div className="cart-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
              <IcCart />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--forest)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                {step === 'cart' ? 'Your Cart' : step === 'address' ? 'Delivery Details' : step === 'processing' ? 'Processing…' : 'Order Placed!'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--sage)', fontWeight: 600 }}>
                {step === 'cart' ? `${total} ${total === 1 ? 'item' : 'items'}` : step === 'success' ? 'Payment successful' : ''}
              </div>
            </div>
          </div>
          <button onClick={handleClose} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'rgba(3,65,26,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(3,65,26,0.1)'; e.currentTarget.style.color = 'var(--forest-mid)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,65,26,0.05)'; e.currentTarget.style.color = 'var(--forest)'; }}>
            <IcX />
          </button>
        </div>

        {/* ── STEP: CART ── */}
        {step === 'cart' && (
          <>
            <div className="cart-body">
              {items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px 24px' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', marginBottom: 20, border: '1px solid var(--border)' }}><IcLeaf /></div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8, color: 'var(--forest)' }}>Your cart is empty</div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--sage)', lineHeight: 1.7, marginBottom: 24 }}>Add plants, tools & fertilizers from our garden shop</p>
                  <button onClick={closeCart} className="btn btn-primary btn-sm">Browse Market <IcArrow /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => {
                    const Icon = getProductIcon(item.icon, item.type);
                    const isService = item.type === 'service';
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px', background: isService ? 'rgba(3,65,26,0.03)' : 'var(--bg)', borderRadius: 16, border: isService ? '1px dashed var(--forest-mid)' : '1px solid var(--border-mid)', transition: 'all 0.2s', boxShadow: 'var(--sh-xs)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}><Icon /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)', lineHeight: 1.3, marginBottom: 2 }} className="truncate">
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isService ? 'var(--forest-mid)' : 'var(--earth)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isService && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>}
                            {item.category}
                          </div>
                          
                          {isService && item.bookingDetails && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--sage)', fontWeight: 600, marginBottom: 8, background: '#fff', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                              <div>📅 {new Date(item.bookingDetails.scheduled_date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {item.bookingDetails.scheduled_time}</div>
                              <div className="truncate">📍 {item.bookingDetails.service_address}</div>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {!isService ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 99, padding: '4px 10px', border: '1.5px solid var(--border-mid)' }}>
                                <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, fontWeight: 800 }}>−</button>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                                <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, fontWeight: 800 }}>+</button>
                              </div>
                            ) : <div />}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest)' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                               <button onClick={() => { removeItem(item.id); toast.success('Removed from cart'); }} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.1)', color: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                 onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.2)'}
                                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.1)'}>
                                 <IcTrash />
                               </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Gardener Upsell */}
                  {!items.some(i => i.type === 'service') && !wantsMali && (
                    <div style={{ marginTop: 8, padding: '16px', background: 'rgba(212,163,115,0.06)', borderRadius: 20, border: '1.5px dashed var(--gold)', display: 'flex', gap: 14, alignItems: 'center' }}>
                       <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-deep)', flexShrink: 0 }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)', marginBottom: 2 }}>Need a Gardener?</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--sage)', fontWeight: 600, marginBottom: 8 }}>Book a professional visit with these plants</div>
                          <Link href="/book?type=on-demand" onClick={closeCart} style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-deep)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                             Book On-Demand Visit <IcArrow />
                          </Link>
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="cart-footer" style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-2)' }}>
                  <span>Subtotal ({total} items)</span>
                  <span style={{ fontWeight: 800 }}>₹{price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, fontSize: '0.9rem', color: 'var(--text-2)' }}>
                  <span>Delivery Cost</span>
                  <span style={{ fontWeight: 800, color: 'var(--forest-mid)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 18, marginBottom: 24 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest)' }}>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--forest)' }}>₹{price.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={() => setStep('address')} className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '16px', fontWeight: 800 }}>
                  Checkout Now <IcArrow />
                </button>
                <button onClick={closeCart} className="btn btn-outline w-full" style={{ justifyContent: 'center', marginTop: 12, opacity: 0.9 }}>Continue Shopping</button>
              </div>
            )}
          </>
        )}

        {/* ── STEP: ADDRESS ── */}
        {step === 'address' && (
          <>
            <div className="cart-body">
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)', marginBottom: 4 }}>Order Summary</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600 }}>{total} items · <strong style={{ color: 'var(--forest)' }}>₹{price.toLocaleString('en-IN')}</strong> total</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--forest)' }}>Delivery Address *</label>
                  <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                    placeholder="House/Flat No, Street, Colony..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', background: '#fff', outline: 'none', resize: 'none', color: 'var(--forest)', boxSizing: 'border-box', transition: 'border-color 0.2s', boxShadow: 'var(--sh-xs)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--forest)' }}>City</label>
                    <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Noida"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', background: '#fff', outline: 'none', color: 'var(--forest)', boxSizing: 'border-box', boxShadow: 'var(--sh-xs)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--forest)' }}>Pincode</label>
                    <input value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 201301"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', background: '#fff', outline: 'none', color: 'var(--forest)', boxSizing: 'border-box', boxShadow: 'var(--sh-xs)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border-gold)', fontSize: '0.8rem', color: 'var(--sage)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <strong style={{ color: 'var(--forest)' }}>Secure checkout.</strong> Instantly processed securely via 256-bit encryption. Payment simulated for demo.
                </div>
              </div>
            </div>
            <div className="cart-footer" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={handleCheckout} disabled={!address.trim()} className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '14px', opacity: !address.trim() ? 0.5 : 1 }}>
                Complete Purchase · ₹{price.toLocaleString('en-IN')} <IcArrow />
              </button>
              <button onClick={() => setStep('cart')} className="btn btn-outline w-full btn-sm" style={{ justifyContent: 'center', marginTop: 10 }}>← Back to Cart</button>
            </div>
          </>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'processing' && (
          <div className="cart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', marginBottom: 24, animation: 'pulse 1.2s ease infinite' }}>
              <IcCart />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--forest)', marginBottom: 8 }}>Processing Securely…</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--sage)', fontWeight: 600 }}>Please wait, confirming details across platform</p>
            <style>{`@keyframes pulse { 0%,100%{transform:scale(1);box-shadow:var(--sh-xs)} 50%{transform:scale(1.08);box-shadow:var(--sh-md)} }`}</style>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
          <div className="cart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 24, animation: 'popIn 0.5s var(--ease)', boxShadow: 'var(--sh-md)' }}>
              <IcCheck />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.35rem', marginBottom: 8, color: 'var(--forest)' }}>Payment Successful!</div>
            <p style={{ fontSize: '0.9rem', color: 'var(--sage)', fontWeight: 600, lineHeight: 1.7, maxWidth: 280, marginBottom: 8 }}>
              Hooray! Expect delivery to your address soon.
            </p>
            {orderNum && (
              <div style={{ margin: '16px 0', padding: '12px 20px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px dashed var(--border-gold)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--earth)', marginBottom: 4, fontWeight: 700, letterSpacing: '0.1em' }}>ORDER RECEIPT NO.</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--forest)', fontSize: '1.05rem' }}>{orderNum}</div>
              </div>
            )}

            {/* Mali Booking Confirmation Card */}
            {maliBooked && (
              <div style={{ margin: '12px 0 16px', padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: 20, border: '1.5px solid var(--border-gold)', maxWidth: 320, width: '100%', textAlign: 'left', boxShadow: 'var(--sh-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--forest)' }}>Mali Visit Scheduled</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--sage)', lineHeight: 1.6, fontWeight: 500 }}>
                  A professional botanical expert will contact you within 24 hours to sync the right schedule.
                </div>
                {maliBooked.booking_number && (
                  <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--earth)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>REF: {maliBooked.booking_number}</div>
                )}
              </div>
            )}

            <button onClick={handleClose} className="btn btn-primary" style={{ padding: '14px 32px', marginTop: 20, width: '100%', justifyContent: 'center' }}>Enjoy your Day</button>
            <style>{`@keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
          </div>
        )}
      </div>
    </>
  );
}
