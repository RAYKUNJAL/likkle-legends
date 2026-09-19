"use client";

import React, { useEffect, useState } from 'react';
import {
    BookOpen, Music, Play, Palette,
    Target, Radio, Download, Sparkles, MessageCircle,
} from 'lucide-react';
import type { PortalCapabilities } from '@/lib/portal-capabilities';

interface TileDestination {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    gradient: string;
    emoji: string;
    comingSoonWhen?: keyof PortalCapabilities;
}

interface IslandTileGridProps {
    onNavigate: (section: string) => void;
}

const DESTINATIONS: TileDestination[] = [
    { id: 'stories', title: 'Story Island', description: 'Read & listen', icon: BookOpen, gradient: 'from-lime-400 to-green-500', emoji: '📚' },
    { id: 'games', title: 'Play Port', description: 'Games that play', icon: Palette, gradient: 'from-emerald-400 to-teal-500', emoji: '🎮' },
    { id: 'songs', title: 'Explore Music', description: 'Open Music Hub', icon: Music, gradient: 'from-pink-400 to-rose-500', emoji: '🎵' },
    { id: 'buddy', title: 'Buddy Bay', description: 'Chat with a Legend', icon: MessageCircle, gradient: 'from-cyan-400 to-sky-500', emoji: '💬' },
    { id: 'missions', title: 'Adventure Atoll', description: 'Quests', icon: Target, gradient: 'from-amber-400 to-orange-500', emoji: '🗺️' },
    { id: 'story-studio', title: 'Create Magic', description: 'Make your own stories', icon: Sparkles, gradient: 'from-purple-400 to-fuchsia-500', emoji: '✨', comingSoonWhen: 'storyStudio' },
    { id: 'lessons', title: 'Cinema Cay', description: 'Watch & learn', icon: Play, gradient: 'from-indigo-400 to-blue-500', emoji: '🎬' },
    { id: 'printables', title: 'Craft Cove', description: 'Print & make', icon: Download, gradient: 'from-orange-400 to-amber-500', emoji: '🖍️' },
    { id: 'radio', title: 'Broadcast Bay', description: 'Live radio', icon: Radio, gradient: 'from-red-400 to-rose-500', emoji: '📻' },
];

export default function IslandTileGrid({ onNavigate }: IslandTileGridProps) {
    const [capabilities, setCapabilities] = useState<PortalCapabilities | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch('/api/portal/capabilities')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!cancelled && data) setCapabilities(data);
            })
            .catch(() => {
                // Fail open for tiles that do not depend on keys.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                const comingSoon = Boolean(
                    dest.comingSoonWhen &&
                    capabilities &&
                    capabilities[dest.comingSoonWhen] &&
                    !capabilities[dest.comingSoonWhen].available
                );

                return (
                    <button
                        key={dest.id}
                        type="button"
                        onClick={() => onNavigate(dest.id)}
                        className="group relative bg-white rounded-[1.75rem] border-4 border-white shadow-lg shadow-sky-100 hover:shadow-2xl hover:shadow-sky-200 hover:-translate-y-1.5 active:scale-95 transition-all text-left overflow-hidden"
                    >
                        <div className={`relative h-20 sm:h-24 bg-gradient-to-br ${dest.gradient} flex items-center justify-center`}>
                            <span className="text-4xl sm:text-5xl drop-shadow-md group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300 select-none">
                                {dest.emoji}
                            </span>
                            <span className="absolute bottom-2 right-2 w-8 h-8 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                                <Icon size={16} />
                            </span>
                            {comingSoon && (
                                <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-700">
                                    Coming soon
                                </span>
                            )}
                        </div>
                        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="font-black text-slate-800 text-sm sm:text-base leading-tight">{dest.title}</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-400">
                                {comingSoon ? 'Service not connected yet' : dest.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
