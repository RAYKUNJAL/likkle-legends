/**
 * Group word-level karaoke timings into gestalt-sized phrases.
 * Does not re-bake audio — consumes existing TimedWord arrays.
 */

export type TimedWord = { text: string; start: number; end: number };
export type TimedPhrase = { text: string; start: number; end: number; wordIndices: number[] };

const BOUNDARY = /[,.;:!?]|\band\b|\bthen\b/i;

/**
 * Split on clause boundaries: /[,.;:!?]|\band\b|\bthen\b/i
 * Fallback: groups of 3–5 words if no punctuation.
 */
export function groupWordsIntoPhrases(
  words: TimedWord[],
  _pageText?: string,
): TimedPhrase[] {
  if (!words?.length) return [];

  const phrases: TimedPhrase[] = [];
  let bucket: number[] = [];

  const flush = () => {
    if (!bucket.length) return;
    const slice = bucket.map((i) => words[i]);
    phrases.push({
      text: slice.map((w) => w.text).join(' '),
      start: slice[0].start,
      end: slice[slice.length - 1].end,
      wordIndices: [...bucket],
    });
    bucket = [];
  };

  const hasExplicitBoundaries = words.some((w) => BOUNDARY.test(w.text));

  for (let i = 0; i < words.length; i++) {
    bucket.push(i);
    const w = words[i];
    const hitBoundary = BOUNDARY.test(w.text);
    const fallbackFull = !hasExplicitBoundaries && bucket.length >= 4;
    const atEnd = i === words.length - 1;

    if (hitBoundary || fallbackFull || atEnd) {
      // Prefer 3–5 on fallback; if we hit 4 mid-stream keep going to 5 unless end
      if (!hasExplicitBoundaries && !atEnd && bucket.length < 5 && !hitBoundary) {
        continue;
      }
      flush();
    }
  }
  flush();
  return phrases;
}

export function activePhraseIndex(phrases: TimedPhrase[], t: number): number | null {
  if (!phrases.length) return null;
  let idx = phrases.findIndex((p) => t >= p.start && t <= p.end);
  if (idx === -1 && t > (phrases[phrases.length - 1]?.end || 0)) idx = phrases.length - 1;
  return idx >= 0 ? idx : null;
}
