/**
 * Tanty Spice Story Illustrator
 *
 * Generates kid-friendly Caribbean illustrations for stories_library book pages
 * using FAL.ai FLUX image generation. Uploads each illustration to Supabase
 * Storage and saves the image URL back to the book's content.pages[i].image_url.
 *
 * Mirrors the upload + save-back pattern of tanty-narrator.ts.
 *
 * Requires FAL_KEY env var (FAL.ai API key).
 */

import { supabaseAdmin } from '@/lib/supabase-client';

const FAL_FLUX_ENDPOINT = 'https://fal.run/fal-ai/flux/dev';

const STORAGE_BUCKET = 'story-illustrations';
const STORAGE_PATH_PREFIX = 'illustrations';

/**
 * Art style suffix appended to every illustration description to keep the
 * look consistent across all 12 books and every page within a book.
 */
const ART_STYLE_SUFFIX =
    "Caribbean art style, warm tropical colors, flat illustration, child-friendly, " +
    "soft painterly textures, storybook illustration, consistent character design, no text, no words, no letters";

/**
 * Character consistency hints keyed by the book's `character` field. Adding a
 * short, stable description of the recurring character helps FLUX keep their
 * appearance consistent page-to-page.
 */
const CHARACTER_HINTS: Record<string, string> = {
    anansi: 'Anansi the spider is small and round with eight legs, a cheeky grin, and a tiny straw hat',
    tanty_spice: 'Tanty Spice is a warm Caribbean grandmother with silver hair, glasses, a colorful headwrap, and a flowing floral dress',
    dilly_doubles: 'Dilly Doubles is a fun-loving boy with brown skin, curly hair, a bright yellow t-shirt, and a big smile',
    steelpan_sam: 'Steelpan Sam is an energetic boy with dreadlocks, a green tank top, holding a shiny steelpan',
    mango_moko: 'Mango Moko is a cheerful boy with dark skin, a wide-brim straw hat, overalls, and a basket of mangoes',
    scorcha_pepper: 'Scorcha Pepper is a fiery girl with red-orange hair in puffs, a red bandana, and a confident stance',
    papa_bois: 'Papa Bois is a tall forest guardian with leafy antlers, bark-brown skin, and a kind wise face',
    river_mumma: 'River Mumma is a graceful mermaid with long flowing dark hair, a shimmering turquoise tail, and a golden crown',
    chickcharney: 'Chickcharney is a fluffy round owl-like creature with big golden eyes, feathers, and a mischievous grin',
};

export interface IllustratePageResult {
    bookId: string;
    pageIndex: number;
    imageUrl: string;
    success: boolean;
    error?: string;
}

export interface IllustrateBookResult {
    bookId: string;
    imageUrls: string[];
    success: boolean;
    error?: string;
}

/**
 * Build the FLUX prompt for a single page.
 */
export function buildIllustrationPrompt(
    description: string,
    character?: string,
): string {
    const charHint = character ? CHARACTER_HINTS[character.toLowerCase()] || '' : '';
    const parts = [
        "Children's book illustration",
        description,
    ];
    if (charHint) parts.push(`featuring ${charHint}`);
    parts.push(ART_STYLE_SUFFIX);
    return parts.join(', ');
}

/**
 * Call FAL.ai FLUX and return the generated image as a Buffer.
 * Throws on any error.
 */
async function generateImageWithFlux(prompt: string): Promise<Buffer> {
    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
        throw new Error('FAL_KEY not set');
    }

    const res = await fetch(FAL_FLUX_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Key ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            image_size: 'landscape_16_9',
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
            output_format: 'png',
        }),
    });

    if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`FAL FLUX error ${res.status}: ${errBody.substring(0, 300)}`);
    }

    const data: any = await res.json();
    const imageUrl: string | undefined = data?.images?.[0]?.url;
    if (!imageUrl) {
        throw new Error('FAL FLUX returned no image URL');
    }

    // Download the image bytes
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
        throw new Error(`Failed to download FLUX image: ${imgRes.status}`);
    }
    const arrayBuffer = await imgRes.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Upload a Buffer to Supabase Storage and return the public URL.
 * Creates the bucket on first failure if it doesn't exist.
 */
async function uploadIllustration(
    slug: string,
    pageIndex: number,
    buffer: Buffer,
): Promise<string> {
    const path = `${STORAGE_PATH_PREFIX}/${slug}/page-${String(pageIndex + 1).padStart(2, '0')}.png`;

    const { error: uploadError } = await supabaseAdmin
        .storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, {
            contentType: 'image/png',
            upsert: true,
        });

    if (uploadError) {
        // Try creating the bucket if it doesn't exist, then retry once.
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
            await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
            const retry = await supabaseAdmin.storage.from(STORAGE_BUCKET).upload(path, buffer, {
                contentType: 'image/png',
                upsert: true,
            });
            if (retry.error) {
                throw new Error(`Upload retry failed: ${retry.error.message}`);
            }
        } else {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }
    }

    const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = urlData?.publicUrl || '';
    // Normalize internal kong URL to the public proxy path, matching tanty-narrator.
    return publicUrl.includes('supabase-kong')
        ? publicUrl.replace('http://supabase-kong:8000', 'https://www.likklelegends.com/supabase')
        : publicUrl;
}

