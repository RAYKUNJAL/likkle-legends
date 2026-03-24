"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Gift, CheckCircle, Download, Star, Sparkles } from "lucide-react";

const LEAD_MAGNETS: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
    image: string;
    leadMagnetId: string;
}> = {
    "caribbean-abc": {
        title: "Free Caribbean ABC Coloring Pack",
        subtitle: "5 Beautiful Activity Sheets for Your Likkle Legend",
        description: "Teach your child the alphabet with Caribbean culture, animals, and landmarks. Perfect for ages 4-8.",
        bullets: [
            "5 hand-crafted coloring & activity pages",
            "Learn letters with Caribbean animals & culture",
            "Print at home — instant download",
            "Perfect for ages 4-8",
        ],
        image: "/images/lead-magnets/caribbean-abc-preview.png",
        leadMagnetId: "caribbean-abc-coloring-pack",
    },
    "classroom-pack": {
        title: "Free Caribbean Classroom Activity Pack",
        subtitle: "Multicultural Learning Resources for Your Students",
        description: "Bring Caribbean culture into your classroom with printable worksheets, coloring pages, and cultural discovery activities.",
        bullets: [
            "10 classroom-ready printable activities",
            "Aligned with early learning standards",
            "Multicultural education resources",
            "Word searches, mazes & coloring pages",
        ],
        image: "/images/lead-magnets/classroom-pack-preview.png",
        leadMagnetId: "classroom-activity-pack",
    },
};

export default function LeadMagnetPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const magnet = LEAD_MAGNETS[slug];

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!magnet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
                <p className="text-xl text-gray-500">Lead magnet not found.</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
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
            const response = await fetch("/api/lead-capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    first_name: firstName || undefined,
                    source: "lead_magnet_page",
                    lead_magnet_id: magnet.leadMagnetId,
                    utm_source: searchParams.get("utm_source") || undefined,
                    utm_medium: searchParams.get("utm_medium") || undefined,
                    utm_campaign: searchParams.get("utm_campaign") || undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to submit");

            setSuccess(true);
            // Redirect to thank-you page after brief delay
            setTimeout(() => {
                window.location.href = `/free/${slug}/thank-you?email=${encodeURIComponent(email)}&name=${encodeURIComponent(firstName)}`;
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full text-sm font-bold text-orange-600 mb-6 shadow-sm">
                        <Gift className="w-4 h-4" />
                        100% Free — No Credit Card Required
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
                        {magnet.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        {magnet.subtitle}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Left: Preview + Bullets */}
                    <div>
                        {/* Preview Image */}
                        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                            <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                <img
                                    src={magnet.image}
                                    alt={magnet.title}
                                    className="w-full h-full object-cover rounded-2xl"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex flex-col items-center gap-3 text-orange-400"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="font-bold text-lg">Preview</span></div>`;
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bullet Points */}
                        <div className="space-y-3">
                            {magnet.bullets.map((bullet, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-gray-700 font-medium">{bullet}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-yellow-300 border-2 border-white" />
                                ))}
                            </div>
                            <span className="font-semibold">Joined by 5,000+ island families</span>
                        </div>
                    </div>

                    {/* Right: Email Capture Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8">
                        {!success ? (
                            <>
                                <div className="flex items-center gap-2 mb-2">
                                    <Download className="w-5 h-5 text-orange-500" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                                        Instant Download
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-2">
                                    Get Your Free Pack
                                </h2>
                                <p className="text-gray-500 text-sm mb-6">
                                    {magnet.description}
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                            First Name (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-sm">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-black text-lg shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        {isSubmitting ? "Preparing your download..." : "Download Free Pack"}
                                    </button>

                                    <p className="text-xs text-gray-400 text-center">
                                        By downloading, you agree to receive emails from Likkle Legends.
                                        Unsubscribe anytime. We respect your privacy.
                                    </p>
                                </form>

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Instant Download
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> No Spam Ever
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                    Success!
                                </h3>
                                <p className="text-gray-500">
                                    Redirecting to your download...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
