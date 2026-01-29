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
        
        // Frontend safety timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("The server is not responding. This usually means Vercel's connection to the AI is blocked.")), 25000)
        );

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const diagnosticPromise = runDiagnostics(session.access_token);
            const res = await Promise.race([diagnosticPromise, timeoutPromise]);
            
            setResults(res);
        } catch (error: any) {
            console.error("Test failed:", error);
            setResults({ 
                auth: { status: 'error', message: error.message },
                env: { status: 'error', message: 'Hanged' },
                ai: { status: 'error', message: 'Hanged' }
            });
            alert("Diagnostic Failure: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout activeSection="debug">
            <div className="p-8 max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">AI Diagnostics v2.1</h1>
                    <p className="text-gray-500">Last updated: Jan 29, 03:30 AM EST. Hardened with 25s timeouts.</p>
                </header>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <button
                            onClick={handleRunDiagnostics}
                            disabled={isLoading}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" /> : "Run Full System Check"}
                        </button>
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
