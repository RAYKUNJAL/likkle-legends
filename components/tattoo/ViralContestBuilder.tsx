"use client";

import { FormEvent, useEffect, useState } from "react";

type ContestResponse = {
  success: boolean;
  message: string;
  referralCode: string;
  referralUrl: string;
  prize: string;
};

export function ViralContestBuilder() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ContestResponse | null>(null);
  const [referrerCode, setReferrerCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagramHandle: "",
    tattooArea: "",
    coverupDetails: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referral = params.get("ref") || window.localStorage.getItem("tattoo_contest_ref") || "";
    if (referral) {
      setReferrerCode(referral);
      window.localStorage.setItem("tattoo_contest_ref", referral);
    }
  }, []);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setResult(null);

    try {
      const response = await fetch("/api/tattoo-contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, referrerCode }),
      });
      const payload = (await response.json()) as ContestResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to enter contest.");
      }
      setResult(payload);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Submission failed.",
        referralCode: "",
        referralUrl: "",
        prize: "",
      });
    }
  }

  async function copyLink() {
    if (!result?.referralUrl) {
      return;
    }
    await navigator.clipboard.writeText(result.referralUrl);
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">Viral Contest Builder</p>
      <h3 className="mt-3 text-2xl font-black uppercase text-white">Win a free cover-up consultation + design layout</h3>
      <p className="mt-3 text-sm leading-7 text-stone-300">
        Enter with your email, share your referral link, and bring new entries. No purchase necessary.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Full name"
          required
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="Email"
          required
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          placeholder="Phone (optional)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          value={form.instagramHandle}
          onChange={(event) => updateField("instagramHandle", event.target.value)}
          placeholder="Instagram handle"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          value={form.tattooArea}
          onChange={(event) => updateField("tattooArea", event.target.value)}
          placeholder="Tattoo area (ex: forearm cover-up)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none md:col-span-2"
        />
        <textarea
          value={form.coverupDetails}
          onChange={(event) => updateField("coverupDetails", event.target.value)}
          placeholder="Tell us about your current tattoo and what you want to change"
          className="min-h-28 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none md:col-span-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d] md:col-span-2 disabled:opacity-60"
        >
          {status === "loading" ? "Entering..." : "Enter Contest"}
        </button>
      </form>

      {result ? (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            status === "success" ? "border-[#d4a574]/50 bg-[#d4a574]/10" : "border-red-500/40 bg-red-500/10"
          }`}
        >
          <p className="text-sm text-white">{result.message}</p>
          {result.referralUrl ? (
            <>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-300">Your referral link</p>
              <p className="mt-1 break-all text-sm text-stone-200">{result.referralUrl}</p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-100"
              >
                Copy Link
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
