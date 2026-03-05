"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, RefreshCw, Globe, ShieldCheck, Zap
} from '@/components/admin/AdminComponents';
import { Save, Facebook, Play, Target } from 'lucide-react';
import { getPixelSettings, savePixelSettings } from '@/app/actions/pixels';

export default function AdminPixelsPage() {
    const [settings, setSettings] = useState({
        facebook_pixel_id: '',
        google_analytics_id: '',
        tiktok_pixel_id: '',
        snapchat_pixel_id: '',
        google_tag_manager_id: '',
        meta_verification_code: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const data = await getPixelSettings(session.access_token);
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Failed to load pixel settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await savePixelSettings(session.access_token, settings);
            alert('Pixel configurations updated live!');
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AdminLayout activeSection="pixels">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Target className="text-primary" />
                            Tracking Pixels & Analytics
                        </h1>
                        <p className="text-gray-500">Configure your marketing and conversion tracking IDs</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        Deploy to Live
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-4xl space-y-8">
                {isLoading ? (
                    <div className="h-96 flex items-center justify-center bg-white rounded-[2rem] border border-gray-100">
                        <RefreshCw className="animate-spin text-primary" size={40} />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* Meta / Facebook */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Facebook size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">Meta (Facebook)</h3>
                                    <p className="text-sm text-gray-500">Track Ads performance and retargeting</p>
                                </div>
                            </div>
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Pixel ID</label>
                                    <input
                                        type="text"
                                        value={settings.facebook_pixel_id}
                                        onChange={(e) => updateField('facebook_pixel_id', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                        placeholder="e.g. 1234567890"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Meta Domain Verification</label>
                                    <input
                                        type="text"
                                        value={settings.meta_verification_code}
                                        onChange={(e) => updateField('meta_verification_code', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                        placeholder="e.g. abcdefg123456"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Google Analytics & GTM */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">Google Analytics & Tag Manager</h3>
                                    <p className="text-sm text-gray-500">Deep insights into user behavior</p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">GA4 Measurement ID</label>
                                    <input
                                        type="text"
                                        value={settings.google_analytics_id}
                                        onChange={(e) => updateField('google_analytics_id', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                        placeholder="e.g. G-XXXXXXX"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">GTM ID</label>
                                    <input
                                        type="text"
                                        value={settings.google_tag_manager_id}
                                        onChange={(e) => updateField('google_tag_manager_id', e.target.value)}
                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                        placeholder="e.g. GTM-XXXXXX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TikTok & Snapchat */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-black text-white rounded-xl">
                                        <Play size={20} />
                                    </div>
                                    <h3 className="font-black text-gray-900">TikTok Pixel</h3>
                                </div>
                                <input
                                    type="text"
                                    value={settings.tiktok_pixel_id}
                                    onChange={(e) => updateField('tiktok_pixel_id', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                    placeholder="Enter Pixel ID"
                                />
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-yellow-400 text-black rounded-xl">
                                        <Zap size={20} />
                                    </div>
                                    <h3 className="font-black text-gray-900">Snapchat Pixel</h3>
                                </div>
                                <input
                                    type="text"
                                    value={settings.snapchat_pixel_id}
                                    onChange={(e) => updateField('snapchat_pixel_id', e.target.value)}
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                    placeholder="Enter Pixel ID"
                                />
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="bg-deep p-6 rounded-[2rem] text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="text-primary" size={32} />
                                <div>
                                    <p className="font-bold">Privacy & Compliance</p>
                                    <p className="text-white/60 text-xs">Ensure you have a Cookie Consent banner active before enabling these.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Global Ready</span>
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">Auto-Injecting</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
