import type { Metadata } from "next";
import { TattooSiteShell } from "@/components/tattoo/TattooSiteShell";
import { TattooConsultForm } from "@/components/tattoo/TattooConsultForm";
import { TATTOO_BOOKING_URL } from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "Book a Tattoo Appointment",
  description:
    "Book your tattoo appointment online or send a custom quote request.",
};

export default function BookPage() {
  return (
    <TattooSiteShell
      eyebrow="Appointments"
      title="Book your tattoo appointment online."
      description="Choose your date in our live scheduler, or send a custom quote request if your design needs planning first."
    >
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5e6c8]">Live Booking</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none text-white">
              Pick your appointment time now.
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-200">
              Use the scheduler below for the fastest booking. If you are planning a larger custom design, use the quote form on the right.
            </p>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20">
              <iframe
                src={TATTOO_BOOKING_URL}
                title="Acuity Tattoo Booking"
                className="h-[38rem] w-full"
                loading="lazy"
              />
            </div>
            <a
              href={TATTOO_BOOKING_URL}
              className="mt-5 inline-flex rounded-full border border-[#d4a574]/60 px-5 py-3 text-sm font-semibold text-[#f5e6c8] transition hover:bg-[#d4a574] hover:text-[#140f0d]"
            >
              Open Full Booking Page
            </a>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5e6c8]">Custom Quote</p>
            <h3 className="mt-3 text-2xl font-black uppercase text-white">Need design guidance first?</h3>
            <p className="mt-3 mb-6 text-sm leading-7 text-stone-300">
              Share your idea, size, placement, and budget. We will point you to the right appointment type.
            </p>
            <TattooConsultForm />
          </div>
        </div>
      </section>
    </TattooSiteShell>
  );
}
