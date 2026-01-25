#!/usr/bin/env tsx

/**
 * Test Script for AI Content Generator
 * Run a quick test to verify everything is working
 */

// Load environment variables first
import '../lib/load-env';

import { storyGenerator } from '../lib/ai-content-generator/generators/story-generator';
import { songGenerator } from '../lib/ai-content-generator/generators/song-generator';
import { databasePoster } from '../lib/ai-content-generator/database-poster';

async function testStoryGeneration() {
    console.log('\n🧪 Testing Story Generation...\n');

    try {
        const story = await storyGenerator.generateStory({
            ageTrack: 'mini',
            island: 'Jamaica',
            theme: 'family values',
        });

        console.log('✅ Story generated successfully!');
        console.log(`   Title: "${story.title}"`);
        console.log(`   Island: ${story.metadata.islandTheme}`);
        console.log(`   Age Track: ${story.metadata.ageTrack}`);
        console.log(`   Pages: ${story.pages.length}`);
        console.log(`   Patois Words: ${story.metadata.patoisWords.length}`);
        console.log(`\n   Summary: ${story.summary}`);

        return story;
    } catch (error) {
        console.error('❌ Story generation failed:', error);
        throw error;
    }
}

async function testSongGeneration() {
    console.log('\n🧪 Testing Song Generation...\n');

    try {
        const song = await songGenerator.generateSong({
            category: 'nursery',
            island: 'Trinidad and Tobago',
            ageTrack: 'all',
        });

        console.log('✅ Song generated successfully!');
        console.log(`   Title: "${song.title}"`);
        console.log(`   Category: ${song.category}`);
        console.log(`   Island: ${song.islandOrigin}`);
        console.log(`   Educational Value: ${song.educationalValue}`);
        console.log(`\n   Lyrics Preview:\n${song.lyrics.substring(0, 200)}...`);

        return song;
    } catch (error) {
        console.error('❌ Song generation failed:', error);
        throw error;
    }
}

async function testDatabaseConnection() {
    console.log('\n🧪 Testing Database Connection...\n');

    try {
        const stats = await databasePoster.getContentStats();
        console.log('✅ Database connection successful!');
        console.log(`   Stories: ${stats.stories}`);
        console.log(`   Songs: ${stats.songs}`);
        console.log(`   Videos: ${stats.videos}`);
        console.log(`   Games: ${stats.games}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

async function main() {
    console.log('🌴 Likkle Legends AI Content Generator - Test Suite 🌴');
    console.log('======================================================\n');

    try {
        // Test 1: Database Connection
        await testDatabaseConnection();

        // Test 2: Story Generation
        const story = await testStoryGeneration();

        // Test 3: Song Generation
        const song = await testSongGeneration();

        // Test 4: Dry Run Database Post (Optional)
        console.log('\n🧪 Testing Database Posting (Dry Run)...\n');
        console.log('   Story ready to post:', story.title);
        console.log('   Song ready to post:', song.title);
        console.log('   ⚠️  Not posting to database in test mode');

        console.log('\n✅ ALL TESTS PASSED!\n');
        console.log('Your AI Content Generator is ready to use!');
        console.log('\nNext steps:');
        console.log('  1. npm run generate:stories -- --dry-run');
        console.log('  2. npm run generate:stories -- --count 1');
        console.log('  3. npm run generate:batch\n');

    } catch (error) {
        console.error('\n❌ TESTS FAILED\n');
        console.error('Please check:');
        console.error('  1. GEMINI_API_KEY is set in .env.local');
        console.error('  2. Supabase credentials are correct');
        console.error('  3. Internet connection is active\n');
        process.exit(1);
    }
}

main();
