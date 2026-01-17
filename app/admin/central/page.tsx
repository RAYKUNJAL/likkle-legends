
"use client";

import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { onAuthChange, logoutParent } from '@/services/supabase/authService';

export default function AdminCentralPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthChange((user) => {
            if (user) {
                setUserEmail(user.email || 'Admin');
            } else {
                setUserEmail(null);
            }
            setIsLoading(false);
        });
        return () => unsub();
    }, []);

    const handleLogin = (email: string) => {
        setUserEmail(email);
    };

    const handleLogout = async () => {
        await logoutParent();
        setUserEmail(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-blue-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!userEmail) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    return <AdminDashboard userEmail={userEmail} onLogout={handleLogout} />;
}
