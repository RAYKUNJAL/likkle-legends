/**
 * Free printable Journey Story pack — sample stories for the email-gated lead magnet.
 * Public product name: Journey Stories. Do not use trademarked social-routine product names.
 * Line-art placeholders until branded Journey art clears HOLD.
 */

export type JourneyPackPage = {
  role: 'title' | 'intro' | 'body_sensory' | 'body_coping' | 'conclusion';
  text: string;
};

export type JourneyPackStory = {
  id: string;
  title: string;
  theme: string;
  ageBandHint: string;
  pages: JourneyPackPage[];
};

export const JOURNEY_PACK_LEAD_MAGNET_ID = 'journey-story-pack';
export const JOURNEY_PACK_SLUG = 'journey-pack';
export const JOURNEY_PACK_LOCAL_PDF = '/printables/free-journey-pack.pdf';
export const JOURNEY_PACK_PRINT_HTML = '/printables/free-journey-pack.html';

export const JOURNEY_PACK_AGE_BANDS = [
  { value: '3-5', label: 'Ages 3–5 (adult reads)' },
  { value: '6-9', label: 'Ages 6–9 (shared reading)' },
  { value: 'mixed', label: 'Mixed ages / whole family' },
  { value: 'skip', label: 'Prefer not to say' },
] as const;

/** Three sample Journey Stories — Caribbean everyday routines, special-needs friendly. */
export const JOURNEY_PACK_STORIES: JourneyPackStory[] = [
  {
    id: 'new_food',
    title: 'R.O.T.I. Tries Something New',
    theme: 'Trying a new food · island kitchen',
    ageBandHint: '3–9',
    pages: [
      { role: 'title', text: 'R.O.T.I. Tries Something New' },
      {
        role: 'intro',
        text: 'R.O.T.I. sits at the table with Tanty Spice. A new plate is waiting. The food smells warm and spicy.',
      },
      {
        role: 'body_sensory',
        text: 'The plate is close. Steam rises. The food looks orange and soft. R.O.T.I. can look first. Looking is enough.',
      },
      {
        role: 'body_coping',
        text: 'R.O.T.I. can smell the food. R.O.T.I. can touch it with a spoon. R.O.T.I. can take a tiny taste, or put the spoon down. Choosing is okay.',
      },
      {
        role: 'conclusion',
        text: 'R.O.T.I. tried something new in a small way. Tanty Spice is proud. Trying at your own pace is brave.',
      },
    ],
  },
  {
    id: 'loud_fete',
    title: 'Steelpan Sam at the Loud Fête',
    theme: 'Loud sounds · carnival / fête energy',
    ageBandHint: '3–9',
    pages: [
      { role: 'title', text: 'Steelpan Sam at the Loud Fête' },
      {
        role: 'intro',
        text: 'Steelpan Sam and Mango Moko walk toward the fête. Music is playing. People are smiling and moving.',
      },
      {
        role: 'body_sensory',
        text: 'The steelpan rings bright and loud. Drums boom. Voices cheer. The ground feels busy under their feet.',
      },
      {
        role: 'body_coping',
        text: 'Sam can put on soft headphones. Sam can step to a quieter corner. Sam can watch from the edge. Taking a break is okay.',
      },
      {
        role: 'conclusion',
        text: 'Sam enjoyed the fête in a way that felt safe. Loud joy can share space with quiet moments. Sam did it.',
      },
    ],
  },
  {
    id: 'haircut',
    title: 'Tanty and the Haircut Day',
    theme: 'Haircut · salon / barber chair',
    ageBandHint: '3–9',
    pages: [
      { role: 'title', text: 'Tanty and the Haircut Day' },
      {
        role: 'intro',
        text: 'Today is haircut day. Tanty Spice walks with a friend to the chair. The mirror is shiny. The cape is soft.',
      },
      {
        role: 'body_sensory',
        text: 'The cape rests on shoulders. Scissors make a snip-snip sound. A spray bottle mists cool water. The chair can spin a little.',
      },
      {
        role: 'body_coping',
        text: 'You can hold a comfort item. You can ask for a break. You can look at a picture while the clippers buzz, or wait until they stop.',
      },
      {
        role: 'conclusion',
        text: 'The haircut is done. The mirror shows a fresh look. You were calm and brave. Hair grows back. You are still you.',
      },
    ],
  },
];
