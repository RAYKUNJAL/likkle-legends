import { generateGeminiSpeech } from '../gemini-tts';
import { BUCKETS } from '../storage';
import { supabaseAdmin } from '../supabase-client';

// Mapping characters to Google Gemini TTS Prebuilt Voices
const VOICE_MAPPING: Record<string, string> = {
    'roti': 'Leda',
    'tanty_spice': 'Kore',
    'dilly_doubles': 'Puck',
    'benny_of_shadows': 'Aoede'
};

export async function generateContentAudio(contentId: string) {
    console.log(`[AudioService] Generating audio for content: ${contentId}`);

    // 1. Fetch the content using unified admin client
    const { data: content, error: fetchError } = await supabaseAdmin
        .from('generated_content')
        .select('*')
        .eq('id', contentId)
        .single();

    if (fetchError || !content) {
        throw new Error(`Content not found: ${contentId}`);
    }

    // 2. Determine what to speak
    let textToSpeak = "";
    if (content.content_type.includes('story')) {
        if (content.payload.full_story) {
            textToSpeak = content.payload.full_story;
        } else if (content.payload.pages) {
            textToSpeak = content.payload.pages.map((p: any) => p.text).join(" ");
        } else {
            textToSpeak = content.payload.text || content.payload.content || "";
        }
    } else if (content.content_type.includes('song')) {
        textToSpeak = content.payload.lyrics?.verse_1 || content.payload.lyrics || content.payload.summary || "";
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
    const folder = content.content_type.includes('story') ? 'stories' : 'songs';
    const fileName = `generated/${folder}/${contentId}.wav`;

    // Use the storage client from our unified admin client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKETS.SONGS)
        .upload(fileName, audioBuffer, {
            contentType: 'audio/wav',
            upsert: true
        });

    if (uploadError) {
        throw new Error(`Failed to upload audio to Supabase Storage: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKETS.SONGS)
        .getPublicUrl(fileName);

    // 6. Update Record
    const { error: updateError } = await supabaseAdmin
        .from('generated_content')
        .update({
            metadata: {
                ...content.metadata,
                audio_url: publicUrl
            }
        })
        .eq('id', contentId);

    if (updateError) {
        throw new Error(`Failed to update content metadata with audio URL: ${updateError.message}`);
    }

    return publicUrl;
}
