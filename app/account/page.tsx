"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, User, CreditCard, Bell, Shield, LogOut,
    Camera, Edit2, Check, X, ChevronRight, Mail, Phone,
    Crown, Gift, Calendar, Download, Trash2, Eye, EyeOff
} from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { updateProfile } from '@/lib/services/profiles';
import { TIER_INFO } from '@/lib/feature-access';
import { deleteUserAccountAction, updateProfileSettings } from '@/app/actions/user-actions';
import { supabase } from '@/lib/supabase-client';

type SettingsTab = 'profile' | 'billing' | 'notifications' | 'security' | 'children';

export default function AccountSettingsPage() {
    const { user, children, logout } = useUser();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });

    const [profile, setProfile] = useState({
        full_name: user?.full_name || 'Parent Name',
        email: user?.email || 'parent@email.com',
        phone: user?.phone || '+1 (555) 123-4567',
    });

    const [notifications, setNotifications] = useState({
        email_weekly_digest: true,
        email_progress_updates: true,
        email_new_content: false,
        push_achievements: true,
        push_reminders: true,
        sms_reminders: false,
    });
    const [isSavingNotifs, setIsSavingNotifs] = useState(false);
    const [notifMsg, setNotifMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            await updateProfile(user.id, {
                full_name: profile.full_name,
                phone: profile.phone,
            });
            setIsEditing(false);
        } catch (err) {
            console.error('[Account] Profile update failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        setPwdMsg(null);
        if (!passwords.newPwd || !passwords.confirm) { setPwdMsg({ type: 'error', text: 'Please fill in all password fields.' }); return; }
        if (passwords.newPwd.length < 6) { setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
        if (passwords.newPwd !== passwords.confirm) { setPwdMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
        setIsUpdatingPwd(true);
        const { error } = await supabase.auth.updateUser({ password: passwords.newPwd });
        setIsUpdatingPwd(false);
        if (error) { setPwdMsg({ type: 'error', text: error.message }); }
        else { setPwdMsg({ type: 'success', text: 'Password updated successfully.' }); setPasswords({ current: '', newPwd: '', confirm: '' }); }
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) return;
        setIsDeleting(true);
        const result = await deleteUserAccountAction(user.id);
        setIsDeleting(false);
        if (result.success) { logout(); }
        else { setConfirmDelete(false); }
    };

    const handleSaveNotifications = async () => {
        if (!user?.id) return;
        setIsSavingNotifs(true);
        setNotifMsg(null);
        const result = await updateProfileSettings(user.id, { marketing_opt_in: notifications.email_new_content });
        setIsSavingNotifs(false);
        if (result.success) { setNotifMsg({ type: 'success', text: 'Preferences saved.' }); }
        else { setNotifMsg({ type: 'error', text: result.error || 'Failed to save.' }); }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'children', label: 'Children', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Account Settings</h1>
                            <p className="text-gray-500 text-sm">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <nav className="w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === tab.id
                                        ? 'bg-primary/5 text-primary border-l-4 border-primary'
                                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                        }`}
                                >
                                    <tab.icon size={20} />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}

                            <hr className="my-2" />

                            <button
                                onClick={() => logout()}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Log Out</span>
                            </button>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl"
                                            >
                                                {isSaving ? 'Saving...' : <><Check size={16} /> Save</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                        {profile.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{profile.full_name}</h3>
                                        <p className="text-gray-500">{profile.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold capitalize">
                                                {user?.subscription_tier?.replace('_', ' ') || 'Free'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            id="full_name"
                                            type="text"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                disabled={!isEditing}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                {/* Current Plan */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan</h2>

                                    {(() => {
                                        const tier = (user?.subscription_tier as any) || 'free';
                                        const tierData = (TIER_INFO as any)[tier] || TIER_INFO['free'];
                                        const price = tierData.price_monthly;
                                        return (
                                            <div className="flex items-start justify-between p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Crown className="text-primary" size={24} />
                                                        <h3 className="text-xl font-bold text-gray-900">{tierData.name}</h3>
                                                    </div>
                                                    <p className="text-gray-500 text-sm mb-4">{tierData.description}</p>
                                                    <div className="flex gap-3">
                                                        <Link href="/checkout" className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90">
                                                            {price ? 'Change Plan' : 'Upgrade Plan'}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {price ? (
                                                        <>
                                                            <p className="text-3xl font-black text-gray-900">${price}</p>
                                                            <p className="text-sm text-gray-500">per month</p>
                                                        </>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">Free</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Payment Method — managed by PayPal */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white text-xs font-black tracking-tight px-1">
                                            PayPal
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Managed via PayPal</p>
                                            <p className="text-sm text-gray-500">Visit PayPal to update your billing details or cancel.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing History */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
                                    <div className="text-center py-10 text-gray-400">
                                        <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="font-medium text-sm">Billing history is managed through PayPal.</p>
                                        <a href="https://www.paypal.com/myaccount/transactions" target="_blank" rel="noopener noreferrer"
                                            className="mt-3 inline-block text-primary font-bold text-sm hover:underline">
                                            View transactions on PayPal →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4">Email Notifications</h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'email_weekly_digest', label: 'Weekly Progress Digest', desc: "Summary of your child's weekly learning" },
                                                { key: 'email_progress_updates', label: 'Progress Updates', desc: 'When your child completes milestones' },
                                                { key: 'email_new_content', label: 'New Content & Offers', desc: 'When new stories, songs, or promotions drop' },
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer text-left"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'}`}>
                                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <hr />

                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h3 className="font-bold text-gray-900">Push Notifications</h3>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wide">Coming soon</span>
                                        </div>
                                        <div className="space-y-4 opacity-50 pointer-events-none">
                                            {[
                                                { key: 'push_achievements', label: 'Achievements', desc: 'When your child earns badges or levels up' },
                                                { key: 'push_reminders', label: 'Daily Reminders', desc: 'Reminder to complete daily missions' },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'}`}>
                                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {notifMsg && (
                                        <p className={`text-sm font-bold ${notifMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{notifMsg.text}</p>
                                    )}

                                    <button
                                        onClick={handleSaveNotifications}
                                        disabled={isSavingNotifs}
                                        className="w-full px-6 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-60"
                                    >
                                        {isSavingNotifs ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwords.newPwd}
                                                    onChange={e => setPasswords(p => ({ ...p, newPwd: e.target.value }))}
                                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl"
                                                    placeholder="Enter new password"
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        {pwdMsg && (
                                            <p className={`text-sm font-bold ${pwdMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{pwdMsg.text}</p>
                                        )}
                                        <button
                                            onClick={handleUpdatePassword}
                                            disabled={isUpdatingPwd}
                                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-60 flex items-center gap-2"
                                        >
                                            {isUpdatingPwd ? <><X size={16} className="animate-spin" /> Updating...</> : <><Check size={16} /> Update Password</>}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Danger Zone</h2>

                                    <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                                        {!confirmDelete ? (
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-red-800">Delete Account</h3>
                                                    <p className="text-sm text-red-600">This will cancel your subscription and remove all your data.</p>
                                                </div>
                                                <button
                                                    onClick={() => setConfirmDelete(true)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700"
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="font-bold text-red-800">Are you sure? This cannot be undone.</p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        disabled={isDeleting}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-60"
                                                    >
                                                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(false)}
                                                        className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Children Tab */}
                        {activeTab === 'children' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Child Profiles</h2>
                                        <Link
                                            href="/onboarding/child"
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm"
                                        >
                                            + Add Child
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {children.length === 0 && (
                                            <div className="text-center py-10 text-gray-400">
                                                <p className="font-medium text-sm">No children added yet.</p>
                                                <Link href="/onboarding/child" className="mt-2 inline-block text-primary font-bold text-sm hover:underline">
                                                    Add your first Legend →
                                                </Link>
                                            </div>
                                        )}
                                        {children.map((child: any) => (
                                            <div key={child.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                        {child.first_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{child.first_name}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            Age {child.age} • {child.age_track === 'mini' ? 'Mini Legends' : 'Big Legends'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary">{child.total_xp} XP</p>
                                                        <p className="text-xs text-gray-400">{child.current_streak} day streak</p>
                                                    </div>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600" aria-label="View child profile">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
