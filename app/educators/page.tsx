"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, BookOpen, Users, Globe, CheckCircle2, Mail, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function EducatorsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-24 bg-deep text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[150px] opacity-20 -mr-96 -mt-96"></div>
                    <div className="container relative z-10">
                        <div className="max-w-3xl space-y-8">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-secondary font-black text-sm uppercase tracking-widest">
                                <Sparkles size={14} /> For Classrooms & Homeschoolers
                            </span>
                            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1]">
                                Caribbean Culture for <span className="text-primary">Every Classroom.</span>
                            </h1>
                            <p className="text-xl text-white font-bold leading-relaxed">
                                Comprehensive curriculum resources, SEL-aligned lesson plans, and bulk pricing for schools, libraries, and educational groups.
                            </p>
                            <div className="pt-6">
                                <Link href="#inquiry" className="btn btn-primary btn-lg px-12 py-6 text-xl shadow-2xl shadow-primary/20">
                                    Request Educator Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 bg-[#FFFDF7]">
                    <div className="container">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl lg:text-5xl font-black text-deep">Classroom-Ready Resources</h2>
                            <p className="text-xl text-deep/80 font-bold max-w-2xl mx-auto">Everything you need to integrate Caribbean heritage into your existing curriculum.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <BookOpen className="text-primary" />,
                                    title: "Curriculum Kits",
                                    desc: "Thematic units covering Caribbean geography, history, biodiversity, and folklore."
                                },
                                {
                                    icon: <Users className="text-secondary" />,
                                    title: "SEL Framework",
                                    desc: "Activities designed to build empathy, confidence, and identity using character-led stories."
                                },
                                {
                                    icon: <Globe className="text-primary" />,
                                    title: "Digital Access",
                                    desc: "Classroom licenses for our interactive portal, songs, and AI-powered reading buddy."
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-100 hover:shadow-2xl transition-all group">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-deep mb-4">{item.title}</h3>
                                    <p className="text-deep font-bold leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-white">
                    <div className="container grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square rounded-[4rem] overflow-hidden">
                            <Image
                                src="/images/child_reading.png"
                                alt="Kids learning with Caribbean culture"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-deep/60 to-transparent"></div>
                        </div>
                        <div className="space-y-10">
                            <h2 className="text-4xl lg:text-5xl font-black text-deep leading-tight">
                                Why Educators Love Likkle Legends
                            </h2>
                            <div className="space-y-6">
                                {[
                                    "Standards-aligned cultural literacy resources",
                                    "Promotes diversity and inclusion effortlessly",
                                    "Ready-to-go activities for active learning",
                                    "Bulk mailer pricing for entire grade levels",
                                    "Dedicated educator support team"
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <CheckCircle2 className="text-secondary shrink-0" />
                                        <p className="text-xl font-bold text-deep/80">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Inquiry Section */}
                <section id="inquiry" className="py-24 bg-deep/5 border-y border-deep/10">
                    <div className="container">
                        <div className="max-w-5xl mx-auto bg-white rounded-[4rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-zinc-100">
                            <div className="p-12 lg:p-16 bg-deep text-white space-y-8">
                                <h3 className="text-4xl font-black">Let's build a legends program for your school</h3>
                                <p className="text-white/80 text-lg leading-relaxed font-bold">
                                    Whether you're a homeschool collective or a large school district, we have flexible plans to fit your budget and student needs.
                                </p>
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-4 text-white/80">
                                        <Mail className="text-primary" /> schools@likklelegends.com
                                    </div>
                                    <div className="flex items-center gap-4 text-white/80">
                                        <CheckCircle2 className="text-secondary" /> Custom curriculum packages
                                    </div>
                                </div>
                            </div>
                            <div className="p-12 lg:p-16 space-y-8">
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-deep/40 pl-2">School/Organization Name</label>
                                        <input type="text" className="w-full p-5 bg-zinc-50 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" placeholder="School name..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-deep/40 pl-2">Work Email</label>
                                        <input type="email" className="w-full p-5 bg-zinc-50 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" placeholder="you@school.edu" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="student-count" className="text-sm font-black uppercase text-deep/70 pl-2">Number of Students</label>
                                        <select id="student-count" title="Estimated number of students" className="w-full p-5 bg-zinc-50 rounded-2xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none text-deep">
                                            <option>10-50</option>
                                            <option>50-200</option>
                                            <option>200+</option>
                                        </select>
                                    </div>
                                    <button className="btn btn-secondary btn-lg w-full py-5 text-lg shadow-xl shadow-secondary/20">
                                        Get Package Details <ArrowRight className="ml-2" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
