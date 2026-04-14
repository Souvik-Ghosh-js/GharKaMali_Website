'use client';
import { useEffect, useState, useRef } from 'react';
import { getSocialProof } from '@/lib/api';

type SocialProofItem = {
  type: 'booking' | 'visitor';
  message: string;
  time_ago: string;
  data?: {
    name: string;
    city: string;
    service: string;
  };
};

export default function SocialProofToast() {
  const [items, setItems] = useState<SocialProofItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({ enabled: true, interval: 8000, delay: 5000, duration: 5000 });
  const [cycleKey, setCycleKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const res = await getSocialProof();
        if (!isMounted) return;

        if (res.success && res.data.enabled && res.data.items?.length > 0) {
          setItems(res.data.items);
          setConfig({ 
            enabled: true, 
            interval: res.data.interval || 8000,
            delay: res.data.delay || 5000,
            duration: res.data.duration || 5000
          });
          
          timerRef.current = setTimeout(() => {
            if (!isMounted) return;
            setActiveIndex(0);
            setVisible(true);
          }, Math.max(1000, res.data.delay || 5000)); // Ensure it at least waits 1s but appears eventually
        }
      } catch (err) {
        console.error('Failed to load social proof', err);
      }
    }
    init();
    return () => { 
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current); 
    };
  }, []);

  useEffect(() => {
    if (activeIndex === -1 || items.length === 0) return;

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, config.duration);

    const nextTimer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
      setCycleKey((prev) => prev + 1);
      setVisible(true);
    }, config.interval + config.duration);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [activeIndex, cycleKey, items.length, config.interval, config.duration]);

  if (!config.enabled || activeIndex === -1 || items.length === 0) return null;

  const item = items[activeIndex];

  return (
    <div 
      className="social-proof-toast"
      style={{
        position: 'fixed',
        bottom: 'clamp(20px, 4vw, 30px)',
        left: 'clamp(20px, 4vw, 30px)',
        zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: visible ? 'auto' : 'none',
        maxWidth: '340px',
        width: 'calc(100vw - 40px)',
      }}
    >
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(22, 163, 74, 0.2)',
          padding: '16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: item.type === 'visitor' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '1.4rem',
          flexShrink: 0,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }}>
          {item.type === 'visitor' ? '🔥' : '🌱'}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.type === 'visitor' ? 'Live Activity' : 'Recent Booking'}
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(0,0,0,0.4)' }}>
              {item.time_ago}
            </span>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.85rem', 
            color: '#1a1a1a', 
            lineHeight: 1.4,
            fontWeight: 500
          }}>
            {item.message}
          </p>
        </div>
        
        <button 
          onClick={() => setVisible(false)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'rgba(0,0,0,0.2)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '1.2rem',
            lineHeight: 1,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.2)'}
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
