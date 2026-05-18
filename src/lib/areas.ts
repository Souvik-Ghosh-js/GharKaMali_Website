// Source of truth for "Where we serve" — backed by the admin **City SEO**
// page + global SEO template setting (`city_seo_template`).
//
// Data flow:
//   admin saves city  →  GET /cities
//   admin saves SEO   →  GET /settings/city_seo_template
//   /[area]/page.tsx, sitemap, About pills → fetchAreas() / fetchTemplate()
//
// If the API is unreachable or empty, we fall back to the hardcoded list
// below so the site never breaks.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';

export type ServingArea = {
  slug: string;
  name: string;
  city?: string;
  // optional override / extra blurb shown on the dedicated page
  blurb?: string;
};

// Hardcoded fallback — used when /cities API is down or returns empty.
export const SERVING_AREAS: ServingArea[] = [
  { slug: 'ats-pristine',         name: 'ATS Pristine',         city: 'Noida' },
  { slug: 'gaur-city',            name: 'Gaur City',            city: 'Greater Noida' },
  { slug: 'supertech-capetown',   name: 'Supertech Capetown',   city: 'Noida' },
  { slug: 'godrej-properties',    name: 'Godrej Properties',    city: 'Noida' },
  { slug: 'mahagun-moderne',      name: 'Mahagun Moderne',      city: 'Noida' },
  { slug: 'sikka-karmic-greens',  name: 'Sikka Karmic Greens',  city: 'Greater Noida' },
  { slug: 'amrapali-silicon-city',name: 'Amrapali Silicon City',city: 'Noida' },
  { slug: 'sector-62',            name: 'Sector 62',            city: 'Noida' },
  { slug: 'sector-78',            name: 'Sector 78',            city: 'Noida' },
  { slug: 'sector-137',           name: 'Sector 137',           city: 'Noida' },
  { slug: 'sector-150',           name: 'Sector 150',           city: 'Noida' },
  { slug: 'sector-93',            name: 'Sector 93',            city: 'Noida' },
  { slug: 'sector-128',           name: 'Sector 128',           city: 'Noida' },
  { slug: 'noida-extension',      name: 'Noida Extension',      city: 'Greater Noida' },
];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

// Normalises an API city_pages row → ServingArea shape
function toArea(row: any): ServingArea | null {
  const name = (row?.city_name || row?.name || '').trim();
  if (!name) return null;
  return {
    slug: (row.slug || slugify(name)).trim(),
    name,
    city: row.state || row.city || undefined,
    blurb: row.hero_description || row.about_text || undefined,
  };
}

/**
 * Returns the active service areas. Fetches from /cities first; if that fails
 * or returns nothing, returns the hardcoded SERVING_AREAS list.
 */
export async function fetchAreas(): Promise<ServingArea[]> {
  try {
    const res = await fetch(`${API_BASE}/cities`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const rows: any[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
    const areas = rows.map(toArea).filter((a): a is ServingArea => !!a);
    return areas.length ? areas : SERVING_AREAS;
  } catch {
    return SERVING_AREAS;
  }
}

export async function fetchArea(slug: string): Promise<ServingArea | undefined> {
  const areas = await fetchAreas();
  return areas.find(a => a.slug === slug);
}

// Global SEO template — saved in admin → City SEO page → "Global Template".
// Stored as a single JSON string at system_settings.city_seo_template.
export type SeoTemplate = {
  title: string;
  h1: string;
  meta_description: string;
  about_text: string;
  meta_keywords: string;
};

export const DEFAULT_TEMPLATE: SeoTemplate = {
  title: 'Best Gardeners in {city} | GharKaMali',
  h1: 'Professional Gardening Services in {city}',
  meta_description: 'Hire trusted gardeners in {city} for lawn care, plant maintenance, and garden setup. Book online with GharKaMali.',
  about_text: 'GharKaMali brings expert gardening services to {city}. From regular plant care to one-time setup, our verified gardeners cover every corner of {city} — fast, reliable, and affordable.',
  meta_keywords: 'gardener in {city}, gardening service {city}, plant care {city}',
};

export async function fetchTemplate(): Promise<SeoTemplate> {
  try {
    const res = await fetch(`${API_BASE}/settings/city_seo_template`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const value = json?.data?.value ?? json?.value ?? json?.data ?? json;
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object') return { ...DEFAULT_TEMPLATE, ...parsed };
    return DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

/** Replace {city} (case-insensitive) with the area name. */
export const renderTpl = (s: string, name: string): string =>
  (s || '').replace(/\{city\}/gi, name);

// Legacy sync export — kept so the (now-removed) static usage in [area]/page
// could compile during migration. Prefer fetchArea() everywhere.
export const getArea = (slug: string): ServingArea | undefined =>
  SERVING_AREAS.find(a => a.slug === slug);
