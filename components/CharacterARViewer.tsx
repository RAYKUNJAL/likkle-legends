
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Box, Smartphone } from 'lucide-react';

interface CharacterARViewerProps {
    src: string;
    poster: string;
    alt: string;
    autoRotate?: boolean;
    cameraControls?: boolean;
}

// Extend JSX namespace for model-viewer
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': any;
        }
    }
}

export default function CharacterARViewer({
    src,
    poster,
    alt,
    autoRotate = true,
    cameraControls = true
}: CharacterARViewerProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Import model-viewer for client-side side effects
        import('@google/model-viewer').then(() => {
            setIsReady(true);
        }).catch(err => {
            console.error('Failed to load model-viewer:', err);
        });
    }, []);

    const modelRef = useRef<any>(null);

    useEffect(() => {
        const model = modelRef.current;
        if (!model) return;

        const handleLoad = () => setIsLoaded(true);
        const handleError = (e: any) => {
            console.error("Model Viewer Error:", e);
            setHasError(true);
            setIsLoaded(true);
        };

        model.addEventListener('load', handleLoad);
        model.addEventListener('error', handleError);

        return () => {
            model.removeEventListener('load', handleLoad);
            model.removeEventListener('error', handleError);
        };
    }, [isReady]); // Re-attach when ready/mounted

    if (!isReady) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 rounded-[2rem] animate-pulse">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group bg-gradient-to-b from-blue-50/50 to-white/50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
            {/* Loading Indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                        <p className="text-xs font-black text-orange-950 uppercase tracking-widest animate-pulse">Awakening Legend...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-red-500 font-bold">Failed to load 3D Model</div>
                        <p className="text-xs text-gray-500">Check your connection or try again.</p>
                    </div>
                </div>
            )}

            <model-viewer
                ref={modelRef}
                src={src}
                poster={poster}
                alt={alt}
                shadow-intensity="1"
                camera-controls={cameraControls ? "" : undefined}
                auto-rotate={autoRotate ? "" : undefined}
                ar={""}
                ar-modes="webxr scene-viewer quick-look"
                interaction-prompt="auto"
                camera-orbit="0deg 75deg 105%"
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                className="relative z-10"
            >
                {/* AR Button */}
                <button
                    slot="ar-button"
                    className="absolute bottom-6 right-6 bg-orange-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all flex items-center gap-2 transform active:scale-95 z-30"
                >
                    <Smartphone size={16} />
                    View in Your Room
                </button>

                {/* Progress bar */}
                <div slot="progress-bar" className="hidden" />

                {/* Instructions / Overlay */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2">
                        <Box size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-900 uppercase">3D Preview</span>
                    </div>
                </div>
            </model-viewer>
        </div>
    );
}
