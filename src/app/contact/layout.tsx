import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — GharKaMali | Talk to Our Gardening Experts',
  description: 'Get in touch with GharKaMali. Chat on WhatsApp, call, or email. We serve Noida, Greater Noida, and Delhi NCR. Quick response guaranteed!',
  keywords: [
    'contact gharkamali', 'gardening service contact', 'mali contact noida',
    'gharkamali whatsapp', 'gharkamali phone', 'plant care support', 'garden service helpline',
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
  alternates: { canonical: 'https://gharkamali.com/contact' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Contact GharKaMali — We Are Here to Help',
    description: 'Reach out to our team for bookings, queries, or support. WhatsApp, call, or email — we respond fast.',
    url: 'https://gharkamali.com/contact',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Contact GharKaMali' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gharkamali',
    creator: '@gharkamali',
    title: 'Contact GharKaMali — We Are Here to Help',
    description: 'Reach out to our team for bookings, queries, or support.',
    images: [{ url: '/logo.png', alt: 'Contact GharKaMali' }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
