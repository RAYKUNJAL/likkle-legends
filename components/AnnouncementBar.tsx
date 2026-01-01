"use client";

import { siteContent } from '@/lib/content';

export default function AnnouncementBar() {
    const { notification_bar } = siteContent;

    if (!notification_bar.enabled) return null;

    return (
        <div className="bg-deep text-white py-2 text-center text-sm font-bold tracking-tight px-4">
            <div className="container flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>🎉 {notification_bar.text}</span>
                <div className="flex items-center gap-2">
                    <span className="text-white/60 font-normal">{notification_bar.subtext}</span>
                    {notification_bar.countdown.enabled && (
                        <span className="text-secondary tabular-nums">23:59:59</span>
                    )}
                </div>
            </div>
        </div>
    );
}
