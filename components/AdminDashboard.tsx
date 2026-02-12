"use client";

import React, { useState } from 'react';
import { BrandIcon } from './BrandIcon';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { UserManagement } from './admin/UserManagement';
import { SettingsView } from './admin/SettingsView';
import { VideoManager } from './VideoManager';
import TantyRecordingStudio from './TantyRecordingStudio';
import { AudioTrackManager } from './admin/AudioTrackManager';
import { LogOut, LayoutDashboard, Users, Settings, Music, Video, Mic } from 'lucide-react';

interface AdminDashboardProps {
    userEmail: string;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userEmail, onLogout }) => {
    const [activeView, setActiveView] = useState<'dashboard' | 'content_video' | 'content_audio' | 'content_studio' | 'users' | 'settings'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const NavItem = ({ view, icon: Icon, label, sub }: { view: string; icon: any; label: string; sub?: boolean }) => (
        <button
            onClick={() => setActiveView(view as any)}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-2xl font-black text-sm transition-all group ${activeView === view
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                } ${sub ? 'ml-4 w-auto text-xs' : ''}`}
        >
            <Icon size={20} className={`transition-transform duration-300 ${activeView === view ? 'scale-110' : 'group-hover:scale-110'}`} />
            {isSidebarOpen && <span className="truncate">{label}</span>}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
            {/* SIDEBAR */}
            <aside className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-24'} sticky top-0 h-screen z-50 shrink-0 shadow-xl shadow-slate-200/50`}>
                <div className="flex items-center gap-3 p-6 mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <BrandIcon size="sm" className="text-white" />
                    </div>
                    {isSidebarOpen && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <span className="font-heading font-black text-lg text-slate-800 block leading-none">Likkle</span>
                            <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Legends Admin</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar px-4 py-2">
                    <p className={`text-[10px] font-black uppercase text-slate-300 px-4 mb-2 mt-2 ${!isSidebarOpen && 'hidden'}`}>Overview</p>
                    <NavItem view="dashboard" icon={LayoutDashboard} label="Mission Control" />

                    <p className={`text-[10px] font-black uppercase text-slate-300 px-4 mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Content Studio</p>
                    <NavItem view="content_video" icon={Video} label="Video Vault" />
                    <NavItem view="content_audio" icon={Music} label="Radio & Music" />
                    <NavItem view="content_studio" icon={Mic} label="Tanty's Studio" />

                    <p className={`text-[10px] font-black uppercase text-slate-300 px-4 mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>System</p>
                    <NavItem view="users" icon={Users} label="Citizens" />
                    <NavItem view="settings" icon={Settings} label="Configuration" />
                </nav>

                <div className="mt-auto border-t border-slate-50 p-6 bg-slate-50/50">
                    <div className={`flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-md overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=${userEmail}&background=random`} alt="Admin" className="w-full h-full object-cover" />
                        </div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Online Now</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-xs text-red-500 bg-white border border-red-50 hover:bg-red-50 hover:border-red-100 transition-all justify-center shadow-sm hover:shadow">
                        <LogOut size={16} />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 relative">
                {/* Top Bar */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-40">
                    <div>
                        <h2 className="text-2xl font-heading font-black text-slate-800 capitalize tracking-tight">
                            {activeView === 'dashboard' ? 'Mission Control' : activeView.replace('content_', '').replace('_', ' ')}
                        </h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                            <Settings size={18} />
                        </button>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all">
                            Export Report
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-20">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {activeView === 'dashboard' && <AnalyticsDashboard />}
                        {activeView === 'users' && <UserManagement />}
                        {activeView === 'content_video' && <VideoManager />}
                        {activeView === 'content_studio' && <TantyRecordingStudio />}
                        {activeView === 'settings' && <SettingsView />}
                        {activeView === 'content_audio' && <AudioTrackManager />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
