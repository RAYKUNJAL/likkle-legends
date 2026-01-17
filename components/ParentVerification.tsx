import React, { useState } from 'react';

interface ParentVerificationProps {
    onVerified: () => void;
    onCancel: () => void;
}

export const ParentVerification: React.FC<ParentVerificationProps> = ({ onVerified, onCancel }) => {
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = () => {
        if (!email.includes('@')) return;
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('code');
        }, 1500);
    };

    const handleVerifyCode = () => {
        setIsLoading(true);
        // Simulate verification
        setTimeout(() => {
            setIsLoading(false);
            onVerified();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[1100] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-12 shadow-2xl relative animate-in zoom-in-95">
                <button onClick={onCancel} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold">✕</button>

                <div className="text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto">🛡️</div>
                    <h3 className="text-2xl font-heading font-black text-blue-950">Parent Verification</h3>
                    <p className="text-blue-900/60 font-bold text-sm">
                        To comply with COPPA laws, we need to verify you are an adult.
                    </p>
                </div>

                {step === 'email' ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Parent Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none border-2 border-transparent focus:border-blue-200"
                                placeholder="mom@example.com"
                            />
                        </div>
                        <button
                            onClick={handleSendCode}
                            disabled={isLoading || !email}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-center text-sm font-bold text-blue-900/40">Enter the code sent to {email}</p>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="w-full p-4 bg-blue-50 rounded-2xl font-black text-center text-3xl tracking-[0.5em] text-blue-950 outline-none border-2 border-transparent focus:border-blue-200"
                            placeholder="0000"
                            maxLength={4}
                        />
                        <button
                            onClick={handleVerifyCode}
                            disabled={isLoading || code.length < 4}
                            className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-green-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                        <button onClick={() => setStep('email')} className="w-full text-blue-400 font-bold text-xs">Use different email</button>
                    </div>
                )}
            </div>
        </div>
    );
};
