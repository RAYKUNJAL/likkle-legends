import Link from 'next/link';
import { ArrowLeft, Home, Map } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Map className="text-amber-600" size={48} />
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-deep mb-4">
                Off the Map! 🗺️
            </h1>

            <p className="text-lg md:text-xl text-deep/60 max-w-md mb-8">
                Looks like you've wandered into uncharted territory. This page doesn't exist on our island.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all hover:scale-105"
                >
                    <Home size={20} />
                    Back Home
                </Link>

                <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-deep/10 text-deep rounded-2xl font-black hover:bg-deep/5 transition-all"
                >
                    <ArrowLeft size={20} />
                    Contact Support
                </Link>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
        </div>
    );
}
