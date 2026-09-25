import type { Metadata } from 'next';
import GamesLanding from '@/components/games/GamesLanding';
import { getPublicSiteUrl } from '@/lib/blog/site-url';
import {
    GAMES_LANDING_DESCRIPTION,
    GAMES_LANDING_TITLE,
    publicGameMetadata,
} from '@/lib/public-games';

const landingMeta = publicGameMetadata(GAMES_LANDING_TITLE, GAMES_LANDING_DESCRIPTION, '/games');

export const metadata: Metadata = {
    ...landingMeta,
    openGraph: {
        ...landingMeta.openGraph,
        url: `${getPublicSiteUrl()}/games`,
    },
};

export default function GamesPage() {
    return <GamesLanding />;
}
