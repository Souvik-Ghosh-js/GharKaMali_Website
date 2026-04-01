'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  label?: string;
}

export default function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt='Before', afterAlt='After', label }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handleMouseDown = useCallback(() => { isDragging.current = true; }, []);

  useEffect(() => {
    const handleMM = (e: MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
    const handleMU = () => { isDragging.current = false; };
    const handleTM = (e: TouchEvent) => { if (isDragging.current) handleMove(e.touches[0].clientX); };
    window.addEventListener('mousemove', handleMM);
    window.addEventListener('mouseup', handleMU);
    window.addEventListener('touchmove', handleTM);
    window.addEventListener('touchend', handleMU);
    return () => {
      window.removeEventListener('mousemove', handleMM);
      window.removeEventListener('mouseup', handleMU);
      window.removeEventListener('touchmove', handleTM);
      window.removeEventListener('touchend', handleMU);
    };
  }, [handleMove]);

  return (
    <div className="ba-card">
      {label && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.92rem' }}>{label}</span>
          <span className="badge badge-gold">Transformation</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="ba-slider-container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onClick={(e) => handleMove(e.clientX)}
      >
        {/* After image (full background) */}
        <img src={afterSrc} alt={afterAlt} className="ba-image" style={{ zIndex: 1 }} />
        {/* Before image (clipped) */}
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="ba-image"
          style={{ zIndex: 2, clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        {/* Divider line */}
        <div
          className="ba-divider"
          style={{ left: `${position}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(201,168,76,0.5)',
            cursor: 'col-resize'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B3D2E" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="8 4 4 12 8 20" />
              <polyline points="16 4 20 12 16 20" />
            </svg>
          </div>
        </div>
        {/* Labels */}
        <div className="ba-label ba-label-before">Before</div>
        <div className="ba-label ba-label-after">After</div>
      </div>
    </div>
  );
}
