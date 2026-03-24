import type { Metadata } from "next";
import { TattooSiteShell } from "@/components/tattoo/TattooSiteShell";
import { TATTOO_BOOKING_URL } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "$500 Half Sleeve Offer",
  description:
    "Half sleeve tattoo offer with clear next steps for consultation and booking.",
};

export default function HalfSleeveOfferPage() {
  return (
    <TattooSiteShell
      eyebrow="Signature Offer"
      title="$500 Half Sleeve Offer"
      description="Perfect for clients ready to start a bigger custom piece with planning, placement discussion, and a clear appointment path."
    >
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            "Ideal for medium-to-large custom designs",
            "Bring references and we help shape the final concept",
            "Book online and lock in your consultation time",
          ].map((item) => (
            <div key={item} className="rounded-[2rem] border border-white/10 bg-white/5 p-7 text-stone-200">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
          <h2 className="text-3xl font-black uppercase text-white">What to expect</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-stone-300">
              We review your idea, placement, and style direction before tattoo day so you show up prepared.
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-stone-300">
              If you are ready, choose a consultation time and we will take it from there.
            </div>
          </div>
          <a
            href={TATTOO_BOOKING_URL}
            className="mt-8 inline-flex rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d]"
          >
            Book Half-Sleeve Consult
          </a>
        </div>
      </section>
    </TattooSiteShell>
  );
}
