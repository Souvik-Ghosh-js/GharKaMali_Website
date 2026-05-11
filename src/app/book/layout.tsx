import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Gardener Visit — GharKaMali | ₹349 per Visit',
  description: 'Book a professional mali visit starting ₹349. Choose your date, plants, and location. Expert gardeners in Noida & Greater Noida. Instant confirmation!',
  keywords: [
    'book gardener noida', 'mali booking', 'plant care visit', 'book gardening service',
    'online mali booking', 'book plant care', 'gardener at home noida', 'hire mali noida',
    'book garden expert', 'same day gardener booking',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/book' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Book a Gardener Visit — GharKaMali | ₹349 per Visit',
    description: 'Professional plant care at your doorstep. Book in 60 seconds. Expert gardeners in Noida & Greater Noida.',
    url: 'https://gharkamali.com/book',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Book a Gardener — GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Book a Gardener Visit — GharKaMali | ₹349 per Visit',
    description: 'Professional plant care at your doorstep. Book in 60 seconds.',
    images: [{ url: '/logo.png', alt: 'Book a Gardener — GharKaMali' }],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
