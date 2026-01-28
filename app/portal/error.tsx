"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Portal crash:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-3xl font-black text-red-900 mb-2">
                Oops! The Portal got stuck.
            </h1>
            <p className="text-red-700/80 max-w-md mb-8">
                Don't worry, Likkle Legend! Even heroes need a reboot sometimes.
                <br />
                <span className="text-xs bg-red-100 px-2 py-1 rounded border border-red-200 mt-2 inline-block font-mono">
                    Error: {error.message || "Unknown portal error"}
                </span>
            </p>

            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-red-200"
                >
                    <RefreshCw size={20} />
                    Try Again
                </button>
                <Link
                    href="/"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
