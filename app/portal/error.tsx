"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

// Chunk-load failures happen when a deploy replaces the JS bundles while a
// browser still holds the old page shell (stale chunk hashes), or on a slow
// network. A full page reload always fixes them — do it automatically once
// instead of showing kids an error screen.
function isChunkError(error: Error): boolean {
    return /Loading chunk [\w-]+ failed|ChunkLoadError|Failed to fetch dynamically imported module/i.test(
        `${error.name} ${error.message}`
    );
}

export default function PortalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [autoRecovering, setAutoRecovering] = useState(false);

    useEffect(() => {
        console.error("Portal crash:", error);

        if (isChunkError(error) && typeof window !== "undefined") {
            // Guard against reload loops: only auto-reload once per minute.
            const last = Number(sessionStorage.getItem("ll_chunk_reload") || 0);
            if (Date.now() - last > 60_000) {
                sessionStorage.setItem("ll_chunk_reload", String(Date.now()));
                setAutoRecovering(true);
                window.location.reload();
            }
        }
    }, [error]);

    if (autoRecovering) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-6 text-center">
                <div className="text-6xl animate-bounce mb-4">🏝️</div>
                <p className="text-2xl font-black text-sky-700">Freshening up the island...</p>
            </div>
        );
    }

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
                    onClick={() => {
                        if (isChunkError(error)) {
                            window.location.reload();
                        } else {
                            reset();
                        }
                    }}
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
