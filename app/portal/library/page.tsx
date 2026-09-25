"use client";

import { MemberShelfPage } from '@/components/portal/MemberContentShelf';

export default function MemberLibraryPage() {
    return (
        <MemberShelfPage
            emoji="📚"
            title="Library"
            subtitle="Stories and packs placed in the portal library."
            shelves={[
                {
                    section: 'featured_home',
                    title: 'Featured',
                    emptyMessage: 'Nothing is featured right now.',
                },
                {
                    section: 'portal_library',
                    title: 'Portal library',
                    emptyMessage: 'The portal library shelf is empty.',
                },
                {
                    section: 'kids_library',
                    title: 'Kids library',
                    emptyMessage: 'The kids library shelf is empty.',
                },
                {
                    section: 'stories',
                    title: 'Story files',
                    emptyMessage: 'No story files are on this shelf yet.',
                },
            ]}
        />
    );
}
