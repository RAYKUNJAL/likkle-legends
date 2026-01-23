// AI Blog Agent - Generates SEO-optimized educational content
// Uses Gemini to create Caribbean kids education articles

import { createPost, generateSlug, calculateReadTime, BlogPost } from './blog';

export interface BlogGenerationRequest {
    topic: string;
    category: 'culture' | 'parenting' | 'education' | 'activities' | 'recipes' | 'stories' | 'patois';
    targetKeywords?: string[];
    tone?: 'educational' | 'fun' | 'inspiring' | 'practical';
    targetAudience?: 'parents' | 'kids' | 'both';
    wordCount?: number;
}

export interface GeneratedBlogContent {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_description: string;
    keywords: string[];
    tags: string[];
    read_time_minutes: number;
}

const CATEGORY_CONTEXT: Record<string, string> = {
    culture: 'Caribbean cultural traditions, festivals, history, and heritage for children and families',
    parenting: 'Raising Caribbean children abroad, diaspora parenting tips, cultural identity, and family traditions',
    education: 'Educational resources, learning activities, and academic content for Caribbean kids',
    activities: 'Fun crafts, games, hands-on learning projects, and creative activities with Caribbean themes',
    recipes: 'Kid-friendly Caribbean recipes, cooking with children, traditional dishes made easy',
    stories: 'Caribbean folklore, Anansi stories, bedtime tales, legends, and heritage narratives',
    patois: 'Jamaican Patois vocabulary, phrases for kids, language learning, and cultural linguistics'
};

const BLOG_SYSTEM_PROMPT = `You are an expert content writer for Likkle Legends, a Caribbean kids education platform. 
Your goal is to create engaging, SEO-optimized blog articles that:

1. EDUCATE parents and children about Caribbean culture and heritage
2. Are WARM, AUTHENTIC, and reflect Caribbean voice and values
3. Include relevant KEYWORDS naturally for SEO
4. Are ACTIONABLE with practical tips or takeaways
5. Are appropriate for FAMILY audiences
6. Occasionally include Jamaican Patois phrases with translations
7. Reference Caribbean islands, traditions, and cultural elements

Brand Voice:
- Warm and welcoming, like a friendly Caribbean auntie
- Educational but fun, not preachy
- Celebrates Caribbean heritage with pride
- Uses occasional Patois phrases (with explanations)
- Inclusive of all Caribbean islands and cultures

SEO Guidelines:
- Title should be compelling and include primary keyword
- Use H2 and H3 headings to structure content
- Include the focus keyword in first 100 words
- Use bullet points and numbered lists where appropriate
- Write a meta description under 160 characters
- Suggest 5-7 relevant tags`;

export async function generateBlogPost(request: BlogGenerationRequest): Promise<GeneratedBlogContent> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
    if (!apiKey) {
        throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
    }

    const categoryContext = CATEGORY_CONTEXT[request.category] || CATEGORY_CONTEXT.culture;
    const wordTarget = request.wordCount || 1200;

    const prompt = `${BLOG_SYSTEM_PROMPT}

TASK: Write a complete blog article about: "${request.topic}"

CATEGORY: ${request.category} (${categoryContext})
TONE: ${request.tone || 'educational'}
TARGET AUDIENCE: ${request.targetAudience || 'parents'}
TARGET WORD COUNT: ${wordTarget} words
${request.targetKeywords?.length ? `TARGET KEYWORDS: ${request.targetKeywords.join(', ')}` : ''}

Please generate the article in the following JSON format:
{
    "title": "Compelling SEO title (50-60 characters ideal)",
    "excerpt": "Engaging summary that hooks readers (150-200 characters)",
    "content": "Full article in HTML format with <h2>, <h3>, <p>, <ul>, <li> tags. Make it comprehensive and valuable.",
    "meta_description": "SEO meta description (under 160 characters)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

IMPORTANT:
- Content should be in valid HTML
- Include practical examples and actionable advice
- Add a brief call-to-action mentioning Likkle Legends at the end
- Make it genuinely helpful and shareable`;

    // List of models to try in order of preference
    const models = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ];

    let lastError: any = null;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}...`);

            // Use v1 for gemini-pro, v1beta for others
            const version = model === 'gemini-pro' ? 'v1' : 'v1beta';
            const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
                cache: 'no-store' // Critical for Next.js to avoid caching errors
            });

            if (!response.ok) {
                // If 404, continue to next model. If 403 or others, might be key issue but we keep trying.
                const errText = await response.text();
                throw new Error(`Google AI API Error (${response.status}): ${errText}`);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('Empty response from AI or invalid format');
            }

            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('AI Response was not valid JSON:', responseText);
                throw new Error('Failed to parse AI response as JSON');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            return {
                title: parsed.title,
                slug: generateSlug(parsed.title),
                excerpt: parsed.excerpt,
                content: parsed.content,
                meta_description: parsed.meta_description,
                keywords: parsed.keywords || [],
                tags: parsed.tags || [],
                read_time_minutes: calculateReadTime(parsed.content)
            };

        } catch (error: any) {
            console.warn(`Model ${model} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }

    // If all failed
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// Generate and save a blog post (auto-publish or draft)
export async function generateAndSavePost(
    request: BlogGenerationRequest,
    options: { autoPublish?: boolean; authorName?: string } = {}
): Promise<BlogPost> {
    const content = await generateBlogPost(request);

    const post = await createPost({
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        content: content.content,
        meta_description: content.meta_description,
        keywords: content.keywords,
        tags: content.tags,
        category: request.category,
        read_time_minutes: content.read_time_minutes,
        author_name: options.authorName || 'Likkle Legends Team',
        ai_generated: true,
        ai_prompt: request.topic,
        ai_model: 'gemini-1.5-flash-001',
        status: options.autoPublish ? 'published' : 'draft',
        published_at: options.autoPublish ? new Date().toISOString() : null
    });

    return post;
}

