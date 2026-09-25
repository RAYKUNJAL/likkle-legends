import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Refund Policy',
    description: 'Parent refund rules for Likkle Legends subscriptions, Island Packs, and song downloads. Children do not buy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-secondary font-bold uppercase tracking-widest text-sm">For parents and guardians</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Refund Policy</h1>
                        <p className="text-deep/40 font-bold uppercase tracking-tighter">Last updated: September 25, 2026</p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                        <div className="prose prose-xl max-w-none text-deep/70 space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Parents pay. Children do not.</h2>
                                <p className="leading-relaxed">
                                    Checkout stays on the parent account. The kids portal does not sell Island Packs, passes, or downloads. A child cannot request a refund from the portal. Email us from the parent account that paid.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">A charge counts only after PayPal confirms it</h2>
                                <p className="leading-relaxed">
                                    Access turns on after PayPal captures a one-time payment, or after a subscription is active. If PayPal does not confirm the payment, nothing is unlocked and that attempt is not a successful purchase.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Subscriptions</h2>
                                <p className="leading-relaxed">
                                    Monthly subscriptions are billed every 30 days. Annual subscriptions are billed once a year at the start of the term. You may cancel at any time, but we do not offer partial refunds for the current billing cycle.
                                </p>
                                <p className="leading-relaxed">
                                    The Island Pass ($49.90 per year) and the Family Plan ($349 per year) are annual subscriptions. Cancel in PayPal so the next year is not billed. The year PayPal has already billed is the current billing cycle.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Island Packs</h2>
                                <p className="leading-relaxed">
                                    The Digital Island Starter ($10) and the Legends Discovery Pack ($25) are one-time digital charges. They are not a subscription and they are not a mailed box. Each pack includes 30 days of access after PayPal captures the payment. Those 30 days are the access period, not a refund window. We do not offer a refund of unused days on a captured pack.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Song downloads and custom songs</h2>
                                <p className="leading-relaxed">
                                    Listening is free. A parent can buy a $1 download license, five licenses for $4, or a custom song for $24.99. Each of those is a one-time charge, not a billing cycle. We do not offer a partial refund of a captured download or custom song.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Mailed kits</h2>
                                <p className="leading-relaxed">
                                    If a checkout sold a mailed kit, returns for that kit are on the{' '}
                                    <Link href="/shipping" className="font-bold text-primary hover:underline">Shipping &amp; Returns</Link>{' '}
                                    page.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">How to ask</h2>
                                <p className="leading-relaxed">
                                    Email{' '}
                                    <a href="mailto:hello@likklelegends.com" className="font-bold text-primary hover:underline">hello@likklelegends.com</a>{' '}
                                    from the parent email on the account. Include the PayPal transaction or subscription id. We reply to the parent, not the child.
                                </p>
                                <p className="leading-relaxed">
                                    This page uses the same refund rule as the{' '}
                                    <Link href="/terms" className="font-bold text-primary hover:underline">Terms of Use</Link>.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
