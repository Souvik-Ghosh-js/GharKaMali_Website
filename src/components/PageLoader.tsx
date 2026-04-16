'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'done' | 'gone'>('loading');

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
      background: '#ffffff',
      opacity: phase === 'done' ? 0 : 1,
      transition: 'opacity 0.85s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: phase === 'done' ? 'none' : 'all',
      overflow: 'hidden',
    }} aria-label="Loading GharKaMali">

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50 }}>

        {/* Big centered logo */}
        <div style={{
          width: 280, height: 280,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <Image src="/logo-dark.png" alt="GharKaMali" width={280} height={280} priority style={{ objectFit: 'contain' }} />
        </div>

        {/* Progress bar — as it was */}
        <div style={{ width: 'min(300px, 80vw)', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ width: '100%', position: 'relative', height: 40 }}>
            <svg viewBox="0 0 260 40" width="100%" height="40" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#03411a" />
                  <stop offset="60%" stopColor="#4a8c3f" />
                  <stop offset="100%" stopColor="#c9a84c" />
                </linearGradient>
              </defs>
              <path d="M10 20 C40 8, 70 32, 100 20 C130 8, 160 32, 190 20 C220 8, 245 28, 250 20"
                fill="none" stroke="rgba(3,65,26,0.08)" strokeWidth="3" strokeLinecap="round" />
              <path d="M10 20 C40 8, 70 32, 100 20 C130 8, 160 32, 190 20 C220 8, 245 28, 250 20"
                fill="none"
                stroke="url(#vineGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="300"
                strokeDashoffset={300 - (300 * progress) / 100}
                style={{ transition: 'stroke-dashoffset 0.28s ease-out' }} />
                
              {[
                { cx: 72, cy: 31, pct: 25 },
                { cx: 130, cy: 9, pct: 50 },
                { cx: 188, cy: 31, pct: 75 },
                { cx: 250, cy: 20, pct: 100 },
              ].map((node) => (
                <circle key={node.pct} cx={node.cx} cy={node.cy} r="5" 
                  fill={progress >= node.pct ? '#c9a84c' : 'rgba(3,65,26,0.15)'}
                  style={{ transition: 'fill 0.4s ease', opacity: progress >= node.pct ? 1 : 0.4 }} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
