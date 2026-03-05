"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { FeatureSuiteSlug } from "@/lib/feature-suites";

interface GeneratedModule {
    title: string;
    island: string;
    theme: string;
    source: string;
    storyTitle: string;
    printableTitle: string;
    videoTitle: string;
}

export default function SuiteAIGenerator({
    suite,
    suiteTitle,
}: {
    suite: FeatureSuiteSlug;
    suiteTitle: string;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [module, setModule] = useState<GeneratedModule | null>(null);

    const generate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/features/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ suite, ageGroup: "big" }),
            });

            if (!res.ok) {
                throw new Error("Generation request failed");
            }

            const data = await res.json();
            setModule(data.module);
        } catch (e: any) {
            setError(e?.message || "Unable to generate module right now.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-xl font-black text-white">AI Content Generator</h3>
                    <p className="text-sm text-white/70">
                        Generate a fresh {suiteTitle} module with story, printable, and lesson script.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={generate}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {loading ? "Generating..." : "Generate Module"}
                </button>
            </div>

            {error && (
                <p className="mt-4 rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </p>
            )}

            {module && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-deep/60 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-primary">Story</p>
                        <p className="mt-1 font-bold text-white">{module.storyTitle}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-deep/60 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-primary">Printable</p>
                        <p className="mt-1 font-bold text-white">{module.printableTitle}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-deep/60 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-primary">Lesson Script</p>
                        <p className="mt-1 font-bold text-white">{module.videoTitle}</p>
                    </div>
                    <p className="sm:col-span-3 text-xs text-white/60">
                        Generated for {module.island} | Theme: {module.theme} | Source: {module.source}
                    </p>
                </div>
            )}
        </div>
    );
}
