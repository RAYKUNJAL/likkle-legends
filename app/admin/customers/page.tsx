"use client";

import Sidebar from '@/components/Sidebar';
import { Search, UserPlus, Filter, MoreVertical, ShieldCheck, Mail, Clock } from 'lucide-react';

export default function AdminCustomersPage() {
    const customers = [
        { name: "Sarah Jenkins", email: "sarah.j@example.com", plan: "Legends Plus", status: "Active", joined: "2 weeks ago" },
        { name: "Marcus Thompson", email: "marcus.t@example.com", plan: "Annual Plus", status: "Active", joined: "1 month ago" },
        { name: "Elena Rodriguez", email: "elena.r@example.com", plan: "Mail Club", status: "Pending", joined: "3 days ago" },
        { name: "David Wilson", email: "david.w@example.com", plan: "Legends Plus", status: "Cancelled", joined: "2 months ago" },
        { name: "Jamilla Grant", email: "jamilla.g@example.com", plan: "Annual Plus", status: "Active", joined: "1 week ago" },
        { name: "Robert Blake", email: "robert.b@example.com", plan: "Mail Club", status: "Active", joined: "5 days ago" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="admin" />
            <main className="ml-64 p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-deep mb-2">Manage Customers 👥</h1>
                        <p className="text-lg text-deep/40 font-bold">Monitor subscriptions and support your legends' families.</p>
                    </div>
                    <button className="bg-primary text-white px-8 py-5 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        <UserPlus size={24} /> New Manual Entry
                    </button>
                </header>

                <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-zinc-50 flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="w-full md:w-96 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-deep/20 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-16 pr-8 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-deep/40 hover:bg-zinc-100 hover:text-deep transition-all flex items-center gap-3">
                                <Filter size={18} /> Filters
                            </button>
                            <button className="px-6 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-black text-deep/40 hover:bg-zinc-100 hover:text-deep transition-all flex items-center gap-3">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50/50">
                                    <th className="px-10 py-6 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em]">Customer</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em]">Subscription</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em]">Timeline</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-deep/30 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {customers.map((customer, i) => (
                                    <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center font-black text-deep/20 text-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-deep text-lg">{customer.name}</p>
                                                    <p className="text-sm font-bold text-deep/30">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck size={18} className={customer.plan.includes('Plus') ? 'text-primary' : 'text-zinc-300'} />
                                                <span className="font-black text-deep opacity-70 text-sm italic">{customer.plan}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${customer.status === 'Active' ? 'bg-green-50 text-green-600' :
                                                    customer.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-400'
                                                }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-deep/30 font-bold text-sm">
                                                <Clock size={16} /> {customer.joined}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="w-12 h-12 rounded-xl bg-zinc-50 text-deep/30 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"><Mail size={18} /></button>
                                                <button className="w-12 h-12 rounded-xl bg-zinc-50 text-deep/30 flex items-center justify-center hover:bg-zinc-100 hover:text-deep transition-all"><MoreVertical size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 border-t border-zinc-50 flex justify-between items-center bg-zinc-50/10">
                        <p className="text-sm font-bold text-deep/30">Showing <span className="text-deep">6</span> of <span className="text-deep">2,840</span> legends</p>
                        <div className="flex gap-2">
                            <button className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-sm font-black text-deep/30 disabled:opacity-30">1</button>
                            <button className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">2</button>
                            <button className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-sm font-black text-deep/30 hover:bg-zinc-50">3</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
