/**
 * Island Helpers avoid-list smoke check (Cut 1 + Cut 2).
 */
import fs from 'fs';
import path from 'path';
import { IH_ETHICS_DISCLAIMER, IH_JOURNEY_ETHICS_EXTRA } from '../lib/island-helpers/copy';
import { allowAutoplayFrom } from '../lib/island-helpers/prefs';

if (!IH_ETHICS_DISCLAIMER.toLowerCase().includes('not a medical device')) {
  throw new Error('ethics must say not a medical device');
}
if (!IH_JOURNEY_ETHICS_EXTRA.toLowerCase().includes('not a medical device')) {
  throw new Error('journey ethics must say not a medical device');
}
if (/Social Stories™/i.test(IH_ETHICS_DISCLAIMER) || /Social Stories/.test(IH_ETHICS_DISCLAIMER)) {
  throw new Error('ethics must not claim Social Stories');
}
if (/Social Stories™/i.test(IH_JOURNEY_ETHICS_EXTRA) || /Social Stories/.test(IH_JOURNEY_ETHICS_EXTRA)) {
  throw new Error('journey ethics must not claim Social Stories');
}

if (allowAutoplayFrom({ calmMode: true, readAloudDefault: true }, false) !== false) {
  throw new Error('calm must block autoplay');
}
if (allowAutoplayFrom({ calmMode: false, readAloudDefault: true }, true) !== false) {
  throw new Error('reduced-motion must block autoplay');
}

const namespaces = [
  path.join(process.cwd(), 'components/island-helpers'),
  path.join(process.cwd(), 'app/island-helpers'),
  path.join(process.cwd(), 'lib/island-helpers/journey-stories'),
];

/** Product-claim bans in UI/routes. Detection modules may mention ban strings. */
const forbidInUi = ['Social Stories™', 'Social Stories'];

const allowMentionFiles = new Set([
  'safety.ts',
  'prompt.ts',
  'COPY.md',
  'AVOID.md',
]);

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) throw new Error(`missing ${dir}`);
  for (const name of fs.readdirSync(dir)) {
    if (name === 'AVOID.md' || name === 'COPY.md') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|md)$/.test(name)) out.push(p);
  }
  return out;
}

const files = namespaces.flatMap((n) => walk(n));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const base = path.basename(file);
  if (!allowMentionFiles.has(base)) {
    for (const bad of forbidInUi) {
      if (text.includes(bad)) throw new Error(`${file} contains forbidden "${bad}"`);
    }
  }
  const kidChrome =
    [
      'Soundboard.tsx',
      'SoundboardCard.tsx',
      'CharacterBoardTabs.tsx',
      'IslandHelpersHome.tsx',
      'JourneyToolsDrawer.tsx',
      'FirstThenBoard.tsx',
      'SlotFillBoard.tsx',
      'InStoryAacOverlay.tsx',
    ].includes(base) ||
    (file.includes(`${path.sep}app${path.sep}island-helpers${path.sep}`) &&
      base === 'page.tsx' &&
      !file.includes('phrases') &&
      !file.includes('journey-stories'));
  if (kidChrome) {
    const lower = text.toLowerCase();
    for (const bad of ['therapy', 'spectrum', 'diagnosis']) {
      if (lower.includes(bad)) throw new Error(`${file} kid chrome contains "${bad}"`);
    }
    for (const bad of ['look at me', 'say it to unlock', 'quiet hands', 'eye contact', 'compliance']) {
      if (lower.includes(bad)) throw new Error(`${file} kid chrome contains "${bad}"`);
    }
  }
}

console.log('verify-island-helpers-avoid-list: PASS');
