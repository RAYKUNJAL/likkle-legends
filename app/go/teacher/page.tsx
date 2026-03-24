"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle, Users, Award, Globe } from "lucide-react";

export default function TeacherAdLanding() {
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
                    user_type: "teacher",
                    source: "facebook_ad_teachers",
                    lead_magnet_id: "classroom-activity-pack",
                    utm_source: searchParams.get("utm_source") || "facebook",
                    utm_medium: searchParams.get("utm_medium") || "paid",
                    utm_campaign: searchParams.get("utm_campaign") || "teacher",
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to submit");

            setSuccess(true);
            setTimeout(() => {
                window.location.href = `/free/classroom-pack/thank-you?email=${encodeURIComponent(email)}&name=${encodeURIComponent(firstName)}`;
            }, 800);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black mb-2">You're In!</h2>
                    <p className="text-gray-500">Redirecting to your free resources...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                            <BookOpen className="w-3.5 h-3.5" />
                            FREE FOR EDUCATORS
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                            Free Caribbean Classroom Activity Pack
                        </h1>
                        <p className="text-blue-200 text-sm">
                            Multicultural Learning Resources for K-3
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
                                    placeholder="Your name"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors text-lg"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="School email address"
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors text-lg"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? "Processing..." : "Get Free Classroom Resources"}
                            </button>
                        </form>

                        {/* Value Props */}
                        <div className="mt-6 space-y-3">
                            {[
                                { icon: BookOpen, text: "10 print-ready activity worksheets" },
                                { icon: Globe, text: "Caribbean culture meets curriculum standards" },
                                { icon: Users, text: "Perfect for diverse classrooms" },
                                { icon: Award, text: "Used by educators in 12 countries" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <item.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 font-semibold">
                                Likkle Legends is always free for teachers and classrooms
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
