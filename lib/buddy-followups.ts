import type { CharacterId } from '@/lib/characterConfig';

export type BuddyFollowUp = {
  label: string;
  text: string;
};

const CHARACTER_FOLLOWUPS: Record<CharacterId, BuddyFollowUp[]> = {
  roti: [
    { label: 'Quiz me', text: 'Give me another Caribbean math question.' },
    { label: 'Break it down', text: 'Explain that again in smaller steps.' },
    { label: 'Island fact', text: 'Tell me a science fact from the islands.' },
    { label: 'Riddle', text: 'Give me a kid-safe riddle.' },
  ],
  tanty_spice: [
    { label: 'Story please', text: 'Tell me a short island story about that.' },
    { label: 'Proverb', text: 'Share a Caribbean proverb and what it means.' },
    { label: 'Food tale', text: 'Tell me about a Caribbean food from that.' },
    { label: 'Family', text: 'Why do families cook and share together?' },
  ],
  dilly_doubles: [
    { label: 'Challenge', text: 'Give me a fun 20-second challenge.' },
    { label: 'Play again', text: 'Ask me another quick quiz question.' },
    { label: 'Street fact', text: 'Tell me a Trinidad street-food fact.' },
    { label: 'Cheer me', text: 'Cheer me on and give me a new dare.' },
  ],
  mango_moko: [
    { label: 'Grow it', text: 'How do we grow that in a garden?' },
    { label: 'Nature', text: 'Tell me about a Caribbean plant or animal.' },
    { label: 'Kindness', text: 'How can I help a friend today?' },
    { label: 'Outside', text: 'Give me a safe outdoor island activity.' },
  ],
  scorcha_pepper: [
    { label: 'Spell it', text: 'Quiz me on a Caribbean word to spell.' },
    { label: 'Brave', text: 'Tell me a short story about being brave.' },
    { label: 'Hot fact', text: 'Give me a fiery island fact.' },
    { label: 'Stand up', text: 'How do I stand up for a friend kindly?' },
  ],
};

const TOPIC_FOLLOWUPS: Array<{ match: RegExp; followUps: BuddyFollowUp[] }> = [
  {
    match: /\b(math|add|subtract|count|number|plus|minus)\b/i,
    followUps: [
      { label: 'Another sum', text: 'Give me one more math question.' },
      { label: 'Easier', text: 'Make the next math question a little easier.' },
    ],
  },
  {
    match: /\b(story|anansi|folklore|tale|legend)\b/i,
    followUps: [
      { label: 'Keep going', text: 'What happens next in that story?' },
      { label: 'New story', text: 'Tell me a different short island story.' },
    ],
  },
  {
    match: /\b(song|music|steelpan|soca|reggae|calypso|drum)\b/i,
    followUps: [
      { label: 'Beat it', text: 'Teach me a simple island rhythm I can clap.' },
      { label: 'Music fact', text: 'Tell me one more Caribbean music fact.' },
    ],
  },
  {
    match: /\b(island|jamaica|trinidad|barbados|guyana|caribbean|flag)\b/i,
    followUps: [
      { label: 'Another island', text: 'Tell me about a different Caribbean island.' },
      { label: 'Flag quiz', text: 'Quiz me on a Caribbean flag.' },
    ],
  },
];

export function buildBuddyFollowUps(
  characterId: CharacterId,
  lastReply: string,
  lastUserMessage = ''
): BuddyFollowUp[] {
  const bank = CHARACTER_FOLLOWUPS[characterId] || CHARACTER_FOLLOWUPS.dilly_doubles;
  const haystack = `${lastReply} ${lastUserMessage}`;
  const topical = TOPIC_FOLLOWUPS.filter((entry) => entry.match.test(haystack))
    .flatMap((entry) => entry.followUps)
    .slice(0, 2);

  const unique = new Map<string, BuddyFollowUp>();
  for (const item of [...topical, ...bank]) {
    if (!unique.has(item.text)) unique.set(item.text, item);
  }

  return Array.from(unique.values()).slice(0, 3);
}
