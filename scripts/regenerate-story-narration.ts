/**
 * Rebuild page narration for the live picture-book catalog.
 *
 * Prefers ElevenLabs. Falls back to Gemini TTS. Fail-closed when neither key
 * is set: the catalog JSON is not rewritten and the retired robotic files stay
 * unmarked so readers will not play them.
 *
 *   npx tsx scripts/regenerate-story-narration.ts
 *   npx tsx scripts/regenerate-story-narration.ts --check
 */
import fs from 'fs';
import path from 'path';
import { synthesizeWarmNarration } from '../lib/story-narration';
import { isWarmNarration } from '../lib/story-narration-policy';

const root = process.cwd();
const catalogPath = path.join(root, 'lib/data/live-library-stories.json');

function pageFile(slug: string, pageNumber: number, extension: 'mp3' | 'wav') {
    return path.join(root, 'public/audio/story-narrations', slug, `page-${String(pageNumber).padStart(2, '0')}.${extension}`);
}

async function main() {
    const checkOnly = process.argv.includes('--check');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as any[];

    if (checkOnly) {
        const warm = catalog.filter((story) => isWarmNarration(story.narrated_by));
        for (const story of warm) {
            story.pages.forEach((_: unknown, index: number) => {
                const mp3 = pageFile(story.slug, index + 1, 'mp3');
                const wav = pageFile(story.slug, index + 1, 'wav');
                if (!fs.existsSync(mp3) && !fs.existsSync(wav)) {
                    throw new Error(`Warm narration marked for ${story.slug} page ${index + 1} but no audio file exists`);
                }
            });
        }
        console.log(`regenerate-story-narration --check: ${warm.length} warm books, ${catalog.length - warm.length} still on the retired recording`);
        return;
    }

    if (!process.env.ELEVENLABS_API_KEY?.trim() && !process.env.GEMINI_API_KEY?.trim()) {
        console.error('Fail-closed: set ELEVENLABS_API_KEY (preferred) or GEMINI_API_KEY before regenerating narration.');
        process.exit(1);
    }

    let provider: 'elevenlabs' | 'gemini' | null = null;
    for (const story of catalog) {
        const audioUrls: string[] = [];
        for (let index = 0; index < story.pages.length; index++) {
            const text = String(story.pages[index]?.text || '').trim();
            const spoken = await synthesizeWarmNarration(text);
            if (!spoken.ok) {
                console.error(`Stopped on ${story.slug} page ${index + 1}: ${spoken.error}`);
                process.exit(1);
            }
            provider = spoken.provider;
            const extension = spoken.contentType === 'audio/wav' ? 'wav' : 'mp3';
            const filePath = pageFile(story.slug, index + 1, extension);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, spoken.audio);
            audioUrls.push(`/audio/story-narrations/${story.slug}/page-${String(index + 1).padStart(2, '0')}.${extension}`);
            console.log(`Wrote ${audioUrls[audioUrls.length - 1]}`);
        }
        story.audio_urls = audioUrls;
        story.narrated_by = `warm_island_narrator_${provider}`;
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    }

    console.log(`regenerate-story-narration: updated ${catalog.length} books with ${provider}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
