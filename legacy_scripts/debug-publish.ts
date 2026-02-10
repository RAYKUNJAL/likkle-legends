#!/usr/bin/env tsx
import '../lib/load-env';
import { moduleManagerAgent } from '../lib/ai-content-generator/agents/ModuleManager';
import { databasePoster } from '../lib/ai-content-generator/database-poster';

async function main() {
    const objective = "The Peaceful Sea Turtles of Barbados";
    const ageGroup = "big";

    try {
        const module = await moduleManagerAgent.buildCompleteModule(objective, ageGroup);

        console.log('--- PUBLISHING ---');

        const storyRes = await databasePoster.postStory(module.content.story);
        console.log('Story:', storyRes);

        const songRes = await databasePoster.postSong(module.content.song);
        console.log('Song:', songRes);

        const printRes = await databasePoster.postPrintable(module.content.printable);
        console.log('Printable:', printRes);

        const videoRes = await databasePoster.postVideo(module.content.videoScript, {
            island: module.island,
            ageGroup: module.ageGroup
        });
        console.log('Video:', videoRes);

    } catch (err) {
        console.error('CRITICAL FAILURE:', err);
    }
}

main();
