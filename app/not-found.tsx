import Link from 'next/link';
import { Home, Search, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-12">
                <div className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.05)] select-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-primary/20 rounded-full animate-ping"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Compass size={64} className="text-primary animate-spin-slow" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-sky-900 mb-4 tracking-tighter">Lost at Sea?</h1>
            <p className="text-xl text-sky-700/60 max-w-lg mb-12 font-medium">
                The island you're looking for doesn't exist yet, or it's hidden behind a tropical storm.
            </p>

            <Link
                href="/"
                className="flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[2.5rem] font-black text-xl shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all border-4 border-white"
            >
                <Home size={28} /> Take Me Home
            </Link>

            <div className="mt-20 flex gap-12 opacity-30 select-none">
                <span className="text-4xl">🌴</span>
                <span className="text-4xl">🐚</span>
                <span className="text-4xl">🥥</span>
            </div>
        </div>
    );
}
