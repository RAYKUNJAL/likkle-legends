'use client';

import BlockCarnival from '@/components/games/BlockCarnival';
import PublicPlayFrame from '@/components/games/PublicPlayFrame';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function BlockCarnivalPlay() {
    const awardGameXp = useAwardPortalGameXp(
        'block-carnival',
        'Caribbean Block Carnival',
        PORTAL_GAME_CONTENT_IDS['block-carnival'],
    );

    return (
        <PublicPlayFrame title="Block Carnival" eyebrow="Free play">
            <BlockCarnival onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </PublicPlayFrame>
    );
}
