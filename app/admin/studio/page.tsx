"use client";

import { useState } from 'react';
import {
    AdminLayout, ActionButton, Tabs, EmptyState,
    Sparkles, Wand2, BookOpen, Music, Download, Video,
    ChevronRight, CheckCircle2, RefreshCw, Star, Info
} from '@/components/admin/AdminComponents';
import {
    runStoryAgent,
    runSongAgent,
    runPrintableAgent,
    runVideoAgent,
    runModuleManagerAgent,
    publishModuleToLive
} from '@/app/actions/agents';

type AgentType = 'manager' | 'story' | 'song' | 'printable' | 'video';

export default function LegendAIStudio() {
    const [activeAgent, setActiveAgent] = useState<AgentType>('manager');
    const [prompt, setPrompt] = useState('');
    const [ageGroup, setAgeGroup] = useState<'mini' | 'big'>('mini');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [publishedId, setPublishedId] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt && activeAgent === 'manager') return;
        setIsGenerating(true);
        setResult(null);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            let data;
            switch (activeAgent) {
                case 'manager':
                    data = await runModuleManagerAgent(session.access_token, prompt, ageGroup);
                    break;
                case 'story':
                    data = await runStoryAgent(session.access_token, { customPrompt: prompt, ageTrack: ageGroup });
                    break;
                case 'song':
                    data = await runSongAgent(session.access_token, { topic: prompt, ageTrack: ageGroup });
                    break;
                case 'printable':
                    data = await runPrintableAgent(session.access_token, { theme: prompt, ageTrack: ageGroup });
                    break;
                case 'video':
                    data = await runVideoAgent(session.access_token, { topic: prompt, ageTrack: ageGroup });
                    break;
            }
            setResult(data);
        } catch (error) {
            console.error("Generation failed", error);
            alert("Generation failed. Check console.");
        } finally {
            setIsGenerating(false);
            setPublishedId(null);
        }
    };

    const handlePublish = async () => {
        if (!result || isPublishing) return;
        setIsPublishing(true);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const res = await publishModuleToLive(session.access_token, result);
            if (res.success) {
                setPublishedId('module_published');
                alert("Island module is now LIVE in the Parent Portal!");
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            console.error("Publishing failed", error);
            alert("Publishing failed: " + (error as any).message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <AdminLayout activeSection="studio">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Sparkles className="text-orange-500" />
                            Legend AI Studio
                        </h1>
                        <p className="text-gray-500">Autonomous agents building the Likkle Legends universe</p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setAgeGroup('mini')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${ageGroup === 'mini' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}
                        >
                            MINI (3-5)
                        </button>
                        <button
                            onClick={() => setAgeGroup('big')}
                            className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${ageGroup === 'big' ? 'bg-primary text-white shadow-md' : 'text-gray-400'}`}
                        >
                            BIG (6-8)
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8 grid lg:grid-cols-12 gap-8">
                {/* Agent Selection & Input */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Select Agent Brain</h3>
                        <div className="space-y-3">
                            {[
                                { id: 'manager', label: 'Module Master', icon: Wand2, desc: 'Creates a full 4-part lesson' },
                                { id: 'story', label: 'Storyteller', icon: BookOpen, desc: 'Generates book content & art prompts' },
                                { id: 'song', label: 'Island Lyricist', icon: Music, desc: 'Writes catchy Caribbean rhymes' },
                                { id: 'printable', label: 'Activity Designer', icon: Download, desc: 'Builds worksheets & coloring ideas' },
                                { id: 'video', label: 'Scriptwriter', icon: Video, desc: 'Creates puppet & animation scripts' },
                            ].map((agent) => (
                                <button
                                    key={agent.id}
                                    onClick={() => setActiveAgent(agent.id as AgentType)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 ${activeAgent === agent.id ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-100 bg-gray-50/50'}`}
                                >
                                    <div className={`p-3 rounded-xl ${activeAgent === agent.id ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                                        <agent.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 leading-tight">{agent.label}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{agent.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-deep rounded-3xl p-8 text-white shadow-xl">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Star className="text-primary" size={18} />
                            Mission Brief
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeAgent === 'manager' ? "e.g. Why the sea is blue in Tobago..." : "Provide a theme or title..."}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-6"
                            rows={4}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (!prompt && activeAgent === 'manager')}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" />
                                    Agent is Thinking...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={20} />
                                    Deploy Agent
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div className="lg:col-span-8">
                    {!result && !isGenerating ? (
                        <div className="h-full min-h-[500px] bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                <Sparkles className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-300">Awaiting Deployment</h3>
                            <p className="text-gray-400 mt-2 max-w-xs">Select an agent and provide a mission to begin building digital assets.</p>
                        </div>
                    ) : isGenerating ? (
                        <div className="h-full min-h-[500px] bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12">
                            <div className="animate-pulse space-y-8">
                                <div className="h-12 bg-gray-100 rounded-2xl w-1/3" />
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-100 rounded-lg w-full" />
                                    <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
                                    <div className="h-4 bg-gray-100 rounded-lg w-4/6" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="h-32 bg-gray-100 rounded-3xl" />
                                    <div className="h-32 bg-gray-100 rounded-3xl" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {activeAgent === 'manager' && (
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-10 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-2 inline-block">
                                                Complete Module Generated
                                            </span>
                                            <h2 className="text-3xl font-black text-gray-900">{result.title}</h2>
                                            <p className="text-gray-500 font-medium">{result.island} • {result.metadata.educationalGoal}</p>
                                        </div>
                                        <button
                                            onClick={handlePublish}
                                            disabled={isPublishing || !!publishedId}
                                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${publishedId ? 'bg-green-500 text-white' : 'bg-deep text-white hover:bg-black active:scale-95'}`}
                                        >
                                            {isPublishing ? (
                                                <RefreshCw size={18} className="animate-spin" />
                                            ) : publishedId ? (
                                                <CheckCircle2 size={18} />
                                            ) : (
                                                <Star size={18} />
                                            )}
                                            {isPublishing ? 'Publishing...' : publishedId ? 'Island is Live!' : 'Publish to Live'}
                                        </button>
                                    </div>

                                    <div className="p-10 grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                                                <h4 className="font-black text-orange-900 mb-2 flex items-center gap-2">
                                                    <BookOpen size={18} /> Storybook
                                                </h4>
                                                <p className="text-sm text-orange-800 line-clamp-3">{result.content.story.summary}</p>
                                                <button className="mt-4 text-xs font-black text-orange-900 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                    View Preview <ChevronRight size={14} />
                                                </button>
                                            </div>

                                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                                <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                                                    <Music size={18} /> Song & Lyrics
                                                </h4>
                                                <p className="text-sm text-blue-800 line-clamp-3">{result.content.song.description}</p>
                                                <button className="mt-4 text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                    View Preview <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                                                <h4 className="font-black text-purple-900 mb-2 flex items-center gap-2">
                                                    <Download size={18} /> Printable Activity
                                                </h4>
                                                <p className="text-sm text-purple-800 line-clamp-3">{result.content.printable.description}</p>
                                                <button className="mt-4 text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                    View Preview <ChevronRight size={14} />
                                                </button>
                                            </div>

                                            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                                <h4 className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                                                    <Video size={18} /> Video Script
                                                </h4>
                                                <p className="text-sm text-emerald-800 line-clamp-3">{result.content.videoScript.description}</p>
                                                <button className="mt-4 text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                                    View Preview <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeAgent !== 'manager' && (
                                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-gray-900">{result.title}</h2>
                                        <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm">Save to Library</button>
                                    </div>
                                    <pre className="p-6 bg-gray-50 rounded-2xl text-xs overflow-auto max-h-[600px] font-mono">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
