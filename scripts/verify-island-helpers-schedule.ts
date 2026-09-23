import {
  createMemoryStorage,
} from '../lib/island-helpers/journey-stories/draft-store';
import {
  hasCompulsionLockout,
  loadSchedule,
  saveSchedule,
  speakScheduleLine,
} from '../lib/island-helpers/schedule';

// reuse memory shape
const mem = {
  data: {} as Record<string, string>,
  getItem(k: string) {
    return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : null;
  },
  setItem(k: string, v: string) {
    this.data[k] = v;
  },
};

const empty = loadSchedule(mem);
if (empty.first !== null || empty.then !== null) throw new Error('empty start');

const next = saveSchedule(
  {
    first: { id: 'story', label: 'Story time' },
    then: null,
  },
  mem,
);
if (!next.first || next.then !== null) throw new Error('empty then allowed');
if (hasCompulsionLockout()) throw new Error('no compulsion API');

saveSchedule({ then: { id: 'snack', label: 'Snack' } }, mem);
const line = speakScheduleLine(loadSchedule(mem));
if (line !== 'First Story time, then Snack.') throw new Error(line);

console.log('verify-island-helpers-schedule: PASS');
