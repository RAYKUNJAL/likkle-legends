import fs from 'fs';
import path from 'path';
import { ART_STYLE_SUFFIX, CHARACTER_HINTS } from '../lib/agents/tanty-illustrator';
import { buildJourneyImagePrompt } from '../lib/island-helpers/journey-stories/image-prompt';
import {
  claimNextQueuedJob,
  isUsableHostedImage,
  planIllustrationWork,
  type JourneyJobRow,
} from '../lib/island-helpers/journey-stories/jobs';
import { journeyLibraryKey, mergePublishedImages } from '../lib/island-helpers/journey-stories/library-key';
import { journeyPageRealtimeFilter } from '../lib/island-helpers/journey-stories/realtime';
import {
  hasQStashConfig,
  publishJourneyJob,
  signQStashBody,
  verifyQStashRequest,
} from '../lib/island-helpers/journey-stories/qstash';
import { singleCallbackPageIndex } from '../lib/island-helpers/journey-stories/jobs';
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

const qstashEnv = {
  QSTASH_TOKEN: 'test-token',
  QSTASH_CURRENT_SIGNING_KEY: 'current-signing-key',
  QSTASH_NEXT_SIGNING_KEY: 'next-signing-key',
  NEXT_PUBLIC_APP_URL: 'https://www.likklelegends.com',
};
if (hasQStashConfig({})) throw new Error('missing QStash env must fail closed');
if (hasQStashConfig({ QSTASH_TOKEN: 'only-token' })) throw new Error('partial QStash env must fail closed');
const callbackUrl = 'https://www.likklelegends.com/api/island-helpers/journey-stories/jobs/worker';
const signedBody = JSON.stringify({ storyId: 's', jobId: 'j', pageIndex: 0 });
const signature = signQStashBody({ body: signedBody, url: callbackUrl, key: qstashEnv.QSTASH_CURRENT_SIGNING_KEY });
if (!verifyQStashRequest({ signature, body: signedBody, url: callbackUrl, env: qstashEnv }).ok) {
  throw new Error('current signing key must verify');
}
const nextSignature = signQStashBody({ body: signedBody, url: callbackUrl, key: qstashEnv.QSTASH_NEXT_SIGNING_KEY });
if (!verifyQStashRequest({ signature: nextSignature, body: signedBody, url: callbackUrl, env: qstashEnv }).ok) {
  throw new Error('next signing key must verify');
}
if (verifyQStashRequest({ signature: null, body: signedBody, url: callbackUrl, env: qstashEnv }).ok) {
  throw new Error('unsigned callback must be rejected');
}
const mismatched = verifyQStashRequest({
  signature,
  body: '{"tampered":true}',
  url: callbackUrl,
  env: qstashEnv,
});
if (mismatched.ok || mismatched.reason !== 'body_mismatch') throw new Error('body mismatch must fail closed');
if (verifyQStashRequest({ signature, body: signedBody, url: callbackUrl, env: {} }).ok) {
  throw new Error('callback without QStash env must fail closed');
}

const filter = journeyPageRealtimeFilter('11111111-1111-4111-8111-111111111111');
if (filter.table !== 'journey_story_pages') throw new Error('realtime listens to page rows');
if (!filter.filter.includes('story_id=eq.')) throw new Error('realtime filters one story');

async function main() {
let qstashFetches = 0;
const skipped = await publishJourneyJob(
  { storyId: 's', jobId: 'j', pageIndex: 0 },
  {
    env: {},
    fetchImpl: async () => {
      qstashFetches += 1;
      return new Response('nope', { status: 500 });
    },
  },
);
if (skipped.published || skipped.reason !== 'qstash_env_missing') throw new Error('absent QStash must not publish');
if (qstashFetches !== 0) throw new Error('absent QStash must not call the network');
const published = await publishJourneyJob(
  { storyId: 's', jobId: 'job-1', pageIndex: 2 },
  {
    env: qstashEnv,
    fetchImpl: async (url, init) => {
      const target = String(url);
      if (!target.startsWith('https://qstash.upstash.io/v2/publish/https://www.likklelegends.com/')) {
        throw new Error('publish URL must target the signed worker');
      }
      const headers = new Headers(init?.headers);
      if (headers.get('Upstash-Retries') !== '3') throw new Error('QStash retries required');
      const payload = JSON.parse(String(init?.body));
      if (payload.pageIndex !== 2) throw new Error('publish one pageIndex');
      return new Response('{}', { status: 200 });
    },
  },
);
if (!published.published) throw new Error('configured QStash should publish one page');

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
    if (patch.imageUrl) throw new Error('fail closed must not store an image URL');
    if (patch.imageStatus !== 'failed') throw new Error('missing key marks the page failed');
  },
});
if (blocked.ok) throw new Error('missing key fails closed');
if (blockedCalls !== 0) throw new Error('missing key must not call Imagen');

const root = process.cwd();
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260925_journey_story_jobs.sql'), 'utf8');
if (!/for update skip locked/i.test(sql)) throw new Error('claim must skip locked rows');
if (!/journey_story_jobs/.test(sql)) throw new Error('jobs table missing');
if (!/claim_journey_story_job_by_id/.test(sql)) throw new Error('QStash retries need a job id claim');
if (!/library_key/.test(sql)) throw new Error('published picture cache needs library_key');
if (/qstash_/i.test(sql) || /social stories/i.test(sql)) throw new Error('migration uses a forbidden name');

const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf8');
if (!/journey-worker:/.test(compose)) throw new Error('compose needs journey-worker');
if (!/traefik\.enable=false/.test(compose)) throw new Error('web Traefik label must stay off');
if (/upstash|image:\s*redis|^\s+qstash:/im.test(compose)) {
  throw new Error('compose must not add QStash or Redis');
}
if (/ports:/.test(compose.slice(compose.indexOf('journey-worker:')))) {
  throw new Error('worker must not publish a port');
}

const worker = fs.readFileSync(path.join(root, 'scripts/journey-worker.ts'), 'utf8');
if (/Promise\.all/.test(worker)) throw new Error('worker must not burst page images');
if (/qstash_|@upstash\/qstash/i.test(worker)) throw new Error('on-host worker must not call QStash');
const callbackRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/jobs/worker/route.ts'),
  'utf8',
);
if (/Promise\.all/.test(callbackRoute)) throw new Error('QStash callback must not burst page images');
if (!/verifyQStashRequest/.test(callbackRoute)) throw new Error('callback must verify the QStash signature');
if (!/singleCallbackPageIndex/.test(callbackRoute)) throw new Error('callback must draw one page');
const jobsRoute = fs.readFileSync(
  path.join(root, 'app/api/island-helpers/journey-stories/jobs/route.ts'),
  'utf8',
);
if (!/publishJourneyJob/.test(jobsRoute)) throw new Error('adult API must be able to wake QStash');
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
for (const file of ['.env.example', '.env.production.example']) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const name of ['QSTASH_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY']) {
    if (!new RegExp(`^${name}=$`, 'm').test(text)) {
      throw new Error(`${file} must document empty ${name}`);
    }
  }
  if (/QSTASH_TOKEN=.+/.test(text) || /QSTASH_CURRENT_SIGNING_KEY=.+/.test(text)) {
    throw new Error(`${file} must not commit QStash secret values`);
  }
}

console.log('verify-journey-stories-jobs: PASS');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
