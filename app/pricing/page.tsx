import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Star, Gift, ArrowRight, Calendar } from 'lucide-react';
import { siteContent } from '@/lib/content';

export const metadata = {
    title: 'Pricing | Likkle Legends',
    description: 'Choose the plan that fits your family. Start with the $10 intro experience or explore our membership options.',
};

const addons = [
    {
        id: 'birthday_bundle',
        name: 'The Birthday Bundle',
        icon: Gift,
        price: '$25',
        description: 'A magical island surprise addressed to your child for their special day.',
        includes: ['Handwritten Birthday Letter', 'Custom Activity Pack', 'Digital Birthday Shoutout'],
        href: '/checkout?item=birthday_bundle'
    },
    {
        id: 'holiday_pack',
        name: 'Cultural Holiday Pack',
        icon: Calendar,
        price: '$45',
        description: 'Celebrate island holidays with hands-on crafts, snacks, and stories.',
        includes: ['Carnival & Independence themes', 'Physical Craft Kit', 'Island Treats Guide'],
        href: '/checkout?item=holiday_pack'
    }
];

const faqs = [
    {
        q: 'Is it suitable for kids who don\'t speak patois?',
        a: 'Yes! The goal is connection and learning, with clear guidance and age-appropriate language. Everything is designed to be accessible for Caribbean kids growing up abroad.'
    },
    {
        q: 'Do I need the mail experience to join digital?',
        a: 'No. Many families start with the Free Forever plan or a Plus membership directly. The mail intro is simply the easiest first physical step because it creates a moment kids love.'
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes, all subscriptions can be cancelled anytime with no penalties. One-time bundles have no recurring charges.'
    },
    {
        q: 'What ages is this for?',
        a: 'Likkle Legends is designed for children ages 4-8, with content tailored for both Mini Legends (4-5) and Big Legends (6-8).'
    },
    {
        q: 'Is the content safe?',
        a: 'Absolutely. All content is ad-free, age-appropriate, and designed with parents in mind. There are no safe, open-chat interactions with strangers.'
    }
];

export default function PricingPage() {
    const { pricing } = siteContent;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* Hero */}
                <section className="pt-24 pb-16 bg-gradient-to-b from-emerald-50 to-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl opacity-50 -mr-20" />
                    <div className="container relative z-10 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                            Plans & Pricing
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-deep mb-6">
                            {pricing.title}
                        </h1>
                        <p className="text-xl text-deep/60 max-w-2xl mx-auto">
                            {pricing.subtitle}
                        </p>
                    </div>
                </section>

                {/* Pricing Tiers */}
                <section className="py-16 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                            {pricing.plans.map((plan: any) => {
                                const isRecommended = plan.id === 'starter_mailer';
                                const isPlus = plan.id === 'legends_plus';
                                const isAnnual = plan.id === 'annual_plus';

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-[2.5rem] p-8 border-2 transition-all flex flex-col ${isRecommended
                                            ? 'bg-emerald-50 border-emerald-500 shadow-2xl scale-[1.02] lg:scale-105 z-10'
                                            : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-xl'
                                            }`}
                                    >
                                        {plan.badges && plan.badges.length > 0 && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <span className={`inline-flex items-center gap-1 px-4 py-1.5 ${isRecommended ? 'bg-emerald-500' : 'bg-deep'} text-white text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg`}>
                                                    {plan.badges[0]}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mb-8">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-deep/40 mb-2 block italic">
                                                {plan.label}
                                            </span>
                                            <h3 className="text-2xl font-black text-deep mb-4">{plan.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-deep">{plan.price_display}</span>
                                            </div>
                                            <p className="text-xs font-bold text-deep/40 mt-2 uppercase tracking-wide italic">
                                                {plan.billing_note}
                                            </p>
                                        </div>

                                        <ul className="space-y-4 mb-10 flex-1">
                                            {plan.features.map((feature: string) => (
                                                <li key={feature} className="flex items-start gap-3">
                                                    <Check className={`w-5 h-5 mt-0.5 shrink-0 ${isRecommended ? 'text-emerald-500' : 'text-zinc-400'}`} />
                                                    <span className="text-sm font-bold text-deep/70">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            href={plan.cta.href}
                                            className={`w-full flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-lg transition-all shadow-xl group ${isRecommended
                                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-95'
                                                : isPlus
                                                    ? 'bg-deep hover:bg-black text-white shadow-black/20 active:scale-95'
                                                    : 'bg-zinc-100 hover:bg-zinc-200 text-deep shadow-zinc-100/50'
                                                }`}
                                        >
                                            {plan.cta.label}
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-16 flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
                            {pricing.reassurance_chips.map((chip: string) => (
                                <div key={chip} className="flex items-center gap-2 text-deep/60 text-sm font-bold italic">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    {chip}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Add-ons */}
                <section className="py-24 bg-zinc-50 relative overflow-hidden">
                    <div className="container relative z-10">
                        <div className="text-center mb-16 space-y-4">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">One-time gifts</span>
                            <h2 className="text-3xl md:text-5xl font-black text-deep">Special Moments</h2>
                            <p className="text-lg text-deep/60">No subscription needed. Perfect for gifting culture.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {addons.map((addon) => (
                                <div
                                    key={addon.id}
                                    className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-zinc-100 hover:shadow-2xl transition-all group relative overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row items-start gap-8">
                                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            <addon.icon className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-2xl font-black text-deep">{addon.name}</h3>
                                                <span className="text-xl font-black text-emerald-500">{addon.price}</span>
                                            </div>
                                            <p className="font-bold text-deep/60 mb-6 italic leading-relaxed">{addon.description}</p>
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {addon.includes.map((item) => (
                                                    <span key={item} className="text-[10px] font-black bg-zinc-50 text-deep/40 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                            <Link
                                                href={addon.href}
                                                className="w-full flex items-center justify-center gap-2 py-4 bg-deep text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
                                            >
                                                Order {addon.name}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 bg-white">
                    <div className="container">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black text-deep text-center mb-16">
                                Frequently Asked Questions
                            </h2>

                            <div className="space-y-6">
                                {faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:bg-white hover:shadow-xl transition-all"
                                    >
                                        <h3 className="text-xl font-black text-deep mb-4">{faq.q}</h3>
                                        <p className="text-deep/70 font-medium leading-relaxed italic">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-gradient-to-b from-white to-emerald-50 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-100/20 blur-3xl rounded-full" />
                    <div className="container relative z-10">
                        <div className="max-w-3xl mx-auto text-center space-y-8">
                            <h2 className="text-3xl md:text-6xl font-black text-deep">
                                Ready to build roots?
                            </h2>
                            <p className="text-xl text-deep/60 font-medium">
                                Start with the Free Forever plan or dive into the full intro experience today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                                <Link
                                    href="/signup?plan=starter_mailer"
                                    className="inline-flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[2rem] px-10 py-6 text-xl font-black shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    Try the $10 Intro
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                                <Link
                                    href="/signup?plan=free_forever"
                                    className="inline-flex items-center justify-center gap-3 bg-white border-2 border-zinc-200 text-deep rounded-[2rem] px-10 py-6 text-xl font-black hover:bg-zinc-50 active:scale-95 transition-all"
                                >
                                    Start Free Forever
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
