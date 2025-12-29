"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-border">
                <div className="text-center">
                    <Link href="/" className="inline-block relative w-48 h-12 mb-8">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </Link>
                    <h2 className="text-3xl font-bold text-deep">Welcome Back!</h2>
                    <p className="text-deep/50 mt-2">Log in to your cultural gateway.</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href = '/portal'; }}>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                            <input
                                type="email"
                                placeholder="legend@island.com"
                                className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-deep/60 ml-4 uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-zinc-50 border-2 border-border focus:border-primary rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full py-5 text-lg group">
                        Login to Universe <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center space-y-4 pt-4">
                    <Link href="#" className="text-sm font-bold text-primary hover:underline">Forgot password?</Link>
                    <div className="text-sm text-deep/40">
                        Don't have an account? <Link href="/#pricing" className="text-secondary font-bold hover:underline">Start your adventure</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
