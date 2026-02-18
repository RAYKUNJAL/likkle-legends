
import 'dotenv/config'; // Load .env
import { educationalContentAgent } from '../lib/ai-content-generator/agents/educational-agent';
import { AgentInputPayload, FamilyProfile, ChildProfile } from '../lib/ai-content-generator/agents/schemas';

async function main() {
    console.log('🧪 Starting Agent V3 Test...');

    const family: FamilyProfile = {
        id: 'mock-family-1',
        home_islands: ['Trinidad and Tobago'],
        preferred_language: 'en',
        language_flavour: 'caribbean_light',
        allow_scary_folklore: false,
        allow_trickster_folklore: true,
        max_story_length_pages: 2
    };

    const child: ChildProfile = {
        id: 'mock-child-1',
        child_name: 'Kai',
        child_age: 5,
        reading_level: 'beginner',
        favourite_topics: ['Carnival', 'Music', 'Spicy Food'],
        favourite_characters: ['Scorcha Pepper']
    };

    const payload: AgentInputPayload = {
        request_id: `test_v3_${Date.now()}`,
        user_id: 'test-user-123',
        family_profile: family,
        child_profile: child,
        education_context: {
            island: 'Trinidad',
            subject: 'Culture',
            topic_keywords: ['Carnival', 'Steel Pan']
        },
        creative_context: {
            folklore_type: 'None',
            tone: 'Exciting and rhythmic'
        },
        platform_settings: {
            auto_publish: false,
            visibility: 'private'
        },
        trace_metadata: {
            client: 'cli-test-script',
            device: 'local-dev'
        }
    };

    console.log('📦 V3 Payload:', JSON.stringify(payload, null, 2));

    try {
        const result = await educationalContentAgent.run(payload);

        console.log('\n✅ Agent V3 Finished!');
        console.log(`Status: ${result.status}`);

        if (result.status === 'success' && result.storybook) {
            console.log('\n📘 Story Generated (V3):');
            console.log('Title:', result.storybook.metadata.title);
            console.log('Version:', result.storybook.metadata.version || 'N/A');
            console.log('Pages:', result.storybook.pages.length);

            // Check for new V2 fields
            if (result.metrics) {
                console.log('\n📊 Metrics:');
                console.log('Total Latency:', result.metrics.total_latency_ms, 'ms');
            }

            if (result.images && result.images.length > 0) {
                console.log('\n🎨 Image Sample (V3):');
                console.log('Page ID:', result.images[0].page_id);
                console.log('Image ID:', result.images[0].image_id);
                console.log('Provider:', result.images[0].provider);
            }

        } else {
            console.error('❌ Errors:', result.errors);
        }

    } catch (error) {
        console.error('💥 Script Crash:', error);
    }
}

main();
