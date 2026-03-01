"use client";

import { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle } from 'lucide-react';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: string; // 'homepage_popup' | 'story_gate' | 'game_gate' | 'lead_magnet'
    leadMagnetId?: string;
    leadMagnetTitle?: string;
    variant?: 'popup' | 'inline' | 'gate';
    onSuccess?: (email: string) => void;
}

const CARIBBEAN_ISLANDS = [
    { code: 'TT', name: 'Trinidad & Tobago' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'BB', name: 'Barbados' },
    { code: 'GY', name: 'Guyana' },
    { code: 'LC', name: 'St. Lucia' },
    { code: 'AG', name: 'Antigua & Barbuda' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'GD', name: 'Grenada' },
    { code: 'VC', name: 'St. Vincent' },
    { code: 'DM', name: 'Dominica' },
    { code: 'KN', name: 'St. Kitts & Nevis' },
    { code: 'BZ', name: 'Belize' },
    { code: 'SR', name: 'Suriname' },
    { code: 'OTHER', name: 'Other Caribbean' },
];

export default function LeadCaptureModal({
    isOpen,
    onClose,
    source,
    leadMagnetId,
    leadMagnetTitle,
    variant = 'popup',
    onSuccess
}: LeadCaptureModalProps) {
    const [step, setStep] = useState<'email' | 'details' | 'success'>('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [userType, setUserType] = useState<'parent' | 'teacher' | 'grandparent'>('parent');
    const [islandOrigin, setIslandOrigin] = useState('');
    const [isDiaspora, setIsDiaspora] = useState(false);

    if (!isOpen) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setStep('details');
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    first_name: firstName,
                    user_type: userType,
                    island_origin: islandOrigin,
                    is_diaspora: isDiaspora,
                    source,
                    lead_magnet_id: leadMagnetId,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit');
            }

            setStep('success');
            onSuccess?.(email);

            // Auto-close after success
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipDetails = async () => {
        // Submit with just email
        setIsSubmitting(true);
        try {
            await fetch('/api/lead-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    source,
                    lead_magnet_id: leadMagnetId,
                })
            });
            setStep('success');
            onSuccess?.(email);
            setTimeout(() => onClose(), 3000);
        } catch {
            setError('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-primary via-orange-500 to-yellow-500 text-white p-8 pb-12">
                    <div className="flex items-center gap-3 mb-3">
                        {leadMagnetId ? (
                            <Gift className="w-8 h-8" />
                        ) : (
                            <Sparkles className="w-8 h-8" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                            {leadMagnetId ? 'Free Download' : 'Join the Island Family'}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black leading-tight">
                        {leadMagnetTitle || 'Get Free Caribbean Kids Content'}
                    </h2>
                    <p className="text-white/80 mt-2 text-sm">
                        Stories, songs, games & printables celebrating Caribbean culture
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-8 -mt-6 bg-white rounded-t-3xl relative">
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Continue →
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                By continuing, you agree to receive emails from Likkle Legends.
                                Unsubscribe anytime.
                            </p>
                        </form>
                    )}

                    {step === 'details' && (
                        <form onSubmit={handleDetailsSubmit} className="space-y-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Help us personalize your experience! (Optional)
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    I am a...
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['parent', 'teacher', 'grandparent'] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setUserType(type)}
                                            className={`py-2 px-3 rounded-xl border-2 text-sm font-bold capitalize transition-all ${userType === type
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Caribbean Connection
                                </label>
                                <select
                                    title="Caribbean Connection"
                                    aria-label="Caribbean Connection"
                                    value={islandOrigin}
                                    onChange={(e) => setIslandOrigin(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
                                >
                                    <option value="">Select your island...</option>
                                    {CARIBBEAN_ISLANDS.map((island) => (
                                        <option key={island.code} value={island.code}>
                                            {island.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isDiaspora}
                                    onChange={(e) => setIsDiaspora(e.target.checked)}
                                    className="w-5 h-5 rounded accent-primary"
                                />
                                <span className="text-sm text-gray-600">
                                    I live outside the Caribbean (diaspora)
                                </span>
                            </label>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Joining...' : 'Join the Island Family! 🌴'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSkipDetails}
                                disabled={isSubmitting}
                                className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                            >
                                Skip for now
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                Welcome to the Island! 🎉
                            </h3>
                            <p className="text-gray-500">
                                Check your email for your free content!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
