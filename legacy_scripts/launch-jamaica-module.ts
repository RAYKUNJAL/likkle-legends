
import '../lib/load-env';
import { moduleManagerAgent } from '../lib/ai-content-generator/agents/ModuleManager';
import { databasePoster } from '../lib/ai-content-generator/database-poster';

async function main() {
    // Objective for the first real module
    const objective = "The Brave Doctor Bird and the Blue Mountains of Jamaica";
    const ageGroup = "mini";

    console.log('--- 🌴 LAUNCHING FIRST REAL MODULE GENERATION ---');
    console.log(`Objective: ${objective}`);
    console.log(`Target: Big Legend Kids (${ageGroup})`);
    console.log('------------------------------------------------');

    try {
        // 1. Generate Module
        console.log('\n🤖 Step 1: AI Agent is crafting the module (this takes ~30s)...');
        const module = await moduleManagerAgent.buildCompleteModule(objective, ageGroup);
        console.log(`✅ SUCCESS! AI crafted: "${module.title}"`);
        console.log(`🌴 Island: ${module.island}`);

        // 2. Publish to Live
        console.log('\n🚀 Step 2: Publishing to Live Database...');

        const results = {
            story: await databasePoster.postStory(module.content.story),
            song: await databasePoster.postSong(module.content.song),
            printable: await databasePoster.postPrintable(module.content.printable),
            video: await databasePoster.postVideo(module.content.videoScript, {
                island: module.island,
                ageGroup: module.ageGroup
            })
        };

        console.log('\n📊 Launch Results:');
        console.log(`  Story: ${results.story.success ? '✅ Published' : '❌ ' + results.story.error}`);
        console.log(`  Song: ${results.song.success ? '✅ Published' : '❌ ' + results.song.error}`);
        console.log(`  Printable: ${results.printable.success ? '✅ Published' : '❌ ' + results.printable.error}`);
        console.log(`  Video: ${results.video.success ? '✅ Published' : '❌ ' + results.video.error}`);

        const hasError = Object.values(results).some(r => !r.success);

        if (!hasError) {
            console.log('\n🎉 JAMAICA MODULE IS LIVE!');
            console.log('You can now check the Kid Portal to see the first legendary story!');
        } else {
            console.warn('\n⚠️  Module published with some errors. Visit Admin to review.');
        }

    } catch (err: any) {
        console.error('\n❌ Generation failed:');
        console.error(err.message || err);
        process.exit(1);
    }
}

main().catch(console.error);
