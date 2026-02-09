"use client";

import React, { useState } from 'react';
import { BrandIcon } from './BrandIcon';
import { DashboardOverview } from './admin/DashboardOverview';
import { UserManagement } from './admin/UserManagement';
import { SettingsView } from './admin/SettingsView';
import { VideoManager } from './VideoManager';
import TantyRecordingStudio from './TantyRecordingStudio';
import { AudioTrackManager } from './admin/AudioTrackManager';

const AdminDashboard: React.FC<{ userEmail: string; onLogout: () => void }> = ({ userEmail, onLogout }) => {
    const [activeView, setActiveView] = useState<'dashboard' | 'content_video' | 'content_audio' | 'content_studio' | 'users' | 'settings'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const NavItem = ({ view, icon, label, sub }: { view: string; icon: string; label: string; sub?: boolean }) => (
        <button
            onClick={() => setActiveView(view as any)}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-2xl font-black text-sm transition-all ${activeView === view
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-900/60 hover:bg-blue-50'
                } ${sub ? 'ml-4 w-auto text-xs' : ''}`}
        >
            <span className="text-xl">{icon}</span>
            {isSidebarOpen && <span>{label}</span>}
        </button>
    );

    return (
        <div className="min-h-screen bg-blue-50/50 flex overflow-hidden font-sans">
            {/* SIDEBAR */}
            <aside className={`bg-white border-r-2 border-blue-100 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-24'} sticky top-0 h-screen p-6 z-50 shrink-0 shadow-xl`}>
                <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <BrandIcon size="md" className="rotate-3" />
                    {isSidebarOpen && (
                        <div>
                            <span className="font-heading font-black text-xl text-blue-950 block leading-none">Likkle</span>
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Admin</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-2 no-scrollbar overflow-y-auto pr-2">
                    <p className={`text-[10px] font-black uppercase text-gray-300 px-6 mb-2 ${!isSidebarOpen && 'hidden'}`}>Main</p>
                    <NavItem view="dashboard" icon="📊" label="Overview" />

                    <p className={`text-[10px] font-black uppercase text-gray-300 px-6 mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Content</p>
                    <NavItem view="content_video" icon="📹" label="Video Vault" />
                    <NavItem view="content_audio" icon="📻" label="Radio & Music" />
                    <NavItem view="content_studio" icon="🎙️" label="Tanty Studio" />

                    <p className={`text-[10px] font-black uppercase text-gray-300 px-6 mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Management</p>
                    <NavItem view="users" icon="👥" label="Citizens" />
                    <NavItem view="settings" icon="⚙️" label="System Config" />
                </nav>

                <div className="mt-auto border-t border-blue-50 pt-6">
                    <div className={`flex items-center gap-3 mb-4 px-2 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">A</div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-blue-950 truncate">{userEmail}</p>
                                <p className="text-[10px] text-green-500 font-bold uppercase">● Online</p>
                            </div>
                        )}
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl font-black text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-all justify-center md:justify-start">
                        <span>🚪</span>
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto no-scrollbar bg-[#F8FAFC]">
                <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 p-8 flex justify-between items-center sticky top-0 z-40">
                    <div>
                        <h2 className="text-3xl font-heading font-black text-blue-950 capitalize">
                            {activeView.replace('content_', '').replace('_', ' ')}
                        </h2>
                        <p className="text-blue-900/40 text-sm font-bold">Manage your island universe.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center shadow-sm text-lg">🔔</button>
                        <button className="w-10 h-10 rounded-full bg-white border border-blue-100 flex items-center justify-center shadow-sm text-lg">🔍</button>
                    </div>
                </header>

                <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full">
                    {activeView === 'dashboard' && <DashboardOverview />}
                    {activeView === 'users' && <UserManagement />}
                    {activeView === 'content_video' && <VideoManager />}
                    {activeView === 'content_studio' && <TantyRecordingStudio />}
                    {activeView === 'settings' && <SettingsView />}
                    {activeView === 'content_audio' && <AudioTrackManager />}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
