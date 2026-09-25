'use client';

import ReefRescue from '@/components/games/ReefRescue';
import PublicPlayFrame from '@/components/games/PublicPlayFrame';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

export default function ReefRescuePlay() {
    const awardGameXp = useAwardPortalGameXp(
        'reef-rescue',
        'Reef Rescue',
        PORTAL_GAME_CONTENT_IDS['reef-rescue'],
    );

    return (
        <PublicPlayFrame title="Reef Rescue" eyebrow="Free play">
            <ReefRescue onComplete={(score) => { void awardGameXp(Math.min(score, 200), score); }} />
        </PublicPlayFrame>
    );
}
