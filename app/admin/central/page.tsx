"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/services/supabase/authService';

export default function AdminCentralPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Safety timeout in case onAuthChange doesn't fire
        const timer = setTimeout(() => {
            // Not logged in — send to main login page with redirect back
            router.replace('/login?redirect=/admin/overview');
        }, 3000);

        const unsub = onAuthChange(async (user) => {
            clearTimeout(timer);
            if (user) {
                try {
                    const { supabase } = await import('@/lib/storage');
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, is_admin')
                        .eq('id', user.id)
                        .single();

                    const isAdmin = profile?.role === 'admin' || profile?.is_admin === true || user.email === 'admin@likklelegends.com' || user.email?.includes('raykunjal');

                    if (isAdmin) {
                        router.replace('/admin/overview');
                        return;
                    } else {
                        console.warn("Unauthorized access attempt to Admin Central");
                    }
                } catch (err) {
                    console.error("Admin verification error:", err);
                }
            }
            // Not authenticated — redirect to unified login
            router.replace('/login?redirect=/admin/overview');
        });

        if (!unsub) {
            clearTimeout(timer);
            router.replace('/login?redirect=/admin/overview');
            return;
        }

        return () => {
            if (typeof unsub === 'function') unsub();
            clearTimeout(timer);
        };
    }, []);

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

    return null;
}
