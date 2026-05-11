import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Garden & Balcony Makeover — GharKaMali | Transform Your Space in Noida',
  description: 'Complete garden and balcony makeover services in Noida & Greater Noida. Expert landscape design, plant setup, soil preparation, and ongoing care. Get a free quote!',
  keywords: [
    'balcony makeover noida', 'garden makeover', 'landscape design noida', 'balcony garden setup',
    'terrace garden makeover', 'green balcony noida', 'garden transformation noida',
    'landscaping service noida', 'garden design delhi ncr', 'balcony planting service',
    'outdoor space makeover', 'apartment balcony garden', 'rooftop garden noida',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/green-makeover' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Garden & Balcony Makeover Services — GharKaMali',
    description: 'Transform your balcony or garden with expert design and plant care. Complete makeover services in Noida & Greater Noida.',
    url: 'https://gharkamali.com/green-makeover',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Garden Makeover — GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Garden & Balcony Makeover Services — GharKaMali',
    description: 'Transform your balcony or garden with expert design and plant care.',
    images: [{ url: '/logo.png', alt: 'Garden Makeover — GharKaMali' }],
  },
};

export default function GreenMakeoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
