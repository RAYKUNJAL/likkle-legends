import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: "Kids' Safety Policy",
    description: "Learn about the safety measures we take to protect your children, including COPPA compliance, ad-free environment, and parental controls.",
    alternates: {
        canonical: '/safety',
    },
};

export default function SafetyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-green-600 font-bold uppercase tracking-widest text-sm">Safe & Secure</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Kids' Safety Policy</h1>
                        <p className="text-deep/40 font-bold uppercase tracking-tighter">Effective Date: December 28, 2025</p>
                    </div>

                    <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                        <div className="prose prose-xl max-w-none text-deep/70 space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">01</span>
                                    Our Promise to Families
                                </h2>
                                <p className="leading-relaxed">
                                    Likkle Legends is a digital playground built with your child's safety as our absolute priority. We adhere to the strictest standards for children's online privacy and safety, including COPPA (Children's Online Privacy Protection Act).
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">02</span>
                                    No Ads, No Tracking
                                </h2>
                                <p className="leading-relaxed">
                                    Our Kids Portal is completely free of third-party advertisements. We do not track your child's behavior for marketing purposes, and we never sell any data to advertisers. The portal is a walled garden for learning and play.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">03</span>
                                    Parental Control
                                </h2>
                                <p className="leading-relaxed">
                                    You are in the driver's seat. Through the Parent Dashboard, you can monitor your child's progress, view their stories, and manage their account settings. All financial transactions are strictly gated behind the parent account.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">04</span>
                                    AI Safety
                                </h2>
                                <p className="leading-relaxed">
                                    Our AI Reading Buddy and Story Generator use kid-safe filters to ensure all generated content is appropriate, positive, and culturally respectful. We regularly audit our AI interactions to maintain a safe environment.
                                </p>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-black text-deep flex items-center gap-4">
                                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm">05</span>
                                    Community Guidelines
                                </h2>
                                <p className="leading-relaxed">
                                    Likkle Legends allows children to send stickers and pre-set messages to family members (like grandparents). There is no open chat function with strangers. Your child can only interact with verified contacts you approve.
                                </p>
                            </section>

                            <div className="p-10 rounded-[2.5rem] bg-green-50 text-green-900 border border-green-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 opacity-20 blur-[80px] -mr-32 -mt-32"></div>
                                <div className="relative z-10 text-center space-y-4">
                                    <p className="text-xl font-bold italic opacity-90">
                                        "We believe the internet should be a place where kids can explore safely. Thank you for trusting us with your little legend's journey."
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
