'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogs, getBlogCategories } from '@/lib/api';

const IcSearch = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcArrow  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcClock  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcBook   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 3H3v18h18V3zM3 9h18"/><path d="M9 3v18"/></svg>;
const IcEmpty  = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    getBlogCategories().then((d: any) => setCats(['All', ...(Array.isArray(d) ? d.map((c: any) => c.name || c) : [])])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true); setPage(1);
    const params: any = { limit: 9 };
    if (cat !== 'All') params.category = cat;
    if (search) params.search = search;
    const t = setTimeout(() => {
      getBlogs(params).then((d: any) => {
        const items = d?.items ?? (Array.isArray(d) ? d : []);
        setBlogs(items);
        setHasMore(items.length === 9);
      }).catch(() => setBlogs([])).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [cat, search]);

  const loadMore = async () => {
    const next = page + 1;
    const params: any = { limit: 9, page: next };
    if (cat !== 'All') params.category = cat;
    if (search) params.search = search;
    const d: any = await getBlogs(params);
    const items = d?.items ?? (Array.isArray(d) ? d : []);
    setBlogs(prev => [...prev, ...items]);
    setHasMore(items.length === 9);
    setPage(next);
  };

  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo('.blogs-hero-content > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.3 });
    };
    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.blog-card-item').forEach((card: any, i) => {
        gsap.fromTo(card, { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: (i % 3) * 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
        });
      });
    };
    if (!loading) init();
  }, [loading, blogs]);

  return (
    <>
      <Navbar/>
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
        {/* Bg orbs */}
        <div style={{ position: 'fixed', top: '5%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,65,26,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }}/>

        {/* Hero */}
        <div style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative', zIndex: 1, background: 'linear-gradient(160deg, rgba(3,65,26,0.04) 0%, var(--bg) 60%)' }}>
          <div className="container">
            <div className="blogs-hero-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--border-gold)', borderRadius: 99, padding: '8px 22px', marginBottom: 28, boxShadow: 'var(--sh-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6 }}><IcBook/> Botanical Journal</span>
              </div>
              <h1 className="display-1" style={{ color: 'var(--forest)', marginBottom: 20 }}>
                Learn realistic <span style={{ color: 'var(--earth)', fontStyle: 'normal' }}>plant care</span>
              </h1>
              <p style={{ fontSize: 'clamp(1rem,1.5vw,1.15rem)', color: 'var(--text-2)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.8 }}>
                Expert-written guides on everything from pest control to seasonal pruning.
              </p>
              {/* Search */}
              <div style={{ maxWidth: 460, margin: '0 auto', position: 'relative' }}>
                <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '16px 20px 16px 50px', background: '#fff', border: '2px solid var(--border)', borderRadius: 99, fontSize: '1rem', fontFamily: 'var(--font-body)', outline: 'none', color: 'var(--forest)', boxShadow: 'var(--sh-sm)', fontWeight: 600, transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--forest)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--forest)', display: 'flex' }}><IcSearch/></span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 80 }}>
          {/* Category Tabs */}
          {cats.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 40, scrollbarWidth: 'none' }}>
              {cats.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  color: cat === c ? '#fff' : 'var(--forest)',
                  fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-body)',
                  border: `1.5px solid ${cat === c ? 'var(--forest)' : 'var(--border)'}`,
                  transition: 'all 0.2s ease',
                }}>{c}</button>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 28 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 340, borderRadius: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border)', animation: 'shimmer 1.5s ease infinite' }}/>)}
            </div>
          ) : blogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ color: 'var(--forest)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}><IcEmpty/></div>
              <h3 style={{ color: 'var(--forest)', marginBottom: 8 }}>No articles found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {blogs.map((b: any, i) => (
                  <Link key={b._id || b.id} href={`/blogs/${b.slug}`} className="blog-card-item card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: 24, 
                      padding: 14, 
                      borderRadius: 24, 
                      textDecoration: 'none', 
                      animation: `fade-up 0.5s var(--ease) ${i * 50}ms both`,
                      cursor: 'pointer' 
                    }}>
                    <div style={{ width: 220, aspectRatio: '16/10', borderRadius: 18, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                      <img src={b.thumbnail || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=500&fit=crop'} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=500&fit=crop&q=80'; }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        {b.category?.name && (
                          <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {b.category.name}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <IcClock/> {b.created_at && new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', color: 'var(--forest)', fontWeight: 900, marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{b.title}</h3>
                      {b.excerpt && <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{b.excerpt}</p>}
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', border: '1px solid var(--border)', flexShrink: 0, marginLeft: 20 }}>
                       <IcArrow/>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <button onClick={loadMore} style={{ padding: '14px 40px', background: 'var(--forest)', color: '#fff', borderRadius: 16, border: 'none', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s ease' }}>
                    Load More Articles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer/>
      <style jsx global>{`
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:0.8} }
      `}</style>
    </>
  );
}
