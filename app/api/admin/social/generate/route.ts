import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/agent-os/db';

const DAYS = [
  { day: 'Monday',    theme: 'Patois Word of the Day',        emoji: '🌴' },
  { day: 'Tuesday',   theme: 'Caribbean Parenting Tip',       emoji: '💡' },
  { day: 'Wednesday', theme: 'Character Spotlight',           emoji: '🌟' },
  { day: 'Thursday',  theme: 'Caribbean Cultural Fact',       emoji: '📚' },
  { day: 'Friday',    theme: 'Free Trial / Referral Push',    emoji: '🏆' },
  { day: 'Saturday',  theme: 'Community Story / Testimonial', emoji: '❤️' },
  { day: 'Sunday',    theme: 'Heritage Pride & Motivation',   emoji: '✨' },
];

const HASHTAGS = [
  '#CaribbeanParenting', '#IslandKids', '#LikkleLegends',
  '#CaribbeanCulture', '#DiasporaKids', '#CaribbeanHeritage',
  '#BlackParenting', '#IslandLife', '#CaribbeanMom', '#CaribbeanDad',
];

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

export async function POST(request: NextRequest) {
  const runId = request.headers.get('x-run-id') || '';
  const triggeredBy = request.headers.get('x-triggered-by') || 'manual';

  try {
    const prompt = `You are a top-tier social media content creator for Likkle Legends — a Caribbean children's education platform for ages 4-8 in the Caribbean diaspora.

Generate 7 social media posts for Instagram and Facebook, one per day, following this schedule:
${DAYS.map(d => `- ${d.day}: ${d.emoji} "${d.theme}"`).join('\n')}

BRAND DETAILS:
- Platform: likklelegends.com
- Characters: R.O.T.I. (AI learning robot), Tanty Spice (Caribbean grandmother), Dilly Doubles (fun twin storytellers), Mango Moko (fruit spirit), Steelpan Sam (music master), Scorcha (fire dancer)
- Offer: $10 Legend Intro Pass — first physical mail kit + full digital access
- Target: Caribbean diaspora parents (ages 25-44) in USA, UK, Canada, and Caribbean
- CTA: Always drive to likklelegends.com or the $10 Intro offer

VOICE: Warm, proud, island-accented. Use Patois/Creole naturally (e.g. "wah gwaan", "big up", "likkle", "ting"). Celebrate ALL Caribbean islands — TT, Jamaica, Barbados, Guyana, St. Lucia, etc.

EACH POST MUST HAVE:
- A compelling hook opening line (first 1-2 lines before "more")
- 150-220 word caption with line breaks for readability
- Mention Likkle Legends or likklelegends.com naturally
- 6-8 hashtags (mix of broad and niche)
- Clear call to action
- Suggested post time EST

Return ONLY valid JSON array, no markdown:
[
  {
    "day": "Monday",
    "theme": "Patois Word of the Day",
    "emoji": "🌴",
    "caption": "...",
    "hashtags": ["#CaribbeanParenting", ...],
    "callToAction": "...",
    "suggestedTime": "9:00 AM EST"
  },
  ...
]`;

    const rawJson = await generateWithGemini(prompt);
    
    // Clean up any markdown code fences if present
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const posts = JSON.parse(cleaned);

    await logActivity({
      agent_key: 'social-agent',
      task_type: 'social_post_generation',
      subject: 'Weekly social calendar',
      action_summary: `Generated ${posts.length} social posts for the week (Mon–Sun) using Gemini`,
      outcome: 'success',
      severity: 'info',
      requires_attention: false,
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: null,
      meta: { post_count: posts.length, days: posts.map((p: { day: string }) => p.day), triggered_by: triggeredBy },
    });

    return NextResponse.json({ posts, success: true, generated_by: 'gemini-2.0-flash' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    
    await logActivity({
      agent_key: 'social-agent',
      task_type: 'social_post_generation',
      subject: 'Weekly social calendar',
      action_summary: `Social generation failed: ${msg}`,
      outcome: 'error',
      severity: 'error',
      requires_attention: true,
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: null,
      meta: { error: msg },
    }).catch(() => {});

    return NextResponse.json({ error: msg, success: false }, { status: 500 });
  }
}
