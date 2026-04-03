import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CHARACTER_CREATIVES, AD_COPY_TEMPLATES } from '@/lib/meta-ads';

const BRAND_CONTEXT = `
Likkle Legends is a Caribbean-focused AI educational platform for children ages 3-10.
Characters: R.O.T.I (AI learning buddy), Tanty Spice (Caribbean grandmother/storyteller),
Dilly Doubles (joy/music specialist), Mango Moko (culture/stilt-walking guide), Steelpan Sam (music master).
Products: Stories, games, music (Likkle Legends Radio), printables, physical mail kits.
Entry offer: $10 "Legend Intro Pass" — first physical mail kit + full portal access.
Target: Caribbean diaspora parents (25-44) in Miami, NYC, Newark, Hartford, Atlanta, Houston.
Core message: "Give your child their digital passport to the islands."
Tone: Warm, celebratory, proud Caribbean identity. Fun for kids, trusted by parents.
Differentiator: ONLY Caribbean cultural learning platform for kids. Personalized by heritage island.
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { stage = 'tofu', character = 'tanty_spice', count = 4 } = body;

  const charData = CHARACTER_CREATIVES.find(c => c.id === character) || CHARACTER_CREATIVES[0];
  const stageMap: Record<string, string> = {
    tofu: 'cold traffic (parents who never heard of us)',
    mofu: 'warm traffic (visited but did not sign up)',
    bofu: 'hot traffic (started checkout but did not complete)',
  };

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a world-class Meta/Facebook ads copywriter specializing in edtech and cultural products.
Write ad copy that converts Caribbean diaspora parents. Be specific, emotional, and culturally resonant.
Use island-specific references, heritage pride, child growth, FOMO of missing cultural roots.
${BRAND_CONTEXT}`,
        },
        {
          role: 'user',
          content: `Write ${count} high-converting Meta ad variations featuring: ${charData.name}.
Character hook: "${charData.hook}"
Audience stage: ${stageMap[stage] || stageMap.tofu}

For each variation:
- headline (max 40 chars)
- primary_text (max 125 chars)
- description (max 30 chars)
- cta: one of LEARN_MORE, SIGN_UP, GET_OFFER, SHOP_NOW
- emotional_hook (one word: trust/joy/pride/curiosity/urgency)

Respond as JSON: {"variants": [{headline, primary_text, description, cta, emotional_hook}]}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({
      character: charData,
      stage,
      variants: parsed.variants || [],
      imageUrl: `/games/images/${charData.imageFile}`,
    });
  } catch {
    // Fallback to templates
    const templates = AD_COPY_TEMPLATES[stage as keyof typeof AD_COPY_TEMPLATES] || AD_COPY_TEMPLATES.tofu;
    return NextResponse.json({
      character: charData,
      stage,
      variants: templates.headlines.slice(0, count).map((h, i) => ({
        headline: h,
        primary_text: templates.descriptions[i % templates.descriptions.length],
        description: charData.hook.slice(0, 30),
        cta: templates.ctas[0],
        emotional_hook: charData.targetEmotion,
      })),
      imageUrl: `/games/images/${charData.imageFile}`,
      fallback: true,
    });
  }
}
