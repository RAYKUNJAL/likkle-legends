'use client';

import React from 'react';
import Image from 'next/image';

const MailingClubSection: React.FC = () => {
    const mailItems = [
        { icon: "✉️", title: "Personal Letters", description: "Monthly handwritten-style letters from R.O.T.I. and island friends" },
        { icon: "🎨", title: "Activity Sheets", description: "Fun coloring pages, puzzles, and Caribbean-themed crafts" },
        { icon: "🏝️", title: "Culture Cards", description: "Collectible cards teaching island traditions and geography" },
        { icon: "🎁", title: "Surprise Goodies", description: "Small treasures like stickers, bookmarks, and mini-crafts" }
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-amber-50 to-orange-50 overflow-hidden">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        📬 Physical Mail Club
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-deep mb-4">
                        Real Mail. Real Magic. ✨
                    </h2>
                    <p className="text-lg md:text-xl text-deep/70 max-w-2xl mx-auto">
                        Every month, a surprise package arrives from Coconut Cove — right to your doorstep!
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Left Side - Lifestyle Image */}
                    <div className="relative">
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white aspect-[4/3] relative">
                            <Image
                                src="/images/mailing-club-lifestyle.jpg"
                                alt="Likkle Legends Mail Club Contents"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-red-500 text-white px-4 py-2 rounded-full font-black text-sm md:text-base shadow-lg transform rotate-12">
                            New Monthly!
                        </div>
                    </div>

                    {/* Right Side - Features */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {mailItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow border-2 border-amber-100 hover:border-amber-300"
                                >
                                    <div className="text-3xl mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-lg text-deep mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 text-center">
                            <p className="text-white font-bold text-lg mb-3">
                                Available with Heritage Hero & VIP plans
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <span className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    🇹🇹 Trinidad
                                </span>
                                <span className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    🇯🇲 Jamaica
                                </span>
                                <span className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    🇧🇧 Barbados
                                </span>
                                <span className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    + 15 more islands
                                </span>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white rounded-2xl p-5 border-l-4 border-emerald-500 shadow-md">
                            <p className="text-gray-700 italic mb-3">
                                &quot;My daughter runs to the mailbox every month! The letters from R.O.T.I. have become bedtime reading traditions.&quot;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                                    👩🏾
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-deep">Keisha M.</p>
                                    <p className="text-xs text-gray-500">Heritage Hero Member</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Note */}
                <div className="text-center mt-12">
                    <p className="text-sm text-amber-700 font-medium">
                        🌍 Shipping to USA, Canada, UK & Caribbean • 📦 Arrives by the 15th of each month
                    </p>
                </div>
            </div>
        </section>
    );
};

export default MailingClubSection;
