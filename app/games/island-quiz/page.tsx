import type { Metadata } from 'next';
import PublicLeadGame from '@/components/games/PublicLeadGame';

export const metadata: Metadata = {
    title: 'Island Quiz Quest',
    description: 'Match each Caribbean island with its foods, wildlife, flags and cultural treasures on Likkle Legends.',
};

export default function IslandQuizPublicPage() {
    return <PublicLeadGame gameId="island-quiz" />;
}