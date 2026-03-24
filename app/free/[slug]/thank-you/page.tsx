"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Download, CheckCircle, ArrowRight, Clock, Star, Sparkles } from "lucide-react";
import Link from "next/link";

const DOWNLOAD_SLUGS: Record<string, {
    title: string;
    downloadId: string;
    upsellTitle: string;
    upsellDescription: string;
    upsellPrice: string;
    upsellLink: string;
}> = {
    "caribbean-abc": {
        title: "Caribbean ABC Coloring Pack",
        downloadId: "caribbean-abc-coloring-pack",
        upsellTitle: "Get 30+ More Printables + AI Stories",
        upsellDescription: "Unlock unlimited printable worksheets, personalized Caribbean stories, and AI buddy chat for your child. Everything in the Digital Legends plan.",
        upsellPrice: "$4.99/mo",
        upsellLink: "/checkout?plan=starter_mailer",
    },
    "classroom-pack": {
        title: "Caribbean Classroom Activity Pack",
        downloadId: "classroom-activity-pack",
        upsellTitle: "Get 100+ Classroom Resources",
        upsellDescription: "Access our full library of Caribbean educational printables, lesson plans, and cultural activities. Free for educators.",
        upsellPrice: "Free",
        upsellLink: "/signup?plan=free&user_type=teacher",
    },
};

export default function ThankYouPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const config = DOWNLOAD_SLUGS[slug];
    const email = searchParams.get("email") || "";
    const name = searchParams.get("name") || "Legend";

    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const [countdown, setCountdown] = useState(15 * 60); // 15 minute countdown for urgency

    // Auto-trigger download on page load
    useEffect(() => {
        if (config && email) {
            triggerDownload();
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const triggerDownload = async () => {
        if (!config || downloading) return;
        setDownloading(true);

        try {
            const response = await fetch(
                `/api/free-download?id=${config.downloadId}&email=${encodeURIComponent(email)}`
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${config.title.replace(/\s+/g, "-")}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                setDownloaded(true);
            }
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    };

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <p className="text-xl text-gray-500">Page not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50">
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
                {/* Download Confirmation */}
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                        Your Download is Ready!
                    </h1>
                    <p className="text-gray-500 text-lg mb-8">
                        Hi {name}! Your <strong>{config.title}</strong> should start downloading automatically.
                    </p>

                    {/* Download Button (backup) */}
                    <button
                        onClick={triggerDownload}
                        disabled={downloading}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        {downloading ? "Downloading..." : downloaded ? "Download Again" : "Download Now"}
                    </button>

                    <p className="text-sm text-gray-400 mt-4">
                        We also sent a copy to <strong>{email}</strong>
                    </p>
                </div>

                {/* Upsell Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-white relative overflow-hidden">
                    {/* Urgency Banner */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-yellow-500 py-2 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                            <Clock className="w-4 h-4" />
                            <span>Special offer expires in {formatTime(countdown)}</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                                Exclusive Offer for New Members
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black mb-3">
                            {config.upsellTitle}
                        </h2>
                        <p className="text-gray-300 mb-6 text-lg">
                            {config.upsellDescription}
                        </p>

                        {/* Value Stack */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: "📚", label: "30+ Printables" },
                                { icon: "🤖", label: "AI Story Buddy" },
                                { icon: "🎵", label: "Caribbean Music" },
                                { icon: "🏆", label: "XP & Badges" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white/10 rounded-xl p-3 flex items-center gap-2"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="text-sm font-semibold">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Price + CTA */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href={config.upsellLink}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Start 7-Day Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <div className="text-center sm:text-left">
                                <div className="text-2xl font-black text-yellow-400">{config.upsellPrice}</div>
                                <div className="text-xs text-gray-400">after 7-day free trial</div>
                            </div>
                        </div>

                        {/* Trust */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" /> Cancel anytime
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> No commitment
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Share */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm mb-3">Know a parent who'd love this?</p>
                    <div className="flex items-center justify-center gap-3">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this free Caribbean ABC Coloring Pack for kids! https://likklelegends.com/free/${slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                        >
                            Share on WhatsApp
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://likklelegends.com/free/${slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
                        >
                            Share on Facebook
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
