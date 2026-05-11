import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions, Privacy Policy — GharKaMali',
  description: "Read GharKaMali's Terms & Conditions, Privacy Policy, and Gardener App Terms. We are committed to transparency and protecting your data.",
  keywords: ['gharkamali terms', 'privacy policy gharkamali', 'terms and conditions', 'gharkamali legal'],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1 } },
  alternates: { canonical: 'https://gharkamali.com/terms' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Terms & Conditions — GharKaMali',
    description: "GharKaMali's Terms of Service, Privacy Policy, and Gardener App Terms.",
    url: 'https://gharkamali.com/terms',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'GharKaMali Legal' }],
  },
  twitter: {
    card: 'summary',
    site: '@gharkamali',
    title: 'Terms & Conditions — GharKaMali',
    description: "GharKaMali's Terms of Service and Privacy Policy.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
