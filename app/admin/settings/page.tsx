"use client";

import { useState } from 'react';
import {
    AdminLayout, StatCard,
} from '@/components/admin/AdminComponents';
import {
    Settings, Shield, Bell, Database, Globe, Lock, Cpu, Save,
    Mail, CreditCard
} from 'lucide-react';

import { getSiteSettings, saveSiteSettings } from '@/app/actions/admin';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState({
        platform_mode: 'production',
        currency: 'USD',
        auto_publish: true,
        creativity: 0.85,
        notifications: {
            welcome: true,
            subscriptions: true,
            fulfillment: false
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const data = await getSiteSettings(session.access_token, 'system_config');
            if (data) setConfig(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await saveSiteSettings(session.access_token, 'system_config', config);
            toast.success("Settings updated!");
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout activeSection="settings">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">System Settings</h1>
                        <p className="text-gray-500">Configure platform parameters and business logic</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>
            </header>

            <div className="p-8 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* General Configuration */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Globe className="text-blue-500" /> Platform Config
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Platform Mode</label>
                                <select
                                    value={config.platform_mode}
                                    onChange={(e) => setConfig({ ...config, platform_mode: e.target.value })}
                                    title="Platform Mode"
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="production">Production (Live)</option>
                                    <option value="maintenance">Maintenance Mode</option>
                                    <option value="test">Staging/Test</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Default Currency</label>
                                <select title="Default Currency" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary/20">
                                    <option>USD ($)</option>
                                    <option>GBP (£)</option>
                                    <option>CAD ($)</option>
                                    <option>JMD ($)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <div>
                                    <p className="font-bold text-gray-900">Auto-Publish Content</p>
                                    <p className="text-xs text-gray-400">Release monthly themes on the 1st</p>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Engine Settings */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Cpu className="text-accent" /> AI Logic (Gemini)
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Creativity (Temp)</label>
                                    <span className="text-xs font-bold text-accent">{config.creativity}</span>
                                </div>
                                <input
                                    title="Creativity Temperature"
                                    type="range"
                                    className="w-full accent-accent"
                                    min="0" max="1" step="0.05"
                                    value={config.creativity}
                                    onChange={(e) => setConfig({ ...config, creativity: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                                <h4 className="text-sm font-bold text-accent mb-2">Tanty Spice Knowledge Base</h4>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-white rounded-lg text-xs font-black text-accent shadow-sm">Update Maps</button>
                                    <button className="flex-1 py-2 border border-accent/20 rounded-lg text-xs font-black text-accent">Optimize</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Access */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Shield className="text-red-500" /> Security
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><Lock size={18} /></div>
                                    <span className="font-bold text-gray-700">2FA Protection</span>
                                </div>
                                <span className="text-xs font-black text-primary uppercase">Enable</span>
                            </div>

                            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><Database size={18} /></div>
                                    <span className="font-bold text-gray-700">Daily Backups</span>
                                </div>
                                <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded">ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    {/* Email & Communication */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Mail className="text-amber-500" /> Notifications
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700">Welcome Emails</span>
                                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700">Subscription Alerts</span>
                                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700">Monthly Fulfillment Reminders</span>
                                <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
