"use client";

import { useState } from 'react';
import { Mail, MessageCircle, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { sendSupportMessage } from '@/lib/database';

export default function ContactClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Subscription Question',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await sendSupportMessage({
                parent_name: formData.name,
                parent_email: formData.email,
                subject: formData.subject,
                message: formData.message,
                status: 'new'
            });
            setIsSuccess(true);
            setFormData({ name: '', email: '', subject: 'Subscription Question', message: '' });
        } catch (err) {
            setError('Something went wrong. Please try again later.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="text-primary font-bold uppercase tracking-widest text-sm pl-2">Get in touch</span>
                <h1 className="text-5xl font-black text-deep">We'd love to hear from you</h1>
                <p className="text-xl text-deep/60">Questions about your subscription? Ideas for new legends? Or just want to say hello?</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] shadow-2xl border border-zinc-100">
                    {isSuccess ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-3xl font-black text-deep">Message Sent!</h2>
                            <p className="text-xl text-deep/60 max-w-md">
                                Thanks for reaching out. Tanty Spice and the team will get back to you shortly!
                            </p>
                            <button
                                onClick={() => setIsSuccess(false)}
                                className="btn btn-primary px-8"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-deep/40 pl-2">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full p-6 bg-zinc-50 rounded-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-black uppercase tracking-widest text-deep/40 pl-2">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className="w-full p-6 bg-zinc-50 rounded-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-black uppercase tracking-widest text-deep/40 pl-2">Subject</label>
                                <select
                                    id="subject"
                                    aria-label="Subject"
                                    value={formData.subject}
                                    onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                                    className="w-full p-6 bg-zinc-50 rounded-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none text-deep"
                                >
                                    <option>Subscription Question</option>
                                    <option>Content Suggestion</option>
                                    <option>Technical Issue</option>
                                    <option>Wholesale/School Inquiry</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-black uppercase tracking-widest text-deep/40 pl-2">Message</label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                    className="w-full p-6 bg-zinc-50 rounded-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none"
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>

                            {error && (
                                <p className="text-red-500 font-bold text-center">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary btn-lg w-full py-6 text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="space-y-8">
                    <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <h3 className="text-2xl font-black mb-6">Quick Contact</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Mail size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Email Us</p>
                                    <p className="font-bold">hello@likklelegends.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Phone size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Call Us</p>
                                    <p className="font-bold">+1 (800) LIKKLE-1</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><MapPin size={24} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase opacity-60">Headquarters</p>
                                    <p className="font-bold">Port of Spain, Trinidad</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-deep text-white p-10 rounded-[3rem] shadow-2xl">
                        <h3 className="text-2xl font-black mb-4">Live Chat</h3>
                        <p className="text-white/60 mb-8 leading-relaxed">Our AI Coach Tanty Spice is always online to help with quick questions.</p>
                        <button
                            onClick={() => {
                                const widget = document.querySelector('button[class*="bg-accent"]');
                                if (widget instanceof HTMLElement) widget.click();
                            }}
                            className="w-full flex items-center justify-between p-6 bg-white/10 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all font-bold text-lg"
                        >
                            Ask Tanty Spice <MessageCircle />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
