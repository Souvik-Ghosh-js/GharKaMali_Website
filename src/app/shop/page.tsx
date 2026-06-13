'use client';
import { Suspense } from 'react';
import { ShopClient } from './ShopClient';

// Note: the /shop layout (ShopDisabledGuard) shows a "coming soon" panel and
// redirects home while SHOP_ENABLED is false, so this only renders when enabled.
export default function ShopPage() {
  return (
    <Suspense>
      <ShopClient />
    </Suspense>
  );
}
