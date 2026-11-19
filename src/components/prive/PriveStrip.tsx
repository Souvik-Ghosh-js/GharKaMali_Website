'use client';
import Link from 'next/link';
import { Cinzel } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: '400', display: 'swap' });

/** Slim entry to /prive: the PRIVÉ wordmark on forest green, and a gold arrow. */
export default function PriveStrip({ onNavigate, style }: { onNavigate?: () => void; style?: React.CSSProperties }) {
  return (
    <Link
      href="/prive"
      onClick={onNavigate}
      aria-label="Privé"
      className="prive-strip"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 78, padding: '0 19px 0 24px', borderRadius: 24, textDecoration: 'none',
        background: 'radial-gradient(circle at 100% 0%, #34584A 0%, #1F3D30 55%, #19332A 100%)',
        border: '0.8px solid rgba(221,191,130,0.3)',
        ...style,
      }}
    >
      <span
        className={cinzel.className}
        style={{
          fontSize: 24, lineHeight: 1, letterSpacing: '0.14em', fontWeight: 400, textAlign: 'left',
          background: 'linear-gradient(180deg, #F6E3B0 0%, #D6B26C 60%, #EBD096 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
        }}
      >
        PRIVÉ
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 40, height: 40, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center',
          border: '1px solid rgba(221,191,130,0.6)', color: '#DDBF82',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </Link>
  );
}
