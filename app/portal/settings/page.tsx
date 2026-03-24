"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Bell, Shield, Trash2, Download,
    CheckCircle2, AlertTriangle, Loader2, ArrowLeft
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { updateProfileSettings, deleteUserAccountAction } from '@/app/actions/user-actions';
import InvitePanel from '@/components/portal/InvitePanel';
import FamilyChallengesPanel from '@/components/portal/FamilyChallengesPanel';
import LeaderboardPanel from '@/components/portal/LeaderboardPanel';
import Link from 'next/link';

type ActiveSection = 'profile' | 'notifications' | 'security';
type ExtendedActiveSection = ActiveSection | 'parental';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const profile = user;
    const [activeSection, setActiveSection] = useState<ExtendedActiveSection>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [formData, setFormData] = useState({
        parent_name: '',
        marketing_opt_in: true,
        parental_controls: {
            allow_stories: true,
            allow_lessons: true,
            allow_games: true,
            allow_radio: true,
            allow_buddy: true,
            daily_screen_time_minutes: 120,
        }
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                parent_name: profile.parent_name || profile.full_name || '',
                marketing_opt_in: profile.marketing_opt_in ?? true,
                parental_controls: {
                    allow_stories: profile.parental_controls?.allow_stories ?? true,
                    allow_lessons: profile.parental_controls?.allow_lessons ?? true,
                    allow_games: profile.parental_controls?.allow_games ?? true,
                    allow_radio: profile.parental_controls?.allow_radio ?? true,
                    allow_buddy: profile.parental_controls?.allow_buddy ?? true,
                    daily_screen_time_minutes: profile.parental_controls?.daily_screen_time_minutes ?? 120,
                }
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        setMessage(null);
        const result = await updateProfileSettings(user.id, formData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
        }
        setIsLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        setIsLoading(true);
        const result = await deleteUserAccountAction(user.id);
        setIsLoading(false);
        if (result.success) {
            router.push('/');
        } else {
            setConfirmDelete(false);
            setMessage({ type: 'error', text: 'Failed to delete account. Please contact support.' });
        }
    };

    const navItems: { id: ExtendedActiveSection; label: string; icon: React.ElementType }[] = [
        { id: 'profile', label: 'Profile Info', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'parental', label: 'Parent Controls', icon: Shield },
        { id: 'security', label: 'Security & Privacy', icon: Shield },
    ];

    if (userLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="min-h-screen bg-[#F0F9FF] p-8 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/portal" className="flex items-center gap-2 text-deep/60 hover:text-primary font-bold transition-colors">
                        <ArrowLeft size={20} /> Back to Portal
                    </Link>
                    <h1 className="text-3xl font-black text-deep">Account Settings</h1>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                        {message.text}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveSection(item.id); setMessage(null); }}
                                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all border ${
                                    activeSection === item.id
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-white shadow-sm border-border/50 text-deep/60 hover:border-primary/30 hover:text-primary'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <>
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 space-y-6">
                                    <h2 className="text-xl font-black text-deep flex items-center gap-2">
                                        <User className="text-primary" /> Profile Information
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="parent_name" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-2 px-1">Parent Name</label>
                                            <input
                                                type="text"
                                                id="parent_name"
                                                value={formData.parent_name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
                                                className="w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-deep"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-2 px-1">Login Email</label>
                                            <div className="flex items-center gap-3 px-6 py-4 bg-zinc-100 rounded-2xl font-bold text-deep/40 italic">
                                                <Mail size={18} /> {profile?.email || 'No email set'}
                                                <span className="ml-auto text-[10px] bg-zinc-200 px-2 py-1 rounded-md uppercase">Locked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5">
                                    <InvitePanel />
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5">
                                    <FamilyChallengesPanel />
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5">
                                    <LeaderboardPanel />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                                </button>
                            </>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <>
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 space-y-6">
                                    <h2 className="text-xl font-black text-deep flex items-center gap-2">
                                        <Bell className="text-secondary" /> Marketing & Updates
                                    </h2>
                                    <div className="flex items-center justify-between gap-4 p-4 bg-zinc-50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-deep">Cultural News & Offers</p>
                                            <p className="text-sm text-deep/40">Get notified about new islands, stories, and monthly drops.</p>
                                        </div>
                                        <button
                                            role="switch"
                                            aria-checked={formData.marketing_opt_in ? "true" : "false"}
                                            title={formData.marketing_opt_in ? "Disable marketing emails" : "Enable marketing emails"}
                                            onClick={() => setFormData(prev => ({ ...prev, marketing_opt_in: !prev.marketing_opt_in }))}
                                            className={`relative w-12 h-7 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${formData.marketing_opt_in ? 'bg-primary' : 'bg-zinc-300'}`}
                                        >
                                            <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.marketing_opt_in ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Preferences'}
                                </button>
                            </>
                        )}

                        {/* Security Section */}
                        {activeSection === 'parental' && (
                            <>
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 space-y-6">
                                    <h2 className="text-xl font-black text-deep flex items-center gap-2">
                                        <Shield className="text-primary" /> Real Parent Controls
                                    </h2>
                                    <p className="text-sm text-deep/50 font-medium">
                                        Control what your child can access and set a daily screen-time limit.
                                    </p>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'allow_stories', label: 'Allow Stories' },
                                            { key: 'allow_lessons', label: 'Allow Lessons' },
                                            { key: 'allow_games', label: 'Allow Games' },
                                            { key: 'allow_radio', label: 'Allow Radio' },
                                            { key: 'allow_buddy', label: 'Allow Buddy Chat' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between gap-4 p-4 bg-zinc-50 rounded-2xl">
                                                <p className="font-bold text-deep">{item.label}</p>
                                                <button
                                                    role="switch"
                                                    aria-checked={(formData.parental_controls as any)[item.key] ? "true" : "false"}
                                                    onClick={() => setFormData((prev) => ({
                                                        ...prev,
                                                        parental_controls: {
                                                            ...prev.parental_controls,
                                                            [item.key]: !(prev.parental_controls as any)[item.key]
                                                        }
                                                    }))}
                                                    className={`relative w-12 h-7 rounded-full p-1 transition-colors ${((formData.parental_controls as any)[item.key]) ? 'bg-primary' : 'bg-zinc-300'}`}
                                                >
                                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${((formData.parental_controls as any)[item.key]) ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 bg-zinc-50 rounded-2xl">
                                        <label htmlFor="daily_limit" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3">
                                            Daily Screen-Time Limit (minutes)
                                        </label>
                                        <input
                                            id="daily_limit"
                                            type="range"
                                            min={15}
                                            max={300}
                                            step={15}
                                            value={formData.parental_controls.daily_screen_time_minutes}
                                            onChange={(e) => setFormData((prev) => ({
                                                ...prev,
                                                parental_controls: {
                                                    ...prev.parental_controls,
                                                    daily_screen_time_minutes: Number(e.target.value)
                                                }
                                            }))}
                                            className="w-full accent-primary"
                                        />
                                        <p className="mt-2 font-black text-primary">{formData.parental_controls.daily_screen_time_minutes} minutes/day</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Save Parent Controls'}
                                </button>
                            </>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 space-y-6">
                                <h2 className="text-xl font-black text-deep flex items-center gap-2">
                                    <Shield className="text-emerald-500" /> Data & Privacy
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors group">
                                        <Download className="text-deep/40 group-hover:text-primary" size={20} />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">Download My Data</p>
                                            <p className="text-[10px] text-deep/40 uppercase font-black">GDPR Compliance</p>
                                        </div>
                                    </button>
                                    {!confirmDelete ? (
                                        <button
                                            onClick={() => setConfirmDelete(true)}
                                            className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors group"
                                        >
                                            <Trash2 className="text-red-400 group-hover:text-red-600" size={20} />
                                            <div className="text-left">
                                                <p className="font-bold text-sm text-red-600">Delete Account</p>
                                                <p className="text-[10px] text-red-400 uppercase font-black">Permanent Action</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="col-span-2 p-4 bg-red-50 rounded-2xl border border-red-200 space-y-3">
                                            <p className="font-bold text-sm text-red-800">Are you sure? This will cancel your subscription and delete all data.</p>
                                            <div className="flex gap-3">
                                                <button onClick={handleDeleteAccount} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 disabled:opacity-60">
                                                    {isLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                                                </button>
                                                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-xs">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
