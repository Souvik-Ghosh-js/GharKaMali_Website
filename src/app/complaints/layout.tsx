import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complaints & Support — GharKaMali',
  description: 'Submit a complaint or get support from GharKaMali customer care.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://gharkamali.com/complaints' },
};

export default function ComplaintsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
