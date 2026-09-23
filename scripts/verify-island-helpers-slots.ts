import { fillTemplate, isPhraseFirstDefault } from '../lib/island-helpers/slot-phrases';
import { SEED_SLOT_TEMPLATES } from '../lib/island-helpers/seed-slot-templates';

if (!isPhraseFirstDefault()) throw new Error('phrase-first must be default');
const t = SEED_SLOT_TEMPLATES[0];
const filled = fillTemplate(t, { activity: 'play' });
if (filled !== 'I want to play.') throw new Error(`got ${filled}`);

const ft = SEED_SLOT_TEMPLATES.find((x) => x.id === 'first_then')!;
const line = fillTemplate(ft, { first: 'wash hands', then: 'story time' });
if (line !== 'First wash hands, then story time.') throw new Error(line);

console.log('verify-island-helpers-slots: PASS');
