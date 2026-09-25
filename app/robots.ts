import { MetadataRoute } from 'next';
import { getPublicSiteUrl } from '@/lib/blog/site-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicSiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',          // Keep admin private from crawlers
        '/api/',            // Private API endpoints
        '/onboarding/',     // Signup flow (not for search)
        '/onboarding/*',
        '/portal/',         // App core (guarded anyway)
        '/portal/*',
        '/parent/',         // Dashboard
        '/account/',        // User settings
        '/messages/',       // Private comms
        '/checkout/',       // Privacy in payment flow
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
