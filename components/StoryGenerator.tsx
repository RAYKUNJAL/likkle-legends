"use client";

import { useState } from 'react';
import { Sparkles, Wand2, BookOpen, User, AlertCircle, Volume2 } from 'lucide-react';
import { createStoryAction } from '@/app/actions/story';
import { siteContent } from '@/lib/content';
import PrintStudio from '@/components/PrintStudio';

export default function StoryGenerator() {
    const { ai_story_studio } = siteContent;
    const { form, upsell_note } = ai_story_studio;

    const [formData, setFormData] = useState({
        childName: "",
        primaryIsland: "Trinidad",
        guide: "Tanty Spice",
        location: "Rainforest",
        mission: "Folklore Quest"
    });
    const [result, setResult] = useState<{ title: string; content: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        if (!formData.childName) return;
        setIsGenerating(true);
        setError("");

        try {
            const res = await createStoryAction(formData);
            if (res.success && res.story) {
                setResult(res.story);
            } else {
                setError(form.states.error_message || "Oye! The magic is sleeping.");
            }
        } catch (e) {
            setError("Something went wrong, darlin'.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Audio State
    const [audioState, setAudioState] = useState<{ id: string; loading: boolean; playing: boolean }>({ id: '', loading: false, playing: false });
    const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

    const handleReadSegment = async (text: string, id: string) => {
        if (audioState.playing && audioState.id === id) {
            audioEl?.pause();
            setAudioState({ ...audioState, playing: false });
            return;
        }

        if (audioState.playing && audioState.id !== id) {
            audioEl?.pause();
        }

        setAudioState({ id, loading: true, playing: false });

        try {
            // Import dynamically to avoid server/client issues if needed, but here simple import work
            const { readStorySegment } = await import('@/app/actions/storyteller');
            const res = await readStorySegment(text);

            if (res.success && res.audio) {
                const audio = new Audio(res.audio);
                audio.onended = () => setAudioState(prev => ({ ...prev, playing: false }));
                await audio.play();
                setAudioEl(audio);
                setAudioState({ id, loading: false, playing: true });
            } else {
                setAudioState({ id: '', loading: false, playing: false });
            }
        } catch (e) {
            console.error(e);
            setAudioState({ id: '', loading: false, playing: false });
        }
    };

    // Helper to get field config
    const getField = (id: string) => form.fields.find(f => f.id === id);

    const nameField = getField('child_name');
    const islandField = getField('island');
    const guideField = getField('guide');
    const locationField = getField('location');
    const missionField = getField('mission');

    return (
        <section id="sample-letter" className="py-24 bg-zinc-50">
            <div className="container">
                <div className="max-w-6xl mx-auto bg-white rounded-[4rem] border-8 border-primary/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
                    <div className="lg:w-2/5 p-10 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-100">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> AI Story Studio
                        </div>
                        <h2 className="text-4xl font-black text-deep mb-4 leading-tight">
                            {ai_story_studio.title}
                        </h2>
                        <p className="text-deep/60 text-sm mb-8">
                            {ai_story_studio.subtitle}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{nameField?.label}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.childName}
                                        onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                        placeholder={nameField?.placeholder}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-none"
                                    />
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-deep/20" size={18} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="island-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{islandField?.label}</label>
                                    <select
                                        id="island-select"
                                        title={islandField?.label}
                                        value={formData.primaryIsland}
                                        onChange={(e) => setFormData({ ...formData, primaryIsland: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {islandField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="guide-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{guideField?.label}</label>
                                    <select
                                        id="guide-select"
                                        title={guideField?.label}
                                        value={formData.guide}
                                        onChange={(e) => setFormData({ ...formData, guide: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {guideField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{locationField?.label}</label>
                                    <select
                                        id="location-select"
                                        title={locationField?.label}
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {locationField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="mission-select" className="text-[10px] font-black uppercase tracking-widest text-deep/40 ml-4 mb-1 block">{missionField?.label}</label>
                                    <select
                                        id="mission-select"
                                        title={missionField?.label}
                                        value={formData.mission}
                                        onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                        className="w-full px-6 py-4 bg-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none border-none"
                                    >
                                        {missionField?.options?.map(opt => <option key={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!formData.childName || isGenerating}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20 mt-4"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {form.states.loading_message}
                                    </span>
                                ) : (
                                    <><Wand2 size={24} /> {form.primary_button.label}</>
                                )}
                            </button>

                            {error && (
                                <p className="text-red-500 text-xs font-bold text-center mt-4 flex items-center justify-center gap-1">
                                    <AlertCircle size={14} /> {error}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-3/5 bg-deep p-10 lg:p-16 relative flex flex-col justify-center min-h-[500px]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary rounded-full -mr-40 -mt-40 blur-[120px] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent rounded-full -ml-40 -mb-40 blur-[120px] opacity-10"></div>

                        <div className="relative z-10 w-full">
                            {result ? (
                                <div className="space-y-6 animate-in fade-in zoom-in duration-500 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                                    <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-3xl font-black text-white mb-4 leading-tight">{result.title}</h3>
                                        <button
                                            onClick={() => handleReadSegment(result.title, 'title')}
                                            className={`p-3 rounded-full transition-all ${audioState.id === 'title' && audioState.playing ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                            disabled={audioState.loading && audioState.id === 'title'}
                                        >
                                            {audioState.loading && audioState.id === 'title' ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Volume2 size={20} className={audioState.id === 'title' && audioState.playing ? 'animate-pulse' : ''} />
                                            )}
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {result.content.split('\n\n').map((para, i) => (
                                            <div key={i} className="group relative">
                                                <p className="text-xl font-medium text-white/80 leading-relaxed italic pr-12">
                                                    {para.replace(/\[READING ASSISTANT TRIGGER\]/g, '✨')}
                                                </p>
                                                <button
                                                    onClick={() => handleReadSegment(para, `para-${i}`)}
                                                    className={`absolute top-0 right-0 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${audioState.id === `para-${i}` ? 'opacity-100' : ''} ${audioState.id === `para-${i}` && audioState.playing ? 'bg-primary text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                    disabled={audioState.loading && audioState.id === `para-${i}`}
                                                >
                                                    {audioState.loading && audioState.id === `para-${i}` ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Volume2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 border-t border-white/10 mt-8 space-y-4">
                                        <div className="flex flex-wrap gap-3">
                                            <PrintStudio
                                                mode="story_book"
                                                variant="home_print"
                                                data={{
                                                    title: result.title,
                                                    content: result.content,
                                                    childName: formData.childName
                                                }}
                                                className="flex-1"
                                            />
                                            <PrintStudio
                                                mode="story_book"
                                                variant="pod_kdp"
                                                data={{
                                                    title: result.title,
                                                    content: result.content,
                                                    childName: formData.childName
                                                }}
                                                label="KDP Ready"
                                                className="flex-1"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-primary font-black text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Sparkles size={16} /> Magical Snippet
                                            </p>
                                            <p className="text-white/40 text-sm">{upsell_note}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-8 opacity-20 py-12">
                                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center p-6 border-2 border-white/20">
                                        <BookOpen size={48} className="text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white text-2xl font-black">Waiting for Adventure...</p>
                                        <p className="text-white/60">{form.states.idle_message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,107,53,0.3);
                    border-radius: 10px;
                }
            `}</style>
        </section>
    );
}
