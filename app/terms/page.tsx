import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { siteContent } from '@/lib/content';

export const metadata: Metadata = {
    title: 'Terms of Use',
    description: 'Read the terms and conditions for using the Likkle Legends Mail Club service, including subscription, shipping, and digital content policies.',
    alternates: {
        canonical: '/terms',
    },
    openGraph: {
        title: 'Terms of Use',
        description: 'Read the terms and conditions for using the Likkle Legends Mail Club service, including subscription, shipping, and digital content policies.',
        url: '/terms',
        siteName: 'Likkle Legends',
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
    },
};

export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-secondary font-bold uppercase tracking-widest text-sm">Rules of the Club</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Terms of Use</h1>
                        <p className="text-deep/40 font-bold uppercase tracking-tighter">Last Updated: December 28, 2025</p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                        <div className="prose prose-xl max-w-none text-deep/70 space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">01</span>
                                    Acceptance of Terms
                                </h2>
                                <p className="leading-relaxed">
                                    By subscribing to Likkle Legends Mail Club or using our digital portal, you agree to comply with and be bound by these Terms of Use.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">02</span>
                                    Subscription & Renewals
                                </h2>
                                <p className="leading-relaxed">
                                    Monthly subscriptions are billed every 30 days. Annual subscriptions are billed once a year at the start of the term. You may cancel at any time, but we do not offer partial refunds for the current billing cycle.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">03</span>
                                    Physical Mail Delivery
                                </h2>
                                <p className="leading-relaxed">
                                    Letters are shipped by the 15th of each month to addresses within the United States only. Canada and the UK are coming soon. For digital content, access is available worldwide. We are not responsible for delays caused by carrier issues.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">04</span>
                                    Digital Content & AI Magic
                                </h2>
                                <p className="leading-relaxed">
                                    All content, including character images, nursery songs, and storybooks, is the intellectual property of Island Flavors Universe. AI-generated stories are provided for entertainment and educational purposes only.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-sm">05</span>
                                    User Conduct
                                </h2>
                                <p className="leading-relaxed">
                                    You agree not to reproduce, duplicate, copy, or resell any part of the Service, the physical mail, or the digital assets provided within the membership portal.
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
