"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Key, ArrowRight, ArrowLeft, Loader2, Heart } from 'lucide-react';

export default function GrandparentAccessPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Dynamically import the action
            const { verifyFamilyAccessCode } = await import('@/app/actions/grandparent');

            const result = await verifyFamilyAccessCode(accessCode);

            if (result.success && result.childId) {
                router.push(`/grandparent?childId=${result.childId}`);
            } else {
                setError(result.error || 'Invalid access code. Please check with the parents.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('System error. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-orange-100 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 blur-xl opacity-50" />

                <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">🧡</div>
                    <h2 className="text-3xl font-black text-deep">Grandparent Access</h2>
                    <p className="text-deep/50 mt-2">Enter the special code shared by the parents to see your grandchild's adventures.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form className="space-y-6 relative z-10" onSubmit={handleVerify}>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-deep/30 ml-4 uppercase tracking-[0.2em]">Village Access Code</label>
                        <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="e.g. LEGEND24"
                                className="w-full bg-zinc-50 border-2 border-transparent focus:border-primary rounded-[2rem] py-5 pl-14 pr-6 text-lg font-black tracking-widest uppercase focus:outline-none transition-all placeholder:text-deep/10"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full py-5 text-xl group flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Enter Village <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center space-y-4 pt-4 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-deep/40 hover:text-deep transition-colors">
                        <ArrowLeft size={16} /> Back to main gate
                    </Link>
                </div>
            </div>

            {/* Floaties */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden select-none opacity-20">
                <div className="absolute top-1/4 left-1/4 text-4xl animate-float">🥥</div>
                <div className="absolute bottom-1/4 right-1/4 text-4xl animate-float-slow">🥭</div>
            </div>
        </div>
    );
}
