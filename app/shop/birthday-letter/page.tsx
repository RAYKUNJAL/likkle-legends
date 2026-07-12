'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, Check, ArrowLeft, Mail, Star, Sparkles } from 'lucide-react';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

const TIERS = [
    {
        id: 'birthday_letter_basic',
        name: 'Standard',
        price: 19,
        features: [
            'Personalized birthday letter from your child\'s favorite Legend',
            'Printable Caribbean activity pack (5 pages)',
            'Digital birthday mission unlock',
            'Delivered via email within 48 hours',
        ],
    },
    {
        id: 'birthday_letter_premium',
        name: 'Premium',
        price: 29,
        badge: 'MOST POPULAR',
        features: [
            'Everything in Standard',
            'Handwritten calligraphy envelope (mailed to US)',
            'Bonus sticker sheet (6 Caribbean themed stickers)',
            'Personalized video message from the character',
            'Priority delivery within 5 business days',
        ],
    },
];

declare global { interface Window { paypal?: any; } }

export default function BirthdayLetterPage() {
    const [selectedTier, setSelectedTier] = useState('birthday_letter_premium');
    const [childName, setChildName] = useState('');
    const [childAge, setChildAge] = useState('');
    const [character, setCharacter] = useState('roti');
    const [parentEmail, setParentEmail] = useState('');
    const [message, setMessage] = useState('');
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [paypalError, setPaypalError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [formValid, setFormValid] = useState(false);

    const sel = TIERS.find(t => t.id === selectedTier) || TIERS[1];

    useEffect(() => {
        setFormValid(childName.trim().length > 0 && parentEmail.includes('@') && /\d/.test(childAge));
    }, [childName, parentEmail, childAge]);

    useEffect(() => {
        if (document.getElementById('paypal-sdk-bl')) { setPaypalLoaded(true); return; }
        const script = document.createElement('script');
        script.id = 'paypal-sdk-bl';
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
        script.onload = () => setPaypalLoaded(true);
        script.onerror = () => setPaypalError('PayPal could not load. Please refresh and try again.');
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!paypalLoaded || !window.paypal || !formValid) return;
        const container = document.getElementById('paypal-button-bl');
        if (!container) return;
        container.innerHTML = '';
        window.paypal.Buttons({
            style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'pay', height: 50 },
            createOrder: (_data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: sel.price.toFixed(2),
                            currency_code: 'USD',
                            breakdown: { item_total: { value: sel.price.toFixed(2), currency_code: 'USD' } },
                        },
                        items: [{
                            name: `Likkle Legends — Birthday Letter (${sel.name})`,
                            unit_amount: { value: sel.price.toFixed(2), currency_code: 'USD' },
                            quantity: '1',
                            category: 'PHYSICAL_GOODS',
                            description: `Birthday letter for ${childName} (${character})`,
                        }],
                        shipping: {
                            name: { full_name: `Parent of ${childName}` },
                            email_address: parentEmail,
                        },
                    }],
                    application_context: {
                        shipping_preference: 'GET_FROM_FILE',
                        user_action: 'PAY_NOW',
                        brand_name: 'Likkle Legends',
                    },
                });
            },
            onApprove: async (_data: any, actions: any) => {
                setProcessing(true);
                try {
                    const order = await actions.order.capture();
                    await fetch('/api/orders/birthday-letter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderId: order.id,
                            tier: selectedTier,
                            childName,
                            childAge,
                            character,
                            parentEmail,
                            message,
                            amount: sel.price,
                        }),
                    }).catch(() => {});
                    setSuccess(true);
                } catch (_e) {
                    setPaypalError('Payment could not complete. Please try again.');
                    setProcessing(false);
                }
            },
            onError: () => setPaypalError('Something went wrong. Please try again or email hello@likklelegends.com'),
        }).render('#paypal-button-bl');
    }, [paypalLoaded, formValid, selectedTier, sel, childName, childAge, character, parentEmail, message]);

    if (success) return (
        <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🎂</div>
                <h1 className="text-3xl font-black text-deep mb-3">Birthday Letter Ordered!</h1>
                <p className="text-deep/60 mb-6">
                    We're crafting {childName}'s personalized birthday letter now.
                    {sel.name === 'Premium'
                        ? ' Your physical envelope will be mailed within 5 business days.'
                        : ' You\'ll receive the digital letter via email within 48 hours.'}
                </p>
                <Link href="/" className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
                    Back to Home
                </Link>
            </div>
        </main>
    );

    const CHARACTERS = [
        { id: 'roti', name: 'R.O.T.I.', emoji: '🤖' },
        { id: 'tanty_spice', name: 'Tanty Spice', emoji: '🌶️' },
        { id: 'dilly_doubles', name: 'Dilly Doubles', emoji: '🎵' },
        { id: 'mango_moko', name: 'Mango Moko', emoji: '🥭' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-amber-50">
            <Navbar />
            <main className="flex-grow">
                {/* Hero */}
                <section className="py-16 px-6 text-center">
                    <div className="max-w-2xl mx-auto">
                        <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-bold text-deep/40 hover:text-primary transition-colors mb-6">
                            <ArrowLeft size={16} /> Back to Pricing
                        </Link>
                        <div className="text-5xl mb-4">🎂✉️</div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">One-Time Gift · No Subscription</span>
                        <h1 className="text-4xl md:text-5xl font-black text-deep mt-3 mb-4">
                            Birthday Letter from the Islands
                        </h1>
                        <p className="text-lg text-deep/60 max-w-lg mx-auto">
                            Give your child a birthday they'll never forget — a personalized letter from their favorite Likkle Legend character, complete with a Caribbean activity pack and digital mission unlock.
                        </p>
                    </div>
                </section>

                {/* Tier Selection */}
                <section className="py-8 px-6">
                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-10">
                        {TIERS.map(tier => (
                            <button
                                key={tier.id}
                                onClick={() => setSelectedTier(tier.id)}
                                className={`text-left p-8 rounded-3xl border-2 transition-all relative ${
                                    selectedTier === tier.id
                                        ? 'border-amber-400 bg-amber-50 shadow-xl'
                                        : 'border-zinc-200 bg-white hover:border-amber-200'
                                }`}
                            >
                                {tier.badge && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                                        {tier.badge}
                                    </span>
                                )}
                                <h3 className="text-xl font-black text-deep mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-black text-amber-600">${tier.price}</span>
                                    <span className="text-sm text-deep/40 font-bold">one-time</span>
                                </div>
                                <ul className="space-y-2">
                                    {tier.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-deep/60 font-medium">
                                            <Check className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        ))}
                    </div>

                    {/* Personalization Form */}
                    <div className="max-w-2xl mx-auto bg-white rounded-[2rem] p-8 md:p-10 border border-zinc-200 shadow-lg">
                        <h2 className="text-xl font-black text-deep mb-6">Personalize the Letter ✨</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-deep/40 uppercase tracking-widest mb-2">Child's Name *</label>
                                <input
                                    type="text"
                                    value={childName}
                                    onChange={e => setChildName(e.target.value)}
                                    placeholder="e.g., Aria"
                                    className="w-full px-5 py-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:outline-none font-medium text-deep"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-deep/40 uppercase tracking-widest mb-2">Child's Age *</label>
                                    <input
                                        type="number"
                                        value={childAge}
                                        onChange={e => setChildAge(e.target.value)}
                                        placeholder="e.g., 6"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:outline-none font-medium text-deep"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-deep/40 uppercase tracking-widest mb-2">Parent Email *</label>
                                    <input
                                        type="email"
                                        value={parentEmail}
                                        onChange={e => setParentEmail(e.target.value)}
                                        placeholder="parent@email.com"
                                        className="w-full px-5 py-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:outline-none font-medium text-deep"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-deep/40 uppercase tracking-widest mb-3">Choose Character</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {CHARACTERS.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setCharacter(c.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all text-center ${
                                                character === c.id
                                                    ? 'border-amber-400 bg-amber-50'
                                                    : 'border-zinc-200 bg-white hover:border-amber-200'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">{c.emoji}</div>
                                            <div className="text-[10px] font-black text-deep/60 uppercase tracking-wider">{c.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-deep/40 uppercase tracking-widest mb-2">Special Message (optional)</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="e.g., Aria loves dancing to soca music and dreams of visiting Trinidad!"
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-xl border-2 border-zinc-200 focus:border-amber-400 focus:outline-none font-medium text-deep resize-none"
                                />
                            </div>
                        </div>

                        {/* PayPal Checkout */}
                        <div className="mt-8">
                            {!formValid && (
                                <div className="text-center py-6 px-4 bg-zinc-50 rounded-xl border border-zinc-200">
                                    <p className="text-sm font-bold text-deep/40">
                                        Fill in child's name, age, and parent email to unlock checkout
                                    </p>
                                </div>
                            )}
                            {formValid && (
                                <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-bold text-deep/60">Total: <span className="text-2xl font-black text-amber-600">${sel.price}</span></span>
                                        <span className="text-xs font-bold text-deep/40">{sel.name} Tier</span>
                                    </div>
                                    {paypalError && (
                                        <div className="text-sm text-red-600 mb-3 p-3 bg-red-50 rounded-lg">{paypalError}</div>
                                    )}
                                    {processing && (
                                        <div className="text-center py-4 text-amber-600 font-bold">Processing your payment...</div>
                                    )}
                                    {!paypalLoaded && !paypalError && !processing && (
                                        <div className="text-center py-4 text-deep/40 text-sm">Loading secure payment...</div>
                                    )}
                                    <div id="paypal-button-bl" style={{ display: processing ? 'none' : 'block' }} />
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <span>🔒</span>
                                <span className="text-xs text-deep/40">Secured by PayPal · Questions? hello@likklelegends.com</span>
                            </div>
                        </div>
                    </div>

                    {/* What's Included */}
                    <div className="max-w-2xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: Mail, title: 'Personalized Letter', desc: 'From your chosen character, referencing your child\'s name and interests' },
                            { icon: Star, title: 'Activity Pack', desc: '5 printable Caribbean-themed activity pages' },
                            { icon: Sparkles, title: 'Mission Unlock', desc: 'A special digital birthday mission in the portal' },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-6 rounded-2xl bg-white border border-zinc-100">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <item.icon className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-black text-deep text-sm mb-1">{item.title}</h3>
                                <p className="text-xs text-deep/50">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
