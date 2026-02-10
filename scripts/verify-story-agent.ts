
import '../lib/load-env';
import { storyAgent } from '../lib/ai-content-generator/agents/StoryAgent';

async function verifyStoryAgent() {
    console.log('🧪 Verifying StoryAgent with Interactive Features...');

    try {
        const story = await storyAgent.createInterativeStory({
            childName: 'Likkle Legend',
            island: 'Jamaica',
            guide: 'tanty',
            topic: 'The Magic of the Steelpan'
        });

        console.log('✅ Story Generated Successfully!');
        console.log(`   Title: ${story.title}`);
        console.log(`   Pages: ${story.pages.length}`);

        const firstPage = story.pages[0];
        console.log(`   First Page Audio: ${firstPage.audioUrl ? 'Generated' : 'FAILED'}`);
        console.log(`   First Page Word Alignments: ${firstPage.words?.length || 0} words`);

        if (firstPage.words && firstPage.words.length > 0) {
            console.log(`   Sample Word: "${firstPage.words[0].text}" at ${firstPage.words[0].start}s`);
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

verifyStoryAgent();
