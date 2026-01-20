'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, Music, BookOpen, Palette, ArrowRight, Book, Star } from 'lucide-react';

export default function MonthlyDropSection({ content }: { content: any }) {
    const { monthly_drop } = content;
    if (!monthly_drop) return null;

    const iconMap: Record<string, any> = {
        users: Users,
        book: Book,
        music: Music,
        palette: Palette
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual Preview */}
                    <div className="relative order-2 lg:order-1">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-[4rem] rotate-3 translate-x-4 translate-y-4" />
                        <div className="relative rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl">
                            <Image
                                src={monthly_drop.image || "/images/monthly-drop-preview.png"}
                                alt="Monthly Drop Bundle Preview"
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Floating Micro-Badges */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-purple-50 animate-float">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Star className="w-4 h-4 text-purple-600" />
                                </div>
                                <span className="font-black text-purple-900 text-sm">Bundle #01</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 order-1 lg:order-2">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-black text-purple-600 uppercase tracking-widest leading-none">
                                    {monthly_drop.tagline}
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-deep leading-tight tracking-tight">
                                {monthly_drop.title}
                            </h2>

                            <p className="text-xl text-deep/60 leading-relaxed font-medium">
                                {monthly_drop.subtitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {(monthly_drop.items || []).map((item: any) => {
                                const Icon = iconMap[item.icon] || Star;
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 hover:border-purple-200 hover:bg-white transition-all group"
                                    >
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="font-bold text-deep/80">{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4">
                            <Link
                                href={monthly_drop.cta.href}
                                className="inline-flex items-center gap-3 bg-purple-600 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-200 hover:shadow-2xl transition-all group"
                            >
                                {monthly_drop.cta.label}
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
