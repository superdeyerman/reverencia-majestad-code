import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? 'https://reverenciamajestad.cl';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/login', '/checkout/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
