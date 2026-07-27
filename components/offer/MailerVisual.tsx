/**
 * MailerVisual
 *
 * 2026 CRO: A visual "what's inside the mailer" section showing the
 * physical envelope with contents spilling out (activity sheets, story
 * cards, character stickers, parent guide). Built entirely with CSS/SVG
 * so it needs no image assets.
 *
 * Rendered on /offer between the offer section and the final CTA so cold
 * traffic sees exactly what they get for $10 before the buy decision.
 */

const CONTENT_ITEMS = [
    { emoji: '📖', title: 'Story Cards', desc: 'Caribbean-centered stories your child can read along with' },
    { emoji: '📝', title: 'Activity Sheets', desc: 'School-style phonics and island-themed practice' },
    { emoji: '✨', title: 'Character Stickers', desc: 'Dilly, Tanty, R.O.T.I., Scorcha & Mango' },
    { emoji: '👨‍👩‍👧', title: 'Parent Guide', desc: 'Step-by-step support so you are never guessing' },
];

export default function MailerVisual() {
    return (
        <section className="px-5 py-16 bg-gradient-to-b from-[#fef9f0] to-[#fff7e8]">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0e9aa7] mb-2">
                        What&apos;s inside the mailer
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1c1c1c]">
                        A whole Caribbean learning pack, all in one envelope
                    </h2>
                    <p className="text-[#5f5f5d] leading-relaxed mt-3 max-w-xl mx-auto">
                        Everything below arrives in your child&apos;s first Intro Mailer —
                        designed to be opened together and explored at the kitchen table.
                    </p>
                </div>

                {/* ── Envelope SVG mockup with contents spilling out ── */}
                <div className="relative mx-auto w-full max-w-[560px] mb-10">
                    <svg
                        viewBox="0 0 560 420"
                        width="100%"
                        role="img"
                        aria-label="An open Likkle Legends mailer envelope with story cards, activity sheets, character stickers, and a parent guide spilling out"
                        style={{ display: 'block', filter: 'drop-shadow(0 20px 40px rgba(15,23,42,.18))' }}
                    >
                        <defs>
                            <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#fff2df" />
                            </linearGradient>
                            <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#ffe9b8" /><stop offset="1" stopColor="#f4c97b" />
                            </linearGradient>
                            <linearGradient id="paperA" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f8fafc" />
                            </linearGradient>
                            <linearGradient id="paperB" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#fff1d6" />
                            </linearGradient>
                            <linearGradient id="cardBlue" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#5ecbff" /><stop offset="1" stopColor="#1e93e6" />
                            </linearGradient>
                            <linearGradient id="cardPink" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#fb8fd0" /><stop offset="1" stopColor="#e0479f" />
                            </linearGradient>
                            <linearGradient id="cardPurple" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#b79cff" /><stop offset="1" stopColor="#7c3aed" />
                            </linearGradient>
                            <linearGradient id="sealG" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#fb7118" /><stop offset="1" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>

                        {/* Envelope body (back, open) */}
                        <path d="M70 200 L280 70 L490 200 L490 400 Q490 410 480 410 L80 410 Q70 410 70 400 Z" fill="url(#envBody)" stroke="#f0d9b3" strokeWidth="2" />
                        {/* Envelope flap (behind, open) */}
                        <path d="M70 200 L280 120 L490 200 L280 70 Z" fill="url(#envFlap)" stroke="#f0d9b3" strokeWidth="2" opacity="0.92" />

                        {/* Paper — activity sheets (spilling out the top) */}
                        <g transform="translate(150 60) rotate(-8)">
                            <rect x="0" y="0" width="180" height="150" rx="8" fill="url(#paperA)" stroke="#e2e8f0" strokeWidth="2" />
                            <rect x="14" y="16" width="120" height="8" rx="3" fill="#fb923c" opacity="0.85" />
                            <rect x="14" y="34" width="150" height="6" rx="3" fill="#0ea5a4" opacity="0.5" />
                            <rect x="14" y="48" width="140" height="6" rx="3" fill="#94a3b8" opacity="0.45" />
                            <rect x="14" y="62" width="150" height="6" rx="3" fill="#94a3b8" opacity="0.45" />
                            {/* dotted cut line */}
                            <line x1="14" y1="86" x2="166" y2="86" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 4" />
                            <rect x="14" y="100" width="60" height="6" rx="3" fill="#fb923c" opacity="0.6" />
                            <rect x="14" y="114" width="120" height="6" rx="3" fill="#94a3b8" opacity="0.45" />
                            <rect x="14" y="128" width="100" height="6" rx="3" fill="#94a3b8" opacity="0.45" />
                        </g>

                        {/* Story card (blue) */}
                        <g transform="translate(110 40) rotate(-14)">
                            <rect x="0" y="0" width="120" height="80" rx="10" fill="url(#cardBlue)" />
                            <rect x="14" y="14" width="92" height="8" rx="3" fill="#ffffff" opacity="0.9" />
                            <rect x="14" y="30" width="70" height="6" rx="3" fill="#ffffff" opacity="0.6" />
                            <text x="60" y="62" textAnchor="middle" fontSize="22" fill="#ffffff">🌴</text>
                        </g>

                        {/* Story card (pink) */}
                        <g transform="translate(330 50) rotate(12)">
                            <rect x="0" y="0" width="120" height="80" rx="10" fill="url(#cardPink)" />
                            <rect x="14" y="14" width="92" height="8" rx="3" fill="#ffffff" opacity="0.9" />
                            <rect x="14" y="30" width="70" height="6" rx="3" fill="#ffffff" opacity="0.6" />
                            <text x="60" y="62" textAnchor="middle" fontSize="22" fill="#ffffff">🌺</text>
                        </g>

                        {/* Parent guide (purple) */}
                        <g transform="translate(360 130) rotate(6)">
                            <rect x="0" y="0" width="100" height="130" rx="8" fill="url(#paperB)" stroke="#e9d5ff" strokeWidth="2" />
                            <rect x="0" y="0" width="100" height="22" rx="8" fill="url(#cardPurple)" />
                            <text x="50" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff" fontFamily="Montserrat, sans-serif">PARENT GUIDE</text>
                            <rect x="12" y="34" width="76" height="5" rx="2" fill="#7c3aed" opacity="0.4" />
                            <rect x="12" y="46" width="76" height="5" rx="2" fill="#94a3b8" opacity="0.5" />
                            <rect x="12" y="58" width="76" height="5" rx="2" fill="#94a3b8" opacity="0.5" />
                            <rect x="12" y="70" width="60" height="5" rx="2" fill="#94a3b8" opacity="0.5" />
                            <rect x="12" y="84" width="76" height="5" rx="2" fill="#7c3aed" opacity="0.4" />
                            <rect x="12" y="96" width="76" height="5" rx="2" fill="#94a3b8" opacity="0.5" />
                            <rect x="12" y="108" width="50" height="5" rx="2" fill="#94a3b8" opacity="0.5" />
                        </g>

                        {/* Sticker sheet (purple, bottom-left) */}
                        <g transform="translate(95 120) rotate(-4)">
                            <rect x="0" y="0" width="110" height="100" rx="8" fill="url(#paperA)" stroke="#e2e8f0" strokeWidth="2" />
                            <circle cx="28" cy="28" r="16" fill="url(#cardPurple)" />
                            <text x="28" y="34" textAnchor="middle" fontSize="16" fill="#ffffff">🤖</text>
                            <circle cx="82" cy="28" r="16" fill="url(#cardPink)" />
                            <text x="82" y="34" textAnchor="middle" fontSize="16" fill="#ffffff">💃</text>
                            <circle cx="28" cy="72" r="16" fill="url(#cardBlue)" />
                            <text x="28" y="78" textAnchor="middle" fontSize="16" fill="#ffffff">☀️</text>
                            <circle cx="82" cy="72" r="16" fill="url(#sealG)" />
                            <text x="82" y="78" textAnchor="middle" fontSize="16" fill="#ffffff">🥭</text>
                        </g>

                        {/* Seal sticker on the envelope */}
                        <g transform="translate(258 196)">
                            <circle r="26" fill="url(#sealG)" />
                            <circle r="26" fill="#ffffff" opacity="0.08" />
                            <text x="0" y="-2" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="Montserrat, sans-serif">LIKKLE</text>
                            <text x="0" y="8" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="Montserrat, sans-serif">LEGENDS</text>
                        </g>

                        {/* Envelope front bottom fold (in front of contents, semi-transparent) */}
                        <path d="M70 200 L280 240 L490 200 L490 400 Q490 410 480 410 L80 410 Q70 410 70 400 Z" fill="url(#envBody)" stroke="#f0d9b3" strokeWidth="2" opacity="0.96" />
                        {/* Center seam line */}
                        <line x1="280" y1="240" x2="280" y2="410" stroke="#f0d9b3" strokeWidth="1.5" opacity="0.6" />
                    </svg>
                </div>

                {/* ── Item grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CONTENT_ITEMS.map((item) => (
                        <div
                            key={item.title}
                            className="group rounded-2xl bg-white border border-[#eceae4] p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#fbbf24]/40"
                        >
                            <div className="text-3xl mb-2">{item.emoji}</div>
                            <h3 className="text-sm font-bold text-[#1c1c1c] mb-1">{item.title}</h3>
                            <p className="text-xs text-[#5f5f5d] leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <p className="text-center text-sm font-semibold text-[#0e9aa7] mt-8">
                    Plus instant access to the member portal the moment you check out.
                </p>
            </div>
        </section>
    );
}
