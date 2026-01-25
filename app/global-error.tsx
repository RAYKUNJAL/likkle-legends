
'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RefreshCcw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to Sentry or similar if available
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4 font-sans text-center">
                    <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-zinc-100">
                        <div className="relative h-12 w-48 mx-auto mb-8">
                            <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                        </div>
                        <h2 className="text-3xl font-black text-deep mb-4">Oops! The Island moved.</h2>
                        <p className="text-deep/50 font-bold mb-8">
                            Something went wrong in the village. Don't worry, we're building it back up!
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => reset()}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <RefreshCcw size={20} /> Try Again
                            </button>
                            <Link
                                href="/"
                                className="w-full py-4 bg-zinc-100 text-deep font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3"
                            >
                                <Home size={20} /> Back to Shore
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
