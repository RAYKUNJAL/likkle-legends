'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Download, ArrowRight, ChevronDown, ChevronRight,
    BookOpen, Music, Gamepad2, Printer, Star, Clock, Lock, Zap,
    CheckCircle2, Crown,
} from 'lucide-react';
import type { LearningPlan, PlanWeek, PlanActivity } from '@/app/actions/generate-plan';

// ─── Character Config ─────────────────────────────────────────────────────────

const CHARACTERS: Record<string, {
    name: string; color: string; bg: string; border: string; ring: string;
    avatarUrl: string; greeting: string;
}> = {
    roti: {
        name: 'R.O.T.I.',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: 'ring-emerald-400',
        avatarUrl: '/images/roti-new.jpg',
        greeting: "Brains on, sunshine! Your plan is ready. Let's learn!",
    },
    tanty_spice: {
        name: 'Tanty Spice',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        ring: 'ring-orange-400',
        avatarUrl: '/images/tanty_spice_avatar.jpg',
        greeting: "Come nuh, sit down wid me. Your journey start today!",
    },
    dilly_doubles: {
        name: 'Dilly Doubles',
        color: 'text-sky-700',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        ring: 'ring-sky-400',
        avatarUrl: '/images/dilly-doubles.jpg',
        greeting: "LESSSS GOOO! Your plan is fire. Let's be LEGENDARY!",
    },
    benny: {
        name: 'Benny',
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        ring: 'ring-violet-400',
        avatarUrl: '/images/logo.png',
        greeting: "Shhh... great discoveries await. Your plan is crafted with care.",
    },
};

// ─── Activity Type Icons ──────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    lesson_micro: <BookOpen size={14} />,
    quiz_micro: <Star size={14} />,
    story_short: <BookOpen size={14} />,
    song_video_script: <Music size={14} />,
    printable: <Printer size={14} />,
    game: <Gamepad2 size={14} />,
};

