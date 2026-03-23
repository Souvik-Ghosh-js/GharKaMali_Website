'use client';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import toast from 'react-hot-toast';

/* Icons */
const IcX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcTrash   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcCart    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcLeaf    = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;

/* Product icon map */
const PRODUCT_ICONS: Record<string, () => JSX.Element> = {
  soil:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>,
  pest:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  pot:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 2h6l1 5H8z"/><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7"/></svg>,
  fert:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  plant: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  tool:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  default: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
};

function getProductIcon(category: string, icon: string) {
  if (icon && PRODUCT_ICONS[icon]) return PRODUCT_ICONS[icon];
  const cat = category.toLowerCase();
  if (cat.includes('soil') || cat.includes('compost')) return PRODUCT_ICONS.soil;
  if (cat.includes('pest')) return PRODUCT_ICONS.pest;
  if (cat.includes('pot') || cat.includes('planter')) return PRODUCT_ICONS.pot;
  if (cat.includes('fertilizer')) return PRODUCT_ICONS.fert;
  if (cat.includes('plant')) return PRODUCT_ICONS.plant;
  if (cat.includes('tool')) return PRODUCT_ICONS.tool;
  return PRODUCT_ICONS.default;
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart();

  if (!isOpen) return null;

  const total = totalItems();
  const price = totalPrice();

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(11,61,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}>
              <IcCart />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Your Cart</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{total} {total === 1 ? 'item' : 'items'}</div>
            </div>
          </div>
          <button onClick={closeCart} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <IcX />
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', marginBottom: 20, opacity: 0.5 }}>
                <IcLeaf />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text)' }}>Your cart is empty</div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>Add plants, tools & fertilizers from our garden shop</p>
              <button onClick={closeCart} className="btn btn-forest btn-sm">
                Browse Shop
                <IcArrow />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => {
                const Icon = getProductIcon(item.category, item.icon);
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px', background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--border)', transition: 'all 0.2s' }}>
                    {/* Icon */}
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                      <Icon />
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.3, marginBottom: 2 }} className="truncate">{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>{item.category}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Qty */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 99, padding: '4px 10px', border: '1px solid var(--border)' }}>
                          <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>−</button>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>+</button>
                        </div>
                        {/* Price + delete */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--forest)' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          <button onClick={() => { removeItem(item.id); toast.success('Removed from cart'); }} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.07)', color: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.07)'}>
                            <IcTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only when items exist */}
        {items.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal ({total} items)</span>
              <span style={{ fontWeight: 600 }}>₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
              <span style={{ fontWeight: 600, color: 'var(--ok)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--forest)' }}>₹{price.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={() => toast.success('Checkout coming soon! We are working on payment integration.')}
              className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '14px' }}>
              Proceed to Checkout
              <IcArrow />
            </button>
            <button onClick={closeCart} className="btn btn-outline w-full btn-sm" style={{ justifyContent: 'center', marginTop: 10 }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
