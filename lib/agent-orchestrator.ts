
import { GoogleGenerativeAI, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import {
    ContentRequest,
    GeneratedContent,
    ContentType,
    QualityGateReport
} from "./types";
import { ISLAND_REGISTRY, getIslandContext } from "./registries/islands";
import { CHARACTER_REGISTRY, getCharacterContext } from "./registries/characters";
import { PROMPT_TEMPLATES, getPromptForTemplate } from "./prompt-templates";
import { runQualityGates, isContentSafe } from "./quality-gates";
import { saveGeneratedContent } from "./content-store";
// import { v4 as uuidv4 } from 'uuid'; // Removed to avoid type issues

// Fallback for UUID if needed
function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const SAFETY_SETTINGS: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

export class IslandBrainOrchestrator {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // COMMERCIAL UPGRADE: Switched to Gemini 2.0 Flash for production
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash", // UPGRADED from 1.5
            safetySettings: SAFETY_SETTINGS,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
    }

    /**
     * Orchestrates the generation of content based on a structured request.
     */
    async generateContent(request: ContentRequest): Promise<GeneratedContent> {
        console.log(`[IslandBrain] Received request: ${request.content_type} for ${request.island_id}`);

        // 1. Validate Request & Retrieve Context
        const island = ISLAND_REGISTRY[request.island_id];
        if (!island) throw new Error(`Island ID '${request.island_id}' not found.`);

        const hostId = request.host_character_id || "roti"; // Default to ROTI
        const hostChar = CHARACTER_REGISTRY[hostId];
        if (!hostChar) throw new Error(`Character ID '${hostId}' not found.`);

        // 2. Build Context String (The "RAG" simulation)
        // In a real RAG, we would query embeddings here.
        // For MVP, we construct context from our rich registries.
        const contextParts = [
            `FAMILY CONTEXT: Child Age ${request.constraints?.child_age || "5"}.`,
            getIslandContext(island.id), // Using ID directly
            getCharacterContext(hostId),
            `TOPIC: ${request.topic || "General Learning"}`,
            `DIALECT LEVEL: ${request.constraints?.dialect_level || "light"}`,
            `CULTURAL DENSITY: ${request.constraints?.cultural_density || "medium"}`
        ];

        // 3. Select Template
        // Map ContentType to Template ID
        const templateMap: Record<ContentType, keyof typeof PROMPT_TEMPLATES | undefined> = {
            "song_video_script": "song_video_script_v1",
            "story_bedtime": "story_bedtime_v1",
            "lesson_micro": "lesson_micro_v1",
            "monthly_drop_bundle": "monthly_drop_bundle_v1",
            // Fallbacks or TODOs
            "song_lyrics": "song_video_script_v1", // distinct template needed eventually
            "story_short": "story_bedtime_v1", // reuse for now
            "quiz_micro": "lesson_micro_v1",
            "printable_cards_text": undefined
        };

        const templateId = templateMap[request.content_type];
        if (!templateId) {
            throw new Error(`Template not implemented for content type: ${request.content_type}`);
        }

        // 4. Construct Prompt
        const fullPrompt = getPromptForTemplate(templateId, contextParts.join("\n\n"));

        // 5. Generate with AI
        let payload: any = {};
        try {
            const result = await this.model.generateContent(fullPrompt);
            const responseText = result.response.text();
            payload = JSON.parse(responseText);
        } catch (error: any) {
            console.error("[IslandBrain] AI Generation Failed:", error);

            // Fallback for Demo/Test if API fails (e.g. 404 on model)
            if (error.message.includes("404") || error.message.includes("fetch failed")) {
                console.warn("[IslandBrain] API Error detected. Using MOCK fallback for demonstration.");
                payload = this.getMockPayload(request.content_type);
            } else {
                throw new Error("AI Generation failed to produce valid JSON.");
            }
        }

        // 6. Run Quality Gates
        const contentId = generateId();
        const generatedContent: GeneratedContent = {
            content_id: contentId,
            family_id: request.family_id,
            island_id: request.island_id,
            content_type: request.content_type,
            title: payload.title || "Untitled Generation",
            payload: payload,
            parent_note: payload.parent_note,
            metadata: {
                ...payload.metadata,
                generated_at: new Date().toISOString()
            },
            admin_status: 'pending'
        };

        const qaReport = runQualityGates(generatedContent, request);
        generatedContent.qa_report = qaReport;

        // 7. Enforce Safety
        if (!isContentSafe(qaReport)) {
            console.warn(`[IslandBrain] Content ${contentId} failed safety checks:`, qaReport.reasons);
            // In Parent Mode, we might return it with a flag. In Kid Mode, we must refuse.
            if (request.mode === 'kid_mode') {
                throw new Error("Content generation failed safety gates. Please try a different topic.");
            }
        }

        // 8. Persist to Content Store
        await saveGeneratedContent(generatedContent);

        return generatedContent;
    }

    private getMockPayload(contentType: ContentType): any {
        if (contentType === 'song_video_script') {
            return {
                title: "Mock: The Doubles Song",
                hook: "Doubles hot, doubles sweet!",
                lyrics: {
                    verse_1: "In the morning sun, we waiting in line / For the channa and bara that tastes so fine.",
                    chorus: "Doubles, doubles, sweet and spicy treat / Best ting in Trinidad to eat!",
                    verse_2: "Pepper sauce slight, or plenty if you bold / Eating by the roadside, never gets old.",
                    chorus_repeat: "Doubles, doubles, sweet and spicy treat / Best ting in Trinidad to eat!",
                    outro: "Likkle more! See you next time!"
                },
                visual_storyboard: [
                    { scene: 1, duration_seconds: 5, visual: "Sun rising over clear blue water", on_screen_text: "Good Morning Trinidad!" }
                ],
                parent_note: {
                    why_it_helps: "Teaches rhythm and cultural food appreciation.",
                    offline_followup: "Try making pretend doubles with playdough!",
                    what_to_say_after: "What toppings would you put on your doubles?"
                },
                metadata: {
                    age_range: "5-7",
                    island: "Trinidad and Tobago",
                    dialect_level: "light",
                    host_character: "dilly_doubles",
                    topics: ["Food", "Culture"]
                }
            };
        }
        return {
            title: "Mock Content Generated",
            payload: { text: "This is a fallback content because the AI key is restricted." },
            metadata: { text: "Mock" },
            parent_note: { why_it_helps: "Mock explanation" }
        };
    }
}
