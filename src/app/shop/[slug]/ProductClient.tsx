'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/store/cart';
import { getShopProducts } from '@/lib/api';
import toast from 'react-hot-toast';

/* ── ICONS ── */
const IcCart   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcStar   = ({ f = true }: { f?: boolean }) => <svg width="13" height="13" viewBox="0 0 24 24" fill={f ? '#C9A84C' : 'none'} stroke="#C9A84C" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcLeaf   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcTruck  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcReturn = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>;
const IcWA     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const IcChevronLeft  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;

const WA_URL    = 'https://wa.me/919643701701?text=Hi%20GharKaMali!%20I%20want%20to%20know%20more%20about%20a%20product.';
const PLACEHOLDER = '/no-img.svg';

const DETAIL_TABS = [
  { id: 'highlights',  label: 'Highlights' },
  { id: 'description', label: 'Description' },
  { id: 'faq',         label: 'FAQ' },
];

interface Props {
  slug: string;
  initialProduct?: any;
}

export default function ProductClient({ slug, initialProduct }: Props) {
  const [product, setProduct]     = useState<any>(initialProduct ?? null);
  const [related, setRelated]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(!initialProduct);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);
  const [activeTab, setActiveTab] = useState('highlights');

  const { addItem } = useCart();

  useEffect(() => {
    if (initialProduct) {
      getShopProducts({ limit: 100 })
        .then((all: any) => {
          const list: any[] = Array.isArray(all) ? all : [];
          setRelated(
            list
              .filter((p: any) =>
                String(p.id) !== slug &&
                String(p._id) !== slug &&
                p.category?.name === initialProduct.category?.name
              )
              .slice(0, 4)
          );
        })
        .catch(() => {});
      return;
    }

    setLoading(true);
    getShopProducts({ limit: 100 })
      .then((all: any) => {
        const list: any[] = Array.isArray(all) ? all : [];
        const found = list.find(
          (p: any) =>
            String(p.id)   === slug ||
            String(p._id)  === slug ||
            String(p.slug) === slug
        );
        setProduct(found ?? null);
        if (found) {
          setRelated(
            list
              .filter((p: any) =>
                String(p.id) !== slug &&
                String(p._id) !== slug &&
                p.category?.name === found.category?.name
              )
              .slice(0, 4)
          );
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, initialProduct]);

  useEffect(() => {
    if (!product) return;
    const run = async () => {
      const gsap = (await import('gsap')).default;
      gsap.fromTo('.pdp-gallery', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.05 });
      gsap.fromTo('.pdp-info',    { opacity: 0, x:  20 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
    };
    run();
  }, [product]);

  const images: string[] = product?.images?.length
    ? product.images
    : product?.thumbnail ? [product.thumbnail] : [PLACEHOLDER];

  const price = Number(product?.price ?? 0);
  const mrp   = Number(product?.mrp   ?? 0);
  const disc  = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price,
        mrp,
        category: product.category?.name || 'General',
        icon: product.icon_key || 'default',
      });
    }
    toast.success(`${qty}× ${product.name} added to cart`, { duration: 2000 });
  };

  if (loading) return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100svh', background: 'var(--bg)' }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1fr', gap: 48, alignItems: 'start' }}>
            <div className="skeleton" style={{ height: 480, borderRadius: 20 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[40, 70, 30, 55, 45, 90].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: i === 1 ? 36 : 18, width: `${w}%`, borderRadius: 8 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', minHeight: '80svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', textAlign: 'center', gap: 16, padding: '40px 20px' }}>
        <div style={{ color: 'var(--forest)', opacity: 0.25, marginBottom: 8 }}><IcLeaf /></div>
        <h1 style={{ color: 'var(--forest)', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 800 }}>Product Not Found</h1>
        <p style={{ color: 'var(--text-2)', maxWidth: 380, lineHeight: 1.7, fontSize: '0.9rem' }}>This product may have been removed or the link is incorrect.</p>
        <Link href="/shop" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--forest)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
          Back to Shop
        </Link>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100svh', background: '#fafaf8' }}>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <Link href="/"     style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Home</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <Link href="/shop" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Shop</Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{product.name}</span>
          </div>
        </nav>

        <div className="container" style={{ paddingTop: 36, paddingBottom: 72 }}>

          {/* ── MAIN GRID ── */}
          <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* LEFT — Gallery */}
            <div className="pdp-gallery" style={{ opacity: 0, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
              {/* Main image */}
              <div
                className="pdp-main-img"
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 'clamp(320px, 55vh, 540px)', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
              >
                <img
                  src={images[activeImg] || PLACEHOLDER}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {disc > 0 && (
                  <div style={{ position: 'absolute', top: 14, left: 14, background: '#16a34a', color: '#fff', padding: '5px 12px', borderRadius: 8, fontWeight: 800, fontSize: '0.78rem' }}>
                    {disc}% OFF
                  </div>
                )}
                {product.badge && (
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'var(--forest)', color: '#fff', padding: '5px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.78rem' }}>
                    {product.badge}
                  </div>
                )}
                {/* Image nav arrows if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    >
                      <IcChevronLeft />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    >
                      <IcChevronRight />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{ flexShrink: 0, width: 66, height: 66, borderRadius: 10, overflow: 'hidden', border: `2px solid ${activeImg === i ? 'var(--forest)' : 'var(--border)'}`, padding: 0, background: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Info */}
            <div className="pdp-info" style={{ opacity: 0 }}>

              {/* Category */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                {product.category?.name || 'Garden Marketplace'}
              </div>

              {/* Product name — SEO H1 */}
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.8vw, 2.2rem)', color: 'var(--forest)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, wordBreak: 'normal', overflowWrap: 'break-word' }}>
                {product.name}
              </h1>

              {/* Rating row */}
              {Number(product.rating) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(n => <IcStar key={n} f={n <= Math.round(Number(product.rating))} />)}
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.88rem' }}>{Number(product.rating).toFixed(1)}</span>
                  {product.review_count && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>({product.review_count} reviews)</span>}
                </div>
              )}

              {/* Price block */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--forest)', lineHeight: 1 }}>
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  {mrp > price && (
                    <>
                      <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
                      <span style={{ padding: '3px 10px', background: '#dcfce7', color: '#15803d', borderRadius: 6, fontWeight: 800, fontSize: '0.78rem' }}>{disc}% OFF</span>
                    </>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>Inclusive of all taxes</p>
              </div>

              {/* Short description */}
              {product.description && (
                <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: 20, fontWeight: 500 }}>
                  {product.description}
                </p>
              )}

              {/* Feature list */}
              {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  {product.features.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(3,65,26,0.1)', border: '1px solid rgba(3,65,26,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0, marginTop: 2 }}>
                        <IcCheck />
                      </div>
                      <span style={{ color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Qty + CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border-mid)', borderRadius: 10, overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 900, color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <div style={{ width: 38, textAlign: 'center', fontWeight: 800, color: 'var(--forest)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', lineHeight: '38px', fontSize: '0.95rem' }}>{qty}</div>
                  <button onClick={() => setQty(q => q + 1)} style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 900, color: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>In Stock</span>
              </div>

              <div className="pdp-cta-row" style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                <button
                  onClick={handleAddToCart}
                  style={{ flex: 1, padding: '14px 20px', background: 'var(--forest)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--font-body)', boxShadow: '0 4px 16px rgba(3,65,26,0.25)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(3,65,26,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(3,65,26,0.25)'; }}
                >
                  <IcCart /> Add to Cart
                </button>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '14px 18px', background: '#25D366', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 16px rgba(37,211,102,0.28)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                >
                  <IcWA /> Ask Expert
                </a>
              </div>

              {/* Trust badges */}
              <div className="pdp-trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
                {[
                  { icon: <IcTruck />,  label: 'Free Delivery', sub: 'Orders ₹499+' },
                  { icon: <IcReturn />, label: '7-Day Return',  sub: 'Easy returns' },
                  { icon: <IcShield />, label: 'Organic',       sub: 'Certified safe' },
                ].map(t => (
                  <div key={t.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ color: 'var(--forest)', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{t.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.72rem', color: 'var(--forest)', lineHeight: 1.3 }}>{t.label}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.sub}</div>
                  </div>
                ))}
              </div>

              {/* SKU */}
              {product.sku && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  SKU: <strong style={{ color: 'var(--text-2)' }}>{product.sku}</strong>
                </div>
              )}
            </div>
          </div>

          {/* ── PRODUCT DETAIL TABS ── */}
          <div style={{ marginTop: 56, background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {DETAIL_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ padding: '16px 24px', fontWeight: 700, fontSize: '0.85rem', border: 'none', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', color: activeTab === tab.id ? 'var(--forest)' : 'var(--text-2)', borderBottom: activeTab === tab.id ? '2px solid var(--forest)' : '2px solid transparent', transition: 'color 0.2s', fontFamily: 'inherit' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 32px' }}>
              {activeTab === 'highlights' && (
                <div className="pdt-table-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,1fr) 1fr', gap: 36 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 16, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Highlights</h2>
                    {product.features && Array.isArray(product.features) && product.features.length > 0 ? (
                      product.features.map((f: string) => (
                        <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(3,65,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0, marginTop: 1 }}><IcCheck /></div>
                          <span style={{ color: 'var(--text-2)', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No highlights added yet.</p>
                    )}
                  </div>
                  <div>
                    <h2 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 16, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Specifications</h2>
                    {[
                      ['Category', product.category?.name || 'Garden'],
                      ['Price',    `₹${price.toLocaleString('en-IN')}`],
                      mrp > 0 ? ['MRP', `₹${mrp.toLocaleString('en-IN')}`] : null,
                      ['Status',   'In Stock'],
                      product.sku ? ['SKU', product.sku] : null,
                    ].filter(Boolean).map(([label, value]: any) => (
                      <div key={label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--forest)', minWidth: 90, fontSize: '0.83rem' }}>{label}</span>
                        <span style={{ color: 'var(--text-2)', fontSize: '0.83rem' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div style={{ maxWidth: 640 }}>
                  <h2 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 14, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About this Product</h2>
                  {product.description && (
                    <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.85, fontWeight: 500 }}>{product.description}</p>
                  )}
                  {product.long_description && (
                    <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.85, fontWeight: 500, marginTop: 14 }}>{product.long_description}</p>
                  )}
                  {!product.description && !product.long_description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No description available.</p>
                  )}
                </div>
              )}

              {activeTab === 'faq' && (
                <div style={{ maxWidth: 640 }}>
                  <h2 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 18, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Frequently Asked Questions</h2>
                  {product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0 ? (
                    product.faqs.map((faq: any, i: number) => (
                      <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.9rem', marginBottom: 6 }}>Q. {faq.q || faq.question}</div>
                        <div style={{ color: 'var(--text-2)', fontSize: '0.87rem', lineHeight: 1.7 }}>{faq.a || faq.answer}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No FAQs added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RELATED PRODUCTS ── */}
          {related.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,2.2vw,1.6rem)', fontWeight: 800, color: 'var(--forest)' }}>You may also like</h2>
                <Link href="/shop" style={{ color: 'var(--forest)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>View All →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
                {related.map((p, i) => (
                  <Link
                    key={p.id || i}
                    href={`/shop/${p.slug || p._id || p.id}`}
                    className="card"
                    style={{ display: 'block', textDecoration: 'none', overflow: 'hidden', borderRadius: 14 }}
                  >
                    <div style={{ height: 160, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                      <img
                        src={p.images?.[0] || p.thumbnail || '/no-img.svg'}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </div>
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--earth)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 3 }}>{p.category?.name || 'Care'}</div>
                      <h3 style={{ fontSize: '0.88rem', color: 'var(--forest)', fontWeight: 800, marginBottom: 5, lineHeight: 1.3 }}>{p.name}</h3>
                      <div style={{ fontWeight: 900, color: 'var(--forest)', fontSize: '0.95rem' }}>₹{Number(p.price).toLocaleString('en-IN')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
