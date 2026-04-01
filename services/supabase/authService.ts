
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { User } from "@supabase/supabase-js";

export const loginParent = async (email: string, pass: string): Promise<User | null> => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            console.warn("[AUTH] Supabase error:", error.message);
            return null;
        }
        return data.user;
    } catch (e: any) {
        console.error("[AUTH] Unexpected error:", e);
        throw new Error("Connection to village database failed. Please check your internet.");
    }
};

export const logoutParent = async (): Promise<void> => {
    try {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        }
    } catch (e) {
        console.warn("Sign out local only");
    }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    try {
        if (!isSupabaseConfigured()) {
            return () => { };
        }
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user || null);
        });
        return () => data.subscription.unsubscribe();
    } catch (e) {
        return () => { };
    }
};
