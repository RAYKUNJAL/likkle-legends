"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles, BookOpen, Palette, Play,
    Trophy, Crown, Lock, Gift, Video, Radio,
    Map as MapIcon, LogOut, Download, Menu, X, ShoppingBag, LayoutDashboard, MessageCircle, Info
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useUser } from '@/components/UserContext';
import { getStorybooks, getVideos, logActivity } from '@/lib/database';
import { calculateLevel, LEVELS } from '@/lib/gamification';
import { RADIO_TRACKS } from '@/lib/constants';
import { EmptyState } from '@/components/EmptyState';
import { BadgeCheck } from 'lucide-react';
import { checkDailyLogin, getFreezeCount } from '@/app/actions/retention';
import { getXPMultiplier } from '@/lib/services/gamification';
import { CharacterGuideBanner } from '@/components/portal/CharacterGuideBanner';
import { TodaysPlanCard } from '@/components/portal/TodaysPlanCard';
import type { PlanActivity } from '@/app/actions/generate-plan';
import { addScreenMinute, getTodayScreenMinutes, normalizeParentalControls } from '@/lib/parental-controls';

// ─── Lazy-loaded heavy components ────────────────────────────────────────────
// Only loaded when the user navigates to that section — keeps initial bundle small.
const TantyRadio = dynamic(() => import('@/components/TantyRadio'), { ssr: false });
const IslandVillageMap = dynamic(() => import('@/components/IslandVillageMap'), {
    ssr: false,
    loading: () => <IslandVillageMapSkeleton />,
});
const PremiumVideoPlayer = dynamic(() => import('@/components/PremiumVideoPlayer'), { ssr: false });
const LeaderboardPanel = dynamic(() => import('@/components/portal/LeaderboardPanel'), { ssr: false });
const FamilyChallengesPanel = dynamic(() => import('@/components/portal/FamilyChallengesPanel'), { ssr: false });
const CraftCorner = dynamic(() => import('@/components/portal/CraftCorner').then(m => ({ default: m.CraftCorner })), { ssr: false });
const PrintablesSection = dynamic(() => import('@/components/PrintablesSection').then(m => ({ default: m.PrintablesSection })), { ssr: false });

// Modals — only rendered when triggered, so lazy load them too
const BadgeUnlockModal = dynamic(() => import('@/components/gamification/BadgeUnlockModal'), { ssr: false });
const StreakWidget = dynamic(() => import('@/components/portal/StreakWidget'), {
    ssr: false,
    loading: () => <StreakWidgetSkeleton />,
});
const DailyChestModal = dynamic(() => import('@/components/portal/DailyChestModal'), { ssr: false });
const StreakShareCard = dynamic(() => import('@/components/portal/StreakShareCard'), { ssr: false });
const CoppaConsentModal = dynamic(() => import('@/components/auth/CoppaConsentModal'), { ssr: false });
const UpgradeModal = dynamic(() => import('@/components/UpgradeModal'), { ssr: false });
const DoubleXPBanner = dynamic(() => import('@/components/portal/DoubleXPBanner'), { ssr: false });
const MangoGiftModal = dynamic(() => import('@/components/portal/MangoGiftModal'), { ssr: false });
const FeatureUpgradeModal = dynamic(() => import('@/components/FeatureUpgradeModal'), { ssr: false });
import { FreeTierBanner } from '@/components/portal/FreeTierBanner';
import { fireConversionEvent, trackEvent } from '@/lib/analytics';

interface Storybook {
    id: string;
    title: string;
    summary: string;
    cover_image_url: string;
    tier_required: string;
    reading_time_minutes: number;
}

interface Video {
    id: string;
    title: string;
    thumbnail_url: string;
    video_url?: string;
    duration_seconds: number;
    tier_required: string;
    reward_xp?: number;
}

type PortalSection = 'home' | 'stories' | 'missions' | 'games' | 'lessons' | 'radio' | 'printables' | 'leaderboard' | 'challenges';

/**
 * Curated free Caribbean educational videos for Village Cinema (ages 3–9).
 * All video IDs verified from trusted educational sources.
 * Admins can add/replace videos via the Admin Panel → Content → Videos.
 *
 * Sources:
 * - FreeSchool (youtube.com/freeschool) — CC-friendly educational channel
 * - Nat Geo Kids (youtube.com/@NatGeoKids) — kid-safe animals & nature
 * - Kids Learning Tube — geography songs for kids
 * - SciShow Kids — science for young learners
 */
const VILLAGE_CINEMA_VIDEOS: Video[] = [
    {
        // FreeSchool — Coral Reef (Caribbean ocean life, ages 5+)
        id: 'vc-coral-reef',
        title: 'Exploring the Caribbean Coral Reef 🪸',
        thumbnail_url: 'https://img.youtube.com/vi/J2BKd5e15Jc/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=J2BKd5e15Jc',
        duration_seconds: 390,
        tier_required: 'free',
        reward_xp: 60,
    },
    {
        // Nat Geo Kids — Guess That Animal (tropical animals, ages 3+)
        id: 'vc-animals',
        title: 'Guess That Animal! 🐆 Nat Geo Kids',
        thumbnail_url: 'https://img.youtube.com/vi/rlmsS1H9Ajs/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=rlmsS1H9Ajs',
        duration_seconds: 600,
        tier_required: 'free',
        reward_xp: 50,
    },
    {
        // Kids Learning Tube — Oceans of the World song (geography, ages 4+)
        id: 'vc-oceans',
        title: 'Oceans of the World — Island Geography Song 🌊',
        thumbnail_url: 'https://img.youtube.com/vi/6AftMT3IOtc/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=6AftMT3IOtc',
        duration_seconds: 180,
        tier_required: 'free',
        reward_xp: 40,
    },
    {
        // Kids Learning Tube — Fruits & Veggies song (tropical food, ages 3+)
        id: 'vc-fruits-veggies',
        title: 'Tropical Fruits & Veggies Song 🥭🍍',
        thumbnail_url: 'https://img.youtube.com/vi/1u5HOURq7kQ/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=1u5HOURq7kQ',
        duration_seconds: 180,
        tier_required: 'free',
        reward_xp: 40,
    },
    {
        // Ackee Walk — Jamaican kids TV show ages 3-9 (Caribbean culture & community)
        id: 'vc-ackee-walk',
        title: 'Ackee Walk — Jamaican Kids Show 🇯🇲',
        thumbnail_url: 'https://img.youtube.com/vi/mZQtb-2YapY/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=mZQtb-2YapY',
        duration_seconds: 600,
        tier_required: 'free',
        reward_xp: 65,
    },
    {
        // Nat Geo Kids — Amazing Animals compilation (tropical wildlife, ages 3+)
        id: 'vc-amazing-animals',
        title: 'Amazing Animals! 🦜 Nat Geo Kids',
        thumbnail_url: 'https://img.youtube.com/vi/eUunYTYia3I/maxresdefault.jpg',
        video_url: 'https://www.youtube.com/watch?v=eUunYTYia3I',
        duration_seconds: 3600,
        tier_required: 'free',
        reward_xp: 75,
    },
];

