"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, MessageCircle, Star } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { CHARACTER_CONFIGS, CHARACTER_ORDER, CharacterId } from '@/lib/characterConfig';
import { TIER_LEVELS } from '@/lib/feature-access';
import { normalizeParentalControls } from '@/lib/parental-controls';

export default function ChooseYourBuddyPage() {
    const router = useRouter();
    const { activeChild, user, isLoading } = useUser();

    const favChar = activeChild?.favorite_character as CharacterId | undefined;
    const hasActiveSubscription = user?.subscription_status === 'active' || user?.subscription_status === 'trialing';
    const isPaid = hasActiveSubscription && (TIER_LEVELS[user?.subscription_tier || 'free'] ?? 0) > 0;
    const parentalControls = normalizeParentalControls((user as any)?.parental_controls);

    if (!parentalControls.allow_buddy) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Buddy Chat Is Locked</h2>
                    <p className="text-slate-500 font-semibold">Your parent controls currently disable buddy chat.</p>
                    <button
                        type="button"
                        onClick={() => router.push('/portal/settings')}
                        className="inline-block mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black"
                    >
                        Open Parent Controls
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 flex flex-col">
            <header className="p-6 flex items-center gap-4">
                <button
                    onClick={() => router.push('/portal')}
                    title="Back to portal"
                    aria-label="Back to portal"
                    className="w-10 h-10 bg-white rounded-xl shadow flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 leading-none">Choose Your Buddy</h1>
                    {activeChild && (
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                            Hey {activeChild.first_name}! Who do you want to chat with today?
                        </p>
                    )}
                </div>
            </header>

            <main className="flex-1 px-6 pb-12 max-w-2xl mx-auto w-full">
                {isLoading ? (
                    <div className="rounded-3xl bg-white/80 px-5 py-8 text-center shadow-sm">
                        <p className="text-sm font-bold text-slate-500">Loading your buddy options...</p>
                    </div>
                ) : (
                    <>
                {!isPaid && (
                    <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Paid Feature</p>
                        <h2 className="mt-2 text-lg font-black text-slate-900">Buddy chat is available on paid plans.</h2>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                            Upgrade to unlock the full kid-safe chat, voice mode, and memory experience for your child.
                        </p>
                        <button
                            type="button"
                            onClick={() => router.push('/checkout')}
                            className="mt-4 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white"
                        >
                            Upgrade Now
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {CHARACTER_ORDER.map((characterId) => {
                        const config = CHARACTER_CONFIGS[characterId];
                        const isFav = favChar === characterId;
                        const locked = !isPaid;

                        const cardContent = (
                            <div className={`
                                relative bg-white rounded-3xl shadow-lg overflow-hidden
                                border-2 transition-all duration-200
                                ${locked ? 'opacity-70' : 'group-hover:shadow-xl group-hover:scale-[1.01]'}
                                ${isFav && !locked ? 'border-amber-400' : 'border-transparent'}
                            `}>
                                <div className={`h-1.5 bg-gradient-to-r ${config.visual.gradient}`} />

                                {isFav && !locked && (
                                    <div className="absolute top-4 right-4 bg-amber-400 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Star size={10} fill="currentColor" />
                                        Your Buddy
                                    </div>
                                )}

                                {locked && (
                                    <div className="absolute top-4 right-4 bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Lock size={10} />
                                        Upgrade to Unlock
                                    </div>
                                )}

                                <div className="flex items-center gap-5 p-5">
                                    <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br ${config.visual.gradient} flex-shrink-0 shadow-md ${locked ? 'grayscale' : ''}`}>
                                        <Image
                                            src={config.persona.avatarUrl}
                                            alt={config.persona.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const img = e.currentTarget as HTMLImageElement;
                                                img.style.display = 'none';
                                                const fallback = img.nextElementSibling as HTMLElement | null;
                                                if (fallback) fallback.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="hidden w-full h-full items-center justify-center text-4xl pointer-events-none select-none">
                                            {config.visual.emoji}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-black text-slate-900 leading-tight">
                                            {config.persona.name}
                                        </h2>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            {config.persona.role}
                                        </p>
                                        <p className="text-sm text-slate-600 font-medium leading-snug line-clamp-2">
                                            {config.persona.tagline}
                                        </p>
                                    </div>

                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${locked ? 'bg-slate-200 text-slate-400' : `bg-gradient-to-br ${config.visual.gradient} text-white shadow-md group-hover:scale-110`}
                                        transition-transform
                                    `}>
                                        {locked ? <Lock size={18} /> : <MessageCircle size={18} />}
                                    </div>
                                </div>

                                <div className="px-5 pb-4">
                                    {locked ? (
                                        <p className="text-xs text-slate-400 font-bold">Unlock with any paid plan - starts at $4.99/mo</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic font-medium">
                                            "{config.persona.catchphrases[0]}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        );

                        if (locked) {
                            return (
                                <button
                                    key={characterId}
                                    type="button"
                                    onClick={() => router.push('/checkout')}
                                    className="block w-full text-left group"
                                >
                                    {cardContent}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={characterId}
                                href={`/portal/buddy/${characterId}`}
                                className="block group"
                            >
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>

                {isPaid && (
                    <p className="text-center text-xs text-slate-400 font-medium mt-8">
                        You can chat with all three - switch anytime.
                    </p>
                )}
                    </>
                )}
            </main>
        </div>
    );
}
