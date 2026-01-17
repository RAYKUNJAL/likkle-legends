
import React, { useState } from 'react';
import { BrandIcon } from './BrandIcon';
import { loginParent } from '../services/supabase/authService';

interface AdminLoginProps {
    onLogin: (email: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await loginParent(email, password);
            if (user) {
                onLogin(user.email || email);
            } else {
                setError('Invalid credentials.');
            }
        } catch (e: any) {
            setError(e.message || 'Login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-950 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 text-9xl">🏝️</div>
                <div className="absolute bottom-10 right-10 text-9xl rotate-12">🌊</div>
            </div>

            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden p-12 relative z-10 border-4 border-blue-900/10">
                <div className="text-center space-y-4 mb-10 flex flex-col items-center">
                    <BrandIcon size="2xl" className="rotate-3 shadow-xl mb-4" />
                    <h1 className="text-3xl font-heading font-black text-blue-950">Admin Central</h1>
                    <p className="text-blue-900/60 font-bold">Supabase Secure Login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-900/40 px-2">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="raykunjal@gmail.com"
                            className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none border-2 border-transparent focus:border-blue-200 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-900/40 px-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none border-2 border-transparent focus:border-blue-200 transition-all pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-blue-300 hover:text-blue-500 focus:outline-none"
                                title={showPassword ? "Hide Password" : "Show Password"}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-black uppercase text-center animate-bounce">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-heading font-black text-xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
