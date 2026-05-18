import { MetadataRoute } from 'next';
import { fetchAreas } from '@/lib/areas';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://gharkamali.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/plans`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/book`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/plantopedia`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/careers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/green-makeover`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/complaints`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Service area pages — driven by admin City SEO list, falls back to
  // hardcoded SERVING_AREAS if the API is unreachable.
  const areas = await fetchAreas();
  const areaPages: MetadataRoute.Sitemap = areas.map(a => ({
    url: `${base}/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic: City pages
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/cities`, { next: { revalidate: 3600 } });
    const json = await res.json();
    const cities = json?.data || [];
    cityPages = cities.map((c: any) => ({
      url: `${base}/cities/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (e) { /* API down — skip dynamic pages */ }

  // Dynamic: Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/blogs?status=published`, { next: { revalidate: 3600 } });
    const json = await res.json();
    const blogs = json?.data?.blogs || json?.data || [];
    blogPages = blogs.map((b: any) => ({
      url: `${base}/blogs/${b.slug}`,
      lastModified: b.published_at ? new Date(b.published_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (e) { /* API down — skip */ }

  return [...staticPages, ...areaPages, ...cityPages, ...blogPages];
}
