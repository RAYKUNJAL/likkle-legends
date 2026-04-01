"use client";

import { useState } from 'react';

export default function ClientDebugPage() {
    const [status, setStatus] = useState<string>("Ready to test");
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const checkEnv = () => {
        // SECURITY: API Key is server-side only and should NOT be checked from client
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: API Key check removed - keys are server-side only for security`]);
        addLog(`Environment: API keys are stored securely on server (not in client bundle)`);
    };

    const runTest = async () => {
        setStatus("Testing...");
        addLog("Sending request to backend Gemini proxy...");

        try {
            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: "Reply with 'Hello from Server-Side Proxy'",
                    model: 'gemini-2.0-flash',
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            const data = await response.json();
            setStatus("Success!");
            addLog(`Success! Response: "${data.content}"`);
        } catch (e: any) {
            setStatus("Failed");
            addLog(`Error: ${e.message}`);
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Server-Side AI Debugger</h1>

            <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                <p className="text-sm"><strong>Security Status:</strong> API keys are securely stored on server only (not exposed to browser)</p>
            </div>

            <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-sm"><strong>Note:</strong> All Gemini API calls are proxied through backend endpoints at <code>/api/gemini/*</code></p>
            </div>

            <button
                onClick={runTest}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
            >
                Run Server-Side Test
            </button>

            <div className="p-4 bg-black text-green-400 font-mono text-sm rounded h-64 overflow-y-auto">
                <div className="font-bold border-b border-gray-700 mb-2 pb-2">Logs ({status})</div>
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
}
