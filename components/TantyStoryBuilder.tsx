'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, BookOpen, Heart, MapPin } from 'lucide-react';
import { useUser } from '@/components/UserContext';

const ISLANDS = [
    { id: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹' },
    { id: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { id: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { id: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { id: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
    { id: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { id: 'GD', name: 'Grenada', flag: '🇬🇩' },
];

const THEMES = [
    'sharing and generosity',
    'being brave',
    'kindness to animals',
    'respecting nature',
    'friendship',
    'celebrating culture',
    'trying something new',
    'helping others',
];

const CHARACTERS = [
    { id: 'tanty_spice', name: 'Tanty Spice', emoji: '👵', desc: 'Warm grandmother storyteller' },
    { id: 'dilly_doubles', name: 'Dilly Doubles', emoji: '🥘', desc: 'Fun street food hero' },
    { id: 'roti', name: 'R.O.T.I.', emoji: '🤖', desc: 'Teaching robot' },
    { id: 'steelpan_sam', name: 'Steelpan Sam', emoji: '🎵', desc: 'Music-loving boy' },
    { id: 'mango_moko', name: 'Mango Moko', emoji: '🥭', desc: 'Garden grower' },
    { id: 'scorcha_pepper', name: 'Scorcha Pepper', emoji: '🌶️', desc: 'Passionate and brave' },
];

export default function TantyStoryBuilder() {
    const router = useRouter();
    const { activeChild } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState('');
    const [character, setCharacter] = useState('tanty_spice');
    const [island, setIsland] = useState(activeChild?.primary_island?.substring(0, 2).toUpperCase() || 'TT');

    const childName = activeChild?.first_name || 'Little Legend';
    const childAge = activeChild?.age || 5;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/tanty/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childName,
                    childAge,
                    island,
                    theme: theme || undefined,
                    character,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Tanty is resting her voice. Try again.');
            }

            // Store story in sessionStorage for the reader
            sessionStorage.setItem('current_story_draft', JSON.stringify({
                title: data.story.title,
                summary: data.story.summary,
                pages: data.story.pages,
                lesson: data.story.lesson,
                narrator: data.story.narrator,
                character: data.story.character,
                generated: true,
            }));

            router.push('/portal/stories/dynamic/session');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="text-7xl animate-bounce">👵📖</div>
                    <div>
                        <p className="text-2xl font-black text-deep">Tanty Spice is telling a story...</p>
                        <p className="text-deep/50 font-bold mt-2">Sit tight, {childName}! She's weaving a tale just for you.</p>
                    </div>
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Tanty Spice Header */}
            <div className="text-center space-y-3">
                <div className="text-6xl">👵✨</div>
                <h1 className="text-3xl md:text-4xl font-black text-deep italic">Tanty Spice Story Time</h1>
                <p className="text-deep/50 font-bold">
                    Tell Tanty what kind of story you want, and she'll spin a Caribbean tale just for {childName}!
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                    <p className="text-red-600 font-bold">{error}</p>
                </div>
            )}

            {/* Character Selection */}
            <div className="space-y-3">
                <label className="text-sm font-black text-deep uppercase tracking-widest">Who should star in the story?</label>
                <div className="grid grid-cols-3 gap-3">
                    {CHARACTERS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCharacter(c.id)}
                            className={`p-4 rounded-2xl border-2 text-center transition-all ${
                                character === c.id
                                    ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                                    : 'border-zinc-100 bg-white hover:border-zinc-200'
                            }`}
                        >
                            <div className="text-3xl mb-1">{c.emoji}</div>
                            <div className="text-xs font-black text-deep">{c.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Island Selection */}
            <div className="space-y-3">
                <label className="text-sm font-black text-deep uppercase tracking-widest">
                    <MapPin className="inline w-4 h-4 mr-1" />Which island?
                </label>
                <div className="flex flex-wrap gap-2">
                    {ISLANDS.map((i) => (
                        <button
                            key={i.id}
                            onClick={() => setIsland(i.id)}
                            className={`px-4 py-2 rounded-full border-2 font-bold text-sm transition-all ${
                                island === i.id
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-zinc-200 bg-white text-deep/60 hover:border-zinc-300'
                            }`}
                        >
                            {i.flag} {i.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3">
                <label className="text-sm font-black text-deep uppercase tracking-widest">
                    <Heart className="inline w-4 h-4 mr-1" />What should the story teach?
                </label>
                <div className="flex flex-wrap gap-2">
                    {THEMES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(theme === t ? '' : t)}
                            className={`px-4 py-2 rounded-full border-2 font-bold text-sm capitalize transition-all ${
                                theme === t
                                    ? 'border-accent bg-accent text-white'
                                    : 'border-zinc-200 bg-white text-deep/60 hover:border-zinc-300'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-deep/40 font-bold">Leave unselected for a surprise!</p>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
                <Sparkles size={24} />
                Tell Me a Story, Tanty!
            </button>

            {/* Browse Library Link */}
            <div className="text-center">
                <button
                    onClick={() => router.push('/portal/stories')}
                    className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                    <BookOpen size={18} />
                    Browse Story Library
                </button>
            </div>
        </div>
    );
}
