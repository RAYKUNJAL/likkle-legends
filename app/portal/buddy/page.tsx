"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { CHARACTER_CONFIGS, CHARACTER_ORDER, CharacterId } from '@/lib/characterConfig';

export default function ChooseYourBuddyPage() {
    const router = useRouter();
    const { activeChild } = useUser();

    const favChar = activeChild?.favorite_character as CharacterId | undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 flex flex-col">
            {/* Header */}
            <header className="p-6 flex items-center gap-4">
                <button
                    onClick={() => router.push('/portal')}
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

            {/* Character Cards */}
            <main className="flex-1 px-6 pb-12 max-w-2xl mx-auto w-full">
                <div className="space-y-4">
                    {CHARACTER_ORDER.map((characterId) => {
                        const config = CHARACTER_CONFIGS[characterId];
                        const isFav = favChar === characterId;

                        return (
                            <Link
                                key={characterId}
                                href={`/portal/buddy/${characterId}`}
                                className="block group"
                            >
                                <div className={`
                                    relative bg-white rounded-3xl shadow-lg overflow-hidden
                                    border-2 transition-all duration-200
                                    group-hover:shadow-xl group-hover:scale-[1.01]
                                    ${isFav ? 'border-amber-400' : 'border-transparent'}
                                `}>
                                    {/* Gradient accent bar */}
                                    <div className={`h-1.5 bg-gradient-to-r ${config.visual.gradient}`} />

                                    {isFav && (
                                        <div className="absolute top-4 right-4 bg-amber-400 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                                            <Star size={10} fill="currentColor" />
                                            Your Buddy
                                        </div>
                                    )}

                                    <div className="flex items-center gap-5 p-5">
                                        {/* Avatar */}
                                        <div className={`w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br ${config.visual.gradient} flex-shrink-0 shadow-md`}>
                                            <Image
                                                src={config.persona.avatarUrl}
                                                alt={config.persona.name}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback: show emoji if image missing
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <div className="w-full h-full flex items-center justify-center text-4xl -mt-20 pointer-events-none select-none">
                                                {config.visual.emoji}
                                            </div>
                                        </div>

                                        {/* Info */}
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

                                        {/* CTA Arrow */}
                                        <div className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                            bg-gradient-to-br ${config.visual.gradient} text-white shadow-md
                                            group-hover:scale-110 transition-transform
                                        `}>
                                            <MessageCircle size={18} />
                                        </div>
                                    </div>

                                    {/* Catchphrase preview */}
                                    <div className="px-5 pb-4">
                                        <p className="text-xs text-slate-400 italic font-medium">
                                            "{config.persona.catchphrases[0]}"
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom note */}
                <p className="text-center text-xs text-slate-400 font-medium mt-8">
                    You can chat with all three — switch anytime!
                </p>
            </main>
        </div>
    );
}
