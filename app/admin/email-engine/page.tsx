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
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastTemplate, setBroadcastTemplate] = useState('ONBOARDING_DAY_7');
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
                .select('content')
                .eq('key', 'email_campaigns')
                .single();

            if (settings?.content) {
                setCampaigns(settings.content as any);
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
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const response = await fetch('/api/cron/process-emails', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            <Mail size={20} className="text-primary" />
                            New Broadcast
                        </button>
                        <button
                            onClick={processQueue}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                            Process Queue Now
                        </button>
                    </div>
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
            </div>

            {/* Broadcast Modal */}
            {showBroadcastModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-primary p-8 text-white relative">
                            <h2 className="text-3xl font-black">Island Broadcast 🌴</h2>
                            <p className="opacity-80 font-medium">Send value-packed magic to de whole village</p>
                            <button
                                onClick={() => setShowBroadcastModal(false)}
                                className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                                aria-label="Close modal"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Select Template</label>
                                <select
                                    value={broadcastTemplate}
                                    onChange={(e) => setBroadcastTemplate(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold focus:border-primary focus:ring-0"
                                    aria-label="Select Template"
                                >
                                    <option value="WELCOME">Welcome (Manual)</option>
                                    <option value="ONBOARDING_DAY_7">Village Update (Value)</option>
                                    <option value="WIN_BACK">Win-Back Blast</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">Target Audience</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="p-4 rounded-2xl border-2 border-primary bg-primary/5 font-bold text-primary text-left">
                                        All 5,420 Residents
                                    </button>
                                    <button className="p-4 rounded-2xl border-2 border-gray-100 font-bold text-gray-500 text-left hover:border-primary/30">
                                        Free Trialists Only
                                    </button>
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                                <Zap className="text-blue-600 mt-1 shrink-0" size={20} />
                                <p className="text-sm text-blue-800 font-medium leading-relaxed">
                                    <b>Pro-Tip:</b> High-revenue emails for this niche focus on <b>Child Success</b>.
                                    We recommend using the "Onboarding Day 7" template to share a new story or activity!
                                </p>
                            </div>
                            <button
                                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                onClick={() => {
                                    alert("Broadcast Enqueued! De engine will start processing immediately.");
                                    setShowBroadcastModal(false);
                                }}
                            >
                                Launch Broadcast 🚀
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                aria-label={`Toggle ${title}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );
}
