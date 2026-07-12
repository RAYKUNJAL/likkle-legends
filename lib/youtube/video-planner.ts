import { YOUTUBE_ASSETS } from './video-types';
import type { LikkleVideoPlan } from './video-types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VIDEO_MODEL = process.env.GEMINI_VIDEO_MODEL || 'gemini-2.0-flash';

type PlanInput = {
  island?: string;
  ageBand?: '3-5' | '6-7' | '8-9';
  topic?: string;
  musicAssetId?: string;
};

const fallbackTopics = [
  { island: 'Trinidad and Tobago', topic: 'drinking water after playing mas', musicAssetId: 'drinking-water' },
  { island: 'Jamaica', topic: 'counting fruit at the market', musicAssetId: 'saving-money' },
  { island: 'Barbados', topic: 'sea turtles and beach cleanup', musicAssetId: 'drinking-water' },
  { island: 'Guyana', topic: 'rainforest animals and colors', musicAssetId: 'saving-money' },
];

function fallbackPlan(input: PlanInput = {}): LikkleVideoPlan {
  const seed = fallbackTopics[Math.floor(Date.now() / 1000) % fallbackTopics.length];
  const island = input.island || seed.island;
  const topic = input.topic || seed.topic;
  const musicAssetId = input.musicAssetId || seed.musicAssetId;
  const ageBand = input.ageBand || '3-5';
  const id = `ll-${Date.now()}`;

  return {
    id,
    title: `${island} Kids: ${topic}`,
    island,
    ageBand,
    learningGoal: `Children ages ${ageBand} learn one healthy habit or island fact through a short Caribbean call-and-response video.`,
    hook: `Likkle Legends, can you spot this ${island} clue?`,
    musicAssetId,
    characterAssetIds: ['likkle-legends-group', 'tanty-spice', 'doubles-character'],
    scenes: [
      {
        title: 'Hook',
        narration: `Come quick, Likkle Legends! Today we are learning about ${topic}.`,
        caption: 'Come quick, Likkle Legends!',
        visualPrompt: `Bright Caribbean beach classroom in ${island}, preschool-safe, colorful, joyful, original characters only.`,
        characterAssetIds: ['likkle-legends-group'],
        durationSeconds: 8,
      },
      {
        title: 'Learn',
        narration: `Say it with Tanty: we care for our bodies, our island, and each other.`,
        caption: 'Care for body, island, and family.',
        visualPrompt: `Tanty Spice teaching a simple ${topic} lesson with warm Caribbean colors.`,
        characterAssetIds: ['tanty-spice'],
        durationSeconds: 12,
      },
      {
        title: 'Repeat',
        narration: `Your turn! Clap two times and tell the family what you learned.`,
        caption: 'Clap, repeat, remember.',
        visualPrompt: `Doubles character and kids clapping along, no real child likenesses, animated storybook style.`,
        characterAssetIds: ['doubles-character'],
        durationSeconds: 10,
      },
    ],
    youtube: {
      title: `${island} Kids Learn: ${topic} | Likkle Legends`,
      description: `A short Caribbean educational video for diaspora families. Learn with Likkle Legends, then continue the adventure at www.likklelegends.com.`,
      tags: ['Caribbean kids', 'kids education', island, 'nursery rhyme', 'Likkle Legends'],
      madeForKids: true,
      privacyStatus: 'private',
    },
    safety: {
      coppaSafe: true,
      noPersonalData: true,
      noRealChildVoiceClone: true,
      needsHumanApproval: true,
    },
    distribution: {
      primaryChannel: 'youtube',
      crossPostChannels: ['instagram', 'facebook', 'tiktok'],
      parentSafeCta: 'Grown-ups, continue the Caribbean learning adventure at LikkleLegends.com.',
      childSafeCta: 'Subscribe for more Likkle Legends island learning.',
    },
  };
}

export async function createVideoPlan(input: PlanInput = {}): Promise<LikkleVideoPlan> {
  if (!GEMINI_API_KEY) return fallbackPlan(input);

  const assetSummary = YOUTUBE_ASSETS.map((asset) => `${asset.id}: ${asset.label} (${asset.type}, ${asset.rights})`).join('\n');
  const prompt = `Create one 30-45 second YouTube Shorts plan for Likkle Legends, a Caribbean kids education platform for ages 3-9.

Rules:
- Use only original Likkle Legends characters from this asset list.
- The video must be COPPA-safe, made for kids, no personal data, no real child voice cloning.
- CTAs must be parent-safe and must not ask children to share personal info, comment personal details, or leave YouTube without a grown-up.
- Output strict JSON only. No markdown.
- Use title, island, ageBand, learningGoal, hook, musicAssetId, characterAssetIds, scenes, youtube, safety, distribution.
- Each scene needs title, narration, caption, visualPrompt, characterAssetIds, durationSeconds.
- Keep language warm, Caribbean, simple, and school-safe.

Requested island: ${input.island || 'choose a Caribbean island'}
Requested ageBand: ${input.ageBand || 'choose 3-5, 6-7, or 8-9'}
Requested topic: ${input.topic || 'choose a trending kids learning topic, nursery rhyme, food, animal, festival, language, or healthy habit'}
Preferred musicAssetId: ${input.musicAssetId || 'choose from owned music if relevant'}

Assets:
${assetSummary}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_VIDEO_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2400 },
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Gemini video plan failed');

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const json = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(json);
    const fallback = fallbackPlan(input);
    return { ...fallback, ...parsed, safety: { ...fallback.safety, ...parsed.safety } };
  } catch (error) {
    console.error('Video planner fallback:', error);
    return fallbackPlan(input);
  }
}
