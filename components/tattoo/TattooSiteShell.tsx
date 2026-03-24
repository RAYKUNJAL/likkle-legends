import Link from "next/link";
import { MapPin, Clock3, Instagram } from "lucide-react";
import {
  TATTOO_BOOKING_URL,
  TATTOO_STUDIO_ADDRESS,
  TATTOO_SOCIAL_LINKS,
  TATTOO_STUDIO_NAME,
} from "@/lib/tattoo-site";

export function TattooSiteShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0d0a09] text-stone-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-7rem] h-[24rem] w-[24rem] rounded-full bg-[#7a1c1c]/30 blur-3xl" />
        <div className="absolute right-[-8%] top-[20rem] h-[22rem] w-[22rem] rounded-full bg-[#d97706]/15 blur-3xl" />
      </div>

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="block">
            <p className="text-xs uppercase tracking-[0.35em] text-[#d4a574]">{TATTOO_STUDIO_NAME}</p>
            <p className="mt-1 text-sm text-stone-400">Custom tattoos in Baltimore</p>
          </Link>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            <a href={TATTOO_BOOKING_URL} className="transition hover:text-white">Book</a>
            <Link href="/offers/half-sleeve" className="transition hover:text-white">Half Sleeve</Link>
            <Link href="/offers/flash-special" className="transition hover:text-white">Flash Offer</Link>
            <Link href="/aftercare" className="transition hover:text-white">Aftercare</Link>
            <Link href="/contact" className="transition hover:text-white">Contact</Link>
          </nav>
          <a
            href={TATTOO_BOOKING_URL}
            className="rounded-full border border-[#d4a574]/60 px-5 py-2 text-sm font-semibold text-[#f5e6c8] transition hover:bg-[#d4a574] hover:text-[#140f0d]"
          >
            Book Appointment
          </a>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">{eyebrow}</p>
          <h1 className="mt-4 max-w-5xl font-montserrat text-5xl font-black uppercase leading-[0.95] text-[#f8f3ea] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-300">{description}</p>
        </section>
        {children}
      </main>

      <footer className="relative border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm text-stone-400 lg:grid-cols-3 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">{TATTOO_STUDIO_NAME}</p>
            <p className="mt-3 max-w-sm leading-7">
              Clean lines, bold black and grey, and custom pieces designed to fit your style and placement.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#d4a574]" />
              {TATTOO_STUDIO_ADDRESS}
            </div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#d4a574]" />
              Open by appointment
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-[#d4a574]" />
              Follow flash drops on Instagram
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href={TATTOO_BOOKING_URL} className="hover:text-white">Book</a>
            <Link href="/aftercare" className="hover:text-white">Aftercare</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            {TATTOO_SOCIAL_LINKS.slice(0, 2).map((profile) => (
              <a key={profile.url} href={profile.url} target="_blank" rel="noreferrer" className="hover:text-white">
                {profile.handle}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
