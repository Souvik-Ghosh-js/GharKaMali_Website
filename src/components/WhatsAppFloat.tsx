'use client';
import { useState } from 'react';

const WA_NUMBER = '919643701701';

const SERVICES = [
  { id: 'visit',        label: 'Book Mali Visit @ ₹349',    msg: 'Hi GharKaMali! I want to book a Mali Visit @ ₹349. Please share details.' },
  { id: 'subscription', label: 'Monthly Subscription Plan', msg: 'Hi GharKaMali! I want to know about Monthly Subscription Plans. Please help.' },
  { id: 'plants',       label: 'Buy Plants / Pots',         msg: 'Hi GharKaMali! I want to buy plants or pots. Please guide me.' },
  { id: 'makeover',     label: 'Garden / Balcony Makeover', msg: 'Hi GharKaMali! I am interested in a Garden or Balcony Makeover. Please share details.' },
  { id: 'corporate',    label: 'Corporate Landscaping',     msg: 'Hi GharKaMali! I need Corporate Landscaping services. Please get in touch.' },
  { id: 'other',        label: 'Other Query',               msg: 'Hi GharKaMali! I have a query and need your help.' },
];

const IcWhatsApp = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IcChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  const handleSelect = (msg: string) => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.2)' }}
        />
      )}

      {/* Popup */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 96,
          right: 28,
          zIndex: 1000,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          width: 300,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          animation: 'waPopIn 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ background: 'var(--forest)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <IcWhatsApp size={20} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.01em' }}>GharKaMali Support</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginTop: 1 }}>Typically replies in minutes</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4, display: 'flex', lineHeight: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Prompt */}
          <div style={{ padding: '14px 16px 4px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500, margin: 0 }}>How can we help you today?</p>
          </div>

          {/* Service list */}
          <div style={{ padding: '6px 0 8px' }}>
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.msg)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: i < SERVICES.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#111827',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <span>{s.label}</span>
                <span style={{ color: '#9ca3af', flexShrink: 0 }}><IcChevron /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Float button — let CSS handle background/shape, only override what's needed */}
      <button
        onClick={() => setOpen(o => !o)}
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
        style={{ border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
      >
        <IcWhatsApp />
        {!open && <div className="whatsapp-tooltip">Need Help? Chat with Us</div>}
      </button>

      <style jsx global>{`
        @keyframes waPopIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
