'use client';

import BlockCarnival from '@/components/games/BlockCarnival';
import GameLayoutWrapper from '@/components/games/GameLayoutWrapper';
import IslandQuizQuest from '@/components/games/IslandQuizQuest';
import ReefRescue from '@/components/games/ReefRescue';
import { useAwardPortalGameXp } from '@/components/games/useAwardPortalGameXp';
import { useUser } from '@/components/UserContext';
import {
    carnivalIslandLimit,
    LEGENDS_LEAD_GAMES,
    quizRoundLimit,
    reefLevelLimit,
    type LegendsLeadGameId,
} from '@/lib/games/public-play';
import { PORTAL_GAME_CONTENT_IDS } from '@/lib/portal-game-content';

const COPY: Record<LegendsLeadGameId, { learningFocus: string; badge: { emoji: string; name: string; color: string }; gradient: string }> = {
    'reef-rescue': {
        learningFocus: 'Ocean care, careful tapping, and Caribbean reef life',
        badge: { emoji: '🐢', name: 'Tali the Turtle', color: '#2EC4B6' },
        gradient: 'from-cyan-400 via-teal-500 to-emerald-600',
    },
    'block-carnival': {
        learningFocus: 'Spatial planning, patterns, and Caribbean island treasures',
        badge: { emoji: '🎉', name: 'Carnival Crew', color: '#FF6B35' },
        gradient: 'from-rose-400 via-orange-500 to-amber-400',
    },
    'island-quiz': {
        learningFocus: 'Caribbean geography, food, wildlife, and flags',
        badge: { emoji: '🏝️', name: 'Island Guide', color: '#7C6CFF' },
        gradient: 'from-indigo-400 via-violet-500 to-fuchsia-500',
    },
};

export default function PublicLeadGame({ gameId }: { gameId: LegendsLeadGameId }) {
    const game = LEGENDS_LEAD_GAMES.find((item) => item.id === gameId) ?? LEGENDS_LEAD_GAMES[0];
    const copy = COPY[game.id];
    const { user } = useUser();
    const member = Boolean(user);
    const awardGameXp = useAwardPortalGameXp(game.id, game.title, PORTAL_GAME_CONTENT_IDS[game.id]);
    const onComplete = member
        ? (score: number) => { void awardGameXp(Math.min(score, 200), score); }
        : undefined;

    return (
        <GameLayoutWrapper
            gameId={game.id}
            title={game.title}
            description={game.description}
            learningFocus={copy.learningFocus}
            characterBadge={copy.badge}
            xpReward={200}
            gradient={copy.gradient}
            backHref="/games"
            showXp={member}
        >
            {game.id === 'reef-rescue' ? (
                <ReefRescue key={member ? 'member' : 'guest'} levelLimit={reefLevelLimit(member)} onComplete={onComplete} />
            ) : game.id === 'block-carnival' ? (
                <BlockCarnival key={member ? 'member' : 'guest'} islandLimit={carnivalIslandLimit(member)} onComplete={onComplete} />
            ) : (
                <IslandQuizQuest key={member ? 'member' : 'guest'} roundLimit={quizRoundLimit(member)} onComplete={onComplete} />
            )}
        </GameLayoutWrapper>
    );
}
