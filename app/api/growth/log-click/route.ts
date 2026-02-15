import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
    try {
        const { referralCode } = await req.json();

        if (!referralCode) {
            return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
        }

        const supabase = createClient();
        const headersList = headers();

        // Basic metadata for tracking
        const userAgent = headersList.get('user-agent');
        const ip = headersList.get('x-forwarded-for') || '0.0.0.0';

        const { error } = await supabase.from('referral_clicks').insert({
            referral_code: referralCode,
            user_agent: userAgent,
            ip_address: ip,
            // referral_type could be added if we want to distinguish between promoter/parent
        });

        if (error) {
            console.error('Error logging referral click:', error);
            // We don't return 500 here to avoid leaking info to bad actors, 
            // and because this is a background tracking task.
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Referral click log failed:', e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
