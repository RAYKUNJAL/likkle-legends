"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Bell, Check, Trash2, Settings, Star, Gift,
    BookOpen, Music, Trophy, AlertCircle, MessageCircle, Clock
} from 'lucide-react';
import { useUser } from '@/components/UserContext';

interface Notification {
    id: string;
    type: 'achievement' | 'mission' | 'content' | 'system' | 'message';
    title: string;
    body: string;
    action_url?: string;
    read: boolean;
    created_at: string;
}

const TYPE_ICONS = {
    achievement: Trophy,
    mission: Star,
    content: BookOpen,
    system: Bell,
    message: MessageCircle,
};

const TYPE_COLORS = {
    achievement: 'text-amber-600 bg-amber-100',
    mission: 'text-green-600 bg-green-100',
    content: 'text-blue-600 bg-blue-100',
    system: 'text-purple-600 bg-purple-100',
    message: 'text-pink-600 bg-pink-100',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isloading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        async function loadNotifications() {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, read: true })
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAll: true })
            });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Back to Dashboard">
                                <ArrowLeft size={24} className="text-gray-600" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-black text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-500">{unreadCount} unread</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <Check size={16} /> Mark all read
                            </button>
                            <Link
                                href="/account?tab=notifications"
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                                aria-label="Notification Settings"
                            >
                                <Settings size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${filter === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${filter === 'unread'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <main className="max-w-3xl mx-auto px-4 pb-8">
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification) => {
                            const Icon = TYPE_ICONS[notification.type];
                            const colorClass = TYPE_COLORS[notification.type];

                            return (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${notification.read
                                        ? 'border-gray-100'
                                        : 'border-l-4 border-l-primary border-gray-100'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                            <Icon size={24} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className={`font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">{notification.body}</p>
                                                </div>

                                                <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {getTimeAgo(notification.created_at)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3 mt-3">
                                                {notification.action_url && (
                                                    <Link
                                                        href={notification.action_url}
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        View Details →
                                                    </Link>
                                                )}

                                                {!notification.read && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-gray-400 hover:text-gray-600"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-xs text-gray-400 hover:text-red-500 ml-auto"
                                                    aria-label="Delete notification"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Bell className="text-gray-400" size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">
                            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {filter === 'unread'
                                ? "You've read all your notifications."
                                : "You'll see notifications about achievements, new content, and more here."}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
