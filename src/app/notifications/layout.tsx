import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications — GharKaMali',
  description: 'Your GharKaMali notifications and updates.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/notifications' },
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
