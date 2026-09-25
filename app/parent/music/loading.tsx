export default function ParentMusicLoading() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] px-4 py-16">
            <div className="mx-auto max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Music Store</p>
                <h1 className="mt-2 text-4xl font-black text-slate-900">Hear the songs</h1>
                <p className="mt-3 text-slate-600">
                    Listening is free. The player is opening.
                </p>
                <p className="mt-6 text-sm text-slate-600">
                    <a href="/login?redirect=/parent/music" className="font-bold underline">Parent sign in</a>
                    {' '}to keep a download. Playback does not need an account.
                </p>
            </div>
        </div>
    );
}
