'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Minimal background animation or just clean
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;

    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.fillStyle = '#fff9e1'; // Warm cream
      ctx.fillRect(0, 0, W, H);

      // Very subtle radial glows
      const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
      grd.addColorStop(0, 'rgba(201,168,76,0.05)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Progress bar
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += 1.8 + Math.random() * 2.2;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.min(Math.round(p), 100));
    }, 30);
    const t1 = setTimeout(() => setHidden(true), 2500);
    const t2 = setTimeout(() => setRemoved(true), 3400);
    return () => { clearInterval(iv); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (removed) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#fff9e1',
      opacity: hidden ? 0 : 1,
      transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: hidden ? 'none' : 'all',
      overflow: 'hidden',
    }} aria-label="Loading">
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {/* Animated Centered Logo */}
        <div style={{
          position: 'relative',
          width: 140, height: 140,
          animation: 'preloaderPop 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}>
          <Image src="/logo.png" alt="GharKaMali" width={140} height={140} priority style={{ objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(3,65,26,0.15))' }} />
        </div>

        {/* Minimal Progress Line */}
        <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div style={{ width: '100%', height: 1, background: 'rgba(3,65,26,0.1)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress}%`, background: 'var(--forest)', transition: 'width 0.3s ease-out' }} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--forest)', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
            {progress}%
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes preloaderPop {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
