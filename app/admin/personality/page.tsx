"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, StatusBadge, ActionButton, Tabs,
    Sparkles, ShieldCheck, RefreshCw
} from '@/components/admin/AdminComponents';
import { Save, RotateCcw, Quote, Brain } from 'lucide-react';
import { getAdminCharacters } from '@/app/actions/admin';
import { getCharacterPersonality, saveCharacterPersonality } from '@/app/actions/personality';

export default function AdminPersonalityPage() {
    const [characters, setCharacters] = useState<any[]>([]);
    const [selectedChar, setSelectedChar] = useState<any>(null);
    const [personality, setPersonality] = useState<any>({
        system_prompt: '',
        knowledge_base: '',
        catchphrases: [],
        voice_settings: { stability: 0.5, clarity: 0.75 }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const data = await getAdminCharacters(session.access_token);
            setCharacters(data);
            if (data.length > 0) handleSelectCharacter(data[0]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectCharacter = async (char: any) => {
        setSelectedChar(char);
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const data = await getCharacterPersonality(session.access_token, char.id);
            if (data) {
                setPersonality(data);
            } else {
                setPersonality({
                    system_prompt: `You are ${char.name}, ${char.role}. Your vibe is ${char.tagline}.`,
                    knowledge_base: '',
                    catchphrases: [],
                    voice_settings: { stability: 0.5, clarity: 0.75 }
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedChar) return;
        setIsSaving(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await saveCharacterPersonality(session.access_token, selectedChar.id, personality);
            alert('Personality Brain updated successfully!');
        } catch (error) {
            alert('Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout activeSection="characters">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Brain className="text-primary" />
                            AI Brain & Personality
                        </h1>
                        <p className="text-gray-500">Fine-tune how your characters think and speak</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedChar}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Brain State
                    </button>
                </div>
            </header>

            <div className="p-8 grid lg:grid-cols-12 gap-8">
                {/* Character List */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Characters</h3>
                    <div className="space-y-2">
                        {characters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => handleSelectCharacter(char)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${selectedChar?.id === char.id ? 'bg-white shadow-md border-2 border-primary' : 'bg-gray-50 border-2 border-transparent hover:bg-white hover:border-gray-200'}`}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                    <img src={char.image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 leading-tight">{char.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase">{char.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-9 space-y-6">
                    {isLoading ? (
                        <div className="h-96 flex items-center justify-center bg-white rounded-[2rem] border border-gray-100">
                            <RefreshCw className="animate-spin text-primary" size={40} />
                        </div>
                    ) : selectedChar ? (
                        <div className="grid gap-6">
                            {/* System Prompt */}
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="text-blue-500" size={20} />
                                    <h3 className="text-lg font-black text-gray-900">System Instructions (The Soul)</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">This defines the core behavior, tone, and specific Caribbean dialect of the character.</p>
                                <textarea
                                    value={personality.system_prompt}
                                    onChange={(e) => setPersonality({ ...personality, system_prompt: e.target.value })}
                                    className="w-full h-48 p-6 bg-slate-50 border border-gray-100 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. You are a warm, wise Caribbean grandmother..."
                                />
                            </div>

                            {/* Knowledge Base */}
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Quote className="text-orange-500" size={20} />
                                    <h3 className="text-lg font-black text-gray-900">World Knowledge & Facts</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Add specific cultural facts, island lore, or stories this character should know.</p>
                                <textarea
                                    value={personality.knowledge_base}
                                    onChange={(e) => setPersonality({ ...personality, knowledge_base: e.target.value })}
                                    className="w-full h-48 p-6 bg-slate-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="e.g. Tobago is known for the Goat Races. The steelpan was invented in Trinidad..."
                                />
                            </div>

                            {/* Voice Settings */}
                            <div className="bg-deep p-8 rounded-[2rem] text-white shadow-xl grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                                        <Sparkles size={20} className="text-primary" />
                                        Voice Synthesis (ElevenLabs)
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-white/60 uppercase">
                                                <span>Stability</span>
                                                <span>{personality.voice_settings?.stability * 100}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.05"
                                                value={personality.voice_settings?.stability || 0.5}
                                                onChange={(e) => setPersonality({
                                                    ...personality,
                                                    voice_settings: { ...personality.voice_settings, stability: parseFloat(e.target.value) }
                                                })}
                                                className="w-full accent-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-white/60 uppercase">
                                                <span>Clarity / Similarity</span>
                                                <span>{personality.voice_settings?.clarity * 100}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.05"
                                                value={personality.voice_settings?.clarity || 0.75}
                                                onChange={(e) => setPersonality({
                                                    ...personality,
                                                    voice_settings: { ...personality.voice_settings, clarity: parseFloat(e.target.value) }
                                                })}
                                                className="w-full accent-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl border-dashed">
                                    <h4 className="font-bold mb-2">Pro Tip:</h4>
                                    <p className="text-sm text-white/60 leading-relaxed">Lower stability makes the voice more expressive and dynamic (good for storytelling), while higher stability makes it consistent and calm (good for coaching).</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                            <Brain className="text-gray-200 mb-4" size={64} />
                            <h3 className="text-xl font-bold text-gray-300">Select a character to edit their brain</h3>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
