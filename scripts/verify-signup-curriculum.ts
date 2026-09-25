/**
 * Smoke for the signup-country curriculum extension.
 * No network. Missing GEMINI_API_KEY must select the OECS outline, not a model.
 */
import { buildGroundedFallbackWeeks, curriculumEngine, planTextIsKidSafe, pickTodaysActivities, weeksAreKidSafe } from '../lib/curriculum/grounded-plan';
import { canonicalPrimaryIsland, resolveSignupPlace } from '../lib/curriculum/resolve-signup-island';

function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
}

const savedKey = process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY;
assert(curriculumEngine() === 'oecs_fallback', 'missing GEMINI_API_KEY must use the OECS outline');
process.env.GEMINI_API_KEY = 'present-for-test';
assert(curriculumEngine() === 'gemini', 'a Gemini key selects Gemini');
if (savedKey) process.env.GEMINI_API_KEY = savedKey;
else delete process.env.GEMINI_API_KEY;

const trinidad = resolveSignupPlace({ primaryIsland: 'trinidad_and_tobago' });
assert(trinidad.status === 'resolved', 'signup slug resolves');
assert(trinidad.primaryIslandId === 'trinidad', 'slug maps to IslandPicker id');
assert(trinidad.registryId === 'TT', 'slug maps to registry pack');
assert(trinidad.anchors.foods.some((food) => /doubles/i.test(food)), 'plan is grounded in the Trinidad pack');
assert(canonicalPrimaryIsland('trinidad_and_tobago') === 'trinidad', 'canonical island id');

const jamaica = resolveSignupPlace({ primaryIsland: 'JM' });
assert(jamaica.registryId === 'JM' && jamaica.displayName === 'Jamaica', 'ISO code maps to Jamaica');

const unknown = resolveSignupPlace({ primaryIsland: '', country: '' });
assert(unknown.status === 'unknown', 'blank place stays unknown');
assert(resolveSignupPlace({ primaryIsland: 'narnia' }).status === 'unknown', 'unknown place stays empty');

const diaspora = resolveSignupPlace({ primaryIsland: '', country: 'US' });
assert(diaspora.status === 'resolved' && diaspora.diaspora, 'explicit US country uses the diaspora pack');
assert(diaspora.registryId === null, 'diaspora is not a fake island pack');
assert(diaspora.anchors.foods.includes('roti'), 'diaspora anchors are the shared list');

const islandWins = resolveSignupPlace({ primaryIsland: 'jamaica', country: 'US' });
assert(islandWins.registryId === 'JM' && !islandWins.diaspora, 'a saved island wins over country');

const saba = resolveSignupPlace({ primaryIsland: 'saba' });
assert(saba.diaspora && saba.unpackedPlace === 'Saba', 'Saba is honest about the missing pack');
assert(canonicalPrimaryIsland('saba') === null, 'Saba is not rewritten to another island');

const weeks = buildGroundedFallbackWeeks({
    age: 6,
    weeksCount: 1,
    place: jamaica,
    focusAreas: ['literacy', 'culture'],
    preferredCharacter: 'roti',
    dailyMinutes: 30,
    standards: { literacy: 'OECS Grade 1: Phonics' },
});
assert(weeks.length === 1 && weeks[0].days.length === 5, 'one school week, Monday to Friday');
assert(weeksAreKidSafe(weeks), 'outline stays kid-safe');
const blob = JSON.stringify(weeks);
assert(/ackee|jerk|reggae/i.test(blob), 'Jamaica outline uses retrieved pack facts');
assert(/age 6/.test(blob), 'outline names the child age');
assert(!/therapy|diagnos|medication/i.test(blob), 'outline makes no medical claims');

assert(!planTextIsKidSafe('This therapy session diagnoses ADHD'), 'unsafe model text is rejected');

const monday = new Date(2026, 8, 21);
const picked = pickTodaysActivities(weeks, monday);
assert(monday.getDay() === 1, 'fixture date is a Monday');
assert(!picked.weekend && picked.activities.length > 0, 'Monday returns school-day work');
const saturday = new Date(2026, 8, 26);
const weekend = pickTodaysActivities(weeks, saturday);
assert(saturday.getDay() === 6, 'fixture date is a Saturday');
assert(weekend.weekend && weekend.activities.length === 0, 'weekend does not pretend a school day');

console.log('verify-signup-curriculum: PASS');
