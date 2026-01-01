"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/storage';
import { Save, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalyticsConfig {
    facebook_pixel_id: string;
    google_analytics_id: string;
    tiktok_pixel_id: string;
}

export default function AdminPixelsPage() {
    const { user, isLoading } = useUser();
    const [config, setConfig] = useState<AnalyticsConfig>({
        facebook_pixel_id: '',
        google_analytics_id: '',
        tiktok_pixel_id: '',
    });
    const [status, setStatus] = useState<'loading' | 'idle' | 'saving' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.is_admin) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'analytics')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data?.value) {
                setConfig({
                    facebook_pixel_id: data.value.facebook_pixel_id || '',
                    google_analytics_id: data.value.google_analytics_id || '',
                    tiktok_pixel_id: data.value.tiktok_pixel_id || '',
                });
            }
            setStatus('idle');
        } catch (err) {
            console.error('Error fetching settings:', err);
            setStatus('error');
            setMessage('Failed to load settings');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        setMessage('');

        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: 'analytics',
                    value: config,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            setStatus('success');
            setMessage('Settings saved successfully!');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setStatus('error');
            setMessage('Failed to save settings. Ensure you have admin permissions.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user?.is_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="text-red-500" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 max-w-md">
                    You do not have permission to view this page. This area is restricted to site administrators.
                </p>
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 flex items-start gap-3 text-left max-w-lg">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                        <strong>Tip:</strong> If you are the owner, you need to set your account as admin in the database.
                        <br />Run this SQL: <code>UPDATE profiles SET is_admin = true WHERE email = 'your-email';</code>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Analytics & Pixels</h1>
                <p className="text-gray-500">Manage your tracking codes for marketing and analytics.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Facebook */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">f</span>
                        Facebook Pixel
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pixel ID
                        </label>
                        <input
                            type="text"
                            value={config.facebook_pixel_id}
                            onChange={(e) => setConfig({ ...config, facebook_pixel_id: e.target.value })}
                            placeholder="e.g. 1234567890"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Enter just the numeric ID (e.g. <code>928374...</code>). The script will be automatically injected.
                        </p>
                    </div>
                </div>

                {/* Google Analytics */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">G</span>
                        Google Analytics 4
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Measurement ID
                        </label>
                        <input
                            type="text"
                            value={config.google_analytics_id}
                            onChange={(e) => setConfig({ ...config, google_analytics_id: e.target.value })}
                            placeholder="e.g. G-ABC123XYZ"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                {/* TikTok */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white text-sm font-bold">TT</span>
                        TikTok Pixel
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pixel ID
                        </label>
                        <input
                            type="text"
                            value={config.tiktok_pixel_id}
                            onChange={(e) => setConfig({ ...config, tiktok_pixel_id: e.target.value })}
                            placeholder="e.g. C5... or numeric ID"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                        {status === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                        <span className="font-medium">{message}</span>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
                    >
                        <Save size={20} />
                        {status === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
