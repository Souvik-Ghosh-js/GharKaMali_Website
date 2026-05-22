import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile — GharKaMali',
  description: 'Manage your GharKaMali profile, addresses, and preferences.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/profile' },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
