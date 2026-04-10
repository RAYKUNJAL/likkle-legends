import { NextRequest, NextResponse } from 'next/server';
import { generateAndSavePost, BlogGenerationRequest } from '@/lib/services/blog-agent';
import { logActivity, startRun, completeRun, failRun } from '@/lib/agent-os/db';

// High-value SEO topics for Caribbean parenting / kids education
const AUTO_TOPICS: { topic: string; category: BlogGenerationRequest['category']; keywords: string[] }[] = [
  { topic: 'How to raise bilingual Caribbean children in the diaspora', category: 'parenting', keywords: ['bilingual children', 'Caribbean diaspora parenting', 'raise bilingual kids'] },
  { topic: 'Top 10 Caribbean folk songs every child should know', category: 'culture', keywords: ['Caribbean folk songs for kids', 'island nursery rhymes', 'Caribbean children music'] },
  { topic: 'Teaching Caribbean history to children ages 4-8', category: 'education', keywords: ['teach Caribbean history kids', 'Caribbean education children', 'island history for kids'] },
  { topic: 'Why Caribbean cultural identity matters for diaspora children', category: 'parenting', keywords: ['Caribbean cultural identity', 'diaspora children identity', 'Caribbean heritage kids'] },
  { topic: 'Easy Trinidadian recipes to cook with your kids', category: 'recipes', keywords: ['Trinidad recipes kids', 'Caribbean cooking children', 'roti recipe kids'] },
  { topic: 'Anansi the Spider: Teaching Caribbean folklore to young children', category: 'stories', keywords: ['Anansi stories kids', 'Caribbean folklore children', 'spider trickster stories'] },
  { topic: 'Caribbean Carnival explained for children', category: 'culture', keywords: ['Carnival for kids', 'Trinidad Carnival children', 'Caribbean festival education'] },
  { topic: 'Jamaican Patois phrases your child will love', category: 'patois', keywords: ['Jamaican Patois for kids', 'Patois phrases children', 'learn Patois kids'] },
  { topic: 'Benefits of Caribbean storytelling for child development', category: 'education', keywords: ['Caribbean storytelling benefits', 'oral tradition child development', 'island stories learning'] },
  { topic: 'Screen time that actually teaches Caribbean culture', category: 'parenting', keywords: ['Caribbean educational apps', 'cultural screen time kids', 'Caribbean learning platform'] },
  { topic: 'How to celebrate Caribbean holidays abroad with your family', category: 'culture', keywords: ['Caribbean holidays abroad', 'diaspora family traditions', 'celebrate island culture diaspora'] },
  { topic: 'Caribbean STEM: Teaching science through island nature', category: 'education', keywords: ['Caribbean STEM kids', 'island nature science children', 'Caribbean science activities'] },
];

export async function POST(request: NextRequest) {
  const runId = request.headers.get('x-run-id') || '';
  const triggeredBy = request.headers.get('x-triggered-by') || 'manual';

  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    
    // If topic provided, use it. Otherwise auto-select based on day of year for rotation
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const autoTopic = AUTO_TOPICS[dayOfYear % AUTO_TOPICS.length];

    const topic     = (body.topic     as string) || autoTopic.topic;
    const category  = (body.category  as BlogGenerationRequest['category']) || autoTopic.category;
    const keywords  = (body.keywords  as string[]) || autoTopic.keywords;
    const autoPublish = (body.autoPublish as boolean) || false;

    const post = await generateAndSavePost({
      topic,
      category,
      targetKeywords: keywords,
      tone: 'educational',
      targetAudience: 'parents',
      wordCount: 1200,
    }, { autoPublish });

    await logActivity({
      agent_key: 'blog-agent',
      task_type: 'blog_generation',
      subject: post.title,
      action_summary: `Blog post "${post.title}" ${autoPublish ? 'published' : 'drafted'} successfully (${post.read_time_minutes} min read)`,
      outcome: 'success',
      severity: 'info',
      requires_attention: false,
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: null,
      meta: {
        title: post.title,
        slug: post.slug,
        category,
        topic,
        status: post.status,
        read_time: post.read_time_minutes,
        triggered_by: triggeredBy,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        excerpt: post.excerpt,
        read_time_minutes: post.read_time_minutes,
        url: `/blog/${post.slug}`,
      },
      topic_used: topic,
      category_used: category,
      auto_selected: !body.topic,
      message: autoPublish ? `Published: "${post.title}"` : `Draft ready: "${post.title}"`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    await logActivity({
      agent_key: 'blog-agent',
      task_type: 'blog_generation',
      subject: 'auto-topic',
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
