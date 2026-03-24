"use client";

import { FormEvent, useState } from "react";

type SeoPayload = {
  title: string;
  metaDescription: string;
  outline: string[];
};

export function TattooSeoGenerator() {
  const [topic, setTopic] = useState("best tattoo shop in island city");
  const [result, setResult] = useState<SeoPayload | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tattoo-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const payload = (await response.json()) as SeoPayload & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "SEO generation failed.");
      }

      setResult(payload);
    } catch {
      setResult({
        title: "Tattoo SEO generator is temporarily unavailable",
        metaDescription:
          "The route is in place, but a live AI key is needed for dynamic article strategy generation.",
        outline: [
          "Local tattoo intent keyword targeting",
          "Offer-based landing pages for flash and sleeve work",
          "Aftercare, pricing, and style education content",
        ],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none"
          placeholder="tattoo aftercare tips for first timers"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#f5e6c8] px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d] disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate SEO Angle"}
        </button>
      </form>

      {result ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-[#120f0e] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Suggested content</p>
          <h4 className="mt-3 text-xl font-bold text-white">{result.title}</h4>
          <p className="mt-3 text-sm leading-7 text-stone-300">{result.metaDescription}</p>
          <div className="mt-4 space-y-2">
            {result.outline.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
