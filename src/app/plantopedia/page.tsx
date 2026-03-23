'use client';
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import Footer from '@/components/Footer';
import { useAuth } from '@/store/auth';
import { identifyPlant, getPlantHistory } from '@/lib/api';

/* Icons */
const IcUpload  = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcCamera  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IcScan    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IcLeaf    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
const IcDroplet = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const IcSun     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IcTherm   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>;
const IcFlask   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3h6l1 9H8z"/><path d="M8 12c0 0-2 1.5-2 6h12c0-4.5-2-6-2-6"/></svg>;
const IcBook    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IcSearch  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcBotBig  = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/><line x1="12" y1="2" x2="12" y2="4"/></svg>;
const IcArrow   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcCheck   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcClock   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcLock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

const FEATURES = [
  { icon: IcLeaf,    label: 'Plant name & species',    sub: 'Common & scientific names' },
  { icon: IcDroplet, label: 'Watering schedule',       sub: 'Frequency based on species' },
  { icon: IcSun,     label: 'Sunlight requirements',   sub: 'Direct, indirect or low light' },
  { icon: IcTherm,   label: 'Disease detection',       sub: 'Identify & treat issues early' },
  { icon: IcFlask,   label: 'Fertilizer guide',        sub: 'NPK ratios & timing' },
];

