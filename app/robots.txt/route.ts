import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /

# Important pages
Allow: /blog/
Allow: /games/
Allow: /radio/
Allow: /characters/
Allow: /pricing/

# Disallow admin
Disallow: /admin/
Disallow: /api/
Disallow: /portal/
Disallow: /parent/

Sitemap: https://www.likklelegends.com/sitemap.xml
`;
  return new NextResponse(robots, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
