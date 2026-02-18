
import { generateCulturalStory } from '../lib/story-engine';
import { config } from 'dotenv';
config();

async function testStoryEngine() {
    console.log("🧪 Testing Story Engine (generateCulturalStory)...");

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
        console.error("❌ No API Key found in env!");
        return;
    }

    const inputs = {
        childName: "Kai",
        island: "Trinidad",
        level: "early",
        tradition: "Anansi and the Pot of Wisdom"
    };

    try {
        console.log("   Sending request to Google Gemini...");
        const start = Date.now();
        const story = await generateCulturalStory(inputs);
        const duration = (Date.now() - start) / 1000;

        if (!story) {
            console.error("❌ Story generation returned null. Check API quotas or safety settings.");
            return;
        }

        console.log(`✅ Story Generated in ${duration}s`);
        console.log("   Raw Story Object:", JSON.stringify(story, null, 2));

        if (!story.book_meta) {
            console.error("❌ story.book_meta is undefined!");
            return;
        }

        console.log(`   Title: ${story.book_meta.title}`);
        console.log(`   Pages: ${story.structure.pages.length}`);
    } catch (error) {
        console.error("❌ Test Failed with Exception:", error);
    }
}

testStoryEngine();
