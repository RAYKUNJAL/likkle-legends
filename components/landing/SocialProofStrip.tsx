'use client';

/**
 * Honest trust strip — no fabricated enrollment/rating numbers or named testimonials.
 * Geography reflects markets we serve; replace with verified press/stats when available.
 */
export default function SocialProofStrip() {
    return (
        <section className="py-16 bg-white border-b border-zinc-100 overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="text-center">
                    <p className="text-xs font-black text-deep/30 uppercase tracking-widest mb-6">
                        Built for Caribbean families in
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-base font-bold text-deep/40">
                        {['🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇯🇲 Jamaica', '🇹🇹 Trinidad', '🇧🇧 Barbados', '🇬🇾 Guyana', '🇳🇱 Netherlands'].map((loc) => (
                            <span key={loc} className="px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100">
                                {loc}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
