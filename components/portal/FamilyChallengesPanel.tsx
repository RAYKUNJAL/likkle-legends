"use client";

import { useState, useEffect } from 'react';
import { Plus, Flag, Users, Check, ChevronRight, Clock, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createFamilyChallenge, getFamilyChallenges, type FamilyChallenge } from '@/app/actions/challenges';
import { useUser } from '@/components/UserContext';
import toast from 'react-hot-toast';

type ChallengeType = 'read_stories' | 'earn_xp' | 'beat_streak' | 'complete_missions';

const CHALLENGE_PRESETS: Array<{
    type: ChallengeType;
    label: string;
    emoji: string;
    defaultTarget: number;
    targetLabel: string;
    rewardXp: number;
}> = [
        { type: 'read_stories', label: 'Read Stories', emoji: '📖', defaultTarget: 3, targetLabel: 'stories', rewardXp: 150 },
        { type: 'earn_xp', label: 'Earn XP', emoji: '⚡', defaultTarget: 500, targetLabel: 'XP', rewardXp: 200 },
        { type: 'beat_streak', label: 'Build a Streak', emoji: '🔥', defaultTarget: 5, targetLabel: 'days', rewardXp: 250 },
        { type: 'complete_missions', label: 'Complete Missions', emoji: '🎯', defaultTarget: 5, targetLabel: 'missions', rewardXp: 300 },
    ];

const DURATION_OPTIONS = [
    { days: 3, label: '3 Days' },
    { days: 7, label: 'One Week' },
    { days: 14, label: 'Two Weeks' },
];

function daysRemaining(endsAt: string): number {
    return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
}

export default function FamilyChallengesPanel() {
    const { children } = useUser();
    const [challenges, setChallenges] = useState<FamilyChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [selectedType, setSelectedType] = useState<ChallengeType>('read_stories');
    const [selectedDuration, setSelectedDuration] = useState(7);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [customTitle, setCustomTitle] = useState('');

    const preset = CHALLENGE_PRESETS.find(p => p.type === selectedType)!;

    useEffect(() => {
        (async () => {
            try {
                const data = await getFamilyChallenges();
                setChallenges(data);
            } catch {
                toast.error('Could not load challenges');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const toggleChild = (id: string) => {
        setSelectedChildren(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!selectedChildren.length) {
            toast.error('Select at least one child');
            return;
        }
        setSaving(true);
        try {
            const title = customTitle.trim() || `${preset.label} Challenge`;
            const result = await createFamilyChallenge({
                title,
                challengeType: selectedType,
                targetValue: preset.defaultTarget,
                rewardXp: preset.rewardXp,
                durationDays: selectedDuration,
                childIds: selectedChildren,
            });

            if (result.success) {
                toast.success('Challenge created! 🎯');
                const updated = await getFamilyChallenges();
                setChallenges(updated);
                setShowCreate(false);
                setSelectedChildren([]);
                setCustomTitle('');
            } else {
                toast.error(result.error || 'Failed to create');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-zinc-900">Family Challenges</h3>
                    <p className="text-zinc-400 text-xs font-medium">Keep the whole crew motivated together</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-2xl font-black text-sm hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} />
                    New
                </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 animate-pulse">
                            <div className="h-4 bg-zinc-100 rounded-full w-1/2 mb-3" />
                            <div className="h-3 bg-zinc-50 rounded-full w-full mb-2" />
                            <div className="h-3 bg-zinc-50 rounded-full w-3/4" />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && !challenges.length && !showCreate && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="font-black text-zinc-800 mb-1">No active challenges</p>
                    <p className="text-zinc-400 text-sm font-medium mb-4">Create your first family challenge to motivate the crew!</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all"
                    >
                        Create a Challenge
                    </button>
                </div>
            )}

            {/* Existing challenges */}
            {!loading && challenges.map((challenge) => {
                const days = daysRemaining(challenge.ends_at);
                const allDone = challenge.participants.every(p => p.completed);
                return (
                    <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all ${allDone ? 'border-emerald-200' : 'border-zinc-100'}`}
                    >
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{CHALLENGE_PRESETS.find(p => p.type === challenge.challenge_type)?.emoji || '🎯'}</span>
                                    <h4 className="font-black text-zinc-900 text-sm">{challenge.title}</h4>
                                    {allDone && <span className="text-[10px] bg-emerald-100 text-emerald-600 font-black px-2 py-0.5 rounded-full uppercase">Done!</span>}
                                </div>
                                <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium">
                                    <span className="flex items-center gap-1"><Clock size={11} /> {days}d left</span>
                                    <span className="flex items-center gap-1"><Trophy size={11} /> {challenge.reward_xp} XP reward</span>
                                </div>
                            </div>
                        </div>

                        {/* Per-child progress bars */}
                        <div className="space-y-2">
                            {challenge.participants.map((p) => {
                                const pct = Math.min(100, Math.round((p.progress / challenge.target_value) * 100));
                                return (
                                    <div key={p.child_id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-black text-zinc-700">{p.first_name}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">
                                                {p.progress}/{challenge.target_value}
                                                {p.completed && <span className="text-emerald-500 ml-1">✓</span>}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.2, duration: 0.6 }}
                                                className={`h-full rounded-full ${p.completed ? 'bg-emerald-400' : 'bg-gradient-to-r from-violet-400 to-purple-500'}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                );
            })}

            {/* Create Challenge Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-black text-zinc-900">New Challenge</h3>
                                <button onClick={() => setShowCreate(false)} className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Challenge type */}
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Challenge Type</p>
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {CHALLENGE_PRESETS.map(p => (
                                    <button
                                        key={p.type}
                                        onClick={() => setSelectedType(p.type)}
                                        className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedType === p.type ? 'border-violet-500 bg-violet-50' : 'border-zinc-100 hover:border-zinc-200'}`}
                                    >
                                        <div className="text-xl mb-1">{p.emoji}</div>
                                        <p className="text-xs font-black text-zinc-800">{p.label}</p>
                                        <p className="text-[10px] text-zinc-400 font-medium">{p.defaultTarget} {p.targetLabel}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Duration */}
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Duration</p>
                            <div className="flex gap-2 mb-5">
                                {DURATION_OPTIONS.map(d => (
                                    <button
                                        key={d.days}
                                        onClick={() => setSelectedDuration(d.days)}
                                        className={`flex-1 py-2.5 rounded-2xl border-2 text-xs font-black transition-all ${selectedDuration === d.days ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>

                            {/* Children selector */}
                            {children && children.length > 0 && (
                                <>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Include</p>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {children.map((child: any) => {
                                            const selected = selectedChildren.includes(child.id);
                                            return (
                                                <button
                                                    key={child.id}
                                                    onClick={() => toggleChild(child.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-sm transition-all ${selected ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                                                >
                                                    {selected && <Check size={12} />}
                                                    {child.first_name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Reward preview */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mb-5 flex items-center gap-3">
                                <Trophy size={20} className="text-emerald-500" />
                                <div>
                                    <p className="text-xs font-black text-emerald-800">Reward: {preset.rewardXp} XP</p>
                                    <p className="text-[10px] text-emerald-500 font-medium">Awarded automatically when all participants complete</p>
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={saving || !selectedChildren.length}
                                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {saving ? 'Creating...' : 'Start Challenge 🎯'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