export default function ChildPortalPage() {
    const router = useRouter();
    const {
        user,
        children,
        activeChild,
        canAccess,
        hasSuperPack,
        hasHeritageStory,
        isLoading: userLoading,
        triggerBadgeUnlock,
        unlockedBadge,
        clearUnlockedBadge,
        verifyAge,
        refreshChildren
    } = useUser();
    const [stories, setStories] = useState<Storybook[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loadingStates, setLoadingStates] = useState({
        stories: false,
        videos: false
    });
    const [contentErrors, setContentErrors] = useState({
        stories: '',
        videos: ''
    });
    const [hasLoadedStories, setHasLoadedStories] = useState(false);
    const [hasLoadedVideos, setHasLoadedVideos] = useState(false);
    const [activeSection, setActiveSection] = useState<PortalSection>('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Media States
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [isCoppaModalOpen, setIsCoppaModalOpen] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; tier?: string; feature?: string }>({ open: false });

    // Retention mechanic state
    const [streakDay, setStreakDay] = useState(0);
    const [freezeCount, setFreezeCount] = useState(0);
    const [chestReady, setChestReady] = useState(false);
    const [chestModalOpen, setChestModalOpen] = useState(false);
    const [shareCardOpen, setShareCardOpen] = useState(false);
    const [xpMultiplier, setXpMultiplier] = useState(1);
    const [giftModalOpen, setGiftModalOpen] = useState(false);
    const [todaysActivities, setTodaysActivities] = useState<PlanActivity[]>([]);
    const [isPortalIdleReady, setIsPortalIdleReady] = useState(false);
    const [authRetryElapsedMs, setAuthRetryElapsedMs] = useState(0);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
    const [todayScreenMinutes, setTodayScreenMinutes] = useState(0);

    // CRO: track how many locked items a free user has hit this session
    const [lockedHitCount, setLockedHitCount] = useState(0);
    const [featureUpgradeModal, setFeatureUpgradeModal] = useState<{
        open: boolean; featureName: string; featureDescription: string; requiredTier: string;
    }>({ open: false, featureName: '', featureDescription: '', requiredTier: 'legends_plus' });

    const fetchStories = useCallback(async () => {
        if (loadingStates.stories || hasLoadedStories) return;

        setLoadingStates((prev) => ({ ...prev, stories: true }));
        setContentErrors((prev) => ({ ...prev, stories: '' }));
        try {
            const data = await Promise.race([
                getStorybooks(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Stories request timed out.')), 12000)
                ),
            ]);
            setStories(data as Storybook[]);
        } catch (error) {
            console.error("Failed to fetch stories:", error);
            setContentErrors((prev) => ({ ...prev, stories: 'We could not load stories right now.' }));
            trackEvent('portal_stories_load_failed', { section: 'portal_stories' });
        } finally {
            setLoadingStates((prev) => ({ ...prev, stories: false }));
            setHasLoadedStories(true);
        }
    }, [hasLoadedStories, loadingStates.stories]);

    const fetchVideos = useCallback(async () => {
        if (loadingStates.videos || hasLoadedVideos) return;

        setLoadingStates((prev) => ({ ...prev, videos: true }));
        setContentErrors((prev) => ({ ...prev, videos: '' }));
        try {
            const data = await Promise.race([
                getVideos(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Lessons request timed out.')), 12000)
                ),
            ]);
            setVideos(data as unknown as Video[]);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            setContentErrors((prev) => ({ ...prev, videos: 'We could not load lessons right now.' }));
            trackEvent('portal_lessons_load_failed', { section: 'portal_lessons' });
        } finally {
            setLoadingStates((prev) => ({ ...prev, videos: false }));
            setHasLoadedVideos(true);
        }
    }, [hasLoadedVideos, loadingStates.videos]);

    // Redirect to login if not authenticated
    // FIXED: Removed auto-redirect to prevent loops with middleware
    // useEffect(() => {
    //     if (!userLoading && !user) {
    //         router.push('/login');
    //     }
    // }, [user, userLoading, router]);

    useEffect(() => {
        if (user) {
            // REDIRECT ADMINS: If they are an admin and have no children, push to admin dashboard
            // UNLESS they're in test mode (?test=true for game testing)
            const isTestMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test') === 'true';
            if (user.is_admin && (!children || children.length === 0) && !isTestMode) {
                router.push('/admin');
                return;
            }
        }
    }, [user, children, router]);

    useEffect(() => {
        let cancelled = false;
        const win = window as Window & {
            requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
            cancelIdleCallback?: (handle: number) => void;
        };
        const markReady = () => {
            if (!cancelled) {
                setIsPortalIdleReady(true);
            }
        };

        if (typeof win.requestIdleCallback === 'function') {
            const idleId = win.requestIdleCallback(() => markReady(), { timeout: 1200 });
            return () => {
                cancelled = true;
                win.cancelIdleCallback?.(idleId);
            };
        }

        const timeoutId = window.setTimeout(markReady, 250);
        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        if (!user) return;

        if (activeSection === 'stories') {
            void fetchStories();
        }

        if (activeSection === 'lessons') {
            void fetchVideos();
        }
    }, [activeSection, fetchStories, fetchVideos, user]);

    useEffect(() => {
        if (!isPortalIdleReady) return;
        if (typeof window === 'undefined') return;
        const seen = window.localStorage.getItem('ll_portal_tutorial_seen_v1');
        if (!seen) {
            setShowHelpModal(true);
            window.localStorage.setItem('ll_portal_tutorial_seen_v1', '1');
        }
    }, [isPortalIdleReady]);

    // Grace window for auth/session sync before showing fallback screen.
    useEffect(() => {
        if (userLoading || user) {
            setAuthRetryElapsedMs(0);
            return;
        }

        const interval = window.setInterval(() => {
            setAuthRetryElapsedMs((prev) => prev + 1000);
        }, 1000);

        return () => window.clearInterval(interval);
    }, [userLoading, user]);

    // Phase 1 Retention: check daily login on portal mount
    useEffect(() => {
        if (!activeChild?.id || !isPortalIdleReady) return;
        const childId = activeChild.id;

        (async () => {
            try {
                const [loginResult, freezes] = await Promise.all([
                    checkDailyLogin(childId),
                    getFreezeCount(childId),
                ]);
                setStreakDay(loginResult.streakDay);
                setFreezeCount(freezes);
                setChestReady(loginResult.chestReady);

                // Auto-open chest if it's ready and it was just created
                if (loginResult.chestReady && !loginResult.alreadyLoggedIn) {
                    setTimeout(() => setChestModalOpen(true), 1200);
                }

                // Trigger badge unlock animation if a badge was just earned
                if (loginResult.badgeUnlocked) {
                    setTimeout(() => triggerBadgeUnlock(loginResult.badgeUnlocked!), 600);
                }

                // Fetch XP Multiplier
                const mult = await getXPMultiplier();
                setXpMultiplier(mult);
            } catch (err) {
                console.error('[Retention] Daily login check failed:', err);
            }
        })();
    }, [activeChild?.id, isPortalIdleReady, triggerBadgeUnlock]);

    // Fetch active learning plan for today's activities
    useEffect(() => {
        if (!activeChild?.id || !isPortalIdleReady) return;
        (async () => {
            try {
                const res = await fetch(`/api/learning-plan?childId=${activeChild.id}`);
                if (!res.ok) return;
                const { plan } = await res.json();
                if (!plan?.plan_data?.weeks) return;

                // Determine today's activities from the plan
                const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
                const weekdayIndex = Math.max(0, dayIndex - 1); // Mon=0, Fri=4
                const week = plan.plan_data.weeks[0]; // Use week 1 for daily view
                if (week?.days?.[weekdayIndex]) {
                    setTodaysActivities(week.days[weekdayIndex].activities || []);
                }
            } catch (_e) {
                if (!res.ok) return;
                const { plan } = await res.json();
                if (!plan?.plan_data?.weeks) return;

                // Determine today's activities from the plan
                            try {
                const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
                const weekdayIndex = Math.max(0, dayIndex - 1); // Mon=0, Fri=4
                const week = plan.plan_data.weeks[0]; // Use week 1 for daily view
                if (week?.days?.[weekdayIndex]) {
                    setTodaysActivities(week.days[weekdayIndex].activities || []);
                }
            } catch (_e) {
                // silently ignore — plan is optional
            }
        })();
    }, [activeChild?.id, isPortalIdleReady]);

    const handleActivityLog = async (type: string, id: string, title?: string, xp?: number) => {
        if (!user || !activeChild) return;
        try {
            const result = await logActivity(
                user.id,
                activeChild.id,
                type,
                id,
                xp || 0,
                0,
                { title }
            ) as any;

            if (result?.unlockedBadge) {
                triggerBadgeUnlock(result.unlockedBadge);
            }

            // Ensure XP/progress counters refresh immediately after server updates.
            await refreshChildren(user.id);

        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const handleMediaComplete = async (type: 'video', id: string, xp: number) => {
        if (!user || !activeChild) return;

        try {
            await handleActivityLog(type, id, activeVideo?.title, xp);
            if (type === 'video') setActiveVideo(null);
        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const handleMissionComplete = async (xp: number, questId: string) => {
        await handleActivityLog('mission', questId, undefined, xp);
    };

    const handleLockedClick = (tier: string, featureName: string, featureDescription = '') => {
        const nextCount = lockedHitCount + 1;
        setLockedHitCount(nextCount);
        trackEvent('view_item', { item_name: featureName, item_tier: tier, locked_hit: nextCount });

        if (nextCount >= 3) {
            // After 3 locked hits, use FeatureUpgradeModal for a more targeted pitch
            setFeatureUpgradeModal({ open: true, featureName, featureDescription: featureDescription || `Upgrade to access ${featureName} and more premium content.`, requiredTier: tier });
        } else {
            setUpgradeModal({ open: true, tier, feature: featureName });
        }
    };

    const currentLevel = activeChild ? calculateLevel(activeChild.total_xp) : LEVELS[0];
    const lessonVideos = videos.length > 0 ? videos : VILLAGE_CINEMA_VIDEOS;

    const navItems = [
        { id: 'home', label: 'Village', icon: MapIcon, color: 'from-primary to-accent' },
        { id: 'stories', label: 'Stories', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
        { id: 'lessons', label: 'Lessons', icon: Video, color: 'from-indigo-500 to-purple-500' },
        { id: 'missions', label: 'Craft Corner', icon: Palette, color: 'from-amber-500 to-orange-500' },
        { id: 'games', label: 'Games', icon: Palette, color: 'from-green-500 to-emerald-500' },
        { id: 'leaderboard', label: 'Legends', icon: Trophy, color: 'from-amber-500 to-yellow-500' },
        { id: 'challenges', label: 'Challenges', icon: Crown, color: 'from-red-500 to-pink-500' },
        { id: 'printables', label: 'Printables', icon: Download, color: 'from-amber-400 to-orange-500' },
        { id: 'radio', label: 'Radio', icon: Radio, color: 'from-blue-600 to-indigo-600' },
        { id: 'music-hub', label: 'Market', icon: ShoppingBag, color: 'from-indigo-600 to-purple-700' },
        { id: 'buddy', label: 'My Buddy', icon: MessageCircle, color: 'from-emerald-500 to-teal-500' },
    ];

    const parentalControls = normalizeParentalControls((user as any)?.parental_controls);

    const sectionAllowed = (section: string) => {
        if (section === 'stories') return parentalControls.allow_stories;
        if (section === 'lessons') return parentalControls.allow_lessons;
        if (section === 'games') return parentalControls.allow_games;
        if (section === 'radio') return parentalControls.allow_radio;
        if (section === 'buddy') return parentalControls.allow_buddy;
        return true;
    };

    const screenTimeExceeded = todayScreenMinutes >= parentalControls.daily_screen_time_minutes;

    useEffect(() => {
        if (!activeChild?.id) return;
        setTodayScreenMinutes(getTodayScreenMinutes(activeChild.id));
        const timer = window.setInterval(() => {
            if (screenTimeExceeded) return;
            const next = addScreenMinute(activeChild.id);
            setTodayScreenMinutes(next);
        }, 60000);
        return () => window.clearInterval(timer);
    }, [activeChild?.id, screenTimeExceeded]);

    useEffect(() => {
        if (screenTimeExceeded && activeSection !== 'home') {
            setActiveSection('home');
            setBlockedMessage('Daily screen-time limit reached. Ask your parent to adjust controls.');
        }
    }, [screenTimeExceeded, activeSection]);

    // Show loading while checking auth
    if (userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100">
                <div className="text-center">
                    <div className="text-6xl animate-bounce mb-4">✨</div>
                    <p className="text-2xl font-black text-primary">Loading your adventure...</p>
                </div>
            </div>
        );
    }

    // Don't render content if not authenticated (show error UI instead of redirect loop)
    if (!user && authRetryElapsedMs < 6000) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-4 border-white">
                    <div className="text-6xl animate-bounce mb-4">🏝️</div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Connecting to Island...</h2>
                    <p className="text-slate-500 font-bold mb-6 leading-relaxed">
                        Hold tight while we sync your adventure.
                    </p>
                    <button
                        onClick={() => {
                            trackEvent('portal_auth_retry_clicked');
                            window.location.reload();
                        }}
                        className="w-full bg-[#3ABEF9] text-white px-6 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-purple-50 to-pink-100 p-6">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border-4 border-white">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-pulse">
                        🥥
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Connecting to Island...</h2>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        We're having a little trouble syncing your journey. Give it a refresh!
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-[#3ABEF9] text-white px-6 py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-200"
                        >
                            Refresh Portal
                        </button>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-slate-100 text-slate-400 px-6 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 hover:text-slate-600 transition-all"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#F0F9FF] font-heading overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

            {/* Mobile Header */}
            <header className="lg:hidden absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-30 bg-white/80 backdrop-blur-md border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        title="Open menu"
                        aria-label="Open menu"
                        className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-black text-primary leading-none">Likkle Legends</h1>
                </div>

                {activeChild && (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{currentLevel.icon}</span>
                        <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                            <p className="text-[10px] font-black text-primary leading-none uppercase pt-0.5">{activeChild.total_xp.toLocaleString()} XP</p>
                        </div>
                    </div>
                )}
            </header>

            {/* Top Desktop Header - Overlay Style */}
            <header className="fixed top-0 left-0 lg:left-[280px] right-0 z-40 h-24 bg-white/40 backdrop-blur-xl border-b border-white/20 px-8 hidden lg:flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-white/50 px-6 py-2 rounded-2xl border border-white/50 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Channel
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Teacher VIP Indicator */}
                    {(user?.role === 'teacher' || user?.is_admin) && (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2.5 rounded-2xl border border-amber-100 font-black text-xs uppercase tracking-widest animate-pulse">
                            <BadgeCheck size={18} /> Teacher VIP
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white/80 p-1.5 pr-6 rounded-[1.5rem] border border-white/50 shadow-md">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                            {activeChild?.first_name?.charAt(0) || 'L'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">XP Level</span>
                            <span className="text-sm font-black text-slate-900 leading-none">{activeChild?.total_xp.toLocaleString()}</span>
                        </div>
                    </div>

                    {activeChild && (
                        <button
                            onClick={() => setGiftModalOpen(true)}
                            className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center hover:bg-amber-100 hover:scale-105 transition-all shadow-md shadow-amber-100/50"
                            title="Gift a Mango"
                        >
                            <Gift size={22} fill="currentColor" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex h-screen overflow-hidden">
                {/* Character Sidebar (Desktop & Mobile Drawer) */}
                <aside className={`
                    fixed inset-y-0 left-0 z-50 w-[280px] bg-[#3ABEF9] translate-x-[-100%] transition-transform duration-500 ease-spring lg:relative lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_60px_rgba(0,0,0,0.1)]' : ''}
                    flex flex-col items-center justify-start py-12 overflow-y-auto overflow-x-hidden
                `}>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        title="Close menu"
                        aria-label="Close menu"
                        className="lg:hidden absolute top-8 right-6 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-full px-8 mb-12">
                        <h1 className="text-white text-3xl font-black leading-tight drop-shadow-md">
                            Likkle<br />Legends
                        </h1>
                        <p className="text-[#075985] font-black uppercase tracking-[0.2em] text-[10px] mt-1">Kid Portal</p>
                    </div>

                    {/* Tanty Spice Character */}
                    <div className="relative w-32 h-32 mb-6 group shrink-0">
                        <Image
                            src="/images/tanty_spice_avatar.jpg"
                            alt="Tanty Spice"
                            fill
                            className="object-cover object-top scale-110 group-hover:scale-125 transition-transform duration-700 rounded-full border-4 border-white/20 shadow-2xl"
                        />
                    </div>

                    <div className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 text-white font-black text-xs shadow-lg mb-8">
                        Bless up, Legend! 👋
                    </div>

                    {/* Navigation Items */}
                    <div className="w-full px-6 space-y-2 flex-1 overflow-y-auto pb-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (!sectionAllowed(item.id as PortalSection) || screenTimeExceeded) {
                                            setBlockedMessage('This channel is currently locked by parent controls.');
                                            return;
                                        }
                                        if (item.id === 'games') {
                                            router.push('/portal/games');
                                        } else if (item.id === 'music-hub') {
                                            router.push('/portal/music');
                                        } else if (item.id === 'buddy') {
                                            router.push('/portal/buddy');
                                        } else {
                                            setActiveSection(item.id as PortalSection);
                                            setIsSidebarOpen(false); // Close on mobile
                                        }
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all group ${isActive
                                        ? 'bg-white text-[#3ABEF9] shadow-xl scale-105'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? 'text-[#3ABEF9]' : 'text-white/50 group-hover:text-white'} />
                                    {item.label}
                                </button>
                            );
                        })}

                        {/* Admin Link */}
                        {(user?.is_admin) && (
                            <button
                                onClick={() => router.push('/admin')}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 transition-all group mt-2 border border-amber-500/20"
                            >
                                <LayoutDashboard size={20} className="text-amber-500" />
                                Admin Island
                            </button>
                        )}
                    </div>

                    <div className="w-full px-6 mt-auto space-y-2">
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                        >
                            <Info size={20} className="text-white/60" />
                            Help & Tutorial
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-white/70 hover:text-white hover:bg-red-500/20 transition-all group mt-8 border border-white/10 hover:border-white/30"
                        >
                            <LogOut size={20} className="text-white/50 group-hover:text-white" />
                            Exit Portal
                        </button>
                    </div>

                    {/* Tropical elements deco */}
                    <div className="absolute top-[40%] right-[-20px] opacity-10 rotate-12 text-6xl pointer-events-none">🌴</div>
                    <div className="absolute bottom-[10%] left-[-20px] opacity-10 -rotate-12 text-6xl pointer-events-none">🌺</div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Viewport */}
                <main className="flex-1 relative overflow-y-auto pt-24 lg:pt-16 px-6 lg:px-12 pb-32 lg:pb-24">
                    {/* CRO: Free / Trial upgrade banner — spans full width */}
                    <div className="-mx-6 lg:-mx-12 -mt-24 lg:-mt-16 mb-4 sticky top-0 z-20">
                        <FreeTierBanner />
                    </div>
                    {/* Streak Widget (Desktop) */}
                    <div className="hidden lg:flex items-center gap-4">
                        {activeChild && (
                            <div className="bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 border-2 border-primary/10">
                                <span className="text-2xl animate-float">{currentLevel.icon}</span>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 leading-none">LEVEL {currentLevel.level}</p>
                                    <p className="text-xl font-black text-primary tracking-tight">{activeChild.total_xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                        )}
                        {/* Chest button */}
                        <button
                            onClick={() => setChestModalOpen(true)}
                            className="relative w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl flex items-center justify-center text-white hover:scale-110 transition-all"
                            title="Daily Reward Chest"
                        >
                            <Gift size={26} fill="currentColor" />
                            {chestReady && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </button>
                    </div>

                    {activeSection === 'home' ? (
                        <div className="h-full flex flex-col justify-center max-w-5xl mx-auto space-y-8">
                            {/* Streak Widget — visible on mobile and desktop */}
                            {activeChild && streakDay > 0 && (
                                <div className="lg:max-w-md">
                                    {isPortalIdleReady ? (
                                        <StreakWidget
                                            streakDay={streakDay}
                                            freezeCount={freezeCount}
                                            childId={activeChild.id}
                                            onFreezeUsed={() => setFreezeCount(c => Math.max(0, c - 1))}
                                            onShare={() => setShareCardOpen(true)}
                                        />
                                    ) : (
                                        <StreakWidgetSkeleton />
                                    )}
                                </div>
                            )}
                            {/* Today's Learning Plan */}
                            {todaysActivities.length > 0 && (
                                <div className="bg-white rounded-3xl border-2 border-primary/10 p-5 shadow-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-black text-lg text-gray-800 leading-tight">Today's Learning</h3>
                                            <p className="text-xs text-gray-400 font-medium">Your personalised plan for today</p>
                                        </div>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            {todaysActivities.length} activities
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {todaysActivities.slice(0, 3).map((activity, i) => (
                                            <TodaysPlanCard
                                                key={i}
                                                activity={activity}
                                                index={i}
                                                onStart={(a) => {
                                                    const sectionMap: Record<string, string> = {
                                                        lesson_micro: 'lessons', quiz_micro: 'missions',
                                                        story_short: 'stories', song_video_script: 'radio',
                                                        printable: 'printables', game: 'games',
                                                    };
                                                    setActiveSection((sectionMap[a.type] || 'home') as PortalSection);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white rounded-3xl border-2 border-slate-100 p-5 shadow-md">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-black text-lg text-gray-800 leading-tight">Parent Controls</h3>
                                        <p className="text-xs text-gray-400 font-medium">Screen-time limits, content filters, and parent settings.</p>
                                    </div>
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        Parent Zone
                                    </span>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/parent')}
                                        className="w-full rounded-2xl bg-slate-900 text-white py-3 font-black text-sm"
                                    >
                                        Open Parent Dashboard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/portal/settings')}
                                        className="w-full rounded-2xl border border-slate-200 text-slate-700 py-3 font-black text-sm"
                                    >
                                        Parent Controls
                                    </button>
                                </div>
                            </div>

                            {(hasSuperPack || hasHeritageStory) && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="text-amber-500" size={20} />
                                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-amber-600">Your Digital Treasures</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {hasSuperPack && (
                                            <button
                                                onClick={() => setActiveSection('printables')}
                                                className="group bg-gradient-to-br from-amber-400 to-orange-500 p-6 rounded-[2rem] shadow-xl hover:scale-105 transition-all text-left relative overflow-hidden"
                                            >
                                                <div className="relative z-10 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🖍️</div>
                                                    <div>
                                                        <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tight">Activity Super-Pack</h4>
                                                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-0.5">50+ Printing Adventures UNLOCKED</p>
                                                    </div>
                                                </div>
                                                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:scale-125 transition-transform duration-500">🎨</div>
                                            </button>
                                        )}
                                        {hasHeritageStory && (
                                            <button
                                                onClick={() => router.push('/portal/story-studio')}
                                                className="group bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2rem] shadow-xl hover:scale-105 transition-all text-left relative overflow-hidden"
                                            >
                                                <div className="relative z-10 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
                                                    <div>
                                                        <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tight">Heritage DNA Story</h4>
                                                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-0.5">Start Your Custom Family Quest</p>
                                                    </div>
                                                </div>
                                                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:scale-125 transition-transform duration-500">🧬</div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h2 className="text-5xl md:text-6xl font-black text-[#083344] tracking-tight">
                                    Choose Your <span className="text-[#3ABEF9]">Next Step</span>
                                </h2>
                                <p className="text-xl text-gray-500 font-medium italic underline decoration-[#3ABEF9]/30 underline-offset-8">
                                    Where shall we go today, Little Legend?
                                </p>
                                {blockedMessage && (
                                    <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                                        {blockedMessage}
                                    </div>
                                )}
                                <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600">
                                    Screen Time: {todayScreenMinutes}/{parentalControls.daily_screen_time_minutes} min today
                                </div>
                            </div>

                            <div className="w-full h-full min-h-[500px] flex items-center justify-center">
                                {isPortalIdleReady ? (
                                    <IslandVillageMap
                                        onNavigate={(section) => {
                                            if (section === 'story-studio') {
                                                // Restricted feature - check COPPA
                                                if (user?.age_verified_at || activeChild?.age_verified) {
                                                    router.push('/portal/story-studio');
                                                } else {
                                                    setPendingRoute('/portal/story-studio');
                                                    setIsCoppaModalOpen(true);
                                                }
                                            } else {
                                                if (!sectionAllowed(section as PortalSection) || screenTimeExceeded) {
                                                    setBlockedMessage('This channel is currently locked by parent controls.');
                                                    return;
                                                }
                                                setActiveSection(section as PortalSection);
                                            }
                                        }}
                                    />
                                ) : (
                                    <IslandVillageMapSkeleton />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-5">
                            {blockedMessage && (
                                <div className="mb-6 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                                    {blockedMessage}
                                </div>
                            )}
                            {screenTimeExceeded && (
                                <div className="rounded-[2.5rem] bg-white border border-red-100 p-8 shadow-lg text-center max-w-2xl mx-auto">
                                    <h3 className="text-3xl font-black text-slate-800 mb-2">Screen-Time Limit Reached</h3>
                                    <p className="text-slate-500 font-semibold mb-5">Your parent set a daily limit of {parentalControls.daily_screen_time_minutes} minutes.</p>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/portal/settings')}
                                        className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black"
                                    >
                                        Parent Controls
                                    </button>
                                </div>
                            )}
                            {/* Content of sub-sections (Stories, Songs, etc) */}

                            {/* Stories Section */}
                            {(activeSection === 'stories') && !screenTimeExceeded && sectionAllowed('stories') && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                                    <CharacterGuideBanner
                                        character="tanty_spice"
                                        message="Come nuh, sit down wid me! Tanty has the most beautiful island stories to share."
                                    />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4 sm:gap-5">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-2xl sm:text-4xl shadow-inner italic">📖</div>
                                            <div>
                                                <h2 className="text-2xl sm:text-4xl font-black text-blue-900 tracking-tight">Island Stories</h2>
                                                <p className="text-blue-700/60 font-bold uppercase text-[10px] sm:text-xs tracking-widest">Tales from across the Caribbean</p>
                                            </div>
                                        </div>
                                    </div>

                                    {loadingStates.stories || !hasLoadedStories ? (
                                        <GridSkeleton count={4} type="card" />
                                    ) : contentErrors.stories ? (
                                        <div className="col-span-full bg-white rounded-[2.5rem] p-8 shadow-lg border-2 border-blue-100 text-center">
                                            <h3 className="text-2xl font-black text-blue-900 mb-2">Story shelf is resting</h3>
                                            <p className="text-blue-700/70 font-medium mb-6">{contentErrors.stories}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHasLoadedStories(false);
                                                    trackEvent('portal_stories_retry_clicked');
                                                    void fetchStories();
                                                }}
                                                className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    ) : stories.length === 0 ? (
                                        <div className="col-span-full">
                                            <EmptyState
                                                icon="📖"
                                                title="The Library is Growing"
                                                message="Tanty is still writing our first legends. Check back soon for stories from across the islands!"
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                                            {stories.map((story) => {
                                                const isLocked = !canAccess(story.tier_required);
                                                return (
                                                    <Link
                                                        key={story.id}
                                                        href={isLocked ? '#' : `/portal/stories/${story.id}`}
                                                        onClick={isLocked ? (e) => { e.preventDefault(); handleLockedClick(story.tier_required, story.title, 'Read this story and explore the full library of island tales.'); } : undefined}
                                                        className={`bg-white rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-5 shadow-lg sm:shadow-xl hover:shadow-2xl transition-all group border-2 sm:border-4 border-transparent hover:border-blue-100 relative ${isLocked ? 'cursor-pointer opacity-80' : ''}`}
                                                    >
                                                        <div className="relative aspect-[3/4] bg-blue-50 rounded-[1.5rem] sm:rounded-[2.5rem] mb-4 sm:mx-0 overflow-hidden">
                                                            {story.cover_image_url ? (
                                                                <Image
                                                                    src={story.cover_image_url}
                                                                    alt={story.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">📚</div>
                                                            )}
                                                            {isLocked && (
                                                                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-2xl">
                                                                        <Lock size={40} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-xl font-black text-blue-900 mb-2 truncate px-2">{story.title}</h3>
                                                        <div className="flex items-center justify-between px-2">
                                                            <span className="text-xs font-black text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">{story.reading_time_minutes} MINS</span>
                                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:bg-accent transition-colors">
                                                                <Play size={16} fill="white" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Lessons Section */}
                            {(activeSection === 'lessons') && !screenTimeExceeded && sectionAllowed('lessons') && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                                    <CharacterGuideBanner
                                        character="roti"
                                        message="Brains on — sunshine mode! R.O.T.I. is here to guide your lesson today."
                                    />
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🎥</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-blue-900 tracking-tight">Village Cinema</h2>
                                            <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Learn traditions through film</p>
                                        </div>
                                    </div>

                                    {loadingStates.videos && !hasLoadedVideos && (
                                        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm font-bold text-indigo-700">
                                            Loading the latest Village Cinema picks. Showing ready-to-watch lessons now.
                                        </div>
                                    )}

                                    {contentErrors.videos && (
                                        <div className="rounded-3xl border-2 border-indigo-100 bg-white px-6 py-5 text-center">
                                            <h3 className="text-2xl font-black text-blue-900 mb-2">Lesson library is warming up</h3>
                                            <p className="text-blue-700/70 font-medium mb-5">{contentErrors.videos}</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHasLoadedVideos(false);
                                                    trackEvent('portal_lessons_retry_clicked');
                                                    void fetchVideos();
                                                }}
                                                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {lessonVideos.map((video) => {
                                                const isLocked = !canAccess(video.tier_required);
                                                const durationMinutes = Math.max(1, Math.round(((video.duration_seconds || 300) / 60)));
                                                return (
                                                    <button
                                                        type="button"
                                                        key={video.id}
                                                        onClick={() => isLocked ? handleLockedClick(video.tier_required, video.title, 'Watch this lesson and unlock all Village Cinema videos.') : setActiveVideo(video)}
                                                        className={`bg-white rounded-[3.5rem] p-6 shadow-xl hover:shadow-2xl transition-all group border-4 border-transparent hover:border-indigo-100 text-left ${isLocked ? 'opacity-80 cursor-pointer' : ''}`}
                                                    >
                                                        <div className="relative aspect-video bg-indigo-50 rounded-[2.5rem] mb-6 overflow-hidden shadow-inner">
                                                            {video.thumbnail_url ? (
                                                                <Image
                                                                    src={video.thumbnail_url}
                                                                    alt={video.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-7xl opacity-10">🎥</div>
                                                            )}

                                                            {!isLocked && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                                                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                                                                        <Play className="text-indigo-600 ml-1" size={40} fill="currentColor" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {isLocked && (
                                                                <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[2px] flex items-center justify-center">
                                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-900 shadow-2xl">
                                                                        <Lock size={32} />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest">
                                                                {durationMinutes}:00
                                                            </div>
                                                        </div>
                                                        <h3 className="text-2xl font-black text-blue-900 mb-2 truncate px-2">{video.title}</h3>
                                                        <div className="flex items-center gap-3 px-2">
                                                            <Sparkles className="text-yellow-500" size={18} />
                                                            <span className="text-indigo-600 font-black uppercase text-xs">Earn +{video.reward_xp || 50} XP</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                </section>
                            )}

                            {/* Craft Corner */}
                            {(activeSection === 'missions') && (
                                <CraftCorner
                                    completedIds={activeChild?.cultural_milestones || []}
                                    onComplete={(xp, craftId) => handleMissionComplete(xp, craftId)}
                                />
                            )}

                            {(activeSection === 'leaderboard') && (
                                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-16 h-16 bg-amber-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">🏆</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-blue-900 tracking-tight">Legends Leaderboard</h2>
                                            <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Climb to the top across the islands</p>
                                        </div>
                                    </div>
                                    <LeaderboardPanel />
                                </div>
                            )}

                            {(activeSection === 'challenges') && (
                                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="w-16 h-16 bg-pink-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner">⚔️</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-blue-900 tracking-tight">Family Challenges</h2>
                                            <p className="text-blue-700/60 font-bold uppercase text-xs tracking-widest">Team up and compete together</p>
                                        </div>
                                    </div>
                                    <FamilyChallengesPanel />
                                </div>
                            )}

                            {(activeSection === 'printables') && (
                                <div className="max-w-6xl mx-auto space-y-10 pb-12">
                                    <CharacterGuideBanner
                                        character="benny"
                                        message="Shhh... Benny has special worksheets just for you. Grab your crayons, let's explore quietly."
                                    />
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-16 h-16 bg-amber-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-amber-200">🖨️</div>
                                        <div>
                                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Print & Play</h2>
                                            <p className="text-amber-600/60 font-bold uppercase text-xs tracking-widest">Caribbean Activity Sheets</p>
                                        </div>
                                    </div>
                                    <PrintablesSection />
                                </div>
                            )}

                            {(activeSection === 'radio') && !screenTimeExceeded && sectionAllowed('radio') && (
                                <div className="max-w-4xl mx-auto space-y-12">
                                    <div className="flex items-center gap-5 text-center justify-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl animate-pulse">📻</div>
                                        <div className="text-left">
                                            <h2 className="text-5xl font-black text-blue-900 tracking-tighter">Heritage Radio</h2>
                                            <p className="text-orange-600 font-black uppercase tracking-[0.3em] text-[10px]">Live from Likkle Legends Island</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-[5rem] p-1 shadow-2xl border-8 border-orange-50 overflow-hidden">
                                        <TantyRadio featuredTracks={RADIO_TRACKS} defaultChannel="roti" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Premium Media Players */}
            {activeVideo && (
                <PremiumVideoPlayer
                    video={activeVideo}
                    onClose={() => setActiveVideo(null)}
                    onComplete={(xp) => handleMediaComplete('video', activeVideo.id, xp)}
                />
            )}

            {/* Badge Unlock Celebration */}
            {unlockedBadge && (
                <BadgeUnlockModal
                    badge={unlockedBadge}
                    onClose={() => clearUnlockedBadge()}
                />
            )}

            {isCoppaModalOpen && (
                <CoppaConsentModal
                    isOpen={isCoppaModalOpen}
                    onClose={() => setIsCoppaModalOpen(false)}
                    onSuccess={async () => {
                        const success = await verifyAge();
                        if (success) {
                            setIsCoppaModalOpen(false);
                            if (pendingRoute) {
                                router.push(pendingRoute);
                                setPendingRoute(null);
                            }
                        }
                    }}
                />
            )}

            {/* Standard Upgrade Modal (first 2 locked hits) */}
            {upgradeModal.open && (
                <UpgradeModal
                    isOpen={upgradeModal.open}
                    onClose={() => setUpgradeModal({ open: false })}
                    requiredTier={upgradeModal.tier}
                    featureName={upgradeModal.feature}
                />
            )}

            {/* Feature-Specific Upgrade Modal (shown after 3+ locked hits) */}
            {featureUpgradeModal.open && (
                <FeatureUpgradeModal
                    isOpen={featureUpgradeModal.open}
                    onClose={() => setFeatureUpgradeModal({ open: false, featureName: '', featureDescription: '', requiredTier: 'legends_plus' })}
                    featureName={featureUpgradeModal.featureName}
                    featureDescription={featureUpgradeModal.featureDescription}
                    currentTier={(user?.subscription_tier || 'free') as import('@/lib/feature-access').SubscriptionTier}
                    requiredTier={(featureUpgradeModal.requiredTier || 'legends_plus') as import('@/lib/feature-access').SubscriptionTier}
                />
            )}

            {/* Daily Chest Modal */}
            {chestModalOpen && activeChild && (
                <DailyChestModal
                    childId={activeChild.id}
                    chestReady={chestReady}
                    onClose={() => setChestModalOpen(false)}
                    onRewardClaimed={(type) => {
                        setChestReady(false);
                        if (type === 'xp') {
                            // Refresh XP display via reload
                            window.location.reload();
                        }
                    }}
                />
            )}

            {/* Streak Share Card Modal */}
            {shareCardOpen && activeChild && (
                <StreakShareCard
                    childId={activeChild.id}
                    streakDay={streakDay}
                    onClose={() => setShareCardOpen(false)}
                />
            )}

            {giftModalOpen && activeChild && (
                <MangoGiftModal
                    senderId={activeChild.id}
                    friends={children?.filter(c => c.id !== activeChild.id) || []}
                    onClose={() => setGiftModalOpen(false)}
                    onGiftSent={() => window.location.reload()}
                />
            )}

            {xpMultiplier > 1 && (
                <DoubleXPBanner
                    multiplier={xpMultiplier}
                    isVisible={xpMultiplier > 1}
                />
            )}

            {showHelpModal && (
                <div className="fixed inset-0 z-[300] bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl border-4 border-white">
                        <h3 className="text-2xl font-black text-slate-800">How To Use The Island</h3>
                        <p className="text-slate-500 font-medium mt-2">Quick guide for first-time legends.</p>
                        <ol className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
                            <li>1. Tap a channel in the left menu: Stories, Lessons, Craft Corner, Games, or Radio.</li>
                            <li>2. Complete activities to earn XP and unlock progress.</li>
                            <li>3. Use "Help & Tutorial" anytime from the sidebar if you get stuck.</li>
                        </ol>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(false)}
                                className="flex-1 rounded-2xl bg-slate-900 text-white py-3 font-black"
                            >
                                Start Adventure
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowHelpModal(false); setActiveSection('home'); }}
                                className="flex-1 rounded-2xl border border-slate-200 text-slate-700 py-3 font-black"
                            >
                                Back To Village
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Skeleton component for grid items
function GridSkeleton({ count = 4, type = 'card' }: { count?: number, type?: 'card' | 'circle' }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-6 shadow-md animate-pulse border-2 border-transparent">
                    {type === 'card' ? (
                        <div className="aspect-[3/4] bg-gray-100 rounded-[1.5rem] sm:rounded-[2.5rem] mb-4"></div>
                    ) : (
                        <div className="aspect-square bg-gray-100 rounded-full mb-4 sm:mb-6"></div>
                    )}
                    <div className="h-6 bg-gray-100 rounded-full w-3/4 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-50 rounded-full w-1/2 mx-auto"></div>
                </div>
            ))}
        </div>
    );
}

function IslandVillageMapSkeleton() {
    return (
        <div className="relative w-full h-[600px] md:h-auto md:aspect-[16/9] rounded-[2rem] md:rounded-[3rem] border-4 border-white/20 bg-gradient-to-br from-sky-300 via-sky-400 to-cyan-500 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_white,_transparent_55%)]" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-8 p-10">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="self-center justify-self-center w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/35 animate-pulse"
                    />
                ))}
            </div>
        </div>
    );
}

function StreakWidgetSkeleton() {
    return (
        <div className="rounded-3xl p-5 bg-gradient-to-br from-orange-500 to-red-500 shadow-xl shadow-orange-500/20 animate-pulse">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/25" />
                    <div className="space-y-2">
                        <div className="h-3 w-20 rounded-full bg-white/25" />
                        <div className="h-8 w-12 rounded-full bg-white/35" />
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="w-4 h-4 rounded-full bg-white/25" />
                    ))}
                </div>
                <div className="flex gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/20" />
                    <div className="w-12 h-12 rounded-2xl bg-white/20" />
                </div>
            </div>
        </div>
    );
}
