/** Member content shelves a kid can open from the portal. Empty shelves are fine. */
export const KIDS_CONTENT_SHELVES = [
  { id: 'coloring-books', label: 'Coloring books', href: '/portal/coloring-books', emoji: '🖍️' },
  { id: 'journey-stories', label: 'Journey stories', href: '/portal/journey-stories', emoji: '🧭' },
  { id: 'downloads', label: 'Downloads', href: '/portal/downloads', emoji: '📥' },
  { id: 'library', label: 'Library', href: '/portal/library', emoji: '📚' },
] as const;

export type KidsShelfId = (typeof KIDS_CONTENT_SHELVES)[number]['id'];

export function shelfNeedsStories(id: string) {
  return id === 'journey-stories' || id === 'library';
}
