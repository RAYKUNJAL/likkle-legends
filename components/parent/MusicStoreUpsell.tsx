import Link from 'next/link';
import { formatUsd } from '@/lib/paypal-offers';
import { CUSTOM_SONG_PRICE, MUSIC_DOWNLOAD_PRICE } from '@/lib/music-store';

export default function MusicStoreUpsell() {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Music</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Hear the songs first</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
                Original kids Caribbean songs stream free on every account. A download license is ${formatUsd(MUSIC_DOWNLOAD_PRICE)} if a parent wants a copy. A custom birthday or event song is ${formatUsd(CUSTOM_SONG_PRICE)} and stays on the parent account.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-medium text-slate-700">
                <li>Listening stays free</li>
                <li>A download is optional, after a song has played</li>
                <li>Custom songs are requested by a parent and delivered by the team</li>
            </ul>
            <Link href="/parent/music" className="mt-6 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
                Listen in the Music Store
            </Link>
            <p className="mt-4 text-sm text-slate-500">
                <Link href="/parent/music/custom" className="font-bold text-slate-700 underline">Birthday / event song for your likkle one</Link>
            </p>
        </section>
    );
}
