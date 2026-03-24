import Link from "next/link";
import {
  Sparkles,
  BadgeDollarSign,
  Clock3,
  MapPin,
  ShieldCheck,
  ArrowRight,
  PenTool,
  MessageSquareMore,
  Instagram,
} from "lucide-react";
import { TattooConsultForm } from "@/components/tattoo/TattooConsultForm";
import { TattooAiChat } from "@/components/tattoo/TattooAiChat";
import { ViralContestBuilder } from "@/components/tattoo/ViralContestBuilder";
import { CoverupCaseStudies } from "@/components/tattoo/CoverupCaseStudies";
import { TattooSeoGenerator } from "@/components/tattoo/TattooSeoGenerator";
import {
  TATTOO_BOOKING_URL,
  TATTOO_GALLERY_IMAGES,
  TATTOO_SOCIAL_LINKS,
  TATTOO_STUDIO_ADDRESS,
} from "@/lib/tattoo-site";

const offers = [
  {
    title: "$500 Half Sleeve Offer",
    description:
      "Best for clients ready to start a larger custom piece with clear placement and style direction.",
    badge: "Most Popular",
  },
  {
    title: "2 for $100 Flash Special",
    description:
      "Two simple tattoos that each fit within a business-card size. Great for matching pieces and quick sessions.",
    badge: "Limited Offer",
  },
];

const services = [
  "Custom black and grey",
  "Fine line flash",
  "Script and small symbols",
  "Cover-up consultations",
  "Half-sleeve design planning",
  "Touch-up appointments",
  "Aftercare support",
];

const faqs = [
  {
    question: "How does the $500 half-sleeve offer work?",
    answer:
      "Book your consultation, share your reference ideas, and we will map out style, placement, and session planning before your appointment.",
  },
  {
    question: "What counts for the 2 for $100 offer?",
    answer:
      "Each tattoo must fit inside a business-card size area and use simple linework or flash-style artwork.",
  },
  {
    question: "Do I need an appointment?",
    answer:
      "Yes. We work by appointment so you get dedicated artist time and a smoother experience from consult to finish.",
  },
];

