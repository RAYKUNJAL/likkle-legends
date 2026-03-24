import { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/admin";
import { Trophy, Star, Flame, ArrowRight } from "lucide-react";

interface SharePageProps {
    params: { code: string };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
    const admin = createAdminClient();
    const { data: profile } = await admin
        .from('profiles')
        .select('parent_name, my_referral_code')
        .eq('my_referral_code', params.code)
        .single();

    const title = profile
        ? `${profile.parent_name}'s child is a Likkle Legend!`
        : "Join Likkle Legends — Caribbean Learning for Kids";

    return {
        title,
        description: "Free Caribbean stories, games, and cultural learning for children ages 4-8. Start your child's heritage adventure today!",
        openGraph: {
            title,
            description: "Free Caribbean stories, games, and cultural learning for children ages 4-8.",
            url: `https://likklelegends.com/share/${params.code}`,
            siteName: "Likkle Legends",
            images: [
                {
                    url: `/api/og/share-card?code=${params.code}`,
                    width: 1200,
                    height: 630,
                    alt: "Likkle Legends Achievement Card",
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: "Free Caribbean stories, games, and cultural learning for children ages 4-8.",
            images: [`/api/og/share-card?code=${params.code}`],
        },
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const admin = createAdminClient();

    // Look up the referral code to find the user
    const { data: profile } = await admin
        .from('profiles')
        .select('id, parent_name, my_referral_code')
        .eq('my_referral_code', params.code)
        .single();

    // Get child stats if profile found
    let childData = null;
    if (profile) {
        const { data: child } = await admin
            .from('children')
            .select('first_name, xp, streak_day, level')
            .eq('parent_id', profile.id)
            .limit(1)
            .single();
        childData = child;
    }

    // Get badge count
    let badgeCount = 0;
    if (profile) {
        const { count } = await admin
            .from('badge_earnings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
        badgeCount = count || 0;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Achievement Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-br from-orange-500 via-yellow-500 to-green-500 p-8 text-center text-white">
                        <h1 className="text-3xl font-black mb-1">
                            {childData?.first_name || "A Likkle Legend"}
                        </h1>
                        <p className="text-white/80 text-sm">is on a Caribbean adventure!</p>
                    </div>

                    <div className="p-8">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                                    <Flame className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-black text-gray-900 block">
                                    {childData?.streak_day || 0}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold uppercase">Day Streak</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                                    <Star className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-black text-gray-900 block">
                                    {childData?.xp || 0}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold uppercase">XP Earned</span>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <span className="text-2xl font-black text-gray-900 block">
                                    {badgeCount}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold uppercase">Badges</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            href={`/signup?ref=${params.code}`}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Start Your Child's Adventure
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Free forever. Caribbean stories, games, songs & printables for ages 4-8.
                        </p>
                    </div>
                </div>

                {/* What is Likkle Legends */}
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center">
                    <h2 className="font-black text-gray-900 mb-2">What is Likkle Legends?</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        A Caribbean learning platform where children ages 4-8 explore their heritage through stories, games, AI characters, music, and printable activities.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                        <span>Free to Start</span>
                        <span>No Ads</span>
                        <span>Safe for Kids</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
