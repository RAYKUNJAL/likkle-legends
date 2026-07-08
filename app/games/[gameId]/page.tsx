import GameWrapper from '@/components/games/GameWrapper';
import { GAME_CONFIGS } from '@/lib/game-config';

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  try {
    const gameId = params.gameId;
    
    // Get game config
    const gameConfig = GAME_CONFIGS[gameId as keyof typeof GAME_CONFIGS];

    if (!gameConfig) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-8">The game you're looking for doesn't exist.</p>
          <a
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg transition"
          >
            Return to Home
          </a>
        </div>
      );
    }

    return (
      <div className="h-screen bg-white flex flex-col">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-4 flex items-center gap-4 shadow-lg">
          <a
            href="/"
            className="hover:bg-white/20 p-2 rounded-full transition text-white flex-shrink-0"
            aria-label="Go back"
          >
            ← BACK
          </a>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{gameConfig.title}</h1>
            <p className="text-white/90 text-sm truncate">{gameConfig.description}</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <GameWrapper
            gameId={gameId}
            gameIframeSrc={`/games/${gameId}/index.html`}
            userTier="free"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Game page error:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Game</h1>
        <p className="text-gray-600 mb-8">Something went wrong. Please try again.</p>
        <a
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-semibold hover:shadow-lg transition"
        >
          Return to Home
        </a>
      </div>
    );
  }
}
