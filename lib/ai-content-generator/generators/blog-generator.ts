
import { contentGenerator } from '../core';

export interface BlogMetadata {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    author: string;
    readTime: number;
    seo: {
        title: string;
        description: string;
        keywords: string[];
    };
}

export interface GeneratedBlogPost {
    metadata: BlogMetadata;
    content: string; // HTML body
}

export class BlogGenerator {

    async generatePost(topic: string): Promise<GeneratedBlogPost> {
        console.log(`📝 Generating blog post on: "${topic}"...`);

        const prompt = `
        You are an expert Caribbean parenting blogger and SEO specialist for "Likkle Legends".
        Write a high-quality, engaging blog post about: "${topic}".

        Target Audience: Caribbean diaspora parents, multicultural families, homeschoolers.
        Tone: Warm, encouraging, culturally rich (use light Patois/Dialect nuances like "likkle", "big up", "fete"), educational.

        Structure:
        1. Catchy Title (H1)
        2. Engaging Introduction (hook the reader)
        3. 3-5 Main Sections with H2 headers
        4. Practical Tips / Activity lists (bullet points)
        5. Conclusion with specific Call to Action (CTA) to join Likkle Legends Mail Club.

        Output Format: JSON with the following structure:
        {
            "metadata": {
                "title": "SEO Optimized Title",
                "slug": "seo-friendly-slug",
                "excerpt": "Compelling 2-sentence summary for previews.",
                "category": "Parenting | Culture | Education | News",
                "author": "Tanty Spice",
                "readTime": 5,
                "seo": {
                    "title": "Meta Title (under 60 chars)",
                    "description": "Meta Description (under 160 chars)",
                    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
                }
            },
            "content": "HTML string of the full article body (start with H2, do NOT include H1 title here). Use semantic HTML: <p>, <h2>, <ul>, <li>, <strong>, <em>."
        }
        `;

        // Use contentGenerator instance directly
        const response = await contentGenerator.generateText(prompt, { temperature: 0.7 });

        try {
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            // Find JSON start/end if there is extra text
            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');
            const jsonStr = (firstBrace !== -1 && lastBrace !== -1)
                ? cleanJson.substring(firstBrace, lastBrace + 1)
                : cleanJson;

            const post = JSON.parse(jsonStr) as GeneratedBlogPost;
            return post;
        } catch (e) {
            console.error("Failed to parse blog post JSON:", e);
            throw new Error("Blog generation failed");
        }
    }

    async generateBatch(count: number = 3): Promise<GeneratedBlogPost[]> {
        const topics = [
            "Why Cultural Representation Matters for Kids",
            "5 Fun Caribbean Games to Play at Home",
            "Teaching Emotional Literacy Through Folklore",
            "Traditional Island Recipes for Picky Eaters",
            "How to Celebrate Carnival with Kids in the Winter",
            "The Magic of Anansi Stories: Lessons in Wit and Wisdom"
        ];

        const selectedTopics = topics.sort(() => 0.5 - Math.random()).slice(0, count);
        const posts: GeneratedBlogPost[] = [];

        for (const topic of selectedTopics) {
            posts.push(await this.generatePost(topic));
        }

        return posts;
    }
}

export const blogGenerator = new BlogGenerator();
