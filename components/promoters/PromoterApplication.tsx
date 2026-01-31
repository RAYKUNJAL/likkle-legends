"use client";

import { useState } from 'react';
import { applyToBecomePromoter } from '@/app/actions/growth';
import { Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PromoterApplication() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'pending'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('idle');

        try {
            const result = await applyToBecomePromoter(email);
            if (result.success) {
                setStatus('success');
            } else if (result.status === 'pending_approval') {
                setStatus('pending');
            } else {
                setStatus('error');
                setErrorMessage(result.message || 'Application failed');
            }
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'success' || status === 'pending') {
        return (
            <div className="max-w-md mx-auto text-center py-20 px-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">Application Received! 🎉</h2>
                <p className="text-gray-500 text-lg mb-8">
                    Thanks for applying to be a Likkle Legend Promoter. Our team matches every application to ensure quality.
                    <br /><br />
                    You'll receive an email within 24 hours with your approval status.
                </p>
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm font-medium">
                    Note: We look for active social media presence or relevant blogs.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center py-12 px-4">
            <div>
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-black tracking-widest text-xs uppercase rounded-full mb-6">
                    Partnership Program
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                    Earn 20% Recurring Commission 💰
                </h1>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                    Join the movement to bring Caribbean culture to the world. Share Likkle Legends with your community and earn <b>20% for the lifetime</b> of every customer you refer.
                </p>

                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-700 font-bold">
                        <CheckCircle className="text-green-500" /> Lifetime recurring revenue
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 font-bold">
                        <CheckCircle className="text-green-500" /> High-converting funnel (7-day trial)
                    </li>
                    <li className="flex items-center gap-3 text-gray-700 font-bold">
                        <CheckCircle className="text-green-500" /> Monthly payouts via PayPal
                    </li>
                </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Apply Now</h2>
                <p className="text-gray-500 mb-8">Join 500+ other promoters today.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">PayPal Email (for payouts)</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-bold">
                            <AlertTriangle size={18} /> {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Submit Application <Send size={18} /></>}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        By applying you agree to our Affiliate Terms of Service.
                    </p>
                </form>
            </div>
        </div>
    );
}
