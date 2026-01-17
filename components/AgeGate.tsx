import React, { useState } from 'react';
import { ParentVerification } from './ParentVerification';

interface AgeGateProps {
    onVerified: () => void;
}

export const AgeGate: React.FC<AgeGateProps> = ({ onVerified }) => {
    const [birthYear, setBirthYear] = useState('');
    const [error, setError] = useState('');
    const [showParentAuth, setShowParentAuth] = useState(false);

    const handleVerify = () => {
        const year = parseInt(birthYear);
        const currentYear = new Date().getFullYear();

        if (!year || year < 1900 || year > currentYear) {
            setError("Please enter a valid birth year.");
            return;
        }

        const age = currentYear - year;
        if (age < 13) {
            setShowParentAuth(true); // Trigger parent verification
            setError("");
        } else {
            onVerified();
        }
    };

    if (showParentAuth) {
        return (
            <ParentVerification
                onVerified={onVerified}
                onCancel={() => setShowParentAuth(false)}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[1000] bg-blue-950 flex items-center justify-center p-6 text-white text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-8xl animate-float">🥥</div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-heading font-black text-yellow-400">Village Check</h2>
                    <p className="text-xl font-bold opacity-80 leading-relaxed">
                        Welcome to Likkle Legends! To keep de island safe, please tell us de year yuh was born.
                    </p>
                </div>

                <div className="space-y-4 bg-white/10 p-8 rounded-[3rem] backdrop-blur-md">
                    <input
                        type="number"
                        placeholder="YYYY"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                        className="w-full bg-white/20 border-2 border-white/30 rounded-2xl p-4 text-center text-3xl font-black outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                    />
                    <button
                        onClick={handleVerify}
                        className="w-full bg-orange-500 hover:bg-orange-400 text-white py-5 rounded-3xl font-heading font-black text-2xl shadow-xl transition-all active:scale-95"
                    >
                        Enter de Village
                    </button>

                    {error && <p className="text-red-400 font-bold text-sm animate-bounce">{error}</p>}
                </div>

                <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">
                    Identity Protection Active • COPPA & GDPR Compliant
                </p>
            </div>
        </div>
    );
};
