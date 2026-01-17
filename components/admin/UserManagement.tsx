
import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserPlan } from '../../services/supabase/databaseService';
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
            const data = await getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePlanChange = async (userId: string, newPlan: string) => {
        const success = await updateUserPlan(userId, newPlan);
        if (success) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
            setEditingUser(null);
        } else {
            alert("Failed to update plan.");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.details?.childName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border-2 border-blue-50 shadow-sm">
                <div className="relative w-full max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full pl-10 pr-4 py-3 bg-blue-50 rounded-xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={loadUsers} className="bg-blue-100 text-blue-600 px-4 py-3 rounded-xl font-black text-xs uppercase hover:bg-blue-200">
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border-4 border-blue-50 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <tr>
                            <th className="p-6">User / Email</th>
                            <th className="p-6">Plan Status</th>
                            <th className="p-6">Joined</th>
                            <th className="p-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-50">
                        {loading ? (
                            <tr><td colSpan={4} className="p-10 text-center font-bold text-gray-400">Loading Citizens...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center font-bold text-gray-400">No users found.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-6">
                                    <p className="font-bold text-blue-950 text-sm">{user.email}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{user.id.slice(0, 8)}...</p>
                                </td>
                                <td className="p-6">
                                    {editingUser === user.id ? (
                                        <select
                                            className="p-2 bg-white border-2 border-blue-200 rounded-lg text-xs font-bold outline-none"
                                            value={user.plan}
                                            onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                            onBlur={() => setEditingUser(null)}
                                            autoFocus
                                        >
                                            {PRICING_TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    ) : (
                                        <span
                                            onClick={() => setEditingUser(user.id)}
                                            className={`cursor-pointer px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.plan === 'annual_plus' ? 'bg-purple-100 text-purple-600' :
                                                    user.plan === 'legends_plus' ? 'bg-orange-100 text-orange-600' :
                                                        user.plan === 'mail_club' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            {PRICING_TIERS.find(t => t.id === user.plan)?.name || user.plan} ✎
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 text-xs font-bold text-gray-500">
                                    {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-6">
                                    <button className="text-blue-600 font-bold text-xs hover:underline mr-4">View</button>
                                    <button className="text-red-400 font-bold text-xs hover:underline">Ban</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
