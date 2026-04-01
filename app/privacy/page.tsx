import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { siteContent } from '@/lib/content';

export const metadata: Metadata = {
    title: 'Privacy Policy & Data Deletion Instructions',
    description: "Your family's privacy is our top priority. Read how Likkle Legends protects your data, including explicit instructions for data deletion.",
    alternates: {
        canonical: '/privacy',
    },
    openGraph: {
        title: 'Privacy Policy & Data Deletion Instructions',
        description: "Your family's privacy is our top priority. Read how Likkle Legends protects your data, including explicit instructions for data deletion.",
        url: '/privacy',
        siteName: 'Likkle Legends',
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
    },
};

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-primary font-bold uppercase tracking-widest text-sm">Transparency & Trust</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Privacy Policy</h1>
                        <p className="text-deep/40 font-bold uppercase tracking-tighter">Effective Date: December 28, 2025</p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                        <div className="prose prose-xl max-w-none text-deep/70 space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
                                    Introduction
                                </h2>
                                <p className="leading-relaxed">
                                    At Likkle Legends Mail Club, we are committed to protecting the privacy and security of current and prospective customers, especially children. This policy describes how we collect, use, and share information.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
                                    Child Safety (COPPA Compliance)
                                </h2>
                                <p className="leading-relaxed">
                                    We take children's privacy seriously. Our "Kids Portal" does not collect personally identifiable information from children without parental consent. All accounts are managed by a parent or guardian who provides the child's first name for personalization purposes only.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">03</span>
                                    Information We Collect
                                </h2>
                                <div className="grid gap-6">
                                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                        <h4 className="font-bold text-deep mb-2">Parental Information</h4>
                                        <p className="text-sm">Name, email address, billing address, and shipping address.</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                        <h4 className="font-bold text-deep mb-2">Child's Information</h4>
                                        <p className="text-sm">First name and age range (to ensure appropriate content delivery).</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                        <h4 className="font-bold text-deep mb-2">Usage Data</h4>
                                        <p className="text-sm">How the digital portal and AI widgets are used to improve our service.</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">04</span>
                                    How We Use Information
                                </h2>
                                <p className="leading-relaxed">
                                    We use your information to fulfill your subscription, personalize the character letters, and improve the educational quality of our AI Reading Buddy and story generation features.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">05</span>
                                    Data Deletion Instructions
                                </h2>
                                <p className="leading-relaxed">
                                    According to the Facebook Platform rules and GDPR guidelines, we provide an explicit path for you to request the deletion of your data. If you wish to delete your account and all associated data, including Facebook or Google OAuth login data, you may do so through one of two ways:
                                </p>
                                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <h4 className="font-bold text-deep mb-2">Option 1: Automatic Deletion (Recommended)</h4>
                                    <p className="text-sm">Log into the Parent Dashboard inside the Likkle Legends platform. Navigate to Settings and click "Delete Account". This will instantly and permanently erase your account, profiles, and associated OAuth data.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                                    <h4 className="font-bold text-deep mb-2">Option 2: Manual Request</h4>
                                    <p className="text-sm">Send an email to <strong>privacy@likklelegends.com</strong> with the subject <strong>"Data Deletion Request"</strong>. Please include your registered email address. We will process your request and permanently remove your data within 7 business days.</p>
                                </div>
                            </section>

                            <div className="p-10 rounded-[2.5rem] bg-deep text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-[80px] -mr-32 -mt-32"></div>
                                <div className="relative z-10 text-center space-y-4">
                                    <p className="text-xl font-bold italic opacity-90">
                                        "We never sell your data to third parties. Your family's journey is private and protected by industry-standard encryption."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
