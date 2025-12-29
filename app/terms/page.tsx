"use client";

import Navbar from '@/components/Navbar';
import { siteContent } from '@/lib/content';

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-3xl">
                    <h1 className="text-5xl font-black text-deep mb-8">Terms of Use</h1>
                    <p className="text-sm font-bold text-secondary mb-12">Last Updated: December 28, 2025</p>

                    <div className="prose prose-lg max-w-none text-deep/70 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">1. Acceptance of Terms</h2>
                            <p>By subscribing to Likkle Legends Mail Club or using our digital portal, you agree to comply with and be bound by these Terms of Use.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">2. Subscription & Renewals</h2>
                            <p>Monthly subscriptions are billed every 30 days. Annual subscriptions are billed once a year at the start of the term. You may cancel at any time, but we do not offer partial refunds for the current billing cycle.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">3. Physical Mail Delivery</h2>
                            <p>Letters are shipped by the 15th of each month. While we ship worldwide, delivery times may vary based on international postal services. We are not responsible for delays caused by local customs or carrier issues.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">4. Digital Content & AI Magic</h2>
                            <p>All content, including character images, nursery songs, and storybooks, is the intellectual property of Island Flavors Universe. AI-generated stories are provided for entertainment and educational purposes only.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">5. User Conduct</h2>
                            <p>You agree not to reproduce, duplicate, copy, or resell any part of the Service, the physical mail, or the digital assets provided within the membership portal.</p>
                        </section>
                    </div>
                </div>
            </main>
            <footer className="py-12 border-t border-zinc-100 text-center text-[10px] font-black tracking-widest text-deep/20 uppercase">
                {siteContent.footer.copyright}
            </footer>
        </div>
    );
}
