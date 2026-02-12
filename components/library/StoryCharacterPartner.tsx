"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smartphone, Box, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

const CharacterARViewer = dynamic(() => import('@/components/CharacterARViewer'), { ssr: false });

interface StoryCharacterPartnerProps {
    guide: 'tanty' | 'roti';
    isVisible: boolean;
    onClose: () => void;
}

const CHARACTER_MODELS = {
    tanty: {
        name: "Tanty Spice",
        model: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        poster: "/images/tanty_spice_avatar.jpg",
        color: "from-orange-400 to-amber-500"
    },
    roti: {
        name: "R.O.T.I.",
        model: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
        poster: "/images/roti-avatar.jpg",
        color: "from-blue-400 to-indigo-500"
    }
};

export default function StoryCharacterPartner({ guide, isVisible, onClose }: StoryCharacterPartnerProps) {
    const config = CHARACTER_MODELS[guide];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 100 }}
                    className="fixed right-6 bottom-24 z-[300] w-72 h-[400px] pointer-events-auto"
                >
                    <div className="relative w-full h-full bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className={`p-4 bg-gradient-to-r ${config.color} text-white flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                                <Box size={18} />
                                <span className="font-black text-xs uppercase tracking-widest">{config.name} Live</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* 3D View */}
                        <div className="flex-1 bg-zinc-50 relative">
                            <CharacterARViewer
                                src={config.model}
                                poster={config.poster}
                                alt={config.name}
                            />
                        </div>

                        {/* Footer / Interaction */}
                        <div className="p-4 bg-white border-t border-zinc-100 italic text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest">
                            {config.name} is listening to your story...
                        </div>
                    </div>

                    {/* Magic Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${config.color} blur-3xl -z-10 opacity-20`} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
