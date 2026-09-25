import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Refund Policy',
    description: 'Parent refund rules for Likkle Legends Island Packs, annual plans, and song downloads. Children do not buy.',
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
                                    Access turns on after PayPal captures a one-time payment, or after an annual subscription is active. If PayPal does not confirm the payment, nothing is unlocked and that attempt is not a successful purchase.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Island Packs</h2>
                                <p className="leading-relaxed">
                                    The Digital Island Starter ($10) and the Legends Discovery Pack ($25) are one-time digital packs. Each one includes 30 days of access after PayPal captures the payment. They are not a mailed box.
                                </p>
                                <p className="leading-relaxed">
                                    Email us within 30 days of that charge for a refund of the amount PayPal captured. When the refund is sent, access from that pack ends. The refund goes back to the original PayPal payer.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Island Pass and Family Plan</h2>
                                <p className="leading-relaxed">
                                    The Island Pass ($49.90 per year) and the Family Plan ($349 per year) renew through PayPal until a parent cancels. Cancel in PayPal so the next year is not billed. We do not refund the unused part of a year that PayPal has already billed.
                                </p>
                                <p className="leading-relaxed">
                                    If PayPal captured a charge and the parent account never received the access that charge was for, email us. We refund that charge.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Song downloads and custom songs</h2>
                                <p className="leading-relaxed">
                                    Listening is free. A parent can buy a $1 download license, five licenses for $4, or a custom song for $24.99. If PayPal captured the payment and the file or custom song was not delivered, we refund that charge. After the file or custom song is delivered, that license is not refunded.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep">Mailed kits</h2>
                                <p className="leading-relaxed">
                                    If a checkout sold a mailed kit, returns for that kit are on the{' '}
                                    <Link href="/shipping" className="font-bold text-primary hover:underline">Shipping &amp; Returns</Link>{' '}
                                    page. A shorter window printed on that checkout still applies to that purchase.
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
                                    This page is the refund policy for parent checkout. The{' '}
                                    <Link href="/terms" className="font-bold text-primary hover:underline">Terms of Use</Link>{' '}
                                    cover the rest of the service.
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
