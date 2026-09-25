import fs from 'fs';
import path from 'path';
import { ART_STYLE_SUFFIX, CHARACTER_HINTS } from '../lib/agents/tanty-illustrator';
import { buildJourneyImagePrompt } from '../lib/island-helpers/journey-stories/image-prompt';
import {
  claimNextQueuedJob,
  isUsableHostedImage,
  planIllustrationWork,
  shouldSyncIllustrate,
  type JourneyJobRow,
} from '../lib/island-helpers/journey-stories/jobs';
import { journeyArtOnHold } from '../lib/island-helpers/journey-stories/art-hold';
import { hasJourneyTextModelKey } from '../lib/island-helpers/journey-stories/generate';
import { journeyLibraryKey, mergePublishedImages } from '../lib/island-helpers/journey-stories/library-key';
import { placeholderForRole } from '../lib/island-helpers/journey-stories/placeholders';
import { journeyPageRealtimeFilter } from '../lib/island-helpers/journey-stories/realtime';
import { singleCallbackPageIndex } from '../lib/island-helpers/journey-stories/jobs';
import { nextStoryStep, planStoryStart } from '../lib/island-helpers/journey-stories/advance-story';
import { processJourneyJob } from '../lib/island-helpers/journey-stories/worker-run';

const pages = [
  { imageUrl: null },
  { imageUrl: 'https://cdn.example.test/page-2.png' },
  { imageUrl: '/images/island-helpers/journey-intro.svg' },
  { imageUrl: null },
  { imageUrl: null },
];

if (isUsableHostedImage(pages[1].imageUrl) !== true) throw new Error('hosted image should be reusable');
if (isUsableHostedImage(pages[2].imageUrl) !== false) throw new Error('local placeholder is not shared-library art');
if (isUsableHostedImage('not a url') !== false) throw new Error('reject stub strings');

const noKey = planIllustrationWork({ hasImagenKey: false, pages });
if (noKey.queued) throw new Error('missing Imagen key must not enqueue');
if (noKey.job) throw new Error('missing Imagen key must not create a job');
if (!noKey.calmCopy) throw new Error('missing key needs calm copy');
if (noKey.pages[1].imageStatus !== 'reused') throw new Error('usable image is reused without a key');

const withKey = planIllustrationWork({ hasImagenKey: true, pages });
if (!withKey.queued || !withKey.job) throw new Error('key should queue the story');
if (withKey.job.pageIndex !== null) throw new Error('full story job leaves page_index null');
if (withKey.pages[1].imageStatus !== 'reused') throw new Error('shared image skipped');

const onePage = planIllustrationWork({ hasImagenKey: true, pages, pageIndex: 0 });
if (onePage.job?.pageIndex !== 0) throw new Error('single page job keeps its index');

const jobs: JourneyJobRow[] = [
  {
    id: 'older',
    storyId: 's1',
    pageIndex: null,
    status: 'queued',
    attempts: 0,
    lastError: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    claimedAt: null,
    finishedAt: null,
  },
  {
    id: 'newer',
    storyId: 's2',
    pageIndex: 1,
    status: 'queued',
    attempts: 0,
    lastError: null,
    createdAt: '2026-01-02T00:00:00.000Z',
    claimedAt: null,
    finishedAt: null,
  },
];

const first = claimNextQueuedJob(jobs, new Set(), '2026-01-03T00:00:00.000Z');
if (first.claimed?.id !== 'older') throw new Error('claim oldest queued job');
if (first.claimed.status !== 'running' || first.claimed.attempts !== 1) throw new Error('claim marks running');
const second = claimNextQueuedJob(first.jobs, new Set(['older']), '2026-01-03T00:00:01.000Z');
if (second.claimed?.id !== 'newer') throw new Error('skip locked job');

