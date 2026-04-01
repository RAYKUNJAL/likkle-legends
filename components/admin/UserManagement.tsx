"use client";

import React, { useEffect, useState } from 'react';
import { getAllUsersAction, updateUserPlanAction } from '@/app/actions/admin';
import { PRICING_TIERS } from '../../lib/constants';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsersAction();
            setUsers(data as any[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanChange = async (userId: string, newPlan: string) => {
        const result = await updateUserPlanAction(userId, newPlan);
        if (result.success) {

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription_tier: newPlan } : u));
            setEditingUser(null);
        } else {
            alert("Failed to update plan.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.child_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center glass-card p-6 border border-slate-100 shadow-premium" style={{ borderRadius: '2rem' }}>
                <div className="relative w-full max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl font-bold text-deep outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadUsers}
                    className="bg-deep text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    Refresh List
                </button>
            </div>

            <div className="glass-card border border-slate-100 overflow-hidden shadow-premium" style={{ borderRadius: '2.5rem' }}>
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                        <tr>
                            <th className="p-8">Citizens</th>
                            <th className="p-8">Plan Access</th>
                            <th className="p-8">Arrival Date</th>
                            <th className="p-8">Control</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={4} className="p-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                    <p className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Identifying Citizens...</p>
                                </div>
                            </td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-20 text-center font-black text-slate-700 uppercase text-xs tracking-widest">No Citizens Recorded</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-slate-100 flex items-center justify-center font-black text-blue-600 text-xs">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-deep text-sm">{user.email}</p>
                                            <p className="text-[10px] text-slate-700 font-bold font-mono tracking-tighter">{user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    {editingUser === user.id ? (
                                        <select
                                            title="Subscription Tier"
                                            aria-label="Subscription Tier"
                                            className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none shadow-premium animate-in zoom-in-95 duration-200"
                                            value={user.subscription_tier}
                                            onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                            onBlur={() => setEditingUser(null)}
                                            autoFocus
                                        >
                                            {PRICING_TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span
                                                onClick={() => setEditingUser(user.id)}
                                                className={`cursor-pointer w-fit px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${user.subscription_tier === 'plan_legends_plus' ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm' :
                                                    user.subscription_tier === 'plan_family_legacy' ? 'bg-purple-50 text-purple-600 border-purple-100 shadow-sm' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}
                                            >
                                                {PRICING_TIERS.find(t => t.id === user.subscription_tier)?.name || user.subscription_tier || 'Free Forever'} <span className="ml-2 text-[8px] opacity-40">✎</span>
                                            </span>
                                            {user.child_name && <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">Kid: {user.child_name}</p>}
                                        </div>
                                    )}
                                </td>
                                <td className="p-8 text-xs font-black text-slate-700 uppercase">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center gap-3">
                                        <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all focus:outline-2 focus:outline-offset-2 focus:outline-primary">Profile</button>
                                        <button className="px-3 py-1.5 hover:bg-red-50 text-red-600 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all focus:outline-2 focus:outline-offset-2 focus:outline-red-500">Ban</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
