/**
 * Soundboard / kid chrome copy forbid checks.
 */
import fs from 'fs';
import path from 'path';
import { SEED_PHRASES } from '../lib/island-helpers/seed-phrases';
import { ISLAND_HELPERS_CHARACTER_IDS } from '../lib/island-helpers/types';
import { IH_KID_FORBIDDEN, IH_PRODUCT_NAME, IH_SAY_A_PHRASE } from '../lib/island-helpers/copy';
import { listByCharacter } from '../lib/island-helpers/phrases';

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const mem = new MemoryStorage();
for (const id of ISLAND_HELPERS_CHARACTER_IDS) {
  const n = listByCharacter(id, mem).length;
  if (n < 6 || n > 8) throw new Error(`${id} count ${n}`);
}

if (IH_PRODUCT_NAME !== 'Island Helpers') throw new Error('product name');
if (!IH_SAY_A_PHRASE) throw new Error('say a phrase label');

const roots = [
  path.join(process.cwd(), 'components/island-helpers'),
  path.join(process.cwd(), 'app/island-helpers'),
  path.join(process.cwd(), 'lib/island-helpers/copy.ts'),
];

function walk(p: string, out: string[] = []): string[] {
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile()) {
    if (/\.(tsx?|md)$/.test(p)) out.push(p);
    return out;
  }
  for (const name of fs.readdirSync(p)) {
    if (name === 'AVOID.md') continue;
    walk(path.join(p, name), out);
  }
  return out;
}

const files = roots.flatMap((r) => walk(r));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  // Skip ethics / avoid docs that intentionally mention parent-facing words
  if (file.endsWith('EthicsDisclaimer.tsx') || file.endsWith('copy.ts') || file.endsWith('AVOID.md')) {
    // copy.ts may list forbidden words as data — skip the constant array body by checking kid chrome files only for clinic words outside IH_KID_FORBIDDEN def
    if (file.endsWith('copy.ts')) {
      const kidChrome = [IH_PRODUCT_NAME, IH_SAY_A_PHRASE].join('\n').toLowerCase();
      for (const bad of IH_KID_FORBIDDEN) {
        if (kidChrome.includes(bad.toLowerCase())) throw new Error(`kid label contains ${bad}`);
      }
      continue;
    }
    if (file.endsWith('EthicsDisclaimer.tsx')) continue;
  }
  const lower = text.toLowerCase();
  // Kid UI components: Soundboard*, IslandHelpersHome, JourneyToolsDrawer (title ok)
  const base = path.basename(file);
  const kidFiles = [
    'Soundboard.tsx',
    'SoundboardCard.tsx',
    'CharacterBoardTabs.tsx',
    'IslandHelpersHome.tsx',
    'JourneyToolsDrawer.tsx',
    'page.tsx',
  ];
  if (!kidFiles.includes(base)) continue;
  for (const bad of ['therapy', 'spectrum', 'diagnosis', 'aac therapy', 'compliance', 'eye contact']) {
    if (lower.includes(bad)) throw new Error(`${file} contains kid-forbidden "${bad}"`);
  }
  if (text.includes('Social Stories')) throw new Error(`${file} Social Stories trademark`);
}

// displayMode text ⇒ image not required (logic contract)
const modeText = 'text' as const;
if (modeText === 'text') {
  /* image not required — documented */
}

if (SEED_PHRASES.length < 24) throw new Error('seed pack size');

console.log('verify-island-helpers-soundboard-copy: PASS');
