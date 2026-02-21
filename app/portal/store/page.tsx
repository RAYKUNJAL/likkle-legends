"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MusicStoreRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/portal/music');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50">
            <div className="text-center">
                <div className="text-6xl animate-bounce mb-4">🎵</div>
                <h1 className="text-2xl font-black text-blue-900">Heading to the Music Hub...</h1>
            </div>
        </div>
    );
}