/**
 * Illustrate a single page of a single book.
 * Saves the resulting image_url back to content.pages[pageIndex].image_url.
 */
export async function illustratePage(
    bookId: string,
    pageIndex: number,
): Promise<IllustratePageResult> {
    try {
        const { data: book, error } = await supabaseAdmin
            .from('stories_library')
            .select('id, title, slug, character, content')
            .eq('id', bookId)
            .maybeSingle();

        if (error || !book) {
            return { bookId, pageIndex, imageUrl: '', success: false, error: 'Book not found' };
        }

        const content = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
        const pages: any[] = content.pages || [];
        if (pageIndex < 0 || pageIndex >= pages.length) {
            return { bookId, pageIndex, imageUrl: '', success: false, error: 'Page index out of range' };
        }

        const description: string = pages[pageIndex].illustration || pages[pageIndex].text || '';
        if (!description || description.length < 3) {
            return { bookId, pageIndex, imageUrl: '', success: false, error: 'No illustration description for this page' };
        }

        const prompt = buildIllustrationPrompt(description, book.character);
        console.log(`[TantyIllustrator] Generating page ${pageIndex + 1}/${pages.length} for "${book.title}"`);

        const buffer = await generateImageWithFlux(prompt);
        const imageUrl = await uploadIllustration(book.slug || bookId, pageIndex, buffer);

        // Save back to book content
        pages[pageIndex] = { ...pages[pageIndex], image_url: imageUrl };
        const updatedContent = { ...content, pages, illustrated_by: 'fal_flux' };
        await supabaseAdmin.from('stories_library')
            .update({ content: updatedContent })
            .eq('id', bookId);

        return { bookId, pageIndex, imageUrl, success: true };
    } catch (err: any) {
        console.error(`[TantyIllustrator] Page ${pageIndex + 1} error:`, err.message);
        return { bookId, pageIndex, imageUrl: '', success: false, error: err?.message || 'Illustration failed' };
    }
}

/**
 * Illustrate every page of a single book. Skips pages that already have an
 * image_url unless `force` is true.
 */
export async function illustrateBook(
    bookId: string,
    opts: { force?: boolean } = {},
): Promise<IllustrateBookResult> {
    const { data: book, error } = await supabaseAdmin
        .from('stories_library')
        .select('id, title, slug, character, content')
        .eq('id', bookId)
        .maybeSingle();

    if (error || !book) {
        return { bookId, imageUrls: [], success: false, error: 'Book not found' };
    }

    const content = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
    const pages: any[] = content.pages || [];
    if (pages.length === 0) {
        return { bookId, imageUrls: [], success: false, error: 'No pages to illustrate' };
    }

    const imageUrls: string[] = [];
    let changed = false;

    for (let i = 0; i < pages.length; i++) {
        const existing = pages[i]?.image_url;
        if (existing && !opts.force) {
            console.log(`[TantyIllustrator] Skipping page ${i + 1}/${pages.length} of "${book.title}" — already illustrated`);
            imageUrls.push(existing);
            continue;
        }

        const result = await illustratePage(bookId, i);
        if (result.success) {
            imageUrls.push(result.imageUrl);
            changed = true;
        } else {
            imageUrls.push(existing || '');
            console.error(`[TantyIllustrator] Page ${i + 1} failed: ${result.error}`);
        }

        // Be gentle with FLUX rate limits.
        await new Promise((r) => setTimeout(r, 800));
    }

    // Persist any net-new URLs (illustratePage already saved per page, but
    // ensure the book-level illustrated_by flag is set if anything changed).
    if (changed) {
        const fresh = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
        await supabaseAdmin.from('stories_library')
            .update({ content: { ...fresh, illustrated_by: 'fal_flux' } })
            .eq('id', bookId);
    }

    return { bookId, imageUrls, success: true };
}

/**
 * Batch illustrate all books in the library. Skips books whose pages all
 * already have image_url set (unless force=true).
 */
export async function illustrateAllBooks(
    opts: { force?: boolean } = {},
): Promise<IllustrateBookResult[]> {
    const { data: books } = await supabaseAdmin
        .from('stories_library')
        .select('id, title, content')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (!books || books.length === 0) {
        return [];
    }

    const results: IllustrateBookResult[] = [];
    for (const book of books) {
        const content = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
        const pages: any[] = content.pages || [];
        const allDone = pages.length > 0 && pages.every((p: any) => p.image_url);
        if (allDone && !opts.force) {
            console.log(`[TantyIllustrator] Skipping "${book.title}" — fully illustrated`);
            results.push({
                bookId: book.id,
                imageUrls: pages.map((p: any) => p.image_url),
                success: true,
            });
            continue;
        }

        console.log(`[TantyIllustrator] Illustrating "${book.title}"...`);
        const result = await illustrateBook(book.id, opts);
        results.push(result);
    }

    return results;
}
