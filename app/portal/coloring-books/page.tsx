"use client";

import { MemberShelfPage } from '@/components/portal/MemberContentShelf';

export default function ColoringBooksPage() {
    return (
        <MemberShelfPage
            emoji="🖍️"
            title="Coloring Books"
            subtitle="Pages and packs your parent’s membership has opened for you."
            shelves={[{
                section: 'coloring_books',
                title: 'Coloring shelf',
                emptyMessage: 'No coloring books are on this shelf yet.',
            }]}
        />
    );
}
