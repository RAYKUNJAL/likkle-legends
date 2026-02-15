"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    School,
    BookOpen,
    Users,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Building2,
    GraduationCap,
    Clock
} from 'lucide-react';
import { createLead } from '@/app/actions/crm';
import toast from 'react-hot-toast';

export function SchoolLeadForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        schoolName: '',
        role: '',
        email: '',
        interestLevel: 'exploring'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createLead({
                email: formData.email,
                source: 'school_partner',
                child_name: formData.schoolName, // Using child_name field for school name in CRM
                metadata: {
                    contact_name: formData.name,
                    role: formData.role,
                    interest_level: formData.interestLevel
                }
            } as any);

            if (result.success) {
                setIsSuccess(true);
                toast.success("Inquiry sent! We'll be in touch shortly.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } catch (err) {
            toast.error("Failed to send inquiry.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 text-center border-4 border-green-50 shadow-xl">
                <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-500" size={40} />
                </div>
                <h3 className="text-3xl font-black text-orange-950 mb-4">Request Received!</h3>
                <p className="text-orange-900/60 font-bold mb-8">
                    An education specialist will review your request and contact you at <span className="text-orange-600">{formData.email}</span> within 24 hours.
                </p>
                <button
                    onClick={() => setIsSuccess(false)}
                    className="text-sm font-black text-orange-400 uppercase tracking-widest hover:text-orange-500 transition-colors"
                >
                    Send another inquiry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border-8 border-orange-50 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="mb-10">
                    <h3 className="text-3xl font-black text-orange-950 mb-2 italic">Partner with Legends</h3>
                    <p className="text-orange-900/40 font-bold uppercase text-xs tracking-widest">Bring Caribbean Magic to your classroom</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-orange-900/40 ml-4 tracking-widest">Your Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Full Name"
                                className="w-full h-14 px-6 rounded-2xl bg-orange-50/30 border-2 border-transparent focus:border-orange-200 outline-none font-bold transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-orange-900/40 ml-4 tracking-widest">School Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Name of Institution"
                                className="w-full h-14 px-6 rounded-2xl bg-orange-50/30 border-2 border-transparent focus:border-orange-200 outline-none font-bold transition-all"
                                value={formData.schoolName}
                                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-orange-900/40 ml-4 tracking-widest">Your Role</label>
                            <select
                                className="w-full h-14 px-6 rounded-2xl bg-orange-50/30 border-2 border-transparent focus:border-orange-200 outline-none font-bold transition-all appearance-none cursor-pointer"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="">Select Role...</option>
                                <option value="teacher">Teacher / Educator</option>
                                <option value="principal">Principal / Admin</option>
                                <option value="librarian">Librarian</option>
                                <option value="curriculum">Curriculum Coordinator</option>
                                <option value="owner">Preschool Owner</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-orange-900/40 ml-4 tracking-widest">Contact Email</label>
                            <input
                                required
                                type="email"
                                placeholder="professional@email.com"
                                className="w-full h-14 px-6 rounded-2xl bg-orange-50/30 border-2 border-transparent focus:border-orange-200 outline-none font-bold transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-orange-900/40 ml-4 tracking-widest">Interest Level</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['exploring', 'demo_needed', 'quote_ready'].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, interestLevel: level })}
                                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.interestLevel === level
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-orange-50 text-orange-900/40 hover:bg-orange-100'
                                        }`}
                                >
                                    {level.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>SEND INQUIRY <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}

export function SchoolStatBlock({ icon, title, text }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-orange-50/50 border-2 border-orange-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-xl font-black text-orange-950 mb-3">{title}</h4>
            <p className="text-orange-900/60 font-bold text-sm leading-relaxed">{text}</p>
        </div>
    );
}
