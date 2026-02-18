
import {
    AgentInputPayload,
    AgentOutputPayload,
    CaribbeanKidsStorybook,
    CurriculumPlan,
    CurriculumOutcome,
    GeneratedImage
} from './schemas';
import { curriculumService } from '../../services/curriculum-service';
import { contentGenerator } from '../core';
import { databasePoster } from '../database-poster';
import { CHARACTER_REGISTRY } from '../../registries/characters';
// Real Image Client
import { generateImage } from '../../ai-image-generator/image-client';

export class EducationalContentAgent {

    /**
     * Run the full agent workflow
     */
    async run(payload: AgentInputPayload): Promise<AgentOutputPayload> {
        console.log(`🤖 Agent V3 starting job: ${payload.request_id}`);
        // Metrics tracking
        const startTime = Date.now();
        const context: any = {};

        try {
            // Unpack Profile Data (Assuming V3 payload)
            const age = payload.child_profile.child_age || 5;
            const island = payload.education_context.island;
            const subject = payload.education_context.subject;

            // --- STEP 1: Fetch Curriculum ---
            const step1Start = Date.now();
            console.log('📚 Step 1: Fetching Curriculum...');
            const curriculumItems = await curriculumService.fetchOutcomes(
                island,
                age,
                subject
            );
            context.curriculumItems = curriculumItems;

            // --- STEP 2: Curriculum Planning ---
            console.log('📝 Step 2: Planning Curriculum...');
            const curriculumPlan = await this.stepCurriculumPlanning(payload, curriculumItems);
            context.curriculumPlan = curriculumPlan;

            // --- STEP 3: Story Generation (Simplified) ---
            console.log('📖 Step 3: Generating Story...');
            const storybookRaw = await this.stepStoryGeneration(payload, curriculumPlan);

            // Post-processing to ensure compatibility
            storybookRaw.metadata.version = "2.0.0";

            // Additional post-processing: If title is missing or generic, fix it
            if (!storybookRaw.metadata.title) {
                storybookRaw.metadata.title = `The Adventure in ${island}`;
            }

            context.storybookRaw = storybookRaw;

            // --- STEP 3.5: Validation & Safety ---
            console.log('🛡️ Step 3.5: Validating Content...');

            if (!storybookRaw.pages || storybookRaw.pages.length === 0) {
                throw new Error("Validation Failed: No pages generated");
            }

            const storybook = storybookRaw;
            context.storybook = storybook;

            // --- STEP 4: Style Refinement ---
            console.log('✨ Step 4: Refining Style (Skipped for V1/V2 dev)...');

            // --- STEP 5: Image Generation ---
            console.log('🎨 Step 5: Generating Images...');
            const images = await this.stepImageGeneration(storybook);
            context.images = images;

            // --- STEP 6: Publishing ---
            let pubRecord: any = { published: false };
            if (payload.platform_settings?.auto_publish) {
                console.log('🚀 Step 6: Auto-Publishing...');
                const result = await databasePoster.postCaribbeanStory(storybook, images, payload.user_id);
                pubRecord = {
                    published: result.success,
                    platform_story_id: result.id,
                    visibility: payload.platform_settings.visibility || 'private'
                };
            }

            const endTime = Date.now();
            return {
                request_id: payload.request_id,
                status: 'success',
                storybook: storybook,
                images: images,
                publication_record: pubRecord,
                metrics: {
                    total_latency_ms: endTime - startTime,
                    model_latency_ms: 0,
                    tool_latency_ms: 0
                }
            };

        } catch (error: any) {
            console.error('❌ Agent failed:', error);
            const endTime = Date.now();
            return {
                request_id: payload.request_id,
                status: 'failed',
                errors: [error.message],
                metrics: {
                    total_latency_ms: endTime - startTime
                }
            };
        }
    }

