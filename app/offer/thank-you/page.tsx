import type { Metadata } from 'next';
import Link from 'next/link';
import MetaPixel from '@/components/offer/MetaPixel';
import GA4Pixel from '@/components/offer/GA4Pixel';
import TikTokPixel from '@/components/offer/TikTokPixel';
import PurchaseTracker from '@/components/offer/PurchaseTracker';

const SITE_URL =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com';

// Intro Mailer price — kept in sync with lib/paypal.ts SUBSCRIPTION_PLANS.plan_mail_intro.price.
const INTRO_PRICE = 9.99;

export const metadata: Metadata = {
    title: 'Welcome to Likkle Legends! 🎉',
    description:
        'Your Intro Mailer is on its way. Here is what happens next on your Caribbean learning adventure.',
    robots: { index: false, follow: true },
    openGraph: {
        title: 'Caribbean Learning That Feels Like Home | Likkle Legends',
        description:
            'Stories, phonics practice, and school-style activities designed to help children grow in reading, confidence, and connection to their Caribbean roots.',
        url: `${SITE_URL}/offer/thank-you`,
        siteName: 'Likkle Legends',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Caribbean Learning That Feels Like Home | Likkle Legends',
        description:
            'Stories, phonics practice, and school-style activities for kids 3–8.',
    },
};

const NEXT_STEPS = [
    {
        n: '1',
        emoji: '✉️',
        title: 'Check your email for confirmation',
        body: 'We just sent a confirmation to your inbox. Open it to verify your email and lock in your Intro Mailer.',
    },
    {
        n: '2',
        emoji: '👶🏾',
        title: 'Create your child’s profile',
        body: 'Tell us your child’s name and age band so every story, activity, and mailer is matched to where they are right now.',
    },
    {
        n: '3',
        emoji: '🚪',
        title: 'Start exploring the portal',
        body: 'Meet Dilly, Tanty, R.O.T.I., Scorcha, and Mango. Hear a read-aloud story, try a phonics game, and say hello to your child’s new buddy.',
    },
];

const PORTAL_PREVIEW = [
    { emoji: '📖', label: 'Read-aloud story library' },
    { emoji: '🧩', label: 'Phonics games & activities' },
    { emoji: '🤖', label: 'Kid-safe AI buddy chat' },
    { emoji: '🏆', label: 'XP, badges & streaks' },
    { emoji: '🎨', label: 'Printable activity sheets' },
    { emoji: '📻', label: 'Island Radio' },
];

const FAQ_TEASERS = [
    {
        q: 'When will my Intro Mailer arrive?',
        a: 'Digital access is instant — you can explore the portal right after creating your child’s profile. Physical mail ships to the US within 48 hours of your order and typically arrives within a week.',
    },
    {
        q: 'What if I have more than one child?',
        a: 'You can create a profile for each child in the portal. The Intro Mailer covers one child’s personalized mailer; add more anytime from your parent dashboard.',
    },
    {
        q: 'Can I cancel or get a refund?',
        a: 'Yes. The Intro Mailer is a one-time purchase with a 30-day money-back guarantee. If it’s not a fit, contact us within 30 days for a full refund — no questions asked.',
    },
];

