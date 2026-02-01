"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Sparkles, Palette, Baby } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { updateChild, deleteChild } from '@/lib/database';

export default function EditChildPage() {
    const { id } = useParams();
    const router = useRouter();
    const { children, user } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const child = children.find(c => c.id === id);

    const [formData, setFormData] = useState({
        first_name: '',
        age: 4,
        primary_island: 'Jamaica',
        age_track: 'mini' as 'mini' | 'big'
    });

    useEffect(() => {
        if (child) {
            setFormData({
                first_name: child.first_name || '',
                age: child.age || 4,
                primary_island: child.primary_island || 'Jamaica',
                age_track: child.age_track || (child.age && child.age >= 6 ? 'big' : 'mini')
            });
        }
    }, [child]);

    if (!child) {
        return (
            <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-deep mb-4">Legend Not Found</h1>
                <Link href="/parent" className="text-primary font-bold hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            await updateChild(id as string, formData);
            router.push('/parent');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove this legend profile? All progress will be lost.')) return;

        setIsDeleting(true);
        try {
            await deleteChild(id as string);
            router.push('/parent');
        } catch (err) {
            setError('Failed to delete profile.');
        } finally {
            setIsDeleting(false);
        }
    };

    const islands = [
        "Jamaica", "Trinidad and Tobago", "Barbados", "Guyana", "St. Lucia",
        "Grenada", "Antigua and Barbuda", "Bahamas", "St. Vincent", "Dominica",
        "St. Kitts and Nevis", "Belize", "Suriname", "Haiti", "Dominican Republic"
    ];

    return (
        <div className="min-h-screen bg-[#FFFDF7] pb-24">
            <header className="bg-white border-b border-zinc-100 py-6 sticky top-0 z-30">
                <div className="container max-w-2xl flex items-center justify-between">
                    <Link href="/parent" className="p-2 hover:bg-zinc-50 rounded-xl transition-all">
                        <ArrowLeft size={24} className="text-zinc-600" />
                    </Link>
                    <h1 className="text-xl font-black text-deep">Edit Legend Profile</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </header>

            <main className="container max-w-2xl pt-12">
                <form onSubmit={handleSave} className="space-y-10">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-100">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-primary/20">
                                {formData.first_name.charAt(0) || '?'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-deep">Legend Basics</h2>
                                <p className="text-deep/40 font-bold">Update your child's journey details.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="child-first-name" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">First Name</label>
                                <input
                                    id="child-first-name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="block w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-deep"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="child-age" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Age</label>
                                    <input
                                        id="child-age"
                                        type="number"
                                        min="2"
                                        max="12"
                                        value={formData.age}
                                        onChange={(e) => {
                                            const age = parseInt(e.target.value);
                                            setFormData({
                                                ...formData,
                                                age,
                                                age_track: age >= 6 ? 'big' : 'mini'
                                            });
                                        }}
                                        className="block w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-deep"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Age Track</label>
                                    <div className="px-6 py-4 bg-zinc-100 rounded-2xl font-black text-deep/40 text-sm uppercase tracking-wider">
                                        {formData.age_track === 'mini' ? 'Mini Legends (4-5)' : 'Big Legends (6-8)'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="child-island" className="block text-xs font-black text-deep/30 uppercase tracking-widest mb-3 px-1">Primary Island Heritage</label>
                                <select
                                    id="child-island"
                                    value={formData.primary_island}
                                    onChange={(e) => setFormData({ ...formData, primary_island: e.target.value })}
                                    className="block w-full px-6 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-deep appearance-none"
                                    aria-label="Primary Island Heritage"
                                >
                                    {islands.map(island => (
                                        <option key={island} value={island}>{island}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving Changes...' : <><Save size={24} /> Save Legend Profile</>}
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} /> Remove Profile
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
