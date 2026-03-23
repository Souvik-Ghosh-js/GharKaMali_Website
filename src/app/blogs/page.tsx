'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Footer from '@/components/Footer';
import { getBlogs } from '@/lib/api';

/* Icons */
const IcBook    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IcStar    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9A84C"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcLeaf    = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcChevL   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcChevR   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcCalendar= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

/* Category icon colors */
const CATEGORY_COLORS = ['#0B3D2E','#165C44','#1E7A58','#8B6245','#4A7C59','#5A7A67','#2D4037','#0B3D2E'];

export default function BlogsPage() {
  useScrollReveal();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page],
    queryFn: () => getBlogs({ page, limit: 9 }),
    staleTime: 300_000,
  });
  
  /* Bug fix: API can return { items: [], total } or a raw array */
  const blogs: any[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];
  const total: number = (data as any)?.total ?? blogs.length;
  const pages = Math.ceil(total / 9);
  const featured = blogs[0];
  const rest = blogs.slice(1);
  
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(150deg,var(--forest),var(--forest-mid))', padding: '72px 0 100px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 99, padding: '7px 18px', marginBottom: 20 }}>
              <span style={{ fontSize: '0.69rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>Garden Tips & Guides</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
              The Garden <em style={{ color: 'var(--gold-light)' }}>Journal</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>Expert advice, plant guides, seasonal tips and everything you need for a thriving garden</p>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: -56, paddingBottom: 80 }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {Array(6).fill(null).map((_, i) => <div key={i} className="skeleton reveal" style={{ height: 320, borderRadius: 22 }} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 28, padding: '72px 24px', textAlign: 'center', border: '2px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.3, color: 'var(--forest)' }}><IcBook /></div>
              <h3 style={{ fontWeight: 700, fontSize: '1.2rem' }}>No articles yet</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Check back soon for gardening tips and guides</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/blogs/${featured.slug}`} className="featured-blog-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#fff', borderRadius: 28, overflow: 'hidden', border: '1px solid var(--border)', textDecoration: 'none', marginBottom: 28, boxShadow: 'var(--sh-sm)', transition: 'all 0.3s var(--ease)' }}
                  onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-4px)'; (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'var(--sh-sm)'; }}>
                  <div style={{ height: '100%', minHeight: 320, overflow: 'hidden' }}>
                    {featured.cover_image
                      ? <img src={featured.cover_image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', display: 'block' }} />
                      : <div style={{ height: '100%', minHeight: 320, background: 'linear-gradient(135deg,var(--forest),var(--forest-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}><IcLeaf /></div>}
                  </div>
                  <div style={{ padding: '40px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(201,168,76,0.14)', borderRadius: 99, padding: '4px 12px', marginBottom: 16 }}>
                      <IcStar />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Featured</span>
                    </div>
                    {featured.category && <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 99, background: 'rgba(11,61,46,0.08)', color: 'var(--forest)', fontSize: '0.7rem', fontWeight: 700, marginBottom: 12 }}>{featured.category}</span>}
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', marginBottom: 12, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{featured.title}</h2>
                    {featured.excerpt && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: 20 }}>{featured.excerpt}</p>}
                    {featured.created_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-faint)' }}>
                        <IcCalendar />
                        {new Date(featured.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </Link>
              )}
              
              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
                {rest.map((b: any, i: number) => (
                  <Link key={b.id} href={`/blogs/${b.slug}`} style={{ background: '#fff', borderRadius: 22, overflow: 'hidden', textDecoration: 'none', border: '1px solid var(--border)', transition: 'all 0.3s var(--ease)', animation: `fade-up 0.5s var(--ease) ${i * 60}ms both`, display: 'block' }}
                    onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-4px)'; (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; }}
                    onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      {b.cover_image
                        ? <img src={b.cover_image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', display: 'block' }} />
                        : <div style={{ height: '100%', background: `linear-gradient(135deg,${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}dd,${CATEGORY_COLORS[(i+2) % CATEGORY_COLORS.length]}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)' }}><IcLeaf /></div>}
                    </div>
                    <div style={{ padding: '20px' }}>
                      {b.category && <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: 'rgba(11,61,46,0.08)', color: 'var(--forest)', fontSize: '0.66rem', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.category}</span>}
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.98rem', marginBottom: 8, lineHeight: 1.4, color: 'var(--text)' }}>{b.title}</h3>
                      {b.excerpt && <p style={{ fontSize: '0.80rem', color: 'var(--text-muted)', lineHeight: 1.68, marginBottom: 12 }}>{b.excerpt?.slice(0, 100)}…</p>}
                      {b.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                          <IcCalendar />
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 44 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IcChevL /> Prev
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${page === p ? 'btn-forest' : 'btn-outline'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    Next <IcChevR />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
      <style>{`
        @media(max-width:768px){
          .featured-blog-card { grid-template-columns: 1fr !important; }
          .featured-blog-card > div:first-child { minHeight: 220px !important; }
        }
      `}</style>
    </>
  );
}