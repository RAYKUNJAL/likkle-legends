"use client";

import React, { useState } from 'react';
import { QUESTS } from '@/lib/constants';
import { trackEvent } from '@/services/analyticsService';

interface CultureQuestsProps {
    onComplete?: (points: number, questId: string) => void;
    completedIds?: string[];
}

export const CultureQuests: React.FC<CultureQuestsProps> = ({ onComplete, completedIds = [] }) => {
    const [activeQuest, setActiveQuest] = useState<any>(null);

    const handleAccept = (quest: any) => {
        setActiveQuest({ ...quest, step: 0 });
        trackEvent('quest_started', { questId: quest.id });
    };

    const handleFinish = () => {
        if (activeQuest && onComplete) {
            onComplete(activeQuest.rewardPoints, activeQuest.id);
            trackEvent('quest_completed', { questId: activeQuest.id });
        }
        setActiveQuest(null);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-5xl font-heading font-black text-blue-950">Culture Quests</h2>
                <div className="flex items-center gap-3 bg-yellow-400 text-blue-950 px-6 py-2 rounded-full font-black shadow-lg">
                    <span>🏆</span> {completedIds.length * 100} Points
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {QUESTS.map(quest => {
                    const isDone = completedIds.includes(quest.id);
                    return (
                        <div key={quest.id} className={`bg-white p-8 rounded-[3rem] border-4 shadow-xl flex flex-col gap-6 relative overflow-hidden transition-all ${isDone ? 'border-green-400 opacity-80' : 'border-blue-50 hover:scale-[1.02]'}`}>
                            {isDone && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10">
                                    Completed ✨
                                </div>
                            )}
                            <div className="flex justify-between items-start">
                                <div className="text-5xl">{quest.icon}</div>
                                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {quest.category}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-heading font-black text-blue-950 mb-2">{quest.title}</h3>
                                <p className="text-blue-900/60 font-bold">{quest.description}</p>
                            </div>
                            <div className="space-y-2">
                                {quest.steps.map((step, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${isDone ? 'bg-green-50 border-green-100' : 'bg-blue-50/50 border-transparent hover:border-blue-100'}`}>
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${isDone ? 'bg-green-500 text-white' : 'bg-white text-blue-600'}`}>{isDone ? '✓' : i + 1}</span>
                                        <span className={`text-sm font-bold ${isDone ? 'text-green-950/60 line-through' : 'text-blue-950/80'}`}>{step}</span>
                                    </div>
                                ))}
                            </div>
                            {!isDone && (
                                <button onClick={() => handleAccept(quest)} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all mt-auto">
                                    Accept Mission!
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {activeQuest && (
                <div className="fixed inset-0 z-[200] bg-blue-950/80 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 text-center space-y-8 animate-in zoom-in-95 relative border-8 border-yellow-400">
                        <div className="text-8xl animate-bounce">{activeQuest.icon}</div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-heading font-black text-blue-950">Mission Time!</h3>
                            <p className="text-lg font-bold text-blue-900/60 leading-relaxed">
                                "Well done, me star! Go out dere and finish yuh mission. Tanty waitin' for yuh to return!"
                            </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl text-left border-2 border-blue-100">
                            <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">Your Task:</p>
                            <p className="font-bold text-blue-950">{activeQuest.steps[0]}</p>
                        </div>
                        <button onClick={handleFinish} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
                            I'm Done! 🎉
                        </button>
                        <button onClick={() => setActiveQuest(null)} className="text-blue-300 font-black uppercase tracking-widest text-[10px] hover:text-blue-600">Cancel Mission</button>
                    </div>
                </div>
            )}
        </div>
    );
};
