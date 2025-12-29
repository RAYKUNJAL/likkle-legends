"use client";

import Sidebar from '@/components/Sidebar';
import { Users, CreditCard, ShoppingBag, TrendingUp, AlertCircle, Eye } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <Sidebar isAdmin={true} />

            <main className="flex-1 ml-64 p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-deep">Business Command Center 🚀</h1>
                        <p className="text-deep/50">Likkle Legends is growing! Here's your global snapshot.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-xs animate-pulse">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        LIVE: 42 FAMILIES ONLINE
                    </div>
                </header>

                {/* KPI Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Revenue", value: "$42,850", trend: "+12%", icon: <CreditCard className="text-blue-600" />, color: "bg-blue-100" },
                        { label: "Active Subs", value: "1,240", trend: "+5%", icon: <Users className="text-purple-600" />, color: "bg-purple-100" },
                        { label: "Mailings Sent", value: "12,400", trend: "+18%", icon: <ShoppingBag className="text-orange-600" />, color: "bg-orange-100" },
                        { label: "Conversion Rate", value: "4.2%", trend: "-1%", icon: <TrendingUp className="text-green-600" />, color: "bg-green-100" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-deep/40 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-black mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Orders / Customers */}
                    <div className="lg:col-span-2 bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Recent Subscriptions</h3>
                            <button className="text-primary text-sm font-bold hover:underline">View All Customers</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 text-[10px] font-black uppercase text-deep/40 tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Customer</th>
                                        <th className="px-4 py-4">Plan</th>
                                        <th className="px-4 py-4">Status</th>
                                        <th className="px-4 py-4 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[
                                        { name: "Michael Chen", email: "m.chen@example.com", plan: "Annual Plus", status: "Active", amount: "$228" },
                                        { name: "Sarah Johnson", email: "sarah.j@example.com", plan: "Legends Plus", status: "Past Due", amount: "$24" },
                                        { name: "Amara Okoro", email: "amara@example.com", plan: "Mail Club", status: "Active", amount: "$10" },
                                        { name: "James Wilson", email: "j.wilson@example.com", plan: "Annual Plus", status: "Active", amount: "$228" },
                                    ].map((row, i) => (
                                        <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-200 rounded-full"></div>
                                                    <div>
                                                        <p className="font-bold">{row.name}</p>
                                                        <p className="text-xs text-deep/40">{row.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 font-medium tracking-tight">{row.plan}</td>
                                            <td className="px-4 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-6 text-right pr-8">
                                                <button className="p-2 hover:bg-zinc-100 rounded-lg"><Eye size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pending Actions / Notifications */}
                    <div className="space-y-6">
                        <div className="bg-deep text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary transform translate-x-16 -translate-y-16 rounded-full blur-3xl opacity-20"></div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <AlertCircle size={20} className="text-primary" />
                                Urgent System Tasks
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="font-bold text-sm">Inventory Low</p>
                                    <p className="text-xs text-white/50">Letters for Ages 4-5 are running low.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="font-bold text-sm">Content Review</p>
                                    <p className="text-xs text-white/50">2 new stories pending character approval.</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-4 bg-primary rounded-2xl text-white font-bold text-sm hover:scale-105 transition-all">
                                Process All Tasks
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Content Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-deep/50">Songs Uploaded</span>
                                    <span className="font-bold">48</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="w-[80%] h-full bg-accent rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-sm mt-4">
                                    <span className="text-deep/50">Printables Ready</span>
                                    <span className="font-bold">124</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="w-[95%] h-full bg-secondary rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
