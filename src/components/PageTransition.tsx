'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaves, setLeaves] = useState<{ id: number; x: number; r: number; s: number }[]>([]);
  const prevPathRef = useRef(pathname);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (ivRef.current) clearInterval(ivRef.current);
    if (t1Ref.current) clearTimeout(t1Ref.current);
    if (t2Ref.current) clearTimeout(t2Ref.current);
  };

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    clear();

    setActive(true);
    setProgress(0);
    // Spawn some floating leaf particles at the tip
    setLeaves(Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 40 - 20,
      r: Math.random() * 360,
      s: 0.6 + Math.random() * 0.8,
    })));

    let p = 0;
    ivRef.current = setInterval(() => {
      p += 8 + Math.random() * 14;
      if (p >= 92) { p = 92; if (ivRef.current) clearInterval(ivRef.current); }
      setProgress(Math.min(Math.round(p), 92));
    }, 30);

    t1Ref.current = setTimeout(() => {
      setProgress(100);
      if (ivRef.current) clearInterval(ivRef.current);
    }, 520);

    t2Ref.current = setTimeout(() => {
      setActive(false);
      setProgress(0);
      setLeaves([]);
    }, 1100);

    return clear;
  }, [pathname]);

  if (!active && progress === 0) return null;

  const fading = progress === 100;
  // Circumference for SVG ring (r=18 → c≈113)
  const circ = 113;
  const dashOffset = circ - (circ * progress) / 100;

  return (
    <>
      {/* ── Top bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        height: 3, width: `${progress}%`,
        background: 'linear-gradient(90deg, #03411a 0%, #4a8c3f 45%, #c9a84c 100%)',
        boxShadow: '0 0 10px rgba(74,140,63,0.7)',
        borderRadius: '0 4px 4px 0',
        opacity: fading ? 0 : 1,
        transition: fading ? 'width 0.2s ease, opacity 0.4s ease' : 'width 0.15s ease-out',
        pointerEvents: 'none',
      }} />

      {/* ── Shimmer on bar ── */}
      {active && !fading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, zIndex: 9998,
          height: 3, width: `${progress}%`,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          backgroundSize: '50% 100%',
          animation: 'ptShimmer 0.9s linear infinite',
          borderRadius: '0 4px 4px 0',
          pointerEvents: 'none',
          opacity: 0.7,
        }} />
      )}

      {/* ── Floating circular progress badge (bottom-right) ── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(0.7) translateY(8px)' : 'scale(1) translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
      }}>
        {/* Background disc */}
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 8px 32px rgba(3,65,26,0.22), 0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* SVG ring */}
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="26" cy="26" r="18" fill="none" stroke="rgba(3,65,26,0.08)" strokeWidth="3" />
            {/* Progress */}
            <circle
              cx="26" cy="26" r="18"
              fill="none"
              stroke="url(#ptGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
            />
            <defs>
              <linearGradient id="ptGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#03411a" />
                <stop offset="100%" stopColor="#c9a84c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center icon: leaf */}
          <div style={{
            width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--forest, #03411a)',
            animation: 'ptLeafSpin 1.8s ease-in-out infinite',
            position: 'relative', zIndex: 1,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--forest, #03411a)" stroke="none">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            </svg>
          </div>
        </div>

        {/* Leaf particles floating off the badge */}
        {leaves.map(leaf => (
          <div
            key={leaf.id}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 8, height: 8,
              marginTop: -4, marginLeft: -4,
              animation: `ptLeafFly${(leaf.id % 4) + 1} 1.2s ease-out forwards`,
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#c9a84c" stroke="none" style={{ transform: `rotate(${leaf.r}deg) scale(${leaf.s})` }}>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            </svg>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes ptShimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ptLeafSpin {
          0%, 100% { transform: rotate(-8deg) scale(1); }
          50% { transform: rotate(8deg) scale(1.1); }
        }
        @keyframes ptLeafFly1 {
          0%   { opacity:0; transform: translate(0,0) scale(1); }
          20%  { opacity:1; }
          100% { opacity:0; transform: translate(-18px,-28px) scale(0.4) rotate(120deg); }
        }
        @keyframes ptLeafFly2 {
          0%   { opacity:0; transform: translate(0,0) scale(1); }
          20%  { opacity:1; }
          100% { opacity:0; transform: translate(14px,-26px) scale(0.3) rotate(-90deg); }
        }
        @keyframes ptLeafFly3 {
          0%   { opacity:0; transform: translate(0,0) scale(1); }
          20%  { opacity:0.8; }
          100% { opacity:0; transform: translate(-10px,-32px) scale(0.5) rotate(200deg); }
        }
        @keyframes ptLeafFly4 {
          0%   { opacity:0; transform: translate(0,0) scale(1); }
          20%  { opacity:0.9; }
          100% { opacity:0; transform: translate(20px,-24px) scale(0.35) rotate(-150deg); }
        }
      `}</style>
    </>
  );
}
