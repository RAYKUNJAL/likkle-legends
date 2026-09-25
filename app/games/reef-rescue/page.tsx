import ReefRescuePlay from '@/components/games/public/ReefRescuePlay';
import { publicGameMetadata } from '@/lib/public-games';

export const metadata = publicGameMetadata(
    'Reef Rescue',
    'Free Caribbean reef game for kids. Clear ocean litter, protect sea life, and restore colorful reefs with Tali the Turtle on Likkle Legends.',
    '/games/reef-rescue',
);

export default function ReefRescuePublicPage() {
    return <ReefRescuePlay />;
}
