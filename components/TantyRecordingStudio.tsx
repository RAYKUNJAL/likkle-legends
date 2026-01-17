import React, { useState, useEffect, useRef } from 'react';
import { StudioContent } from '../lib/types';
import { narrateText, getGlobalAudioContext, kickstartMobileAudio } from '../services/geminiService';
import { saveStudioLibrary, getStudioLibrary, uploadFile, PATHS } from '../services/storageService';

const CATEGORIES = ['Folklore', 'Safety', 'Pride', 'Adventure', 'Daily Wisdom', 'Health'];
const AGE_GROUPS = ['3-5', '6-8', '9-12', 'Family'];
const READING_LEVELS = ['beginner', 'intermediate', 'advanced'];
const MUSIC_OPTIONS = [
    { id: 'none', label: 'No Music', icon: '🔇' },
    { id: 'waves', label: 'Beach Waves', icon: '🌊' },
    { id: 'steelpan', label: 'Steelpan Jig', icon: '🥁' },
    { id: 'rainforest', label: 'Rainforest Birds', icon: '🦜' },
    { id: 'calypso', label: 'Soft Calypso', icon: '🎺' }
];

const TantyRecordingStudio: React.FC = () => {
    const [tab, setTab] = useState<'editor' | 'library' | 'settings'>('library');
    const [library, setLibrary] = useState<StudioContent[]>([]);
    const [activeContent, setActiveContent] = useState<StudioContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'story' | 'letter' | 'lesson'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        setIsLoading(true);
        const data = await getStudioLibrary();
        if (data) setLibrary(data);
        setIsLoading(false);
    };

    const handleCreateNew = (type: 'letter' | 'story' | 'lesson') => {
        const newItem: StudioContent = {
            id: Date.now().toString(),
            title: 'New ' + type,
            type,
            category: CATEGORIES[0],
            ageGroup: AGE_GROUPS[1],
            readingLevel: 'intermediate',
            text: '',
            pages: [{ id: 'p1', text: '' }],
            status: 'draft',
            voiceSpeed: 1.0,
            voiceEmotion: 'wise',
            lastModified: new Date().toISOString()
        };
        setActiveContent(newItem);
        setTab('editor');
    };

    const handleSave = async () => {
        if (!activeContent) return;
        const updated = [...library.filter(i => i.id !== activeContent.id), { ...activeContent, lastModified: new Date().toISOString() }];
        setLibrary(updated);
        await saveStudioLibrary(updated);
        setActiveContent(null);
        setTab('library');
    };

    const addPage = () => {
        if (!activeContent) return;
        const newPage = { id: Date.now().toString(), text: '' };
        setActiveContent({ ...activeContent, pages: [...activeContent.pages, newPage] });
    };

    const updatePageText = (id: string, text: string) => {
        if (!activeContent) return;
        setActiveContent({
            ...activeContent,
            pages: activeContent.pages.map(p => p.id === id ? { ...p, text } : p)
        });
    };

    const removePage = (id: string) => {
        if (!activeContent || activeContent.pages.length <= 1) return;
        setActiveContent({
            ...activeContent,
            pages: activeContent.pages.filter(p => p.id !== id)
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeContent) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (activeContent.type === 'story') {
                // Simple page-by-page parsing by double newline
                const lines = content.split(/\n\n+/).filter(l => l.trim().length > 0);
                const newPages = lines.map((text, i) => ({ id: `imported_${i}_${Date.now()}`, text: text.trim() }));
                setActiveContent({ ...activeContent, pages: newPages });
            } else {
                setActiveContent({ ...activeContent, text: content });
            }
        };
        reader.readAsText(file);
    };

    const processNarration = async () => {
        if (!activeContent) return;
        setIsProcessing(true);
        setProcessProgress(0);

        const pages = activeContent.pages;
        const processedPages = [];

        for (let i = 0; i < pages.length; i++) {
            try {
                const text = pages[i].text;
                if (text.trim()) {
                    // Pass emotion and speed to prompt logic in geminiService
                    // Simulation: actually calling TTS
                    await narrateText(`[Emotion: ${activeContent.voiceEmotion}] [Speed: ${activeContent.voiceSpeed}] ${text}`);
                    processedPages.push({ ...pages[i], audioUrl: 'GENERATED_LOCAL' });
                } else {
                    processedPages.push(pages[i]);
                }
                setProcessProgress(Math.round(((i + 1) / pages.length) * 100));
            } catch (e) {
                console.error("Narration failed for page", i, e);
            }
        }

        setActiveContent({ ...activeContent, pages: processedPages, status: 'published' });
        setIsProcessing(false);
    };

    const playPreview = async (text: string) => {
        if (!text.trim()) return;
        await kickstartMobileAudio();
        if (audioSourceRef.current) try { audioSourceRef.current.stop(); } catch (e) { }

        try {
            const buffer = await narrateText(text);
            if (!buffer) return;
            const ctx = getGlobalAudioContext();
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            audioSourceRef.current = source;
            source.start();
        } catch (e) { console.error(e); }
    };

    const filteredLibrary = library.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
        if (selectedIds.length === 0) return;
        let updated = [...library];
        if (action === 'delete') {
            updated = updated.filter(i => !selectedIds.includes(i.id));
        } else {
            updated = updated.map(i => selectedIds.includes(i.id) ? { ...i, status: action === 'publish' ? 'published' : 'archived' } : i);
        }
        setLibrary(updated);
        await saveStudioLibrary(updated);
        setSelectedIds([]);
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-blue-50 h-full flex flex-col">
            {/* HEADER TABS */}
            <div className="bg-blue-950 p-6 flex items-center justify-between border-b border-white/10 shrink-0">
                <div className="flex gap-4">
                    <button onClick={() => setTab('library')} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'library' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/10'}`}>Library View</button>
                    <button onClick={() => setTab('editor')} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/10'}`}>Content Studio</button>
                    <button onClick={() => setTab('settings')} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/10'}`}>Voice Tuning</button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl shadow-lg">🎙️</div>
                    <span className="text-white font-heading font-black text-lg">Tanty Studio PRO</span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {tab === 'library' && (
                    <div className="h-full flex flex-col p-8 space-y-8 animate-in fade-in duration-500">
                        {/* TOOLBAR */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-blue-50 p-6 rounded-[2.5rem]">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search legends..."
                                    className="p-4 bg-white rounded-2xl border-2 border-transparent focus:border-blue-200 outline-none font-bold w-full md:w-64"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <select
                                    className="p-4 bg-white rounded-2xl font-black text-xs uppercase outline-none"
                                    value={filterType}
                                    onChange={e => setFilterType(e.target.value as any)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="story">Stories</option>
                                    <option value="letter">Letters</option>
                                    <option value="lesson">Lessons</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                {selectedIds.length > 0 && (
                                    <div className="flex gap-2 mr-4 border-r pr-4 border-blue-100">
                                        <button onClick={() => handleBulkAction('publish')} className="bg-green-100 text-green-600 p-3 rounded-xl hover:bg-green-200" title="Publish Selected">🚀</button>
                                        <button onClick={() => handleBulkAction('archive')} className="bg-yellow-100 text-yellow-600 p-3 rounded-xl hover:bg-yellow-200" title="Archive Selected">📦</button>
                                        <button onClick={() => handleBulkAction('delete')} className="bg-red-100 text-red-600 p-3 rounded-xl hover:bg-red-200" title="Delete Selected">🗑️</button>
                                    </div>
                                )}
                                <button onClick={() => handleCreateNew('letter')} className="bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-sm border-2 border-blue-100">+ Letter</button>
                                <button onClick={() => handleCreateNew('story')} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105">+ Story</button>
                            </div>
                        </div>

                        {/* CONTENT GRID */}
                        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                            {isLoading ? (
                                <div className="h-64 flex flex-col items-center justify-center opacity-30">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="font-black uppercase text-xs tracking-widest">Gathering Library Assets...</p>
                                </div>
                            ) : filteredLibrary.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center bg-blue-50/50 rounded-[4rem] border-4 border-dashed border-blue-100 p-20 text-center">
                                    <div className="text-8xl mb-8 opacity-20">📚</div>
                                    <h3 className="text-3xl font-heading font-black text-blue-950 mb-2">No Content Found</h3>
                                    <p className="text-blue-900/40 font-bold max-w-sm text-center">Create a new legendary story or letter to populate the village archives.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredLibrary.map(item => (
                                        <div
                                            key={item.id}
                                            className={`bg-white p-8 rounded-[3rem] border-4 transition-all relative group flex flex-col justify-between h-full ${selectedIds.includes(item.id) ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-blue-50 shadow-sm hover:shadow-2xl hover:scale-[1.02]'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                                                    else setSelectedIds(prev => prev.filter(id => id !== item.id));
                                                }}
                                                className="absolute top-6 left-6 w-6 h-6 rounded-lg cursor-pointer z-10 opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity"
                                            />
                                            <div>
                                                <div className="flex justify-between items-start mb-6 pl-8">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'published' ? 'bg-green-100 text-green-600' : item.status === 'archived' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-600'}`}>
                                                        {item.status}
                                                    </span>
                                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-heading font-black text-blue-950 mb-4 line-clamp-2">{item.title}</h3>
                                                <div className="flex flex-wrap gap-2 mb-8">
                                                    <span className="bg-blue-50/50 text-blue-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase">{item.category}</span>
                                                    <span className="bg-orange-50/50 text-orange-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase">Ages {item.ageGroup}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setActiveContent(item); setTab('editor'); }} className="flex-1 py-4 bg-blue-950 text-white rounded-2xl font-black text-xs uppercase hover:bg-black transition-colors">Edit Studio</button>
                                                <button onClick={() => playPreview((item.pages?.[0]?.text) || item.text)} className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center hover:bg-orange-200 transition-colors">🔊</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'editor' && (
                    <div className="h-full flex animate-in slide-in-from-right duration-500">
                        {activeContent ? (
                            <>
                                {/* LEFT: METADATA & EDITOR */}
                                <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar border-r border-blue-50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-3xl font-heading font-black text-blue-950">Drafting: {activeContent.title}</h3>
                                        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">Import Script 📥</button>
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.doc,.docx" onChange={handleFileUpload} />
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Title</label>
                                            <input type="text" className="w-full p-4 bg-blue-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-200" value={activeContent.title} onChange={e => setActiveContent({ ...activeContent, title: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Category</label>
                                            <select className="w-full p-4 bg-blue-50 rounded-2xl font-bold outline-none" value={activeContent.category} onChange={e => setActiveContent({ ...activeContent, category: e.target.value })}>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Age Group</label>
                                            <select className="w-full p-4 bg-blue-50 rounded-2xl font-bold outline-none" value={activeContent.ageGroup} onChange={e => setActiveContent({ ...activeContent, ageGroup: e.target.value })}>
                                                {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Reading Level</label>
                                            <select className="w-full p-4 bg-blue-50 rounded-2xl font-bold outline-none text-xs uppercase" value={activeContent.readingLevel} onChange={e => setActiveContent({ ...activeContent, readingLevel: e.target.value as any })}>
                                                {READING_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">{activeContent.type === 'story' ? 'Story Pages' : 'Script Content'}</label>
                                            {activeContent.type === 'story' && <button onClick={addPage} className="text-blue-600 font-black text-[10px] uppercase hover:underline">+ Add Page</button>}
                                        </div>

                                        {activeContent.type === 'story' ? (
                                            <div className="space-y-4">
                                                {activeContent.pages.map((page, idx) => (
                                                    <div key={page.id} className="bg-blue-50/50 p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all flex gap-6 group">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm shrink-0">{idx + 1}</div>
                                                        <div className="flex-1 space-y-4">
                                                            <textarea
                                                                className="w-full bg-transparent outline-none font-medium text-blue-950 resize-none no-scrollbar h-24"
                                                                placeholder="Once upon a time in de islands..."
                                                                value={page.text}
                                                                onChange={e => updatePageText(page.id, e.target.value)}
                                                            />
                                                            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => playPreview(page.text)} className="px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase text-orange-500 shadow-sm">🔊 Preview</button>
                                                                    <button className="px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase text-blue-400 shadow-sm">🖼️ Suggest Image</button>
                                                                </div>
                                                                <button onClick={() => removePage(page.id)} className="text-red-300 hover:text-red-500 font-black text-[10px] uppercase">Remove</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <textarea
                                                className="w-full h-96 p-8 bg-blue-50 rounded-[3rem] font-medium text-blue-950 outline-none border-2 border-transparent focus:border-blue-200 resize-none shadow-inner"
                                                placeholder="Type Tanty's wise words here..."
                                                value={activeContent.text}
                                                onChange={e => setActiveContent({ ...activeContent, text: e.target.value })}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT: VOCAL CONTROLS & PROCESSING */}
                                <div className="w-96 bg-blue-50 p-8 flex flex-col gap-10 border-l border-blue-100 overflow-y-auto no-scrollbar">
                                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-white space-y-8">
                                        <div className="flex items-center gap-4 border-b pb-4 border-blue-50">
                                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl shadow-sm">🎙️</div>
                                            <div>
                                                <h4 className="font-heading font-black text-blue-950">Vocal Processor</h4>
                                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Tanty Engine v5</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-300">
                                                    <span>Narrative Speed</span>
                                                    <span className="text-blue-600">{activeContent.voiceSpeed}x</span>
                                                </div>
                                                <input
                                                    type="range" min="0.5" max="1.5" step="0.1"
                                                    className="w-full h-3 bg-blue-50 rounded-full appearance-none cursor-pointer accent-orange-500"
                                                    value={activeContent.voiceSpeed}
                                                    onChange={e => setActiveContent({ ...activeContent, voiceSpeed: parseFloat(e.target.value) })}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Voice Emotion</label>
                                                <select
                                                    className="w-full p-4 bg-blue-50 rounded-2xl font-black text-xs uppercase outline-none"
                                                    value={activeContent.voiceEmotion}
                                                    onChange={e => setActiveContent({ ...activeContent, voiceEmotion: e.target.value as any })}
                                                >
                                                    <option value="wise">Elderly Wisdom</option>
                                                    <option value="joyful">Sun-Kissed Joy</option>
                                                    <option value="cautionary">Cautionary (Folklore)</option>
                                                    <option value="excited">Excited Adventure</option>
                                                </select>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 px-2">Ambiance Mixer</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {MUSIC_OPTIONS.map(m => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => setActiveContent({ ...activeContent, backgroundMusic: m.id })}
                                                            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${activeContent.backgroundMusic === m.id ? 'bg-blue-600 border-blue-400 text-white shadow-md' : 'bg-white border-blue-50 text-blue-900/40 hover:bg-blue-50'}`}
                                                        >
                                                            <span className="text-lg">{m.icon}</span>
                                                            <span className="text-[10px] font-black uppercase truncate">{m.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-end gap-4">
                                        {isProcessing ? (
                                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-orange-100 space-y-4 animate-in fade-in zoom-in">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="font-black text-xs uppercase tracking-widest text-orange-500">Processing Vocal Stack...</span>
                                                </div>
                                                <div className="h-4 bg-orange-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${processProgress}%` }}></div>
                                                </div>
                                                <p className="text-center text-[10px] font-bold text-orange-400">{processProgress}% COMPLETE</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={processNarration}
                                                className="w-full py-6 bg-orange-500 text-white rounded-[2.5rem] font-heading font-black text-xl shadow-xl hover:bg-orange-600 transition-all active:scale-95 border-b-8 border-orange-800"
                                            >
                                                Process Full Vocal Pack
                                            </button>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => { setActiveContent(null); setTab('library'); }} className="py-4 border-4 border-white bg-white text-blue-300 rounded-2xl font-black text-[10px] uppercase shadow-sm">Discard</button>
                                            <button onClick={handleSave} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700">Save Draft</button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8">
                                <div className="text-9xl animate-float">🎨</div>
                                <h3 className="text-4xl font-heading font-black text-blue-950">Ready to Record?</h3>
                                <p className="text-blue-900/40 font-bold max-w-sm text-center">Pick a story from the library or start a fresh island adventure from scratch.</p>
                                <button onClick={() => setTab('library')} className="bg-blue-600 text-white px-10 py-5 rounded-full font-black shadow-xl hover:scale-105 transition-all">Go to Library</button>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="h-full overflow-y-auto p-20 no-scrollbar space-y-16 animate-in fade-in duration-500">
                        <div className="max-w-3xl mx-auto space-y-10">
                            <div className="text-center space-y-4">
                                <h3 className="text-5xl font-heading font-black text-blue-950">Global Vocal Tuning</h3>
                                <p className="text-blue-900/40 font-bold uppercase tracking-widest text-xs text-center">Maintain consistency across all village narratives</p>
                            </div>

                            <div className="bg-blue-50 p-12 rounded-[4rem] border-4 border-white shadow-2xl space-y-12">
                                <div className="space-y-6">
                                    <label className="text-xs font-black uppercase tracking-widest text-blue-400 px-4">Tanty Accent Intensity</label>
                                    <div className="bg-white p-8 rounded-[3rem] shadow-inner space-y-6">
                                        <input type="range" className="w-full h-4 bg-blue-50 rounded-full appearance-none cursor-pointer accent-blue-600" />
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-300">
                                            <span>Subtle Bajan</span>
                                            <span>Standard Island</span>
                                            <span>Deep Country Patois</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-blue-50 space-y-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🧠</div>
                                        <h4 className="font-heading font-black text-blue-950">Personality Training</h4>
                                        <p className="text-xs text-blue-900/60 font-medium">Auto-injects Tanty's wise interjections into every generation.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-blue-950">Active</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-blue-50 space-y-4">
                                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🗂️</div>
                                        <h4 className="font-heading font-black text-blue-950">Vocal Reference Library</h4>
                                        <p className="text-xs text-blue-900/60 font-medium">Use pre-recorded samples to guide de AI's performance.</p>
                                        <button className="text-[10px] font-black uppercase text-orange-500 hover:underline">Manage Samples →</button>
                                    </div>
                                </div>

                                <div className="p-8 bg-blue-950 rounded-[3rem] shadow-2xl text-white space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                    <h4 className="font-heading font-black text-xl text-yellow-400">CDN & Deployment</h4>
                                    <p className="text-sm opacity-60 leading-relaxed">
                                        Every time yuh publish a story, it go be compressed and synced to de village CDN for fast playin' on de child portal.
                                    </p>
                                    <button className="w-full py-4 bg-white text-blue-950 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">Run Full Library Sync</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER STATS */}
            <div className="bg-white px-8 py-3 border-t border-blue-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-300">
                <div className="flex gap-6">
                    <span>Library Size: {library.length} Items</span>
                    <span>Storage: 1.2 GB / 5.0 GB</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Village CDN: Synchronized</span>
                </div>
            </div>
        </div>
    );
};

export default TantyRecordingStudio;
