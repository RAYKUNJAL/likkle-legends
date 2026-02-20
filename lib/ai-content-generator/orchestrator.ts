
import { geminiProvider, ModelTier } from './provider-wrapper';
import { supabase } from '../supabase-client';
import { AnansiProfile, MemoryFact, MemorySummary } from '../types/anansi';

export class AnansiCoreOrchestrator {
    private name = "AnansiCoreOrchestrator";

    /**
     * The main interactive entry point
     */
    async processRequest(userId: string, userRequest: string) {
        // 1. Load Context (Profile + Memory)
        const context = await this.loadUserContext(userId);

        // 2. Route Intent (Tier 0)
        const intent = await this.routeIntent(userRequest, context);
        console.log(`🕷️ Anansi routed intent: ${intent.intent}`);

        // 3. Dispatch Subagents based on intent
        let response: any;
        if (intent.intent === 'chat') {
            response = await this.handleChat(userId, userRequest, context);
        } else {
            // Placeholder for other intents (worksheet, story, etc.)
            response = { text: "I'm still learning how to do that! Let's chat instead." };
        }

        // 4. Update Memory (Tier 0 - Background)
        // We don't await this to keep response time low
        this.updateMemory(userId, userRequest, response.text).catch(console.error);

        // 5. Log Usage
        this.logUsage(userId, intent.recommended_tier, 0, 0); // Tokens est. later

        return response;
    }

    private async loadUserContext(userId: string) {
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

        // Auto-create profile for development if missing
        if (!profile) {
            console.log(`🆕 Creating development profile for ${userId}`);
            const { data: newProfile } = await supabase.from('profiles').insert({
                id: userId,
                child_name: "Explorer",
                island_id: "JM",
                character_preference: "R.O.T.I."
            }).select().single();
            profile = newProfile;
        }

        const { data: facts } = await supabase.from('agent_memory_facts').select('*').eq('user_id', userId);
        const { data: summary } = await supabase.from('agent_memory_summaries').select('*').eq('user_id', userId).single();

        return {
            profile: profile as AnansiProfile,
            facts: facts as MemoryFact[],
            summary: summary as MemorySummary
        };
    }

    private async routeIntent(request: string, context: any) {
        const prompt = `
            User Request: "${request}"
            Analyze the intent, age band, and subject.
            Output JSON only.
        `;
        const system = `You are the RequestRouterAgent for Likkle Legends. Analyze the incoming user request.`;

        return await geminiProvider.executeTiered<any>('tier_0_low_cost', prompt, system);
    }

    private async handleChat(userId: string, request: string, context: any) {
        // Build Persona and include Memory
        const factsLine = context.facts.map((f: any) => `${f.fact_key}=${f.fact_value}`).join('; ');
        const rollingSummary = context.summary?.summary || "No previous history.";

        const system = `
            You are ${context.profile?.character_preference || 'R.O.T.I.'}, an AI companion for a child named ${context.profile?.child_name || 'Friend'} from ${context.profile?.island_id || 'the Caribbean'}.
            
            MEMORY FACTS: ${factsLine}
            HISTORY SUMMARY: ${rollingSummary}
            
            Be educational, safe, and use appropriate cultural flavor.
            Keep responses concise (max 3 sentences).
        `;

        // Using Tier 1 for Chat for better personality
        return await geminiProvider.executeTiered<any>('tier_1_mid', request, system);
    }

    private async updateMemory(userId: string, request: string, response: string) {
        const prompt = `
            New Exchange:
            User: "${request}"
            AI: "${response}"
            
            Extract any NEW facts about the child (interests, names, etc.) and update the rolling summary.
            Output JSON only with "facts_to_upsert" and "rolling_summary".
        `;

        const memoryUpdate = await geminiProvider.executeTiered<any>('tier_0_low_cost', prompt, "You are the MemoryExtractorAgent.");

        // Upsert facts
        if (memoryUpdate.facts_to_upsert) {
            for (const fact of memoryUpdate.facts_to_upsert) {
                await supabase.from('agent_memory_facts').upsert({
                    user_id: userId,
                    fact_key: fact.fact_key,
                    fact_value: fact.fact_value,
                    confidence: fact.confidence || 1.0,
                    source: 'inferred'
                }, { onConflict: 'user_id,fact_key' });
            }
        }

        // Update summary
        await supabase.from('agent_memory_summaries').upsert({
            user_id: userId,
            summary: memoryUpdate.rolling_summary,
            last_interaction: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    private async logUsage(userId: string, tier: ModelTier, tokensIn: number, tokensOut: number) {
        await supabase.from('usage_logs').insert({
            user_id: userId,
            feature_type: 'brain_interaction',
            tokens_in_est: tokensIn,
            tokens_out_est: tokensOut
        });
    }
}

export const anansiOrchestrator = new AnansiCoreOrchestrator();
