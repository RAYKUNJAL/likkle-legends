/**
 * One Journey Stories picture job. Sequential Imagen calls only.
 * Fail closed without a Gemini/Imagen key — no stub image URLs.
 */
import { buildJourneyImagePrompt } from './image-prompt';
import { isUsableHostedImage, pageIndexesForJob, runPagesSequentially } from './jobs';
import { placeholderForRole } from './placeholders';

export type WorkerPage = {
  pageIndex: number;
  role: string;
  text: string;
  imageUrl: string | null;
  imageStatus: string;
};

export type WorkerJob = {
  id: string;
  storyId: string;
  pageIndex: number | null;
};

const PAGE_FAILED = 'This picture could not be made. The words are still here.';

export async function processJourneyJob(input: {
  job: WorkerJob;
  pages: WorkerPage[];
  castCharacterIds: string[];
  hasImagenKey: boolean;
  illustrate: (prompt: string) => Promise<Buffer | null>;
  saveImage: (pageIndex: number, bytes: Buffer) => Promise<string | null>;
  markPage: (
    pageIndex: number,
    patch: { imageUrl: string | null; imageStatus: 'pending' | 'ready' | 'failed' | 'reused'; imageError: string | null },
  ) => Promise<void>;
}): Promise<{ ok: boolean; error: string | null }> {
  const indexes = pageIndexesForJob(input.job.pageIndex, input.pages.length);
  let failed = false;

  await runPagesSequentially(indexes, async (pageIndex) => {
    const page = input.pages[pageIndex];
    if (!page) return;

    if (isUsableHostedImage(page.imageUrl)) {
      await input.markPage(pageIndex, {
        imageUrl: page.imageUrl,
        imageStatus: 'reused',
        imageError: null,
      });
      return;
    }

    if (!input.hasImagenKey) {
      const local = placeholderForRole(page.role);
      await input.markPage(pageIndex, {
        imageUrl: local,
        imageStatus: 'ready',
        imageError: null,
      });
      return;
    }

    const prompt = buildJourneyImagePrompt({
      pageRole: page.role,
      pageText: page.text,
      castCharacterIds: input.castCharacterIds,
    });
    const bytes = await input.illustrate(prompt);
    if (!bytes) {
      failed = true;
      await input.markPage(pageIndex, {
        imageUrl: null,
        imageStatus: 'failed',
        imageError: PAGE_FAILED,
      });
      return;
    }

    const imageUrl = await input.saveImage(pageIndex, bytes);
    if (!isUsableHostedImage(imageUrl)) {
      failed = true;
      await input.markPage(pageIndex, {
        imageUrl: null,
        imageStatus: 'failed',
        imageError: PAGE_FAILED,
      });
      return;
    }

    await input.markPage(pageIndex, {
      imageUrl,
      imageStatus: 'ready',
      imageError: null,
    });
  });

  return failed ? { ok: false, error: PAGE_FAILED } : { ok: true, error: null };
}
