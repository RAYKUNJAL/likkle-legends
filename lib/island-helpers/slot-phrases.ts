/**
 * Island Helpers — phrase slot-fill (GLP mitigation lite).
 */
import type { IslandHelpersCharacterId } from './types';

export type SlotTemplate = {
  id: string;
  characterId: IslandHelpersCharacterId;
  pattern: string; // e.g. "I want to ___."
  slots: { id: string; label: string }[];
  fringeOptions: { id: string; text: string }[];
};

export function fillTemplate(template: SlotTemplate, choices: Record<string, string>): string {
  let out = template.pattern;
  for (const slot of template.slots) {
    const value = (choices[slot.id] || '').trim();
    // Replace first ___ (or {slotId}) occurrence
    if (out.includes(`{${slot.id}}`)) {
      out = out.replace(`{${slot.id}}`, value || '…');
    } else {
      out = out.replace('___', value || '…');
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Default path is full-phrase fill — never single-word-only mode. */
export function isPhraseFirstDefault(): boolean {
  return true;
}
