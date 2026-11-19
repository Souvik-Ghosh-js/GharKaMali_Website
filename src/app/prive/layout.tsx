import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privé by GharKaMali',
  description: 'Artisanal planters for curated spaces. A limited collection of sculptural planters, available by pre-order.',
  alternates: { canonical: 'https://gharkamali.com/prive' },
  openGraph: {
    type: 'website',
    title: 'Privé by GharKaMali',
    description: 'Artisanal planters for curated spaces.',
    url: 'https://gharkamali.com/prive',
    images: [{ url: 'https://gharkamali.com/prive_scene.jpg', width: 1254, height: 470, alt: 'Privé by GharKaMali' }],
  },
};

export default function PriveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
