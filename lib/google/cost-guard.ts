export type CostGuardSubject = {
  appId: string;
  subjectId: string;
  operation: 'text' | 'image' | 'audio' | 'video' | 'agent';
  estimatedUsd: number;
};

const DEFAULT_DAILY_AI_HARD_LIMIT_USD = 25;
const DEFAULT_DAILY_VIDEO_HARD_LIMIT_USD = 15;

export function getDailyHardLimitUsd(operation: CostGuardSubject['operation']): number {
  if (operation === 'video') {
    return Number(process.env.VIDEO_DAILY_HARD_LIMIT_USD || DEFAULT_DAILY_VIDEO_HARD_LIMIT_USD);
  }

  return Number(process.env.AI_DAILY_HARD_LIMIT_USD || DEFAULT_DAILY_AI_HARD_LIMIT_USD);
}

export function assertCostWithinSingleJobLimit(subject: CostGuardSubject): void {
  const maxSingleJobUsd = Number(process.env.AI_SINGLE_JOB_LIMIT_USD || 2);

  if (subject.estimatedUsd > maxSingleJobUsd) {
    throw new Error(
      `Cost guard blocked ${subject.operation}: estimated $${subject.estimatedUsd.toFixed(
        2
      )} exceeds single-job limit $${maxSingleJobUsd.toFixed(2)}`
    );
  }
}
