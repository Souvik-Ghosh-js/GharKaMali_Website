import type { Metadata } from 'next';
import BlogDetailClient from './BlogDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gkm.gobt.in/api';
const SITE = 'https://gharkamali.com';

async function fetchBlog(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blogs/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await fetchBlog(params.slug);

  if (!blog) {
    return {
      title: 'Blog Not Found — GharKaMali',
      robots: { index: false },
    };
  }

  const title = `${blog.title} | GharKaMali Blog`;
  const desc = (blog.excerpt || blog.description || blog.title).slice(0, 160);
  const image = blog.cover_image || blog.image || `${SITE}/og-image.jpg`;
  const url = `${SITE}/blogs/${params.slug}`;
  const publishedTime = blog.created_at || blog.published_at;
  const modifiedTime = blog.updated_at || blog.created_at;

  return {
    title,
    description: desc,
    keywords: [
      ...(blog.tags || []),
      'gardening tips', 'plant care', 'home garden', 'gharkamali blog',
      blog.category?.name || 'gardening',
    ],
    authors: blog.author ? [{ name: blog.author }] : [{ name: 'GharKaMali' }],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'en_IN',
      siteName: 'GharKaMali',
      title,
      description: desc,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: blog.title }],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      authors: blog.author ? [blog.author] : ['GharKaMali'],
      section: blog.category?.name || 'Gardening',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@gharkamali',
      creator: '@gharkamali',
      title,
      description: desc,
      images: [{ url: image, alt: blog.title }],
    },
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  return <BlogDetailClient />;
}
