import { promises as fs } from 'fs';
import path from 'path';
import { LikkleVideoPlan } from './video-types';

export type ApprovalStatus = 'draft' | 'queued' | 'approved' | 'rejected' | 'rendered' | 'scheduled' | 'published';

export type ApprovalQueueItem = {
  id: string;
  plan: LikkleVideoPlan;
  status: ApprovalStatus;
  channels: Array<'youtube' | 'instagram' | 'facebook' | 'tiktok'>;
  contentType: 'music_video' | 'short_lesson' | 'folklore_story' | 'island_fact';
  durationTarget: 'short' | 'two_minute_music_video';
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
  approvalChecklist: {
    coppaSafe: boolean;
    rightsCleared: boolean;
    characterConsistent: boolean;
    islandFactChecked: boolean;
    ctaParentSafe: boolean;
  };
};

const queuePath = path.join(process.cwd(), 'data', 'youtube-approval-queue.json');

async function readQueue(): Promise<ApprovalQueueItem[]> {
  try {
    const raw = await fs.readFile(queuePath, 'utf8');
    return JSON.parse(raw) as ApprovalQueueItem[];
  } catch (_e) {
    return [];
  }
}

async function writeQueue(items: ApprovalQueueItem[]) {
  await fs.mkdir(path.dirname(queuePath), { recursive: true });
  await fs.writeFile(queuePath, JSON.stringify(items, null, 2));
}

export async function listApprovalQueue() {
  return readQueue();
}

export async function enqueueVideoPlan(
  plan: LikkleVideoPlan,
  options?: Partial<Pick<ApprovalQueueItem, 'channels' | 'contentType' | 'durationTarget' | 'reviewNotes'>>
) {
  const now = new Date().toISOString();
  const item: ApprovalQueueItem = {
    id: plan.id,
    plan,
    status: 'queued',
    channels: options?.channels || ['youtube'],
    contentType: options?.contentType || 'short_lesson',
    durationTarget: options?.durationTarget || 'short',
    createdAt: now,
    updatedAt: now,
    reviewNotes: options?.reviewNotes,
    approvalChecklist: {
      coppaSafe: plan.safety.coppaSafe,
      rightsCleared: Boolean(plan.musicAssetId),
      characterConsistent: plan.characterAssetIds.length > 0,
      islandFactChecked: false,
      ctaParentSafe: true,
    },
  };

  const items = await readQueue();
  items.unshift(item);
  await writeQueue(items);
  return item;
}

export async function updateApprovalItem(id: string, patch: Partial<ApprovalQueueItem>) {
  const items = await readQueue();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeQueue(items);
  return items[index];
}
