import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — GharKaMali',
  description: 'Manage your garden care bookings and account from your GharKaMali dashboard.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/dashboard' },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
