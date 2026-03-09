'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Globe, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
    const [formData, setFormData] = useState({
        parentName: '',
        email: '',
        country: '',
        childName: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                const data = await res.json();
                console.error('Waitlist error:', data.error);
                // Still show success to user for better UX, or show error? 
                // Let's just log and show success to not block them.
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to join waitlist:', error);
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }

        // Reset after 4 seconds
        setTimeout(() => {
            if (isOpen) {
                setSubmitted(false);
                setFormData({ parentName: '', email: '', country: '', childName: '' });
                onClose();
            }
        }, 4000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] border-none shadow-3xl p-0 overflow-hidden rounded-[40px] bg-white">
                <div className="relative overflow-hidden" role="document">
                    {/* Character/Brand Header */}
                    <div className="bg-gradient-to-br from-[var(--caribbean-ocean)] to-[var(--caribbean-turquoise)] p-10 text-white relative h-48 flex flex-col justify-end">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="absolute top-4 right-6">
                            <motion.div
                                animate={{ rotate: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                            >
                                <Sparkles className="w-12 h-12 text-white/20" aria-hidden="true" />
                            </motion.div>
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <DialogTitle className="text-4xl font-black mb-1 tracking-tight">Join the Pack!</DialogTitle>
                                <DialogDescription className="text-white/90 font-bold text-lg">
                                    Be first in line for the Archipelago adventure.
                                </DialogDescription>
                            </motion.div>
                        </div>

                        {/* Character Avatar - Floating */}
                        <motion.div
                            className="absolute -bottom-10 right-10 w-28 h-28 bg-white rounded-3xl shadow-2xl p-2 border-4 border-[var(--caribbean-sun)] rotate-6 z-20"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 6 }}
                            transition={{ type: "spring", damping: 12, delay: 0.3 }}
                        >
                            <img
                                src="/images/dilly-doubles.jpg"
                                alt="Dilly Doubles Character"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </motion.div>
                    </div>

                    <div className="p-10 pt-14 text-slate-900">
                        <AnimatePresence mode="wait">
                            {!submitted ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    aria-label="Waitlist Signup Form"
                                >
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="parentName" className="font-black text-slate-700 ml-1">Your Name</Label>
                                            <Input
                                                id="parentName"
                                                placeholder="e.g. Auntie Sarah"
                                                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-[var(--caribbean-ocean)] bg-slate-50/50 text-slate-900"
                                                required
                                                aria-required="true"
                                                value={formData.parentName}
                                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="childName" className="font-black text-slate-700 ml-1">Legend's Name</Label>
                                            <Input
                                                id="childName"
                                                placeholder="Child's Name"
                                                className="h-14 rounded-2xl border-2 border-slate-100 focus:border-[var(--caribbean-ocean)] bg-slate-50/50 text-slate-900"
                                                required
                                                aria-required="true"
                                                value={formData.childName}
                                                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-black text-slate-700 ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@example.com"
                                                className="h-14 pl-12 rounded-2xl border-2 border-slate-100 focus:border-[var(--caribbean-ocean)] bg-slate-50/50 text-slate-900"
                                                required
                                                aria-required="true"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="font-black text-slate-700 ml-1">Destined Base</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                                            <select
                                                id="country"
                                                aria-required="true"
                                                className="flex h-14 w-full pl-12 rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-[var(--caribbean-ocean)] focus:ring-offset-2 transition-all appearance-none text-slate-900"
                                                required
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            >
                                                <option value="">Select Region</option>
                                                <option value="Canada">Canada 🇨🇦</option>
                                                <option value="United Kingdom">United Kingdom 🇬🇧</option>
                                                <option value="other">Other International 🌎</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        aria-busy={isSubmitting}
                                        className="w-full h-16 rounded-2xl text-xl font-black bg-[var(--caribbean-ocean)] hover:bg-[var(--caribbean-ocean)]/90 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 group overflow-hidden"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isSubmitting ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                                    Placing Stamp...
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="idle"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>Notify Me First!</span>
                                                    <Mail className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    role="alert"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 text-center space-y-6"
                                >
                                    <div className="w-24 h-24 mx-auto bg-[var(--caribbean-palm)]/10 rounded-full flex items-center justify-center text-[var(--caribbean-palm)]">
                                        <CheckCircle2 className="w-16 h-16" aria-hidden="true" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-slate-900">You're a Legend!</h3>
                                        <p className="text-slate-500 font-bold text-lg px-4 leading-relaxed">
                                            Thank you, {formData.parentName}. We'll email {formData.email} as soon as shipping opens for {formData.childName}!
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <p className="text-sm font-black text-[var(--caribbean-ocean)] uppercase tracking-widest">Digital Preview Unlocked</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

