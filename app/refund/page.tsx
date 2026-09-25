import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Refund Policy',
    description:
        'How cancellations and refunds work for Likkle Legends Mail Club — same rules as our Terms of Use.',
};

export default function RefundPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-secondary font-bold uppercase tracking-widest text-sm">
                            Straight talk for parents
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Refund Policy</h1>
                        <p className="text-deep/40 font-bold uppercase tracking-tighter">
                            Same promise as our Terms of Use · Last Updated: December 28, 2025
                        </p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                        <div className="prose prose-xl max-w-none text-deep/70 space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">
                                        01
                                    </span>
                                    What this page is
                                </h2>
                                <p className="leading-relaxed">
                                    Likkle Legends is a Caribbean kids club built with love — mail, stories, and island
                                    magic for your little one. This page does not invent new rules. It restates the
                                    refund and cancellation language already in our{' '}
                                    <Link href="/terms" className="text-primary font-bold underline underline-offset-4">
                                        Terms of Use
                                    </Link>
                                    , so you can find it clear and easy before you pay.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">
                                        02
                                    </span>
                                    Cancel anytime
                                </h2>
                                <p className="leading-relaxed">
                                    You may cancel your subscription at any time. Monthly plans bill every 30 days.
                                    Annual plans bill once at the start of the term.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">
                                        03
                                    </span>
                                    No partial refunds for the current cycle
                                </h2>
                                <p className="leading-relaxed">
                                    As our Terms of Use already say: you may cancel at any time, but we do not offer
                                    partial refunds for the current billing cycle. When you cancel, your access continues
                                    through the period you already paid for, and you will not be billed again.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">
                                        04
                                    </span>
                                    Need a hand?
                                </h2>
                                <p className="leading-relaxed">
                                    Questions about a charge, a cancel, or your child&apos;s club membership? Reach us
                                    the same way the rest of the site does:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="text-primary font-bold underline underline-offset-4"
                                        >
                                            Contact form
                                        </Link>{' '}
                                        at /contact
                                    </li>
                                    <li>
                                        Email{' '}
                                        <a
                                            href="mailto:hello@likklelegends.com"
                                            className="text-primary font-bold underline underline-offset-4"
                                        >
                                            hello@likklelegends.com
                                        </a>
                                    </li>
                                </ul>
                            </section>

                            <div className="p-8 rounded-[2rem] bg-deep text-white">
                                <p className="text-lg font-bold leading-relaxed">
                                    We keep it honest: cancel when you need to, finish the cycle you paid for, and write
                                    us if something feels off. Full terms live on{' '}
                                    <Link href="/terms" className="text-secondary underline underline-offset-4">
                                        /terms
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
