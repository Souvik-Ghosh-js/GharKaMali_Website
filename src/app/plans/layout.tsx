import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monthly Plant Care Plans — GharKaMali | Starting ₹349/month',
  description: 'Choose from flexible monthly gardening subscription plans. Regular mali visits, plant health reports, and 24/7 WhatsApp support. Starting ₹349/month in Noida & Greater Noida.',
  keywords: [
    'monthly gardening plan', 'plant care subscription', 'mali subscription noida',
    'gardening package india', 'annual garden maintenance plan', 'cheap gardening plan noida',
    'plant care package', 'weekly mali visit plan', 'bi-weekly garden visit',
    'home garden subscription', 'best plant care plan', 'affordable mali plan noida',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/plans' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Monthly Plant Care Plans — GharKaMali | Starting ₹349/month',
    description: 'Affordable monthly plans for professional home garden care. Regular visits, health reports, and 24/7 support.',
    url: 'https://gharkamali.com/plans',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'GharKaMali Plant Care Plans' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Monthly Plant Care Plans — GharKaMali | Starting ₹349/month',
    description: 'Affordable monthly plans for professional home garden care. Book your first visit today.',
    images: [{ url: '/logo.png', alt: 'GharKaMali Plant Care Plans' }],
  },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
