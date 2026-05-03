import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.likklelegends.com';

  const staticRoutes = [
    '',
    '/blog',
    '/games',
    '/radio',
    '/characters',
    '/pricing',
    '/about',
    '/contact',
    '/faq',
    '/terms',
    '/privacy',
    '/signup',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/blog' || route === '/games' ? 0.9 : 0.8,
  }));

  return staticRoutes;
}