export default function PlantopediaPage() {
  useScrollReveal();
  const { isAuthenticated } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  
  const { data: histRaw } = useQuery({ queryKey: ['plant-history'], queryFn: getPlantHistory, enabled: isAuthenticated });
  const history: any[] = Array.isArray(histRaw) ? histRaw : [];
  
  const onFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }
    setFile(f); setResult(null);
    const r = new FileReader();
    r.onload = e => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
  };
  
  const identify = async () => {
    if (!file) { toast.error('Please select a plant photo first'); return; }
    if (!isAuthenticated) { toast.error('Sign in to use AI identification'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res: any = await identifyPlant(form);
      setResult(res);
      toast.success('Plant identified successfully');
    } catch (e: any) {
      toast.error(e.message || 'Could not identify. Try a clearer photo.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div style={{ background: 'var(--bg)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(150deg, var(--forest), var(--forest-mid), var(--forest-light))', padding: '60px 0 100px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 40%, rgba(201,168,76,0.08) 0%, transparent 50%), radial-gradient(circle at 20% 60%, rgba(30,122,88,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 99, padding: '7px 18px', marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse-dot 2s ease infinite' }} />
              <span style={{ fontSize: '0.69rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gold-light)', textTransform: 'uppercase' }}>AI Powered</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.8rem)', fontWeight: 900, color: '#fff', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Identify <em style={{ color: 'var(--gold-light)' }}>any plant</em> instantly
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
              Upload a photo and get instant species ID, care guides, and disease diagnosis powered by AI.
            </p>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: -56, paddingBottom: 80 }}>
          <div className="plantopedia-grid">
            {/* Upload panel */}
            <div>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
                onClick={() => !loading && fileRef.current?.click()}
                style={{ background: '#fff', borderRadius: 24, border: `2px dashed ${drag ? 'var(--forest)' : 'var(--border-mid)'}`, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', padding: 28, transition: 'all 0.3s var(--ease)', boxShadow: drag ? 'var(--sh)' : 'var(--sh-xs)', marginBottom: 16, 
 }}>
                {preview ? (
                  <>
                    <img src={preview} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 16, marginBottom: 14 }} />
                    {!loading && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <IcCamera /> Click to change photo
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--forest)' }}>
                      <IcUpload />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, color: 'var(--text)' }}>Drop your plant photo here</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>or click to browse — JPG, PNG up to 10MB</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
              </div>
              
              {preview && (
                <button onClick={identify} disabled={loading || !isAuthenticated}
                  className="btn btn-forest w-full" style={{ justifyContent: 'center', padding: '13px' }}>
                  {loading
                    ? <><div className="btn-spinner" /> Analyzing plant…</>
                    : <><IcSearch /> Identify This Plant</>}
                </button>
              )}

              {!isAuthenticated && (
                <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--gold-pale)', borderRadius: 13, border: '1px solid rgba(201,168,76,0.28)', fontSize: '0.82rem', color: 'var(--earth)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <IcLock />
                  <span><a href="/login" style={{ color: 'var(--forest)', fontWeight: 700 }}>Sign in</a> to identify plants and save your history</span>
                </div>
              )}
              
              {/* Feature list */}
              <div style={{ marginTop: 20, background: '#fff', borderRadius: 22, padding: '22px', border: '1px solid var(--border)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.93rem', marginBottom: 14, color: 'var(--text)' }}>What our AI tells you</h3>
                {FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < FEATURES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(11,61,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                        <Icon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{f.label}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{f.sub}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: 'rgba(11,61,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                        <IcCheck />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Result panel */}
            <div>
              {result ? (
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', animation: 'slide-up 0.4s var(--ease)', boxShadow: 'var(--sh)' }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--forest), var(--forest-mid))', padding: '24px' }}>
                    {result.confidence != null && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.28)', borderRadius: 99, padding: '4px 12px', marginBottom: 12 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)' }} />
                        <span style={{ color: 'var(--gold-light)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em' }}>{Math.round(result.confidence * 100)}% CONFIDENCE</span>
                      </div>
                    )}
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: '#fff', marginBottom: 4 }}>{result.name}</h2>
                    {result.scientific_name && <p style={{ color: 'rgba(255,255,255,0.58)', fontStyle: 'italic', fontSize: '1rem' }}>{result.scientific_name}</p>}
                  </div>
                  
                  <div style={{ padding: 24 }}>
                    {/* Quick stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                      {[
                        { Icon: IcDroplet, label: 'Watering', val: result.watering_schedule },
                        { Icon: IcSun,     label: 'Sunlight', val: result.sunlight },
                      ].filter(c => c.val).map(c => (
                        <div key={c.label} style={{ padding: '14px', background: 'var(--bg)', borderRadius: 13, border: '1px solid var(--border)' }}>
                          <div style={{ color: 'var(--forest)', marginBottom: 6 }}><c.Icon /></div>
                          <div style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{c.val}</div>
                        </div>
                      ))}
                    </div>
                    
                    {result.care_instructions && (
                      <div style={{ padding: '16px', background: 'rgba(11,61,46,0.04)', borderRadius: 15, border: '1px solid rgba(11,61,46,0.09)', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.67rem', fontWeight: 700, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                          <IcLeaf /> Care Instructions
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.78 }}>{result.care_instructions}</p>
                      </div>
                    )}
                    
                    {result.fertilizer_tips && (
                      <div style={{ padding: '16px', background: 'var(--gold-pale)', borderRadius: 15, border: '1px solid rgba(201,168,76,0.18)', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.67rem', fontWeight: 700, color: 'var(--earth)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                          <IcFlask /> Fertilizer Tips
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.78 }}>{result.fertilizer_tips}</p>
                      </div>
                    )}
                    
                    <div style={{ padding: '16px', background: 'var(--cream)', borderRadius: 15, display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(11,61,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}>
                        <IcLeaf />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3, color: 'var(--text)' }}>Need expert care for this plant?</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Book a certified gardener who specializes in this species</div>
                      </div>
                      <a href="/book" className="btn btn-forest btn-sm" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                        Book <IcArrow />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border)', padding: 40, textAlign: 'center', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 96, height: 96, borderRadius: 24, background: 'rgba(11,61,46,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, color: 'var(--forest)', opacity: 0.4, animation: 'gentle-spin 20s linear infinite' }}>
                    <IcBotBig />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 10, color: 'var(--text)' }}>AI Ready to Identify</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: 280 }}>Upload any plant photo for instant species identification, care tips, and disease diagnosis</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, textAlign: 'left', width: '100%', maxWidth: 280 }}>
                    {['Upload a clear photo of the plant', 'AI analyzes species & health', 'Get personalized care guide'].map((s, i) => (
                      <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* History */}
              {isAuthenticated && history.length > 0 && (
                <div style={{ marginTop: 20, background: '#fff', borderRadius: 22, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <IcBook /> Recent Identifications
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {history.map((h: any) => (
                      <div key={h.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                        {h.image_url
                          ? <img src={h.image_url} alt="" style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                          : <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(11,61,46,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest)', flexShrink: 0 }}><IcLeaf /></div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }} className="truncate">
                            {h.plant_name ?? h.result?.name ?? h.name ?? 'Unidentified Plant'}
                          </div>
                          {(h.scientific_name ?? h.result?.scientific_name) && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {h.scientific_name ?? h.result?.scientific_name}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.71rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                          <IcClock />
                          {(() => {
                            const d = new Date(h.created_at ?? h.createdAt ?? h.identified_at);
                            return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        .plantopedia-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        @media(max-width:768px){ .plantopedia-grid { grid-template-columns: 1fr; } }
        @keyframes gentle-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.55;transform:scale(1.5);} }
      `}</style>
    </>
  );
}