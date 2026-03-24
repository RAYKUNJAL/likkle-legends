"use client";

import { useState } from "react";
import { Sparkles, Copy, CheckCircle, RefreshCw, Clock, Hash } from "lucide-react";

interface SocialPost {
    day: string;
    theme: string;
    caption: string;
    hashtags: string[];
    callToAction: string;
    suggestedTime: string;
}

const DAY_COLORS: Record<string, string> = {
    Monday: "bg-green-50 border-green-200",
    Tuesday: "bg-blue-50 border-blue-200",
    Wednesday: "bg-orange-50 border-orange-200",
    Thursday: "bg-purple-50 border-purple-200",
    Friday: "bg-yellow-50 border-yellow-200",
    Saturday: "bg-pink-50 border-pink-200",
    Sunday: "bg-indigo-50 border-indigo-200",
};

export default function SocialPostsAdmin() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [error, setError] = useState("");

    const generatePosts = async () => {
        setIsGenerating(true);
        setError("");

        try {
            // Get auth token from cookie/session
            const response = await fetch("/api/admin/social/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer admin`,
                },
            });

            if (!response.ok) throw new Error("Generation failed");

            const data = await response.json();
            setPosts(data.posts);
        } catch (err: any) {
            setError(err.message || "Failed to generate posts");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyPost = (index: number, post: SocialPost) => {
        const fullText = `${post.caption}\n\n${post.hashtags.join(" ")}`;
        navigator.clipboard.writeText(fullText);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Social Content Generator</h1>
                        <p className="text-gray-500 mt-1">AI-generated social media posts for the week</p>
                    </div>
                    <button
                        onClick={generatePosts}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5" />
                        )}
                        {isGenerating ? "Generating..." : "Generate This Week's Posts"}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {posts.length === 0 && !isGenerating && (
                    <div className="text-center py-20">
                        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-400 mb-2">No posts yet</h2>
                        <p className="text-gray-400">
                            Click "Generate This Week's Posts" to create 7 days of social content
                        </p>
                    </div>
                )}

                {/* Posts Grid */}
                <div className="space-y-4">
                    {posts.map((post, index) => (
                        <div
                            key={index}
                            className={`border-2 rounded-2xl p-6 ${DAY_COLORS[post.day] || "bg-white border-gray-200"}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-black text-lg text-gray-900">{post.day}</span>
                                        <span className="text-xs font-bold text-gray-500 uppercase bg-white/60 px-2 py-1 rounded-lg">
                                            {post.theme}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>Best time: {post.suggestedTime}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => copyPost(index, post)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    {copiedIndex === index ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Caption */}
                            <div className="bg-white rounded-xl p-4 mb-4 whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                                {post.caption}
                            </div>

                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {post.hashtags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-white/80 rounded-lg text-xs font-semibold text-blue-600"
                                    >
                                        <Hash className="w-3 h-3" />
                                        {tag.replace("#", "")}
                                    </span>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="text-xs text-gray-500">
                                <span className="font-bold">CTA:</span> {post.callToAction}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
