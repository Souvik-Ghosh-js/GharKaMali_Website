'use client';
// Shared renderer for a service's standard details — Overview, What's Included,
// Not Included, How It's Done and FAQs. Used by /services, /services/[slug]
// and the "What's included & FAQs" modal in the booking flow, so all three
// always show identical content (fetched from GET /service-details).
import { useState } from 'react';
import type { ServiceDetail } from '@/lib/api';

/* ── Icons ── */
const IcCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IcX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IcChevron = ({ open }: { open: boolean }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>;

/* ── Per-service icon (keyed by backend slug) ── */
const svgProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const };
const ICONS: Record<string, () => JSX.Element> = {
  'one-time-plant-care': () => <svg {...svgProps}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  'monthly-plant-care': () => <svg {...svgProps}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  'balcony-garden-setup': () => <svg {...svgProps}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  'terrace-garden-setup': () => <svg {...svgProps}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  'lawn-installation': () => <svg {...svgProps}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>,
  'lawn-maintenance': () => <svg {...svgProps}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  'plant-repotting': () => <svg {...svgProps}><path d="M9 2h6l1 5H8z" /><path d="M8 7c0 0-2 1.5-2 7a6 6 0 0 0 12 0c0-5.5-2-7-2-7" /></svg>,
  'plant-doctor': () => <svg {...svgProps}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>,
  'plant-pest-control': () => <svg {...svgProps}><path d="M8 2l1.5 1.5" /><path d="M14.5 3.5L16 2" /><path d="M9 9h6" /><path d="M10 20h4" /><path d="M12 9v11" /><path d="M6.5 6.5A4.5 4.5 0 0 0 7.5 15H16.5a4.5 4.5 0 0 0 1-8.91" /><path d="M3.5 9H7" /><path d="M17 9h3.5" /><path d="M3.5 15H7" /><path d="M17 15h3.5" /></svg>,
  'kitchen-garden-setup': () => <svg {...svgProps}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  'vertical-garden': () => <svg {...svgProps}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20M2 16h20M7 4v6M12 10v6M17 4v6" /></svg>,
  'office-plant-maintenance': () => <svg {...svgProps}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  'society-garden-maintenance': () => <svg {...svgProps}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  'plant-shifting': () => <svg {...svgProps}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  'landscape-design': () => <svg {...svgProps}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>,
};

export function ServiceIcon({ slug }: { slug: string }) {
  const Ic = ICONS[slug] || ICONS['one-time-plant-care'];
  return <Ic />;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '14px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: 'var(--forest)',
        }}
      >
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1.4 }}>{q}</span>
        <IcChevron open={open} />
      </button>
      {open && (
        <div style={{ paddingBottom: 14, fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.75, fontWeight: 500 }}>
          {a}
        </div>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 900, color: 'var(--forest)',
  textTransform: 'uppercase', letterSpacing: '0.1em',
};

export default function ServiceDetailContent({ service, showOverview = true }: { service: ServiceDetail; showOverview?: boolean }) {
  return (
    <div>
      {/* Overview */}
      {showOverview && (
        <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.75, fontWeight: 500, margin: '0 0 24px' }}>
          {service.overview}
        </p>
      )}

      {/* Includes / Excludes */}
      <div className="sdc-cols">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ok)' }}><IcCheck /></div>
            <span style={sectionLabel}>What&apos;s Included</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {service.includes.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(22,163,74,0.12)', color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><IcCheck /></span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--err)' }}><IcX /></div>
            <span style={sectionLabel}>Not Included</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {service.excludes.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', color: 'var(--err)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><IcX /></span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

      {/* How it's done */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...sectionLabel, marginBottom: 16 }}>How It&apos;s Done</div>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {service.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--forest)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', textAlign: 'center', maxWidth: 90, lineHeight: 1.35 }}>{step}</span>
              </div>
              {i < service.steps.length - 1 && (
                <div style={{ width: 'clamp(16px, 4vw, 36px)', height: 2, background: 'var(--border-mid)', margin: '-18px 6px 0', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 0 24px' }} />

      {/* FAQs */}
      <div>
        <div style={{ ...sectionLabel, marginBottom: 4 }}>Frequently Asked Questions</div>
        {service.faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>

      <style>{`
        .sdc-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        @media (max-width: 600px) { .sdc-cols { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
