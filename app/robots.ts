import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/portal/', '/admin/', '/api/', '/checkout', '/account/', '/onboarding/'],
        },
        sitemap: 'https://www.likklelegends.com/sitemap.xml',
    };
}
