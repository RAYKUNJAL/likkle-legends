
"use client";

import React from 'react';

interface CharacterARViewerProps {
    src: string;
    poster: string;
    alt: string;
    autoRotate?: boolean;
    cameraControls?: boolean;
}

/**
 * Simplified Character Viewer — displays the poster image.
 * AR/3D viewer removed for this release.
 */
export default function CharacterARViewer({
    poster,
    alt,
}: CharacterARViewerProps) {
    return (
        <div className="relative w-full h-full bg-gradient-to-b from-blue-50/50 to-white/50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
            <img
                src={poster}
                alt={alt}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/roti_placeholder.png';
                }}
            />
        </div>
    );
}
