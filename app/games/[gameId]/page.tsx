import { redirect, notFound } from 'next/navigation';
import { getHtmlGameHref } from '@/lib/html-games';
import { GAME_CONFIGS } from '@/lib/game-config';

interface GamePageProps {
    params: {
        gameId: string;
    };
}

export default function GamePage({ params }: GamePageProps) {
    const htmlHref = getHtmlGameHref(params.gameId);
    if (htmlHref) {
        redirect(htmlHref);
    }

    if (params.gameId === 'doubles-dash') {
        redirect('/games/doubles-dash');
    }

    if (!GAME_CONFIGS[params.gameId as keyof typeof GAME_CONFIGS]) {
        notFound();
    }

    notFound();
}
