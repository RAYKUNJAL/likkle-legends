'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Likkle Legends System Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-red-200/50">
                <AlertTriangle size={48} />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">Oye! Something went wrong.</h1>
            <p className="text-xl text-slate-500 max-w-lg mb-12">
                Even legends sometimes take a tumble. We've logged the issue and our team is looking into it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                    onClick={() => reset()}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <RefreshCw size={24} /> Try Again
                </button>
                <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
                >
                    <Home size={24} /> Home
                </Link>
            </div>

            <div className="mt-16 text-slate-400 font-mono text-xs uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
                Error Digest: {error.digest || 'Internal System Failure'}
            </div>
        </div>
    );
}
