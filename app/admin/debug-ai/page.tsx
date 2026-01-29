"use client";

import { useState } from 'react';
import { AdminLayout, RefreshCw, CheckCircle2, AlertCircle } from '@/components/admin/AdminComponents'; // Adjust imports if needed
import { runDiagnostics } from '@/app/actions/debug-ai';

export default function DebugAIPage() {
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunDiagnostics = async () => {
        setIsLoading(true);
        setResults(null);
        const { toast } = await import('react-hot-toast');
        const toastId = toast.loading("Checking AI Brain (20s safety limit)...");

        let hasTimedOut = false;
        const timer = setTimeout(() => {
            hasTimedOut = true;
            setIsLoading(false);
            toast.error("Vercel did not respond in time (20s). This usually means the connection is blocked.", { id: toastId });
            setResults({
                auth: { status: 'error', message: "TIMEOUT" },
                env: { status: 'error', message: "STUCK" },
                ai: { status: 'error', message: "STUCK" }
            });
        }, 20000);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const res = await runDiagnostics(session.access_token);
            clearTimeout(timer);

            if (hasTimedOut) return;

            setResults(res);
            toast.success("Diagnostics Complete!", { id: toastId });
        } catch (error: any) {
            clearTimeout(timer);
            console.error("Test failed:", error);
            if (!hasTimedOut) {
                toast.error("Diagnostic Failed: " + error.message, { id: toastId });
                setResults({
                    auth: { status: 'error', message: error.message },
                    env: { status: 'error', message: 'ERROR' },
                    ai: { status: 'error', message: 'ERROR' }
                });
            }
        } finally {
            if (!hasTimedOut) setIsLoading(false);
        }
    };

    return (
        <AdminLayout activeSection="debug">
            <div className="p-8 max-w-4xl mx-auto">
                <header className="mb-8 p-8 bg-blue-50 rounded-[3rem] border-4 border-blue-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-blue-900">AI Diagnostics v2.3</h1>
                        <p className="text-blue-800/60 font-bold">Layered Defense Deployed: Jan 29, 10:55 AM</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-4 bg-white rounded-2xl shadow-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors"
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
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    const { runPing } = await import('@/app/actions/debug-ai');
                                    const res = await runPing();
                                    alert("Server Ping: " + res.status + " at " + res.timestamp);
                                }}
                                className="flex-1 py-4 bg-blue-100 text-blue-700 rounded-xl font-bold"
                            >
                                Test Action Tunnel (Ping)
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="grid gap-4">
                            {/* Auth Status */}
                            <DiagnosticCard
                                title="Admin Authentication"
                                status={results.auth?.status}
                                message={results.auth?.message}
                            />

                            {/* Key Status */}
                            <DiagnosticCard
                                title="Environment Key (Gemini)"
                                status={results.env?.status}
                                message={results.env?.message}
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
