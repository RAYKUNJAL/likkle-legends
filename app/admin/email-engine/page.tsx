"use client";

import { useState, useEffect } from 'react';
import { AdminLayout, RefreshCw } from '@/components/admin/AdminComponents';
import {
    Save, Mail, Send, CheckCircle, XCircle, Clock,
    TrendingUp, Users, Zap, BarChart3, Play, Pause
} from 'lucide-react';

interface QueueStats {
    pending: number;
    sent_today: number;
    failed_today: number;
}

interface CampaignSettings {
    welcome_sequence_enabled: boolean;
    abandoned_checkout_enabled: boolean;
    win_back_enabled: boolean;
}

export default function AdminEmailEnginePage() {
    const [stats, setStats] = useState<QueueStats>({ pending: 0, sent_today: 0, failed_today: 0 });
    const [campaigns, setCampaigns] = useState<CampaignSettings>({
        welcome_sequence_enabled: true,
        abandoned_checkout_enabled: true,
        win_back_enabled: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastRun, setLastRun] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');

            // Get queue stats
            const today = new Date().toISOString().split('T')[0];

            const { count: pending } = await supabase
                .from('email_queue')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            const { count: sentToday } = await supabase
                .from('email_queue')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'sent')
                .gte('sent_at', today);

            const { count: failedToday } = await supabase
                .from('email_queue')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'failed')
                .gte('created_at', today);

            setStats({
                pending: pending || 0,
                sent_today: sentToday || 0,
                failed_today: failedToday || 0
            });

            // Get campaign settings
            const { data: settings } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'email_campaigns')
                .single();

            if (settings?.value) {
                setCampaigns(settings.value);
            }

        } catch (error) {
            console.error('Failed to load email engine data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const processQueue = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/cron/process-emails', { method: 'POST' });
            const result = await response.json();
            setLastRun(`Processed ${result.processed} emails, ${result.errors} failed`);
            await loadData();
        } catch (error) {
            console.error('Failed to process queue:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleCampaign = async (key: keyof CampaignSettings) => {
        const newCampaigns = { ...campaigns, [key]: !campaigns[key] };
        setCampaigns(newCampaigns);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { saveContentAction } = await import('@/app/actions/cms');
                await saveContentAction(session.access_token, 'email_campaigns', newCampaigns);
            }
        } catch (error) {
            console.error('Failed to save campaign settings:', error);
            // Revert on error if needed
        }
    };

    return (
        <AdminLayout activeSection="email-engine">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Zap className="text-primary" />
                            Legend Growth Agent
                        </h1>
                        <p className="text-gray-500">AI-powered email marketing & automation</p>
                    </div>
                    <button
                        onClick={processQueue}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                        Process Queue Now
                    </button>
                </div>
            </header>

            <div className="p-8 space-y-8">
                {/* Stats Grid */}
                {isLoading ? (
                    <div className="h-40 flex items-center justify-center bg-white rounded-[2rem] border border-gray-100">
                        <RefreshCw className="animate-spin text-primary" size={40} />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                    <Clock size={28} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
                                    <p className="text-sm text-gray-500">Pending in Queue</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                                    <CheckCircle size={28} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{stats.sent_today}</p>
                                    <p className="text-sm text-gray-500">Sent Today</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                    <XCircle size={28} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{stats.failed_today}</p>
                                    <p className="text-sm text-gray-500">Failed Today</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {lastRun && (
                    <div className="bg-green-50 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                        <CheckCircle size={20} />
                        <span className="font-medium">{lastRun}</span>
                    </div>
                )}

                {/* Campaign Toggles */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <BarChart3 className="text-primary" size={24} />
                        Automation Campaigns
                    </h2>
                    <div className="space-y-4">
                        <CampaignToggle
                            title="Welcome Sequence"
                            description="3-email series: Welcome → Day 2 Tips → Day 7 Check-in"
                            enabled={campaigns.welcome_sequence_enabled}
                            onToggle={() => toggleCampaign('welcome_sequence_enabled')}
                            icon={<Users size={20} />}
                        />
                        <CampaignToggle
                            title="Abandoned Checkout Recovery"
                            description="Remind users 1 hour after they leave checkout"
                            enabled={campaigns.abandoned_checkout_enabled}
                            onToggle={() => toggleCampaign('abandoned_checkout_enabled')}
                            icon={<TrendingUp size={20} />}
                        />
                        <CampaignToggle
                            title="Win-Back Campaign"
                            description="Re-engage users inactive for 30+ days"
                            enabled={campaigns.win_back_enabled}
                            onToggle={() => toggleCampaign('win_back_enabled')}
                            icon={<Mail size={20} />}
                        />
                    </div>
                </div>

                {/* Template Preview Section */}
                <div className="bg-deep p-8 rounded-[2rem] text-white">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-3">
                        <Mail size={24} />
                        Email Templates
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {['Welcome', 'Day 2 Tips', 'Day 7 Check-in', 'Abandoned Cart', 'Subscription Confirmed', 'Support Reply', 'Win-Back'].map((template) => (
                            <div key={template} className="bg-white/10 p-4 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                                <p className="font-bold">{template}</p>
                                <p className="text-white/60 text-xs mt-1">Click to preview</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function CampaignToggle({ title, description, enabled, onToggle, icon }: {
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${enabled ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`w-14 h-8 rounded-full transition-colors relative ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );
}