const FOOTER_LINKS = [
    { href: '/login', label: 'Member Login' },
    { href: '/faq', label: 'Help' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
];

export default function OfferThankYouPage({
    searchParams,
}: {
    searchParams?: { upgraded?: string; email?: string };
}) {
    const upgraded = searchParams?.upgraded === '1';
    const email = searchParams?.email || '';

    return (
        <main className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-white font-montserrat">
            {/* ── Tracking pixels — fire Purchase on thank-you page ── */}
            <MetaPixel event="Purchase" params={{ value: INTRO_PRICE, currency: 'USD', content_name: 'intro_mailer' }} />
            <GA4Pixel event="purchase" params={{ transaction_id: `intro_${Date.now()}`, value: INTRO_PRICE, currency: 'USD', items: [{ item_id: 'plan_mail_intro', item_name: 'Intro Mailer', price: INTRO_PRICE, quantity: 1 }] }} />
            <TikTokPixel event="CompletePayment" params={{ value: INTRO_PRICE, currency: 'USD', content_name: 'intro_mailer' }} />
            <PurchaseTracker value={INTRO_PRICE} upgraded={upgraded} />

            {/* Minimal header: logo */}
            <header className="border-b border-amber-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">🌴</span>
                        <span className="font-fredoka text-xl font-bold text-slate-900 sm:text-2xl">
                            Likkle Legends
                        </span>
                    </Link>
                </div>
            </header>

            {/* Celebration hero */}
            <section className="px-4 py-12 sm:px-6 sm:py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="text-6xl sm:text-7xl" aria-hidden="true">🎉</div>
                    <h1 className="mt-5 font-fredoka text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
                        Welcome to Likkle Legends!
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl font-quicksand text-lg leading-relaxed text-slate-600">
                        Your Intro Mailer is on its way. Here’s what happens next:
                    </p>

                    {upgraded && (
                        <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--caribbean-palm)]/10 px-4 py-2 font-montserrat text-sm font-bold text-[var(--caribbean-palm)]">
                            ⭐ Legends Plus unlocked — enjoy the full portal!
                        </p>
                    )}

                    {email && (
                        <p className="mt-4 font-quicksand text-sm text-slate-500">
                            Confirmation sent to <span className="font-bold text-slate-700">{email}</span>
                        </p>
                    )}
                </div>
            </section>

            {/* 3 next steps */}
            <section className="px-4 pb-4 sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <ol className="grid gap-5 sm:grid-cols-3">
                        {NEXT_STEPS.map((s) => (
                            <li
                                key={s.n}
                                className="rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-sm"
                            >
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-amber-400 font-montserrat text-xl font-extrabold text-white shadow-md">
                                    {s.n}
                                </div>
                                <div className="mb-2 text-3xl" aria-hidden="true">{s.emoji}</div>
                                <h3 className="font-fredoka text-lg font-bold text-slate-900">{s.title}</h3>
                                <p className="mt-2 font-quicksand text-sm leading-relaxed text-slate-600">
                                    {s.body}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* CTAs */}
            <section className="px-4 py-10 sm:px-6">
                <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
                    <Link
                        href="/portal"
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 px-8 py-4 font-montserrat text-lg font-extrabold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                    >
                        🚪 Go to Portal
                    </Link>
                    <Link
                        href="/signup"
                        className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-amber-200 bg-white px-8 py-3.5 font-montserrat text-base font-bold text-slate-700 transition-all hover:border-[var(--caribbean-mango)] hover:text-[var(--caribbean-mango)]"
                    >
                        Create your account
                    </Link>
                    <p className="font-quicksand text-xs text-slate-500">
                        Already a member? <Link href="/login" className="font-bold text-[var(--caribbean-ocean)] underline-offset-4 hover:underline">Log in</Link> to pick up where you left off.
                    </p>
                </div>
            </section>

            {/* What's next / portal preview */}
            <section className="px-4 py-12 sm:px-6 sm:py-16">
                <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-[var(--caribbean-sky)]/20 via-amber-50 to-[var(--caribbean-papaya)]/20 p-8 text-center shadow-md sm:p-12">
                    <p className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[var(--caribbean-ocean)]">
                        What’s next
                    </p>
                    <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
                        A peek at the portal waiting for you
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-quicksand text-base leading-relaxed text-slate-600">
                        Once inside, your child can jump straight into the activities Caribbean kids love — and you get to watch their reading grow.
                    </p>
                    <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {PORTAL_PREVIEW.map((p) => (
                            <li
                                key={p.label}
                                className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 px-3 py-4 text-center shadow-sm"
                            >
                                <span className="text-2xl" aria-hidden="true">{p.emoji}</span>
                                <span className="font-montserrat text-xs font-bold text-slate-700 sm:text-sm">
                                    {p.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Social proof — truthful, no fabricated numbers */}
            <section className="px-4 py-10 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="font-quicksand text-lg font-semibold italic text-slate-600 sm:text-xl">
                        “Join hundreds of Caribbean families keeping culture alive.”
                    </p>
                    <p className="mt-3 font-montserrat text-xs font-bold uppercase tracking-widest text-slate-400">
                        🌍 Diaspora families · 📖 Reading adventures · 🏝️ Culture kept alive
                    </p>
                </div>
            </section>

            {/* FAQ teaser */}
            <section className="px-4 py-12 sm:px-6 sm:py-16">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 text-center">
                        <h2 className="font-fredoka text-3xl font-bold text-slate-900 sm:text-4xl">
                            Quick answers to get you started
                        </h2>
                    </div>
                    <ul className="space-y-3">
                        {FAQ_TEASERS.map((item) => (
                            <li
                                key={item.q}
                                className="rounded-2xl border border-amber-100 bg-white/90 p-5 shadow-sm sm:p-6"
                            >
                                <h3 className="font-montserrat text-base font-bold text-slate-800 sm:text-lg">
                                    {item.q}
                                </h3>
                                <p className="mt-2 font-quicksand text-sm leading-relaxed text-slate-600 sm:text-base">
                                    {item.a}
                                </p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 text-center">
                        <Link
                            href="/faq"
                            className="font-montserrat text-sm font-semibold text-[var(--caribbean-ocean)] underline-offset-4 hover:underline"
                        >
                            See all FAQs →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Minimal footer */}
            <footer className="border-t border-amber-100 bg-white/80">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-5 sm:px-6">
                    <span className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        © {new Date().getFullYear()} Likkle Legends
                    </span>
                    {FOOTER_LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="font-montserrat text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-[var(--caribbean-mango)]"
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
            </footer>
        </main>
    );
}
