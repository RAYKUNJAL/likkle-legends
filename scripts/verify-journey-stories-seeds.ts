import fs from 'fs';
import path from 'path';
import { SEED_SCENARIO_IDS, SEED_SCENARIOS, getScenario } from '../lib/island-helpers/journey-stories/seed-scenarios';

const required = ['dentist', 'new_food', 'loud_fete', 'haircut', 'airplane', 'board_talks'];
for (const id of required) {
  if (!SEED_SCENARIO_IDS.includes(id)) throw new Error(`missing seed ${id}`);
  if (!getScenario(id)) throw new Error(`getScenario ${id}`);
}
if (SEED_SCENARIOS.length !== 6) throw new Error('exactly 6 seeds');

const src = fs.readFileSync(
  path.join(process.cwd(), 'lib/island-helpers/journey-stories/seed-scenarios.ts'),
  'utf8',
);
for (const bad of ['Social Stories™', 'Social Stories', 'eye contact', 'quiet hands', 'compliance', 'say it out loud', 'therapy']) {
  if (src.includes(bad)) throw new Error(`seed module contains forbidden "${bad}"`);
}

console.log('verify-journey-stories-seeds: PASS');
