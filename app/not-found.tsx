import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
            {/* Background blobs for depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-48 h-48 mb-6 relative animate-bounce">
                    <Image
                        src="/images/mango_moko.png"
                        alt="Mango Moko"
                        fill
                        className="object-contain"
                    />
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-deep mb-4 tracking-tight">
                    Off the Map! <span className="inline-block animate-wiggle">🗺️</span>
                </h1>

                <p className="text-xl md:text-2xl text-deep/60 max-w-lg mb-10 font-medium">
                    Even Mango Moko can't find this page! Looks like you've wandered into uncharted territory.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                    >
                        <Home size={24} />
                        Back to Mainland
                    </Link>

                    <Link
                        href="/contact"
                        className="flex items-center justify-center gap-3 px-10 py-5 bg-white border-4 border-deep/5 text-deep rounded-3xl font-black text-lg hover:bg-deep/5 transition-all"
                    >
                        <ArrowLeft size={24} />
                        Get Help
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-primary via-secondary to-accent" />
        </div>
    );
}
