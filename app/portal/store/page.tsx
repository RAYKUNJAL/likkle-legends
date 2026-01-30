"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/storage';
import { MusicStoreProduct, MUSIC_STORE_PRODUCTS } from '@/lib/paypal';
import PurchaseModal from '@/components/MusicStore/PurchaseModal';
import CustomSongForm from '@/components/MusicStore/CustomSongForm';
import { Play, Download, Lock, Star, Music, Headbanging, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MusicStorePage() {
    const { user, subscription } = useUser();
    const [activeTab, setActiveTab] = useState<'music' | 'custom'>('music');
    const [songs, setSongs] = useState<any[]>([]);
    const [purchasedContent, setPurchasedContent] = useState<Set<string>>(new Set());
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<MusicStoreProduct | null>(null);
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [customRequestId, setCustomRequestId] = useState<string | null>(null);

    // Subscribers get everything for free
    const isSubscriber = subscription?.status === 'active';

    const [bundles, setBundles] = useState<any[]>([]);

    useEffect(() => {
        loadContent();
    }, [user]);

    const loadContent = async () => {
        if (!user) return;

        // Load Bundles
        const { data: bundleData } = await supabase
            .from('product_bundles')
            .select('*')
            .eq('is_active', true);
        setBundles(bundleData || []);

        // Load Songs
        const { data: songData } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });
        setSongs(songData || []);

        // Load Purchases
        const { data: purchases } = await supabase
            .from('purchased_content')
            .select('content_id')
            .eq('user_id', user.id);

        if (purchases) {
            setPurchasedContent(new Set(purchases.map(p => p.content_id)));
        }
    };

    const handlePurchaseClick = (productKey: MusicStoreProduct, contentId?: string) => {
        if (!user) {
            toast.error("Please log in to purchase music");
            return;
        }
        setSelectedProduct(productKey);
        setSelectedContentId(contentId || null);
        setIsPurchaseModalOpen(true);
    };

    const handleCustomSongSuccess = (requestId: string) => {
        setCustomRequestId(requestId);
        handlePurchaseClick('custom_song_request', requestId); // Pass request ID as content ID
    };

    const handlePurchaseSuccess = () => {
        toast.success("Purchase successful! You can now download your music.");
        loadContent(); // Refresh purchases
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] p-8 md:p-12">
            <header className="max-w-6xl mx-auto mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 font-display">
                    Likke Legends <span className="text-purple-600">Music Store</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Bring the rhythm of the island home! Download your favorite tracks or request a custom song made just for your little legend.
                </p>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => setActiveTab('music')}
                        className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'music'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        Music Downloads
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${activeTab === 'custom'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Sparkles size={18} /> Custom Songs
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {activeTab === 'music' ? (
                    <div className="space-y-12">
                        {/* Featured Bundles */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {bundles.length > 0 ? (
                                <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-black mb-2">{bundles[0].title}</h3>
                                        <p className="mb-6 opacity-90">{bundles[0].description}</p>
                                        <div className="text-4xl font-black mb-6">${bundles[0].price}</div>
                                        <button
                                            onClick={() => handlePurchaseClick('track_bundle_5', bundles[0].id)}
                                            className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
                                        >
                                            Buy Bundle
                                        </button>
                                    </div>
                                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                                        <Music size={200} />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-3xl p-8 flex items-center justify-center">
                                    <p className="font-bold text-gray-400">Loading Bundles...</p>
                                </div>
                            )}

                            <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-xl flex flex-col justify-center items-center text-center">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Unlimited Access?</h3>
                                <p className="text-gray-500 mb-6">Join the Legends Club for $9.99/mo and get ALL downloads for free!</p>
                                <a href="/portal/subscription" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                                    Upgrade Now
                                </a>
                            </div>
                        </div>

                        {/* Song List */}
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Music size={24} className="text-purple-600" />
                                All Tracks
                            </h2>
                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                                {songs.map((song, i) => {
                                    const isOwned = isSubscriber || purchasedContent.has(song.id);

                                    return (
                                        <div key={song.id} className="p-4 flex items-center justify-between hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{song.title}</h4>
                                                    <p className="text-xs text-gray-400">{song.artist || 'Likkle Legends'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Preview Button (Placeholder logic for now) */}
                                                <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-50">
                                                    <Play size={20} fill="currentColor" />
                                                </button>

                                                {isOwned ? (
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 transition-colors"
                                                        onClick={() => window.open(song.url, '_blank')}
                                                    >
                                                        <Download size={16} /> Download
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePurchaseClick('single_track', song.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                                                    >
                                                        $0.99
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Custom Song Form Tab
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl mb-8">
                                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <Sparkles className="text-indigo-600" />
                                    Order a Custom Song
                                </h2>
                                <CustomSongForm onSuccess={handleCustomSongSuccess} />
                            </div>
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-8">
                            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                                <h3 className="text-2xl font-black mb-4">Why Custom Songs?</h3>
                                <ul className="space-y-4 relative z-10">
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 bg-white/20 rounded-full mt-1">
                                            <Check size={14} />
                                        </div>
                                        <p>Make your child the STAR of their own island anthem.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 bg-white/20 rounded-full mt-1">
                                            <Check size={14} />
                                        </div>
                                        <p>Perfect for birthdays, graduations, or just a confidence boost.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="p-1 bg-white/20 rounded-full mt-1">
                                            <Check size={14} />
                                        </div>
                                        <p>High-quality MP3 delivery within 48 hours.</p>
                                    </li>
                                </ul>
                                <div className="absolute right-[-30px] bottom-[-30px] opacity-10">
                                    <Star size={200} />
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-2">Hear a Sample</h4>
                                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                    <button className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                        <Play size={16} fill="currentColor" />
                                    </button>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">"Happy Birthday Liam!"</p>
                                        <p className="text-xs text-gray-500">Custom Reggae Birthday Song</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {selectedProduct && (
                <PurchaseModal
                    isOpen={isPurchaseModalOpen}
                    onClose={() => setIsPurchaseModalOpen(false)}
                    productKey={selectedProduct}
                    contentId={selectedContentId || undefined}
                    onSuccess={handlePurchaseSuccess}
                />
            )}
        </div>
    );
}
