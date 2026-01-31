
"use client";

import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { generateAdventureAction } from '@/app/actions/adventure';
import { StoryParams, StoryPage } from '@/lib/types';
import StoryReader from './StoryReader';
import { useUser } from './UserContext';

export default function AdventureCreator() {
    const { activeChild } = useUser();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const [generatedPages, setGeneratedPages] = useState<StoryPage[] | null>(null);
    const [showReader, setShowReader] = useState(false);

    const [params, setParams] = useState<StoryParams>({
        child_name: activeChild?.first_name || "",
        island: activeChild?.primary_island || "Trinidad",
        character: "Tanty Spice",
        challenge: "Finding a hidden waterfall"
    });

    const handleCreate = async () => {
        if (!params.child_name) {
            setError("Please tell Tanty who de adventure is for!");
            return;
        }
        setIsGenerating(true);
        setError("");

        try {
            const res = await generateAdventureAction(params);
            if (res.success && res.pages) {
                setGeneratedPages(res.pages);
                setShowReader(true);
            } else {
                setError(res.error || "De island magic is a bit sleepy right now. Try again?");
            }
        } catch (e) {
            setError("Something went wrong in de village. Try again, darlin'.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border-4 border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                        <Sparkles size={24} className="sm:size-8" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-3xl font-black text-blue-950">Magic Adventure Studio</h2>
                        <p className="text-blue-900/40 text-[10px] sm:text-xs font-black uppercase tracking-widest">Create Your Own Legend</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 ml-4 mb-1 block">Explorer Name</label>
                            <input
                                type="text"
                                value={params.child_name}
                                onChange={(e) => setParams({ ...params, child_name: e.target.value })}
                                placeholder="Who is going on de adventure?"
                                className="w-full px-6 py-4 bg-blue-50/50 rounded-2xl text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 ml-4 mb-1 block">Starting Island</label>
                            <select
                                value={params.island}
                                onChange={(e) => setParams({ ...params, island: e.target.value })}
                                className="w-full px-6 py-4 bg-blue-50/50 rounded-2xl text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                title="Select Starting Island"
                            >
                                <option>Trinidad</option>
                                <option>Jamaica</option>
                                <option>Barbados</option>
                                <option>Grenada</option>
                                <option>Antigua</option>
                                <option>St. Lucia</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 ml-4 mb-1 block">Island Guide</label>
                            <select
                                value={params.character}
                                onChange={(e) => setParams({ ...params, character: e.target.value })}
                                className="w-full px-6 py-4 bg-blue-50/50 rounded-2xl text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                title="Select Island Guide"
                            >
                                <option>Tanty Spice</option>
                                <option>Dilly Doubles</option>
                                <option>Scorcha</option>
                                <option>Mango Moko</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-900/40 ml-4 mb-1 block">De Mission</label>
                            <select
                                value={params.challenge}
                                onChange={(e) => setParams({ ...params, challenge: e.target.value })}
                                className="w-full px-6 py-4 bg-blue-50/50 rounded-2xl text-blue-950 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                title="Select De Mission"
                            >
                                <option>Finding a hidden waterfall</option>
                                <option>Learning de Steelpan magic</option>
                                <option>Decoding de Anansi mystery</option>
                                <option>Winning de Carnival race</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={isGenerating}
                    className="w-full py-5 sm:py-6 bg-gradient-to-r from-primary to-accent text-white rounded-2xl sm:rounded-[2rem] font-black text-lg sm:text-xl flex items-center justify-center gap-3 sm:gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" size={24} className="sm:size-7" />
                            <span className="text-sm sm:text-lg">Baking Your Magic Story...</span>
                        </>
                    ) : (
                        <>
                            <Wand2 size={24} className="sm:size-7" />
                            <span>Launch Magic Adventure</span>
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-500 font-bold justify-center">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {showReader && generatedPages && (
                <StoryReader
                    title={`${params.character}'s ${params.island} Quest`}
                    pages={generatedPages}
                    onClose={() => setShowReader(false)}
                />
            )}
        </div>
    );
}
