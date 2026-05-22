import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — Join GharKaMali | Gardening & Tech Jobs in Noida',
  description: 'Join the GharKaMali team. We are hiring certified plant experts, customer support, field operations, and growth professionals. Build a green career with us.',
  keywords: [
    'gardening jobs noida', 'mali jobs', 'gharkamali careers', 'plant expert jobs',
    'green startup jobs india', 'horticulture jobs noida', 'garden company jobs',
    'field jobs noida', 'agritech jobs india', 'customer support jobs noida',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/careers' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Careers at GharKaMali — Grow With Us',
    description: "Be part of India's most trusted home gardening platform. Grow your career while helping others grow their gardens.",
    url: 'https://gharkamali.com/careers',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Careers at GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Careers at GharKaMali — Grow With Us',
    description: "Be part of India's most trusted home gardening platform.",
    images: [{ url: '/logo.png', alt: 'Careers at GharKaMali' }],
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
