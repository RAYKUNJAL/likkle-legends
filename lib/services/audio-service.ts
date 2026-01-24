
import { generateGeminiSpeech } from '../gemini-tts';
import { uploadFile, BUCKETS } from '../storage';
import { createClient } from '@supabase/supabase-js';
import { CHARACTER_REGISTRY } from '../registries/characters';

// Mapping characters to Google Gemini TTS Prebuilt Voices
const VOICE_MAPPING: Record<string, string> = {
    'roti': 'Leda',
    'tanty_spice': 'Kore',
    'dilly_doubles': 'Puck',
    'benny_of_shadows': 'Aoede'
};

export async function generateContentAudio(contentId: string) {
    console.log(`[AudioService] Generating audio for content: ${contentId}`);

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch the content
    const { data: content, error: fetchError } = await adminClient
        .from('generated_content')
        .select('*')
        .eq('id', contentId)
        .single();

    if (fetchError || !content) {
        throw new Error(`Content not found: ${contentId}`);
    }

    // 2. Determine what to speak
    // For stories, we speak the text. For songs, we might speak the lyrics or a summary.
    let textToSpeak = "";
    if (content.content_type.includes('story')) {
        // Assume payload structure for stories: { pages: [{ text: "..." }] } or just content
        if (content.payload.full_story) {
            textToSpeak = content.payload.full_story;
        } else if (content.payload.pages) {
            textToSpeak = content.payload.pages.map((p: any) => p.text).join(" ");
        } else {
            textToSpeak = content.payload.text || content.payload.content || "";
        }
    } else if (content.content_type.includes('song')) {
        // For songs, we might want to speak a preview or the lyrics
        textToSpeak = content.payload.lyrics?.verse_1 || content.payload.lyrics || "";
    } else {
        textToSpeak = content.payload.text || "Hello! Everything is cook and curry.";
    }

    if (!textToSpeak) {
        throw new Error("No text found to generate speech from.");
    }

    // 3. Identify Voice
    const hostCharId = content.metadata?.host_character || 'roti';
    const voiceName = VOICE_MAPPING[hostCharId] || 'Leda';

    // 4. Generate Speech
    const audioBuffer = await generateGeminiSpeech(textToSpeak, { voiceName });

    if (!audioBuffer) {
        throw new Error("TTS Generation failed (returned null buffer).");
    }

    // 5. Upload to Supabase Storage
    const fileName = `generated/${content.content_type}/${contentId}.wav`;
    const audioFile = new File([audioBuffer], `${contentId}.wav`, { type: 'audio/wav' });

    const uploadResult = await uploadFile(BUCKETS.SONGS, audioFile, fileName);

    if (!uploadResult) {
        throw new Error("Failed to upload audio to Supabase Storage.");
    }

    // 6. Update Record
    const { error: updateError } = await adminClient
        .from('generated_content')
        .update({
            metadata: {
                ...content.metadata,
                audio_url: uploadResult.url
            }
        })
        .eq('id', contentId);

    if (updateError) {
        throw new Error(`Failed to update content metadata with audio URL: ${updateError.message}`);
    }

    return uploadResult.url;
}
