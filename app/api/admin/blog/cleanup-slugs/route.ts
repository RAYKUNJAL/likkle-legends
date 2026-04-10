/**
 * GET /api/admin/blog/cleanup-slugs
 * One-time route to clean up timestamp-suffixed slugs from batch generation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function POST(_request: NextRequest) {
  const admin = createAdminClient();

  const { data: posts } = await admin
    .from('blog_posts')
    .select('id, title, slug')
    .like('slug', '%-17%'); // Timestamp slugs contain epoch ms (17 digits)

  if (!posts || posts.length === 0) {
    return NextResponse.json({ message: 'No slugs to clean', updated: 0 });
  }

  const updates = [];
  for (const post of posts) {
    // Remove trailing -1775XXXXXXXXX timestamp
    const cleanSlug = (post.slug as string).replace(/-1\d{12,}$/, '');
    if (cleanSlug !== post.slug) {
      const { error } = await admin
        .from('blog_posts')
        .update({ slug: cleanSlug })
        .eq('id', post.id);
      if (!error) updates.push({ id: post.id, old: post.slug, new: cleanSlug });
    }
  }

  return NextResponse.json({ updated: updates.length, slugs: updates });
}
