import type { Metadata } from 'next';
import PublicLeadGame from '@/components/games/PublicLeadGame';

export const metadata: Metadata = {
    title: 'Caribbean Block Carnival',
    description: 'Place vibrant blocks, clear lines, and fill the Carnival Fever meter on Likkle Legends.',
};

export default function BlockCarnivalPublicPage() {
    return <PublicLeadGame gameId="block-carnival" />;
}
