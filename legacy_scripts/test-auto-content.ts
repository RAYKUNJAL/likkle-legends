#!/usr/bin/env tsx
import '../lib/load-env';
import { moduleManagerAgent } from '../lib/ai-content-generator/agents/ModuleManager';
import { databasePoster } from '../lib/ai-content-generator/database-poster';

/**
 * TEST AUTO CONTENT SCRIPT
 * Simulates the /admin/auto-content flow end-to-end.
 */

async function main() {
    const objective = "The Peaceful Sea Turtles of Barbados";
    const ageGroup = "big";

    console.log('--- STARTING END-TO-END TEST ---');
    console.log(`Objective: ${objective}`);
    console.log(`Age Group: ${ageGroup}`);
    console.log('--------------------------------');

    try {
        // 1. Generate Module
        console.log('\n🤖 Step 1: Generating Cohesive Module...');
        const module = await moduleManagerAgent.buildCompleteModule(objective, ageGroup);
        console.log(`✅ Module Generated: "${module.title}"`);
        console.log(`🌴 Island: ${module.island}`);
        console.log(`📚 Story Title: ${module.content.story.title}`);

        // 2. Publish to Live (using EnhancedDatabasePoster)
        console.log('\n🚀 Step 2: Publishing to Live Database...');

        const results = {
            story: await databasePoster.postStory(module.content.story),
            song: await databasePoster.postSong((module.content as any).song),
            printable: await databasePoster.postPrintable((module.content as any).printable),
            video: await databasePoster.postVideo((module.content as any).videoScript, {
                island: module.island,
                ageGroup: module.ageGroup
            })
        };

        console.log('\n📊 Publishing Results:');
        console.log(`  Story: ${results.story.success ? '✅ ' + results.story.id : '❌ ' + results.story.error}`);
        console.log(`  Song: ${results.song.success ? '✅ ' + results.song.id : '❌ ' + results.song.error}`);
        console.log(`  Printable: ${results.printable.success ? '✅ ' + results.printable.id : '❌ ' + results.printable.error}`);
        console.log(`  Video: ${results.video.success ? '✅ ' + results.video.id : '❌ ' + results.video.error}`);

        const hasError = Object.values(results).some(r => !r.success);

        if (!hasError) {
            console.log('\n🎉 SUCCESS! Full module published with AI images.');
        } else {
            console.warn('\n⚠️  Partial success. Some assets failed to publish.');
        }

    } catch (err: any) {
        console.error('\n❌ Test failed during execution:');
        console.error(err.message || err);
        process.exit(1);
    }
}

main().catch(console.error);
