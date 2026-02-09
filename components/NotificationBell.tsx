"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, X, Flame, Trophy, Gift, BookOpen, CreditCard, Settings } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/messaging';

interface Notification {
    id: string;
    title: string;
    body: string;
    notification_type: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const { user, unreadCount, refreshNotifications } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const data = await getNotifications(user.id, 10);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && user) {
            loadNotifications();
        }
    }, [isOpen, user, loadNotifications]);

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));
        refreshNotifications();
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await markAllNotificationsAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        refreshNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'achievement': return <Trophy className="text-amber-500" size={18} />;
            case 'streak': return <Flame className="text-orange-500" size={18} />;
            case 'mission': return <Gift className="text-purple-500" size={18} />;
            case 'content': return <BookOpen className="text-blue-500" size={18} />;
            case 'subscription': return <CreditCard className="text-green-500" size={18} />;
            default: return <Bell className="text-gray-500" size={18} />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Notifications"
            >
                <Bell size={22} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary font-medium hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                            <Link href="/notifications" className="p-1 hover:bg-gray-100 rounded" aria-label="Notification Settings">
                                <Settings size={16} className="text-gray-400" />
                            </Link>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="text-gray-300 mx-auto mb-3" size={32} />
                                <p className="text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                        {getIcon(notification.notification_type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="shrink-0 text-gray-400 hover:text-gray-600"
                                                    aria-label="Mark as read"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{notification.body}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.created_at)}</p>

                                        {notification.action_url && (
                                            <Link
                                                href={notification.action_url}
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="inline-block mt-2 text-xs text-primary font-medium hover:underline"
                                            >
                                                View Details →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 text-center">
                            <Link
                                href="/notifications"
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
