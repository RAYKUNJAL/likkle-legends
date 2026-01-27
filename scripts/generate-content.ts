#!/usr/bin/env tsx

/**
 * Content Generator CLI Tool
 * Generate Caribbean-themed educational content for Likkle Legends
 * 
 * Usage:
 *   npm run generate:content -- --type story --count 5
 *   npm run generate:content -- --type song --count 10
 *   npm run generate:content -- --batch
 */

// Load environment variables first
import '../lib/load-env';

import { storyGenerator } from '../lib/ai-content-generator/generators/story-generator';
import { songGenerator } from '../lib/ai-content-generator/generators/song-generator';
import { databasePoster } from '../lib/ai-content-generator/database-poster';

interface CLIOptions {
    type?: 'story' | 'song' | 'all';
    count?: number;
    batch?: boolean;
    island?: string;
    ageTrack?: 'mini' | 'big';
    autoPost?: boolean;
    dryRun?: boolean;
}

async function parseArgs(): Promise<CLIOptions> {
    const args = process.argv.slice(2);
    const options: CLIOptions = {
        type: 'story',
        count: 1,
        autoPost: true,
        dryRun: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--type':
            case '-t':
                if (next && ['story', 'song', 'all'].includes(next)) {
                    options.type = next as 'story' | 'song' | 'all';
                    i++;
                }
                break;
            case '--count':
            case '-c':
                if (next && !isNaN(Number(next))) {
                    options.count = Number(next);
                    i++;
                }
                break;
            case '--island':
            case '-i':
                if (next) {
                    options.island = next;
                    i++;
                }
                break;
            case '--age-track':
            case '-a':
                if (next && ['mini', 'big'].includes(next)) {
                    options.ageTrack = next as 'mini' | 'big';
                    i++;
                }
                break;
            case '--batch':
            case '-b':
                options.batch = true;
                break;
            case '--no-post':
                options.autoPost = false;
                break;
            case '--dry-run':
                options.dryRun = true;
                options.autoPost = false;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp() {
    console.log(`
📚 Likkle Legends Content Generator

Generate Caribbean-themed educational content automatically

USAGE:
  npm run generate:content -- [OPTIONS]

OPTIONS:
  --type, -t <type>      Content type: story, song, or all (default: story)
  --count, -c <number>   Number of items to generate (default: 1)
  --island, -i <name>    Specific Caribbean island
  --age-track, -a <age>  Age group: mini (3-5) or big (6-8)
  --batch, -b            Generate daily batch (1 story + 2 songs)
  --no-post              Generate but don't post to database
  --dry-run              Test run without posting
  --help, -h             Show this help message

EXAMPLES:
  # Generate 5 stories
  npm run generate:content -- --type story --count 5

  # Generate 10 songs for Jamaica
  npm run generate:content -- --type song --count 10 --island Jamaica

  # Generate stories for younger kids
  npm run generate:content -- --type story --count 3 --age-track mini

  # Daily batch generation
  npm run generate:content -- --batch

  # Test without posting
  npm run generate:content -- --type story --dry-run
  `);
}

async function generateStories(options: CLIOptions) {
    console.log(`\n📖 Generating ${options.count} ${options.count === 1 ? 'story' : 'stories'}...`);

    const stories = await storyGenerator.generateBatch(options.count || 1, {
        island: options.island,
        ageTrack: options.ageTrack,
    });

    console.log(`\n✅ Generated ${stories.length} ${stories.length === 1 ? 'story' : 'stories'}:`);
    stories.forEach((story, i) => {
        console.log(`  ${i + 1}. "${story.title}" (${story.metadata.islandTheme}, ${story.metadata.ageTrack})`);
    });

    if (options.autoPost && !options.dryRun) {
        console.log('\n📤 Posting to database...');
        const result = await databasePoster.postStoriesBatch(stories);
        console.log(`✅ Successfully posted: ${result.successful}`);
        if (result.failed > 0) {
            console.log(`❌ Failed: ${result.failed}`);
        }
        console.log(`📝 Story IDs: ${result.ids.join(', ')}`);
    } else if (options.dryRun) {
        console.log('\n🔍 DRY RUN - Not posting to database');
        console.log('Sample story content:');
        console.log(JSON.stringify(stories[0], null, 2));
    }
}

async function generateSongs(options: CLIOptions) {
    console.log(`\n🎵 Generating ${options.count} ${options.count === 1 ? 'song' : 'songs'}...`);

    const songs = await songGenerator.generateBatch(options.count || 1, {
        island: options.island,
        ageTrack: options.ageTrack,
    });

    console.log(`\n✅ Generated ${songs.length} ${songs.length === 1 ? 'song' : 'songs'}:`);
    songs.forEach((song, i) => {
        console.log(`  ${i + 1}. "${song.title}" (${song.category}, ${song.islandOrigin})`);
    });

    if (options.autoPost && !options.dryRun) {
        console.log('\n📤 Posting to database...');
        const result = await databasePoster.postSongsBatch(songs);
        console.log(`✅ Successfully posted: ${result.successful}`);
        if (result.failed > 0) {
            console.log(`❌ Failed: ${result.failed}`);
        }
        console.log(`📝 Song IDs: ${result.ids.join(', ')}`);
    } else if (options.dryRun) {
        console.log('\n🔍 DRY RUN - Not posting to database');
        console.log('Sample song content:');
        console.log(JSON.stringify(songs[0], null, 2));
    }
}

async function generateBatch() {
    console.log('\n🚀 Running daily content batch generation...\n');

    // Generate 1 story
    await generateStories({ type: 'story', count: 1, autoPost: true });

    // Generate 2 songs
    await generateSongs({ type: 'song', count: 2, autoPost: true });

    // Show stats
    const stats = await databasePoster.getContentStats();
    console.log('\n📊 Content Library Stats:');
    console.log(`  Stories: ${stats.stories}`);
    console.log(`  Songs: ${stats.songs}`);
    console.log(`  Videos: ${stats.videos}`);
    console.log(`  Games: ${stats.games}`);

    console.log('\n✅ Batch generation complete!');
}

async function showStats() {
    const stats = await databasePoster.getContentStats();
    console.log('\n📊 Current Content Library:');
    console.log(`  📖 Stories: ${stats.stories}`);
    console.log(`  🎵 Songs: ${stats.songs}`);
    console.log(`  🎥 Videos: ${stats.videos}`);
    console.log(`  🎮 Games: ${stats.games}`);
    console.log('');
}

async function main() {
    console.log('🌴 Likkle Legends Content Generator 🌴\n');

    try {
        const options = await parseArgs();

        // Show current stats first
        await showStats();

        if (options.batch) {
            await generateBatch();
        } else if (options.type === 'story') {
            await generateStories(options);
        } else if (options.type === 'song') {
            await generateSongs(options);
        } else if (options.type === 'all') {
            await generateStories({ ...options, count: Math.ceil((options.count || 1) / 2) });
            await generateSongs({ ...options, count: Math.ceil((options.count || 1) / 2) });
        }

        console.log('\n✨ All done!\n');
        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Fatal Error:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}
