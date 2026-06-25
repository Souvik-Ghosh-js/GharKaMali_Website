'use client';
import { useEffect, useState } from 'react';

interface ImageFadeSliderProps {
  images: string[];
  alt: string;
  intervalMs?: number;
  height?: number | string;
  objectFit?: 'cover' | 'contain';
  background?: string;
}

export default function ImageFadeSlider({ images, alt, intervalMs = 3200, height = 440, objectFit = 'cover', background }: ImageFadeSliderProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setActive(i => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', background }}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${alt} ${i + 1}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: i === active ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}
        />
      ))}

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 7, zIndex: 5 }}>
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Show image ${i + 1}`}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 20 : 7,
              height: 7,
              borderRadius: 99,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
