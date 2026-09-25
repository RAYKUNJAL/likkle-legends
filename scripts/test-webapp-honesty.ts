import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildFreeTrialSuccessBody, stripAuthSecrets } from '../lib/auth/free-trial-response';
import { buildBuddyFollowUps } from '../lib/buddy-followups';
import { getPortalCapabilities } from '../lib/portal-capabilities';
import { activityContentFields, clampPortalGameXp, isUuid } from '../lib/game-xp';
import { HIDDEN_GAME_IDS, isWorkingGameId, WORKING_ARCADE_GAMES, WORKING_PORTAL_GAMES } from '../lib/working-games';
import { PORTAL_GAME_CONTENT_IDS } from '../lib/portal-game-content';

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

function testArcadeGamesHaveNoKidPaywall() {
  const banned = ['showGate(', '__unlocked', 'Legend Intro Pass', 'id="gateOverlay"'];
  for (const file of [
    'public/games/island-hop.html',
    'public/games/tantys-kitchen.html',
    'public/games/math-market.html',
    'public/games/spelling-blaze.html',
  ]) {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const needle of banned) {
      assert.equal(source.includes(needle), false, `${file} still contains ${needle}`);
    }
  }
}

function testPortalGamesHaveNoKidPayCta() {
  assert.equal(existsSync(resolve(process.cwd(), 'components/games/GamePaywall.tsx')), false);
  const wrapper = readFileSync(resolve(process.cwd(), 'components/games/GameWrapper.tsx'), 'utf8');
  assert.equal(wrapper.includes('GamePaywall'), false);
  assert.equal(wrapper.includes('showPaywall'), false);
  const portalGames = readFileSync(resolve(process.cwd(), 'app/portal/games/page.tsx'), 'utf8');
  assert.equal(portalGames.includes('Upgrade to Play'), false);
  assert.equal(portalGames.includes('/#pricing'), false);
  const pricing = readFileSync(resolve(process.cwd(), 'app/pricing/page.tsx'), 'utf8');
  assert.ok(pricing.includes('Upgrade anytime'));
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

function testPortalGameCompleteAwardsXp() {
  assert.equal(isUuid('island-memory'), false);
  assert.equal(isWorkingGameId('island-memory'), true);

  const slug = activityContentFields('island-memory', { title: 'Island Memory Match' });
  assert.equal(slug.content_id, null);
  assert.equal(slug.metadata.content_key, 'island-memory');
  assert.equal(slug.metadata.title, 'Island Memory Match');

  const storyId = '5947e9b3-1fc4-4e6a-9761-3f640efa18b7';
  assert.equal(isUuid(storyId), true);
  const uuidContent = activityContentFields(storyId, { title: 'Story' });
  assert.equal(uuidContent.content_id, storyId);
  assert.equal('content_key' in uuidContent.metadata, false);

  // Easy Island Memory calls onComplete(1000). The page caps that at 200,
  // which is the designed GAME_COMPLETED reward. A zero score awards nothing.
  assert.equal(clampPortalGameXp(1000), 200);
  assert.equal(clampPortalGameXp(200), 200);
  assert.equal(clampPortalGameXp(0), 0);
  assert.equal(clampPortalGameXp(-10), 0);

  const memoryPage = readFileSync(resolve(process.cwd(), 'app/portal/games/island-memory/page.tsx'), 'utf8');
  assert.ok(memoryPage.includes('useAwardPortalGameXp'));
  assert.ok(memoryPage.includes('Math.min(score, 200)'));
  assert.equal(memoryPage.includes('logActivity'), false);

  const awardHook = readFileSync(resolve(process.cwd(), 'components/games/useAwardPortalGameXp.ts'), 'utf8');
  assert.ok(awardHook.includes('awardPortalGameXp'));
  assert.ok(awardHook.includes('applyChildXp'));
  assert.ok(awardHook.includes('refreshChildren'));
  assert.ok(awardHook.includes('recordGameResult'));

  const action = readFileSync(resolve(process.cwd(), 'app/actions/game-xp.ts'), 'utf8');
  assert.ok(action.includes('total_xp: newTotal'));
  assert.ok(action.includes('activityContentFields'));

  const logger = readFileSync(resolve(process.cwd(), 'lib/services/gamification.ts'), 'utf8');
  assert.ok(logger.includes('activityContentFields'));
  assert.ok(logger.includes('Activity log insert failed'));

  const portal = readFileSync(resolve(process.cwd(), 'app/portal/PortalClient.tsx'), 'utf8');
  assert.ok(portal.includes('refreshUser()'));
  assert.ok(portal.includes('refreshChildren(user.id)'));
}

function testWorkingGamesOnly() {
  assert.equal(HIDDEN_GAME_IDS.has('story-library'), true);
  assert.equal(HIDDEN_GAME_IDS.has('cultural-quiz'), true);
  assert.equal(isWorkingGameId('island-memory'), true);
  assert.equal(isWorkingGameId('doubles-dash'), false);
  assert.equal(HIDDEN_GAME_IDS.has('doubles-dash'), true);
  assert.equal(isWorkingGameId('story-library'), false);
  assert.ok(WORKING_PORTAL_GAMES.length >= 10);
  assert.equal(WORKING_ARCADE_GAMES.length, 4);
  for (const id of ['reef-rescue', 'block-carnival', 'island-quiz'] as const) {
    assert.equal(isWorkingGameId(id), true, id);
    assert.equal(isUuid(PORTAL_GAME_CONTENT_IDS[id]), true, id);
    const page = readFileSync(resolve(process.cwd(), `app/portal/games/${id}/page.tsx`), 'utf8');
    assert.ok(page.includes('useAwardPortalGameXp'));
    assert.ok(page.includes(`PORTAL_GAME_CONTENT_IDS['${id}']`));
    assert.equal(page.toLowerCase().includes('upgrade'), false);
    assert.equal(page.includes('/#pricing'), false);
  }
  const reef = readFileSync(resolve(process.cwd(), 'components/games/ReefRescue.tsx'), 'utf8');
  assert.equal(reef.includes('requireAccess'), false);
  assert.equal(reef.includes('GUEST_LEVELS'), false);
  assert.ok(reef.includes('pointer-events-none'));
  assert.ok(reef.includes('entityUnderPoint'));
  assert.ok(reef.includes('data-reef-arena'));
  assert.ok(reef.includes('translate3d'));
  const catalog = readFileSync(resolve(process.cwd(), 'app/portal/games/page.tsx'), 'utf8');
  assert.ok(catalog.includes('Clear ocean litter, protect sea life and restore colorful Caribbean reefs.'));
  assert.ok(catalog.includes("title: 'Reef Rescue'"));
  assert.ok(catalog.includes('Arcade · Conservation'));
  assert.equal(catalog.includes('Doubles Dash'), false);
  assert.equal(catalog.includes('/games/doubles-dash'), false);

  const publicGames = readFileSync(resolve(process.cwd(), 'app/games/page.tsx'), 'utf8');
  assert.equal(publicGames.includes('doubles-dash'), false);
  assert.equal(publicGames.includes('Doubles Dash'), false);

  const directRoute = readFileSync(resolve(process.cwd(), 'app/games/doubles-dash/page.tsx'), 'utf8');
  assert.equal(directRoute.includes('initDoublesDashGame'), false);
  assert.ok(directRoute.includes('not available'));
}

testFreeTrialRouteSourceHasNoMagicLink();
testFreeTrialNeverLeaksMagicLink();
testBuddyFollowUpsStayInCharacter();
testVoiceFailsClosedWithoutKeys();
testArcadeGamesHaveNoKidPaywall();
testPortalGamesHaveNoKidPayCta();
testArcadeRoutesRedirectToHtml();
testWorkingGamesOnly();
testPortalGameCompleteAwardsXp();
testIslandWeekAndPreservedSurfaces();

console.log('webapp honesty checks passed');
