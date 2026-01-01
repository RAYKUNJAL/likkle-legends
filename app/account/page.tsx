"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, User, CreditCard, Bell, Shield, LogOut,
    Camera, Edit2, Check, X, ChevronRight, Mail, Phone,
    Crown, Gift, Calendar, Download, Trash2, Eye, EyeOff
} from 'lucide-react';
import { useUser } from '@/components/UserContext';

type SettingsTab = 'profile' | 'billing' | 'notifications' | 'security' | 'children';

export default function AccountSettingsPage() {
    const { user, children, logout } = useUser();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

    const handleSaveProfile = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setIsSaving(false);
        setIsEditing(false);
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
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                            {profile.full_name.charAt(0)}
                                        </div>
                                        {isEditing && (
                                            <button
                                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
                                                aria-label="Upload photo"
                                            >
                                                <Camera size={14} className="text-gray-600" />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{profile.full_name}</h3>
                                        <p className="text-gray-500">{profile.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold capitalize">
                                                {user?.subscription_tier?.replace('_', ' ') || 'Free'}
                                            </span>
                                            <span className="text-xs text-gray-400">Member since Jan 2026</span>
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

                                    <div className="flex items-start justify-between p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Crown className="text-primary" size={24} />
                                                <h3 className="text-xl font-bold text-gray-900 capitalize">
                                                    {user?.subscription_tier?.replace('_', ' ') || 'Free Plan'}
                                                </h3>
                                            </div>
                                            <p className="text-gray-600 mb-4">Billed monthly • Renews Jan 15, 2026</p>
                                            <div className="flex gap-3">
                                                <Link
                                                    href="/checkout"
                                                    className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90"
                                                >
                                                    Upgrade Plan
                                                </Link>
                                                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm">
                                                    Cancel Subscription
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-gray-900">$24.99</p>
                                            <p className="text-sm text-gray-500">per month</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                                        <button className="text-primary font-medium text-sm hover:underline">
                                            Add New
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                            VISA
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-gray-500">Expires 12/28</p>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600" aria-label="Edit payment method">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Billing History */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>

                                    <div className="space-y-3">
                                        {[
                                            { date: 'Dec 15, 2025', amount: '$24.99', status: 'Paid' },
                                            { date: 'Nov 15, 2025', amount: '$24.99', status: 'Paid' },
                                            { date: 'Oct 15, 2025', amount: '$24.99', status: 'Paid' },
                                        ].map((invoice, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                        <Calendar size={18} className="text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{invoice.date}</p>
                                                        <p className="text-sm text-gray-500">Legends Plus - Monthly</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-gray-900">{invoice.amount}</span>
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                        {invoice.status}
                                                    </span>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600" aria-label="Download invoice">
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                                                { key: 'email_weekly_digest', label: 'Weekly Progress Digest', desc: 'Summary of your child\'s weekly learning' },
                                                { key: 'email_progress_updates', label: 'Progress Updates', desc: 'When your child completes milestones' },
                                                { key: 'email_new_content', label: 'New Content Alerts', desc: 'When new stories or songs are added' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'
                                                        }`}>
                                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                                                            }`} />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <hr />

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4">Push Notifications</h3>
                                        <div className="space-y-4">
                                            {[
                                                { key: 'push_achievements', label: 'Achievements', desc: 'When your child earns badges or levels up' },
                                                { key: 'push_reminders', label: 'Daily Reminders', desc: 'Reminder to complete daily missions' },
                                            ].map((item) => (
                                                <label key={item.key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <div className={`w-12 h-7 rounded-full p-1 transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'
                                                        }`}>
                                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                                                            }`} />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Danger Zone</h2>

                                    <div className="p-4 border border-red-200 rounded-xl bg-red-50">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-red-800">Delete Account</h3>
                                                <p className="text-sm text-red-600">This will permanently delete your account and all data.</p>
                                            </div>
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700">
                                                Delete Account
                                            </button>
                                        </div>
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
                                        {(children.length > 0 ? children : [
                                            { id: '1', first_name: 'Marcus', age: 6, age_track: 'big', total_xp: 1250, current_streak: 5 }
                                        ]).map((child: any) => (
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
