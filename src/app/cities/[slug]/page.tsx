import type { Metadata } from 'next';
import CityPageClient from './CityPageClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';
const SITE = 'https://gharkamali.com';

async function fetchCity(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/cities/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = await fetchCity(params.slug);
  const cityName = city?.name || params.slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const url = `${SITE}/cities/${params.slug}`;

  const title = `Gardener in ${cityName} | Mali Service in ${cityName} — GharKaMali`;
  const desc = city?.description ||
    `Professional gardening services in ${cityName}. Expert malis at your home starting ₹349. Book a gardener in ${cityName} today!`;

  return {
    title,
    description: desc.slice(0, 160),
    keywords: [
      `gardener in ${cityName.toLowerCase()}`,
      `mali in ${cityName.toLowerCase()}`,
      `plant care ${cityName.toLowerCase()}`,
      `gardening service ${cityName.toLowerCase()}`,
      `mali near me ${cityName.toLowerCase()}`,
      'gharkamali', 'home gardening service',
    ],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'GharKaMali',
      title,
      description: desc.slice(0, 160),
      url,
      images: [{ url: `${SITE}/og-image.jpg`, width: 1200, height: 630, alt: `Gardening Service in ${cityName}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gharkamali',
      creator: '@gharkamali',
      title,
      description: desc.slice(0, 160),
      images: [{ url: `${SITE}/og-image.jpg`, alt: `Gardening Service in ${cityName}` }],
    },
  };
}

export default function CityPage({ params }: { params: { slug: string } }) {
  return <CityPageClient />;
}
