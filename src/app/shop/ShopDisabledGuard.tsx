'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SHOP_ENABLED } from '@/lib/features';

// Wraps every /shop/* route. While the store is disabled, any deep link
// (/shop, /shop/[slug], /shop/orders, …) shows a "coming soon" panel and
// redirects home — so bookmarks/old links never reach the live store UI.
export default function ShopDisabledGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!SHOP_ENABLED) {
      const t = setTimeout(() => router.replace('/'), 2500);
      return () => clearTimeout(t);
    }
  }, [router]);

  if (SHOP_ENABLED) return <>{children}</>;

  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, gap: 12 }}>
      <div style={{ fontSize: '3rem' }}>🪴</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--forest)' }}>Plant Store — Coming Soon</h1>
      <p style={{ color: 'var(--sage)', fontWeight: 600, maxWidth: 420 }}>Our plant store is being prepared. In the meantime, explore our care plans and book a visit.</p>
      <a href="/plans" className="btn btn-forest" style={{ marginTop: 8, padding: '12px 24px' }}>View Care Plans</a>
    </div>
  );
}
