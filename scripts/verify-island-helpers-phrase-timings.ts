/**
 * Phrase grouping unit checks.
 */
import { groupWordsIntoPhrases, TimedWord } from '../lib/island-helpers/phrase-timings';

if (groupWordsIntoPhrases([]).length !== 0) throw new Error('empty input');

const punct: TimedWord[] = [
  { text: 'Come', start: 0, end: 0.2 },
  { text: 'sit', start: 0.2, end: 0.4 },
  { text: 'with', start: 0.4, end: 0.55 },
  { text: 'me.', start: 0.55, end: 0.8 },
  { text: 'Then', start: 0.9, end: 1.1 },
  { text: 'we', start: 1.1, end: 1.25 },
  { text: 'play.', start: 1.25, end: 1.5 },
];
const p1 = groupWordsIntoPhrases(punct, 'Come sit with me. Then we play.');
if (p1.length < 2) throw new Error(`expected punctuation splits, got ${p1.length}`);
if (!p1[0].text.toLowerCase().includes('come')) throw new Error('first phrase text');
if (p1[0].wordIndices.length < 2) throw new Error('wordIndices');

const plain: TimedWord[] = Array.from({ length: 9 }, (_, i) => ({
  text: `w${i + 1}`,
  start: i * 0.2,
  end: i * 0.2 + 0.18,
}));
const p2 = groupWordsIntoPhrases(plain);
if (p2.length < 2) throw new Error('fallback chunking expected');
for (const ph of p2) {
  if (ph.wordIndices.length < 3 || ph.wordIndices.length > 5) {
    // last chunk may be shorter
    if (ph !== p2[p2.length - 1]) {
      throw new Error(`fallback chunk size ${ph.wordIndices.length}`);
    }
  }
}

console.log('verify-island-helpers-phrase-timings: PASS');
