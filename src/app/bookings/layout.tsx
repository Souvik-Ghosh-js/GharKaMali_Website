import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookings — GharKaMali',
  description: 'View and manage your garden care bookings with GharKaMali.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/bookings' },
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
