'use client';

import { useState, useEffect } from 'react';
import { X, Timer } from 'lucide-react';

export default function NotificationBar({ content }: { content: any }) {
    const { notification_bar } = content;
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!notification_bar?.countdown?.enabled) return;

        // Simple countdown logic for demo/rebuild
        const hours = notification_bar.countdown.duration_hours || 24;
        let totalSeconds = hours * 3600;

        const timer = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(timer);
                return;
            }
            totalSeconds--;
            setTimeLeft({
                hours: Math.floor(totalSeconds / 3600),
                minutes: Math.floor((totalSeconds % 3600) / 60),
                seconds: totalSeconds % 60
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [notification_bar]);

    if (!notification_bar?.enabled || !isVisible) return null;

    return (
        <div className="bg-deep relative z-[60] py-2 px-4 border-b border-white/10">
            <div className="container flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
                    <p className="text-white text-sm font-medium">
                        <span className="text-emerald-400 font-bold">SALE:</span> {notification_bar.text}
                        <span className="hidden md:inline text-white/60 ml-2">— {notification_bar.subtext}</span>
                    </p>

                    {notification_bar.countdown?.enabled && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 text-emerald-400 text-xs font-mono font-bold">
                            <Timer className="w-3.5 h-3.5" />
                            <span>
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="text-white/40 hover:text-white transition-colors"
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
