import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Star, Gift, Crown, ArrowRight, Mail, Calendar, Heart } from 'lucide-react';

export const metadata = {
    title: 'Pricing | Likkle Legends',
    description: 'Choose the plan that fits your family. Start with the $10 intro experience or explore our membership options.',
};

const tiers = [
    {
        id: 'starter_mailer',
        name: 'Starter Mailer',
        price: '$9.99',
        billing: '/month',
        recommended: false,
        badge: 'Great Start',
        description: 'Perfect for children just beginning their heritage journey',
        highlights: [
            'Personalized character letter monthly',
            'Coloring postcard & sticker sheet',
            'Alphabet flashcard',
            'QR-triggered 360° Island VR Portal',
            'Digital "Postcard" Access'
        ],
        cta: 'Choose Starter',
        href: '/signup?plan=starter_mailer',
        color: 'blue'
    },
    {
        id: 'legends_plus',
        name: 'Legends Plus',
        price: '$19.99',
        billing: '/month',
        recommended: true,
        badge: 'Most Popular',
        description: 'Everything in Starter + Premium Storybook & AI Studio',
        highlights: [
            'Everything in Starter Mailer',
            'Premium cardstock storybook',
            'Unlimited AI Story Studio',
            'AR Character Overlay',
            'Parent 1-on-1 AI Coaching'
        ],
        cta: 'Choose Plus',
        href: '/signup?plan=legends_plus',
        color: 'emerald'
    },
    {
        id: 'family_legacy',
        name: 'Family Legacy',
        price: '$34.99',
        billing: '/month',
        recommended: false,
        badge: 'Full Experience',
        description: 'The ultimate cultural package for up to 3 children',
        highlights: [
            'Everything in Legends Plus',
            'Quarterly Heritage Box',
            'Up to 3 child profiles',
            'Printable Family Tree Kit',
            'Grandparent Mirror Dashboard'
        ],
        cta: 'Choose Family',
        href: '/signup?plan=family_legacy',
        color: 'purple'
    },
    {
        id: 'trial_access',
        name: '7-Day Free Pass',
        price: '$0',
        billing: '/7 days',
        recommended: false,
        description: 'Try the digital experience risk-free',
        highlights: [
            'Unlimited AI Story Studio',
            'Interactive Child Portal',
            'Digital "Postcard" Access',
            'No credit card required'
        ],
        cta: 'Get Free Pass',
        href: '/signup?plan=trial_access',
        color: 'amber'
    }
];

const addons = [
    {
        id: 'birthday_letters',
        name: 'Birthday Letter',
        icon: Gift,
        price: '$12-25',
        description: 'Personalized birthday letter from a character',
        includes: ['Personalized letter', 'Birthday activity page', 'Digital birthday song']
    },
    {
        id: 'seasonal_drops',
        name: 'Seasonal Packs',
        icon: Calendar,
        price: '$25-75',
        description: 'Special celebration packs',
        includes: ['Carnival Celebration', 'Independence Day Roots', 'Holiday Island Joy']
    }
];

const faqs = [
    {
        q: 'Is it suitable for kids who don\'t speak patois?',
        a: 'Yes! The goal is connection and learning, with clear guidance and age-appropriate language. Everything is designed to be accessible for Caribbean kids growing up abroad.'
    },
    {
        q: 'Do I need the mail experience to join digital?',
        a: 'No. Many families start with the free trial or membership directly. The mail intro is simply the easiest first step because it creates a physical moment kids love.'
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes, all subscriptions can be cancelled anytime with no penalties. One-time purchases like the $10 intro have no recurring charges.'
    },
    {
        q: 'What ages is this for?',
        a: 'Likkle Legends is designed for children ages 4-8, with content tailored for both Mini Legends (4-5) and Big Legends (6-8).'
    },
    {
        q: 'Is the content safe?',
        a: 'Absolutely. All content is ad-free, age-appropriate, and designed with parents in mind. There are no chat features or social interactions with strangers.'
    }
];

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
                {/* Hero */}
                <section className="pt-16 pb-12 bg-gradient-to-b from-emerald-50 to-white">
                    <div className="container text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-deep mb-4">
                            Start Small. Build Roots.
                        </h1>
                        <p className="text-lg text-deep/60 max-w-xl mx-auto">
                            Choose the plan that fits your family. Most families start with the $10 intro experience.
                        </p>
                    </div>
                </section>

                {/* Pricing Tiers */}
                <section className="py-16 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.id}
                                    className={`relative rounded-3xl p-6 border-2 transition-all ${tier.recommended
                                        ? 'bg-emerald-50 border-emerald-300 shadow-xl scale-[1.02] lg:scale-105'
                                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-lg'
                                        }`}
                                >
                                    {tier.recommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-wide whitespace-nowrap">
                                                <Star className="w-3 h-3" /> {tier.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6 pt-2">
                                        <h3 className="font-bold text-deep mb-2">{tier.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-deep">{tier.price}</span>
                                            <span className="text-deep/50 text-sm">{tier.billing}</span>
                                        </div>
                                        <p className="text-sm text-deep/60 mt-2">{tier.description}</p>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        {tier.highlights.map((highlight) => (
                                            <div key={highlight} className="flex items-start gap-2">
                                                <Check className={`w-4 h-4 mt-0.5 shrink-0 ${tier.recommended ? 'text-emerald-500' : 'text-zinc-400'}`} />
                                                <span className="text-sm text-deep/70">{highlight}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={tier.href}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all group ${tier.recommended
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                            : 'bg-zinc-100 hover:bg-zinc-200 text-deep'
                                            }`}
                                    >
                                        {tier.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Add-ons */}
                <section className="py-16 bg-zinc-50">
                    <div className="container">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-black text-deep mb-2">Special Moments</h2>
                            <p className="text-deep/60">Make birthdays and holidays extra special</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            {addons.map((addon) => (
                                <div
                                    key={addon.id}
                                    className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                                            <addon.icon className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-deep">{addon.name}</h3>
                                                <span className="text-sm font-bold text-emerald-600">{addon.price}</span>
                                            </div>
                                            <p className="text-sm text-deep/60 mb-3">{addon.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {addon.includes.map((item) => (
                                                    <span key={item} className="text-xs bg-zinc-100 text-deep/70 px-2 py-1 rounded-full">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 bg-white">
                    <div className="container">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-black text-deep text-center mb-10">
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-zinc-50 rounded-xl p-5 border border-zinc-100"
                                    >
                                        <h3 className="font-bold text-deep mb-2">{faq.q}</h3>
                                        <p className="text-deep/70 text-sm leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 bg-gradient-to-b from-white to-emerald-50">
                    <div className="container">
                        <div className="max-w-2xl mx-auto text-center space-y-6">
                            <h2 className="text-2xl md:text-3xl font-black text-deep">
                                Ready to Start?
                            </h2>
                            <p className="text-deep/60">
                                Begin with the $10 intro experience—the easiest way to see if Likkle Legends is right for your family.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/get-started"
                                    className="inline-flex items-center justify-center gap-2 btn btn-primary btn-lg px-8 py-4 text-lg shadow-xl"
                                >
                                    Try the $10 Intro
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/get-started"
                                    className="inline-flex items-center justify-center gap-2 btn bg-white border-2 border-zinc-200 text-deep px-8 py-4 text-lg"
                                >
                                    Or Start Free Trial
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
