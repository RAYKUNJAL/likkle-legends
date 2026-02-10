
import { supabase } from '@/lib/storage';

const STORAGE_KEY = 'likkle-legends-stars';
export const STARS_UPDATED_EVENT = 'likkle-legends-stars-updated';

export async function getStars(): Promise<number> {
    if (typeof window === 'undefined') return 100;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 100; // Default to 100 for demo
}

export async function awardStars(storyId: string, amount: number = 5) {
    console.log(`🌟 Awarding ${amount} stars for story ${storyId}`);

    let current = await getStars();
    const newTotal = current + amount;

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newTotal.toString());
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent(STARS_UPDATED_EVENT, { detail: { stars: newTotal } }));
    }

    // Optional: Sync to DB in background if user is logged in
    /*
    const { error } = await supabase.from('activities').insert({
        activity_type: 'story_complete',
        xp_earned: amount,
        metadata: { storyId }
    });
    */

    return { success: true, newTotal };
}
