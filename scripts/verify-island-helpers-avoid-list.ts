/**
 * Island Helpers avoid-list smoke check.
 */
import fs from 'fs';
import path from 'path';
import { IH_ETHICS_DISCLAIMER } from '../lib/island-helpers/copy';
import { allowAutoplayFrom } from '../lib/island-helpers/prefs';

if (!IH_ETHICS_DISCLAIMER.toLowerCase().includes('not a medical device')) {
  throw new Error('ethics must say not a medical device');
}
if (/Social Stories™/i.test(IH_ETHICS_DISCLAIMER) || /Social Stories/.test(IH_ETHICS_DISCLAIMER)) {
  throw new Error('ethics must not claim Social Stories');
}

// Calm / reduced-motion contract
if (allowAutoplayFrom({ calmMode: true, readAloudDefault: true }, false) !== false) {
  throw new Error('calm must block autoplay');
}
if (allowAutoplayFrom({ calmMode: false, readAloudDefault: true }, true) !== false) {
  throw new Error('reduced-motion must block autoplay');
}

const namespaces = [
  path.join(process.cwd(), 'components/island-helpers'),
  path.join(process.cwd(), 'app/island-helpers'),
];

const forbidExact = [
  'look at me',
  'say it to unlock',
  'quiet hands',
  'Social Stories™',
  'Social Stories',
];

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) throw new Error(`missing ${dir}`);
  for (const name of fs.readdirSync(dir)) {
    if (name === 'AVOID.md') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|md)$/.test(name)) out.push(p);
  }
  return out;
}

const files = namespaces.flatMap((n) => walk(n));
for (const file of files) {
  // Parent ethics may discuss compliance in the disclaimer string — allow only EthicsDisclaimer + copy.ts for that word in educational negation.
  const text = fs.readFileSync(file, 'utf8');
  const base = path.basename(file);
  for (const bad of forbidExact) {
    if (text.includes(bad)) throw new Error(`${file} contains forbidden "${bad}"`);
  }
  const kidChrome = ['Soundboard.tsx', 'SoundboardCard.tsx', 'CharacterBoardTabs.tsx', 'IslandHelpersHome.tsx', 'JourneyToolsDrawer.tsx'].includes(base)
    || (file.includes(`${path.sep}app${path.sep}island-helpers${path.sep}`) && base === 'page.tsx' && !file.includes('phrases'));
  if (kidChrome) {
    const lower = text.toLowerCase();
    for (const bad of ['therapy', 'spectrum', 'diagnosis']) {
      if (lower.includes(bad)) throw new Error(`${file} kid chrome contains "${bad}"`);
    }
  }
}

// No eye-contact mechanics / compliance scores in island-helpers tree (string scan)
for (const file of files) {
  const lower = fs.readFileSync(file, 'utf8').toLowerCase();
  if (lower.includes('eye-contact') || lower.includes('eye contact')) {
    if (!file.endsWith('AVOID.md')) throw new Error(`${file} eye contact`);
  }
}

console.log('verify-island-helpers-avoid-list: PASS');
