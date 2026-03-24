"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Users, Share2, Copy, CheckCircle, Star, Gift, ArrowRight } from "lucide-react";

const CONTEST_SLUG = "caribbean-heritage-giveaway";

interface ContestEntry {
    id: string;
    email: string;
    referral_link_code: string;
    total_points: number;
    referral_count: number;
}

interface LeaderboardEntry {
    email: string;
    total_points: number;
    referral_count: number;
}

export default function ViralContestPage() {
    const searchParams = useSearchParams();
    const referredByCode = searchParams.get("ref") || "";

    const [step, setStep] = useState<"enter" | "share" | "leaderboard">("enter");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [entry, setEntry] = useState<ContestEntry | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [copied, setCopied] = useState(false);

    const shareUrl = entry
        ? `https://likklelegends.com/contest/giveaway?ref=${entry.referral_link_code}`
        : "";

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const res = await fetch(`/api/contest/stats?slug=${CONTEST_SLUG}`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data.leaderboard || []);
            }
        } catch { }
    };

    const handleEnter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // 1. Capture as lead
            await fetch("/api/lead-capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    first_name: firstName || undefined,
                    source: "viral_contest",
                    utm_source: searchParams.get("utm_source") || "contest",
                    utm_medium: "viral",
                    utm_campaign: CONTEST_SLUG,
                }),
            });

            // 2. Enter contest
            const res = await fetch("/api/contest/enter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: CONTEST_SLUG,
                    email,
                    referred_by: referredByCode || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to enter");

            setEntry(data.entry);
            setStep("share");
            loadLeaderboard();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(
                `Win a FREE year of Likkle Legends for your child! Caribbean stories, games & cultural learning. Enter here: ${shareUrl}`
            )}`,
            "_blank"
        );
    };

    const shareFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            "_blank"
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500">
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
                {/* Prize Banner */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-5 py-2 rounded-full text-sm font-bold text-white mb-4">
                        <Trophy className="w-4 h-4" />
                        GIVEAWAY
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                        Win a FREE Year of<br />Likkle Legends!
                    </h1>
                    <p className="text-white/80 text-lg max-w-lg mx-auto">
                        Caribbean stories, games, AI buddy chat & 30+ printables for your child — worth $240!
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {step === "enter" && (
                        <div className="p-8 md:p-10">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">
                                Enter to Win
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Enter your email to join. Share with friends to earn bonus points and climb the leaderboard!
                            </p>

                            {/* Prize Stack */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {[
                                    { icon: "🏆", label: "1st Place", prize: "1 Year Family Legacy" },
                                    { icon: "🥈", label: "2nd-5th Place", prize: "3 Months Legends Plus" },
                                    { icon: "🎁", label: "All Entrants", prize: "Free Coloring Pack" },
                                    { icon: "⭐", label: "Top Referrer", prize: "Caribbean Heritage Box" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                                        <span className="text-2xl block mb-1">{item.icon}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase">{item.label}</span>
                                        <span className="text-sm font-bold text-gray-900 block">{item.prize}</span>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleEnter} className="space-y-4">
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Your first name"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                                    required
                                    autoFocus
                                />

                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "Entering..." : "Enter the Giveaway"}
                                </button>
                            </form>

                            {/* How it Works */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="font-bold text-gray-700 mb-3">How to win:</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                        <span>Enter with your email (+10 points)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                        <span>Share your unique link with friends (+50 points per friend who enters)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                        <span>Most points at the end wins the grand prize!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "share" && entry && (
                        <div className="p-8 md:p-10">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">
                                    You're In!
                                </h2>
                                <p className="text-gray-500">
                                    You have <span className="font-bold text-orange-500">{entry.total_points} points</span>. Share to earn more!
                                </p>
                            </div>

                            {/* Points Breakdown */}
                            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-gray-700">Your Points</span>
                                    <span className="text-2xl font-black text-orange-500">{entry.total_points}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>Friends referred</span>
                                    <span className="font-bold">{entry.referral_count || 0}</span>
                                </div>
                            </div>

                            {/* Share Section */}
                            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share to earn +50 points per friend:
                            </h3>

                            {/* Copy Link */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-600 bg-gray-50"
                                />
                                <button
                                    onClick={copyLink}
                                    className="px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            {/* Social Buttons */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <button
                                    onClick={shareWhatsApp}
                                    className="py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                                >
                                    Share on WhatsApp
                                </button>
                                <button
                                    onClick={shareFacebook}
                                    className="py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Share on Facebook
                                </button>
                            </div>

                            {/* Bonus Actions */}
                            <div className="space-y-3 mb-6">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Bonus Actions:
                                </h3>
                                <a
                                    href="https://likklelegends.com/signup"
                                    className="flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                                >
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm">Create a free account</span>
                                        <span className="text-xs text-gray-500 block">+25 bonus points</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-purple-500" />
                                </a>
                                <a
                                    href={`https://www.instagram.com/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                                >
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm">Follow on Instagram</span>
                                        <span className="text-xs text-gray-500 block">+10 bonus points</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-pink-500" />
                                </a>
                            </div>

                            <button
                                onClick={() => setStep("leaderboard")}
                                className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                View Leaderboard
                            </button>
                        </div>
                    )}

                    {step === "leaderboard" && (
                        <div className="p-8 md:p-10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Leaderboard
                                </h2>
                                {entry && (
                                    <button
                                        onClick={() => setStep("share")}
                                        className="text-sm font-bold text-orange-500 hover:text-orange-600"
                                    >
                                        Back to Sharing
                                    </button>
                                )}
                            </div>

                            {leaderboard.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-bold">No entries yet</p>
                                    <p className="text-sm">Be the first to enter!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-4 p-4 rounded-xl ${i === 0
                                                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200"
                                                : i < 5
                                                    ? "bg-gray-50"
                                                    : "bg-white border border-gray-100"
                                                }`}
                                        >
                                            <span className={`text-xl font-black ${i === 0 ? "text-yellow-500" : i < 3 ? "text-gray-400" : "text-gray-300"}`}>
                                                #{i + 1}
                                            </span>
                                            <div className="flex-1">
                                                <span className="font-bold text-gray-800">{entry.email}</span>
                                                <span className="text-xs text-gray-400 block">
                                                    {entry.referral_count || 0} referrals
                                                </span>
                                            </div>
                                            <span className="font-black text-orange-500">{entry.total_points} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!entry && (
                                <button
                                    onClick={() => setStep("enter")}
                                    className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Enter the Giveaway
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-white/60 mt-6">
                    Contest ends when announced. Winners contacted by email.
                    <br />
                    Powered by <a href="https://likklelegends.com" className="underline">Likkle Legends</a>
                </p>
            </div>
        </div>
    );
}
