import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';
import { logActivity } from '@/lib/agent-os/db';

const SEO_TOPICS = [
  { topic: 'How to raise bilingual Caribbean children in the diaspora', category: 'parenting', keywords: ['bilingual Caribbean children', 'diaspora parenting', 'raise bilingual kids'] },
  { topic: 'Top 10 Caribbean folk songs every child should know', category: 'culture', keywords: ['Caribbean folk songs for kids', 'island nursery rhymes', 'Caribbean children music'] },
  { topic: 'Teaching Caribbean history to children ages 4-8', category: 'education', keywords: ['teach Caribbean history kids', 'Caribbean education children', 'island history for kids'] },
  { topic: 'Why Caribbean cultural identity matters for diaspora children', category: 'parenting', keywords: ['Caribbean cultural identity', 'diaspora children identity', 'Caribbean heritage kids'] },
  { topic: 'Anansi the Spider: Teaching Caribbean folklore to young children', category: 'culture', keywords: ['Anansi stories kids', 'Caribbean folklore children', 'spider trickster stories'] },
  { topic: 'Caribbean Carnival explained for children', category: 'culture', keywords: ['Carnival for kids', 'Trinidad Carnival children', 'Caribbean festival education'] },
  { topic: 'Jamaican Patois phrases your child will love', category: 'patois', keywords: ['Jamaican Patois for kids', 'Patois phrases children', 'learn Patois kids'] },
  { topic: 'Screen time that actually teaches Caribbean culture', category: 'parenting', keywords: ['Caribbean educational apps', 'cultural screen time kids', 'Caribbean learning platform'] },
  { topic: 'Easy Trinidadian recipes to cook with your kids', category: 'recipes', keywords: ['Trinidad recipes kids', 'Caribbean cooking children', 'roti recipe kids'] },
  { topic: 'Steel pan music history for Caribbean kids', category: 'culture', keywords: ['steel pan history children', 'Caribbean music kids', 'Trinidad steelpan'] },
  { topic: 'How to celebrate Caribbean holidays abroad with your family', category: 'culture', keywords: ['Caribbean holidays abroad', 'diaspora family traditions', 'celebrate island culture diaspora'] },
  { topic: 'Caribbean STEM: Teaching science through island nature', category: 'education', keywords: ['Caribbean STEM kids', 'island nature science children', 'Caribbean science activities'] },
];

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`);
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
}

export async function POST(request: NextRequest) {
  const runId = request.headers.get('x-run-id') || '';
  const triggeredBy = request.headers.get('x-triggered-by') || 'manual';

  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;

    // Auto-select topic if none provided
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const autoTopic = SEO_TOPICS[dayOfYear % SEO_TOPICS.length];
    const topic    = (body.topic    as string) || autoTopic.topic;
    const category = (body.category as string) || autoTopic.category;
    const keywords = (body.keywords as string[]) || autoTopic.keywords;
    const autoPublish = (body.autoPublish as boolean) || false;

    const prompt = `You are an expert SEO content writer for Likkle Legends, a Caribbean children's education platform for ages 4-8 in the diaspora.

Write a complete 1200-word SEO-optimized blog post about: "${topic}"

Target keywords: ${keywords.join(', ')}
Category: ${category}

Brand voice: Warm, proud Caribbean identity. Like a friendly Caribbean auntie. Educational but fun. Include 1-2 Patois phrases with gentle explanations.

Requirements:
- Compelling H1 title with primary keyword naturally included
- 6 H2 subheadings covering the topic comprehensively
- 3-4 actionable takeaways parents can use today
- Mention Likkle Legends naturally 2-3 times (not spammy), with URL likklelegends.com
- End with a warm CTA to try Likkle Legends
- SEO meta description (max 160 chars)
- 5 relevant tags

Return ONLY valid JSON, no markdown fences:
{
  "title": "...",
  "meta_description": "...",
  "content": "...full HTML content with proper tags...",
  "excerpt": "...2-3 sentence teaser...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "read_time_minutes": 5
}`;

    const rawJson = await callGemini(prompt);
    const post = JSON.parse(rawJson) as {
      title: string; meta_description: string; content: string;
      excerpt: string; tags: string[]; read_time_minutes: number;
    };

    // Save to blog_posts table
    const admin = createAdminClient();
    const slug = `${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`;

    const { data: savedPost, error: saveError } = await admin
      .from('blog_posts')
      .insert({
        title: post.title,
        slug,
        content: post.content,
        excerpt: post.excerpt,
        meta_description: post.meta_description,
        status: autoPublish ? 'published' : 'draft',
        read_time_minutes: post.read_time_minutes || 5,
        author_name: 'Likkle Legends Team',
        tags: post.tags,
        published_at: autoPublish ? new Date().toISOString() : null,
      })
      .select('id, slug, title, status')
      .single();

    await logActivity({
      agent_key: 'blog-agent',
      task_type: 'blog_generation',
      subject: post.title,
      action_summary: `Blog post "${post.title}" ${autoPublish ? 'published' : 'drafted'} (${post.read_time_minutes} min read) — Category: ${category}`,
      outcome: 'success',
      severity: 'info',
      requires_attention: false,
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: null,
      meta: { title: post.title, category, keywords, slug, triggered_by: triggeredBy },
    });

    return NextResponse.json({
      success: true,
      topic_used: topic,
      category,
      auto_selected: !body.topic,
      post: {
        id: savedPost?.id,
        title: post.title,
        slug: savedPost?.slug || slug,
        status: autoPublish ? 'published' : 'draft',
        excerpt: post.excerpt,
        meta_description: post.meta_description,
        tags: post.tags,
        read_time_minutes: post.read_time_minutes,
        url: `/blog/${savedPost?.slug || slug}`,
      },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    await logActivity({
      agent_key: 'blog-agent',
      task_type: 'blog_generation',
      subject: 'auto',
      action_summary: `Blog generation failed: ${msg}`,
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
