
import '../lib/load-env';
import { generateTriviaGame, generateWordMatchGame, generateMemoryGame, generateStoryAdventure } from '@/lib/game-generator';
import { createClient } from '@supabase/supabase-js';

// Load env (for Supabase & Gemini) stored in load-env

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function postGameDirect(game: any) {
    console.log(`🎮 Posting game direct: "${game.title}"...`);
    const { data, error } = await supabase.from('games').insert({
        title: game.title,
        description: game.description,
        game_type: game.type,
        estimated_time: `${game.estimatedMinutes} min`,
        game_config: {
            data: game.data,
            difficulty: game.difficulty,
            island_theme: game.island,
            xp_reward: game.xpReward
        },
        is_active: true
    }).select().single();

    if (error) console.error('❌ Failed:', error.message);
    else console.log('✅ Posted:', data.id);
}

async function generateGamesBatch() {
    console.log('🎮 Starting Game Batch Generation...');

    // 1. Trivia Games (2)
    console.log('Generating Trivia Games...');
    const trivia1 = await generateTriviaGame('Jamaica', 'easy', 5);
    await postGameDirect(trivia1);

    const trivia2 = await generateTriviaGame('Trinidad & Tobago', 'medium', 5);
    await postGameDirect(trivia2);

    // 2. Word Match (1)
    console.log('Generating Word Match...');
    const wordMatch = await generateWordMatchGame(6);
    await postGameDirect(wordMatch);

    // 3. Memory Game (1)
    console.log('Generating Memory Game...');
    const memory = await generateMemoryGame('mixed', 6);
    await postGameDirect(memory);

    // 4. Story Adventure (1)
    console.log('Generating Story Adventure...');
    const adventure = await generateStoryAdventure('Little Legend', 'Barbados');
    await postGameDirect(adventure);

    console.log('✨ All games generated and posted!');
}

generateGamesBatch().catch(console.error);
