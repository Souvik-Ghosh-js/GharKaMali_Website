'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Footer from '@/components/Footer';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';

/* Icons */
const IcSearch  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPlus    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcCart    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcArrow   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcStar    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcCalPen  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

/* Product SVG icons by category */
const IcSoil   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" fill="rgba(11,61,46,0.08)"/><path d="M12 7c-1.2 1.5-1.8 3-1.8 3.8 0 1.2.8 2 1.8 2.4.9-.4 1.8-1.2 1.8-2.4 0-.8-.6-2.3-1.8-3.8z" fill="rgba(11,61,46,0.2)"/></svg>;
const IcNeem   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="rgba(11,61,46,0.08)"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcPot    = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M9 2h6l1 5H8z" fill="rgba(11,61,46,0.08)"/><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7" fill="rgba(11,61,46,0.06)"/></svg>;
const IcFert   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" fill="rgba(11,61,46,0.06)"/></svg>;
const IcPlant  = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" fill="rgba(201,168,76,0.15)"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcShear  = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="6" cy="6" r="3" fill="rgba(11,61,46,0.08)"/><circle cx="6" cy="18" r="3" fill="rgba(11,61,46,0.08)"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
const IcLily   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4.5 10-10S18 2 12 2z" fill="rgba(201,168,76,0.1)"/><path d="M12 6c0 0-4 2-4 6s4 6 4 6 4-2 4-6-4-6-4-6z" fill="rgba(11,61,46,0.1)"/></svg>;
const IcDrip   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(11,61,46,0.08)"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;

const CATEGORIES = ['All', 'Plants', 'Pots & Planters', 'Soil & Compost', 'Fertilizers', 'Tools', 'Pest Control'];
const PRODUCTS = [
  { id:1, name:'Premium Organic Potting Mix', price:499, mrp:699, cat:'Soil & Compost', ProductIcon: IcSoil, badge:'Bestseller', rating:4.8, reviews:234, desc:'Rich organic blend with perlite, vermiculite & slow-release nutrients. Perfect for all indoor & outdoor plants.', iconKey:'soil' },
  { id:2, name:'Neem Oil Concentrate 500ml', price:299, mrp:399, cat:'Pest Control', ProductIcon: IcNeem, badge:'Organic', rating:4.7, reviews:189, desc:'100% cold-pressed neem oil. Natural pesticide, fungicide & miticide safe for all plants and beneficial insects.', iconKey:'pest' },
  { id:3, name:'Handcrafted Terracotta Pot Set (3pc)', price:899, mrp:1299, cat:'Pots & Planters', ProductIcon: IcPot, badge:'Handcrafted', rating:4.9, reviews:156, desc:'Set of 3 artisan terracotta pots (4", 6", 8"). Perfect drainage, breathable walls, stunning craftsmanship.', iconKey:'pot' },
  { id:4, name:'Plant Growth Booster — NPK 19:19:19', price:649, mrp:849, cat:'Fertilizers', ProductIcon: IcFert, badge:'Top Rated', rating:4.6, reviews:312, desc:'Balanced water-soluble fertilizer for all stages of plant growth. Micronutrient enriched formula.', iconKey:'fert' },
  { id:5, name:'Monstera Deliciosa (Medium)', price:1299, mrp:1800, cat:'Plants', ProductIcon: IcPlant, badge:'Popular', rating:4.9, reviews:428, desc:'Beautiful split-leaf monstera. 30-40cm height, healthy root system, shipped in eco-packaging.', iconKey:'plant' },
  { id:6, name:'Pruning Shears — Premium Steel', price:799, mrp:999, cat:'Tools', ProductIcon: IcShear, badge:'Professional', rating:4.8, reviews:97, desc:'Japanese SK-5 high carbon steel blades. Ergonomic rubber grip. Includes leather sheath.', iconKey:'tool' },
  { id:7, name:'Peace Lily Indoor Plant', price:699, mrp:999, cat:'Plants', ProductIcon: IcLily, badge:'Air Purifier', rating:4.7, reviews:345, desc:'NASA-certified air purifying plant. Low maintenance, thrives in low light. Ships in premium ceramic pot.', iconKey:'plant' },
  { id:8, name:'Drip Irrigation Kit (Garden)', price:1899, mrp:2499, cat:'Tools', ProductIcon: IcDrip, badge:'DIY Kit', rating:4.5, reviews:78, desc:'Complete drip system for up to 20 plants. Includes timer, tubing, emitters and connectors.', iconKey:'tool' },
];

