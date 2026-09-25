'use client';

import { useEffect, useState } from 'react';
import { X, Timer } from 'lucide-react';

type CountdownConfig = {
    enabled?: boolean;
    duration_hours?: number;
    ends_at?: string | null;
};

function parseFutureEnd(endsAt?: string | null): Date | null {
    if (!endsAt) return null;
    const end = new Date(endsAt);
    if (Number.isNaN(end.getTime())) return null;
    if (end.getTime() <= Date.now()) return null;
    return end;
}

function formatRemaining(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        done: totalSeconds <= 0,
    };
}

export default function NotificationBar({ content }: { content: any }) {
    const { notification_bar } = content;
    const [isVisible, setIsVisible] = useState(true);
    const countdown: CountdownConfig | undefined = notification_bar?.countdown;
    const endDate = parseFutureEnd(countdown?.ends_at);
    const showTimer = Boolean(countdown?.enabled && endDate);
    const [timeLeft, setTimeLeft] = useState(() =>
        endDate ? formatRemaining(endDate.getTime() - Date.now()) : null
    );

    useEffect(() => {
        if (!showTimer || !endDate) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const next = formatRemaining(endDate.getTime() - Date.now());
            setTimeLeft(next);
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
        // ends_at string is the source of truth for a real server/CMS expiry
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showTimer, countdown?.ends_at]);

    if (!notification_bar?.enabled || !isVisible) return null;

    const timerLive = showTimer && timeLeft && !timeLeft.done;

    return (
        <div className="bg-deep relative z-[60] py-2 px-4 border-b border-white/10">
            <div className="container flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
                    <p className="text-white text-sm font-medium">
                        <span className="text-emerald-400 font-bold">SALE:</span> {notification_bar.text}
                        <span className="hidden md:inline text-white/60 ml-2">— {notification_bar.subtext}</span>
                    </p>

                    {timerLive && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/10 text-emerald-400 text-xs font-mono font-bold">
                            <Timer className="w-3.5 h-3.5" />
                            <span>
                                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
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