const prompt = buildJourneyImagePrompt({
  pageRole: 'intro',
  pageText: 'Tanty Spice sits in a bright quiet room.',
  castCharacterIds: ['tanty_spice', 'roti', 'dilly_doubles', 'steelpan_sam', 'mango_moko'],
});
if (!prompt.includes(CHARACTER_HINTS.tanty_spice)) throw new Error('reuse Tanty trait anchor');
if (!prompt.includes('warm brown skin')) throw new Error('Tanty prompt needs the image-bible traits');
if (!prompt.includes(CHARACTER_HINTS.dilly_doubles)) throw new Error('Dilly traits required');
if (!prompt.includes(CHARACTER_HINTS.steelpan_sam)) throw new Error('Steelpan Sam traits required');
if (!prompt.includes(CHARACTER_HINTS.mango_moko)) throw new Error('Mango Moko traits required');
if (!prompt.includes('friendly Caribbean island learning robot')) throw new Error('R.O.T.I. robot identity required');
if (!prompt.includes('composition focused on the action that matches the page text')) {
  throw new Error('prompt must focus composition on the page action');
}
if (!prompt.includes('busy highly-detailed scenes are a fail for comprehension')) {
  throw new Error('busy scenes must be rejected');
}
if (/highly detailed characters|Pixar/i.test(prompt)) throw new Error('do not ask for busy detail');
if (!prompt.includes(ART_STYLE_SUFFIX)) throw new Error('reuse existing art style');
if (!/do not invent a new character design/i.test(prompt)) throw new Error('hold new character looks');
if (/Social Stories/i.test(prompt)) throw new Error('prompt must not use the trademark');
const rotiOnly = buildJourneyImagePrompt({
  pageRole: 'title',
  pageText: 'A quiet visit.',
  castCharacterIds: ['roti'],
});
if (rotiOnly.includes(CHARACTER_HINTS.tanty_spice)) throw new Error('do not attach another character look');
if (!rotiOnly.includes('friendly Caribbean island learning robot')) throw new Error('R.O.T.I. must not be name-only');
if (/metal|antenna|robot body/i.test(rotiOnly)) throw new Error('do not invent a R.O.T.I. look');

const onlyPage = singleCallbackPageIndex(null, [
  { pageIndex: 0, imageUrl: 'https://cdn.example.test/a.png', imageStatus: 'ready' },
  { pageIndex: 1, imageUrl: null, imageStatus: 'pending' },
]);
if (onlyPage !== 1) throw new Error('a callback draws the next unfinished page only');
if (shouldSyncIllustrate({ ok: true, queued: true })) {
  throw new Error('a queued worker job must not also sync-illustrate');
}
if (!shouldSyncIllustrate({ ok: true, queued: false, fallback: 'illustrate' })) {
  throw new Error('a missed queue falls back to one-page illustrate');
}
if (shouldSyncIllustrate({ ok: true, queued: false, status: 'placeholders', fallback: 'illustrate' })) {
  throw new Error('art hold placeholders must not call an image model');
}
if (shouldSyncIllustrate({ ok: true, queued: false, status: 'reused', fallback: 'illustrate' })) {
  throw new Error('reused art must not illustrate again');
}
if (!shouldSyncIllustrate({ ok: false })) throw new Error('a failed enqueue still illustrates one page');
if (planStoryStart({ canQueue: false, reusable: false }) !== 'sync') {
  throw new Error('art hold or a missing database keeps synchronous generation');
}
if (planStoryStart({ canQueue: true, reusable: false }) !== 'queue') {
  throw new Error('the VPS worker is the story queue');
}
if (planStoryStart({ canQueue: true, reusable: true }) !== 'reuse') {
  throw new Error('a published match is reused before generation');
}
if (!journeyArtOnHold({})) throw new Error('missing image key must hold art');
if (!journeyArtOnHold({ GEMINI_API_KEY: 'present', JOURNEY_ART_HOLD: '1' })) {
  throw new Error('JOURNEY_ART_HOLD must force placeholders');
}
if (journeyArtOnHold({ GEMINI_API_KEY: 'present' })) throw new Error('a Gemini key lifts the hold');
if (hasJourneyTextModelKey({})) throw new Error('missing text key must fail closed');
if (!hasJourneyTextModelKey({ OPENROUTER_API_KEY: 'present' })) throw new Error('text key is detected');
const held = planIllustrationWork({
  hasImagenKey: false,
  artHold: true,
  pages: [{ imageUrl: null, role: 'title' }, { imageUrl: 'https://cdn.example.test/kept.png', role: 'intro' }],
  pageIndex: 0,
});
if (held.queued || held.job) throw new Error('art hold must not enqueue Imagen');
if (held.pages[0].imageUrl !== placeholderForRole('title')) throw new Error('art hold uses a local placeholder');
if (held.pages[0].imageStatus !== 'ready') throw new Error('placeholder page is ready to read');
if (/^https?:/i.test(held.pages[0].imageUrl || '')) throw new Error('placeholder must not be a remote URL');
if (held.pages[1].imageStatus !== 'reused') throw new Error('art hold leaves an unrequested hosted picture alone');
if (nextStoryStep([{ text: '' }, { text: 'Hi.' }]) !== 'narrative') {
  throw new Error('empty pages write the story before pictures');
}
const pictured = Array.from({ length: 5 }, (_, index) => ({
  text: `Page ${index}.`,
  imageUrl: index === 0 ? null : 'https://cdn.example.test/page.png',
  imageStatus: index === 0 ? 'pending' : 'ready',
}));
if (nextStoryStep(pictured) !== 0) throw new Error('the next callback draws one pending page');
if (
  nextStoryStep(
    Array.from({ length: 5 }, () => ({
      text: 'Ready.',
      imageUrl: 'https://cdn.example.test/page.png',
      imageStatus: 'ready',
    })),
  ) !== 'ready'
) {
  throw new Error('finished pages mark the story ready');
}
if (singleCallbackPageIndex(0, []) !== 0) throw new Error('explicit pageIndex stays one page');