const DOMAIN_COLORS: Record<string, string> = {
    literacy: 'bg-blue-100 text-blue-700',
    math: 'bg-green-100 text-green-700',
    science: 'bg-purple-100 text-purple-700',
    culture: 'bg-orange-100 text-orange-700',
    social: 'bg-pink-100 text-pink-700',
    music: 'bg-yellow-100 text-yellow-700',
};

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: PlanActivity }) {
    const char = CHARACTERS[activity.characterGuide] || CHARACTERS.roti;
    const domainColor = DOMAIN_COLORS[activity.domain] || 'bg-gray-100 text-gray-700';

    return (
        <div className={`rounded-2xl border p-3 ${char.bg} ${char.border} flex gap-3 items-start`}>
            <div className="flex-shrink-0 mt-0.5">
                <div className={`w-8 h-8 rounded-full overflow-hidden ring-2 ${char.ring}`}>
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm text-gray-800">{activity.title}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${domainColor}`}>
                        {ACTIVITY_ICONS[activity.type] || <Star size={12} />}
                        {activity.domain}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={11} /> {activity.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600">
                        <Zap size={11} /> +{activity.xpReward} XP
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Week Card ────────────────────────────────────────────────────────────────

function WeekCard({ week, isLocked }: { week: PlanWeek; isLocked?: boolean }) {
    const [expanded, setExpanded] = useState(week.weekNumber === 1);
    const char = CHARACTERS[week.characterGuide] || CHARACTERS.roti;

    if (isLocked) {
        return (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 relative overflow-hidden">
                {/* Blurred preview */}
                <div className="blur-sm pointer-events-none select-none opacity-40">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300" />
                        <div>
                            <div className="h-4 w-32 bg-gray-300 rounded mb-1" />
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                        </div>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded-2xl mb-2" />
                    ))}
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yellow-200 mx-6">
                        <Lock size={28} className="text-yellow-500 mx-auto mb-2" />
                        <p className="font-bold text-gray-800 mb-1">Week {week.weekNumber}: {week.theme}</p>
                        <p className="text-sm text-gray-500 mb-4">Upgrade to unlock your full 4-week learning journey</p>
                        <a
                            href="/pricing"
                            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-all"
                        >
                            <Crown size={16} /> Unlock Full Plan
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-3xl border-2 ${char.border} bg-white overflow-hidden`}>
            {/* Header */}
            <button
                className={`w-full flex items-center justify-between p-5 ${char.bg} text-left`}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ${char.ring} flex-shrink-0`}>
                        <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <p className={`font-bold text-base ${char.color}`}>Week {week.weekNumber}: {week.theme}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Guide: {char.name} · {week.curriculumStandard.split(':')[0]}</p>
                    </div>
                </div>
                {expanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
            </button>

            {/* Days */}
            {expanded && (
                <div className="p-4 space-y-4">
                    {week.days.map((dayPlan) => (
                        <div key={dayPlan.day}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{dayPlan.day}</p>
                            <div className="space-y-2">
                                {dayPlan.activities.map((activity, ai) => (
                                    <ActivityCard key={ai} activity={activity} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

async function exportToPDF(elementId: string, filename: string) {
    try {
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        const element = document.getElementById(elementId);
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FFFDF7' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
    } catch (err) {
        console.error('PDF export error:', err);
    }
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function PlanPreviewContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const childId = searchParams.get('childId');
    const characterParam = searchParams.get('character') || 'roti';

    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<LearningPlan | null>(null);
    const [trialMode, setTrialMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const planRef = useRef<HTMLDivElement>(null);

    const character = CHARACTERS[characterParam] || CHARACTERS.roti;

    useEffect(() => {
        if (!childId) {
            setError('No child profile found. Please complete onboarding first.');
            setLoading(false);
            return;
        }

        const generate = async () => {
            try {
                const res = await fetch('/api/learning-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ childId }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
                setPlan(data.plan);
                setTrialMode(data.trialMode ?? false);
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        generate();
    }, [childId]);

    const handleExportPDF = async () => {
        setExporting(true);
        await exportToPDF('plan-content', 'likkle-legends-learning-plan.pdf');
        setExporting(false);
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center gap-6 px-4">
                <div className={`w-24 h-24 rounded-full overflow-hidden ring-4 ${character.ring} shadow-lg`}>
                    <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-black text-gray-800 mb-2">Building Your Learning Plan...</h2>
                    <p className="text-gray-500 text-sm max-w-xs">
                        {character.name} is crafting a personalized Caribbean journey just for your legend.
                    </p>
                </div>
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className={`w-3 h-3 rounded-full ${character.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <p className="text-4xl mb-4">🌊</p>
                    <h2 className="text-xl font-black text-gray-800 mb-2">Hmm, something went sideways</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/portal')}
                        className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-full"
                    >
                        Go to Portal
                    </button>
                </div>
            </div>
        );
    }

    const weeks = plan?.plan_data?.weeks || [];
    const unlockedWeeks = plan?.plan_data?.weeksUnlocked || 1;

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* Header */}
            <div className={`${character.bg} border-b ${character.border} px-4 py-6`}>
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-full overflow-hidden ring-4 ${character.ring} shadow-md flex-shrink-0`}>
                            <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                                {character.name} says
                            </p>
                            <p className={`font-bold text-base ${character.color} leading-snug`}>
                                "{character.greeting}"
                            </p>
                        </div>
                    </div>

                    {trialMode && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                            <Crown size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-gray-800">You're on a Free Trial — Week 1 Unlocked!</p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Upgrade to unlock your full 4-week personalized learning journey, PDF downloads, and character-guided lessons.
                                </p>
                                <a href="/pricing" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-yellow-700 hover:underline">
                                    See plans <ArrowRight size={12} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Title */}
            <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">{plan?.plan_name || 'My Learning Adventure'}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {weeks.length}-week journey · {plan?.curriculum_standard || 'OECS Caribbean Primary'}
                        </p>
                    </div>

                    {!trialMode && (
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-full text-sm transition-all disabled:opacity-60"
                        >
                            <Download size={15} />
                            {exporting ? 'Downloading...' : 'Download PDF'}
                        </button>
                    )}
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div id="plan-content" ref={planRef} className="max-w-2xl mx-auto px-4 pb-8 space-y-4">
                {/* Focus areas chips */}
                {(plan?.focus_areas?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2 py-2">
                        {plan!.focus_areas.map(area => (
                            <span key={area} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${DOMAIN_COLORS[area] || 'bg-gray-100 text-gray-600'}`}>
                                <CheckCircle2 size={11} /> {area}
                            </span>
                        ))}
                    </div>
                )}

                {/* Weeks */}
                {weeks.map((week, wi) => (
                    <WeekCard
                        key={week.weekNumber}
                        week={week}
                        isLocked={trialMode && wi >= unlockedWeeks}
                    />
                ))}

                {/* Locked weeks placeholder for free tier */}
                {trialMode && weeks.length < 4 && Array.from({ length: 4 - weeks.length }, (_, i) => (
                    <div key={`locked-${i}`} className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-400">Week {weeks.length + i + 1}</p>
                                    <p className="text-xs text-gray-400">Upgrade to unlock</p>
                                </div>
                            </div>
                            <a href="/pricing" className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-full text-xs transition-all">
                                <Crown size={13} /> Unlock
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-4">
                <div className="max-w-2xl mx-auto flex gap-3">
                    {trialMode && (
                        <a
                            href="/pricing"
                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-6 py-3.5 rounded-full text-base transition-all"
                        >
                            <Crown size={18} /> Unlock Full Plan
                        </a>
                    )}
                    <button
                        onClick={() => router.push('/portal')}
                        className={`${trialMode ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 py-3.5 rounded-full text-base transition-all shadow-md`}
                    >
                        Enter the Portal <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Default Export (Suspense Wrapper) ───────────────────────────────────────

export default function PlanPreviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <Sparkles className="animate-pulse text-emerald-500" size={48} />
            </div>
        }>
            <PlanPreviewContent />
        </Suspense>
    );
}
