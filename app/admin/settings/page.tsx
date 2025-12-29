"use client";

import Sidebar from '@/components/Sidebar';
import { Settings, Shield, Bell, Database, Globe, Lock, Cpu, Save } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="admin" />
            <main className="ml-64 p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-deep mb-2">System Settings ⚙️</h1>
                        <p className="text-lg text-deep/40 font-bold">Configure platform parameters and security protocols.</p>
                    </div>
                    <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        <Save size={24} /> Save Global Changes
                    </button>
                </header>

                <div className="max-w-4xl space-y-10">
                    {/* General Settings */}
                    <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">Environment Configuration</h3>
                        </div>
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label id="platform-mode-label" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3">Platform Mode</label>
                                    <select aria-labelledby="platform-mode-label" className="w-full p-5 bg-zinc-50 border-none rounded-2xl font-bold text-deep focus:ring-4 focus:ring-primary/10 transition-all">
                                        <option>Production (Live)</option>
                                        <option>Maintenance Mode</option>
                                        <option>Beta Access Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label id="currency-label" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3">Default Currency</label>
                                    <select aria-labelledby="currency-label" className="w-full p-5 bg-zinc-50 border-none rounded-2xl font-bold text-deep focus:ring-4 focus:ring-primary/10 transition-all">
                                        <option>USD ($)</option>
                                        <option>GBP (£)</option>
                                        <option>CAD ($)</option>
                                        <option>JMD ($)</option>
                                        <option>TTD ($)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                <div>
                                    <p className="font-black text-deep">Auto-Publish Content</p>
                                    <p className="text-xs font-bold text-deep/30">Automatically release new monthly letters on the 10th.</p>
                                </div>
                                <div className="w-16 h-8 bg-primary rounded-full relative cursor-pointer shadow-inner">
                                    <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI & Intelligence */}
                    <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                                <Cpu size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">AI Brain (Gemini Logic)</h3>
                        </div>
                        <div className="space-y-6 text-sm">
                            <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-deep/60 flex items-center gap-2"><Settings size={14} /> Creativity Temperature</span>
                                    <span className="font-black text-accent">0.85 (High)</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                                    <div className="w-[85%] h-full bg-accent rounded-full"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-5 border-2 border-zinc-100 rounded-2xl font-black text-xs uppercase tracking-widest text-deep/40 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                                    <Database size={16} /> Sync Culture Map
                                </button>
                                <button className="p-5 border-2 border-zinc-100 rounded-2xl font-black text-xs uppercase tracking-widest text-deep/40 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                                    <Bell size={16} /> Test Notifications
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-xl border-b-8 border-b-red-500/10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">Security & Access</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400"><Lock size={18} /></div>
                                    <span className="font-bold text-deep">Two-Factor Authentication</span>
                                </div>
                                <button className="text-xs font-black text-primary uppercase tracking-widest">Enable</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400"><Database size={18} /></div>
                                    <span className="font-bold text-deep">Database Auto-Backups</span>
                                </div>
                                <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded">EVERY 6H</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
