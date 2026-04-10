import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

const BASE_URL = 'https://www.likklelegends.com';

const STATIC_PAGES = [
  { url: '/',          priority: '1.0', changefreq: 'daily' },
  { url: '/blog',      priority: '0.9', changefreq: 'daily' },
  { url: '/games',     priority: '0.9', changefreq: 'weekly' },
  { url: '/radio',     priority: '0.8', changefreq: 'weekly' },
  { url: '/pricing',   priority: '0.8', changefreq: 'monthly' },
  { url: '/characters',priority: '0.8', changefreq: 'monthly' },
  { url: '/about',     priority: '0.6', changefreq: 'monthly' },
  { url: '/contact',   priority: '0.5', changefreq: 'monthly' },
  { url: '/faq',       priority: '0.6', changefreq: 'monthly' },
  { url: '/signup',    priority: '0.7', changefreq: 'monthly' },
];

export async function GET() {
  const admin = createAdminClient();

  // Fetch all published blog posts
  const { data: posts } = await admin
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const now = new Date().toISOString().split('T')[0];

  const urls = [
    ...STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...(posts || []).map(p => `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <lastmod>${(p.updated_at || p.published_at || now).split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
