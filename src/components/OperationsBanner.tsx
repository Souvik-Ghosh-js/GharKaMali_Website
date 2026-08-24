'use client';
import { useEffect, useState } from 'react';
import { getOperationsStatus } from '@/lib/api';

// Height of the banner strip; the fixed navbar is pushed down by this much
// while operations are paused so nothing is hidden behind the banner.
const BANNER_H = 34;

/**
 * Site-wide operations kill-switch banner.
 *
 * Polls GET /operations-status on mount and every 60s. While operations are
 * paused it renders a slim dark/gold strip pinned to the very top of the
 * viewport (above the navbar). Renders nothing when live — and silently
 * assumes live if the status call fails.
 */
export default function OperationsBanner() {
  const [status, setStatus] = useState<{ paused: boolean; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getOperationsStatus()
        .then((s: any) => { if (!cancelled && s && typeof s.paused === 'boolean') setStatus(s); })
        .catch(() => { /* assume live */ });
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  if (!status?.paused) return null;

  return (
    <>
      <div
        role="status"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 5000,
          minHeight: BANNER_H, padding: '7px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          background: '#0A1A13', color: 'var(--gold, #edcf87)',
          borderBottom: '1px solid rgba(201,168,76,0.35)',
          fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.4,
        }}
      >
        ⏸ {status.message || "We're not serviceable right now — we'll be back very soon!"}
      </div>
      {/* Shift the fixed topbar below the banner ("top" is a no-op for the
          site's only other, statically-positioned, nav — the breadcrumb). */}
      <style>{`nav { top: ${BANNER_H}px !important; }`}</style>
    </>
  );
}
