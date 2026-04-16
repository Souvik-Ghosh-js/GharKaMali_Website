'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/store/cart';
import toast from 'react-hot-toast';
import { getShopCategories, getShopProducts } from '@/lib/api';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const IcSearch = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPlus = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcCart = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcStar = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcLeaf = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;

const WA_URL = 'https://wa.me/919876543210?text=Hi%20GharKaMali!%20I%20want%20to%20know%20more%20about%20a%20product.';

const CATEGORY_ICONS: Record<string, () => JSX.Element> = {
  'plants': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  'soil': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/></svg>,
  'fertilizer': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  'tools': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  'pots': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 2h6l1 5H8z"/><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7"/></svg>,
  'seeds': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 16.5V22M8 19.5l4-3 4 3"/></svg>,
  'pesticide': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/></svg>,
  'all': () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
};

function ShopPageInner() {
  const searchParams = useSearchParams();
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sort, setSort] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { addItem, items, openCart, totalItems, updateQty, removeItem } = useCart();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Sync search from URL (e.g. when navbar search redirects here)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  // 3D GSAP + Three.js-lite canvas hero
  useEffect(() => {
    const canvas = document.getElementById('shopHeroCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;

    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 1, hue: Math.random() > 0.5 ? 140 : 45,
    }));

    let anim: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,20,10,0.15)';
      ctx.fillRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},60%,50%,0.5)`;
        ctx.fill();
      });
      // Connect close particles
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(3,65,26,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      anim = requestAnimationFrame(draw);
    };
    ctx.fillStyle = 'rgb(3,20,10)';
    ctx.fillRect(0, 0, W, H);
    draw();
    return () => cancelAnimationFrame(anim);
  }, []);

  // GSAP animations
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.shop-hero-content > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo('.cat-tabs-row', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.5 });
    };
    init();
  }, []);

  useEffect(() => {
    if (!loading) {
      const init = async () => {
        const gsap = (await import('gsap')).default;
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);
        gsap.utils.toArray('.product-tile').forEach((card: any, i) => {
          gsap.fromTo(card,
            { opacity: 0, y: 60, rotateX: 12, scale: 0.93, transformPerspective: 900 },
            { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.75, delay: (i % 4) * 0.09, ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' }
            }
          );
          card.addEventListener('mouseenter', () => gsap.to(card, { y: -8, rotateX: -5, rotateY: 3, transformPerspective: 900, duration: 0.3, ease: 'power2.out', boxShadow: '0 24px 60px rgba(3,65,26,0.25)' }));
          card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, rotateX: 0, rotateY: 0, duration: 0.4, ease: 'power3.out', boxShadow: 'var(--sh-sm)' }));
        });
        ScrollTrigger.refresh();
      };
      init();
    }
  }, [loading, products]);

  useEffect(() => {
    getShopCategories().then((d: any) => setCategories(['All', ...(Array.isArray(d) ? d : [])])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (cat !== 'All') params.category = cat;
    if (search) params.search = search;
    if (sort && sort !== 'featured') params.sort = sort;
    const t = setTimeout(() => {
      getShopProducts(params).then((d: any) => {
        let result = Array.isArray(d) ? d : [];
        if (sort === 'price_asc') result = [...result].sort((a,b) => Number(a.price) - Number(b.price));
        if (sort === 'price_desc') result = [...result].sort((a,b) => Number(b.price) - Number(a.price));
        if (sort === 'rating') result = [...result].sort((a,b) => Number(b.rating||4.5) - Number(a.rating||4.5));
        setProducts(result);
      }).catch(() => setProducts([])).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [cat, search, sort]);

  const getQty = (id: number) => items.find(i => i.id === id)?.qty ?? 0;
  const handleAdd = (p: any) => {
    addItem({ id: p.id, name: p.name, price: Number(p.price), mrp: Number(p.mrp), category: p.category?.name || 'General', icon: p.icon_key || 'default' });
    toast.success(`${p.name} added!`, { duration: 1800 });
  };
  const cartCount = mounted ? totalItems() : 0;

  return (
    <SmoothScrollProvider>
      <Navbar/>
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>

        {/* ── FUTURISTIC HERO ── */}
        <div ref={heroRef} style={{ position: 'relative', height: 'clamp(320px,45vw,480px)', overflow: 'hidden', background: 'rgb(3,16,8)' }}>
          <canvas id="shopHeroCanvas" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>
          {/* Glowing radial */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', background: 'radial-gradient(ellipse, rgba(3,65,26,0.35) 0%, transparent 70%)', pointerEvents: 'none' }}/>
          {/* Grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(3,65,26,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(3,65,26,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}/>

          <div className="container shop-hero-content" style={{ position: 'relative', zIndex: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 99, padding: '6px 18px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', animation: 'badgePulse 2s infinite' }}/>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(201,168,76,0.9)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Plant Store</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,6vw,4.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 0.95, textShadow: '0 0 60px rgba(3,65,26,0.8)' }}>
              Everything your<br/><span style={{ color: '#c9a84c', fontStyle: 'normal' }}>garden needs</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.9rem,1.5vw,1.1rem)', maxWidth: 480, lineHeight: 1.7 }}>
              Premium plants, quality tools, organic fertilizers — curated by expert plant experts
            </p>
          </div>
        </div>

        {/* ── STICKY CART BAR ── */}
        {mounted && cartCount > 0 && (
          <div style={{ position: 'sticky', top: 'var(--nav-h)', zIndex: 100, background: 'var(--forest)', padding: '12px 0', boxShadow: '0 4px 20px rgba(3,65,26,0.3)' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
                <IcCart/><span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
              </div>
              <button onClick={openCart} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: '#fff', color: 'var(--forest)', borderRadius: 10, border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                View Cart →
              </button>
            </div>
          </div>
        )}

        <div className="container" style={{ paddingTop: 'clamp(44px, 10vw, 72px)', paddingBottom: 80 }}>
          {/* Filter bar: Search + Category tabs + Sort */}
          <div className="cat-tabs-row" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', marginTop: 'clamp(12px, 3vw, 24px)' }}>
            {/* Row 1: Search + Sort */}
            <div style={{ display: 'flex', gap: 10, flex: '1 1 100%', alignItems: 'center' }} className="search-sort-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--forest)', opacity: 0.5 }}><IcSearch /></div>
                <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 42px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 16, color: 'var(--forest)', fontSize: '0.9rem', fontFamily: 'var(--font-body)', fontWeight: 600, outline: 'none', boxSizing: 'border-box', boxShadow: 'var(--sh-xs)' }}
                />
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ flex: '0 0 auto', padding: '12px 16px', borderRadius: 16, border: '1.5px solid var(--border)', background: '#fff', color: 'var(--forest)', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none', boxShadow: 'var(--sh-xs)' }}>
                <option value="featured">Featured</option>
                <option value="price_asc">₹ Low to High</option>
                <option value="price_desc">₹ High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Row 2: Category pills (Scrollable) */}
            <div className="cat-pills-container" style={{ display: 'flex', gap: 8, overflowX: 'auto', width: '100%', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {categories.map(c => {
                const name = typeof c === 'string' ? c : c.name;
                const Icon = CATEGORY_ICONS[name.toLowerCase()] || CATEGORY_ICONS['all'];
                const isActive = cat === name;
                return (
                  <button key={name} onClick={() => setCat(name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, border: `1.5px solid ${isActive ? 'var(--forest)' : 'var(--border)'}`, background: isActive ? 'var(--forest)' : '#fff', color: isActive ? '#fff' : 'var(--forest)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', flexShrink: 0, boxShadow: isActive ? '0 8px 20px rgba(3,65,26,0.15)' : 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{Icon && <Icon />}</span>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
                  <div style={{ height: 220, background: 'var(--bg-elevated)', animation: 'shimmer 1.5s ease infinite' }}/>
                  <div style={{ padding: 20 }}>
                    {[1,2,3].map(j => <div key={j} className="skeleton" style={{ height: j===1?20:j===2?14:36, marginBottom: 10, width: `${100-j*10}%` }}/>)}
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 28, border: '1.5px dashed var(--border)' }}>
              <div style={{ color: 'var(--forest)', opacity: 0.3, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 style={{ color: 'var(--forest)', marginBottom: 8 }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
            </div>
          ) : (
            <div className="product-grid" key={`${cat}-${search}-${sort}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, width: '100%' }}>
              {products.map((p, i) => {
                const qty = getQty(p.id);
                const price = Number(p.price), mrp = Number(p.mrp);
                const disc = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
                return (
                  <div key={p.id} className="product-tile card"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'stretch', 
                      padding: 0,
                      borderRadius: 24, 
                      gap: 0,
                      overflow: 'hidden',
                      animation: `fade-up 0.5s var(--ease) ${i * 40}ms both`,
                    }}>
                    
                    <Link href={`/shop/${p.slug || p._id || p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      {/* Image Area */}
                      <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #f0f7f2 0%, #e8f5ed 100%)', overflow: 'hidden', flexShrink: 0, borderBottom: '1px solid var(--border)', position: 'relative' }}>
                        {p.images?.[0] || p.thumbnail ? (
                          <img src={p.images?.[0] || p.thumbnail} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.2 }}>
                            <IcLeaf />
                          </div>
                        )}
                        {disc > 0 && <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: 99, fontSize: '0.68rem', fontWeight: 900, boxShadow: 'var(--sh-sm)' }}>{disc}% OFF</div>}
                      </div>
                      
                      {/* Content Area */}
                      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: 4 }}>
                           <span style={{ fontSize: '0.68rem', color: 'var(--earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {typeof p.category === 'string' ? p.category : p.category?.name || 'General'}
                           </span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', color: 'var(--forest)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{p.name}</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {[1,2,3,4,5].map(n => <IcStar key={n}/>)}
                           </div>
                           <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--forest)' }}>{Number(p.rating || 4.5).toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>

                    <div style={{ padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                         <div>
                           <div className="price-val" style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--forest)', lineHeight: 1 }}>₹{price.toLocaleString('en-IN')}</div>
                           {mrp > price && <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textDecoration: 'line-through', marginTop: 2 }}>₹{mrp.toLocaleString('en-IN')}</div>}
                         </div>
                         
                         <div>
                            {qty > 0 ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-elevated)', borderRadius: 10, padding: '4px 8px', border: '1.5px solid var(--border-mid)' }}>
                                <button onClick={(e) => { e.preventDefault(); qty > 1 ? updateQty(p.id, qty - 1) : removeItem(p.id); }} style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', border: '1px solid var(--border)', color: 'var(--forest)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                <span style={{ fontWeight: 800, color: 'var(--forest)', minWidth: 20, textAlign: 'center', fontSize: '0.9rem' }}>{qty}</span>
                                <button onClick={(e) => { e.preventDefault(); handleAdd(p); }} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--forest)', border: 'none', color: '#fff', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                              </div>
                            ) : (
                              <button onClick={(e) => { e.preventDefault(); handleAdd(p); }} 
                                style={{ background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 14px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(3,65,26,0.2)' }}>
                                Add
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

          {/* Bottom CTA */}
          <div style={{ marginTop: 80, padding: 'clamp(40px,6vw,60px) clamp(24px,5vw,48px)', background: 'var(--forest)', borderRadius: 36, textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'var(--sh-xl)' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <IcLeaf/>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#fff', margin: '12px 0', letterSpacing: '-0.02em' }}>Need expert help choosing?</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Book a gardener visit for personalized product recommendations</p>
              <Link href="/book?type=on-demand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#fff', color: 'var(--forest)', borderRadius: 14, fontWeight: 800, textDecoration: 'none', transition: 'all 0.25s' }}>
                Book Consultation →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer/>

      <style jsx global>{`
        .product-tile { cursor: default; transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .product-grid { animation: gridFadeIn 0.45s ease both; }
        
        /* Filter layout adjustments */
        @media (min-width: 992px) {
          .cat-tabs-row { flex-wrap: nowrap !important; gap: 20px !important; }
          .search-sort-row { flex: 0 0 auto !important; width: auto !important; gap: 12px !important; order: 1; }
          .cat-pills-container { flex: 1 !important; order: 2; border-left: 1px solid var(--border); padding-left: 20px !important; }
          .search-sort-row > select { order: 2; }
          .search-sort-row > div:first-child { order: 1; width: 240px; }
        }

        @media (max-width: 768px) {
          .cat-tabs-row { gap: 16px !important; }
          .search-sort-row { gap: 8px !important; }
          .search-sort-row > div:first-child input { font-size: 0.82rem !important; }
          .search-sort-row > select { font-size: 0.8rem !important; padding: 10px 12px !important; }
          .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .product-grid .product-tile { border-radius: 18px !important; }
          .product-grid .product-tile Link > div:nth-child(2) { padding: 12px 12px 0 !important; }
          .product-grid .product-tile h3 { font-size: 0.95rem !important; margin-bottom: 4px !important; height: 2.4em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
          .product-grid .product-tile Link > div:nth-child(2) > div:last-child { margin-bottom: 8px !important; gap: 4px !important; }
          .product-grid .product-tile > div:last-child { padding: 0 12px 12px !important; }
          .product-grid .product-tile > div:last-child > div { padding-top: 12px !important; }
          .product-grid .product-tile .price-val { font-size: 1.1rem !important; }
          .product-grid .product-tile button { padding: 6px 12px !important; font-size: 0.7rem !important; border-radius: 8px !important; }
          .container { padding-left: 12px !important; padding-right: 12px !important; }
          .product-tile Link > div:first-child { height: 160px !important; }
        }

        @keyframes gridFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        
        .skeleton{background:linear-gradient(90deg,var(--bg-elevated) 25%,var(--cream-dark) 50%,var(--bg-elevated) 75%);background-size:200% 100%;animation:shimmer 1.6s ease infinite;border-radius:8px}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        input::placeholder{color:var(--text-faint); opacity: 0.6;}
      `}</style>
    </SmoothScrollProvider>
  );
}

export default function ShopPage() { return <Suspense><ShopPageInner /></Suspense>; }
