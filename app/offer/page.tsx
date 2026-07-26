import type { Metadata } from 'next';
import Link from 'next/link';
import OfferFAQ from '@/components/offer/OfferFAQ';

export const metadata: Metadata = {
  title: 'Caribbean Learning That Feels Like Home — Intro Mailer',
  description:
    'Stories, phonics, and Caribbean activities for kids 3–8. Built for diaspora families abroad. Start with the Intro Mailer today.',
  alternates: {
    canonical: 'https://www.likklelegends.com/offer',
  },
  openGraph: {
    title: 'Caribbean Learning That Feels Like Home — Intro Mailer',
    description:
      'Stories, phonics, and Caribbean activities for kids 3–8. Built for diaspora families abroad.',
    url: 'https://www.likklelegends.com/offer',
    siteName: 'Likkle Legends',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const CTA_LABEL = 'Start with the Intro Mailer';
const CTA_HREF = '/offer/checkout';

// Reusable CTA button — same warm gradient style repeated 5x across the page.
function CTAButton({
  label = CTA_LABEL,
  href = CTA_HREF,
  size = 'lg',
}: {
  label?: string;
  href?: string;
  size?: 'lg' | 'md';
}) {
  const base =
    'inline-flex items-center justify-center rounded-2xl font-montserrat font-extrabold text-white bg-gradient-to-r from-orange-400 to-amber-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all';
  const sizes = {
    lg: 'px-8 py-4 text-lg',
    md: 'px-6 py-3 text-base',
  };
  return (
    <Link href={href} className={`${base} ${sizes[size]}`}>
      🌴 {label}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section data
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_POINTS = [
  { emoji: '👶', label: 'Ages 3–8' },
  { emoji: '🌍', label: 'Caribbean diaspora families' },
  { emoji: '📖', label: 'Daily literacy practice' },
  { emoji: '🔐', label: 'Member portal access' },
];

const PROBLEM_BULLETS = [
  {
    emoji: '🏝️',
    text: 'Your child only hears Caribbean stories from grandparents — and you worry the culture will fade in the next generation.',
  },
  {
    emoji: '📚',
    text: 'Most learning apps feel generic and disconnected from who your family is. Nothing reflects home.',
  },
  {
    emoji: '⏰',
    text: 'Between work, school runs, and life, you do not have hours to plan culture lessons or hunt down phonics activities.',
  },
  {
    emoji: '💬',
    text: 'Your kids are picking up the local accent fast — and slowly losing the words, songs, and sayings that mean home to you.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Start with the Intro Mailer',
    body: 'A one-time purchase that unlocks your child\'s first personalized Caribbean story mailer, activity sheets, and portal preview.',
  },
  {
    n: '2',
    title: 'Meet the Legends',
    body: 'Your child joins Dilly, Tanty, R.O.T.I., Scorcha, and Mango on the member portal for read-aloud stories and learning activities.',
  },
  {
    n: '3',
    title: 'Learn & grow together',
    body: 'Each month brings a new mailer matched to your child\'s age band — phonics, stories, and activities that keep Caribbean culture alive at home.',
  },
];

const WHATS_INSIDE = [
  { emoji: '✉️', title: 'Personalized Story Mailer', body: 'A Caribbean-themed story mailed to your child, personalized with their name and heritage island.' },
  { emoji: '🎨', title: 'Printable Activity Sheets', body: 'Phonics, coloring, and counting worksheets matched to your child\'s age band (3–4, 4–6, 6–8).' },
  { emoji: '📖', title: 'Read-Aloud Story Library', body: 'Audio stories in the portal read by Caribbean voices — listen together or let your child explore solo.' },
  { emoji: '🧩', title: 'Learning Activities & Games', body: 'Flag matching, island trivia, and phonics games that turn screen time into culture time.' },
  { emoji: '🤖', title: 'Kid-Safe AI Buddy Chat', body: 'Your child chats with the five Legends in COPPA-compliant, parent-managed conversations.' },
  { emoji: '🏆', title: 'XP, Badges & Progress', body: 'Kids earn rewards and track reading streaks — so learning Caribbean culture feels like an adventure.' },
];

const AGE_BANDS = [
  {
    band: 'Ages 3–4 · Pre-readers',
    points: ['Letter recognition & sounds', 'Vocabulary building', 'Read-aloud Caribbean stories'],
  },
  {
    band: 'Ages 4–6 · Early readers',
    points: ['Blending & sight words', 'Simple Caribbean-themed sentences', 'Guided phonics activities'],
  },
  {
    band: 'Ages 6–8 · Growing readers',
    points: ['Reading fluency practice', 'Comprehension with Caribbean stories', 'Independent activity sheets'],
  },
];

const CHARACTERS = [
  { emoji: '⚡', name: 'Dilly' },
  { emoji: '👵🏾', name: 'Tanty' },
  { emoji: '🤖', name: 'R.O.T.I.' },
  { emoji: '🌶️', name: 'Scorcha' },
  { emoji: '🥭', name: 'Mango' },
];

const INCLUDED = [
  'Personalized Caribbean story mailer',
  'Printable activity sheets (your child\'s age band)',
  'Preview access to the member portal',
  'Meet all five Legends & try the buddy chat',
  'Read-aloud story library sample',
  '30-day money-back guarantee',
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OfferPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-white text-slate-800 font-montserrat">
      {/* 1. Header — minimal: logo + Member Login + Help only */}
      <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🌴</span>
            <span className="font-fredoka text-xl font-bold text-slate-900 sm:text-2xl">
              Likkle Legends
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link
              href="/login"
              className="font-montserrat font-semibold text-slate-600 hover:text-[var(--caribbean-mango)] transition-colors"
            >
              Member Login
            </Link>
            <Link
              href="/faq"
              className="font-montserrat font-semibold text-slate-600 hover:text-[var(--caribbean-mango)] transition-colors"
            >
              Help
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-1.5 font-montserrat text-xs font-bold uppercase tracking-wider text-[var(--caribbean-mango)] sm:text-sm">
                For Caribbean Families Abroad
              </p>
              <h1 className="font-fredoka text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Caribbean learning that feels like home for kids 3–8
              </h1>
              <p className="mx-auto mt-5 max-w-xl font-quicksand text-lg leading-relaxed text-slate-600 lg:mx-0">
                Stories, phonics, and hands-on activities that keep your child connected to
                Caribbean culture — wherever in the world your family lives now.
              </p>

              {/* CTA #1 */}
              <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                <CTAButton />
                <Link
                  href="/sample"
                  className="font-montserrat text-sm font-semibold text-slate-500 underline-offset-4 hover:text-[var(--caribbean-ocean)] hover:underline"
                >
                  Preview a Sample
                </Link>
                <p className="font-quicksand text-xs text-slate-500 sm:text-sm">
                  🌍 Digital access worldwide instantly · 🇺🇸 Physical mail ships to US within 48 hours
                </p>
              </div>
            </div>

            {/* Visual placeholder card */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-[var(--caribbean-sky)] via-amber-100 to-[var(--caribbean-papaya)] p-8 shadow-2xl">
                <div className="absolute -top-4 -right-4 rounded-full bg-white px-4 py-1 text-2xl shadow-lg">
                  🌴
                </div>
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="text-6xl" aria-hidden="true">📖</div>
                  <p className="font-fredoka text-xl font-bold text-slate-800">
                    Your child&apos;s first mailer
                  </p>
                  <ul className="space-y-2 font-quicksand text-sm font-semibold text-slate-700">
                    <li>✉️ Personalized story mailer</li>
                    <li>🎨 Activity sheets</li>
                    <li>🔓 Portal preview</li>
                  </ul>
                  <div className="mt-2 rounded-full bg-white/70 px-4 py-1.5 font-montserrat text-xs font-bold text-slate-600">
                    mailer · activity sheets · portal preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Hero trust block */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-amber-100 bg-white/80 p-4 shadow-sm sm:p-6">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {TRUST_POINTS.map((t) => (
              <li
                key={t.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-amber-50 px-3 py-4 text-center"
              >
                <span className="text-2xl" aria-hidden="true">{t.emoji}</span>
                <span className="font-montserrat text-xs font-bold text-slate-700 sm:text-sm">
                  {t.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Problem section */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-spice)]">
            The struggle is real
          </p>
          <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
            Raising Caribbean kids abroad is harder than it looks
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-quicksand text-lg leading-relaxed text-slate-600">
            You moved across the world for opportunity — and you are proud of that. But keeping
            Caribbean culture alive for your kids takes real work, and most learning tools were
            not built for families like yours.
          </p>
          <ul className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            {PROBLEM_BULLETS.map((b) => (
              <li
                key={b.text}
                className="flex gap-3 rounded-2xl bg-white/70 p-5 shadow-sm border border-slate-100"
              >
                <span className="text-2xl" aria-hidden="true">{b.emoji}</span>
                <span className="font-quicksand text-sm leading-relaxed text-slate-700 sm:text-base">
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Solution section */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-sky-100 via-amber-50 to-white p-8 text-center shadow-md sm:p-12">
          <p className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-ocean)]">
            The Likkle Legends way
          </p>
          <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
            A little piece of the Caribbean, delivered to your child
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-quicksand text-lg leading-relaxed text-slate-600">
            Likkle Legends turns Caribbean culture into a learning adventure your child will
            actually look forward to. Each mailer blends phonics and reading practice with the
            stories, songs, and sayings of home — so your kids grow up literate <em>and</em> rooted.
          </p>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-quicksand text-lg text-slate-600">
              Three simple steps from order to your child&apos;s first Caribbean learning adventure.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-amber-400 font-montserrat text-xl font-extrabold text-white shadow-md">
                  {s.n}
                </div>
                <h3 className="font-fredoka text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="mt-3 font-quicksand text-sm leading-relaxed text-slate-600 sm:text-base">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>

          {/* CTA #2 */}
          <div className="mt-10 text-center">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* 7. What's inside */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
              What&apos;s inside
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-quicksand text-lg text-slate-600">
              Everything your child needs to learn and feel at home — in one Intro Mailer.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHATS_INSIDE.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-3 text-3xl" aria-hidden="true">{c.emoji}</div>
                <h3 className="font-fredoka text-lg font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 font-quicksand text-sm leading-relaxed text-slate-600">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA after What's Inside (#3) */}
      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <CTAButton />
        </div>
      </section>

      {/* 8. Literacy credibility */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-ocean)]">
              Built on real reading science
            </p>
            <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
              Literacy that grows with your child
            </h2>
            <p className="mx-auto mt-5 max-w-2xl font-quicksand text-lg leading-relaxed text-slate-600">
              Likkle Legends follows a phonics-based progression matched to your child&apos;s
              reading stage. Every mailer and activity sheet meets your child where they are —
              from first letter sounds to confident, fluent reading.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {AGE_BANDS.map((a) => (
              <div
                key={a.band}
                className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"
              >
                <h3 className="font-fredoka text-lg font-bold text-slate-900">{a.band}</h3>
                <ul className="mt-3 space-y-2">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 font-quicksand text-sm text-slate-600">
                      <span className="mt-1 flex-none text-[var(--caribbean-palm)]" aria-hidden="true">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Character section */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[var(--caribbean-papaya)]/20 via-amber-50 to-sky-100 p-8 text-center shadow-md sm:p-12">
          <p className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-mango)]">
            Meet the Legends
          </p>
          <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
            Five Caribbean friends your child will love
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-quicksand text-lg leading-relaxed text-slate-600">
            Dilly, Tanty, R.O.T.I., Scorcha, and Mango guide your child through every story,
            activity, and chat. They are the heart of Likkle Legends — friendly, funny, and
            unmistakably Caribbean.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {CHARACTERS.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-2">
                <span className="text-4xl sm:text-5xl" aria-hidden="true">{c.emoji}</span>
                <span className="font-fredoka text-sm font-bold text-slate-800 sm:text-base">
                  {c.name}
                </span>
              </div>
            ))}
          </div>

          {/* CTA #4 */}
          <div className="mt-10">
            <CTAButton />
          </div>
        </div>
      </section>

      {/* 10. Offer section */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border-2 border-amber-300 bg-white p-8 shadow-2xl sm:p-10">
            <div className="text-center">
              <p className="mb-2 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-mango)]">
                The Offer
              </p>
              <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
                Intro Mailer
              </h2>
              <p className="mt-2 font-quicksand text-base text-slate-600">
                Everything you need to try Likkle Legends with your child.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-none text-lg text-[var(--caribbean-palm)]" aria-hidden="true">✓</span>
                  <span className="font-quicksand text-sm font-semibold text-slate-700 sm:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA #5 */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <CTAButton />
              <p className="font-quicksand text-xs text-slate-500">
                One-time purchase · No subscription · 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-quicksand text-lg text-slate-600">
              Everything parents ask before starting the Intro Mailer.
            </p>
          </div>
          <OfferFAQ />
        </div>
      </section>

      {/* 12. Final CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-orange-400 to-amber-400 p-8 text-center shadow-2xl sm:p-12">
          <h2 className="font-fredoka text-3xl font-bold text-white sm:text-4xl">
            Give your child a piece of home
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-quicksand text-lg text-white/90">
            Start with the Intro Mailer today — and watch your child fall in love with Caribbean
            learning, one mailer at a time.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href={CTA_HREF}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 font-montserrat text-lg font-extrabold text-orange-500 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all"
            >
              🌴 {CTA_LABEL}
            </Link>
            <p className="font-quicksand text-sm text-white/90">
              Already a member?{' '}
              <Link href="/login" className="font-bold underline underline-offset-4 hover:text-white">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 13. Footer — minimal */}
      <footer className="border-t border-amber-100 bg-white/80 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">🌴</span>
              <span className="font-fredoka text-lg font-bold text-slate-900">
                Likkle Legends
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-montserrat text-xs font-semibold text-slate-500 sm:text-sm">
              <Link href="/login" className="hover:text-[var(--caribbean-mango)] transition-colors">
                Member Login
              </Link>
              <Link href="/faq" className="hover:text-[var(--caribbean-mango)] transition-colors">
                Help / Contact
              </Link>
              <Link href="/privacy" className="hover:text-[var(--caribbean-mango)] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[var(--caribbean-mango)] transition-colors">
                Terms
              </Link>
            </nav>
            <p className="max-w-md font-quicksand text-xs text-slate-400">
              🚚 Physical mail ships to the US within 48 hours. Digital access available worldwide
              instantly.
            </p>
            <p className="max-w-md font-quicksand text-xs text-slate-400">
              🔒 Likkle Legends is COPPA-compliant and built kid-safe. No ads, no third-party
              tracking on your child&apos;s activity.
            </p>
            <p className="mt-2 font-montserrat text-xs text-slate-400">
              © {new Date().getFullYear()} Likkle Legends. Made with 🧡 for Caribbean families abroad.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
