import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://likklelegends.com';

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
