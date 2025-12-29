"use client";

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Users, CreditCard, ShoppingBag, TrendingUp, AlertCircle, Eye, Search, Activity } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="flex min-h-screen bg-[#FFFDF7]">
            <Sidebar view="admin" />

            <main className="flex-1 ml-64 p-10">
                <header className="flex justify-between items-center mb-12">
                    <div className="flex-1 max-w-xl pr-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-deep/20 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search subscribers, transactions, or missions..."
                                className="w-full pl-12 pr-6 py-4 bg-white border border-zinc-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white p-3 pr-8 rounded-[2rem] shadow-sm border border-zinc-100">
                        <div className="w-14 h-14 bg-deep rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg ring-4 ring-zinc-50">AD</div>
                        <div className="text-left">
                            <p className="font-black text-deep">Admin Panel</p>
                            <p className="text-xs text-primary font-black uppercase tracking-widest">System Controller</p>
                        </div>
                    </div>
                </header>

                {/* KPI Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Members", value: "2,840", delta: "+12%", icon: Users, color: "text-blue-600 bg-blue-50" },
                        { label: "Active Subs", value: "2,150", delta: "+5.4%", icon: ShoppingBag, color: "text-green-600 bg-green-50" },
                        { label: "Monthly Rev", value: "$42,500", delta: "+18%", icon: CreditCard, color: "text-purple-600 bg-purple-50" },
                        { label: "Engagement", value: "78%", delta: "+2.1%", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={28} />
                                </div>
                                <span className="text-green-500 font-black text-xs bg-green-50 px-2 py-1 rounded-lg">{stat.delta}</span>
                            </div>
                            <p className="text-xs font-black text-deep/30 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-deep tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Recent Transactions/Subscribers Table */}
                    <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-deep tracking-tight">Recent Subscriptions</h3>
                            <button className="text-primary font-black text-sm uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50">
                                        <th className="pb-6 text-[10px] font-black text-deep/30 uppercase tracking-widest">Subscriber</th>
                                        <th className="pb-6 text-[10px] font-black text-deep/30 uppercase tracking-widest">Plan</th>
                                        <th className="pb-6 text-[10px] font-black text-deep/30 uppercase tracking-widest">Status</th>
                                        <th className="pb-6 text-[10px] font-black text-deep/30 uppercase tracking-widest text-right pr-6">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {[
                                        { name: "Sarah Jenkins", email: "sarah.j@example.com", plan: "Annual Plus", status: "Active", date: "Oct 24, 2023" },
                                        { name: "Marcus Thompson", email: "marcus.t@example.com", plan: "Monthly", status: "Active", date: "Oct 23, 2023" },
                                        { name: "Elena Rodriguez", email: "elena.r@example.com", plan: "Annual Plus", status: "Pending", date: "Oct 23, 2023" },
                                        { name: "David Wilson", email: "david.w@example.com", plan: "Monthly", status: "Expired", date: "Oct 22, 2023" },
                                    ].map((row, i) => (
                                        <tr key={i} className="group hover:bg-zinc-50 transition-colors cursor-pointer text-sm">
                                            <td className="py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-deep/20 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        {row.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-deep group-hover:text-primary transition-colors">{row.name}</p>
                                                        <p className="text-xs text-deep/30 font-bold">{row.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <span className="font-bold text-deep/60">{row.plan}</span>
                                            </td>
                                            <td className="py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${row.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                        row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="py-6 text-right pr-6">
                                                <button className="p-2 hover:bg-white hover:shadow-md rounded-lg transition-all">
                                                    <Eye size={18} className="text-deep/20 group-hover:text-deep" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Alerts and Tasks */}
                    <div className="space-y-10">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                            <h3 className="text-xl font-black text-deep mb-8 flex items-center gap-3">
                                <AlertCircle className="text-red-500" />
                                Urgent Tasks
                            </h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                    <p className="font-black text-red-700 text-sm mb-1">Verify Mailing List</p>
                                    <p className="text-xs text-red-700/60 font-bold leading-relaxed">12 new subscribers need mailing address verification for Batch #04.</p>
                                </div>
                                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                    <p className="font-black text-amber-700 text-sm mb-1">Content Review</p>
                                    <p className="text-xs text-amber-700/60 font-bold leading-relaxed">"Mango Season" Digital Asset needs final proofreading before release.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-deep p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full blur-[80px] opacity-10 -mr-24 -mt-24"></div>
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
                                <Activity className="text-primary" />
                                Content Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-center backdrop-blur-sm">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Library Size</p>
                                    <p className="text-2xl font-black uppercase">142 Items</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-5 rounded-3xl text-center backdrop-blur-sm">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">AI Interactions</p>
                                    <p className="text-2xl font-black uppercase">12.4K</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
