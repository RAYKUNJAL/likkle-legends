"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LibraryDashboard } from '@/components/dashboard/LibraryDashboard';
import { useUser } from '@/components/UserContext';
import { ArrowLeft, Library } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
    const { user } = useUser();

    return (
        <div className="bg-[#FDFCF0] min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 pt-36 pb-32">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/parent"
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all border border-slate-100 shadow-sm"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                                My Library
                                <Library className="text-primary" size={48} />
                            </h1>
                            <p className="text-slate-500 font-bold text-lg mt-2">Your family's collection of Caribbean creations.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
                    <LibraryDashboard user={user} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
