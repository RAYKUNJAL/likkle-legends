import type { Metadata } from "next";
import { TattooSiteShell } from "@/components/tattoo/TattooSiteShell";
import { TATTOO_BOOKING_URL } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "2 for $100 Tattoo Flash Special",
  description:
    "2 for $100 flash tattoo offer for simple designs that fit in business-card size.",
};

export default function FlashOfferPage() {
  return (
    <TattooSiteShell
      eyebrow="Flash Offer"
      title="2 for $100 tattoos that fit in a business card."
      description="Simple, fast, and clear. Great for matching pieces, small symbols, and quick flash sessions."
    >
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-8">
          <h2 className="text-3xl font-black uppercase text-white">Offer details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-stone-200">
              Each tattoo must fit inside business-card size.
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-stone-200">
              Best for simple linework, symbols, and matching mini designs.
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-stone-200">
              Choose your appointment time online and we confirm details with you.
            </div>
          </div>
          <a
            href={TATTOO_BOOKING_URL}
            className="mt-8 inline-flex rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d]"
          >
            Claim Flash Special
          </a>
        </div>
      </section>
    </TattooSiteShell>
  );
}
