import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plantopedia — Plant Encyclopedia & Care Guide | GharKaMali',
  description: 'Explore our complete plant encyclopedia. Learn how to grow, water, and care for hundreds of indoor and outdoor plants. Free guides by GharKaMali botanists.',
  keywords: [
    'plant encyclopedia india', 'plant care guide', 'plantopedia', 'how to grow plants',
    'indoor plant guide', 'outdoor plant care', 'plant watering guide', 'plant sunlight needs',
    'best indoor plants india', 'flowering plants care', 'succulent care guide',
    'monstera care', 'money plant care', 'snake plant guide', 'aloe vera care',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/plantopedia' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Plantopedia — Plant Care Encyclopedia by GharKaMali',
    description: 'Your complete guide to growing and caring for plants at home. Hundreds of plant profiles with expert care tips.',
    url: 'https://gharkamali.com/plantopedia',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Plantopedia — GharKaMali Plant Encyclopedia' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Plantopedia — Plant Care Encyclopedia by GharKaMali',
    description: 'Your complete guide to growing and caring for plants at home.',
    images: [{ url: '/logo.png', alt: 'Plantopedia — GharKaMali Plant Encyclopedia' }],
  },
};

export default function PlantopediaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
