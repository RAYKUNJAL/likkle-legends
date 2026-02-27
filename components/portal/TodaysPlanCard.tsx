'use client';

import { motion } from 'framer-motion';
import { Clock, Zap, BookOpen, Music, Gamepad2, Printer, Star, ArrowRight } from 'lucide-react';
import type { PlanActivity } from '@/app/actions/generate-plan';

interface TodaysPlanCardProps {
    activity: PlanActivity;
    onStart: (activity: PlanActivity) => void;
    index: number;
}

const CHARACTER_AVATARS: Record<string, string> = {
    roti: '/images/roti-new.jpg',
    tanty_spice: '/images/tanty_spice_avatar.jpg',
    dilly_doubles: '/images/dilly-doubles.jpg',
    benny: '/images/logo.png',
};

const CHARACTER_COLORS: Record<string, { bg: string; border: string; ring: string; btn: string }> = {
    roti: { bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600' },
    tanty_spice: { bg: 'bg-orange-50', border: 'border-orange-200', ring: 'ring-orange-400', btn: 'bg-orange-500 hover:bg-orange-600' },
    dilly_doubles: { bg: 'bg-sky-50', border: 'border-sky-200', ring: 'ring-sky-400', btn: 'bg-sky-500 hover:bg-sky-600' },
    benny: { bg: 'bg-violet-50', border: 'border-violet-200', ring: 'ring-violet-400', btn: 'bg-violet-500 hover:bg-violet-600' },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
    lesson_micro: <BookOpen size={14} />,
    quiz_micro: <Star size={14} />,
    story_short: <BookOpen size={14} />,
    song_video_script: <Music size={14} />,
    printable: <Printer size={14} />,
    game: <Gamepad2 size={14} />,
};

const DOMAIN_LABELS: Record<string, { label: string; emoji: string }> = {
    literacy: { label: 'Literacy', emoji: '📖' },
    math: { label: 'Math', emoji: '🔢' },
    science: { label: 'Science', emoji: '🔬' },
    culture: { label: 'Culture', emoji: '🌺' },
    social: { label: 'Social', emoji: '🤝' },
    music: { label: 'Music', emoji: '🎵' },
};

const SECTION_MAP: Record<string, string> = {
    lesson_micro: 'lessons',
    quiz_micro: 'missions',
    story_short: 'stories',
    song_video_script: 'songs',
    printable: 'printables',
    game: 'games',
};

export function TodaysPlanCard({ activity, onStart, index }: TodaysPlanCardProps) {
    const charKey = activity.characterGuide || 'roti';
    const colors = CHARACTER_COLORS[charKey] || CHARACTER_COLORS.roti;
    const avatar = CHARACTER_AVATARS[charKey] || CHARACTER_AVATARS.roti;
    const domain = DOMAIN_LABELS[activity.domain] || { label: activity.domain, emoji: '⭐' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-2xl border-2 ${colors.bg} ${colors.border} p-4 flex gap-3`}
        >
            {/* Character avatar */}
            <div className={`w-12 h-12 rounded-full overflow-hidden ring-2 ${colors.ring} flex-shrink-0 shadow-sm`}>
                <img src={avatar} alt={charKey} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 text-sm leading-tight mb-1 truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500 bg-white/80 rounded-full px-2 py-0.5 border border-gray-100 flex items-center gap-1">
                                {domain.emoji} {domain.label}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> {activity.duration}m
                            </span>
                            <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                                <Zap size={10} /> +{activity.xpReward} XP
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onStart(activity)}
                        className={`flex items-center gap-1.5 ${colors.btn} text-white font-black text-xs px-3 py-2 rounded-xl flex-shrink-0 transition-all shadow-sm`}
                    >
                        Start <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
