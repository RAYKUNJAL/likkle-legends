import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildFreeTrialSuccessBody, stripAuthSecrets } from '../lib/auth/free-trial-response';
import { buildBuddyFollowUps } from '../lib/buddy-followups';
import { getPortalCapabilities } from '../lib/portal-capabilities';
import { HIDDEN_GAME_IDS, isWorkingGameId, WORKING_ARCADE_GAMES, WORKING_PORTAL_GAMES } from '../lib/working-games';

function testFreeTrialRouteSourceHasNoMagicLink() {
  const source = readFileSync(resolve(process.cwd(), 'app/api/auth/free-trial/route.ts'), 'utf8');
  assert.equal(source.includes('magicLink'), false);
  assert.equal(source.includes('generateLink'), false);
}

function testFreeTrialNeverLeaksMagicLink() {
  const leaked = stripAuthSecrets({
    success: true,
    magicLink: 'https://example.com/auth/v1/verify?token=SECRET',
    action_link: 'https://example.com/secret',
    hashed_token: 'abc',
    userId: 'user-1',
  });
  assert.equal('magicLink' in leaked, false);
  assert.equal('action_link' in leaked, false);
  assert.equal('hashed_token' in leaked, false);
  assert.equal(leaked.userId, 'user-1');

  const body = buildFreeTrialSuccessBody({ userId: 'user-2' });
  assert.equal((body as { magicLink?: string }).magicLink, undefined);
  assert.equal(body.success, true);
  assert.match(body.next, /^\/login/);
  assert.equal(body.accountType, 'free');
}

function testBuddyFollowUpsStayInCharacter() {
  const roti = buildBuddyFollowUps('roti', 'Let us add 2 mangoes plus 3 mangoes.');
  assert.ok(roti.length >= 2 && roti.length <= 3);
  assert.ok(roti.some((item) => /math/i.test(item.text)));

  const tanty = buildBuddyFollowUps('tanty_spice', 'Anansi the spider told a folklore tale.');
  assert.ok(tanty.some((item) => /story/i.test(item.text)));
}

function testVoiceFailsClosedWithoutKeys() {
  const empty = getPortalCapabilities({});
  assert.equal(empty.buddy.available, false);
  assert.equal(empty.voice.available, false);
  assert.equal(empty.voice.mode, 'turn-based');
  assert.equal(empty.storyStudio.available, false);

  const ready = getPortalCapabilities({
    GEMINI_API_KEY: 'test',
    ELEVENLABS_API_KEY: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test',
  });
  assert.equal(ready.buddy.available, true);
  assert.equal(ready.voice.available, true);
  assert.equal(ready.storyStudio.available, true);
}

function testArcadeRoutesRedirectToHtml() {
  const config = readFileSync(resolve(process.cwd(), 'next.config.mjs'), 'utf8');
  for (const id of ['island-hop', 'tantys-kitchen', 'math-market', 'spelling-blaze']) {
    assert.ok(config.includes(`'/games/${id}'`));
    assert.ok(config.includes(`'/games/${id}.html'`));
  }
}

function testIslandWeekAndPreservedSurfaces() {
  const portal = readFileSync(resolve(process.cwd(), 'app/portal/PortalClient.tsx'), 'utf8');
  assert.ok(portal.includes('aria-label="Island Week"'));
  assert.ok(portal.includes('href="/portal/stories"'));
  assert.ok(portal.includes('href="/portal/music"'));
  assert.ok(portal.includes('href="/portal/games"'));
  assert.ok(portal.includes('href="/island-helpers"'));
  assert.ok(portal.includes('ll_age_verified_at'));

  const landing = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
  assert.ok(landing.includes('@/components/landing-v5/LandingPage'));
  assert.equal(landing.includes('Digital Passport'), false);

  const helpers = readFileSync(resolve(process.cwd(), 'lib/island-helpers/types.ts'), 'utf8');
  for (const id of ['tanty_spice', 'steelpan_sam', 'mango_moko', 'roti', 'dilly_doubles']) {
    assert.ok(helpers.includes(id), id);
  }
  assert.equal(existsSync(resolve(process.cwd(), 'app/island-helpers/page.tsx')), true);
  assert.equal(existsSync(resolve(process.cwd(), 'app/island-helpers/journey-stories/page.tsx')), true);

  const voice = readFileSync(resolve(process.cwd(), 'app/api/voice/generate/route.ts'), 'utf8');
  assert.ok(voice.includes('hasTtsKeys'));
  assert.ok(voice.includes('VOICE_NOT_CONFIGURED'));
  assert.ok(voice.includes("voice === 'steelpan_sam'"));
  assert.ok(voice.includes("voice === 'dilly_doubles'"));
}

function testWorkingGamesOnly() {
  assert.equal(HIDDEN_GAME_IDS.has('story-library'), true);
  assert.equal(HIDDEN_GAME_IDS.has('cultural-quiz'), true);
  assert.equal(isWorkingGameId('island-memory'), true);
  assert.equal(isWorkingGameId('doubles-dash'), true);
  assert.equal(isWorkingGameId('story-library'), false);
  assert.ok(WORKING_PORTAL_GAMES.length >= 10);
  assert.equal(WORKING_ARCADE_GAMES.length, 5);
}

testFreeTrialRouteSourceHasNoMagicLink();
testFreeTrialNeverLeaksMagicLink();
testBuddyFollowUpsStayInCharacter();
testVoiceFailsClosedWithoutKeys();
testArcadeRoutesRedirectToHtml();
testWorkingGamesOnly();
testIslandWeekAndPreservedSurfaces();

console.log('webapp honesty checks passed');
