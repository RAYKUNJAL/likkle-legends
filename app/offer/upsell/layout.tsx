import type { Metadata } from 'next';

const SITE_URL =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com';

export const metadata: Metadata = {
    title: 'Legends Plus Upgrade — Likkle Legends',
    description:
        'Unlock the full portal with Legends Plus — unlimited Caribbean stories, all five Legends characters, and premium activities.',
    robots: { index: false, follow: true },
    openGraph: {
        title: 'Caribbean Learning That Feels Like Home | Likkle Legends',
        description:
            'Stories, phonics practice, and school-style activities designed to help children grow in reading, confidence, and connection to their Caribbean roots.',
        url: `${SITE_URL}/offer/upsell`,
        siteName: 'Likkle Legends',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Caribbean Learning That Feels Like Home | Likkle Legends',
        description:
            'Stories, phonics practice, and school-style activities for kids 3–8.',
    },
};

export default function UpsellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
