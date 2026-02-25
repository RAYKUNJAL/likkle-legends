"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Gift, Crown, Heart, Users, Zap, Mail, X } from 'lucide-react';

/**
 * NEW FREEMIUM PRICING PAGE
 * 
 * Strategy: Forever Free for kids, teachers, schools
 * Revenue: Email list monetization, premium add-ons, sponsors
 */

interface PremiumAddon {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: typeof Gift;
    popular?: boolean;
}

const PREMIUM_ADDONS: PremiumAddon[] = [
    {
        id: 'custom_story',
        name: 'Personalized Storybook',
        price: 24.99,
        description: 'Your child becomes the hero! Custom AI-generated story with their name, interests, and island heritage.',
        icon: Sparkles,
        popular: true
    },
    {
        id: 'monthly_mailer',
        name: 'Island Mail Club',
        price: 14.99,
        description: 'Monthly physical package: coloring book, flashcards, stickers, and activity sheets mailed to your door.',
        icon: Mail
    },
    {
        id: 'family_bundle',
        name: 'Extended Family Pack',
        price: 9.99,
        description: 'Add unlimited child profiles, grandparent access, and family progress dashboard.',
        icon: Users
    }
];

export default function FreemiumPricing() {
    const [showEmailModal, setShowEmailModal] = useState(false);

    return (
        <section id="pricing" className="py-24 bg-gradient-to-br from-green-50 via-white to-orange-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - FREE Emphasis */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full text-lg font-black mb-6 animate-pulse">
                        <Gift size={24} />
                        FOREVER FREE
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
                        Free for <span className="text-primary">Every</span> Caribbean Child
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                        Stories, songs, games, and learning materials celebrating our culture.
                        <strong className="text-gray-900"> No credit card. No trial. Free forever.</strong>
                    </p>
                </div>

                {/* Main FREE Card */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="relative bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-green-400">
                        {/* FREE Banner */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 text-center">
                            <span className="text-2xl font-black">🎉 100% FREE — No Catch!</span>
                        </div>

                        <div className="p-10 md:p-12">
                            {/* Price Display */}
                            <div className="text-center mb-10">
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-7xl md:text-8xl font-black text-gray-900">$0</span>
                                    <span className="text-2xl text-gray-400">/forever</span>
                                </div>
                                <p className="text-green-600 font-bold mt-2">
                                    ✓ No hidden fees ✓ No credit card required ✓ No expiration
                                </p>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid md:grid-cols-2 gap-4 mb-10">
                                {[
                                    '📚 Unlimited Caribbean stories',
                                    '🎵 Original island songs & lullabies',
                                    '🎮 Educational games (counting, ABCs)',
                                    '📥 Printable activity sheets',
                                    '🌴 Island heritage content',
                                    '🗣️ AI voice narration',
                                    '👨‍👩‍👧 Up to 3 child profiles',
                                    '📊 Learning progress tracking',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <span className="text-xl">{feature.slice(0, 2)}</span>
                                        <span className="text-gray-700 font-medium">{feature.slice(3)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="space-y-4">
                                <Link
                                    href="/signup"
                                    className="block w-full py-5 bg-gradient-to-r from-primary to-accent text-white text-xl font-black text-center rounded-2xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Start Free — Get Instant Access 🚀
                                </Link>
                                <p className="text-center text-gray-400 text-sm">
                                    Join 10,000+ Caribbean families already learning with us
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Special Callouts */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
                    {/* Teachers */}
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-white">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                            <Users size={28} />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Teachers & Schools</h3>
                        <p className="text-white/80 mb-4">
                            Full classroom access, bulk student accounts, lesson plans, and curriculum guides.
                            Everything FREE for educators.
                        </p>
                        <Link
                            href="/educators"
                            className="inline-block px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
                        >
                            Get Educator Access →
                        </Link>
                    </div>

                    {/* Diaspora */}
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-8 text-white">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                            <Heart size={28} />
                        </div>
                        <h3 className="text-2xl font-black mb-2">Diaspora Families</h3>
                        <p className="text-white/80 mb-4">
                            Keep your children connected to their Caribbean heritage, no matter where you live.
                            Patois phrases, cultural stories, island traditions.
                        </p>
                        <Link
                            href="/signup?ref=diaspora"
                            className="inline-block px-6 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
                        >
                            Join the Island Family →
                        </Link>
                    </div>
                </div>

                {/* Premium Add-ons */}
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-4">
                            <Crown size={16} />
                            Optional Upgrades
                        </span>
                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                            Want Something Extra Special?
                        </h3>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Our free content is amazing, but these premium add-ons take the experience to another level.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {PREMIUM_ADDONS.map((addon) => (
                            <div
                                key={addon.id}
                                className={`bg-white rounded-3xl p-6 border-2 transition-all hover:scale-105 hover:shadow-xl ${addon.popular
                                        ? 'border-primary shadow-lg'
                                        : 'border-gray-100'
                                    }`}
                            >
                                {addon.popular && (
                                    <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4">
                                        ⭐ MOST POPULAR
                                    </span>
                                )}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${addon.popular
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <addon.icon size={24} />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-2">{addon.name}</h4>
                                <p className="text-gray-500 text-sm mb-4">{addon.description}</p>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-black text-gray-900">${addon.price}</span>
                                    <span className="text-gray-400">{addon.id === 'monthly_mailer' ? '/mo' : '/one-time'}</span>
                                </div>
                                <Link
                                    href={`/checkout?addon=${addon.id}`}
                                    className={`block w-full py-3 rounded-xl font-bold text-center transition-all ${addon.popular
                                            ? 'bg-primary text-white hover:bg-primary/90'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Add to Account
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="mt-20 bg-gradient-to-r from-deep via-gray-900 to-deep rounded-3xl p-8 md:p-12 text-white text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl md:text-3xl font-black mb-3">
                        Weekly Island Magic in Your Inbox
                    </h3>
                    <p className="text-white/70 max-w-xl mx-auto mb-6">
                        New stories, printables, and Caribbean parenting tips every week.
                        Join 15,000+ families in the Likkle Legends newsletter!
                    </p>
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Zap size={20} />
                        Get Weekly Content Free
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-8 mt-12 text-base font-bold text-gray-600">
                    <span className="flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        COPPA Compliant
                    </span>
                    <span className="flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        No Ads Ever
                    </span>
                    <span className="flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        Privacy First
                    </span>
                    <span className="flex items-center gap-2">
                        <Check className="text-green-500" size={20} />
                        Made by Caribbean Parents
                    </span>
                </div>
            </div>
        </section>
    );
}
