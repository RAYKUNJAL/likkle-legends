"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    AdminLayout, RefreshCw, CheckCircle2, Plus,
    Calendar, BookOpen, Music, Download, Video, Sparkles, Zap
} from '@/components/admin/AdminComponents';

interface ScheduledContent {
    id: string;
    title: string;
    content_type: string;
    island_id: string;
    age_group: string;
    scheduled_date: string;
    status: 'scheduled' | 'generating' | 'pending_review' | 'published' | 'failed';
    generated_content_id?: string;
    created_at: string;
}

const CONTENT_TYPE_ICONS: Record<string, typeof BookOpen> = {
    'story_bedtime': BookOpen,
    'song_video_script': Music,
    'printable': Download,
    'video_script': Video,
    'monthly_drop_bundle': Sparkles,
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContentCalendarPage() {
    const [schedule, setSchedule] = useState<ScheduledContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const loadSchedule = useCallback(async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');

            // Get start and end of current month view
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            const { data, error } = await supabase
                .from('content_schedule')
                .select('*')
                .gte('scheduled_date', startOfMonth.toISOString())
                .lte('scheduled_date', endOfMonth.toISOString())
                .order('scheduled_date', { ascending: true });

            if (error) {
                console.warn('content_schedule table may not exist:', error.message);
                setSchedule([]);
            } else {
                setSchedule(data || []);
            }
        } catch (error) {
            console.error('Failed to load schedule:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        loadSchedule();
    }, [loadSchedule]);

    const generateWeekOfContent = async () => {
        setIsBatchGenerating(true);
        const { toast } = await import('react-hot-toast');
        const toastId = toast.loading('Generating a week of content...');

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();

            const token = session?.access_token || 'BYPASS_FOR_TESTING';

            // Themes for the week
            const weeklyThemes = [
                { topic: 'Caribbean sea creatures and ocean life', ageGroup: 'mini' as const },
                { topic: 'Traditional Caribbean music and dance', ageGroup: 'big' as const },
                { topic: 'Island fruits and healthy eating', ageGroup: 'mini' as const },
                { topic: 'Caribbean folktales and legends', ageGroup: 'big' as const },
                { topic: 'Beach safety and water play', ageGroup: 'mini' as const },
            ];

            // Generate content for next 5 weekdays
            const today = new Date();
            let successCount = 0;

            for (let i = 0; i < weeklyThemes.length; i++) {
                const theme = weeklyThemes[i];
                const scheduledDate = new Date(today);
                scheduledDate.setDate(today.getDate() + i + 1);

                // Skip weekends
                while (scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6) {
                    scheduledDate.setDate(scheduledDate.getDate() + 1);
                }

                try {
                    // Insert scheduled item first
                    const { data: scheduleItem, error: insertError } = await supabase
                        .from('content_schedule')
                        .insert({
                            title: theme.topic,
                            content_type: 'monthly_drop_bundle',
                            island_id: 'TT',
                            age_group: theme.ageGroup,
                            scheduled_date: scheduledDate.toISOString(),
                            status: 'scheduled'
                        })
                        .select()
                        .single();

                    if (!insertError && scheduleItem) {
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to schedule day ${i + 1}:`, err);
                }
            }

            toast.success(`Scheduled ${successCount} content packages!`, { id: toastId });
            loadSchedule();
        } catch (error: any) {
            toast.error('Batch scheduling failed: ' + error.message, { id: toastId });
        } finally {
            setIsBatchGenerating(false);
        }
    };

    const generateScheduledItem = async (item: ScheduledContent) => {
        const { toast } = await import('react-hot-toast');
        const toastId = toast.loading(`Generating "${item.title}"...`);

        try {
            const { supabase } = await import('@/lib/storage');

            // Update status to generating
            await supabase
                .from('content_schedule')
                .update({ status: 'generating' })
                .eq('id', item.id);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || 'BYPASS_FOR_TESTING';

            // Call the agent
            const { runAgentGeneration } = await import('@/app/actions/island-brain');
            const result = await runAgentGeneration(
                token,
                'monthly_drop_bundle',
                item.title,
                item.island_id,
                { age_group: item.age_group }
            );

            if (result.success) {
                await supabase
                    .from('content_schedule')
                    .update({
                        status: 'pending_review',
                        generated_content_id: result.content?.content_id
                    })
                    .eq('id', item.id);

                toast.success('Content generated! Review in AI Queue.', { id: toastId });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            const { supabase } = await import('@/lib/storage');
            await supabase
                .from('content_schedule')
                .update({ status: 'failed' })
                .eq('id', item.id);

            toast.error('Generation failed: ' + error.message, { id: toastId });
        }

        loadSchedule();
    };

    // Calendar helper functions
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: Date[] = [];

        // Add padding for days before first of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const padDate = new Date(year, month, -i);
            days.unshift(padDate);
        }

        // Add all days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    };

    const getContentForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedule.filter(s => s.scheduled_date.split('T')[0] === dateStr);
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <AdminLayout activeSection="auto-content">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Calendar className="text-primary" />
                            Content Calendar
                        </h1>
                        <p className="text-gray-500">Schedule and manage AI-generated content</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => loadSchedule()}
                            aria-label="Refresh schedule"
                            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={generateWeekOfContent}
                            disabled={isBatchGenerating}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isBatchGenerating ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Generate Week
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
                    >
                        ← Previous
                    </button>
                    <h2 className="text-2xl font-black text-gray-900">
                        {formatMonthYear(currentMonth)}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50"
                    >
                        Next →
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="p-4 text-center font-bold text-gray-500 text-sm">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                        {getDaysInMonth(currentMonth).map((date, idx) => {
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                            const isToday = date.toDateString() === new Date().toDateString();
                            const content = getContentForDate(date);

                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[120px] border-b border-r border-gray-100 p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                        } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
                                >
                                    <div className={`text-sm font-bold mb-2 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {date.getDate()}
                                    </div>
                                    <div className="space-y-1">
                                        {content.map(item => {
                                            const Icon = CONTENT_TYPE_ICONS[item.content_type] || Sparkles;
                                            const statusColors: Record<string, string> = {
                                                'scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
                                                'generating': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                                'pending_review': 'bg-amber-100 text-amber-700 border-amber-200',
                                                'published': 'bg-green-100 text-green-700 border-green-200',
                                                'failed': 'bg-red-100 text-red-700 border-red-200',
                                            };

                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (item.status === 'scheduled') {
                                                            generateScheduledItem(item);
                                                        }
                                                    }}
                                                    className={`w-full p-2 rounded-lg border text-left text-xs transition-all hover:scale-[1.02] ${statusColors[item.status]}`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <Icon size={12} />
                                                        <span className="font-bold truncate">{item.age_group}</span>
                                                    </div>
                                                    <div className="truncate mt-0.5 opacity-80">{item.title.slice(0, 20)}...</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center gap-4 justify-center">
                    {[
                        { status: 'Scheduled', color: 'bg-blue-100 border-blue-200' },
                        { status: 'Generating', color: 'bg-yellow-100 border-yellow-200' },
                        { status: 'Pending Review', color: 'bg-amber-100 border-amber-200' },
                        { status: 'Published', color: 'bg-green-100 border-green-200' },
                        { status: 'Failed', color: 'bg-red-100 border-red-200' },
                    ].map(({ status, color }) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${color}`} />
                            <span className="text-xs font-bold text-gray-500">{status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
