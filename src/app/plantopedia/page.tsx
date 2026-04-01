'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { identifyPlant, getPlantHistory } from '@/lib/api';

const IcUpload = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcBot = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="4"/></svg>;
const IcLeaf = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcDrop = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const IcSun = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>;
const IcTherm = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>;
const IcClock = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcCheckmark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcAnalysis = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcCloud = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-3.9-4.5C17.6 7.4 15 5.5 12 5.5c-3.1 0-5.8 2.1-6.6 5.1C3.2 11.2 1.5 13.1 1.5 15.5c0 2.5 2 4.5 4.5 4.5h11.5z"/></svg>;

const FEATURES = [
  { Icon: IcLeaf, label: 'Species ID', sub: 'Common & scientific names instantly', color: '#10b981' },
  { Icon: IcDrop, label: 'Hydration Guide', sub: 'Exact watering frequency per species', color: '#3b82f6' },
  { Icon: IcSun, label: 'Light Guide', sub: 'Best window & sun positioning', color: '#f59e0b' },
  { Icon: IcTherm, label: 'Health Check', sub: 'AI-driven pest & disease analysis', color: '#ef4444' },
];

export default function PlantopediaPage() {
  const { isAuthenticated } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  const { data: histRaw } = useQuery({ queryKey: ['plant-history'], queryFn: getPlantHistory, enabled: isAuthenticated });
  const history: any[] = Array.isArray(histRaw) ? histRaw : [];

  // 3D DNA helix canvas
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    let t = 0;

    const draw = () => {
      t += 0.015;
      ctx.clearRect(0, 0, W, H);

      // Glowing bg radial
      const grd = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.5);
      grd.addColorStop(0, 'rgba(3,65,26,0.08)'); grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

      // DNA double helix
      const cx = W * 0.5;
      for (let strand = 0; strand < 2; strand++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const progress = i / 100;
          const x = cx + Math.sin(progress * Math.PI * 4 + t + strand * Math.PI) * (W * 0.18);
          const y = progress * H;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = strand === 0 ? 'rgba(3,65,26,0.15)' : 'rgba(201,168,76,0.12)';
        ctx.lineWidth = 2.5; ctx.stroke();

        // Nodes on strand
        for (let i = 0; i <= 12; i++) {
          const progress = i / 12;
          const x = cx + Math.sin(progress * Math.PI * 4 + t + strand * Math.PI) * (W * 0.18);
          const y = progress * H;
          ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = strand === 0 ? 'rgba(3,65,26,0.3)' : 'rgba(201,168,76,0.25)';
          ctx.fill();
        }
      }

      // Connecting rungs
      for (let i = 0; i <= 12; i++) {
        const progress = i / 12;
        const x1 = cx + Math.sin(progress * Math.PI * 4 + t) * (W * 0.18);
        const x2 = cx + Math.sin(progress * Math.PI * 4 + t + Math.PI) * (W * 0.18);
        const y = progress * H;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(16,185,129,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      }

      // Floating circles
      for (let c = 0; c < 8; c++) {
        const cx2 = W * (0.1 + c * 0.11) + Math.sin(t + c) * 30;
        const cy2 = H * (0.1 + (c % 3) * 0.35) + Math.cos(t * 0.7 + c) * 20;
        const r = 15 + c * 5;
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${c % 2 === 0 ? '3,65,26' : '201,168,76'},0.07)`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // GSAP
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo('.plantopedia-hero > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.2 });
      gsap.utils.toArray('.feature-pill').forEach((el: any, i) => {
        gsap.fromTo(el, { opacity: 0, y: 30, scale: 0.88 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: 0.5 + i * 0.1, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 94%' } });
        el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.04, y: -4, duration: 0.25, ease: 'power2.out' }));
        el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }));
      });
      gsap.fromTo('.upload-card', { opacity: 0, y: 60, rotateX: 10, transformPerspective: 1000 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.upload-card', start: 'top 90%' } });
      gsap.utils.toArray('.hist-card').forEach((c: any, i) => {
        gsap.fromTo(c, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7, delay: i * 0.08, scrollTrigger: { trigger: c, start: 'top 92%' } });
      });
    };
    init();
  }, []);

  const onFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Upload images only'); return; }
    setFile(f); setResult(null);
    const r = new FileReader();
    r.onload = e => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };

  const identify = async () => {
    if (!file) { toast.error('Upload a photo first'); return; }
    if (!isAuthenticated) { toast.error('Please sign in to use AI identification'); return; }
    setLoading(true);
    try {
      const form = new FormData(); form.append('image', file);
      const res = await identifyPlant(form);
      setResult(res);
    } catch { toast.error('Identification failed. Try a clearer photo.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Navbar/>
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>

        {/* ── FUTURISTIC HERO ── */}
        <div style={{ position: 'relative', padding: '72px 0 90px', overflow: 'hidden', background: 'linear-gradient(160deg, rgba(3,65,26,0.03) 0%, var(--bg) 70%)' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>
          <div style={{ position: 'absolute', right: '5%', top: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'orbDrift2 12s ease-in-out infinite', pointerEvents: 'none' }}/>

          <div className="container plantopedia-hero" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 99, padding: '7px 20px', marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'badgePulse 2s infinite' }}/>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Powered by AI · Botanical Intelligence</span>
            </div>
            <h1 className="display-1" style={{ color: 'var(--forest)', marginBottom: 20, letterSpacing: '-0.03em' }}>
              AI <em style={{ color: 'var(--earth)', fontStyle: 'italic' }}>Plantopedia</em>
            </h1>
            <p style={{ fontSize: 'clamp(0.95rem,1.5vw,1.15rem)', color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.8 }}>
              Snap a photo. Our AI identifies your plant species and gives you a complete care guide instantly.
            </p>

            {/* Feature pills */}
            <div className="feature-pills-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-pill" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: 99, boxShadow: 'var(--sh-sm)', transition: 'all 0.25s', transformStyle: 'preserve-3d', cursor: 'default' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color }}>
                    <f.Icon/>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--forest)' }}>{f.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: 80 }}>
          {/* ── UPLOAD CARD ── */}
          <div className="upload-card" style={{ maxWidth: 700, margin: '0 auto 64px', background: '#fff', border: '2px solid var(--border-gold)', borderRadius: 36, padding: 'clamp(28px,5vw,52px)', boxShadow: 'var(--sh-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(3,65,26,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)' }}><IcBot/></div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--forest)', lineHeight: 1 }}>Identify a Plant</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--sage)', marginTop: 4 }}>Upload a clear photo for best results</p>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
              style={{ border: `2px dashed ${drag ? 'var(--forest)' : 'var(--border-mid)'}`, borderRadius: 24, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s', background: drag ? 'rgba(3,65,26,0.03)' : 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}
            >
              {preview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={preview} alt="Preview" style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 16, objectFit: 'cover', boxShadow: 'var(--sh-md)' }}/>
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--forest)', color: '#fff', padding: '5px 14px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700 }}>Ready to analyze</div>
                </div>
              ) : (
                <div>
                  <div style={{ color: 'var(--forest)', opacity: 0.5, marginBottom: 16, display: 'flex', justifyContent: 'center' }}><IcUpload/></div>
                  <p style={{ fontWeight: 700, color: 'var(--forest)', marginBottom: 6 }}>Drop photo here or click to browse</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JPG, PNG, WEBP up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}/>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {preview && (
                <button onClick={() => { setPreview(null); setFile(null); setResult(null); }} style={{ flex: 1, padding: '13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--forest)' }}>
                  Clear
                </button>
              )}
              <button onClick={identify} disabled={!file || loading}
                style={{ flex: 2, padding: '13px', background: file && !loading ? 'var(--forest)' : 'var(--bg-elevated)', color: file && !loading ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '0.95rem', cursor: file && !loading ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                {loading ? (
                  <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }}/> Analysing…</>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Identify Plant
                  </div>
                )}
              </button>
            </div>

            {/* Results */}
            {result && (
              <div style={{ marginTop: 28, padding: 28, background: 'linear-gradient(135deg, rgba(3,65,26,0.03) 0%, rgba(201,168,76,0.04) 100%)', border: '1.5px solid var(--border-gold)', borderRadius: 24, animation: 'fade-up 0.5s ease' }}>
                {result.common_name && <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--forest)', marginBottom: 4 }}>{result.common_name}</h3>}
                {result.scientific_name && <p style={{ fontSize: '0.88rem', color: 'var(--earth)', fontStyle: 'italic', marginBottom: 16, fontWeight: 600 }}>{result.scientific_name}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Watering', value: result.watering_frequency, Icon: IcDrop },
                    { label: 'Sunlight', value: result.sunlight_requirement, Icon: IcSun },
                    { label: 'Difficulty', value: result.care_difficulty, Icon: IcAnalysis },
                    { label: 'Humidity', value: result.humidity_preference, Icon: IcCloud },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} style={{ background: '#fff', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><item.Icon/> {item.label}</div>
                      <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.9rem' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {result.care_tips && <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.75 }}>{result.care_tips}</p>}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: 'var(--forest)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                <IcClock/> Identification History
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                {history.map((h: any, i) => (
                  <div key={h._id || i} className="hist-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 22, overflow: 'hidden', boxShadow: 'var(--sh-xs)' }}>
                    {h.image_url && <img src={h.image_url} alt={h.common_name} style={{ width: '100%', height: 160, objectFit: 'cover' }}/>}
                    <div style={{ padding: '16px 18px' }}>
                      <h4 style={{ fontWeight: 800, color: 'var(--forest)', marginBottom: 4 }}>{h.common_name || 'Unknown'}</h4>
                      {h.scientific_name && <p style={{ fontSize: '0.78rem', color: 'var(--earth)', fontStyle: 'italic', marginBottom: 8 }}>{h.scientific_name}</p>}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <IcClock/>{new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
      <style jsx global>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>
    </>
  );
}
