
export type AgeBand = '3-5' | '6-7' | '8-9';
export type GradeBand = 'Infants1' | 'Infants2' | 'Std1' | 'Std2' | 'Std3' | 'Std4' | 'Unknown';

export interface AnansiProfile {
    id: string;
    child_name: string;
    age_band: AgeBand;
    grade_band: GradeBand;
    island_id: string;
    character_preference: string;
    dialect_intensity: 'off' | 'light' | 'medium';
    last_active_at: string;
}

export interface MemoryFact {
    id: number;
    user_id: string;
    fact_key: string;
    fact_value: string;
    confidence: number;
    source: 'user' | 'system' | 'inferred';
    updated_at: string;
}

export interface MemorySummary {
    id: number;
    user_id: string;
    summary: string;
    token_estimate: number;
    last_interaction: string;
}

export interface ContentAsset {
    id: string;
    asset_type: 'worksheet' | 'lesson_plan' | 'story' | 'coloring' | 'assessment';
    country_scope: string;
    island_id: string;
    age_band: AgeBand;
    grade_band: GradeBand;
    subject: string;
    character: string;
    payload_json: any;
    render_status: 'pending' | 'done' | 'failed';
    storage_path?: string;
    cache_key_hash?: string;
    created_at: string;
}

export interface AgentJob {
    id: string;
    job_type: string;
    status: 'queued' | 'running' | 'done' | 'failed' | 'canceled';
    input_json: any;
    output_json?: any;
    asset_ids?: string[];
    model_tier_used?: 'tier_0_low_cost' | 'tier_1_mid' | 'tier_2_strong';
    cost_estimate: number;
    created_at: string;
}
