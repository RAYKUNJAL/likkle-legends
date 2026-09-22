'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import {
    BUILD_CHARACTERS,
    BUILD_ISLANDS,
    BUILD_THEMES,
} from '@/lib/build-your-story';
import {
    generateBuildYourStoryAction,
    illustrateStoryPageAction,
    saveBuildYourStoryAction,
    type BuiltStory,
} from '@/app/actions/build-your-story';

type Step = 'name' | 'choices' | 'story';
type PictureState = 'waiting' | 'cooking' | 'ready' | 'unavailable';

export default function BuildYourStoryWizard({ backHref = '/portal/stories' }: { backHref?: string }) {
    const { activeChild, user } = useUser();
    const [step, setStep] = useState<Step>('name');
    const [childName, setChildName] = useState(activeChild?.first_name || '');
    const [island, setIsland] = useState(BUILD_ISLANDS.find((item) => item.id === activeChild?.primary_island)?.id || 'TT');
    const [theme, setTheme] = useState('kindness');
    const [character, setCharacter] = useState('tanty_spice');
    const [story, setStory] = useState<BuiltStory | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pictures, setPictures] = useState<PictureState[]>([]);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState('');
    const [savedId, setSavedId] = useState<string | null>(null);

    const startIllustrations = async (draft: BuiltStory) => {
        const states: PictureState[] = draft.pages.map(() => 'cooking');
        setPictures(states);
        let blocked = false;
        for (let index = 0; index < draft.pages.length; index++) {
            if (blocked) {
                states[index] = 'unavailable';
                setPictures([...states]);
                continue;
            }
            const result = await illustrateStoryPageAction(draft.pages[index].illustration);
            if (result.status === 'ready' && result.imageUrl) {
                states[index] = 'ready';
                setStory((current) => {
                    if (!current) return current;
                    const pages = current.pages.map((page, pageNumber) =>
                        pageNumber === index ? { ...page, imageUrl: result.imageUrl } : page
                    );
                    return { ...current, pages };
                });
            } else {
                states[index] = 'unavailable';
                if (result.status === 'missing_key') blocked = true;
            }
            setPictures([...states]);
        }
    };

    const createStory = async () => {
        setBusy(true);
        setNotice('');
        setSavedId(null);
        try {
            const result = await generateBuildYourStoryAction({
                childName,
                island,
                theme,
                character,
                childAge: activeChild?.age || 6,
            });
            if (!result.success || !result.story) {
                setNotice(result.error || 'No story was written.');
                return;
            }
            setStory(result.story);
            setPageIndex(0);
            setPictures(result.story.pages.map(() => 'waiting'));
            setStep('story');
            void startIllustrations(result.story);
        } finally {
            setBusy(false);
        }
    };

    const saveStory = async () => {
        if (!story) return;
        setBusy(true);
        setNotice('');
        try {
            const result = await saveBuildYourStoryAction(story);
            if (!result.success) {
                setNotice(result.error || 'The story was not saved.');
                return;
            }
            setSavedId(result.id || 'saved');
            setNotice('Saved on your shelf.');
        } finally {
            setBusy(false);
        }
    };

    const page = story?.pages[pageIndex];
    const picture = pictures[pageIndex] || 'waiting';

    return (
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 md:px-8 md:py-10">
            <div className="max-w-3xl mx-auto space-y-6">
                <header className="flex items-center justify-between gap-3">
                    <Link href={backHref} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-deep/50" aria-label="Back">
                        <ArrowLeft size={22} />
                    </Link>
                    <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-sm">
                        <Sparkles className="text-purple-500" size={18} />
                        <span className="font-black text-deep uppercase tracking-widest text-xs sm:text-sm">Build Your Story</span>
                    </div>
                    <div className="w-12" />
                </header>

                {step === 'name' && (
                    <section className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-5xl font-black text-deep">Who is this story for?</h1>
                            <p className="text-deep/60 font-bold">We use the first name inside an original island adventure. We do not invent a folktale.</p>
                        </div>
                        <label className="block space-y-2">
                            <span className="text-xs font-black uppercase tracking-widest text-deep/40">Child&apos;s first name</span>
                            <input
                                value={childName}
                                onChange={(event) => setChildName(event.target.value)}
                                placeholder="Amina"
                                autoComplete="given-name"
                                className="w-full rounded-2xl border-2 border-zinc-200 px-5 py-4 text-2xl font-black text-deep focus:border-primary focus:outline-none"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={() => setStep('choices')}
                            disabled={childName.trim().length < 2}
                            className="w-full rounded-full bg-primary text-white py-4 font-black text-lg disabled:opacity-40"
                        >
                            Next
                        </button>
                    </section>
                )}

                {step === 'choices' && (
                    <section className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl sm:text-5xl font-black text-deep">Pick the adventure</h1>
                            <p className="text-deep/50 font-bold">Island, theme, and a Likkle Legend. {childName.trim() || 'Your child'} stays in the story.</p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="font-black text-deep">Island</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {BUILD_ISLANDS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setIsland(item.id)}
                                        className={`rounded-2xl bg-white p-4 text-left shadow-sm border-4 ${island === item.id ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <span className="text-3xl">{item.flag}</span>
                                        <span className="block mt-2 text-sm font-black text-deep">{item.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="font-black text-deep">Theme</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {BUILD_THEMES.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setTheme(item.id)}
                                        className={`rounded-2xl bg-white p-4 text-left shadow-sm border-4 ${theme === item.id ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <span className="block font-black text-deep">{item.name}</span>
                                        <span className="block text-sm text-deep/50 font-bold">{item.detail}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="font-black text-deep">Character</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {BUILD_CHARACTERS.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCharacter(item.id)}
                                        className={`rounded-2xl bg-white p-4 text-left shadow-sm border-4 ${character === item.id ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <span className="block font-black text-deep">{item.name}</span>
                                        <span className="block text-sm text-deep/50 font-bold">{item.detail}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {notice && <p className="rounded-2xl bg-amber-50 text-amber-900 font-bold p-4" role="status">{notice}</p>}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button type="button" onClick={() => setStep('name')} className="rounded-full bg-white px-6 py-4 font-black text-deep">Back</button>
                            <button
                                type="button"
                                onClick={() => void createStory()}
                                disabled={busy}
                                className="flex-1 rounded-full bg-primary text-white py-4 font-black text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {busy ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                Write the story
                            </button>
                        </div>
                    </section>
                )}

                {step === 'story' && story && page && (
                    <section className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
                        <div className="p-5 sm:p-8 space-y-2 border-b border-zinc-100">
                            <p className="text-xs font-black uppercase tracking-widest text-primary">Original story for {story.childName}</p>
                            <h1 className="text-2xl sm:text-4xl font-black text-deep">{story.title}</h1>
                            <p className="text-deep/60 font-bold">{story.summary}</p>
                        </div>
                        <div className="aspect-video bg-gradient-to-br from-sky-100 via-amber-50 to-pink-100 flex items-center justify-center p-6">
                            {picture === 'ready' && page.imageUrl ? (
                                <img src={page.imageUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center space-y-2 max-w-sm">
                                    <BookOpen className="mx-auto text-primary" />
                                    <p className="font-black text-deep">
                                        {picture === 'cooking' || picture === 'waiting' ? 'Pictures are cooking' : 'No picture yet'}
                                    </p>
                                    <p className="text-sm font-bold text-deep/50">
                                        {picture === 'unavailable'
                                            ? 'The art key is not set, so this page stays words. The story is still yours to read.'
                                            : 'The words are ready. Art appears here when it is actually ready.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-5 sm:p-8 space-y-6">
                            <p className="text-xs font-black uppercase tracking-widest text-deep/40">Page {pageIndex + 1} of {story.pages.length}</p>
                            <p className="text-xl sm:text-2xl font-bold text-deep leading-relaxed">{page.text}</p>
                            <div className="flex items-center justify-between gap-3">
                                <button type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={pageIndex === 0} className="rounded-full bg-zinc-100 px-5 py-3 font-black disabled:opacity-30">Back</button>
                                <button type="button" onClick={() => setPageIndex((value) => Math.min(story.pages.length - 1, value + 1))} disabled={pageIndex === story.pages.length - 1} className="rounded-full bg-primary text-white px-5 py-3 font-black disabled:opacity-30">Next</button>
                            </div>
                            {story.lesson && <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-900">{story.lesson}</p>}
                            {notice && <p className="rounded-2xl bg-sky-50 text-sky-900 font-bold p-4" role="status">{notice}</p>}
                            <button
                                type="button"
                                onClick={() => void saveStory()}
                                disabled={busy || Boolean(savedId)}
                                className="w-full rounded-full bg-deep text-white py-4 font-black disabled:opacity-50"
                            >
                                {savedId ? 'Saved to your shelf' : user ? 'Save to my shelf' : 'Sign in to save'}
                            </button>
                            {!user && (
                                <Link href={`/login?redirect=/library/build-your-story`} className="block text-center font-black text-primary">
                                    Sign in to keep this story
                                </Link>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
