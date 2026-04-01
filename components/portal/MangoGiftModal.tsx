'use client';

import React, { useState } from 'react';
import { X, Gift, Send, Sparkles, User, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMangoGift } from '@/lib/services/gamification';

interface MangoGiftModalProps {
    senderId: string;
    friends: Array<{ id: string; first_name: string; avatar_url?: string }>;
    onClose: () => void;
    onGiftSent?: () => void;
}

const MangoGiftModal: React.FC<MangoGiftModalProps> = ({ senderId, friends, onClose, onGiftSent }) => {
    const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(f =>
        f.first_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSend = async () => {
        if (!selectedFriend) return;
        setIsSending(true);
        setError(null);

        try {
            const result = await sendMangoGift(senderId, selectedFriend, message);
            if (result.success) {
                onGiftSent?.();
                onClose();
            } else {
                setError(result.error || 'Failed to send gift');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-xl shadow-orange-600/20 animate-bounce">
                        🥭
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Gift a Mango!</h2>
                    <p className="text-amber-50/80 font-bold">Celebrate a friend in de village</p>
                </div>

                <div className="p-8">
                    {/* Friends Search / List */}
                    <div className="mb-6">
                        <label className="block text-slate-400 font-bold text-sm uppercase tracking-wider mb-3">
                            Choose a Legend
                        </label>
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:outline-none focus:border-orange-200 transition-colors"
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredFriends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedFriend === friend.id
                                            ? 'bg-orange-50 border-orange-200 scale-[1.02]'
                                            : 'bg-white border-transparent hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt={`${friend.first_name}'s avatar`} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <User className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-black text-slate-700">{friend.first_name}</p>
                                    </div>
                                    {selectedFriend === friend.id && (
                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-3 h-3 text-white fill-current" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="mb-8">
                        <label className="block text-slate-400 font-bold text-sm uppercase tracking-wider mb-3">
                            Caribbean Cheers (Optional)
                        </label>
                        <textarea
                            placeholder="Big up yourself! You're a legend!"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-700 h-24 focus:outline-none focus:border-orange-200 transition-colors resize-none"
                        />
                        <p className="mt-2 text-slate-400 text-xs font-bold flex items-center gap-1">
                            ✨ Receiver gets <span className="text-orange-500">+5 XP</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        disabled={!selectedFriend || isSending}
                        onClick={handleSend}
                        className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-lg transition-all ${!selectedFriend || isSending
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-orange-200'
                            }`}
                    >
                        {isSending ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-6 h-6" />
                                Send de Mango
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MangoGiftModal;
