/**
 * Island Helpers phrase board guards.
 */
import {
  addCustomPhrase,
  getBoard,
  listByCharacter,
  removePhrase,
  updateCustomPhrase,
} from '../lib/island-helpers/phrases';
import { SEED_PHRASES } from '../lib/island-helpers/seed-phrases';
import { ISLAND_HELPERS_CHARACTER_IDS } from '../lib/island-helpers/types';

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
const forbidden = ['therapy', 'spectrum', 'compliance', 'eye contact', 'quiet hands'];

for (const seed of SEED_PHRASES) {
  const lower = seed.text.toLowerCase();
  for (const bad of forbidden) {
    if (lower.includes(bad)) throw new Error(`Forbidden in seed: ${bad} → ${seed.text}`);
  }
}

for (const id of ISLAND_HELPERS_CHARACTER_IDS) {
  const n = listByCharacter(id, mem).length;
  if (n < 6 || n > 8) throw new Error(`${id} seed count ${n} not in [6,8]`);
}

const board = getBoard(mem);
if (board.cards.length < 24) throw new Error('expected merged seed cards');

const custom = addCustomPhrase({ characterId: 'roti', text: 'I want juice.' }, mem);
if (!custom.id.startsWith('custom:')) throw new Error('custom id');
if (!getBoard(mem).cards.some((c) => c.id === custom.id)) throw new Error('custom missing after add');

const updated = updateCustomPhrase(custom.id, { text: 'I want cold juice.' }, mem);
if (!updated || updated.text !== 'I want cold juice.') throw new Error('update failed');

if (!removePhrase(custom.id, mem)) throw new Error('remove custom failed');
if (getBoard(mem).cards.some((c) => c.id === custom.id)) throw new Error('custom still present');

const seedId = listByCharacter('tanty_spice', mem)[0].id;
const before = getBoard(mem).cards.length;
if (removePhrase(seedId, mem) !== false) throw new Error('deleting seed should be no-op false');
if (getBoard(mem).cards.length !== before) throw new Error('seed delete must not remove cards');
if (!getBoard(mem).cards.some((c) => c.id === seedId)) throw new Error('seed should remain');

console.log('verify-island-helpers-phrases: PASS');
