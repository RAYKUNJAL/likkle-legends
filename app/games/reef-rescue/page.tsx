import type { Metadata } from 'next';
import PublicLeadGame from '@/components/games/PublicLeadGame';

export const metadata: Metadata = {
    title: 'Reef Rescue',
    description: 'Clear ocean litter, protect sea life and restore colorful Caribbean reefs on Likkle Legends.',
};

export default function ReefRescuePublicPage() {
    return <PublicLeadGame gameId="reef-rescue" />;
}
