/**
 * Initialize story database with seed data if empty
 * This runs on server startup to ensure stories_library is populated
 */

import { createClient } from '@supabase/supabase-js';

const STORIES_SEED_DATA = [
    { title: 'Anansi and the Pot of Gold', slug: 'anansi-pot-gold-jm-emergent', tradition: 'anansi', reading_level: 'emergent', island_code: 'JM', age_track: 'mini', summary: 'Anansi finds a magical golden pot in the forest.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi saw gold.', illustration_prompt: 'Spider Anansi in Jamaica forest with golden pot' }, { page_number: 2, narrative_text: 'He was happy.', illustration_prompt: 'Anansi dancing with joy' }] }, is_active: true },
    { title: 'Anansi and the Golden Yam', slug: 'anansi-golden-yam-jm-early', tradition: 'anansi', reading_level: 'early', island_code: 'JM', age_track: 'big', summary: 'The clever spider tricks his neighbors to claim a magical yam that feeds the whole village.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi was clever. He saw a golden yam.', illustration_prompt: 'Anansi with magical glowing yam in Jamaica' }] }, is_active: true },
    { title: 'Anansi and the Wisdom Box', slug: 'anansi-wisdom-jm-transitional', tradition: 'anansi', reading_level: 'transitional', island_code: 'JM', age_track: 'big', summary: 'Anansi tries to hide all the world\'s wisdom in a box, but learns that wisdom cannot be contained or owned.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi gathered all the wisdom he could find across Jamaica...', illustration_prompt: 'Anansi collecting glowing orbs of wisdom in Caribbean landscape' }] }, is_active: true },
    { title: 'Anansi in Trinidad', slug: 'anansi-trinidad-tt-emergent', tradition: 'anansi', reading_level: 'emergent', island_code: 'TT', age_track: 'mini', summary: 'Anansi plays tricks in Trinidad.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi went to Trinidad.', illustration_prompt: 'Spider in Trinidad tropical setting' }] }, is_active: true },
    { title: 'Papa Bois Protects the Forest', slug: 'papa-forest-tt-emergent', tradition: 'papa_bois', reading_level: 'emergent', island_code: 'TT', age_track: 'mini', summary: 'Papa Bois guards the forest animals in Trinidad and Tobago.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Papa Bois is wise. He loves animals.', illustration_prompt: 'Guardian figure with animals in Trinidad forest' }] }, is_active: true },
    { title: 'Papa Bois and the Lost Deer', slug: 'papa-deer-tt-early', tradition: 'papa_bois', reading_level: 'early', island_code: 'TT', age_track: 'big', summary: 'A young deer gets lost in the forest, and Papa Bois guides it safely home while teaching about respect for nature.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'A little deer was lost. Papa Bois saw her cry.', illustration_prompt: 'Guardian helping young deer in Trinidad forest' }] }, is_active: true },
    { title: 'Papa Bois and the Hunters', slug: 'papa-hunters-gy-transitional', tradition: 'papa_bois', reading_level: 'transitional', island_code: 'GY', age_track: 'big', summary: 'Papa Bois confronts hunters who threaten the forest ecosystem and teaches them the consequences of greed.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'Hunters came to Guyana with axes and nets...', illustration_prompt: 'Spirit guardian protecting rainforest creatures' }] }, is_active: true },
    { title: 'River Mumma and the Golden Comb', slug: 'river-mumma-jm-emergent', tradition: 'river_mumma', reading_level: 'emergent', island_code: 'JM', age_track: 'mini', summary: 'River Mumma combs her golden hair in the river.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'River Mumma lived in water. She had gold hair.', illustration_prompt: 'Mermaid-like figure with golden comb in Jamaica river' }] }, is_active: true },
    { title: 'River Mumma Saves a Child', slug: 'river-mumma-save-gy-early', tradition: 'river_mumma', reading_level: 'early', island_code: 'GY', age_track: 'big', summary: 'A child almost drowns in the Guyanese river, but River Mumma rescues them and teaches them water safety.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'A child fell in the river. River Mumma heard the splash.', illustration_prompt: 'Water spirit saving child in Guyana' }] }, is_active: true },
    { title: 'River Mumma\'s Gift', slug: 'river-gift-lc-transitional', tradition: 'river_mumma', reading_level: 'transitional', island_code: 'LC', age_track: 'big', summary: 'River Mumma offers a magical gift to someone who shows her kindness and respect for her waters.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'By the river in Saint Lucia lived River Mumma...', illustration_prompt: 'Golden spirit of water with glowing gift' }] }, is_active: true },
    { title: 'Chickcharney Mystery', slug: 'chickcharney-bahamas-emergent', tradition: 'chickcharney', reading_level: 'emergent', island_code: 'BS', age_track: 'mini', summary: 'The mysterious bird-spirits of Andros Island play in the moonlight.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Clickcharney birds play. They fly at night.', illustration_prompt: 'Magical bird spirits flying over Bahamas island' }] }, is_active: true },
    { title: 'The Chickcharney\'s Song', slug: 'chickcharney-song-bs-early', tradition: 'chickcharney', reading_level: 'early', island_code: 'BS', age_track: 'big', summary: 'A lonely child hears the enchanting song of a Chickcharney and discovers the magic of friendship and belonging.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'A child heard a strange song. It was beautiful and sad.', illustration_prompt: 'Child listening to mystical bird singing in Bahamas' }] }, is_active: true },
    { title: 'Chickcharney Guardians', slug: 'chickcharney-guard-ag-transitional', tradition: 'chickcharney', reading_level: 'transitional', island_code: 'AG', age_track: 'big', summary: 'The Chickcharney spirits are guardians of island forests, protecting them from those who would do harm.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'In Antigua, the Chickcharney birds guard the ancient forests...', illustration_prompt: 'Spirit birds protecting mystical forest landscape' }] }, is_active: true },
    { title: 'Island Adventure - Cuba', slug: 'island-adventure-cu-emergent', tradition: 'anansi', reading_level: 'emergent', island_code: 'CU', age_track: 'mini', summary: 'Anansi\'s adventure in Cuba.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi came to Cuba.', illustration_prompt: 'Spider in Cuban landscape' }] }, is_active: true },
    { title: 'Caribbean Explorer - Puerto Rico', slug: 'caribbean-explorer-pr-early', tradition: 'papa_bois', reading_level: 'early', island_code: 'PR', age_track: 'big', summary: 'A young explorer discovers the magical creatures and spirits of Puerto Rico\'s rainforest.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'The rainforest was green and mysterious.', illustration_prompt: 'Explorer in Puerto Rico El Yunque rainforest' }] }, is_active: true },
    { title: 'Island Sisters - Dominican Republic', slug: 'sisters-do-transitional', tradition: 'river_mumma', reading_level: 'transitional', island_code: 'DO', age_track: 'big', summary: 'Two island sisters learn the power of unity and cultural pride through a legendary water spirit.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'In Dominican Republic lived two sisters...', illustration_prompt: 'Sisters in Caribbean setting with water spirits' }] }, is_active: true },
    { title: 'Haiti\'s Hidden Treasure', slug: 'haiti-treasure-ht-emergent', tradition: 'anansi', reading_level: 'emergent', island_code: 'HT', age_track: 'mini', summary: 'Anansi searches for Haiti\'s hidden treasure of culture and history.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi came to Haiti.', illustration_prompt: 'Spider in Haitian landscape with historical elements' }] }, is_active: true },
    { title: 'Suriname\'s Forest Spirit', slug: 'suriname-spirit-sr-early', tradition: 'papa_bois', reading_level: 'early', island_code: 'SR', age_track: 'big', summary: 'Papa Bois teaches a young girl about the importance of protecting Suriname\'s vast rainforests.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'The forest in Suriname was huge and beautiful.', illustration_prompt: 'Spirit guide with child in Suriname rainforest' }] }, is_active: true },
    { title: 'Grenada\'s Spice Island Magic', slug: 'grenada-spice-gd-transitional', tradition: 'chickcharney', reading_level: 'transitional', island_code: 'GD', age_track: 'big', summary: 'The magical spice gardens of Grenada come alive through the songs of ancient bird spirits.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'In Grenada, the spice gardens held ancient magic...', illustration_prompt: 'Mystical bird spirits over spice gardens' }] }, is_active: true },
    { title: 'Barbados Legend', slug: 'barbados-legend-bb-emergent', tradition: 'river_mumma', reading_level: 'emergent', island_code: 'BB', age_track: 'mini', summary: 'River Mumma visits Barbados beaches.', xp_reward: 100, estimated_reading_time_minutes: 5, content_json: { pages: [{ page_number: 1, narrative_text: 'River Mumma swam to Barbados.', illustration_prompt: 'Water spirit at Barbados beach' }] }, is_active: true },
    { title: 'St. Lucia Mountains', slug: 'lucia-mountains-lc-early', tradition: 'chickcharney', reading_level: 'early', island_code: 'LC', age_track: 'big', summary: 'A child climbs the magical Pitons of Saint Lucia and meets enchanted bird spirits.', xp_reward: 150, estimated_reading_time_minutes: 7, content_json: { pages: [{ page_number: 1, narrative_text: 'The Pitons were tall and beautiful.', illustration_prompt: 'Child climbing Saint Lucia Pitons with mystical birds' }] }, is_active: true },
    { title: 'Caribbean Unity', slug: 'caribbean-unity-all-transitional', tradition: 'anansi', reading_level: 'transitional', island_code: 'JM', age_track: 'big', summary: 'Anansi brings together characters from across the Caribbean to solve a problem that affects all islands.', xp_reward: 200, estimated_reading_time_minutes: 10, content_json: { pages: [{ page_number: 1, narrative_text: 'Anansi had an idea that would help all Caribbean islands...', illustration_prompt: 'Characters from across Caribbean in harmony' }] }, is_active: true },
];

export async function initializeStories() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.warn('[InitStories] Missing Supabase credentials, skipping initialization');
            return;
        }

        const supabase = createClient(url, key);

        // Check if stories exist
        const { count } = await supabase
            .from('stories_library')
            .select('*', { count: 'exact', head: true });

        console.log(`[InitStories] Current story count: ${count}`);

        if (count === 0 || count === null) {
            console.log('[InitStories] No stories found, inserting seed data...');

            const { error, data } = await supabase
                .from('stories_library')
                .insert(STORIES_SEED_DATA);

            if (error) {
                console.error('[InitStories] Insert error:', error.message);
                return;
            }

            console.log(`[InitStories] ✅ Successfully inserted ${STORIES_SEED_DATA.length} stories`);
        } else {
            console.log('[InitStories] Stories already exist, skipping seed');
        }
    } catch (err) {
        console.error('[InitStories] Failed to initialize stories:', err);
    }
}
