
import { IslandBrainOrchestrator } from "../lib/agent-orchestrator";
import { ContentRequest } from "../lib/types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found in .env.local");
    process.exit(1);
}

async function runTest() {
    console.log("🏝️  Starting IslandBrain Test...");

    const orchestrator = new IslandBrainOrchestrator(apiKey!);

    const request: ContentRequest = {
        family_id: "test-family-123",
        island_id: "TT", // Trinidad and Tobago
        mode: "parent_mode",
        content_type: "song_video_script",
        topic: "Making Doubles",
        host_character_id: "dilly_doubles",
        constraints: {
            child_age: 6,
            cultural_density: "medium",
            dialect_level: "light"
        }
    };

    try {
        console.log(`📤 Sending Request: ${request.content_type} about ${request.topic}...`);
        const result = await orchestrator.generateContent(request);

        console.log("\n✅ Generation Success!");
        console.log("-----------------------------------------");
        console.log(`Title: ${result.title}`);
        console.log(`Content ID: ${result.content_id}`);
        console.log(`Safety Passed: ${result.qa_report?.safety_passed}`);
        console.log("-----------------------------------------");
        console.log("Payload Preview:", JSON.stringify(result.payload, null, 2).substring(0, 500) + "...");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

runTest();
