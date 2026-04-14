import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/login/', '/payment/', '/profile/'],
      },
    ],
    sitemap: 'https://gharkamali.com/sitemap.xml',
  };
}
