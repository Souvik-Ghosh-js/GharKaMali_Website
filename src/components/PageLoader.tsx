'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done' | 'gone'>('loading');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  /* ── Canvas: floating leaves background ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Leaf = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; rot: number; rotV: number; wave: number; waveS: number; hue: number };
    const leaves: Leaf[] = [];
    const hues = [120, 100, 140, 80, 45, 60];
    for (let i = 0; i < 28; i++) {
      leaves.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, vy: -(Math.random() * 0.6 + 0.3),
        size: Math.random() * 16 + 8, opacity: Math.random() * 0.35 + 0.12,
        rot: Math.random() * Math.PI * 2, rotV: (Math.random() - 0.5) * 0.025,
        wave: Math.random() * Math.PI * 2, waveS: Math.random() * 0.03 + 0.01,
        hue: hues[Math.floor(Math.random() * hues.length)],
      });
    }

    const leafPath = new Path2D('M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Warm cream background
      ctx.fillStyle = '#fff9e1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Subtle gold radial
      const grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
      grd.addColorStop(0, 'rgba(237,207,135,0.10)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      leaves.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.size / 24, p.size / 24);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 38%, ${p.opacity})`;
        ctx.fill(leafPath);
        ctx.restore();

        p.wave += p.waveS;
        p.x += p.vx + Math.sin(p.wave) * 0.8;
        p.y += p.vy;
        p.rot += p.rotV;
        if (p.y < -30) { p.y = canvas.height + 30; p.x = Math.random() * canvas.width; }
        if (p.x < -30) p.x = canvas.width + 30;
        if (p.x > canvas.width + 30) p.x = -30;
      });

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Progress simulation ── */
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 1.5 + Math.random() * 3;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.min(Math.round(p), 100));
    }, 28);
    const t1 = setTimeout(() => setPhase('done'), 2200);
    const t2 = setTimeout(() => setPhase('gone'), 3100);
    return () => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#fff9e1',
      opacity: phase === 'done' ? 0 : 1,
      transform: phase === 'done' ? 'scale(1.04)' : 'scale(1)',
      transition: 'opacity 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: phase === 'done' ? 'none' : 'all',
      overflow: 'hidden',
    }} aria-label="Loading GharKaMali">

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

        {/* Spinning ring + logo */}
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          {/* Outer spinning SVG ring */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0, animation: 'loaderRing 2.4s linear infinite' }}>
            <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(3,65,26,0.08)" strokeWidth="5" />
            <circle
              cx="70" cy="70" r="62"
              fill="none"
              stroke="url(#loaderGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="390"
              strokeDashoffset={390 - (390 * progress) / 100}
              style={{ transition: 'stroke-dashoffset 0.3s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
            <defs>
              <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#03411a" />
                <stop offset="50%" stopColor="#4a8c3f" />
                <stop offset="100%" stopColor="#c9a84c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner leaf ring (decorative dots) */}
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0, animation: 'loaderRing 6s linear infinite reverse' }}>
            {[0,45,90,135,180,225,270,315].map((deg, i) => (
              <circle key={i}
                cx={70 + 54 * Math.cos((deg * Math.PI) / 180)}
                cy={70 + 54 * Math.sin((deg * Math.PI) / 180)}
                r="2.5"
                fill={i % 2 === 0 ? '#03411a' : '#c9a84c'}
                opacity={0.4 + (i % 3) * 0.15}
              />
            ))}
          </svg>

          {/* Logo in center */}
          <div style={{
            position: 'absolute', inset: '18px',
            background: '#fff', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(3,65,26,0.15), 0 0 0 1px rgba(3,65,26,0.06)',
            animation: 'logo-breathe 2.2s ease-in-out infinite',
          }}>
            <Image src="/logo.png" alt="GharKaMali" width={72} height={72} priority style={{ objectFit: 'contain' }} />
          </div>
        </div>

        {/* Brand name */}
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '1.45rem', color: 'var(--forest)', letterSpacing: '-0.01em',
          animation: 'fade-up 0.6s var(--ease) 0.3s both',
        }}>
          GharKaMali
        </div>

        {/* Progress bar — premium SVG vine that grows as you load */}
        <div style={{ width: 'min(260px, 70vw)', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          {/* Vine SVG track */}
          <div style={{ width: '100%', position: 'relative', height: 40 }}>
            <svg viewBox="0 0 260 40" width="100%" height="40" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#03411a" />
                  <stop offset="60%" stopColor="#4a8c3f" />
                  <stop offset="100%" stopColor="#c9a84c" />
                </linearGradient>
                <filter id="vineGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* Track path */}
              <path d="M10 20 C40 8, 70 32, 100 20 C130 8, 160 32, 190 20 C220 8, 245 28, 250 20"
                fill="none" stroke="rgba(3,65,26,0.08)" strokeWidth="3" strokeLinecap="round" />
              {/* Growing vine */}
              <path d="M10 20 C40 8, 70 32, 100 20 C130 8, 160 32, 190 20 C220 8, 245 28, 250 20"
                fill="none"
                stroke="url(#vineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progress) / 100}
                style={{ transition: 'stroke-dashoffset 0.28s ease-out' }}
                filter="url(#vineGlow)" />
              {/* Leaf nodes at 25 / 50 / 75 / 100 milestones */}
              {[
                { cx: 72, cy: 31, pct: 25 },
                { cx: 130, cy: 9, pct: 50 },
                { cx: 188, cy: 31, pct: 75 },
                { cx: 250, cy: 20, pct: 100 },
              ].map((node) => (
                <g key={node.pct} style={{ transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', transformOrigin: `${node.cx}px ${node.cy}px`, opacity: progress >= node.pct ? 1 : 0, transform: progress >= node.pct ? 'scale(1)' : 'scale(0)' }}>
                  <circle cx={node.cx} cy={node.cy} r="5" fill={progress >= node.pct ? '#c9a84c' : 'rgba(3,65,26,0.15)'} />
                  <circle cx={node.cx} cy={node.cy} r="8" fill="none" stroke={progress >= node.pct ? 'rgba(201,168,76,0.35)' : 'transparent'} strokeWidth="2" />
                </g>
              ))}
              {/* Glowing tip dot */}
              <circle
                cx={10 + (240 * progress) / 100}
                cy={20}
                r="5"
                fill="#c9a84c"
                filter="url(#vineGlow)"
                style={{ transition: 'cx 0.28s ease-out', opacity: progress < 100 ? 1 : 0 }}
              />
            </svg>
          </div>

          <div style={{
            fontSize: '0.65rem', fontWeight: 900,
            color: 'var(--forest)', letterSpacing: '0.24em',
            textTransform: 'uppercase', opacity: 0.6,
            fontFamily: 'var(--font-mono)',
            transition: 'opacity 0.3s',
          }}>
            {progress < 30 ? 'Planting seeds…' : progress < 60 ? 'Watering plants…' : progress < 90 ? 'Watching growth…' : progress < 100 ? 'Almost bloomed!' : '🌿 Ready!'}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loaderRing {
          to { transform: rotate(360deg); }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(3,65,26,0.15); }
          50% { transform: scale(1.06); box-shadow: 0 12px 40px rgba(3,65,26,0.22), 0 0 30px rgba(201,168,76,0.12); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
