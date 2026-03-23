'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlog, getBlogs } from '@/lib/api';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useQuery({ queryKey: ['blog', slug], queryFn: () => getBlog(slug), enabled: !!slug, staleTime: 300_000 });
  const { data: moreRaw } = useQuery({ queryKey: ['blogs-more'], queryFn: () => getBlogs({ limit: 4 }), staleTime: 300_000 });
  const b: any = blog;
  const more: any[] = ((moreRaw as any)?.items ?? (moreRaw as any[]) ?? []).filter((x: any) => x.slug !== slug).slice(0, 3);

  if (isLoading) return (
    <>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)', background:'var(--bg)', minHeight:'100svh' }}>
        <div className="container-sm" style={{ paddingTop:48, paddingBottom:80 }}>
          <div className="skeleton" style={{ height:48, borderRadius:12, marginBottom:16, width:'70%' }} />
          <div className="skeleton" style={{ height:24, borderRadius:8, marginBottom:32, width:'40%' }} />
          <div className="skeleton" style={{ height:400, borderRadius:22, marginBottom:32 }} />
          {[1,2,3,4].map(i => <div key={i} className="skeleton skel-h" style={{ width:`${90-i*10}%`, marginBottom:10 }} />)}
        </div>
      </div>
    </>
  );

  if (!b) return (
    <>
      <Navbar />
      <div style={{ paddingTop:'var(--nav-h)', background:'var(--bg)', minHeight:'100svh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'4rem', marginBottom:16 }}>📖</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:16 }}>Article not found</h2>
          <Link href="/blogs" className="btn btn-forest">← Back to Blog</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{ background:'var(--bg)', paddingTop:'var(--nav-h)', minHeight:'100svh' }}>
        {/* Cover */}
        <div style={{ height:'clamp(300px,45vw,500px)', overflow:'hidden', position:'relative' }}>
          {b.cover_image
            ? <img src={b.cover_image} alt={b.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ height:'100%', background:'linear-gradient(135deg,var(--forest),var(--forest-mid))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8rem', color:'rgba(255,255,255,0.15)' }}><svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(11,21,15,0.7) 100%)' }} />
          <div className="container" style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', width:'100%' }}>
            {b.category && <span style={{ display:'inline-block', padding:'5px 14px', borderRadius:99, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', color:'#fff', fontSize:'0.72rem', fontWeight:700, marginBottom:12, textTransform:'uppercase', letterSpacing:'0.07em' }}>{b.category}</span>}
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,4vw,3rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.2, maxWidth:800 }}>{b.title}</h1>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', marginTop:10 }}>
              {b.created_at && new Date(b.created_at).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              {b.author && <span> · By {b.author}</span>}
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom:80 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:40, marginTop:48, alignItems:'start' }}>
            {/* Article */}
            <div>
              <Link href="/blogs" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:'0.82rem', fontWeight:500, textDecoration:'none', marginBottom:32 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg> All Articles
              </Link>

              {b.excerpt && (
                <p style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', color:'var(--text-2)', lineHeight:1.75, marginBottom:32, fontStyle:'italic', borderLeft:'3px solid var(--gold)', paddingLeft:20 }}>
                  {b.excerpt}
                </p>
              )}

              {b.content && (
                <div style={{ fontSize:'1rem', lineHeight:1.85, color:'var(--text-2)' }}
                  dangerouslySetInnerHTML={{ __html: b.content.replace(/\n\n/g, '</p><p style="margin-bottom:1.4em">').replace(/\n/g, '<br/>').replace(/^/, '<p style="margin-bottom:1.4em">').replace(/$/, '</p>') }} />
              )}

              {/* Tags */}
              {b.tags?.length > 0 && (
                <div style={{ marginTop:40, display:'flex', gap:8, flexWrap:'wrap' }}>
                  {b.tags.map((tag: string) => (
                    <span key={tag} style={{ padding:'5px 14px', borderRadius:99, background:'rgba(11,61,46,0.08)', color:'var(--forest)', fontSize:'0.78rem', fontWeight:600 }}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop:48, background:'linear-gradient(135deg,var(--forest),var(--forest-mid))', borderRadius:24, padding:'36px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />
                <div style={{ position:'relative', zIndex:1, display:'flex', gap:20, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ fontSize:'3rem', flexShrink:0, color:'var(--forest)' }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'#fff', fontSize:'1.2rem', marginBottom:6 }}>Ready to try expert garden care?</h3>
                    <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.875rem' }}>Book a certified gardener and see the difference professional care makes</p>
                  </div>
                  <Link href="/book" className="btn btn-primary" style={{ flexShrink:0 }}>Book a Visit →</Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ position:'sticky', top:'calc(var(--nav-h) + 24px)' }}>
              {more.length > 0 && (
                <div style={{ background:'#fff', borderRadius:22, padding:'22px', border:'1px solid var(--border)' }}>
                  <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:18 }}>More Articles</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {more.map((m: any) => (
                      <Link key={m.id} href={`/blogs/${m.slug}`}
                        style={{ display:'flex', gap:12, textDecoration:'none', transition:'opacity 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as any).style.opacity='0.75'}
                        onMouseLeave={e => (e.currentTarget as any).style.opacity='1'}>
                        <div style={{ width:56, height:56, borderRadius:12, overflow:'hidden', flexShrink:0, background:'var(--bg)' }}>
                          {m.cover_image ? <img src={m.cover_image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', color:'rgba(255,255,255,0.2)' }}></div>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:'0.84rem', lineHeight:1.4, color:'var(--text)', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{m.title}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-faint)', marginTop:4 }}>{m.created_at && new Date(m.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/blogs" className="btn btn-outline btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:18 }}>View All →</Link>
                </div>
              )}

              {/* AI sidebar promo */}
              <Link href="/plantopedia" style={{ marginTop:16, display:'block', background:'var(--forest)', borderRadius:22, padding:'22px', textDecoration:'none', transition:'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as any).style.transform = 'translateY(-3px)'; (e.currentTarget as any).style.boxShadow = 'var(--sh-md)'; }}
                onMouseLeave={e => { (e.currentTarget as any).style.transform = 'none'; (e.currentTarget as any).style.boxShadow = 'none'; }}>
                <div style={{ fontSize:'2rem', marginBottom:12, color:'var(--forest)' }}></div>
                <div style={{ fontWeight:700, color:'#fff', marginBottom:6 }}>AI Plant Identifier</div>
                <div style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.6)', lineHeight:1.6 }}>Upload any plant photo and instantly get species ID, care tips, and disease diagnosis</div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:14, color:'var(--gold-light)', fontWeight:700, fontSize:'0.85rem' }}>Try it free →</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@media(max-width:900px){div[style*="grid-template-columns: 1fr 280px"]{grid-template-columns:1fr !important;} div[style*="position: sticky"]{position:relative !important;top:0 !important;}}`}</style>
    </>
  );
}
