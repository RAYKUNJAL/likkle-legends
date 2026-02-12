"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Clock, BookOpen, Music, TrendingUp, Award } from 'lucide-react';

const data = [
    { name: 'Mon', usage: 4000, stories: 2400 },
    { name: 'Tue', usage: 3000, stories: 1398 },
    { name: 'Wed', usage: 2000, stories: 9800 },
    { name: 'Thu', usage: 2780, stories: 3908 },
    { name: 'Fri', usage: 1890, stories: 4800 },
    { name: 'Sat', usage: 2390, stories: 3800 },
    { name: 'Sun', usage: 3490, stories: 4300 },
];

const islandData = [
    { name: 'Trinidad', value: 400 },
    { name: 'Jamaica', value: 300 },
    { name: 'Barbados', value: 300 },
    { name: 'Grenada', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs font-black px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {change}
            </span>
        </div>
        <h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
);

export const AnalyticsDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Citizens" value="12,453" change="+12%" icon={Users} color="bg-blue-500" />
                <StatCard title="Avg. Adventure Time" value="24m" change="+5%" icon={Clock} color="bg-orange-500" />
                <StatCard title="Stories Created" value="8,932" change="+18%" icon={BookOpen} color="bg-purple-500" />
                <StatCard title="Songs Played" value="45.2k" change="+8%" icon={Music} color="bg-pink-500" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Intearction Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Island Activity</h3>
                            <p className="text-sm text-slate-400 font-medium">Daily platform engagement</p>
                        </div>
                        <select className="bg-slate-50 border-none rounded-xl text-xs font-black uppercase text-slate-500 p-2 outline-none">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="usage" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Island Distribution */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-slate-800 mb-2">Popular Islands</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8">Where citizens are exploring</p>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={islandData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {islandData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-slate-800">4</span>
                                <span className="text-[10px] font-black uppercase text-slate-400">Islands</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6">System Health & Alerts</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">System Backup Completed</h4>
                                <p className="text-xs text-slate-400">Database backup verified successfully at 04:00 AM</p>
                            </div>
                            <span className="text-xs font-bold text-slate-300">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
