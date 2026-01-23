// RSS Feed for blog
// Generates /feed.xml for RSS readers and syndication

import { getPublishedPosts, BlogPost } from '@/lib/services/blog';

export async function GET() {
    const baseUrl = 'https://www.likklelegends.com';

    let posts: BlogPost[] = [];
    try {
        posts = await getPublishedPosts({ limit: 50 });
    } catch (error) {
        console.error('Error fetching posts for RSS:', error);
    }


    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Likkle Legends Blog</title>
        <link>${baseUrl}/blog</link>
        <description>Stories, tips, and resources for raising proud Caribbean children. Educational content for diaspora families.</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
        <image>
            <url>${baseUrl}/images/logo.png</url>
            <title>Likkle Legends</title>
            <link>${baseUrl}</link>
        </image>
        ${posts.map(post => `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${baseUrl}/blog/${post.slug}</link>
            <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
            <description><![CDATA[${post.excerpt || ''}]]></description>
            <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
            <author>team@likklelegends.com (${post.author_name})</author>
            <category>${post.category}</category>
            ${post.featured_image_url ? `<enclosure url="${post.featured_image_url}" type="image/jpeg"/>` : ''}
        </item>`).join('')}
    </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
        }
    });
}
