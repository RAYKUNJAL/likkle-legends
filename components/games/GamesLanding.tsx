import Link from 'next/link';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { getPublicSiteUrl } from '@/lib/blog/site-url';
import {
    FEATURED_PUBLIC_GAMES,
    GAMES_LANDING_DESCRIPTION,
    GAMES_LANDING_TITLE,
    MORE_PUBLIC_GAMES,
} from '@/lib/public-games';

const PARENT_POINTS = [
    {
        title: 'Play first, account later',
        body: 'Reef Rescue, Block Carnival, and Island Quiz open in the browser. A child can start a round before anyone signs up.',
    },
    {
        title: 'Caribbean on purpose',
        body: 'Reefs, carnival patterns, market math, island foods, flags, and wildlife — the same world as the stories and songs.',
    },
    {
        title: 'A free trial for the rest',
        body: 'When you want saved progress, stories, songs, and the parent club, start a free trial or create a free account.',
    },
];

export default function GamesLanding() {
    const siteUrl = getPublicSiteUrl();
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${GAMES_LANDING_TITLE} | Likkle Legends`,
        description: GAMES_LANDING_DESCRIPTION,
        url: `${siteUrl}/games`,
        isPartOf: {
            '@type': 'WebSite',
            name: 'Likkle Legends',
            url: siteUrl,
        },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: FEATURED_PUBLIC_GAMES.map((game, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: game.title,
                url: `${siteUrl}${game.href}`,
            })),
        },
    };

    return (
        <div className="min-h-screen bg-[#fffcf6] text-[#0a2948]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <a
                href="#games"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-bold"
            >
                Skip to games
            </a>

            <header className="sticky top-0 z-40 border-b border-[#0a294814] bg-[#fffcf6f5] backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link href="/" className="font-black tracking-tight">
                        Likkle Legends
                        <span className="mt-0.5 block text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[#536a7d]">
                            likklelegends.com
                        </span>
                    </Link>
                    <nav aria-label="Games page" className="flex items-center gap-2 sm:gap-3">
                        <Link href="/login" className="hidden rounded-full border border-[#0a2948] px-4 py-2 text-sm font-extrabold sm:inline-flex">
                            Log in
                        </Link>
                        <Link
                            href="/free-trial"
                            className="inline-flex min-h-11 items-center rounded-full bg-[#f84c64] px-4 py-2 text-sm font-extrabold text-white"
                        >
                            Start a free trial
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#008b94]">For parents</p>
                        <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
                            Caribbean games kids can play today
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#38536f]">
                            Reef Rescue, Block Carnival, and Island Quiz are free to open on likklelegends.com.
                            Each one practices something real: ocean care, spatial patterns, or island foods, flags, and wildlife. Ages 3–9.
                        </p>
                        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            <Link
                                href="/free-trial"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f84c64] px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_#f84c6424]"
                            >
                                Start a free trial <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                            <Link
                                href="/signup"
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#c3a184] bg-white px-6 py-3 text-sm font-extrabold"
                            >
                                Create a free account
                            </Link>
                        </div>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#536a7d]">
                            These games open right away. A free trial saves progress and opens stories, songs, and the parent club.
                        </p>
                    </div>
                    <aside className="rounded-[28px] border border-[#d5e8e3] bg-[#f3faf8] p-6 sm:p-8">
                        <Gamepad2 className="text-[#008b94]" aria-hidden="true" />
                        <h2 className="mt-4 text-2xl font-black tracking-tight">A parent-friendly first stop</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#38536f]">
                            <li>Three featured games with stable links you can share.</li>
                            <li>More free games already on this site, from market math to doubles.</li>
                            <li>Trial and signup live here, so play screens stay focused on the game.</li>
                        </ul>
                    </aside>
                </section>

                <section id="games" className="bg-[#fff6e9] py-14 sm:py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="max-w-2xl">
                            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#008b94]">Free to play</p>
                            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Start with a free game</h2>
                            <p className="mt-3 text-[#536a7d]">
                                Pick one. Your child can play it on this site right away.
                            </p>
                        </div>
                        <div className="mt-8 grid gap-5 lg:grid-cols-3">
                            {FEATURED_PUBLIC_GAMES.map((game) => (
                                <article
                                    key={game.id}
                                    className="flex flex-col rounded-[24px] border border-[#e7dece] bg-white p-6 shadow-[0_8px_24px_#172a4208]"
                                >
                                    <div
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                                        style={{ backgroundColor: game.wash }}
                                        aria-hidden="true"
                                    >
                                        {game.emoji}
                                    </div>
                                    <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: game.ink }}>
                                        {game.ages}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight">{game.title}</h3>
                                    <p className="mt-3 flex-1 text-sm leading-relaxed text-[#536a7d]">{game.summary}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-[#38536f]">{game.parentNote}</p>
                                    <ul className="mt-4 flex flex-wrap gap-2">
                                        {game.skills.map((skill) => (
                                            <li key={skill} className="rounded-full bg-[#f3faf8] px-3 py-1 text-xs font-bold text-[#0a2948]">
                                                {skill}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={game.href}
                                        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0a2948] px-5 py-3 text-sm font-extrabold text-white"
                                    >
                                        Play {game.title} <ArrowRight size={16} aria-hidden="true" />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                    <h2 className="text-3xl font-black tracking-tight">How families use this page</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {PARENT_POINTS.map((point, index) => (
                            <article key={point.title} className="rounded-[24px] border border-[#e6e9e4] bg-white p-6">
                                <p className="text-sm font-black text-[#f84c64]">0{index + 1}</p>
                                <h3 className="mt-2 text-xl font-black">{point.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#536a7d]">{point.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-[#edf7f5] py-14 sm:py-16">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <h2 className="text-3xl font-black tracking-tight">More free games on this site</h2>
                        <p className="mt-3 max-w-2xl text-[#536a7d]">
                            The same Likkle Legends characters, already playable on likklelegends.com.
                        </p>
                        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                            {MORE_PUBLIC_GAMES.map((game) => (
                                <li key={game.id}>
                                    <Link
                                        href={game.href}
                                        className="flex h-full items-start gap-4 rounded-[24px] border border-[#dbe8e3] bg-white p-5 transition hover:-translate-y-0.5"
                                    >
                                        <span className="text-3xl" aria-hidden="true">{game.emoji}</span>
                                        <span>
                                            <span className="block font-black">{game.title}</span>
                                            <span className="mt-1 block text-sm leading-relaxed text-[#536a7d]">{game.summary}</span>
                                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-extrabold text-[#008b94]">
                                                Play free <ArrowRight size={14} aria-hidden="true" />
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="bg-[#fff0e7] px-4 py-16 text-center sm:px-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#008b94]">Keep the adventure going</p>
                    <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                        Stories, songs, and a parent club are a free trial away
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-[#536a7d]">
                        Start a free trial for your family, or create a free account and come back to these games anytime.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/free-trial"
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f84c64] px-6 py-3 text-sm font-extrabold text-white sm:w-auto"
                        >
                            Start a free trial <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                        <Link
                            href="/signup"
                            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#c3a184] bg-white px-6 py-3 text-sm font-extrabold sm:w-auto"
                        >
                            Create a free account
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[#e4e8e3] bg-[#fffdf8]">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-black">Likkle Legends</p>
                        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 font-bold text-[#536a7d]">
                            <Link href="/">Home</Link>
                            <Link href="/characters">Characters</Link>
                            <Link href="/safety">Child safety</Link>
                            <Link href="/privacy">Privacy</Link>
                            <Link href="/contact">Contact</Link>
                        </nav>
                    </div>
                    <p className="text-[#536a7d]">© {new Date().getFullYear()} Likkle Legends · likklelegends.com</p>
                </div>
            </footer>
        </div>
    );
}
