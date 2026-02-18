
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { AgentInputPayload } from '../lib/ai-content-generator/agents/schemas';

async function main() {
    // Dynamic import to ensure ENV is loaded before agent initialization
    const { educationalContentAgent } = await import('../lib/ai-content-generator/agents/educational-agent');

    console.log('🧪 Starting V3 Integration Test (Profile -> Agent -> DB)...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service role for clean setup

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase Env Vars');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Create a Test User (or find existing)
    const testEmail = `test-v3-${Date.now()}@example.com`;
    const { data: auth, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true
    });

    if (authError) {
        console.error('❌ User creation failed:', authError.message);
        process.exit(1);
    }

    const userId = auth.user.id;
    console.log('✅ Created Test User:', userId);

    try {
        // 2. Insert Family Profile (V3 Table)
        const { data: family, error: familyError } = await supabase
            .from('family_profile')
            .insert({
                user_id: userId,
                home_islands: ['Jamaica', 'Trinidad and Tobago'],
                language_flavour: 'creole_sprinkles',
                max_story_length_pages: 3,
                allow_scary_folklore: false,
                allow_trickster_folklore: true
            })
            .select()
            .single();

        if (familyError) throw new Error(`Family Insert Failed: ${familyError.message}`);
        console.log('✅ Created Family Profile:', family.id);

        // 3. Insert Child Profile (V3 Table)
        const { data: child, error: childError } = await supabase
            .from('child_profile')
            .insert({
                family_id: family.id,
                child_name: 'Zola',
                age_years: 6,
                reading_level: 'emerging',
                favourite_topics: ['Adventures', 'Trees'],
                favourite_characters: ['Scorcha Pepper', 'Benny Shadowbeni']
            })
            .select()
            .single();

        if (childError) throw new Error(`Child Insert Failed: ${childError.message}`);
        console.log('✅ Created Child Profile:', child.child_name);

        // 4. Construct Payload (Mimicking server action)
        const payload: AgentInputPayload = {
            request_id: `integration-${userId}`,
            user_id: userId,
            family_profile: family,
            child_profile: {
                id: child.id,
                child_name: child.child_name,
                child_age: child.age_years,
                reading_level: child.reading_level,
                favourite_topics: child.favourite_topics,
                favourite_characters: child.favourite_characters,
                attention_span: child.attention_span
            },
            education_context: {
                island: 'Jamaica',
                subject: 'Nature',
                topic_keywords: ['Blue Mountains', 'Forest']
            },
            creative_context: {
                tone: 'Magical',
                folklore_type: 'Anansi'
            },
            platform_settings: {
                auto_publish: true,
                visibility: 'private'
            },
            trace_metadata: {
                test_run: true
            }
        };

        console.log('🚀 Running Agent with V3 Payload...');
        const result = await educationalContentAgent.run(payload);

        if (result.status === 'success') {
            console.log('\n🎉 SUCCESS! Story Generated:');
            console.log('Title:', result.storybook?.metadata.title);
            console.log('Pages:', result.storybook?.pages.length);
            console.log('DB ID:', result.publication_record?.platform_story_id);

            // Verify DB Record
            const { data: storyRecord } = await supabase
                .from('storybooks')
                .select('*')
                .eq('id', result.publication_record?.platform_story_id)
                .single();

            if (storyRecord) {
                console.log('✅ Story persisted to DB:', storyRecord.title);
            } else {
                console.error('❌ Story missing from DB!');
            }

        } else {
            console.error('❌ Agent Failed:', result.errors);
        }

    } catch (err: any) {
        console.error('💥 Integration Test Error:', err.message);
    } finally {
        // Cleanup User (Cascade deletes profiles & stories)
        await supabase.auth.admin.deleteUser(userId);
        console.log('🧹 Cleaned up test user.');
    }
}

main();
