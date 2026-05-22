import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — GharKaMali | Professional Home Gardening Service',
  description: "Learn about GharKaMali — India's most trusted home gardening service. Our mission to make professional plant care accessible to every home in Noida, Greater Noida & Delhi NCR.",
  keywords: [
    'about gharkamali', 'home gardening company noida', 'plant care service',
    'gharkamali story', 'trusted mali service', 'professional plant care india',
    'gardening startup india', 'gharkamali team', 'about home garden service',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/about' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'About GharKaMali — Professional Home Gardening Service',
    description: "India's most trusted home gardening service. Reliable, affordable, expert plant care at your doorstep.",
    url: 'https://gharkamali.com/about',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'About GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'About GharKaMali — Professional Home Gardening Service',
    description: "India's most trusted home gardening service. Reliable, affordable, expert plant care at your doorstep.",
    images: [{ url: '/logo.png', alt: 'About GharKaMali' }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
