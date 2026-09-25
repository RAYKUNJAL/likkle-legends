'use client';

import IslandQuizQuest from '@/components/games/IslandQuizQuest';
import PublicPlayFrame from '@/components/games/PublicPlayFrame';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function IslandQuizPlay() {
    const awardGameXp = useAwardPortalGameXp(
        'island-quiz',
        'Island Quiz Quest',
        PORTAL_GAME_CONTENT_IDS['island-quiz'],
    );

    return (
        <PublicPlayFrame title="Island Quiz" eyebrow="Free play">
            <IslandQuizQuest onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </PublicPlayFrame>
    );
}