    /**
     * Step 2: Select outcomes and build the plan
     */
    private async stepCurriculumPlanning(payload: AgentInputPayload, items: any[]): Promise<CurriculumPlan> {
        const prompt = `
        You are a Caribbean curriculum planner for ages 3–8.
        
        **TASK:**
        Select 3-6 most appropriate outcomes from the list below for a ${payload.child_profile.child_age}-year-old child learning about "${payload.education_context.subject}" in ${payload.education_context.island}.
        
        **AVAILABLE OUTCOMES:**
        ${JSON.stringify(items, null, 2)}
        
        **CONTEXT:**
        Topic Keywords: ${payload.education_context.topic_keywords?.join(', ') || 'General'}
        Folklore Type: ${payload.creative_context?.folklore_type || 'None'}
        Reading Level: ${payload.child_profile.reading_level || 'age appropriate'}
        `;

        const schema = {
            type: "object",
            properties: {
                island: { type: "string" },
                framework: { type: "string" },
                stage: { type: "string" },
                subject: { type: "string" },
                age: { type: "integer" },
                selected_outcomes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            outcome_id: { type: "string" },
                            outcome_text: { type: "string" }
                        },
                        required: ["outcome_id", "outcome_text"]
                    }
                },
                key_vocabulary: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["island", "subject", "age", "selected_outcomes"]
        };

        return await contentGenerator.generateJSON<CurriculumPlan>(prompt, schema, {
            temperature: 0.2 // Low temp for planning
        });
    }

    /**
     * Step 3: Generate the Story
     */
    private async stepStoryGeneration(payload: AgentInputPayload, plan: CurriculumPlan): Promise<CaribbeanKidsStorybook> {
        // V3 Logic: Use family profile setting or creative override
        const pages = payload.creative_context?.max_pages || payload.family_profile.max_story_length_pages || 8;
        const dialectFlavour = payload.family_profile.language_flavour || 'caribbean_light';

        // Inject Character Descriptions for Consistency
        const characterList = Object.values(CHARACTER_REGISTRY).map(c =>
            `- ${c.display_name} (${c.role_title}): Looks like "${c.image_assets.alt}"`
        ).join('\n');

        const systemInstruction = `You create safe, joyful, Caribbean children's storybooks aligned to a specific CurriculumPlan.
        
        **CRITICAL REQUIREMENT:**
        You MUST use characters from the official "Likkle Legends" cast list below. Do NOT invent new main characters unless they are minor background roles.
        
        **OFFICIAL CAST:**
        ${characterList}
        
        **VISUAL CONSISTENCY:**
        When describing a main character in the 'visual_description' field, create a concise prompt based on their "Looks like" description provided above. This is crucial for the illustrator.

        **GUIDELINES:**
        1. Context: ${payload.education_context.island} setting.
        2. Tone: ${payload.creative_context?.tone || 'Fun'}.
        3. Pedagogy: Weave outcomes into the story naturally.
        4. Language Style: ${this.getDialectInstruction(dialectFlavour)}
        `;

        const prompt = `
        Write a ${pages}-page storybook for a ${payload.child_profile.child_age}-year-old.
        
        **INPUTS:**
        - Child: ${payload.child_profile.child_name}
        - Topic: ${payload.education_context.subject}
        - Plan: ${JSON.stringify(plan).substring(0, 500)}... (truncated for brevity)
        - Interests: ${payload.child_profile.favourite_topics?.join(', ') || 'General Fun'}
        
        **OUTPUT:**
        Return a valid CaribbeanKidsStorybook JSON. Ensure 'visual_description' matches the character definitions.
        `;

        // Simplified Schema: Only essential fields for V2 MVP
        const storySchema = {
            type: "object",
            properties: {
                metadata: { type: "object", properties: { title: { type: "string" }, language: { type: "string" }, age_range: { type: "string" }, target_reading_level: { type: "string" }, estimated_page_count: { type: "number" }, created_at_iso: { type: "string" }, version: { type: "string" } }, required: ["title"] },
                personalization: { type: "object", properties: { island_name: { type: "string" }, school_topic: { type: "string" } }, required: ["island_name"] },
                learning_profile: { type: "object", properties: { core_themes: { type: "array", items: { type: "string" } }, learning_goals: { type: "array", items: { type: "string" } }, key_vocabulary: { type: "array", items: { type: "string" } } } },
                island_context: { type: "object", properties: { island_name: { type: "string" }, setting_description: { type: "string" } } },
                main_characters: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, is_human: { type: "boolean" }, role: { type: "string" }, visual_description: { type: "string" } } } },
                pages: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            page_id: { type: "string" }, // V2
                            page_number: { type: "integer" },
                            story_text: { type: "string" },
                            illustration_prompt: {
                                type: "object",
                                properties: { short_prompt: { type: "string" }, detailed_prompt: { type: "string" }, style: { type: "string" }, safety_and_constraints: { type: "array", items: { type: "string" } } }
                            }
                        }
                    }
                }
            },
            required: ["metadata", "pages", "learning_profile", "island_context"]
        };

        return await contentGenerator.generateJSON<CaribbeanKidsStorybook>(prompt, storySchema, {
            systemInstruction,
            temperature: 0.4 // Lower temp for reliability
        });
    }

    private getDialectInstruction(flavour: string): string {
        switch (flavour) {
            case 'neutral': return "Use Standard English suitable for international readers.";
            case 'creole_sprinkles': return "Use Standard English narrative but include brief, authentic local phrases (e.g. 'Wha gwan', 'Eh eh') in dialogue.";
            case 'caribbean_light':
            default:
                return "Use Standard Caribbean English (with local cadence and vocabulary) but remain fully understandable to non-locals.";
        }
    }

    /**
     * Step 5: Generate Images (REAL)
     */
    private async stepImageGeneration(story: CaribbeanKidsStorybook): Promise<GeneratedImage[]> {
        const generatedImages: GeneratedImage[] = [];

        console.log(`   Generating ${story.pages.length} images...`);

        for (const page of story.pages) {
            // Construct precise prompt with character consistency
            let characterContext = "";
            story.main_characters?.forEach(char => {
                if (page.story_text.includes(char.name) || page.illustration_prompt.detailed_prompt.includes(char.name)) {
                    characterContext += ` (Character: ${char.name}, looks like: ${char.visual_description})`;
                }
            });

            const fullPrompt = `
            ${page.illustration_prompt.detailed_prompt}.
            Style: ${page.illustration_prompt.style}.
            Characters: ${characterContext}.
            Setting: ${story.island_context.setting_description}.
            Mood: Vibrant Caribbean Children's Book Illustration.
            `;

            let imageUrl: string | null = null;

            try {
                // REAL GENERATION
                imageUrl = await generateImage(
                    fullPrompt.trim(),
                    `agent-${story.metadata.title.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}-${page.page_number}`
                );
            } catch (err) {
                console.error(`Failed to generate image for page ${page.page_number}`, err);
            }

            // Fallback if gen failed
            if (!imageUrl) {
                imageUrl = `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800&text=Page${page.page_number}+Failed`;
            }

            generatedImages.push({
                page_id: page.page_id || `page_${page.page_number}`,
                page_number: page.page_number,
                image_id: `img_${Date.now()}_${page.page_number}`,
                image_url: imageUrl,
                provider: imageUrl.includes('unsplash') ? 'fallback-unsplash' : 'gemini-flash-image',
                prompt_used: page.illustration_prompt.short_prompt
            });
        }

        return generatedImages;
    }
}

export const educationalContentAgent = new EducationalContentAgent();
