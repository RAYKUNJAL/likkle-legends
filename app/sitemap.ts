import type { MetadataRoute } from 'next';
import { getPublicSiteUrl } from '@/lib/blog/site-url';
import { FEATURED_PUBLIC_GAMES, MORE_PUBLIC_GAMES } from '@/lib/public-games';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
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

  try {
    const { getPublishedPostsForRender } = await import('@/lib/blog/published');
    const posts = await getPublishedPostsForRender();
    const seen = new Set(staticRoutes.map((route) => route.url));
    const postRoutes: MetadataRoute.Sitemap = [];

    for (const post of posts) {
      if (!post.slug) continue;
      const url = `${baseUrl}/blog/${post.slug}`;
      if (seen.has(url)) continue;
      seen.add(url);
      const stamp = post.updated_at || post.published_at || post.created_at;
      const lastModified = new Date(stamp);
      postRoutes.push({
        url,
        lastModified: Number.isNaN(lastModified.getTime()) ? new Date() : lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    return [...staticRoutes, ...gameRoutes(baseUrl), ...postRoutes];
  } catch (error) {
    console.error('Sitemap blog URLs skipped:', error);
    return [...staticRoutes, ...gameRoutes(baseUrl)];
  }
}

function gameRoutes(baseUrl: string): MetadataRoute.Sitemap {
  return [...FEATURED_PUBLIC_GAMES, ...MORE_PUBLIC_GAMES].map((game) => ({
    url: `${baseUrl}${game.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
}
