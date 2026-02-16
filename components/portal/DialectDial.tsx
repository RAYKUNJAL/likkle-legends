
"use client";

import { useUser } from '@/components/UserContext';
import { motion } from 'framer-motion';
import { Globe, Languages } from 'lucide-react';

export default function DialectDial() {
    const { dialectMode, toggleDialectMode } = useUser();

    return (
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border-2 border-primary/20 shadow-lg cursor-pointer hover:border-primary/40 transition-all select-none"
            onClick={toggleDialectMode}>
            <div className="flex items-center gap-2">
                <Languages className={`transition-colors ${dialectMode === 'localized' ? 'text-primary' : 'text-slate-400'}`} size={20} />
                <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">
                    Dialect Dial
                </span>
            </div>

            <div className="relative w-16 h-8 bg-slate-100 rounded-full border-2 border-slate-200 shadow-inner overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 w-8 bg-primary rounded-full shadow-lg flex items-center justify-center text-[10px] text-white font-black"
                    animate={{ x: dialectMode === 'localized' ? 32 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                    {dialectMode === 'localized' ? 'ON' : 'OFF'}
                </motion.div>
            </div>

            <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest ${dialectMode === 'localized' ? 'text-primary' : 'text-slate-400'}`}>
                    {dialectMode === 'localized' ? 'Caribbean Mode' : 'Standard Mode'}
                </span>
            </div>
        </div>
    );
}
