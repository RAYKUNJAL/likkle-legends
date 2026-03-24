import type { Metadata } from "next";
import { TattooSiteShell } from "@/components/tattoo/TattooSiteShell";

export const metadata: Metadata = {
  title: "Tattoo Aftercare",
  description:
    "Simple tattoo aftercare instructions for a safe, clean healing process.",
};

export default function AftercarePage() {
  return (
    <TattooSiteShell
      eyebrow="Aftercare"
      title="Tattoo aftercare made simple."
      description="Follow these steps after your appointment to protect your tattoo and help it heal cleanly."
    >
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            "Keep the area clean and follow the artist’s instructions for washing and moisturizing.",
            "Avoid picking, soaking, or heavy friction while the tattoo is healing.",
            "Protect fresh tattoos from sun exposure while the skin settles.",
            "Contact the studio if healing does not look normal or if you have aftercare questions.",
          ].map((tip, index) => (
            <div key={tip} className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">Step {index + 1}</p>
              <p className="mt-4 text-base leading-8 text-stone-200">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </TattooSiteShell>
  );
}
