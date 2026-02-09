"use client";

import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { onAuthChange, logoutParent } from '@/services/supabase/authService';

export default function AdminCentralPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Safety timeout in case onAuthChange doesn't fire
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        const unsub = onAuthChange((user) => {
            if (user) {
                setUserEmail(user.email || 'Admin');
            } else {
                setUserEmail(null);
            }
            setIsLoading(false);
            clearTimeout(timer);
        });

        if (!unsub) {
            setIsLoading(false);
            clearTimeout(timer);
            return;
        }

        return () => {
            if (typeof unsub === 'function') unsub();
            clearTimeout(timer);
        };
    }, []);

    const handleLogin = (email: string) => {
        setUserEmail(email);
    };

    const handleLogout = async () => {
        await logoutParent();
        setUserEmail(null);
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-blue-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/20 font-black uppercase tracking-widest animate-pulse">Initializing Island Command...</p>
                </div>
            </div>
        );
    }

    if (!userEmail) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return <AdminDashboard userEmail={userEmail} onLogout={handleLogout} />;
}
