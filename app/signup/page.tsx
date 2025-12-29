"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function SignupPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-5 blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 blur-[100px] -ml-48 -mb-48"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <Link href="/" className="flex justify-center mb-10 group">
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-zinc-100 group-hover:border-primary transition-all">
                        <ArrowLeft size={18} className="text-zinc-400 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                        <span className="font-bold text-deep/60 group-hover:text-deep">Back to home</span>
                    </div>
                </Link>
                <div className="text-center">
                    <img src="/images/logo.png" alt="Likkle Legends" className="mx-auto h-16 w-auto mb-8" />
                    <h2 className="text-4xl font-black text-deep tracking-tight">Create your account</h2>
                    <p className="mt-4 text-lg text-deep/40 font-bold">
                        Start your child's Caribbean adventure today.
                    </p>
                </div>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
                <div className="bg-white py-12 px-10 shadow-2xl shadow-zinc-200/50 rounded-[3.5rem] border border-zinc-100">
                    <form className="space-y-8">
                        <div>
                            <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Child's Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Kai..."
                                    className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@heritage.com"
                                    className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Create Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="block w-full pl-14 pr-5 py-5 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-deep font-bold placeholder:text-deep/20 text-lg"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full flex justify-center py-6 px-10 border border-transparent rounded-[2rem] shadow-xl shadow-primary/20 text-xl font-black text-white bg-primary hover:scale-[1.02] active:scale-95 transition-all focus:outline-none ring-offset-4 focus:ring-4 focus:ring-primary/40 group"
                        >
                            Start Adventure <Sparkles size={24} className="ml-3 group-hover:rotate-12 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-zinc-50">
                        <p className="text-center text-deep/40 font-bold">
                            Already part of the club?{' '}
                            <Link href="/login" className="text-primary hover:underline font-black">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-deep/20 font-bold uppercase tracking-widest">
                    Safe for kids. Trusted by parents. 🛡️
                </p>
            </div>
        </div>
    );
}
