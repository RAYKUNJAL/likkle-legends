"use client";

import React, { useState, useEffect } from 'react';
import { fetchGlobalSettings, updateGlobalSetting } from '../../services/supabase/databaseService';

export const SettingsView: React.FC = () => {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalSettings().then(data => {
            setSettings(data);
            setLoading(false);
        });
    }, []);

    const handleToggle = async (key: string) => {
        const newVal = !settings[key];
        setSettings({ ...settings, [key]: newVal });
        await updateGlobalSetting(key, newVal);
    };

    const Toggle = ({ label, keyName }: { label: string, keyName: string }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100">
            <span className="font-bold text-blue-950 text-sm">{label}</span>
            <button
                onClick={() => handleToggle(keyName)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings[keyName] ? 'bg-green-500' : 'bg-gray-200'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings[keyName] ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
        </div>
    );

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
            <div className="bg-blue-50 p-8 rounded-[3rem] border-4 border-white shadow-lg space-y-8">
                <div>
                    <h3 className="font-heading font-black text-2xl text-blue-950 mb-2">Global Feature Flags</h3>
                    <p className="text-sm text-blue-900/60 font-medium">Control feature availability across the entire village instantly.</p>
                </div>

                <div className="space-y-4">
                    <Toggle label="Enable Maintenance Mode" keyName="maintenance_mode" />
                    <Toggle label="Allow New Signups" keyName="allow_signups" />
                    <Toggle label="Enable Holiday Theme" keyName="holiday_theme" />
                    <Toggle label="Free Trial Active" keyName="free_trial_enabled" />
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border-4 border-blue-50 shadow-lg space-y-6">
                <h3 className="font-heading font-black text-xl text-blue-950">System Notifications</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-blue-300">Global Announcement Banner</label>
                        <input type="text" placeholder="Enter message..." className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none" />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg">Update Banner</button>
                </div>
            </div>
        </div>
    );
};