const libraryA = journeyLibraryKey({
  scenarioId: 'dentist',
  languageMode: 'literal',
  castCharacterIds: ['roti', 'tanty_spice'],
});
const libraryB = journeyLibraryKey({
  scenarioId: 'dentist',
  languageMode: 'literal',
  castCharacterIds: ['tanty_spice', 'roti'],
});
if (libraryA !== libraryB) throw new Error('cast fingerprint ignores order');
if (
  libraryA ===
  journeyLibraryKey({
    scenarioId: 'dentist',
    languageMode: 'standard',
    castCharacterIds: ['roti', 'tanty_spice'],
  })
) {
  throw new Error('language mode is part of the cache key');
}
if (/social_stories|Social Stories/i.test(libraryA)) throw new Error('cache key must stay Journey Stories');

const merged = mergePublishedImages(
  [{ imageUrl: null }, { imageUrl: null }],
  [{ pageIndex: 0, imageUrl: 'https://cdn.example.test/shared.png' }],
);
const reusedPlan = planIllustrationWork({ hasImagenKey: true, pages: merged, pageIndex: 0 });
if (reusedPlan.queued) throw new Error('published hosted art must not enqueue Imagen');
if (reusedPlan.pages[0].imageStatus !== 'reused') throw new Error('shared picture is reused');

const filter = journeyPageRealtimeFilter('11111111-1111-4111-8111-111111111111');
if (filter.table !== 'journey_story_pages') throw new Error('realtime listens to page rows');
if (!filter.filter.includes('story_id=eq.')) throw new Error('realtime filters one story');

