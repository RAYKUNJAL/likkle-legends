// AI Blog Agent - Generates SEO-optimized educational content
// Uses Gemini to create Caribbean kids education articles

import { createPostAdmin as createPost, generateSlug, calculateReadTime, BlogPost } from './blog';
import { generateImage } from '../ai-image-generator/image-client';

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

const CATEGORY_MAP: Record<string, string> = {
    culture: '28feadc5-5ec1-4171-9cfb-4e64e9a7e7ba',
    parenting: 'b38012b5-b72c-48f6-87ca-cd6b198c4789',
    education: '395df621-35fc-4bad-95f2-65bcb5de6f0d',
    activities: '395df621-35fc-4bad-95f2-65bcb5de6f0d',
    recipes: '28feadc5-5ec1-4171-9cfb-4e64e9a7e7ba',
    stories: '28feadc5-5ec1-4171-9cfb-4e64e9a7e7ba',
    patois: '28feadc5-5ec1-4171-9cfb-4e64e9a7e7ba'
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
    // SECURITY: API Key should NEVER use NEXT_PUBLIC_ prefix
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
        throw new Error('Missing Gemini/Google AI API Key (check GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY)');
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
        'gemini-2.0-flash',
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
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
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

    // Generate Featured Image
    console.log(`🎨 [Blog Agent] Generating featured image for: ${content.title}`);
    let featuredImageUrl = null;
    try {
        featuredImageUrl = await generateImage(
            `Professional blog header image for an article titled "${content.title}". Caribbean theme, vibrant colors, educational and child-friendly.`,
            `blog-${content.slug}`
        );
    } catch (err) {
        console.warn(`⚠️ Failed to generate image for blog: ${content.title}`, err);
    }

    const post = await createPost({
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt,
        content: content.content,
        featured_image_url: featuredImageUrl,
        meta_description: content.meta_description,
        keywords: content.keywords,
        tags: content.tags,
        category: CATEGORY_MAP[request.category] || request.category,
        read_time_minutes: content.read_time_minutes,
        author_name: options.authorName || 'Likkle Legends Team',
        ai_generated: true,
        ai_prompt: request.topic,
        ai_model: 'gemini-2.0-flash',
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

    // Culture (extended — SEO targeted)
    { topic: 'Caribbean Independence Day Celebrations: What Your Kids Need to Know', category: 'culture', tone: 'educational', targetKeywords: ['Caribbean Independence Day', 'Caribbean culture for kids', 'Caribbean heritage'] },
    { topic: 'Jonkonnu: The Ancient Jamaican Festival Your Children Should Experience', category: 'culture', tone: 'fun', targetKeywords: ['Jonkonnu festival', 'Jamaican traditions for kids', 'Caribbean festivals'] },
    { topic: 'Crop Over Festival: A Family Guide to Barbados\' Biggest Celebration', category: 'culture', tone: 'fun', targetKeywords: ['Crop Over festival', 'Barbados culture', 'Caribbean festivals for families'] },
    { topic: 'What is Emancipation Day? Explaining Caribbean Freedom to Children', category: 'culture', tone: 'inspiring', targetKeywords: ['Emancipation Day Caribbean', 'Caribbean Black history for kids', 'Caribbean heritage'] },
    { topic: 'Caribbean Music Your Kids Will Love: From Soca to Steelpan', category: 'culture', tone: 'fun', targetKeywords: ['Caribbean music for kids', 'soca for children', 'steelpan music'] },
    { topic: 'African Roots of Caribbean Culture: A Family Heritage Guide', category: 'culture', tone: 'educational', targetKeywords: ['African Caribbean heritage', 'Caribbean history for kids', 'diaspora identity'] },

    // Parenting (extended — SEO targeted)
    { topic: 'When Your Child Asks "Why Are We Different?": Caribbean Identity Conversations', category: 'parenting', tone: 'practical', targetKeywords: ['Caribbean diaspora parenting', 'raising bilingual Caribbean children', 'cultural identity kids'] },
    { topic: 'Building a Caribbean Village When You Live Far from Home', category: 'parenting', tone: 'inspiring', targetKeywords: ['Caribbean community abroad', 'diaspora parenting tips', 'Caribbean family abroad'] },
    { topic: 'Caribbean Grandparents and Long-Distance Bonds: Tips for Staying Connected', category: 'parenting', tone: 'practical', targetKeywords: ['Caribbean grandparents', 'long distance family Caribbean', 'diaspora family bonds'] },
    { topic: 'Caribbean Parenting Values That Transcend Geography', category: 'parenting', tone: 'inspiring', targetKeywords: ['Caribbean parenting values', 'Caribbean family values', 'raising Caribbean children'] },
    { topic: 'How to Find Caribbean Community in Your City', category: 'parenting', tone: 'practical', targetKeywords: ['Caribbean community diaspora', 'Caribbean parents abroad', 'Caribbean cultural groups'] },
    { topic: 'Why Caribbean Storytelling Is Your Child\'s Greatest Superpower', category: 'parenting', tone: 'inspiring', targetKeywords: ['Caribbean storytelling for kids', 'oral tradition Caribbean', 'Caribbean folklore children'] },

    // Education (extended — SEO targeted)
    { topic: 'The Haitian Revolution: The Most Important Caribbean Story for Kids', category: 'education', tone: 'inspiring', targetKeywords: ['Haitian Revolution for kids', 'Caribbean Black history', 'Haiti history children'] },
    { topic: 'Nanny of the Maroons: Jamaica\'s Warrior Queen Your Child Should Know', category: 'education', tone: 'inspiring', targetKeywords: ['Nanny of the Maroons', 'Jamaican history for kids', 'Caribbean women history'] },
    { topic: 'Caribbean Women Who Changed History: Role Models for Girls', category: 'education', tone: 'inspiring', targetKeywords: ['Caribbean women history', 'Caribbean female role models', 'Black women Caribbean history'] },
    { topic: 'Caribbean STEM Heroes: Scientists and Innovators from the Islands', category: 'education', tone: 'inspiring', targetKeywords: ['Caribbean STEM role models', 'Caribbean scientists for kids', 'Black scientists Caribbean'] },
    { topic: 'Marcus Garvey\'s Lessons Every Caribbean Child Should Learn', category: 'education', tone: 'educational', targetKeywords: ['Marcus Garvey for kids', 'Caribbean Black history', 'Pan-Africanism children'] },
    { topic: 'Caribbean Children\'s Books: 20 Must-Reads That Celebrate Our Heritage', category: 'education', tone: 'practical', targetKeywords: ['Caribbean children\'s books', 'Caribbean literature for kids', 'diverse children\'s books Caribbean'] },

    // Activities (extended — SEO targeted)
    { topic: 'How to Host a Caribbean Cultural Night at Home', category: 'activities', tone: 'practical', targetKeywords: ['Caribbean culture at home', 'Caribbean family activities', 'Caribbean kids activities'] },
    { topic: 'Steelpan Music for Kids: How to Start Playing at Home', category: 'activities', tone: 'practical', targetKeywords: ['steelpan lessons for kids', 'Caribbean music activities', 'steelpan for children'] },
    { topic: 'Cricket for Kids: A Guide for Caribbean Families', category: 'activities', tone: 'fun', targetKeywords: ['cricket Caribbean kids', 'Caribbean sports for children', 'teaching kids cricket'] },
    { topic: 'Caribbean Heritage Box: 10 Things to Put in Your Child\'s Cultural Chest', category: 'activities', tone: 'practical', targetKeywords: ['Caribbean heritage box', 'Caribbean cultural gifts for kids', 'Caribbean memory box'] },

    // Recipes (extended — SEO targeted)
    { topic: 'Jamaican Rice and Peas: The Classic Family Recipe Made Easy', category: 'recipes', tone: 'practical', targetKeywords: ['Jamaican rice and peas recipe', 'Caribbean rice recipe kids', 'Jamaican cooking for families'] },
    { topic: 'Trinidad Doubles Recipe: Introducing Street Food to Your Kids at Home', category: 'recipes', tone: 'fun', targetKeywords: ['Trinidad doubles recipe', 'Trinidadian food for kids', 'Caribbean street food recipe'] },
    { topic: 'Bajan Macaroni Pie: The Caribbean Mac and Cheese Your Kids Will Love', category: 'recipes', tone: 'fun', targetKeywords: ['Bajan macaroni pie recipe', 'Barbados food for kids', 'Caribbean mac and cheese'] },
    { topic: 'Simple Trinidadian Pelau: One-Pot Caribbean Cooking with Kids', category: 'recipes', tone: 'practical', targetKeywords: ['pelau recipe Trinidad', 'Caribbean one-pot meals', 'cooking with kids Caribbean'] },
    { topic: 'How to Make Jamaican Festival (Fried Dumplings) with Your Little Ones', category: 'recipes', tone: 'fun', targetKeywords: ['Jamaican festival dumplings recipe', 'Jamaican cooking with kids', 'Caribbean fried dumplings'] },

    // Stories (extended — SEO targeted)
    { topic: 'La Diablesse: The Caribbean Shape-Shifter Legend Retold for Children', category: 'stories', tone: 'fun', targetKeywords: ['Caribbean folklore stories', 'La Diablesse legend', 'Trinidad folklore for kids'] },
    { topic: 'Brer Rabbit and the Tar Baby: Caribbean Trickster Tales for Children', category: 'stories', tone: 'fun', targetKeywords: ['Brer Rabbit Caribbean', 'Caribbean trickster stories', 'Caribbean folklore for kids'] },
    { topic: 'The Duppy Stories of Jamaica: Kid-Friendly Ghost Tales', category: 'stories', tone: 'fun', targetKeywords: ['Jamaican duppy stories', 'Caribbean ghost stories for kids', 'Jamaican folklore children'] },

    // Patois (extended — SEO targeted)
    { topic: 'Trinidadian Creole Phrases to Teach Your Children', category: 'patois', tone: 'fun', targetKeywords: ['Trinidadian creole for kids', 'Trinidad language for children', 'Caribbean creole phrases'] },
    { topic: 'Bajan Dialect: Fun Barbadian Words to Learn With Your Family', category: 'patois', tone: 'fun', targetKeywords: ['Bajan dialect for kids', 'Barbados dialect words', 'Caribbean dialect children'] },
    { topic: 'Simple Haitian Creole Phrases to Start Teaching Your Kids Today', category: 'patois', tone: 'practical', targetKeywords: ['Haitian Creole for kids', 'Creole for children', 'Haitian language learning'] },
    { topic: 'How to Keep Your Caribbean Language Alive When Living Abroad', category: 'patois', tone: 'practical', targetKeywords: ['Caribbean language at home', 'raising bilingual Caribbean children', 'Caribbean dialect preservation'] },
];
