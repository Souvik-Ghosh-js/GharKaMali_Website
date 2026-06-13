import type { Metadata } from 'next';
import ShopDisabledGuard from './ShopDisabledGuard';

export const metadata: Metadata = {
  title: 'Plant Store — Buy Plants, Pots & Garden Products Online | GharKaMali',
  description: 'Shop premium plants, pots, organic fertilizers, and garden tools online. Fast delivery in Noida & Greater Noida. Best prices guaranteed on all garden products.',
  keywords: [
    'buy plants online', 'plant store noida', 'garden products', 'pots online', 'organic fertilizer',
    'gharkamali shop', 'buy indoor plants', 'buy outdoor plants noida', 'garden tools online',
    'plant delivery noida', 'soil mix online', 'fertilizer online india',
    'premium pots online', 'ceramic pots noida', 'garden accessories online',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/shop' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'GharKaMali Plant Store — Buy Plants, Pots & Garden Products Online',
    description: 'Buy plants, pots, tools and garden essentials online. Fast delivery in Noida & Greater Noida. Best prices guaranteed.',
    url: 'https://gharkamali.com/shop',
    images: [{ url: 'https://gharkamali.com/logo.png', width: 1200, height: 630, alt: 'GharKaMali Plant Store' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'GharKaMali Plant Store — Buy Plants, Pots & Garden Products Online',
    description: 'Buy plants, pots, tools and garden essentials online. Fast delivery in Noida & Greater Noida.',
    images: [{ url: 'https://gharkamali.com/logo.png', alt: 'GharKaMali Plant Store' }],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopDisabledGuard>{children}</ShopDisabledGuard>;
}
