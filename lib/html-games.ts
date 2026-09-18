export const HTML_GAME_ROUTES: Record<string, string> = {
    'island-hop': '/games/island-hop.html',
    'tantys-kitchen': '/games/tantys-kitchen.html',
    'math-market': '/games/math-market.html',
    'spelling-blaze': '/games/spelling-blaze.html',
};

export function getHtmlGameHref(gameId: string): string | null {
    return HTML_GAME_ROUTES[gameId] || null;
}
