import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Gift } from 'lucide-react';
import Pricing from '@/components/Pricing';
import MusicStoreUpsell from '@/components/parent/MusicStoreUpsell';
import { formatUsd, listParentOffers } from '@/lib/paypal-offers';

export const metadata = {
    title: 'Pricing | Likkle Legends',
    description: 'Start free. Upgrade anytime. Mail club currently ships in the USA, with Canada & UK coming soon.',
};

const addons = [
    {
        id: 'birthday_letter',
        name: 'Birthday Letter',
        icon: Gift,
        price: '$19–$29',
        description: 'Perfect for birthdays — no subscription needed.',
        includes: ['Personalized birthday letter', 'Printable activity pack', 'Digital mission unlock']
    }
];

const faqs = [
    {
        q: 'Do you ship to Canada or the UK?',
        a: 'Mail Club currently ships within the United States only. Canada and the UK are coming soon. You can start with Free Forever or Digital Legends from anywhere.'
    },
    {
        q: 'Is the Free plan really free forever?',
        a: 'Yes. Free Forever includes a rotating library and kid-safe portal access. Upgrade anytime for more content and AI builds.'
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. You can cancel at any time from your account settings.'
    }
];

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
                <section className="bg-[#FFFDF7] py-20">
                    <div className="container space-y-8">
                        <div className="max-w-3xl">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Parent plans</p>
                            <h1 className="mt-3 text-4xl font-black text-slate-900">Island Packs and annual plans</h1>
                            <p className="mt-3 text-slate-600">Parents check out. Children do not buy from the portal. Access for a pack or annual plan turns on only after PayPal verifies it.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {listParentOffers().map((offer) => (
                                <article key={offer.sku} className="rounded-3xl border border-slate-200 bg-white p-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{offer.kind === 'one_time' ? 'Island Pack' : 'Optional annual'}</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900">{offer.name}</h2>
                                    <p className="mt-2 text-3xl font-black text-slate-900">${formatUsd(offer.price)}<span className="ml-1 text-sm font-bold text-slate-400">{offer.interval === 'year' ? '/year' : 'once'}</span></p>
                                    <p className="mt-2 text-sm text-slate-500">{offer.description}</p>
                                    <Link href={`/checkout?offer=${offer.sku}`} className="mt-4 inline-flex text-sm font-black text-primary">Parent checkout</Link>
                                </article>
                            ))}
                        </div>
                        <MusicStoreUpsell />
                    </div>
                </section>
                <Pricing />

                {/* Add-ons */}
                <section className="py-24 bg-zinc-50">
                    <div className="container">
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">One-time gifts</span>
                            <h2 className="text-3xl md:text-5xl font-black text-deep">Special Moments</h2>
                            <p className="text-deep/60 max-w-xl mx-auto font-medium">Perfect for birthdays and holidays — no subscription needed.</p>
                        </div>

                        <div className="max-w-xl mx-auto">
                            {addons.map((addon) => (
                                <div
                                    key={addon.id}
                                    className="bg-white rounded-[2rem] p-10 border border-zinc-200 hover:shadow-2xl transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                                            <addon.icon className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-2">
                                                <h3 className="text-2xl font-black text-deep">{addon.name}</h3>
                                                <span className="text-lg font-black text-emerald-600">{addon.price}</span>
                                            </div>
                                            <p className="text-deep/60 mb-6 font-medium">{addon.description}</p>
                                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                                                {addon.includes.map((item) => (
                                                    <span key={item} className="text-[10px] font-black bg-zinc-100 text-deep/40 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                            <Link
                                                href={addon.id === 'birthday_letter' ? '/shop/birthday-letter' : '/checkout'}
                                                className="w-full py-4 bg-deep text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-800 transition-colors text-center block"
                                            >
                                                Shop {addon.name}
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
                            <h2 className="text-3xl md:text-4xl font-black text-deep text-center mb-16">
                                Common Questions
                            </h2>

                            <div className="grid gap-6">
                                {faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-emerald-200 transition-colors"
                                    >
                                        <h3 className="text-lg font-black text-deep mb-3">{faq.q}</h3>
                                        <p className="text-deep/60 font-medium leading-relaxed">{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 bg-deep text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="container relative z-10 text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black leading-tight">
                            Ready to Start <br /> Your Child's Legend?
                        </h2>
                        <p className="text-xl text-white/60 max-w-lg mx-auto font-medium">
                            Join families around the world building cultural pride and joyful memories.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/get-started"
                                className="px-12 py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
