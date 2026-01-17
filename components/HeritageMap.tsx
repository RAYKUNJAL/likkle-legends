"use client";

import React from 'react';
import { Map, Lock, Star, ChevronRight, Trophy } from 'lucide-react';

interface TrailModule {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    status: 'completed' | 'current' | 'locked';
    xpReward: number;
}

const TRAIL_DATA: TrailModule[] = [
    { id: '1', title: 'Coconut Cove', subtitle: 'Island Basics', icon: '🥥', status: 'completed', xpReward: 500 },
    { id: '2', title: 'The Rhythm Jungle', subtitle: 'Music & Steelpan', icon: '🥁', status: 'current', xpReward: 750 },
    { id: '3', title: 'Flavor Falls', subtitle: 'Traditions & Food', icon: '🥭', status: 'locked', xpReward: 1000 },
    { id: '4', title: 'Perspective Peak', subtitle: 'Perspective Guide', icon: '🏔️', status: 'locked', xpReward: 1200 },
    { id: '5', title: 'Heritage Heart', subtitle: 'Village Legend', icon: '👑', status: 'locked', xpReward: 2000 },
];

export const HeritageMap: React.FC = () => {
    return (
        <div className="bg-white rounded-[4rem] p-12 shadow-2xl border-b-[16px] border-blue-100 relative overflow-hidden">
            {/* Background Decorative Path */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 1000 600" fill="none">
                <path d="M100 300C300 100 700 500 900 300" stroke="#000" strokeWidth="20" strokeLinecap="round" strokeDasharray="40 40" />
            </svg>

            <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-5xl font-heading font-black text-blue-950 flex items-center gap-4">
                            <Map className="text-orange-500 w-12 h-12" /> Heritage Trail
                        </h2>
                        <p className="text-blue-900/60 font-bold text-xl mt-2">Follow de path to become a Village Legend!</p>
                    </div>
                    <div className="bg-yellow-400 text-blue-950 px-8 py-3 rounded-full font-black shadow-xl flex items-center gap-3">
                        <Trophy /> Rank: Little Sapling
                    </div>
                </div>

                <div className="flex flex-wrap gap-8 justify-center py-10">
                    {TRAIL_DATA.map((module, index) => {
                        const isCompleted = module.status === 'completed';
                        const isCurrent = module.status === 'current';
                        const isLocked = module.status === 'locked';

                        return (
                            <div key={module.id} className="relative group">
                                {/* Connecting Line (except for last) */}
                                {index < TRAIL_DATA.length - 1 && (
                                    <div className={`hidden lg:block absolute top-1/2 -right-4 w-8 h-2 ${isCompleted ? 'bg-green-400' : 'bg-blue-100'}`} />
                                )}

                                <div className={`
                  w-48 h-64 rounded-[3rem] p-6 flex flex-col items-center justify-between transition-all duration-300 border-4
                  ${isCompleted ? 'bg-green-50 border-green-200 opacity-80 grayscale-[20%]' : ''}
                  ${isCurrent ? 'bg-white border-orange-400 shadow-[0_20px_50px_rgba(251,133,0,0.2)] scale-110 z-20 ring-8 ring-orange-100' : ''}
                  ${isLocked ? 'bg-blue-50 border-transparent opacity-50 grayscale' : ''}
                `}>
                                    <div className="text-6xl group-hover:scale-125 transition-transform">
                                        {isLocked ? '🔒' : module.icon}
                                    </div>

                                    <div className="text-center space-y-1">
                                        <h3 className="font-heading font-black text-blue-950 text-lg leading-tight">{module.title}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">{module.subtitle}</p>
                                    </div>

                                    {isCurrent ? (
                                        <button className="w-full bg-orange-500 text-white py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                            Continue Adventure
                                        </button>
                                    ) : isCompleted ? (
                                        <div className="flex items-center gap-1 text-green-500 font-black text-[10px] uppercase">
                                            <Star className="w-3 h-3 fill-green-500" /> Completed
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-blue-200 font-black text-[10px] uppercase tracking-widest">
                                            Locked
                                        </div>
                                    )}

                                    {/* XP Badge */}
                                    <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black shadow-lg ${isLocked ? 'bg-gray-200 text-gray-500' : 'bg-yellow-400 text-blue-950'}`}>
                                        +{module.xpReward} XP
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-blue-950 text-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
                    <div className="text-6xl">✨</div>
                    <div className="flex-1 space-y-2">
                        <h4 className="text-3xl font-heading font-black">Next Milestone: Heritage Heart</h4>
                        <p className="text-white/60 font-bold leading-relaxed">
                            Only 250 XP away from unlocking de magic behind de Village Heart. Keep reading and playin' to discover de secrets of de islands!
                        </p>
                    </div>
                    <button className="bg-white text-blue-950 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                        Unlock Now
                    </button>
                </div>
            </div>
        </div>
    );
};
