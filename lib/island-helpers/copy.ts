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


export const IH_PARENT_GUIDE_TITLE = 'For parents & guardians';

export const IH_START_HERE = 'Start here';

export const IH_PARENT_GUIDE_ANCHOR = 'ih-parent-guide';

/** Warm parent explainer — 8th-grade reading level, adventure language (not clinic-speak). */
export const IH_PARENT_GUIDE = {
  intro:
    'Island Helpers are little adventure tools that sit beside our stories and characters. They help your likkle one share words, feel steady, and get ready for new places — in a joyful Caribbean way.',
  whatThisIsTitle: 'What this is',
  whatThisIs: [
    'A home for calm settings, talk cards with friends like Tanty Spice and Steelpan Sam, simple First → Then plans, and (when you are ready) Journey Stories you write and check first.',
    'It is play and reading support for your family — not a clinic, not a test, and not a scoreboard.',
  ],
  howHelpsTitle: 'How it helps your child',
  howHelps: [
    'Some children learn language in whole phrases. Our cards speak full lines they can tap and hear.',
    'Big captions with Tanty’s warm voice help kids who love reading along.',
    'Calm Mode softens motion and surprise sound when the day feels loud.',
    'You stay in charge. Skip anything that does not fit your child.',
  ],
  setupTitle: 'How to set it up (start here)',
  setupSteps: [
    'Turn on Calm Mode if your child prefers quieter screens.',
    'Pick Images, Text + Images, or Text Only under Parent tools — whatever matches how your child likes to look at words.',
    'Open “Talk with friends,” tap a few phrases together, and model without pressure. No need to make them repeat.',
    'Try First → Then for a simple plan (first story, then snack).',
    'Open a library book and look for Island Helpers in the reader backpack — captions and talk tools stay close while you read.',
  ],
  toolsTitle: 'What each tool does',
  tools: [
    { name: 'Calm Mode', blurb: 'Softer colors, less motion, and no surprise read-aloud. Great for busy days.' },
    { name: 'Talk with friends', blurb: 'Character soundboards. Tap a card to hear a full phrase. Mix a phrase lets you fill in blanks like “I want to ___.”' },
    { name: 'My Phrases', blurb: 'Add your family’s own lines — Caribbean English welcome.' },
    { name: 'First → Then', blurb: 'A simple visual plan: what comes first, what comes next. No timers that punish.' },
    { name: 'Reading with Tanty', blurb: 'In storybooks, large captions can follow the warm narration. Helpers stay one tap away in the backpack.' },
    { name: 'Journey Stories', blurb: 'Parent-made 5-page adventure storybooks for new places (dentist, loud fête, airplane, and more). You edit and Publish before your child sees them. Literal words uses short, direct sentences.' },
  ],
  journeyBlurb:
    'Journey Stories help you preview a new routine with Likkle friends. You write or generate pages, fix the words, add pictures, then Publish — only then does the book show up in the kids library. Choose Literal words when your child reads exact words best: short, direct sentences, with feelings named plainly.',
} as const;

/** Parent wizard labels for Journey Stories reading style. Not shown as a diagnosis. */
export const IH_JOURNEY_LANGUAGE_STANDARD = 'Standard words — warm story sentences.';

export const IH_JOURNEY_LANGUAGE_LITERAL =
  'Literal words — short, direct sentences for kids who read exact words best.';

export const IH_JOURNEY_LANGUAGE_HELP =
  'Literal words skip sayings, jokes that mean something else, and questions that are not real questions. Feelings are named plainly, like “my tummy feels tight.”';

export const IH_JOURNEY_ART_NOTE =
  'Pictures use calm island colors, a simple background, and no words in the art.';

export const IH_JOURNEY_ART_QUEUED = 'Pictures are being made, one page at a time.';

export const IH_JOURNEY_ART_CALM =
  'Pictures are resting for now. You can still read the words.';

export const IH_JOURNEY_ART_SIMPLE = 'Use simple pictures';

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
