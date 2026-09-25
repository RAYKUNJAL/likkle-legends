import IslandQuizPlay from '@/components/games/public/IslandQuizPlay';
import { publicGameMetadata } from '@/lib/public-games';

export const metadata = publicGameMetadata(
    'Island Quiz',
    'Free Caribbean island quiz for kids. Match foods, wildlife, flags, and cultural treasures on Likkle Legends.',
    '/games/island-quiz',
);

export default function IslandQuizPublicPage() {
    return <IslandQuizPlay />;
}