export default function ShopPage() {
  useScrollReveal();
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const { addItem, items, openCart, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  const filtered = PRODUCTS.filter(p =>
    (cat === 'All' || p.cat === cat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  
  const getQty = (id: number) => items.find(i => i.id === id)?.qty ?? 0;
  
  const handleAdd = (p: typeof PRODUCTS[0]) => {
    addItem({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, category: p.cat, icon: p.iconKey });
    toast.success('Added to cart', { duration: 1800 });
  };
  
  const cartCount = mounted ? totalItems() : 0;
  
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(150deg, var(--forest) 0%, var(--forest-mid) 60%, var(--forest-light) 100%)', padding: '60px 0 90px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 99, padding: '7px 18px', marginBottom: 20 }}>
              <div style={{ width: 16, height: 16, color: 'var(--gold-light)', display: 'flex' }}><IcCart /></div>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>Garden Marketplace</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Everything your garden <em style={{ color: 'var(--gold-light)' }}>needs</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', maxWidth: 520, margin: '0 auto 32px' }}>
              Premium plants, quality tools, organic fertilizers — curated by our expert gardeners
            </p>
            {/* Search */}
            <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
              <input type="text" placeholder="Search plants, pots, fertilizers..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '14px 20px 14px 48px', background: 'rgba(255,255,255,0.96)', border: 'none', borderRadius: 99, fontSize: '0.93rem', fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--text)', boxShadow: 'var(--sh-lg)' }} />
              <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}><IcSearch /></span>
            </div>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: -44, paddingBottom: 80 }}>
          {/* Category tabs */}
          <div style={{ background: '#fff', borderRadius: 18, padding: 6, display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '8px 16px', borderRadius: 13, border: 'none', background: cat === c ? 'var(--forest)' : 'transparent', color: cat === c ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                {c}
              </button>
            ))}
          </div>
          
          {/* Cart sticky bar */}
          {mounted && cartCount > 0 && (
            <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 8px)', zIndex: 100, marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={openCart}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--forest)', color: '#fff', padding: '11px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, boxShadow: 'var(--sh-md)', transition: 'all 0.2s', animation: 'slide-up 0.3s var(--ease)', fontSize: '0.88rem' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--forest-mid)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--forest)')}>
                <IcCart />
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                <span style={{ background: 'rgba(255,255,255,0.13)', padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem' }}>View Cart</span>
              </button>
            </div>
          )}
          
          {/* Product grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 24, border: '1.5px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, color: 'var(--text-muted)', opacity: 0.4 }}><IcSearch /></div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 20 }}>
              {filtered.map((p, i) => {
                const qty = getQty(p.id);
                return (
                  <div key={p.id} className="product-card" style={{ animation: `fade-up 0.6s var(--ease) ${i * 60}ms both` }}>
                    {/* Image area */}
                    <div style={{ height: 196, background: `linear-gradient(135deg, hsl(${i * 45 + 120},22%,90%) 0%, hsl(${i * 45 + 140},18%,84%) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', color: 'var(--forest)' }}>
                      <p.ProductIcon />
                      <div style={{ position: 'absolute', top: 10, right: 10 }}>
                        <span className="badge badge-gold" style={{ fontSize: '0.58rem', padding: '3px 8px' }}>{p.badge}</span>
                      </div>
                      {qty > 0 && (
                        <div style={{ position: 'absolute', top: 10, left: 10, width: 22, height: 22, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800 }}>
                          {qty}
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div className="product-body" style={{ padding: '16px 18px 20px', background: '#fff' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{p.cat}</div>
                      <h3 style={{ fontWeight: 700, fontSize: '0.93rem', marginBottom: 6, lineHeight: 1.35, color: 'var(--text)' }}>{p.name}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</p>
                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 1 }}>{[1,2,3,4,5].map(n => <IcStar key={n} />)}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)' }}>{p.rating}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({p.reviews})</span>
                      </div>
                      {/* Price + CTA */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.15rem', color: 'var(--forest)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-faint)', textDecoration: 'line-through', marginLeft: 6 }}>₹{p.mrp.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ok)', marginLeft: 5 }}>{Math.round((1 - p.price / p.mrp) * 100)}% off</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {qty > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(11,61,46,0.06)', borderRadius: 99, padding: '5px 12px', border: '1px solid var(--border)' }}>
                              <button onClick={() => { const item = items.find(i => i.id === p.id); if (item) { item.qty > 1 ? useCart.getState().updateQty(p.id, item.qty - 1) : useCart.getState().removeItem(p.id); } }} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', width: 18, height: 18, justifyContent: 'center' }}>−</button>
                              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--forest)', minWidth: 14, textAlign: 'center' }}>{qty}</span>
                              <button onClick={() => handleAdd(p)} style={{ background: 'none', border: 'none', color: 'var(--forest)', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', width: 18, height: 18, justifyContent: 'center' }}>+</button>
                            </div>
                          ) : (
                            <button onClick={() => handleAdd(p)}
                              style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.2s', flexShrink: 0 }}
                              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                              <IcPlus />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Bottom banner */}
          <div style={{ marginTop: 64, background: 'linear-gradient(135deg, var(--forest), var(--forest-mid))', borderRadius: 28, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.35rem', fontWeight: 800, marginBottom: 8 }}>Need expert help choosing?</h3>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.88rem' }}>Book a gardener visit and get personalized plant & product recommendations</p>
            </div>
            <Link href="/book" className="btn btn-primary" style={{ flexShrink: 0, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              <IcCalPen /> Book a Consultation
            </Link>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        @media(max-width:640px){ div[style*="minmax(264px"]{grid-template-columns:1fr !important;} }
      `}</style>
    </>
  );
}