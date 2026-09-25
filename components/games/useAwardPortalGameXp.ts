'use client';

import { useCallback } from 'react';
import { awardPortalGameXp } from '@/app/actions/game-xp';
import { useUser } from '@/components/UserContext';
import { recordGameResult } from '@/lib/game-progress';

/**
 * Record a finished portal game and write the earned XP onto the active child.
 * Local progress is saved even when nobody is signed in. XP is only written
 * for a positive award tied to this completion.
 */
export function useAwardPortalGameXp(gameId: string, title?: string) {
    const { activeChild, applyChildXp, refreshChildren } = useUser();

    return useCallback(async (xp: number, score = xp) => {
        recordGameResult(gameId, score);
        if (!activeChild?.id || !(xp > 0)) return;

        const result = await awardPortalGameXp({
            childId: activeChild.id,
            gameId,
            xp,
            score,
            title,
        });

        if (!result.success) {
            console.error('Failed to award game XP:', result.error);
            return;
        }

        if (result.xpAwarded > 0) {
            applyChildXp(activeChild.id, result.totalXp);
            await refreshChildren();
        }
    }, [activeChild?.id, applyChildXp, gameId, refreshChildren, title]);
}