export function TattooLandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0a09] text-stone-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[#7a1c1c]/35 blur-3xl" />
        <div className="absolute right-[-8%] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-[#d97706]/20 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[22%] h-[24rem] w-[24rem] rounded-full bg-[#f5e6c8]/10 blur-3xl" />
      </div>

      <header className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#d4a574]">Island City Tattoos</p>
            <p className="mt-1 text-sm text-stone-400">Custom work, flash drops, and online consults</p>
          </div>
          <nav className="hidden gap-6 text-sm text-stone-300 md:flex">
            <a href="#offers" className="transition hover:text-white">Offers</a>
            <a href="#gallery" className="transition hover:text-white">Gallery</a>
            <a href="#artists" className="transition hover:text-white">Artists</a>
            <a href="#hiring" className="transition hover:text-white">Hiring</a>
            <a href="#contest" className="transition hover:text-white">Contest</a>
            <a href="#seo-engine" className="transition hover:text-white">SEO Engine</a>
            <a href="#coverup-cases" className="transition hover:text-white">Cover-Ups</a>
            <a href="#consult" className="transition hover:text-white">Consult</a>
            <a href="#questions" className="transition hover:text-white">Questions</a>
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
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-stone-300">
              <Sparkles className="h-4 w-4 text-[#d4a574]" />
              Baltimore Custom Tattoo Studio
            </div>
            <h1 className="mt-8 max-w-4xl font-montserrat text-5xl font-black uppercase leading-[0.95] text-[#f8f3ea] sm:text-6xl xl:text-7xl">
              Custom tattoos done clean, bold, and built for your style.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
              Book your appointment online, choose the offer that fits your tattoo goals, and get clear next steps before you come in.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={TATTOO_BOOKING_URL}
                className="inline-flex items-center gap-2 rounded-full bg-[#f5e6c8] px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#140f0d] transition hover:bg-white"
              >
                Book Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#questions"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-bold uppercase tracking-[0.2em] text-stone-100 transition hover:border-[#d4a574]/60 hover:bg-white/10"
              >
                Ask Before You Book
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-black text-[#f5e6c8]">2</p>
                <p className="mt-2 text-sm text-stone-300">Simple offers so you know exactly what to book.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-black text-[#f5e6c8]">1:1</p>
                <p className="mt-2 text-sm text-stone-300">Artist attention from consult through final tattoo.</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-3xl font-black text-[#f5e6c8]">100%</p>
                <p className="mt-2 text-sm text-stone-300">Appointments booked online through our live scheduler.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs">
              {TATTOO_SOCIAL_LINKS.slice(0, 4).map((profile) => (
                <a
                  key={profile.url}
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-stone-200 transition hover:border-[#d4a574]/60 hover:text-white"
                >
                  <Instagram className="h-3 w-3 text-[#d4a574]" />
                  {profile.handle}
                </a>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-stone-400">
              <Link href="/offers/half-sleeve" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                Half Sleeve
              </Link>
              <Link href="/offers/flash-special" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                Flash Offer
              </Link>
              <Link href="/book" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                Booking Details
              </Link>
              <a href="#contest" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                Contest
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#d4a574]">Booking Snapshot</p>
                <h2 className="mt-2 text-2xl font-bold text-[#f8f3ea]">Know your options before you book</h2>
              </div>
              <BadgeDollarSign className="h-10 w-10 text-[#d4a574]" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#120f0e] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Primary offer</p>
                  <Clock3 className="h-4 w-4 text-[#d4a574]" />
                </div>
                <p className="mt-3 text-3xl font-black text-white">$500 Half Sleeve</p>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  Best for clients ready for a larger piece and a full design conversation before tattoo day.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#120f0e] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Quick session offer</p>
                  <PenTool className="h-4 w-4 text-[#d4a574]" />
                </div>
                <p className="mt-3 text-3xl font-black text-white">2 for $100</p>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  Great for simple flash or matching pieces that fit inside business-card size.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Studio location</p>
                  <div className="mt-3 flex items-center gap-2 text-stone-200">
                    <MapPin className="h-4 w-4 text-[#d4a574]" />
                    {TATTOO_STUDIO_ADDRESS}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-400">Client care</p>
                  <div className="mt-3 flex items-center gap-2 text-stone-200">
                    <ShieldCheck className="h-4 w-4 text-[#d4a574]" />
                    Clear aftercare and prep instructions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="offers" className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Choose Your Offer</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-none text-[#f8f3ea]">
                Two clear ways to book.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-stone-300">
                If you want a larger custom piece, choose the half-sleeve offer. If you want smaller quick tattoos, choose the flash special.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {offers.map((offer) => (
                <article key={offer.title} className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-7">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#f5e6c8]">{offer.badge}</p>
                  <h3 className="mt-4 text-3xl font-black text-white">{offer.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-stone-200">{offer.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Recent Work</p>
            <h2 className="mt-3 text-4xl font-black uppercase text-[#f8f3ea]">See the style before you book</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-300">
              Real work from our artists. Bring reference photos and we will help shape your design for placement, skin tone, and long-term wear.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TATTOO_GALLERY_IMAGES.map((image) => (
              <a
                key={image.src}
                href={TATTOO_BOOKING_URL}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="border-t border-white/10 p-4 text-sm text-stone-200">
                  Book this style
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">What We Tattoo</p>
                <h2 className="mt-3 text-4xl font-black uppercase text-[#f8f3ea]">Styles our clients book most</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <div key={service} className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-stone-200">
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="artists" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f5e6c8]">Artist Social Links</p>
            <h2 className="mt-3 text-4xl font-black uppercase text-white">Book directly with the artist you want</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {TATTOO_SOCIAL_LINKS.map((profile) => (
                <a
                  key={profile.url}
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-[#d4a574]/60 hover:bg-black/30"
                >
                  <p className="text-sm font-semibold text-white">{profile.name}</p>
                  <p className="mt-1 text-sm text-stone-300">{profile.handle}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <CoverupCaseStudies />

        <section id="hiring" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Now Hiring</p>
            <h2 className="mt-3 text-4xl font-black uppercase text-white">We are looking for 2 tattoo artists</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-300">
              This is flat booth rent, not commission. Keep your profits. No split.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                Flat booth rent model
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                Keep 100% of your tattoo earnings
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-200">
                DM @ray_tattoos on Instagram for details
              </div>
            </div>
            <a
              href="https://www.instagram.com/ray_tattoos/"
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex rounded-full bg-[#f5e6c8] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#140f0d]"
            >
              Message @ray_tattoos
            </a>
          </div>
        </section>

        <section id="contest" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f5e6c8]">Lead Magnet + Email List</p>
              <h2 className="mt-3 text-4xl font-black uppercase text-white">
                Win a free cover-up strategy session
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-200">
                Enter to win a complementary cover-up consultation plus a custom design strategy. Each entrant receives a referral link to share, which increases their odds and fills our inbox with serious cover-up clients.
              </p>
              <div className="mt-6 space-y-3 text-sm text-stone-200">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Prize: cover-up consultation and layout plan at no charge
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Entry: email, tattoo details, and Instagram handle
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Boost entries by sharing your referral link
                </div>
              </div>
            </div>
            <ViralContestBuilder />
          </div>
        </section>

        <section id="seo-engine" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">AI SEO Growth</p>
              <h2 className="mt-3 text-4xl font-black uppercase text-white">
                Daily tattoo blog generator for local ranking and bookings
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-stone-300">
                The SEO agent researches tattoo intent keywords, creates posts, and supports a daily publishing rhythm.
                This feeds local search traffic into your consult and booking funnel.
              </p>
              <div className="mt-6 space-y-3 text-sm text-stone-200">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Route: <span className="font-semibold text-white">/api/cron/tattoo-seo-agent</span> for scheduled daily runs
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Manual trigger: <span className="font-semibold text-white">/api/tattoo-seo-agent/run</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  Published content lives in your blog feed for long-tail SEO growth.
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em]">
                <Link href="/blog" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                  Open Blog
                </Link>
                <a href="#consult" className="rounded-full border border-white/10 px-4 py-2 hover:text-white">
                  Funnel Entry
                </a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#d4a574]/20 bg-[linear-gradient(180deg,rgba(212,165,116,0.18),rgba(255,255,255,0.03))] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[#f5e6c8]">AI Topic Builder</p>
              <h3 className="mt-3 text-2xl font-black uppercase text-white">Generate SEO angles in seconds</h3>
              <p className="mt-3 text-sm leading-7 text-stone-200">
                Use this live assistant to map high-intent topics into booking-focused content briefs.
              </p>
              <div className="mt-5">
                <TattooSeoGenerator />
              </div>
            </div>
          </div>
        </section>

        <section id="questions" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Need Answers First?</p>
            <h2 className="mt-3 text-4xl font-black uppercase text-[#f8f3ea]">Ask questions before you choose your appointment</h2>
          </div>
          <div className="grid gap-6 xl:grid-cols-1">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur xl:max-w-4xl">
              <div className="mb-5 flex items-center gap-3">
                <MessageSquareMore className="h-5 w-5 text-[#d4a574]" />
                <div>
                  <h3 className="text-2xl font-bold text-white">Tattoo Q&A Assistant</h3>
                  <p className="text-sm text-stone-400">Ask about size limits, offer fit, prep, and booking options.</p>
                </div>
              </div>
              <TattooAiChat />
            </div>
          </div>
        </section>

        <section id="consult" className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(212,165,116,0.22),rgba(255,255,255,0.04))] p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f5e6c8]">Custom Quote Form</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-none text-white">Prefer to request a quote first?</h2>
              <p className="mt-5 text-base leading-8 text-stone-200">
                Send your idea, placement, and budget. We will review your request and point you to the right appointment type.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-stone-200">
                <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">Use this for custom concepts and larger tattoo planning.</li>
                <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">For fastest booking, use the live scheduler button above.</li>
                <li className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">We respond with recommended next steps based on your details.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-6">
              <TattooConsultForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Clarity</p>
              <p className="mt-4 text-2xl font-black text-white">Clear service pages so clients choose the right appointment quickly.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Booking</p>
              <p className="mt-4 text-2xl font-black text-white">Live Acuity scheduling for instant appointment requests.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">Support</p>
              <p className="mt-4 text-2xl font-black text-white">Quick answers on offers, sizing, and prep before you book.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="rounded-[2rem] border border-white/10 bg-[#120f0e] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4a574]">FAQ</p>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
