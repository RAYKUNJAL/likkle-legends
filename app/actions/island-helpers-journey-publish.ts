'use server';

/**
 * Best-effort server publish helper.
 * Primary kid visibility is localStorage publish + client library merge (MVP).
 * Attempts stories_library insert when Supabase admin is available — never throws to client as success if mapping fails.
 */
import { journeyDraftToStoriesLibraryRow } from '@/lib/island-helpers/journey-stories/publish';
import type { JourneyStoryDraft } from '@/lib/island-helpers/journey-stories/types';
import { canMarkPublished } from '@/lib/island-helpers/journey-stories/types';

export async function publishJourneyStoryAction(draft: JourneyStoryDraft): Promise<
  | { ok: true; libraryStoryId: string; persistedRemote: boolean }
  | { ok: false; error: string }
> {
  try {
    if (!canMarkPublished(draft) && draft.status !== 'published') {
      return { ok: false, error: 'Edit gate incomplete' };
    }
    const row = journeyDraftToStoriesLibraryRow({
      ...draft,
      status: draft.status === 'published' ? 'published' : 'ready',
    });
    const libraryStoryId = row.id;

    let persistedRemote = false;
    try {
      const { supabaseAdmin } = await import('@/lib/supabase-client');
      const { error } = await supabaseAdmin.from('stories_library').upsert(
        {
          id: row.id,
          slug: row.slug,
          title: row.title,
          summary: row.summary,
          cover_image_url: row.cover_image_url,
          island_code: row.island_code,
          age_track: row.age_track,
          tradition: row.tradition,
          tier_required: row.tier_required,
          estimated_reading_time_minutes: row.estimated_reading_time_minutes,
          is_active: true,
          content: row.content,
        },
        { onConflict: 'id' },
      );
      if (!error) persistedRemote = true;
    } catch {
      persistedRemote = false;
    }

    return { ok: true, libraryStoryId, persistedRemote };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Publish failed' };
  }
}
