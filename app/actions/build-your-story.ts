'use server';

import { generateTantyStory, type TantyStoryResult } from '@/lib/agents/tanty-story-agent';
import { resolveBuildStoryInput, type BuildStoryInput } from '@/lib/build-your-story';
import { createClient } from '@/lib/supabase/server';

export interface BuiltStoryPage {
    text: string;
    illustration: string;
    imageUrl?: string | null;
}

export interface BuiltStory {
    title: string;
    summary: string;
    lesson: string;
    character: string;
    island: string;
    theme: string;
    childName: string;
    pages: BuiltStoryPage[];
}

function toBuiltStory(story: TantyStoryResult, meta: { island: string; theme: string; childName: string }): BuiltStory {
    return {
        title: story.title,
        summary: story.summary,
        lesson: story.lesson,
        character: story.character,
        island: meta.island,
        theme: meta.theme,
        childName: meta.childName,
        pages: story.pages
            .map((page) => ({
                text: String(page.text || '').trim(),
                illustration: String(page.illustration || '').trim(),
                imageUrl: null,
            }))
            .filter((page) => page.text.length > 0),
    };
}

export async function generateBuildYourStoryAction(input: BuildStoryInput): Promise<{
    success: boolean;
    story?: BuiltStory;
    code?: 'invalid' | 'missing_key' | 'generation_failed';
    error?: string;
}> {
    const resolved = resolveBuildStoryInput(input);
    if (!resolved.ok) return { success: false, code: 'invalid', error: resolved.error };

    if (!process.env.GEMINI_API_KEY?.trim()) {
        return {
            success: false,
            code: 'missing_key',
            error: 'Story writing needs GEMINI_API_KEY. We will not invent a pretend tale.',
        };
    }

    try {
        const story = await generateTantyStory({
            childName: resolved.childName,
            childAge: resolved.childAge,
            island: resolved.island,
            theme: resolved.themePrompt,
            character: resolved.character,
            pageCount: 6,
            originalFiction: true,
        });
        const built = toBuiltStory(story, resolved);
        if (built.pages.length < 4 || !built.pages.some((page) => page.text.includes(resolved.childName))) {
            return {
                success: false,
                code: 'generation_failed',
                error: 'The story came back incomplete. Nothing was saved.',
            };
        }
        return { success: true, story: built };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Story writing failed.';
        const missing = /GEMINI_API_KEY/i.test(message);
        return {
            success: false,
            code: missing ? 'missing_key' : 'generation_failed',
            error: missing ? 'Story writing needs GEMINI_API_KEY. We will not invent a pretend tale.' : 'Story writing failed. Nothing was saved.',
        };
    }
}

export async function illustrateStoryPageAction(prompt: string): Promise<{
    status: 'ready' | 'missing_key' | 'failed';
    imageUrl?: string;
    message: string;
}> {
    const clean = String(prompt || '').replace(/\s+/g, ' ').trim().slice(0, 500);
    if (!clean) return { status: 'failed', message: 'This page has no picture note.' };
    if (!process.env.GEMINI_API_KEY?.trim()) {
        return { status: 'missing_key', message: 'Pictures need GEMINI_API_KEY. You can still read the words.' };
    }

    try {
        const { generateImage } = await import('@/lib/ai-image-generator/image-client');
        const imageUrl = await generateImage(
            `${clean}. Children's picture book, Caribbean setting, kind characters, no text in the image.`,
            `build-story-${Date.now()}`
        );
        if (!imageUrl) {
            return { status: 'failed', message: 'The picture did not come back. You can still read the words.' };
        }
        return { status: 'ready', imageUrl, message: 'Picture ready' };
    } catch (error) {
        console.error('[build-your-story] illustration failed', error);
        return { status: 'failed', message: 'The picture did not come back. You can still read the words.' };
    }
}

export async function saveBuildYourStoryAction(story: BuiltStory): Promise<{
    success: boolean;
    id?: string;
    code?: 'auth' | 'invalid' | 'save_failed';
    error?: string;
}> {
    if (!story?.title || !Array.isArray(story.pages) || story.pages.length < 4) {
        return { success: false, code: 'invalid', error: 'There is no finished story to save.' };
    }

    try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
            return { success: false, code: 'auth', error: 'Sign in to keep this story on your shelf.' };
        }

        const cover = story.pages.find((page) => page.imageUrl)?.imageUrl || null;
        const { data, error } = await supabase
            .from('storybooks')
            .insert({
                title: story.title,
                summary: story.summary,
                content_json: {
                    pages: story.pages.map((page, index) => ({
                        page_number: index + 1,
                        text: page.text,
                        illustration: page.illustration,
                        image_url: page.imageUrl || null,
                    })),
                    lesson: story.lesson,
                    child_name: story.childName,
                    theme: story.theme,
                    character: story.character,
                    generated_by: 'build_your_story',
                    originality: 'original_fiction',
                },
                cover_image_url: cover,
                island_theme: story.island,
                user_id: user.id,
                is_active: false,
            })
            .select('id')
            .single();

        if (error || !data?.id) {
            console.error('[build-your-story] save failed', error?.message);
            return { success: false, code: 'save_failed', error: 'Your shelf could not store this story yet.' };
        }
        return { success: true, id: data.id };
    } catch (error) {
        console.error('[build-your-story] save error', error);
        return { success: false, code: 'auth', error: 'Sign in to keep this story on your shelf.' };
    }
}
