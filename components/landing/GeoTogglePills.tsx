'use client';

import { useGeo } from '../GeoContext';
import { MapPin } from 'lucide-react';

export default function GeoTogglePills() {
    const { variant, setVariant, isLoading } = useGeo();

    if (isLoading) return <div className="h-10 w-48 bg-zinc-100 animate-pulse rounded-full" />;

    return (
        <div className="inline-flex items-center gap-2 p-1 bg-white/50 backdrop-blur-md border border-emerald-100 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-deep/40">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Location:</span>
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => setVariant('USA_MAIL_FIRST')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${variant === 'USA_MAIL_FIRST'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-deep/60 hover:bg-emerald-50'
                        }`}
                >
                    USA
                </button>
                <button
                    onClick={() => setVariant('GLOBAL_DIGITAL_FIRST')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${variant === 'GLOBAL_DIGITAL_FIRST'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-deep/60 hover:bg-emerald-50'
                        }`}
                >
                    International
                </button>
            </div>
        </div>
    );
}
