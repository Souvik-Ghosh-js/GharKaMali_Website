'use client';
import { useEffect, useState, useRef } from 'react';
import { getSocialProof } from '@/lib/api';

type SocialProofItem = {
  name: string;
  city: string;
  service: string;
  time_ago: string;
  status: string;
};

export default function SocialProofToast() {
  const [items, setItems] = useState<SocialProofItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({ enabled: true, interval: 8000 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await getSocialProof();
        if (res.success && res.data.enabled && res.data.items?.length > 0) {
          setItems(res.data.items);
          setConfig({ enabled: true, interval: res.data.interval || 8000 });
          
          // Initial delay before showing first toast
          timerRef.current = setTimeout(() => {
            setActiveIndex(0);
            setVisible(true);
          }, 5000);
        }
      } catch (err) {
        console.error('Failed to load social proof', err);
      }
    }
    init();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (activeIndex === -1 || items.length === 0) return;

    // Show for 5 seconds, then hide, then wait for interval to show next
    const showDuration = 5000;
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, showDuration);

    const nextTimer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
      setVisible(true);
    }, config.interval);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [activeIndex, items.length, config.interval]);

  if (!config.enabled || activeIndex === -1 || items.length === 0) return null;

  const item = items[activeIndex];

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 'clamp(20px, 4vw, 30px)',
        left: 'clamp(20px, 4vw, 30px)',
        zIndex: 1000,
        transform: visible ? 'translateX(0)' : 'translateX(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: '320px',
        width: 'calc(100vw - 40px)',
      }}
    >
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(201, 168, 76, 0.3)',
          padding: '14px 18px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          boxShadow: '0 10px 40px rgba(3, 65, 26, 0.12), 0 2px 10px rgba(3, 65, 26, 0.08)',
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--forest), #4a8c3f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '1.2rem',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(3, 65, 26, 0.2)',
        }}>
          🌿
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name} from {item.city}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
              {item.time_ago}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.4 }}>
            just booked a <strong style={{ color: 'var(--earth)', fontWeight: 700 }}>{item.service}</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.status === 'completed' ? 'Verified Service' : 'Booking Confirmed'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setVisible(false)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '1rem',
            lineHeight: 1,
            opacity: 0.5,
          }}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
