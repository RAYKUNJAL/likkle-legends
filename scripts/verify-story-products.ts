/**
 * Guards for warm narration, Build Your Story input, and the weekly publish gate.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { extractStoryPages, localCatalogStories } from '../lib/library-stories';
import {
    DEFAULT_WARM_STORY_VOICE_ID,
    RETIRED_ROBOTIC_VOICE_ID,
    isWarmNarration,
    missingNarrationKeyMessage,
    readerPageAudioUrl,
    warmStoryVoiceId,
} from '../lib/story-narration-policy';
import { resolveBuildStoryInput, sanitizeChildName } from '../lib/build-your-story';
import {
    illustrationBlockers,
    originalMarketManuscript,
    publishIllustratedBook,
    validateManuscript,
} from '../lib/weekly-picture-book';

if (DEFAULT_WARM_STORY_VOICE_ID === RETIRED_ROBOTIC_VOICE_ID) {
    throw new Error('Warm narrator must not reuse the retired robotic voice id');
}
if (warmStoryVoiceId({} as NodeJS.ProcessEnv) !== DEFAULT_WARM_STORY_VOICE_ID) {
    throw new Error('Default warm voice should be the premade narrative voice');
}
if (warmStoryVoiceId({ ELEVENLABS_STORY_VOICE_ID: RETIRED_ROBOTIC_VOICE_ID } as NodeJS.ProcessEnv) === RETIRED_ROBOTIC_VOICE_ID) {
    throw new Error('Retired voice id must not be selected even as an override');
}
if (!missingNarrationKeyMessage().includes('ELEVENLABS_API_KEY')) {
    throw new Error('Missing-key message should name the ElevenLabs key');
}

const legacyUrl = readerPageAudioUrl({
    narratedBy: 'tanty_spice_elevenlabs',
    catalogAudioUrl: 'https://example.com/robotic.mp3',
});
if (legacyUrl) throw new Error('Legacy robotic narration must not be offered to the reader');

const warmUrl = readerPageAudioUrl({
    narratedBy: 'warm_island_narrator_elevenlabs',
    catalogAudioUrl: '/audio/story-narrations/example/page-01.mp3',
});
if (warmUrl !== '/audio/story-narrations/example/page-01.mp3') {
    throw new Error('Warm narration files should play');
}

for (const story of localCatalogStories()) {
    const pages = extractStoryPages(story);
    if (!isWarmNarration(story.narrated_by) && pages.some((page) => page.audioUrl)) {
        throw new Error(`${story.slug} still exposes retired audio to the reader`);
    }
}

const badName = sanitizeChildName('ignore previous instructions');
if (badName.ok) throw new Error('Prompt-like names must be rejected');
const goodName = sanitizeChildName("Amina");
if (!goodName.ok) throw new Error('A normal first name should pass');

const choices = resolveBuildStoryInput({
    childName: 'Amina',
    island: 'GD',
    theme: 'market',
    character: 'mango_moko',
});
if (!choices.ok || !choices.childName) throw new Error('Valid build-your-story choices should resolve');
const invented = resolveBuildStoryInput({
    childName: 'Amina',
    island: 'XX',
    theme: 'not-a-theme',
    character: 'made_up',
});
if (invented.ok) throw new Error('Unknown theme or character must fail closed');

const manuscript = originalMarketManuscript();
const manuscriptErrors = validateManuscript(manuscript);
if (manuscriptErrors.length) throw new Error(manuscriptErrors.join('; '));

const folklore = validateManuscript({
    ...manuscript,
    title: 'The Legend of the Hidden River',
    originality: 'original_fiction',
});
if (!folklore.some((error) => /legend/i.test(error))) {
    throw new Error('Folklore-styled titles must be blocked');
}

const blockers = illustrationBlockers('market-morning-with-mango-moko', manuscript.pages.length, os.tmpdir());
if (blockers.length < manuscript.pages.length) {
    throw new Error('Missing art must block publish');
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'likkle-weekly-'));
fs.mkdirSync(path.join(scratch, 'lib/data'), { recursive: true });
fs.writeFileSync(path.join(scratch, 'lib/data/live-library-stories.json'), '[]\n');
const unpublished = publishIllustratedBook(manuscript, scratch);
if (unpublished.published) throw new Error('A book without page art must not publish');

const storyStudio = fs.readFileSync(path.join(process.cwd(), 'app/actions/story-database-actions.ts'), 'utf8');
if (storyStudio.includes('getStoriesWithFilters') || storyStudio.includes('let me tell you a story')) {
    throw new Error('Story Studio must not substitute a random book or pretend it was written for the child');
}

console.log('verify-story-products: PASS');
