/**
 * Island Helpers — central copy strings (Cut 1 + Cut 2).
 * Kid chrome stays adventure language. Parent ethics live here.
 */

export const IH_PRODUCT_NAME = 'Island Helpers';

export const IH_HOME_SUBTITLE =
  'Adventure supports for how your likkle one communicates and reads.';

export const IH_SAY_A_PHRASE = 'Say a phrase';

export const IH_MIX_A_PHRASE = 'Mix a phrase';

export const IH_KID_DRAWER_LABEL = 'Helpers';

export const IH_OPEN_IN_BOOK = 'Open in a book';

export const IH_MY_PHRASES = 'My Phrases';

export const IH_CALM_MODE = 'Calm Mode';

export const IH_FIRST_THEN = 'First → Then';

export const IH_JOURNEY_STORIES = 'Journey Stories';

export const IH_JOURNEY_CTA = 'Create a Journey Story';

export const IH_JOURNEY_PUBLISH_CONFIRM =
  'Only after Publish will this appear in your likkle one’s library.';

export const IH_DISPLAY_MODE_LABELS = {
  images: 'Images Only',
  text_images: 'Text + Images',
  text: 'Text Only',
} as const;

/** Parent-only ethics. Must include “not a medical device”. No Social Stories™. */
export const IH_ETHICS_DISCLAIMER = [
  'Island Helpers are educational and communication play supports — not a medical device.',
  'They are not therapy, not a diagnostic tool, and not a replacement for speech-language pathology or AAC specialist care.',
  'Scripts and AAC-style phrases are valid communication. We do not score children for “compliance.”',
  'Use what helps your family. Skip what does not.',
].join(' ');

/** Extra parent line for Journey Stories edit gate. */
export const IH_JOURNEY_ETHICS_EXTRA =
  'Journey Stories are educational play supports. Parent review is required before a child sees AI-written pages. They are not a medical device.';

/** Forbidden substrings in kid-facing Island Helpers chrome (case-insensitive). */
export const IH_KID_FORBIDDEN = [
  'therapy',
  'spectrum',
  'diagnosis',
  'autism treatment',
  'compliance',
  'eye contact',
  'look at me',
  'say it to unlock',
  'quiet hands',
  'Social Stories',
  'Social Stories™',
] as const;
