'use client';

import { Bot, Shield } from 'lucide-react';

export default function ChatbotStaticCard() {
    return (
        <section className="py-16 bg-zinc-50">
            <div className="container">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                                <Bot className="w-7 h-7 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-deep mb-2">
                                    Guided by Friendly Characters
                                </h3>
                                <p className="text-deep/60 leading-relaxed">
                                    Inside the platform, kids are guided by friendly characters who help them explore stories, music, and games safely. All interactions are designed with parents in mind.
                                </p>
                                <div className="flex items-center gap-2 mt-4 text-sm text-deep/50">
                                    <Shield className="w-4 h-4" />
                                    <span>Available after signup • Parent-controlled</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
