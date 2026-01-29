"use client";

import { useState } from 'react';
import { AdminLayout, RefreshCw, CheckCircle2, AlertCircle } from '@/components/admin/AdminComponents'; // Adjust imports if needed
import { runDiagnostics } from '@/app/actions/debug-ai';

export default function DebugAIPage() {
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunDiagnostics = async () => {
        setIsLoading(true);
        setResults({
            env: { status: 'pending', message: 'Checking...' },
            supabase: { status: 'pending', message: 'Checking...' },
            auth: { status: 'pending', message: 'Waiting...' },
            ai: { status: 'pending', message: 'Waiting...' }
        });

        const { toast } = await import('react-hot-toast');
        const toastId = toast.loading("Starting Stage-by-Stage Check...");

        try {
            const { testEnv, testSupabase, testAuth, testAI } = await import('@/app/actions/debug-ai');
            const { supabase } = await import('@/lib/storage');

            // 1. Env Check
            const env = await testEnv();
            setResults(prev => ({ ...prev, env }));

            // 2. Supabase Reachability
            const sbReach = await testSupabase();
            setResults(prev => ({ ...prev, supabase: sbReach }));

            // 3. Auth Check
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Please log in again.");

            const auth = await testAuth(session.access_token);
            setResults(prev => ({ ...prev, auth }));

            // 4. AI Check
            const ai = await testAI();
            setResults(prev => ({ ...prev, ai }));

            toast.success("All checks completed!", { id: toastId });
        } catch (error: any) {
            console.error("Diagnostic failure:", error);
            toast.error("Critical failure: " + error.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout activeSection="debug">
            <div className="p-8 max-w-4xl mx-auto">
                <header className="mb-8 p-8 bg-green-50 rounded-[3rem] border-4 border-green-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-green-900">AI Diagnostics v2.5</h1>
                        <p className="text-green-800/60 font-bold">Network Isolation Mode: Jan 29, 11:15 AM</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-4 bg-white rounded-2xl shadow-sm text-green-600 font-bold hover:bg-green-50 transition-colors"
                    >
                        Hard Reset UI
                    </button>
                </header>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <button
                                onClick={handleRunDiagnostics}
                                disabled={isLoading}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {isLoading ? <RefreshCw className="animate-spin" /> : "Run Full System Check"}
                            </button>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-3">
                            <button
                                onClick={async () => {
                                    const { runPing } = await import('@/app/actions/debug-ai');
                                    const res = await runPing();
                                    alert("Server Ping: " + res.status + " at " + res.timestamp);
                                }}
                                className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-bold"
                            >
                                Test Action Tunnel (Ping)
                            </button>
                            <button
                                onClick={async () => {
                                    const { testAI } = await import('@/app/actions/debug-ai');
                                    const { toast } = await import('react-hot-toast');
                                    const tid = toast.loading("Testing Gemini Bypass...");
                                    const res = await testAI();
                                    if (res.status === 'success') toast.success(res.message, { id: tid });
                                    else toast.error(res.message, { id: tid });
                                }}
                                className="w-full py-3 bg-orange-100 text-orange-700 rounded-xl font-bold"
                            >
                                Test Gemini Raw (Bypass Auth)
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="grid gap-4">
                            {/* Key Status */}
                            <DiagnosticCard
                                title="Environment Key (Gemini)"
                                status={results.env?.status}
                                message={results.env?.message}
                            />

                            {/* Network Status */}
                            <DiagnosticCard
                                title="Supabase Connectivity"
                                status={results.supabase?.status}
                                message={results.supabase?.message}
                            />

                            {/* Auth Status */}
                            <DiagnosticCard
                                title="Admin Authentication"
                                status={results.auth?.status}
                                message={results.auth?.message}
                            />

                            {/* AI Status */}
                            <DiagnosticCard
                                title="AI Model (Gemini 2.0 Flash)"
                                status={results.ai?.status}
                                message={results.ai?.message}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function DiagnosticCard({ title, status, message }: { title: string, status: string, message: string }) {
    const isSuccess = status === 'success';
    const isError = status === 'error';
    const isPending = status === 'pending';

    return (
        <div className={`p-6 rounded-2xl border ${isSuccess ? 'bg-green-50 border-green-100' : isError ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-200 text-green-700' : isError ? 'bg-red-200 text-red-700' : 'bg-gray-200 text-gray-500'}`}>
                    {isSuccess ? <CheckCircle2 size={20} /> : isError ? <AlertCircle size={20} /> : <RefreshCw size={20} />}
                </div>
                <div>
                    <h3 className={`font-bold ${isSuccess ? 'text-green-900' : isError ? 'text-red-900' : 'text-gray-900'}`}>{title}</h3>
                    <p className="text-sm opacity-80">{message || "Waiting..."}</p>
                </div>
            </div>
        </div>
    );
}
