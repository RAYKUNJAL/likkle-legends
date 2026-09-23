/**
 * Journey Stories — post-generation safety filter (Gray-inspired ratios, not trademarked).
 */
import { JOURNEY_PAGE_ROLES, type JourneyPage, type JourneyPageRole } from './types';

export type SafetyResult =
  | { ok: true; pages: JourneyPage[]; warnings: string[] }
  | { ok: false; reasons: string[] };

const BLOCK_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /social\s*stories\s*™?/i, reason: 'Contains forbidden product trademark wording' },
  { re: /\beye\s*contact\b/i, reason: 'Blocks eye-contact goals' },
  { re: /\blook at (my|your|the) eyes?\b/i, reason: 'Blocks eye-gaze coaching' },
  { re: /\bquiet hands\b/i, reason: 'Blocks quiet-hands framing' },
  { re: /\byou must\b/i, reason: 'Blocks coercive “you must”' },
  { re: /\bsay it (out loud|to unlock|to continue)\b/i, reason: 'Blocks say-to-unlock / oral gatekeeping' },
  { re: /\bbe normal\b/i, reason: 'Blocks deficit “be normal” framing' },
  { re: /\bcompliance\b/i, reason: 'Blocks compliance scoring language' },
  { re: /\bpunish(ment|ed|ing)?\b/i, reason: 'Blocks punishment framing' },
  { re: /\b(diagnos|therapy session|clinical treatment)\b/i, reason: 'Blocks clinic jargon in kid text' },
];

/** Soft coaching imperatives (count story-wide; budget ≤1). */
const COACHING_RE =
  /\b(try to|you should|make sure (you|to)|remember to|don't forget to|you need to|always look|sit still and)\b/i;

function countCoachingLines(text: string): number {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.filter((s) => COACHING_RE.test(s)).length;
}

function softenCoaching(text: string): string {
  return text
    .replace(/\byou must\b/gi, 'you can')
    .replace(/\byou need to\b/gi, 'you might')
    .replace(/\byou should\b/gi, 'you can')
    .replace(/\btry to\b/gi, 'you might')
    .replace(/\bmake sure (you|to)\b/gi, 'you can')
    .replace(/\bremember to\b/gi, 'you can')
    .replace(/\bdon't forget to\b/gi, 'you can');
}

export function applyJourneySafety(pages: JourneyPage[]): SafetyResult {
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(pages) || pages.length !== 5) {
    return { ok: false, reasons: ['Story must have exactly 5 pages'] };
  }

  const roles = pages.map((p) => p.role);
  for (let i = 0; i < JOURNEY_PAGE_ROLES.length; i++) {
    if (roles[i] !== JOURNEY_PAGE_ROLES[i]) {
      reasons.push(`Page ${i + 1} must be role ${JOURNEY_PAGE_ROLES[i]}`);
    }
  }
  if (reasons.length) return { ok: false, reasons };

  let cleaned: JourneyPage[] = pages.map((p) => ({
    ...p,
    text: (p.text || '').trim(),
    coachingLineCount: 0,
  }));

  for (const page of cleaned) {
    if (!page.text) {
      reasons.push(`Empty text on ${page.role}`);
      continue;
    }
    for (const { re, reason } of BLOCK_PATTERNS) {
      if (re.test(page.text)) {
        // Hard block for trademark / eye contact / quiet hands / unlock / be normal / clinic
        if (
          /social\s*stories/i.test(page.text) ||
          /eye\s*contact|look at .* eyes/i.test(page.text) ||
          /quiet hands/i.test(page.text) ||
          /say it (out loud|to unlock|to continue)/i.test(page.text) ||
          /be normal/i.test(page.text) ||
          /compliance/i.test(page.text)
        ) {
          reasons.push(`${reason} (${page.role})`);
        } else {
          // Auto-soften milder coercives
          page.text = softenCoaching(page.text);
          if (re.test(page.text)) {
            reasons.push(`${reason} (${page.role})`);
          } else {
            warnings.push(`Softened coercive wording on ${page.role}`);
          }
        }
      }
    }
  }

  if (reasons.length) return { ok: false, reasons };

  // Count coaching before soften — budget is ≤1 story-wide
  const coachingBefore = cleaned.reduce((n, p) => n + countCoachingLines(p.text), 0);
  if (coachingBefore > 1) {
    return {
      ok: false,
      reasons: [
        `Too many coaching lines (${coachingBefore}); keep ≤1 gentle coaching line in the whole story`,
      ],
    };
  }

  cleaned = cleaned.map((p) => {
    const text = coachingBefore === 1 ? p.text : softenCoaching(p.text);
    // If exactly one coaching line, keep it; still soften hard coercives already handled above
    return { ...p, text: p.text, coachingLineCount: countCoachingLines(p.text) };
  });

  const conclusion = cleaned.find((p) => p.role === 'conclusion');
  if (conclusion && !/(proud|did it|brave|ok|okay|friend|love|celebrate|glad|safe|can)/i.test(conclusion.text)) {
    warnings.push('Conclusion could celebrate coping more clearly');
  }

  return { ok: true, pages: cleaned, warnings };
}

export function assertRoles(roles: JourneyPageRole[]): boolean {
  return (
    roles.length === 5 &&
    roles.every((r, i) => r === JOURNEY_PAGE_ROLES[i])
  );
}
