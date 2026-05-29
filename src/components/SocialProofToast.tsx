'use client';
import { useEffect, useState, useRef } from 'react';
import { getSocialProof } from '@/lib/api';

type SocialProofItem = {
  type: 'booking' | 'visitor';
  message: string;
  time_ago: string;
  data?: { name: string; city: string; service: string };
};

const IcVisitor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcBookingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <polyline points="9 16 11 18 15 14"/>
  </svg>
);
const IcClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function SocialProofToast() {
  const [items, setItems] = useState<SocialProofItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [config, setConfig] = useState({ interval: 8000, delay: 5000, duration: 5000 });
  const [cycleKey, setCycleKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        // Count every page load as a visit so the live number keeps climbing.
        const res = await getSocialProof(true);
        if (!isMounted) return;
        if (res?.enabled !== false && res?.items?.length > 0) {
          setItems(res.items);
          setConfig({ interval: res.interval || 8000, delay: res.delay || 5000, duration: res.duration || 5000 });
          timerRef.current = setTimeout(() => {
            if (!isMounted) return;
            setActiveIndex(0);
            setVisible(true);
          }, Math.max(1000, res.delay || 5000));
        }
      } catch {}
    }
    init();
    return () => { isMounted = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (activeIndex === -1 || items.length === 0) return;
    setProgress(100);
    // Drain progress bar over duration
    const step = 100 / (config.duration / 50);
    progressRef.current = setInterval(() => setProgress(p => Math.max(0, p - step)), 50);
    const hideTimer = setTimeout(() => setVisible(false), config.duration);
    const nextTimer = setTimeout(() => {
      setActiveIndex(p => (p + 1) % items.length);
      setCycleKey(p => p + 1);
      setVisible(true);
    }, config.interval + config.duration);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeIndex, cycleKey, items.length, config.interval, config.duration]);

  if (activeIndex === -1 || items.length === 0) return null;

  const item = items[activeIndex];
  const isVisitor = item.type === 'visitor';
  const accentColor = isVisitor ? '#16a34a' : '#03411a';

  return (
    <>
      <style>{`
        @keyframes sp-slide-in {
          0%   { transform: translateY(20px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sp-slide-out {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(16px) scale(0.95); opacity: 0; }
        }
        @keyframes sp-live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
        .sp-wrap {
          position: fixed;
          bottom: clamp(16px, 3vw, 28px);
          left: clamp(14px, 3vw, 28px);
          z-index: 9999;
          width: 296px;
          font-family: 'Poppins', sans-serif;
          animation: ${visible ? 'sp-slide-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards' : 'sp-slide-out 0.3s ease forwards'};
          pointer-events: ${visible ? 'auto' : 'none'};
        }
        .sp-outer {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .sp-header {
          background: ${accentColor};
          padding: 7px 12px 7px 14px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .sp-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
          animation: sp-live-pulse 1.5s ease-in-out infinite;
        }
        .sp-header-label {
          flex: 1;
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.92);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .sp-header-icon {
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center;
        }
        .sp-body {
          padding: 12px 14px 14px;
          display: flex;
          gap: 11px;
          align-items: flex-start;
        }
        .sp-avatar {
          width: 40px; height: 40px; border-radius: 12px;
          background: ${accentColor};
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sp-content { flex: 1; min-width: 0; }
        .sp-msg {
          font-size: 0.8rem;
          font-weight: 600;
          color: #111;
          line-height: 1.45;
          margin: 0 0 4px;
        }
        .sp-time {
          font-size: 0.62rem;
          color: rgba(0,0,0,0.38);
          font-weight: 500;
        }
        .sp-close {
          background: none; border: none; cursor: pointer;
          color: rgba(0,0,0,0.25);
          padding: 2px; border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s;
          flex-shrink: 0;
          margin-top: -1px;
        }
        .sp-close:hover { color: rgba(0,0,0,0.55); }
        .sp-progress {
          height: 2px;
          background: rgba(0,0,0,0.05);
        }
        .sp-progress-fill {
          height: 100%;
          background: ${accentColor};
          width: ${progress}%;
          transition: width 0.05s linear;
          opacity: 0.5;
        }
      `}</style>

      <div className="sp-wrap">
        <div className="sp-outer">
          {/* Branded header strip */}
          <div className="sp-header">
            <span className="sp-live-dot" />
            <span className="sp-header-label">
              {isVisitor ? 'Live Visitors' : 'New Booking'}
            </span>
          </div>

          {/* Body */}
          <div className="sp-body">
            <div className="sp-avatar">
              {isVisitor ? <IcVisitor /> : <IcBookingIcon />}
            </div>
            <div className="sp-content">
              <p className="sp-msg">{item.message}</p>
              {item.time_ago && <div className="sp-time">{item.time_ago}</div>}
            </div>
            <button className="sp-close" onClick={() => setVisible(false)} aria-label="Dismiss">
              <IcClose />
            </button>
          </div>

          {/* Progress bar */}
          <div className="sp-progress">
            <div className="sp-progress-fill" />
          </div>
        </div>
      </div>
    </>
  );
}
