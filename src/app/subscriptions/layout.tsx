import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Subscriptions — GharKaMali',
  description: 'Manage your active garden care subscriptions with GharKaMali.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/subscriptions' },
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
