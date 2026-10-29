'use client';
// "Use wallet balance" checkbox shown next to a Pay button. Fetches the wallet
// ledger balance itself and renders nothing when there is no money to use, so
// pages can drop it in unconditionally. The backend recomputes the split
// authoritatively — this is display only.
import { useEffect, useState } from 'react';
import { getWallet } from '@/lib/api';

export default function WalletPayToggle({
  checked, onChange, total,
}: { checked: boolean; onChange: (v: boolean) => void; total?: number }) {
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    getWallet().then((w: any) => setBalance(Number(w?.balance) || 0)).catch(() => {});
  }, []);
  if (balance <= 0) return null;

  const applied = total && total > 0 ? Math.min(balance, total) : balance;
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      background: 'rgba(3,65,26,0.05)', border: '1px solid rgba(3,65,26,0.15)',
      borderRadius: 12, padding: '10px 14px', margin: '10px 0', fontSize: '0.9rem',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: 'var(--forest, #03411a)' }}
      />
      <span style={{ color: 'var(--earth, #2d2a26)' }}>
        Use wallet balance — <b>₹{balance.toLocaleString('en-IN')}</b> available
        {checked && total && total > 0 ? (
          <span style={{ color: 'var(--sage, #5a7d5a)' }}>
            {' '}(₹{applied.toLocaleString('en-IN')} will be applied{total - applied > 0 ? `, pay ₹${(total - applied).toLocaleString('en-IN')} online` : ' — fully covered'})
          </span>
        ) : null}
      </span>
    </label>
  );
}
