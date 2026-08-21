'use client';

import { useState } from 'react';

// One row from GET /coupons?scope=…&subtotal=…  The server decides eligibility
// and the exact saving for the supplied subtotal; we never re-derive it here.
export type AvailableCoupon = {
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed' | string;
  discount_value: number | string;
  min_order_amount?: number | string | null;
  max_discount?: number | string | null;
  applies_to?: string;
  eligible: boolean;
  reason?: string | null;
  discount_amount?: number | string | null;
};

const inr = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const couponLabel = (c: AvailableCoupon) =>
  c.discount_type === 'percentage'
    ? `${Number(c.discount_value)}% OFF${c.max_discount ? ` up to ₹${inr(Number(c.max_discount))}` : ''}`
    : `₹${inr(Number(c.discount_value))} OFF`;

type Props = {
  coupons: AvailableCoupon[];
  onApply: (code: string) => void;
  busy?: boolean;
  // Heading for the eligible group, e.g. "Eligible for your cart" / "Eligible for this plan".
  eligibleTitle?: string;
  // Muted line shown when nothing is eligible.
  emptyText?: string;
  // Card background for ineligible rows (drawer uses the elevated token, the book page is white).
  mutedSurface?: string;
};

// Zomato-style coupon list split into an eligible group (with the exact saving
// and a live APPLY button) and a collapsed, greyed "Not eligible yet" group that
// shows the server's reason with APPLY disabled.
export default function CouponList({
  coupons,
  onApply,
  busy = false,
  eligibleTitle = 'Eligible for your cart',
  emptyText = 'No coupons eligible for this cart yet',
  mutedSurface = 'var(--bg-elevated)',
}: Props) {
  const [showIneligible, setShowIneligible] = useState(false);
  if (!coupons.length) return null;

  const eligible = coupons.filter(c => c.eligible);
  const ineligible = coupons.filter(c => !c.eligible);

  const sectionTitle: React.CSSProperties = { fontSize: '0.72rem', fontWeight: 800, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 };

  const renderCard = (c: AvailableCoupon) => {
    const canApply = c.eligible && !busy;
    const saving = c.discount_amount != null ? Number(c.discount_amount) : null;
    return (
      <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 12, border: '1px dashed var(--border)', background: c.eligible ? 'rgba(22,163,74,0.04)' : mutedSurface, opacity: c.eligible ? 1 : 0.7 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: 'var(--forest)', letterSpacing: '0.04em' }}>{c.code}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: c.eligible ? '#16a34a' : 'var(--text-muted)' }}>{couponLabel(c)}</span>
            {c.eligible && saving != null && saving > 0 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '2px 8px', borderRadius: 999 }}>Save ₹{inr(saving)}</span>
            )}
          </div>
          {c.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-2)', marginTop: 2 }}>{c.description}</div>}
          {!c.eligible && c.reason && <div style={{ fontSize: '0.68rem', color: 'var(--earth)', fontWeight: 600, marginTop: 2 }}>{c.reason}</div>}
        </div>
        <button
          type="button"
          onClick={() => canApply && onApply(c.code)}
          disabled={!canApply}
          aria-disabled={!canApply}
          style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 8, border: 'none', background: c.eligible ? 'var(--forest)' : 'var(--border)', color: c.eligible ? '#fff' : 'var(--text-muted)', fontWeight: 800, fontSize: '0.72rem', cursor: canApply ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          APPLY
        </button>
      </div>
    );
  };

  return (
    <div>
      <div style={sectionTitle}>{eligibleTitle}</div>
      {eligible.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{eligible.map(renderCard)}</div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{emptyText}</div>
      )}

      {ineligible.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setShowIneligible(v => !v)}
            aria-expanded={showIneligible}
            style={{ ...sectionTitle, marginBottom: showIneligible ? 8 : 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <span style={{ display: 'inline-block', transform: showIneligible ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▸</span>
            Not eligible yet ({ineligible.length})
          </button>
          {showIneligible && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{ineligible.map(renderCard)}</div>
          )}
        </div>
      )}
    </div>
  );
}
