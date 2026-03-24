import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code') || '';

    let childName = 'A Likkle Legend';
    let xp = 0;
    let streak = 0;
    let badges = 0;

    try {
        const admin = createAdminClient();

        const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('my_referral_code', code)
            .single();

        if (profile) {
            const { data: child } = await admin
                .from('children')
                .select('first_name, xp, streak_day')
                .eq('parent_id', profile.id)
                .limit(1)
                .single();

            if (child) {
                childName = child.first_name || 'A Likkle Legend';
                xp = child.xp || 0;
                streak = child.streak_day || 0;
            }

            const { count } = await admin
                .from('badge_earnings')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);
            badges = count || 0;
        }
    } catch (e) {
        // Use defaults on error
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: 1200,
                    height: 630,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #FF6B35, #FFB627, #10b981)',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Card */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: 40,
                        padding: '60px 80px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 20,
                            fontWeight: 900,
                            color: '#FF6B35',
                            textTransform: 'uppercase' as const,
                            letterSpacing: 3,
                            marginBottom: 10,
                        }}
                    >
                        LIKKLE LEGENDS
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            fontSize: 48,
                            fontWeight: 900,
                            color: '#0f172a',
                            marginBottom: 8,
                        }}
                    >
                        {childName}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            fontSize: 18,
                            color: '#64748b',
                            marginBottom: 40,
                        }}
                    >
                        is on a Caribbean adventure!
                    </div>

                    {/* Stats Row */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 60,
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', fontSize: 42, fontWeight: 900, color: '#f97316' }}>
                                {streak}
                            </div>
                            <div style={{ display: 'flex', fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const }}>
                                Day Streak
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', fontSize: 42, fontWeight: 900, color: '#eab308' }}>
                                {xp}
                            </div>
                            <div style={{ display: 'flex', fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const }}>
                                XP Earned
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', fontSize: 42, fontWeight: 900, color: '#a855f7' }}>
                                {badges}
                            </div>
                            <div style={{ display: 'flex', fontSize: 14, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const }}>
                                Badges
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA */}
                <div
                    style={{
                        display: 'flex',
                        marginTop: 30,
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'white',
                    }}
                >
                    Start your child's Caribbean adventure free at likklelegends.com
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
