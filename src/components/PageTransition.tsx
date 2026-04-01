'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => timerRef.current.forEach(clearTimeout);

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    clearTimers();

    setActive(true);
    setProgress(0);

    let p = 0;
    const iv = setInterval(() => {
      p += 8 + Math.random() * 12;
      if (p >= 95) { p = 95; clearInterval(iv); }
      setProgress(Math.min(Math.round(p), 95));
    }, 40);

    const t1 = setTimeout(() => { setProgress(100); clearInterval(iv); }, 600);
    const t2 = setTimeout(() => { setActive(false); setProgress(0); }, 1100);
    timerRef.current = [t1, t2];
    return () => { clearInterval(iv); clearTimers(); };
  }, [pathname]);

  if (!active && progress === 0) return null;

  return (
    <>
      {/* Top progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998,
        height: 3,
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #03411a 0%, #c9a84c 50%, #16a34a 100%)',
        transition: progress === 100 ? 'width 0.3s ease, opacity 0.5s ease' : 'width 0.2s ease',
        opacity: progress === 100 ? 0 : 1,
        boxShadow: '0 0 16px rgba(201,168,76,0.8), 0 0 6px rgba(3,65,26,0.5)',
        borderRadius: '0 4px 4px 0',
      }}/>
      {/* Leaf indicator */}
      <div style={{
        position: 'fixed', top: 0, left: `${progress}%`, zIndex: 9998,
        width: 20, height: 20,
        transform: 'translate(-50%, -30%)',
        fontSize: '14px', lineHeight: 1,
        opacity: progress === 100 ? 0 : 1,
        transition: 'opacity 0.3s',
        filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.9))',
        animation: 'leafSpin 0.6s linear infinite',
        pointerEvents: 'none',
      }}>🌿</div>

      <style jsx global>{`
        @keyframes leafSpin { to { transform: translate(-50%, -30%) rotate(360deg); } }
      `}</style>
    </>
  );
}
