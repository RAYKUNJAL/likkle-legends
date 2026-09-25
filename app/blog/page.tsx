import type { Metadata } from 'next';
import BlogIndex from '@/components/blog/BlogIndex';
import { getBlogCatalog } from '@/lib/blog/published';
import { getPublicSiteUrl } from '@/lib/blog/site-url';
import { serializeJsonLd } from '@/lib/blog/json-ld';

const title = 'Caribbean Kids Blog';
const description = 'Parent guides for Caribbean education at home and in the diaspora. Kids songs, island pride, screen time, and free learning for ages 3–9, including Trinidad and Tobago, Jamaica, Barbados, and OECS islands.';

export async function generateMetadata(): Promise<Metadata> {
    const url = `${getPublicSiteUrl()}/blog`;
    return {
        title,
        description,
        keywords: [
            'Caribbean kids songs',
            'diaspora parenting',
            'Caribbean education',
            'Trinidad and Tobago kids',
            'Jamaica children',
            'Barbados kids',
            'OECS islands',
            'free Caribbean learning',
            'ages 3-9',
        ],
        alternates: { canonical: url },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            siteName: 'Likkle Legends',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function BlogPage() {
    const { posts, categories } = await getBlogCatalog();
    const siteUrl = getPublicSiteUrl();
    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Likkle Legends Blog',
        itemListElement: posts.map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/blog/${post.slug}`,
            name: post.title,
        })),
    };

    return (
        <>
            {posts.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemList) }}
                />
            )}
            <BlogIndex
                posts={posts.map((post) => ({
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    category: post.category,
                    published_at: post.published_at,
                    created_at: post.created_at,
                    read_time_minutes: post.read_time_minutes,
                    featured_image_url: post.featured_image_url,
                }))}
                categories={categories}
            />
        </>
    );
}
