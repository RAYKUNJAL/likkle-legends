import Link from 'next/link';
import { formatUsd } from '@/lib/paypal-offers';
import {
    CUSTOM_SONG_PRICE,
    MUSIC_DOWNLOAD_BUNDLE_CREDITS,
    MUSIC_DOWNLOAD_BUNDLE_PRICE,
    MUSIC_DOWNLOAD_PRICE,
} from '@/lib/music-store';

export default function MusicStoreUpsell() {
    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Music Store</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Listen free · Download ${formatUsd(MUSIC_DOWNLOAD_PRICE)}</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
                Every account can play the songs we host. A parent can buy a permanent download license for one track, or commission a custom Caribbean kids song. Playback stays free. A download or a custom order is added only after PayPal verifies the payment.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-medium text-slate-700">
                <li>Listen free on free, trial, and paid accounts</li>
                <li>Download license ${formatUsd(MUSIC_DOWNLOAD_PRICE)} per track, kept on the parent account</li>
                <li>Optional {MUSIC_DOWNLOAD_BUNDLE_CREDITS} download licenses for ${formatUsd(MUSIC_DOWNLOAD_BUNDLE_PRICE)}</li>
                <li>Custom song ${formatUsd(CUSTOM_SONG_PRICE)} — Caribbean kids style. The team delivers the audio later.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/parent/music" className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
                    Open Music Store
                </Link>
                <Link href="/parent/music/custom" className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-900">
                    Order a custom song
                </Link>
            </div>
        </section>
    );
}
