/**
 * Island Helpers prefs store guards.
 */
import {
  DEFAULT_ISLAND_HELPERS_PREFS,
  PREFS_STORAGE_KEY,
} from '../lib/island-helpers/types';
import {
  allowAutoplayFrom,
  allowMotionFrom,
  loadPrefs,
  savePrefs,
} from '../lib/island-helpers/prefs';

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

const defaults = loadPrefs(mem);
if (defaults.calmMode !== false) throw new Error('defaults.calmMode should be false');
if (defaults.displayMode !== 'text_images') throw new Error('defaults.displayMode');
if (defaults.readAloudDefault !== true) throw new Error('defaults.readAloudDefault');

const calmed = savePrefs({ calmMode: true }, mem);
if (calmed.calmMode !== true) throw new Error('calmMode should save true');
if (calmed.readAloudDefault !== false) {
  throw new Error('savePrefs({ calmMode: true }) must force readAloudDefault === false');
}

const roundTrip = loadPrefs(mem);
if (roundTrip.calmMode !== true || roundTrip.readAloudDefault !== false) {
  throw new Error('round-trip prefs failed');
}
if (!mem.getItem(PREFS_STORAGE_KEY)) throw new Error(`missing key ${PREFS_STORAGE_KEY}`);

if (allowAutoplayFrom({ calmMode: false, readAloudDefault: true }, true) !== false) {
  throw new Error('reduced-motion must block autoplay');
}
if (allowAutoplayFrom({ calmMode: true, readAloudDefault: true }, false) !== false) {
  throw new Error('calmMode must block autoplay');
}
if (allowMotionFrom(true, false) !== false) throw new Error('calm blocks motion');
if (allowMotionFrom(false, true) !== false) throw new Error('reduce-motion blocks motion');

if (DEFAULT_ISLAND_HELPERS_PREFS.readAloudDefault !== true) {
  throw new Error('DEFAULT readAloudDefault');
}

console.log('verify-island-helpers-prefs: PASS');
