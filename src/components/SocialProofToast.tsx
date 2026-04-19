'use client';
import { useEffect, useState, useRef } from 'react';
import { getSocialProof } from '@/lib/api';

type SocialProofItem = {
  type: 'booking' | 'visitor';
  message: string;
  time_ago: string;
  data?: { name: string; city: string; service: string };
};

export default function SocialProofToast() {
  const [items, setItems] = useState<SocialProofItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({ interval: 8000, delay: 5000, duration: 5000 });
  const [cycleKey, setCycleKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await getSocialProof();
        if (!isMounted) return;
        if (res?.enabled !== false && res?.items?.length > 0) {
          setItems(res.items);
          setConfig({
            interval: res.interval || 8000,
            delay: res.delay || 5000,
            duration: res.duration || 5000,
          });
          timerRef.current = setTimeout(() => {
            if (!isMounted) return;
            setActiveIndex(0);
            setVisible(true);
          }, Math.max(1000, res.delay || 5000));
        }
      } catch {}
    }
    init();
    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeIndex === -1 || items.length === 0) return;
    const hideTimer = setTimeout(() => setVisible(false), config.duration);
    const nextTimer = setTimeout(() => {
      setActiveIndex((p) => (p + 1) % items.length);
      setCycleKey((p) => p + 1);
      setVisible(true);
    }, config.interval + config.duration);
    return () => { clearTimeout(hideTimer); clearTimeout(nextTimer); };
  }, [activeIndex, cycleKey, items.length, config.interval, config.duration]);

  if (activeIndex === -1 || items.length === 0) return null;

  const item = items[activeIndex];
  const isVisitor = item.type === 'visitor';

  return (
    <>
      <style>{`
        @keyframes spBounceIn {
          0%   { transform: translateY(110%) scale(0.95); opacity: 0; }
          60%  { transform: translateY(-6px) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes spSlideOut {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(110%) scale(0.95); opacity: 0; }
        }
        @keyframes spPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.35); }
          50%       { box-shadow: 0 0 0 7px rgba(22,163,74,0); }
        }
        .sp-wrap {
          position: fixed;
          bottom: clamp(20px, 4vw, 32px);
          left: clamp(16px, 4vw, 32px);
          z-index: 1000;
          max-width: 320px;
          width: calc(100vw - 32px);
          animation: ${visible ? 'spBounceIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards' : 'spSlideOut 0.4s ease forwards'};
          pointer-events: ${visible ? 'auto' : 'none'};
        }
        .sp-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06);
          padding: 14px 14px 14px 14px;
          display: flex;
          gap: 12px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        .sp-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: ${isVisitor ? 'linear-gradient(180deg,#16a34a,#4ade80)' : 'linear-gradient(180deg,#4f46e5,#818cf8)'};
          border-radius: 18px 0 0 18px;
        }
        .sp-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
          background: ${isVisitor ? 'rgba(22,163,74,0.1)' : 'rgba(79,70,229,0.1)'};
          animation: spPulse 2.2s ease-in-out infinite;
        }
        .sp-close {
          position: absolute; top: 8px; right: 8px;
          background: none; border: none; cursor: pointer;
          color: rgba(0,0,0,0.25); font-size: 1rem; line-height: 1;
          padding: 2px 5px; border-radius: 6px;
          transition: background 0.15s, color 0.15s;
        }
        .sp-close:hover { background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.6); }
        .sp-label {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: ${isVisitor ? '#16a34a' : '#4f46e5'};
          margin-bottom: 3px;
        }
        .sp-msg {
          font-size: 0.82rem; font-weight: 500;
          color: #111; line-height: 1.4;
          margin: 0; padding-right: 14px;
        }
        .sp-time {
          font-size: 0.65rem; color: rgba(0,0,0,0.35);
          font-weight: 500; margin-top: 3px;
        }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-card">
          <div className="sp-icon">
            {isVisitor ? '🔥' : '🌿'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sp-label">
              {isVisitor ? 'Live Activity' : 'Recent Booking'}
            </div>
            <p className="sp-msg">{item.message}</p>
            {item.time_ago && <div className="sp-time">{item.time_ago}</div>}
          </div>
          <button className="sp-close" onClick={() => setVisible(false)}>×</button>
        </div>
      </div>
    </>
  );
}
