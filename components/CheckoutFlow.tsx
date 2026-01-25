"use client";

import { useState, useEffect, Component, ErrorInfo } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Check, ShieldCheck, Sparkles, Gift, AlertCircle, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, UPSELLS, getLocalizedPrice, SubscriptionTier } from '@/lib/paypal';
import { detectCountry, GeoInfo } from '@/lib/geo-routing';
import { supabase } from '@/lib/storage';
import { useUser } from '@/components/UserContext';
import { trackEvent } from '@/lib/analytics';

// Simple Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo) {
        console.error("Checkout Error Boundary caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">Something went wrong</h2>
                    <p className="text-red-600 mb-6">We encountered an issue loading the checkout. Please refresh the page.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary px-6 py-3"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

interface CheckoutFlowProps {
    selectedTier?: SubscriptionTier;
    initialBillingCycle?: 'month' | 'year';
    initialChildName?: string;
    onSuccess?: (subscriptionId: string) => void;
    onError?: (error: unknown) => void;
}

function CheckoutFlowContent({ selectedTier, initialBillingCycle, initialChildName, onSuccess, onError }: CheckoutFlowProps) {
    const [step, setStep] = useState<'plan' | 'upsells' | 'shipping' | 'payment' | 'success'>('plan');

    // Normalize tier to ensure it's valid
    const initialTier = (selectedTier && SUBSCRIPTION_PLANS[selectedTier]) ? selectedTier : 'legends_plus';
    const [activeTier, setActiveTier] = useState<SubscriptionTier>(initialTier);

    const [geoInfo, setGeoInfo] = useState<GeoInfo | null>(null);
    const [addGrandparent, setAddGrandparent] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentBillingCycle, setPaymentBillingCycle] = useState<'month' | 'year'>(initialBillingCycle || 'month');

    // Shipping Address State
    const [shippingData, setShippingData] = useState({
        name: initialChildName || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    // Safe user access
    const { user, isLoading: authLoading } = useUser();
    const [configError, setConfigError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        detectCountry().then(setGeoInfo);

        // Config Validation
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        if (!clientId) {
            console.error("❌ CRITICAL: NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing from .env.local");
            if (process.env.NODE_ENV === 'development') {
                setConfigError("Missing PayPal Client ID. Check console.");
            }
        }
    }, []);

    // Force annual billing for Family Legacy (no monthly plan exists)
    useEffect(() => {
        if (activeTier === 'family_legacy') {
            setPaymentBillingCycle('year');
        }
    }, [activeTier]);

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    const plan = SUBSCRIPTION_PLANS[activeTier] || SUBSCRIPTION_PLANS['legends_plus'];
    const grandparentUpsell = UPSELLS.grandparent_dashboard;

    // Determine base price to display (monthly or yearly / 12)
    const priceToUse = paymentBillingCycle === 'year'
        ? (plan.priceYearly ? plan.priceYearly / 12 : plan.price * 0.83)
        : plan.price;

    const displayPrice = geoInfo
        ? getLocalizedPrice(paymentBillingCycle === 'year' ? (plan.priceYearly || plan.price * 10) : plan.price, geoInfo.countryCode)
        : { price: paymentBillingCycle === 'year' ? (plan.priceYearly || plan.price * 10) : plan.price, currency: 'USD', symbol: '$' };

    const monthlyEquiv = paymentBillingCycle === 'year'
        ? (displayPrice.price / 12).toFixed(2)
        : displayPrice.price;

    const grandparentPrice = geoInfo
        ? getLocalizedPrice(grandparentUpsell.price, geoInfo.countryCode)
        : { price: grandparentUpsell.price, currency: 'USD', symbol: '$' };

    const totalPrice = displayPrice.price + (addGrandparent ? grandparentPrice.price : 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePayPalApprove = async (data: any) => {
        setIsProcessing(true);
        // Payment approved

        try {
            // Robust auth check
            let currentUserId = user?.id;

            if (!currentUserId) {
                // Fallback if useUser is slow, check session directly
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    // Instead of alerting, maybe store pending state? For now alert
                    throw new Error("Please sign in to complete your subscription.");
                }
                currentUserId = session.user.id;
            }

            // Save subscription to database
            const response = await fetch('/api/payments/paypal/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscriptionId: data.subscriptionID,
                    orderId: data.orderID,
                    tier: activeTier,
                    addGrandparent,
                    currency: displayPrice.currency,
                    billingCycle: paymentBillingCycle,
                    userId: currentUserId, // Explicitly pass ID to be safe
                    shipping: (activeTier === 'trial_access') ? null : shippingData
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to confirm subscription');
            }

            setStep('success');

            // Track Conversion
            trackEvent('purchase', {
                value: totalPrice,
                currency: displayPrice.currency,
                items: [{
                    item_id: activeTier,
                    item_name: plan.name,
                    price: totalPrice
                }]
            });

            onSuccess?.(data.subscriptionID || data.orderID || '');
        } catch (error) {
            console.error('Payment confirmation failed:', error);
            alert(`Payment recorded but account update failed: ${(error as Error).message}. Please contact support.`);
            onError?.(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {['plan', 'upsells', 'shipping', 'payment'].map((s, i) => {
                    // Skip shipping on digital only if we want, but keeping it for consistency
                    const isDigital = activeTier === 'trial_access';
                    if (s === 'shipping' && isDigital) return null;

                    return (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === s
                                ? 'bg-primary text-white'
                                : ['plan', 'upsells', 'shipping', 'payment'].indexOf(step) > ['plan', 'upsells', 'shipping', 'payment'].indexOf(s)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {['plan', 'upsells', 'shipping', 'payment'].indexOf(step) > ['plan', 'upsells', 'shipping', 'payment'].indexOf(s) ? <Check size={20} /> : i + 1}
                            </div>
                            {i < 3 && (
                                <div className={`w-16 h-1 mx-2 ${['plan', 'upsells', 'shipping', 'payment'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Choose Plan */}
            {step === 'plan' && (
                <div>
                    <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Choose Your Plan</h2>
                    <p className="text-center text-gray-500 mb-8">
                        Start your child's Caribbean learning adventure today
                    </p>

                    {/* Billing Toggle in Checkout */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
                            <button
                                onClick={() => setPaymentBillingCycle('month')}
                                disabled={activeTier === 'family_legacy'}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${paymentBillingCycle === 'month'
                                    ? 'bg-primary text-white shadow-sm'
                                    : activeTier === 'family_legacy'
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPaymentBillingCycle('year')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${paymentBillingCycle === 'year'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Annual
                                <span className="px-2 py-0.5 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                                    -20%
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {(Object.entries(SUBSCRIPTION_PLANS) as [SubscriptionTier, typeof plan][]).map(([id, p]) => {
                            // Calculate display price based on toggle
                            const pPrice = paymentBillingCycle === 'year'
                                ? (geoInfo ? getLocalizedPrice(p.priceYearly || p.price * 10, geoInfo.countryCode) : { price: p.priceYearly || p.price * 10, symbol: '$' })
                                : (geoInfo ? getLocalizedPrice(p.price, geoInfo.countryCode) : { price: p.price, symbol: '$' });

                            // For annual, show monthly equivalent visually
                            const pMonthlyEquiv = paymentBillingCycle === 'year'
                                ? (pPrice.price / 12).toFixed(2)
                                : pPrice.price;

                            const isPopular = id === 'legends_plus';

                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTier(id)}
                                    className={`relative p-6 rounded-3xl text-left transition-all ${activeTier === id
                                        ? 'bg-primary text-white ring-4 ring-primary/30 scale-105'
                                        : 'bg-white border-2 border-gray-100 hover:border-primary/30'
                                        }`}
                                >
                                    {isPopular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                                            MOST POPULAR
                                        </span>
                                    )}

                                    <h3 className={`text-xl font-black mb-2 ${activeTier === id ? 'text-white' : 'text-gray-900'}`}>
                                        {p.name}
                                    </h3>

                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className={`text-3xl font-black ${activeTier === id ? 'text-white' : 'text-gray-900'}`}>
                                            {pPrice.symbol}{paymentBillingCycle === 'year' ? pMonthlyEquiv : pPrice.price}
                                        </span>
                                        <span className={activeTier === id ? 'text-white/70' : 'text-gray-500'}>/mo</span>
                                    </div>

                                    {paymentBillingCycle === 'year' && (
                                        <p className={`text-sm mb-4 font-medium ${activeTier === id ? 'text-white/80' : 'text-green-600'}`}>
                                            Billed {pPrice.symbol}{pPrice.price}/yr
                                        </p>
                                    )}

                                    <ul className="space-y-2">
                                        {p.features.slice(0, 4).map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Check size={16} className={`shrink-0 mt-0.5 ${activeTier === id ? 'text-white' : 'text-primary'}`} />
                                                <span className={activeTier === id ? 'text-white/90' : 'text-gray-600'}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep('upsells')}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors"
                        >
                            Continue with {plan.name} →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Upsells */}
            {step === 'upsells' && (
                <div>
                    <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Enhance Your Plan</h2>
                    <p className="text-center text-gray-500 mb-8">Optional add-ons to make the experience even better</p>

                    <div className="max-w-lg mx-auto space-y-4 mb-8">
                        {/* Grandparent Dashboard Upsell */}
                        <div
                            onClick={() => setAddGrandparent(!addGrandparent)}
                            className={`p-6 rounded-3xl cursor-pointer transition-all ${addGrandparent
                                ? 'bg-primary text-white ring-4 ring-primary/30'
                                : 'bg-white border-2 border-gray-100 hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${addGrandparent ? 'bg-white/20' : 'bg-purple-100'
                                    }`}>
                                    <Gift className={addGrandparent ? 'text-white' : 'text-purple-600'} size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold ${addGrandparent ? 'text-white' : 'text-gray-900'}`}>
                                            {grandparentUpsell.name}
                                        </h3>
                                        <span className={`font-bold ${addGrandparent ? 'text-white' : 'text-primary'}`}>
                                            {grandparentPrice.price === 0 ? 'FREE' : `+${grandparentPrice.symbol}${grandparentPrice.price}/mo`}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${addGrandparent ? 'text-white/80' : 'text-gray-500'}`}>
                                        {grandparentUpsell.description}
                                    </p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${addGrandparent
                                    ? 'bg-white border-white text-primary'
                                    : 'border-gray-300'
                                    }`}>
                                    {addGrandparent && <Check size={14} />}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-3xl p-6">
                            <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{plan.name} ({paymentBillingCycle})</span>
                                    <span className="font-medium">{displayPrice.symbol}{displayPrice.price}/{paymentBillingCycle === 'year' ? 'yr' : 'mo'}</span>
                                </div>
                                {addGrandparent && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{grandparentUpsell.name}</span>
                                        <span className="font-medium">+{grandparentPrice.symbol}{grandparentPrice.price}/mo</span>
                                    </div>
                                )}
                                <hr className="my-3" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Due Today</span>
                                    <span className="text-primary">{displayPrice.symbol}{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setStep('plan')}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => {
                                if (activeTier === 'trial_access') {
                                    setStep('payment');
                                } else {
                                    setStep('shipping');
                                }
                                trackEvent('begin_checkout', {
                                    value: totalPrice,
                                    currency: displayPrice.currency,
                                    items: [{ item_id: activeTier, item_name: plan.name }]
                                });
                            }}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors"
                        >
                            Proceed to {activeTier === 'trial_access' ? 'Payment' : 'Shipping'} →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2.5: Shipping Address */}
            {step === 'shipping' && (
                <div className="max-w-xl mx-auto">
                    <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Shipping Address</h2>
                    <p className="text-center text-gray-500 mb-8">Where should we send your monthly Likkle Legends mail?</p>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={shippingData.name}
                                onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                placeholder="Recipient Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Address Line 1</label>
                            <input
                                type="text"
                                value={shippingData.line1}
                                onChange={(e) => setShippingData({ ...shippingData, line1: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                value={shippingData.line2}
                                onChange={(e) => setShippingData({ ...shippingData, line2: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                placeholder="Apt, Suite, etc."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={shippingData.city}
                                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">State / Province</label>
                                <input
                                    type="text"
                                    value={shippingData.state}
                                    onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    value={shippingData.postalCode}
                                    onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    value={shippingData.country}
                                    onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => setStep('upsells')}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => setStep('payment')}
                            disabled={!shippingData.name || !shippingData.line1 || !shippingData.city || !shippingData.postalCode || !shippingData.country}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Proceed to Payment →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
                <div>
                    <h2 className="text-3xl font-black text-center text-gray-900 mb-2">Secure Payment</h2>
                    <p className="text-center text-gray-500 mb-8">Complete your subscription with PayPal</p>

                    <div className="max-w-md mx-auto">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{paymentBillingCycle}ly billing</p>
                                    {addGrandparent && (
                                        <p className="text-sm text-gray-500">+ {grandparentUpsell.name}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-primary">
                                        {displayPrice.symbol}{totalPrice.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-400">total due now</p>
                                </div>
                            </div>
                        </div>

                        {/* PayPal Button or Free Trial Button */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            {displayPrice.price === 0 ? (
                                <button
                                    onClick={() => handlePayPalApprove({ subscriptionID: 'TRIAL', orderID: 'TRIAL_ORDER' })}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>Starting Access <Loader2 className="animate-spin" /></>
                                    ) : (
                                        <>Start My 7-Day Free Pass <Sparkles size={20} /></>
                                    )}
                                </button>
                            ) : (
                                <PayPalScriptProvider
                                    options={{
                                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
                                        vault: true,
                                        intent: 'subscription',
                                        currency: displayPrice.currency,
                                    }}
                                >
                                    {configError && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium">
                                            ⚠️ {configError}
                                        </div>
                                    )}
                                    <PayPalButtons
                                        style={{
                                            layout: 'vertical',
                                            color: 'gold',
                                            shape: 'rect',
                                            label: 'subscribe',
                                        }}
                                        createSubscription={(data, actions) => {
                                            // TODO: Validate that user exists first?
                                            return actions.subscription.create({
                                                plan_id: paymentBillingCycle === 'year' ? (plan.paypalPlanIdYearly || '') : plan.paypalPlanId,
                                                custom_id: user?.id // Pass user ID as custom ID
                                            });
                                        }}
                                        onApprove={handlePayPalApprove}
                                        onError={(err) => {
                                            console.error('PayPal error:', err);
                                            onError?.(err);
                                        }}
                                    />
                                </PayPalScriptProvider>
                            )}

                            {isProcessing && displayPrice.price > 0 && (
                                <div className="mt-4 text-center text-gray-500">
                                    Processing your subscription...
                                </div>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <ShieldCheck size={16} className="text-green-500" /> Secure
                            </span>
                            <span className="flex items-center gap-1">
                                <Check size={16} className="text-green-500" /> Cancel anytime
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                if (activeTier === 'trial_access') {
                                    setStep('upsells');
                                } else {
                                    setStep('shipping');
                                }
                            }}
                            className="w-full mt-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-green-600" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3">Welcome to Likkle Legends! 🎉</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Your subscription is now active. Let's set up your child's profile to start their Caribbean adventure!
                    </p>
                    <a
                        href="/onboarding/welcome"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-colors"
                    >
                        Enter Mission Control →
                    </a>
                </div>
            )}
        </div>
    );
}

// Default export wrapper
export default function CheckoutFlow(props: CheckoutFlowProps) {
    return (
        <ErrorBoundary>
            <CheckoutFlowContent {...props} />
        </ErrorBoundary>
    );
}
