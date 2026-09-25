/**
 * Shared Journey Stories picture cache.
 * Same scenario + language mode + cast reuses hosted page art.
 */
import { isUsableHostedImage } from './jobs';

export function journeyLibraryKey(input: {
  scenarioId: string;
  scenarioLabel?: string;
  languageMode: string;
  castCharacterIds: string[];
}): string {
  const cast = [...input.castCharacterIds]
    .map((id) => id.trim())
    .filter(Boolean)
    .sort()
    .join('+');
  const scenario =
    input.scenarioId === 'custom'
      ? `custom:${(input.scenarioLabel || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80)}`
      : input.scenarioId.trim();
  const language = input.languageMode === 'literal' ? 'literal' : 'standard';
  return `journey|${scenario}|${language}|${cast}`;
}

export function mergePublishedImages<T extends { imageUrl?: string | null }>(
  pages: T[],
  published: { pageIndex: number; imageUrl: string | null }[],
): T[] {
  return pages.map((page, index) => {
    if (isUsableHostedImage(page.imageUrl)) return page;
    const found = published.find(
      (item) => item.pageIndex === index && isUsableHostedImage(item.imageUrl),
    );
    if (!found?.imageUrl) return page;
    return { ...page, imageUrl: found.imageUrl };
  });
}
