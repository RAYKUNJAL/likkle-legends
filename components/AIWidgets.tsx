"use client";

import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { askTantySpice } from '@/app/actions/tanty';
import { siteContent } from '@/lib/content';

export default function TantySpiceWidget() {
    const { tanty_spice_chat } = siteContent;
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<{ role: 'user' | 'tanty', text: string }[]>([
        { role: 'tanty', text: tanty_spice_chat.welcome_message }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = message;
        setMessage("");
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);

        setIsTyping(true);

        try {
            const response = await askTantySpice(userMsg);
            setChat(prev => [...prev, { role: 'tanty', text: response }]);
        } catch (e) {
            setChat(prev => [...prev, { role: 'tanty', text: tanty_spice_chat.states.error.message }]);
        }

        setIsTyping(false);
    };

    if (!tanty_spice_chat.enabled) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
                >
                    <MessageSquare size={32} />
                    <span className="absolute -top-2 -right-2 bg-white text-accent text-xs font-bold px-2 py-1 rounded-full border-2 border-accent">AI Coach</span>
                </button>
            ) : (
                <div className="w-[380px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col h-[600px] animate-in slide-in-from-bottom duration-500 glass">
                    <div className="bg-accent p-6 text-white flex items-center justify-between shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold border-2 border-white/40 overflow-hidden shadow-inner">
                                <img src="/images/tanty_spice.png" alt="Tanty" className="w-full h-full object-cover" onError={(e) => {
                                    e.currentTarget.src = "https://ui-avatars.com/api/?name=Tanty+Spice&background=FF3FB4&color=fff";
                                }} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{tanty_spice_chat.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <p className="text-xs text-white/80">{tanty_spice_chat.status_text}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            title="Close chat"
                            className="hover:rotate-90 transition-transform"
                        >
                            <X />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
                        {chat.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border text-deep rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-xs text-deep/40 italic">{tanty_spice_chat.states.loading.message}</div>}
                    </div>

                    <div className="p-6 border-t bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-10">
                        <input
                            type="text"
                            placeholder={tanty_spice_chat.input_placeholder}
                            className="flex-1 bg-zinc-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all border-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            aria-label={tanty_spice_chat.button_label}
                            title={tanty_spice_chat.button_label}
                            className="bg-accent w-12 h-12 rounded-2xl text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
