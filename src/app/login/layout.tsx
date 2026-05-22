import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — GharKaMali',
  description: 'Sign in to your GharKaMali account to manage bookings, track your garden visits, and access your dashboard.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/login' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharKaMali',
    title: 'Login — GharKaMali',
    description: 'Sign in to manage your garden care bookings.',
    url: 'https://gharkamali.com/login',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'GharKaMali Login' }],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
