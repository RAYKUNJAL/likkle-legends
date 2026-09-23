/**
 * Calm Mode / reduced-motion contract checks.
 */
import { allowAutoplayFrom, allowMotionFrom, loadPrefs, savePrefs } from '../lib/island-helpers/prefs';

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

// reduce-motion ⇒ allowAutoplay false even if calmMode false
if (allowAutoplayFrom({ calmMode: false, readAloudDefault: true }, true) !== false) {
  throw new Error('OS reduced-motion must disable autoplay');
}
if (allowAutoplayFrom({ calmMode: true, readAloudDefault: true }, false) !== false) {
  throw new Error('calmMode must disable autoplay');
}
if (allowAutoplayFrom({ calmMode: false, readAloudDefault: true }, false) !== true) {
  throw new Error('default should allow autoplay');
}

if (allowMotionFrom(false, false) !== true) throw new Error('motion ok');
if (allowMotionFrom(true, false) !== false) throw new Error('calm blocks motion');
if (allowMotionFrom(false, true) !== false) throw new Error('PRM blocks motion');

const after = savePrefs({ calmMode: true }, mem);
if (after.readAloudDefault !== false) throw new Error('calm ON ⇒ readAloudDefault false');
if (loadPrefs(mem).readAloudDefault !== false) throw new Error('persisted readAloudDefault');

console.log('verify-island-helpers-calm: PASS');
