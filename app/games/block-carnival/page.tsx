import BlockCarnivalPlay from '@/components/games/public/BlockCarnivalPlay';
import { publicGameMetadata } from '@/lib/public-games';

export const metadata = publicGameMetadata(
    'Block Carnival',
    'Free Caribbean block puzzle for kids. Place bright pieces, clear lines, and fill the Carnival Fever meter on Likkle Legends.',
    '/games/block-carnival',
);

export default function BlockCarnivalPublicPage() {
    return <BlockCarnivalPlay />;
}
