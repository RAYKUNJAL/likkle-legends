const nextConfig = {
  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      // API routes must never be publicly cached (auth callbacks set cookies that CDNs must not strip)
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
        ],
      },
      // Always revalidate HTML pages — prevents mobile browsers from serving stale page shells
      {
        source: '/((?!_next/static|_next/image|images|favicon.ico|apple-icon.png|icon.png|api).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      // Long-cache for static assets (JS chunks, fonts, images)
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache public images for 7 days
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      // Security + performance headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com https://static.cloudflareinsights.com https://www.youtube.com https://www.youtube-nocookie.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai;
              img-src 'self' blob: data: https://*.supabase.co https://www.paypalobjects.com https://api.dicebear.com https://ui-avatars.com https://modelviewer.dev https://images.unsplash.com https://img.youtube.com https://i.ytimg.com;
              connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.elevenlabs.io https://www.paypal.com https://api.paypal.com https://api-m.paypal.com https://api.sandbox.paypal.com https://api.elevenlabs.io https://generativelanguage.googleapis.com https://modelviewer.dev https://www.youtube.com https://www.youtube-nocookie.com;
              media-src 'self' blob: data: https://*.supabase.co https://modelviewer.dev https://cdn1.suno.ai https://cdn2.suno.ai;
              worker-src 'self' blob:;
              frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com https://www.youtube.com https://www.youtube-nocookie.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=*, microphone=*, geolocation=(), interest-cohort=()' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'www.likklelegends.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
    unoptimized: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
