/**
 * Journey Stories picture queue — pure planning + claim.
 * Durable rows live in Postgres. This module does not call Imagen.
 * QStash only wakes a signed route when its env is set. No Redis.
 */
import type { JourneyImageStatus } from './types';

export type JourneyJobStatus = 'queued' | 'running' | 'done' | 'failed';

export const JOURNEY_ART_CALM_COPY =
  'Pictures are resting for now. You can still read the words.';

export type PlannedPage = {
  pageIndex: number;
  imageStatus: JourneyImageStatus;
  imageUrl: string | null;
};

export type EnqueuePlan = {
  queued: boolean;
  calmCopy: string | null;
  /** null pageIndex means the worker walks every page, one at a time. */
  job: { pageIndex: number | null } | null;
  pages: PlannedPage[];
};

export type JourneyJobRow = {
  id: string;
  storyId: string;
  pageIndex: number | null;
  status: JourneyJobStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  claimedAt: string | null;
  finishedAt: string | null;
};

const HOSTED = /^https?:\/\//i;

/** A picture we can keep. Local SVG placeholders are not shared-library art. */
export function isUsableHostedImage(url: string | null | undefined): boolean {
  if (!url || !HOSTED.test(url.trim())) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function planIllustrationWork(input: {
  hasImagenKey: boolean;
  pageIndex?: number | null;
  pages: { imageUrl?: string | null }[];
}): EnqueuePlan {
  const requested =
    typeof input.pageIndex === 'number' && input.pageIndex >= 0 && input.pageIndex < input.pages.length
      ? [input.pageIndex]
      : input.pages.map((_, index) => index);

  const pages: PlannedPage[] = input.pages.map((page, pageIndex) => {
    if (!requested.includes(pageIndex)) {
      return {
        pageIndex,
        imageStatus: isUsableHostedImage(page.imageUrl) ? 'reused' : 'pending',
        imageUrl: page.imageUrl || null,
      };
    }
    if (isUsableHostedImage(page.imageUrl)) {
      return { pageIndex, imageStatus: 'reused', imageUrl: page.imageUrl!.trim() };
    }
    return { pageIndex, imageStatus: 'pending', imageUrl: null };
  });

  const needsArt = requested.filter((index) => pages[index]?.imageStatus === 'pending');

  if (!input.hasImagenKey) {
    return {
      queued: false,
      calmCopy: JOURNEY_ART_CALM_COPY,
      job: null,
      pages,
    };
  }

  if (!needsArt.length) {
    return { queued: false, calmCopy: null, job: null, pages };
  }

  return {
    queued: true,
    calmCopy: null,
    job: { pageIndex: typeof input.pageIndex === 'number' ? input.pageIndex : null },
    pages,
  };
}

/**
 * Mirrors claim_journey_story_job: oldest queued row, skip locked ids.
 * Stale running rows are not claimed here; the SQL function reclaims those.
 */
export function claimNextQueuedJob(
  jobs: JourneyJobRow[],
  lockedIds: ReadonlySet<string>,
  nowIso: string,
): { jobs: JourneyJobRow[]; claimed: JourneyJobRow | null } {
  const next = [...jobs].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const claimable = next.find((job) => job.status === 'queued' && !lockedIds.has(job.id));
  if (!claimable) return { jobs, claimed: null };

  const claimed: JourneyJobRow = {
    ...claimable,
    status: 'running',
    attempts: claimable.attempts + 1,
    claimedAt: nowIso,
  };
  return {
    claimed,
    jobs: jobs.map((job) => (job.id === claimed.id ? claimed : job)),
  };
}

/**
 * One HTTP callback draws one page. A full-story job continues on the next callback.
 */
export function singleCallbackPageIndex(
  jobPageIndex: number | null,
  pages: { pageIndex: number; imageUrl?: string | null; imageStatus?: string }[],
): number | null {
  if (typeof jobPageIndex === 'number') return jobPageIndex;
  const pending = pages.find(
    (page) =>
      page.imageStatus !== 'ready' &&
      page.imageStatus !== 'reused' &&
      !isUsableHostedImage(page.imageUrl),
  );
  return pending ? pending.pageIndex : null;
}

export function pageIndexesForJob(pageIndex: number | null, pageCount: number): number[] {
  if (typeof pageIndex === 'number') {
    return pageIndex >= 0 && pageIndex < pageCount ? [pageIndex] : [];
  }
  return Array.from({ length: pageCount }, (_, index) => index);
}

/** One page after another. Never starts the next picture until the current one settles. */
export async function runPagesSequentially<T>(
  items: T[],
  step: (item: T, index: number) => Promise<void>,
): Promise<void> {
  for (let index = 0; index < items.length; index += 1) {
    await step(items[index], index);
  }
}
