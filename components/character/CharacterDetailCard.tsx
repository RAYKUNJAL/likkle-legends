"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Box, Image as ImageIcon, Smartphone } from 'lucide-react';

const CharacterARViewer = dynamic(() => import('../CharacterARViewer'), { ssr: false });

interface CharacterDetailCardProps {
    char: any;
    index: number;
}

export default function CharacterDetailCard({ char, index }: CharacterDetailCardProps) {
    const [is3DMode, setIs3DMode] = useState(false);

    return (
        <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center`}>
            <div className="w-full lg:w-1/2">
                <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-zinc-50 group">
                    {is3DMode && char.model_3d_url ? (
                        <CharacterARViewer
                            src={char.model_3d_url}
                            poster={char.image}
                            alt={char.name}
                        />
                    ) : (
                        <Image
                            src={char.image}
                            alt={char.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}

                    {char.model_3d_url && (
                        <div className="absolute top-6 right-6 flex gap-2 z-30">
                            <button
                                onClick={() => setIs3DMode(!is3DMode)}
                                className={`p-4 rounded-2xl shadow-xl transition-all transform hover:scale-110 active:scale-95 ${is3DMode ? 'bg-orange-500 text-white' : 'bg-white/90 backdrop-blur text-blue-600'}`}
                                title={is3DMode ? "Switch to 2D" : "View in 3D"}
                            >
                                {is3DMode ? <ImageIcon size={24} /> : <Box size={24} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-8">
                <div className="flex flex-wrap gap-3">
                    <span className="px-6 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                        {char.role}
                    </span>
                    {char.model_3d_url && (
                        <span className="px-6 py-2 bg-blue-100 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200 flex items-center gap-2">
                            <Smartphone size={12} /> AR Ready
                        </span>
                    )}
                </div>

                <h2 className="text-4xl lg:text-6xl font-black text-deep">{char.name}</h2>
                <p className="text-2xl font-bold text-primary italic">&quot;{char.tagline}&quot;</p>
                <p className="text-xl text-deep/70 leading-relaxed">
                    {char.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-6">
                    <Link href="/signup" className="btn btn-primary btn-lg shadow-xl shadow-primary/20">
                        Start Adventure with {char.name.split(' ')[0]}
                    </Link>
                    {char.model_3d_url && (
                        <button
                            onClick={() => setIs3DMode(true)}
                            className="btn btn-outline btn-lg flex items-center gap-2 group"
                        >
                            <Box className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Interact in 3D
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
