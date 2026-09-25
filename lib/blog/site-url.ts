/** Public site origin for canonicals, sitemap, and share links. */
export function getPublicSiteUrl(): string {
    const raw =
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
        'https://www.likklelegends.com';
    return raw.replace(/\/+$/, '');
}

export function blogPostUrl(slug: string): string {
    return `${getPublicSiteUrl()}/blog/${slug}`;
}
