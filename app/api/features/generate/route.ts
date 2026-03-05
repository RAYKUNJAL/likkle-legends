import { NextRequest, NextResponse } from 'next/server';
import { moduleManagerAgent } from '@/lib/ai-content-generator/agents/ModuleManager';
import { getFeatureSuite, type FeatureSuiteSlug } from '@/lib/feature-suites';

function buildFallbackModule(suite: FeatureSuiteSlug) {
    const suiteData = getFeatureSuite(suite);
    const focus = suiteData?.items[0]?.name || 'Island Learning';
    return {
        title: `${suiteData?.title || 'Likkle Legends'} Starter Module`,
        island: 'Jamaica',
        theme: focus,
        source: 'template-fallback',
        storyTitle: `${focus} Adventure Story`,
        printableTitle: `${focus} Activity Sheet`,
        videoTitle: `${focus} Guided Lesson`,
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const suite = body?.suite as FeatureSuiteSlug | undefined;
        const ageGroup = body?.ageGroup === 'mini' ? 'mini' : 'big';

        if (!suite || !getFeatureSuite(suite)) {
            return NextResponse.json({ error: 'Invalid suite' }, { status: 400 });
        }

        const suiteData = getFeatureSuite(suite)!;
        const objective = `${suiteData.title}: Build a culturally rich module covering ${suiteData.items
            .slice(0, 3)
            .map((item) => item.name)
            .join(', ')} for kids age ${ageGroup === 'mini' ? '3-5' : '6-8'}.`;

        const apiKey =
            process.env.GEMINI_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ module: buildFallbackModule(suite) });
        }

        try {
            const generatedModule = await moduleManagerAgent.buildCompleteModule(objective, ageGroup);
            return NextResponse.json({
                module: {
                    title: generatedModule.title,
                    island: generatedModule.island,
                    theme: generatedModule.theme,
                    source: 'ai-module-manager',
                    storyTitle: generatedModule.content.story.title,
                    printableTitle: generatedModule.content.printable.title,
                    videoTitle: generatedModule.content.videoScript.title,
                },
            });
        } catch {
            return NextResponse.json({ module: buildFallbackModule(suite) });
        }
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
