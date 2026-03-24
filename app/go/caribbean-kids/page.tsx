"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, CheckCircle, Star, Shield, Heart } from "lucide-react";

export default function CaribbeanKidsAdLanding() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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
                    source: "facebook_ad_parents",
                    lead_magnet_id: "caribbean-abc-coloring-pack",
                    utm_source: searchParams.get("utm_source") || "facebook",
                    utm_medium: searchParams.get("utm_medium") || "paid",
                    utm_campaign: searchParams.get("utm_campaign") || "caribbean-kids",
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to submit");

            setSuccess(true);
            setTimeout(() => {
                window.location.href = `/free/caribbean-abc/thank-you?email=${encodeURIComponent(email)}&name=${encodeURIComponent(firstName)}`;
            }, 800);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 via-yellow-500 to-green-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">You're In!</h2>
                    <p className="text-gray-500">Redirecting to your free download...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 via-yellow-500 to-green-500 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                            <Gift className="w-3.5 h-3.5" />
                            FREE DOWNLOAD
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                            Free Caribbean ABC Coloring Pack
                        </h1>
                        <p className="text-gray-300 text-sm">
                            for Your Likkle Legend (Ages 4-8)
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Your first name"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none transition-colors text-lg"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-black text-lg shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Processing..." : "Get My Free Coloring Pack"}
                            </button>
                        </form>

                        {/* Value Props */}
                        <div className="mt-6 space-y-2">
                            {[
                                { icon: Star, text: "5 beautiful Caribbean activity sheets" },
                                { icon: Heart, text: "Celebrate your child's heritage" },
                                { icon: Shield, text: "100% free — no credit card needed" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <item.icon className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social Proof */}
                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <div className="flex justify-center -space-x-2 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-yellow-300 border-2 border-white" />
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 font-semibold">
                                Trusted by 5,000+ Caribbean families worldwide
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-white/60 mt-4">
                    By downloading you agree to receive emails from Likkle Legends. Unsubscribe anytime.
                </p>
            </div>
        </div>
    );
}
