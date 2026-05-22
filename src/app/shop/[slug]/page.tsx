import type { Metadata } from 'next';
import ProductClient from './ProductClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';
const SITE = 'https://gharkamali.com';

async function fetchAllProducts() {
  try {
    const res = await fetch(`${API_BASE}/shop/products?limit=500`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return (json?.data || json || []) as any[];
  } catch {
    return [];
  }
}

function findProduct(list: any[], slug: string) {
  return list.find(
    (p: any) =>
      String(p.id)   === slug ||
      String(p._id)  === slug ||
      String(p.slug) === slug
  ) ?? null;
}

export const dynamicParams = true; // serve new products on-demand without a rebuild

/* ── Static params for build-time pre-rendering ── */
export async function generateStaticParams() {
  const products = await fetchAllProducts();
  return products.map((p: any) => ({ slug: String(p.slug || p.id) }));
}

/* ── Per-product metadata for Google ── */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const products = await fetchAllProducts();
  const p = findProduct(products, params.slug);

  if (!p) {
    return {
      title: 'Product Not Found — GharKaMali Shop',
      robots: { index: false },
    };
  }

  const title = `Buy ${p.name} Online — GharKaMali Plant Store`;
  const desc = (p.description || `Buy ${p.name} online from GharKaMali. Premium quality garden products delivered to your home in Noida & Greater Noida.`).slice(0, 160);
  const image = p.images?.[0] || p.thumbnail || `${SITE}/og-image.jpg`;
  const url = `${SITE}/shop/${p.slug || p.id}`;
  const price = Number(p.price ?? 0);

  return {
    title,
    description: desc,
    keywords: [
      `buy ${p.name}`,
      `${p.name} online`,
      `${p.category?.name || 'garden'} products`,
      'plant store noida',
      'garden products online',
      'gharkamali shop',
      ...(p.tags || []),
    ],
    openGraph: {
      title,
      description: desc,
      url,
      type: 'website',
      images: [{ url: image, width: 800, height: 800, alt: p.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [image],
    },
    alternates: { canonical: url },
  };
}

/* ── Server page component ── */
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const products = await fetchAllProducts();
  const product = findProduct(products, params.slug);

  const price = Number(product?.price ?? 0);
  const mrp   = Number(product?.mrp ?? 0);

  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.images || (product.thumbnail ? [product.thumbnail] : []),
    sku: product.sku || String(product.id),
    brand: { '@type': 'Brand', name: 'GharKaMali' },
    offers: {
      '@type': 'Offer',
      url: `${SITE}/shop/${product.slug || product.id}`,
      priceCurrency: 'INR',
      price: price.toFixed(2),
      ...(mrp > price ? { priceValidUntil: new Date(Date.now() + 30 * 86400_000).toISOString().split('T')[0] } : {}),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'GharKaMali' },
    },
    ...(product.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.review_count || 1 } } : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
  } : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop` },
      ...(product ? [{ '@type': 'ListItem', position: 3, name: product.name, item: `${SITE}/shop/${product.slug || product.id}` }] : []),
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductClient slug={params.slug} initialProduct={product} />
    </>
  );
}
