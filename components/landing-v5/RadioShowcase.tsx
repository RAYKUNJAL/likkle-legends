'use client';

import { useId } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Headphones, Radio } from 'lucide-react';
import LikkleRadioPlayer from '@/components/radio/LikkleRadioPlayer';

const focusRing = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0a8b8d]/40 focus-visible:ring-offset-2';

export default function RadioShowcase() {
    const id = useId();
    return (
        <section id="radio" aria-labelledby={`${id}-heading`} className="scroll-mt-[100px] overflow-hidden bg-[#fffaf0] px-5 py-16 text-[#102543] sm:px-8 sm:py-20">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
                <div>
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0a8b8d]/20 bg-[#e8f5ef] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087c7c]">
                        <Radio size={16} aria-hidden="true" /> Likkle Radio
                    </p>
                    <h2 id={`${id}-heading`} className="font-heading text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
                        Little voices.<br /><span className="text-[#07898c]">Big island rhythms.</span>
                    </h2>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-[#51617b]">
                        R.O.T.I., Tanty Spice, Steelpan Sam, Dilly Doubles, and Benny of Shadows take turns as DJ. Learning songs, island rhythms, stories, and calm — recorded tracks from our library.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold">
                        {['Learning songs', 'Island vibes', 'Stories', 'Bedtime'].map((label) => (
                            <span key={label} className="rounded-full border border-[#eadfcb] bg-white/70 px-3 py-2">{label}</span>
                        ))}
                    </div>
                    <Link href="/radio" className={`mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4d63] px-6 py-3 font-bold text-white shadow-[0_6px_18px_#ff4d6325] transition-colors hover:bg-[#e83c54] ${focusRing}`}>
                        Open Likkle Radio <ArrowUpRight size={18} aria-hidden="true" />
                    </Link>
                    <p className="mt-3 flex items-center gap-2 text-sm text-[#51617b]">
                        <Headphones size={15} aria-hidden="true" /> Listen right here. No sign-up needed.
                    </p>
                </div>
                <LikkleRadioPlayer />
            </div>
        </section>
    );
}
