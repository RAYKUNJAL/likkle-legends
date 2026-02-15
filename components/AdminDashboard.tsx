"use client";

import React, { useState } from 'react';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { AdminLayout } from './admin/AdminComponents';
import { UserManagement } from './admin/UserManagement';
import { SettingsView } from './admin/SettingsView';
import { VideoManager } from './VideoManager';
import TantyRecordingStudio from './TantyRecordingStudio';
import { AudioTrackManager } from './admin/AudioTrackManager';

const AdminDashboard: React.FC<{ userEmail: string; onLogout: () => void }> = ({ userEmail, onLogout }) => {
    const [activeView, setActiveView] = useState<'dashboard' | 'content_video' | 'content_audio' | 'content_studio' | 'users' | 'settings'>('dashboard');

    return (
        <AdminLayout activeSection="dashboard">
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-8 flex justify-between items-center sticky top-0 z-40">
                    <div>
                        <h2 className="text-3xl font-heading font-black text-blue-950 capitalize">
                            {activeView === 'dashboard' ? 'Mission Control' : activeView.replace('content_', '').replace('_', ' ')}
                        </h2>
                        <p className="text-blue-900/40 text-sm font-bold">Manage your island universe.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{userEmail}</span>
                        </div>
                        <button onClick={onLogout} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all font-bold text-xs uppercase flex items-center gap-2">
                            <span>🚪</span>
                            Sign Out
                        </button>
                    </div>
                </header>

                <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full">
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                        <button onClick={() => setActiveView('dashboard')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'dashboard' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Stats</button>
                        <button onClick={() => setActiveView('content_video')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'content_video' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Videos</button>
                        <button onClick={() => setActiveView('content_audio')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'content_audio' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Audio</button>
                        <button onClick={() => setActiveView('content_studio')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'content_studio' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Studio</button>
                        <button onClick={() => setActiveView('users')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'users' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Users</button>
                        <button onClick={() => setActiveView('settings')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase whitespace-nowrap transition-all ${activeView === 'settings' ? 'bg-primary text-white' : 'bg-white border text-gray-400'}`}>Settings</button>
                    </div>

                    {activeView === 'dashboard' && <AnalyticsDashboard />}
                    {activeView === 'users' && <UserManagement />}
                    {activeView === 'content_video' && <VideoManager />}
                    {activeView === 'content_studio' && <TantyRecordingStudio />}
                    {activeView === 'settings' && <SettingsView />}
                    {activeView === 'content_audio' && <AudioTrackManager />}
                </main>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
