import Link from 'next/link';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Truck, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Shipping & Returns',
    description: 'Learn about our global shipping times, free shipping offers, and our hassle-free 30-day return policy.',
    alternates: {
        canonical: '/shipping',
    },
    openGraph: {
        title: 'Shipping & Returns',
        description: 'Learn about our global shipping times, free shipping offers, and our hassle-free 30-day return policy.',
        url: '/shipping',
        siteName: 'Likkle Legends',
        type: 'website',
        images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Likkle Legends' }],
    },
};

export default function ShippingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <div className="space-y-4 mb-16 text-center">
                        <span className="text-secondary font-bold uppercase tracking-widest text-sm">Delivery & Policy</span>
                        <h1 className="text-5xl lg:text-7xl font-black text-deep">Shipping & Returns</h1>
                        <p className="text-xl text-deep/60 max-w-2xl mx-auto">
                            Everything you need to know about receiving your Likkle Legends adventure.
                        </p>
                    </div>

                    <div className="grid gap-8">
                        {/* Shipping Section */}
                        <div className="bg-white rounded-[3rem] p-8 lg:p-16 border border-zinc-100 shadow-xl space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                                    <Truck size={32} />
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-black text-deep">Shipping Information</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="p-8 bg-zinc-50 rounded-[2rem] space-y-4">
                                    <h3 className="font-black text-xl text-deep">Handling Time</h3>
                                    <p className="text-deep/60 leading-relaxed">
                                        Orders placed before the 10th of the month ship on the 15th. Orders placed after the 10th will join the next month's batch.
                                    </p>
                                </div>
                                <div className="p-8 bg-zinc-50 rounded-[2rem] space-y-4">
                                    <h3 className="font-black text-xl text-deep">Free Shipping</h3>
                                    <p className="text-deep/60 leading-relaxed">
                                        Get free shipping on all annual subscriptions and any individual orders over $75.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-deep">Delivery Estimates</h3>
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                                    <p className="text-orange-900 font-bold text-lg">Currently Available: United States Only</p>
                                    <p className="text-orange-700 text-sm mt-2">We're working on expanding to Canada and the UK. Join our waitlist to be notified when international shipping launches.</p>
                                </div>
                                <div className="grid gap-4">
                                    {[
                                        { region: "United States", time: "5–10 Business Days", icon: "🇺🇸", available: true },
                                        { region: "Canada", time: "Coming Soon", icon: "🍁", available: false },
                                        { region: "United Kingdom", time: "Coming Soon", icon: "🇬🇧", available: false },
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center justify-between p-6 border rounded-2xl transition-colors ${item.available ? 'border-green-200 bg-green-50' : 'border-zinc-100 opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <span className="font-bold text-deep block">{item.region}</span>
                                                    {!item.available && <span className="text-xs text-zinc-500">Not yet available</span>}
                                                </div>
                                            </div>
                                            <span className={`font-black ${item.available ? 'text-primary' : 'text-zinc-400'}`}>{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Returns Section */}
                        <div className="bg-deep text-white rounded-[3rem] p-8 lg:p-16 shadow-2xl space-y-12 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center backdrop-blur-sm">
                                    <RotateCcw size={32} />
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-black">Hassle-Free Returns</h2>
                            </div>

                            <p className="text-xl text-white/70 leading-relaxed max-w-2xl relative z-10">
                                We want you to love your Likkle Legends experience. If you're not 100% satisfied with your first box, we'll make it right.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 relative z-10">
                                {[
                                    { title: "30 Day Window", body: "Request a return within 30 days of receiving your first box.", icon: "🗓️" },
                                    { title: "Full Refund", body: "We'll refund the full price of the box, no questions asked.", icon: "💰" },
                                    { title: "Easy Process", body: "We send you a prepaid label. Just drop it in the mail.", icon: "✉️" },
                                ].map((step, i) => (
                                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <span className="text-3xl mb-4 block">{step.icon}</span>
                                        <h4 className="font-black text-lg mb-2">{step.title}</h4>
                                        <p className="text-sm text-white/50 leading-relaxed">{step.body}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 relative z-10">
                                <Link
                                    href="/contact"
                                    className="btn btn-primary btn-lg inline-block px-12 py-6 text-xl shadow-xl shadow-primary/20"
                                >
                                    Start a Return
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