async function main() {
const calls: number[] = [];
let inFlight = 0;
const processed = await processJourneyJob({
  job: { id: 'job', storyId: 'story', pageIndex: null },
  pages: [
    { pageIndex: 0, role: 'title', text: 'Hello.', imageUrl: null, imageStatus: 'pending' },
    {
      pageIndex: 1,
      role: 'intro',
      text: 'Already drawn.',
      imageUrl: 'https://cdn.example.test/kept.png',
      imageStatus: 'ready',
    },
  ],
  castCharacterIds: ['tanty_spice'],
  hasImagenKey: true,
  illustrate: async () => {
    inFlight += 1;
    if (inFlight > 1) throw new Error('image calls must not overlap');
    calls.push(inFlight);
    await new Promise((resolve) => setTimeout(resolve, 5));
    inFlight -= 1;
    return Buffer.from('png');
  },
  saveImage: async () => 'https://cdn.example.test/new.png',
  markPage: async () => undefined,
});
if (!processed.ok) throw new Error(processed.error || 'job should pass');
if (calls.length !== 1) throw new Error('reused page must not call Imagen');

let blockedCalls = 0;
const blocked = await processJourneyJob({
  job: { id: 'job2', storyId: 'story', pageIndex: 0 },
  pages: [{ pageIndex: 0, role: 'title', text: 'Hello.', imageUrl: null, imageStatus: 'pending' }],
  castCharacterIds: ['tanty_spice'],
  hasImagenKey: false,
  illustrate: async () => {
    blockedCalls += 1;
    return Buffer.from('nope');
  },
  saveImage: async () => 'https://cdn.example.test/nope.png',
  markPage: async (_index, patch) => {
    if (patch.imageUrl !== placeholderForRole('title')) throw new Error('missing key stores the local placeholder');
    if (/^https?:/i.test(patch.imageUrl || '')) throw new Error('missing key must not store a remote URL');
    if (patch.imageStatus !== 'ready') throw new Error('placeholder page stays readable');
  },
});
if (!blocked.ok) throw new Error('missing key still ships the words with a placeholder');
if (blockedCalls !== 0) throw new Error('missing key must not call Imagen');

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260925_journey_story_jobs.sql'), 'utf8');
if (!/for update skip locked/i.test(sql)) throw new Error('claim must skip locked rows');
if (!/journey_story_jobs/.test(sql)) throw new Error('jobs table missing');
if (!/claim_journey_story_job_by_id/.test(sql)) throw new Error('a stuck job can be claimed by id');
if (!/library_key/.test(sql)) throw new Error('published picture cache needs library_key');
if (!/request jsonb/.test(sql)) throw new Error('queued stories need the request payload');
if (!/generating_text/.test(sql) || !/'illustrating'/.test(sql) || !/'ready'/.test(sql)) {
  throw new Error('job phase must cover pending through ready');
}
if (/qstash|social stories/i.test(sql)) throw new Error('migration uses a forbidden name');

const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf8');
if (!/journey-worker:/.test(compose)) throw new Error('compose needs journey-worker');
if (!/traefik\.enable=false/.test(compose)) throw new Error('web Traefik label must stay off');
if (/upstash|qstash|image:\s*redis/i.test(compose)) {
  throw new Error('compose must not add an external queue or Redis');
}
if (/ports:/.test(compose.slice(compose.indexOf('journey-worker:')))) {
  throw new Error('worker must not publish a port');
}

const worker = fs.readFileSync(path.join(root, 'scripts/journey-worker.ts'), 'utf8');
if (/Promise\.all/.test(worker)) throw new Error('worker must not burst page images');
if (/qstash|upstash/i.test(worker)) throw new Error('worker must not call an external queue');
if (!/claim_journey_story_job/.test(worker)) throw new Error('worker claims the Postgres job');
const callbackRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/jobs/worker/route.ts'),
  'utf8',
);
if (/Promise\.all|generateJourney|publishJourney|qstash|upstash/i.test(callbackRoute)) {
  throw new Error('public worker URL must not generate or queue');
}
if (!/status: 410/.test(callbackRoute)) throw new Error('public worker URL stays closed');
const jobsRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/jobs/route.ts'),
  'utf8',
);
if (/qstash|upstash|publishJourneyJob/i.test(jobsRoute)) throw new Error('adult API must not publish an external queue');
if (!/artHold/.test(jobsRoute)) throw new Error('art hold must skip the picture job');
if (!/insertJob: !artHold/.test(jobsRoute)) throw new Error('art hold must not enqueue Imagen');
if (!/fallback: 'illustrate'/.test(jobsRoute)) throw new Error('a missed database still illustrates one page');
if (!/x-island-helpers-adult/.test(jobsRoute)) throw new Error('adult gate stays on enqueue');
const illustrateRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/illustrate/route.ts'),
  'utf8',
);
if (!/Send one pageIndex/.test(illustrateRoute)) throw new Error('illustrate route must require one page');
const wizard = fs.readFileSync(
  path.join(root, 'components/island-helpers/journey-stories/JourneyStoryWizard.tsx'),
  'utf8',
);
if (/Promise\.all/.test(wizard)) throw new Error('wizard must not burst image requests');
if (!/pageIndex/.test(wizard)) throw new Error('wizard must send pageIndex');
if (!/journey-stories\/queue/.test(wizard)) throw new Error('wizard must request the queued story first');
const queueRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/queue/route.ts'),
  'utf8',
);
if (!/x-island-helpers-adult/.test(queueRoute)) throw new Error('queue route keeps the adult gate');
if (/qstash|upstash|publishJourneyJob/i.test(queueRoute)) throw new Error('queue route must not publish an external queue');
if (!/fallback: 'sync'/.test(queueRoute)) throw new Error('art hold falls back to sync generation');
if (!/journeyArtOnHold/.test(queueRoute)) throw new Error('queue route must check the art hold');
if (!/worker: 'vps'/.test(queueRoute)) throw new Error('queued stories name the VPS worker');
if (/Promise\.all/.test(queueRoute)) throw new Error('queue route must return before image generation');
const advance = fs.readFileSync(path.join(root, 'lib/island-helpers/journey-stories/advance-story.ts'), 'utf8');
if (/Promise\.all/.test(advance)) throw new Error('story worker must not burst page images');
if (!/shouldSyncIllustrate/.test(wizard)) throw new Error('wizard must fall back to one-page illustrate');
if (!/Picture \$\{pageIndex \+ 1\} of/.test(wizard)) throw new Error('wizard must show per-page progress');
for (const file of ['.env.example', '.env.production.example', 'deploy/README.md', 'docker-compose.yml']) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (/qstash|upstash/i.test(text)) throw new Error(`${file} must not mention an external queue`);
}
const productionEnv = fs.readFileSync(path.join(root, '.env.production.example'), 'utf8');
if (!/^GEMINI_API_KEY=$/m.test(productionEnv)) throw new Error('production example keeps an empty image key');
if (!/^OPENROUTER_API_KEY=$/m.test(productionEnv)) throw new Error('production example documents the text key');
if (/^[A-Z0-9_]*API_KEY=.+$/m.test(productionEnv)) {
  throw new Error('production example must not commit secret values');
}

console.log('verify-journey-stories-jobs: PASS');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
