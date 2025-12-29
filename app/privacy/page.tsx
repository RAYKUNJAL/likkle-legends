"use client";

import Navbar from '@/components/Navbar';
import { siteContent } from '@/lib/content';

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-3xl">
                    <h1 className="text-5xl font-black text-deep mb-8">Privacy Policy</h1>
                    <p className="text-sm font-bold text-primary mb-12">Effective Date: December 28, 2025</p>

                    <div className="prose prose-lg max-w-none text-deep/70 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">1. Introduction</h2>
                            <p>At Likkle Legends Mail Club, we are committed to protecting the privacy and security of current and prospective customers, especially children. This policy describes how we collect, use, and share information.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">2. Child Safety (COPPA Compliance)</h2>
                            <p>We take children's privacy seriously. Our "Kids Portal" does not collect personally identifiable information from children without parental consent. All accounts are managed by a parent or guardian who provides the child's first name for personalization purposes only.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">3. Information We Collect</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Parental Information:</strong> Name, email address, billing address, and shipping address.</li>
                                <li><strong>Child's Information:</strong> First name and age range (to ensure appropriate content delivery).</li>
                                <li><strong>Usage Data:</strong> How the digital portal and AI widgets are used to improve our service.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-deep">4. How We Use Information</h2>
                            <p>We use your information to fulfill your subscription, personalize the character letters, and improve the educational quality of our AI Reading Buddy and story generation features.</p>
                        </section>

                        <section className="space-y-4 text-sm bg-zinc-50 p-8 rounded-[2rem] italic">
                            <p>We never sell your data to third parties. Your family's journey is private and protected by industry-standard encryption.</p>
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
