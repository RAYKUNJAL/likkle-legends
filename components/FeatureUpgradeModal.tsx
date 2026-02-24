"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { TIER_INFO, SubscriptionTier, getUpgradeTier } from '@/lib/feature-access';

interface FeatureUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName: string;
    featureDescription: string;
    currentTier: SubscriptionTier;
    requiredTier: SubscriptionTier;
}

export default function FeatureUpgradeModal({
    isOpen,
    onClose,
    featureName,
    featureDescription,
    currentTier,
    requiredTier
}: FeatureUpgradeModalProps) {
    // Handle escape key to close modal
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const upgradeTier = getUpgradeTier(currentTier);
    const tierInfo = TIER_INFO[upgradeTier];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    type="button"
                    aria-label="Close modal"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white text-center space-y-4">
                    <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Lock size={32} />
                        </div>
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-black mb-2">Unlock {featureName}</h2>
                        <p className="text-white/80 font-medium">{featureDescription}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Current Status */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Your Current Plan</p>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-black text-gray-900 capitalize">{currentTier === 'free' ? 'Free' : TIER_INFO[currentTier]?.name}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold">Active</span>
                        </div>
                    </div>

                    {/* Upgrade Tier */}
                    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border-2 border-primary/30">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Recommended</p>
                                <h3 className="text-2xl font-black text-deep">{tierInfo.name}</h3>
                                <p className="text-sm text-deep/60 font-bold mt-1">{tierInfo.description}</p>
                            </div>
                            <Sparkles className="text-primary flex-shrink-0" size={24} />
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-3xl font-black text-deep">
                                ${tierInfo.price_monthly}
                            </span>
                            <span className="text-deep/60 font-bold">/month</span>
                            {tierInfo.price_yearly && (
                                <span className="text-xs font-bold text-green-600 ml-auto">
                                    or ${tierInfo.price_yearly}/year
                                </span>
                            )}
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                            {tierInfo.features.slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Check className="text-green-500 flex-shrink-0" size={18} />
                                    <span className="text-sm font-bold text-deep/80">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <Link
                            href={`/checkout?plan=${upgradeTier}`}
                            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-center transition-colors flex items-center justify-center gap-2 group"
                        >
                            Upgrade to {tierInfo.name}
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-deep py-3 rounded-2xl font-bold transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>

                    {/* Trust Badge */}
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-bold">
                            ✓ Cancel anytime • No hidden fees • 7-day free trial
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
