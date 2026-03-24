// Social Media Post Generator
// Generates daily social media content using Gemini AI

import { ContentGenerator } from '../core';

const contentGenerator = new ContentGenerator();

export interface SocialPost {
    day: string;
    theme: string;
    caption: string;
    hashtags: string[];
    callToAction: string;
    suggestedTime: string;
}

const DAY_THEMES = [
    { day: "Monday", theme: "Patois Word of the Day", emoji: "🌴" },
    { day: "Tuesday", theme: "Caribbean Parenting Tip", emoji: "💡" },
    { day: "Wednesday", theme: "Printable Preview", emoji: "🎨" },
    { day: "Thursday", theme: "Caribbean Cultural Fact", emoji: "📚" },
    { day: "Friday", theme: "Referral & Contest Push", emoji: "🏆" },
    { day: "Saturday", theme: "Community Story / Testimonial", emoji: "❤️" },
    { day: "Sunday", theme: "Motivation & Heritage Pride", emoji: "✨" },
];

const CORE_HASHTAGS = [
    "#CaribbeanParenting",
    "#IslandKids",
    "#LikkleLegends",
    "#CaribbeanCulture",
    "#DiasporaKids",
    "#CaribbeanHeritage",
];

export async function generateWeeklySocialPosts(): Promise<SocialPost[]> {
    const prompt = `You are a social media content creator for Likkle Legends, a Caribbean children's education platform for ages 4-8.

Generate 7 social media posts (one for each day of the week) following these themes:

${DAY_THEMES.map(d => `- ${d.day} (${d.emoji} ${d.theme})`).join("\n")}

BRAND VOICE:
- Warm, proud, community-focused
- Use Caribbean dialect/Patois naturally (e.g., "de" instead of "the", "wah gwaan")
- Celebrate Caribbean culture, food, music, language
- Speak directly to Caribbean diaspora parents
- Always include a subtle call-to-action

PLATFORM: Instagram / Facebook (write for both)

For EACH post, provide:
1. A caption (150-250 words, engaging, with line breaks for readability)
2. 5-7 relevant hashtags (mix of broad and niche)
3. A clear call-to-action
4. Suggested posting time (EST)

IMPORTANT: Each post MUST include a mention of Likkle Legends or likklelegends.com somewhere naturally.

Format your response as valid JSON array with objects having these fields:
- day (string)
- theme (string)
- caption (string, use \\n for line breaks)
- hashtags (string array)
- callToAction (string)
- suggestedTime (string)`;

    try {
        const result = await contentGenerator.generateText(prompt, {
            temperature: 0.8,
            maxTokens: 4000,
            responseMimeType: 'application/json',
        });

        // Parse the JSON response
        const posts: SocialPost[] = JSON.parse(result);
        return posts;
    } catch (error) {
        console.error('Social post generation failed:', error);
        // Return fallback posts
        return DAY_THEMES.map(d => ({
            day: d.day,
            theme: d.theme,
            caption: `${d.emoji} ${d.theme}\n\nStay tuned for more Caribbean culture content from Likkle Legends!\n\nVisit likklelegends.com to start your child's heritage adventure.`,
            hashtags: CORE_HASHTAGS,
            callToAction: "Visit likklelegends.com",
            suggestedTime: "9:00 AM EST",
        }));
    }
}
