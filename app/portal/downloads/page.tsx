"use client";

import { MemberShelfPage } from '@/components/portal/MemberContentShelf';

export default function DownloadsPage() {
    return (
        <MemberShelfPage
            emoji="📥"
            title="Downloads"
            subtitle="Printable packs and files ready to open or save."
            shelves={[
                {
                    section: 'downloads',
                    title: 'Download shelf',
                    emptyMessage: 'No downloads are on this shelf yet.',
                },
                {
                    section: 'printables',
                    title: 'Printable packs',
                    emptyMessage: 'No printable packs are on this shelf yet.',
                },
            ]}
        />
    );
}
