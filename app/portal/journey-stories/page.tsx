"use client";

import { MemberShelfPage } from '@/components/portal/MemberContentShelf';

export default function JourneyStoriesPage() {
    return (
        <MemberShelfPage
            emoji="🧭"
            title="Journey Stories"
            subtitle="Story packs and journey files assigned for members."
            shelves={[{
                section: 'journey_stories',
                title: 'Journey shelf',
                emptyMessage: 'No journey stories are on this shelf yet.',
            }]}
        />
    );
}
