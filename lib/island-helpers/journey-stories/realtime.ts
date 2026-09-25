/**
 * Parent wizard listens for each Journey Stories page picture.
 * Postgres changes on journey_story_pages, plus a broadcast on the story topic.
 */
export type JourneyPageImageUpdate = {
  storyId: string;
  pageIndex: number;
  imageUrl: string | null;
  imageStatus: 'pending' | 'ready' | 'failed' | 'reused';
};

export function journeyBroadcastTopic(storyId: string): string {
  return `journey-story:${storyId}`;
}

export function journeyPageRealtimeFilter(storyId: string): {
  event: 'UPDATE';
  schema: 'public';
  table: 'journey_story_pages';
  filter: string;
} {
  return {
    event: 'UPDATE',
    schema: 'public',
    table: 'journey_story_pages',
    filter: `story_id=eq.${storyId}`,
  };
}

export function readPageImageUpdate(storyId: string, row: Record<string, unknown> | null | undefined): JourneyPageImageUpdate | null {
  if (!row) return null;
  const pageIndex = Number(row.page_index ?? row.pageIndex);
  if (!Number.isInteger(pageIndex)) return null;
  const imageStatus = String(row.image_status ?? row.imageStatus ?? 'pending');
  if (imageStatus !== 'pending' && imageStatus !== 'ready' && imageStatus !== 'failed' && imageStatus !== 'reused') {
    return null;
  }
  const imageUrlRaw = row.image_url ?? row.imageUrl;
  const imageUrl = typeof imageUrlRaw === 'string' && imageUrlRaw.trim() ? imageUrlRaw : null;
  return { storyId, pageIndex, imageUrl, imageStatus };
}
