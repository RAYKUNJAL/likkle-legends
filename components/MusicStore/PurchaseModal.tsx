"use client";

import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { X, Sparkles, Music2, Loader2, CheckCircle2 } from 'lucide-react';
import { MUSIC_STORE_PRODUCTS, MusicStoreProduct } from '@/lib/paypal';
import { useUser } from '@/components/UserContext';

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    productKey: MusicStoreProduct;
    contentId?: string; // song ID if single download
    contentTitle?: string;
    onSuccess: () => void;
    metadata?: any;
}

export default function PurchaseModal({
    isOpen, onClose, productKey, contentId, contentTitle, onSuccess, metadata
}: PurchaseModalProps) {
    const { user } = useUser();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const product = MUSIC_STORE_PRODUCTS[productKey];

    if (!isOpen) return null;

    const handleApprove = async (data: any) => {
        setIsProcessing(true);
        setError(null);
        try {
            // Get session token
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());

            const response = await fetch('/api/payments/paypal/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ orderID: data.orderID })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Payment validation failed');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Payment Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-sm w-full relative overflow-hidden shadow-2xl animate-scale-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg rotate-3 transform">
                        {productKey === 'custom_song_request' ? <Sparkles size={32} /> : <Music2 size={32} />}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {contentTitle || product.name}
                    </h2>

                    <p className="text-gray-500 mb-6 font-medium">
                        {productKey === 'custom_song_request'
                            ? "Make their day magical with a song made just for them!"
                            : "Own this track forever. Download & listen offline."}
                    </p>

                    <div className="text-4xl font-black text-primary mb-8">
                        ${product.price}
                    </div>

                    {isProcessing ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-3 text-purple-600">
                            <Loader2 className="animate-spin" size={32} />
                            <span className="font-bold">Confirming Purchase...</span>
                        </div>
                    ) : (
                        <div className="min-h-[150px]">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl font-bold">
                                    {error}
                                </div>
                            )}

                            <PayPalScriptProvider options={{
                                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                                currency: 'USD',
                                intent: 'capture'
                            }}>
                                <PayPalButtons
                                    style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
                                    createOrder={async () => {
                                        // Get session token inside the callback
                                        const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());

                                        const res = await fetch('/api/payments/paypal/create-order', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${session?.access_token}`
                                            },
                                            body: JSON.stringify({
                                                productId: productKey,
                                                contentId: contentId,
                                                metadata
                                            })
                                        });
                                        const order = await res.json();
                                        if (order.error) throw new Error(order.error);
                                        return order.id;
                                    }}
                                    onApprove={handleApprove}
                                    onError={(err) => setError("PayPal Error: " + err.toString())}
                                />
                            </PayPalScriptProvider>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
