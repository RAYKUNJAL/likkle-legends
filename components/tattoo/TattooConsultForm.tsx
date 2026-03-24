"use client";

import { FormEvent, useState } from "react";

type LeadResponse = {
  success: boolean;
  message: string;
  recommendedOffer: string;
  nextStep: string;
};

const initialForm = {
  serviceGoal: "half_sleeve",
  placement: "arm",
  style: "black and grey",
  timeline: "this month",
  budget: "$500+",
  name: "",
  email: "",
  phone: "",
  details: "",
};

export function TattooConsultForm() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<LeadResponse | null>(null);
  const [form, setForm] = useState(initialForm);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setResult(null);

    try {
      const response = await fetch("/api/tattoo-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as LeadResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Lead capture failed.");
      }

      setResult(payload);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unable to submit right now.",
        recommendedOffer: "",
        nextStep: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                step >= item
                  ? "border-[#d4a574] bg-[#d4a574] text-[#140f0d]"
                  : "border-white/15 text-stone-400"
              }`}
            >
              {item}
            </div>
            {item < 3 ? <div className="h-px w-8 bg-white/10" /> : null}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-stone-300">What are you booking for?</span>
            <select
              value={form.serviceGoal}
              onChange={(event) => updateField("serviceGoal", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="half_sleeve">Half sleeve</option>
              <option value="flash_special">2 for $100 flash</option>
              <option value="custom_piece">Custom piece</option>
              <option value="cover_up">Cover up</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Placement</span>
            <select
              value={form.placement}
              onChange={(event) => updateField("placement", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="arm">Arm</option>
              <option value="forearm">Forearm</option>
              <option value="leg">Leg</option>
              <option value="chest">Chest</option>
              <option value="hand">Hand</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Style</span>
            <input
              value={form.style}
              onChange={(event) => updateField("style", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="Black and grey, fine line, script..."
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Timeline</span>
            <select
              value={form.timeline}
              onChange={(event) => updateField("timeline", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="this week">This week</option>
              <option value="this month">This month</option>
              <option value="next month">Next month</option>
              <option value="just researching">Just researching</option>
            </select>
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-stone-300">Budget</span>
            <select
              value={form.budget}
              onChange={(event) => updateField("budget", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            >
              <option value="$100">Around $100</option>
              <option value="$250">$250+</option>
              <option value="$500+">$500+</option>
              <option value="$800+">$800+</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="Your name"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="you@example.com"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-stone-300">Phone</span>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="Best callback number"
            />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <label className="block space-y-2">
          <span className="text-sm text-stone-300">Tell us about the tattoo</span>
          <textarea
            value={form.details}
            onChange={(event) => updateField("details", event.target.value)}
            className="min-h-40 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
            placeholder="Describe the concept, references, vibe, and anything that matters for the consult."
          />
        </label>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:bg-white/5"
          >
            Back
          </button>
        ) : null}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            className="rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d]"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d] disabled:opacity-60"
          >
            {status === "loading" ? "Sending..." : "Get My Recommendation"}
          </button>
        )}
      </div>

      {result ? (
        <div
          className={`rounded-[1.5rem] border p-5 ${
            status === "success"
              ? "border-[#d4a574]/40 bg-[#d4a574]/10"
              : "border-red-400/30 bg-red-500/10"
          }`}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-stone-300">Consult Result</p>
          <p className="mt-3 text-xl font-bold text-white">{result.message}</p>
          {result.recommendedOffer ? (
            <p className="mt-3 text-sm text-stone-200">Best fit: {result.recommendedOffer}</p>
          ) : null}
          {result.nextStep ? <p className="mt-2 text-sm text-stone-300">{result.nextStep}</p> : null}
        </div>
      ) : null}
    </form>
  );
}
