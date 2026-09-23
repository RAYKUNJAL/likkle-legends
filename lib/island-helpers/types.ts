/**
 * Island Helpers — shared types (Cut 1).
 * Product name is Island Helpers; internal research label “Journey Tools” stays out of kid UI.
 */

export type DisplayMode = 'images' | 'text_images' | 'text';

export type IslandHelpersPrefs = {
  calmMode: boolean;
  displayMode: DisplayMode;
  /** false when calmMode true */
  readAloudDefault: boolean;
  updatedAt: string; // ISO
};

export const DEFAULT_ISLAND_HELPERS_PREFS: IslandHelpersPrefs = {
  calmMode: false,
  displayMode: 'text_images',
  readAloudDefault: true,
  updatedAt: '',
};

export type IslandHelpersCharacterId =
  | 'tanty_spice'
  | 'steelpan_sam'
  | 'mango_moko'
  | 'roti'
  | 'dilly_doubles';

export const ISLAND_HELPERS_CHARACTER_IDS: IslandHelpersCharacterId[] = [
  'tanty_spice',
  'steelpan_sam',
  'mango_moko',
  'roti',
  'dilly_doubles',
];

export const PREFS_STORAGE_KEY = 'likkle.islandHelpers.prefs.v1';
export const PHRASES_STORAGE_KEY = 'likkle.islandHelpers.phrases.v1';
export const PREFS_EVENT = 'likkle:island-helpers-prefs';
export const PHRASES_EVENT = 'likkle:island-helpers-phrases';
