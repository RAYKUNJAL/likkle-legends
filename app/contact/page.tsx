import type { Metadata } from "next";
import { TattooSiteShell } from "@/components/tattoo/TattooSiteShell";
import {
  TATTOO_BOOKING_URL,
  TATTOO_GALLERY_IMAGES,
  TATTOO_SOCIAL_LINKS,
  TATTOO_STUDIO_ADDRESS,
  TATTOO_STUDIO_EMAIL,
  TATTOO_STUDIO_PHONE,
} from "@/lib/tattoo-site";

export const metadata: Metadata = {
  title: "Contact Island City Tattoos",
  description:
    "Contact Island City Tattoos or book directly online.",
};

export default function ContactPage() {
  return (
    <TattooSiteShell
      eyebrow="Contact"
      title="Questions before you book? Contact us here."
      description="For fastest service, use our online booking page. If you have questions, call or email the studio."
    >
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">Studio Contact</p>
            <div className="mt-6 space-y-4 text-stone-200">
              <p>Email: {TATTOO_STUDIO_EMAIL}</p>
              <p>Phone: {TATTOO_STUDIO_PHONE}</p>
              <p>Address: {TATTOO_STUDIO_ADDRESS}</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
            <h2 className="text-3xl font-black uppercase text-white">Ready to book?</h2>
            <p className="mt-4 text-base leading-8 text-stone-300">
              Pick your appointment time directly through our live scheduler.
            </p>
            <a
              href={TATTOO_BOOKING_URL}
              className="mt-8 inline-flex rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d]"
            >
              Open Booking Calendar
            </a>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">Follow Our Artists</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {TATTOO_SOCIAL_LINKS.map((profile) => (
                <a
                  key={profile.url}
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-200 transition hover:border-[#d4a574]/60 hover:text-white"
                >
                  {profile.handle}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TATTOO_GALLERY_IMAGES.slice(0, 4).map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="h-36 w-full rounded-2xl border border-white/10 object-cover"
              />
            ))}
          </div>
        </div>
      </section>
    </TattooSiteShell>
  );
}
