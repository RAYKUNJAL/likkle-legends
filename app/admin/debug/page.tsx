"use client";

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
    const [status, setStatus] = useState<string[]>([]);

    useEffect(() => {
        const addStatus = (msg: string) => setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

        addStatus("Debug page mounted");
        addStatus(`Path: ${window.location.pathname}`);
        addStatus(`User Agent: ${navigator.userAgent}`);

        // Check window objects
        addStatus(`Window: ${typeof window !== 'undefined' ? 'Defined' : 'Undefined'}`);
        addStatus(`Local Storage: ${typeof localStorage !== 'undefined' ? 'Available' : 'Unavailable'}`);

        // Attempt to check Supabase config
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        addStatus(`Supabase URL: ${url ? 'Found (Masked)' : 'Missing'}`);

        // Check for specific libraries
        try {
            addStatus(`React Version: ${React.version}`);
        } catch (e) {
            addStatus(`Error checking React: ${e}`);
        }
    }, []);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono p-10 space-y-4">
            <h1 className="text-2xl font-bold border-b border-green-900 pb-4">Diagnostic Tool</h1>
            <div className="space-y-2">
                {status.map((line, i) => (
                    <p key={i}> {line}</p>
                ))}
            </div>
            <div className="pt-10 space-y-4">
                <p className="text-white font-bold">Try visiting these paths:</p>
                <ul className="space-y-2">
                    <li><a href="/admin/central" className="underline hover:text-green-300">/admin/central (New Dashboard)</a></li>
                    <li><a href="/admin/media" className="underline hover:text-green-300">/admin/media (Old Media Admin)</a></li>
                    <li><a href="/login" className="underline hover:text-green-300">/login (Public Login)</a></li>
                </ul>
            </div>
        </div>
    );
}
