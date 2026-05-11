import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gardening Blog — Plant Care Tips & Guides | GharKaMali',
  description: "Read expert plant care tips, seasonal gardening guides, and home garden advice from GharKaMali's certified botanists. Free guides for Noida & NCR gardeners.",
  keywords: [
    'gardening tips india', 'plant care guide', 'home garden blog', 'indoor plants care',
    'outdoor garden tips', 'seasonal planting guide', 'watering plants tips',
    'plant disease treatment', 'balcony garden ideas', 'terrace garden blog',
    'monsoon gardening tips', 'winter plant care india',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/blogs' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'GharKaMali Blog — Gardening Tips & Plant Care Guides',
    description: 'Expert advice on growing and maintaining a beautiful home garden. Free guides by certified botanists.',
    url: 'https://gharkamali.com/blogs',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'GharKaMali Gardening Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'GharKaMali Blog — Gardening Tips & Plant Care Guides',
    description: 'Expert advice on growing and maintaining a beautiful home garden.',
    images: [{ url: '/logo.png', alt: 'GharKaMali Gardening Blog' }],
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
