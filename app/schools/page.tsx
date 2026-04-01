import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    SchoolLeadForm,
    SchoolStatBlock
} from '@/components/growth/SchoolPartnershipUI';
import {
    BookOpen,
    Users,
    Sparkles,
    School as SchoolIcon,
    Globe,
    Layout,
    Shield
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Likkle Legends for Schools | Caribbean Cultural Curriculum',
    description: 'Empower your students with authentic Caribbean storytelling, music, and interactive cultural experiences. Group licensing and school partnerships available.',
    alternates: {
        canonical: '/schools',
    },
};

export default function SchoolsPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />

            <main className="pt-24 lg:pt-32 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 mb-24 lg:mb-32">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-xs font-black uppercase tracking-widest">
                                <SchoolIcon size={14} />
                                Educational Partnerships
                            </div>
                            <h1 className="text-5xl lg:text-8xl font-black text-orange-950 leading-[0.9] tracking-tighter">
                                Bring the Islands <br />
                                <span className="text-orange-500">to Every Classroom.</span>
                            </h1>
                            <p className="text-xl text-orange-900/60 leading-relaxed max-w-xl font-bold">
                                Likkle Legends provides educators with a comprehensive suite of digital
                                and physical resources centered on Caribbean heritage, storytelling, and early childhood development.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 text-sm font-black text-orange-950 uppercase tracking-widest">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    Group Licenses
                                </div>
                                <div className="flex items-center gap-2 text-sm font-black text-orange-950 uppercase tracking-widest">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    Admin Dashboards
                                </div>
                                <div className="flex items-center gap-2 text-sm font-black text-orange-950 uppercase tracking-widest">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    Library Access
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <SchoolLeadForm />
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="bg-white py-24 lg:py-32 border-y-8 border-orange-50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                            <h2 className="text-4xl lg:text-6xl font-black text-orange-950 tracking-tighter">
                                Why Educators Love Us
                            </h2>
                            <p className="text-orange-900/40 font-bold uppercase tracking-widest text-xs">
                                Purpose-built for cultural representation & academic growth
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <SchoolStatBlock
                                icon={<BookOpen size={28} />}
                                title="Authentic Stories"
                                text="Our library features stories voiced in localized dialects, ensuring children see and hear their culture in every lesson."
                            />
                            <SchoolStatBlock
                                icon={<Sparkles size={28} />}
                                title="AI-Powered Discovery"
                                text="Generate island-themed learning stories on the fly to support specific curriculum goals or student interests."
                            />
                            <SchoolStatBlock
                                icon={<Globe size={28} />}
                                title="Heritage Focus"
                                text="Bridge the gap between home and school with content that celebrates Caribbean history, geography, and values."
                            />
                            <SchoolStatBlock
                                icon={<Layout size={28} />}
                                title="Admin Controls"
                                text="Monitor student progress across classrooms with a centralized dashboard designed for school administrators."
                            />
                            <SchoolStatBlock
                                icon={<Shield size={28} />}
                                title="COPPA Compliant"
                                text="Safe, secure, and privacy-first. We protect student data with enterprise-grade security protocols."
                            />
                            <SchoolStatBlock
                                icon={<Users size={28} />}
                                title="Inclusive Pricing"
                                text="Special licensing for non-profits, public libraries, and rural schools to ensure no child is left behind."
                            />
                        </div>
                    </div>
                </section>

                {/* Testimonial/Quote */}
                <section className="py-24 max-w-5xl mx-auto px-4 text-center">
                    <div className="text-6xl font-serif text-orange-100 mb-8 select-none">“</div>
                    <blockquote className="text-3xl lg:text-5xl font-black text-orange-950 leading-tight tracking-tight mb-8 italic">
                        Likkle Legends has transformed our oral tradition sessions.
                        The children are more engaged when they hear Tanty Spice telling
                        stories about the Very Hungry Anansi!
                    </blockquote>
                    <div className="font-bold text-orange-500 uppercase tracking-widest text-sm">
                        — Mrs. Campbell, Early Childhood Educator
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function CheckCircle2({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" />
        </svg>
    )
}