// Batch generate multiple posts
export async function batchGeneratePosts(
    topics: BlogGenerationRequest[],
    options: { autoPublish?: boolean; delayMs?: number } = {}
): Promise<BlogPost[]> {
    const posts: BlogPost[] = [];

    for (const topic of topics) {
        try {
            const post = await generateAndSavePost(topic, options);
            posts.push(post);

            // Rate limiting delay
            if (options.delayMs) {
                await new Promise(resolve => setTimeout(resolve, options.delayMs));
            }
        } catch (error) {
            console.error(`Failed to generate post for topic: ${topic.topic}`, error);
            // Continue with other topics
        }
    }

    return posts;
}

// Pre-defined content ideas for each category
export const CONTENT_IDEAS: BlogGenerationRequest[] = [
    // Culture
    { topic: '10 Jamaican Folk Tales Every Child Should Know', category: 'culture', tone: 'fun' },
    { topic: 'Celebrating Carnival: A Guide for Caribbean Families', category: 'culture', tone: 'fun' },
    { topic: 'The History of Reggae Music for Kids', category: 'culture', tone: 'educational' },
    { topic: 'Traditional Caribbean Games Children Still Love Today', category: 'culture', tone: 'fun' },

    // Parenting
    { topic: 'Raising Proud Caribbean Kids in the Diaspora', category: 'parenting', tone: 'inspiring' },
    { topic: 'How to Teach Your Children About Their Caribbean Heritage', category: 'parenting', tone: 'practical' },
    { topic: 'Creating Caribbean Traditions in Your Home Abroad', category: 'parenting', tone: 'practical' },

    // Education
    { topic: 'Caribbean History Facts Every Child Should Learn', category: 'education', tone: 'educational' },
    { topic: 'Famous Caribbean Scientists and Inventors', category: 'education', tone: 'inspiring' },
    { topic: 'Geography of the Caribbean: Islands to Explore', category: 'education', tone: 'educational' },

    // Activities
    { topic: '15 Caribbean Craft Ideas for Rainy Days', category: 'activities', tone: 'fun' },
    { topic: 'DIY Caribbean Carnival Costume for Kids', category: 'activities', tone: 'practical' },
    { topic: 'Caribbean-Themed Birthday Party Ideas', category: 'activities', tone: 'fun' },

    // Recipes
    { topic: 'Kid-Friendly Jamaican Patty Recipe', category: 'recipes', tone: 'practical' },
    { topic: 'Making Sorrel Drink with Your Children', category: 'recipes', tone: 'fun' },
    { topic: 'Easy Caribbean Breakfast Ideas for Busy Mornings', category: 'recipes', tone: 'practical' },

    // Stories
    { topic: 'The Legend of Anansi the Spider: A Retelling for Kids', category: 'stories', tone: 'fun' },
    { topic: 'Caribbean Bedtime Stories: The Rolling Calf', category: 'stories', tone: 'fun' },
    { topic: 'How the Hummingbird Got Its Colors: A Caribbean Tale', category: 'stories', tone: 'fun' },

    // Patois
    { topic: '20 Easy Jamaican Patois Words to Teach Your Kids', category: 'patois', tone: 'educational' },
    { topic: 'Patois Phrases for Everyday Family Moments', category: 'patois', tone: 'practical' },
    { topic: 'Caribbean Greetings Your Children Should Know', category: 'patois', tone: 'fun' },
];
