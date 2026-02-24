"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { siteContent } from '@/lib/content';
import { useUser } from '@/components/UserContext';
import StarCounter from '@/components/gamification/StarCounter';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { navigation } = siteContent;
    const { user } = useUser();

    return (
        <nav className="sticky top-0 z-50 glass-nav shadow-sm">
            <div className="container flex items-center justify-between py-4">
                <Link href={navigation.logo.href} className="relative w-40 h-12 block">
                    <span className="sr-only">{navigation.logo.text}</span>
                    <Image src="/images/logo.png" alt={navigation.logo.text} fill className="object-contain" priority />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {navigation.links.map((link, i) => (
                        <Link key={i} href={link.href} className="font-semibold hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
                        <Link href="/profile" className="hover:scale-105 transition-transform">
                            <StarCounter />
                        </Link>

                        {user ? (
                            <Link
                                href="/parent"
                                className="flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 px-4 py-2 rounded-full"
                            >
                                <LayoutDashboard size={18} />
                                <span>Parent Dashboard</span>
                            </Link>
                        ) : (
                            <Link href={navigation.auth.login_href} className="flex items-center gap-2 font-semibold hover:text-primary transition-colors">
                                <UserIcon size={18} />
                                <span>Parent Login</span>
                            </Link>
                        )}
                    </div>

                    <Link href={navigation.auth.primary_cta.href} className="btn btn-primary">
                        {navigation.auth.primary_cta.label}
                    </Link>
                </div>

                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    {navigation.links.map((link, i) => (
                        <Link key={i} href={link.href} className="font-semibold" onClick={() => setIsOpen(false)}>
                            {link.label}
                        </Link>
                    ))}

                    <div className="py-2 border-t border-b border-gray-100">
                        <Link href="/profile" className="flex items-center justify-between w-full" onClick={() => setIsOpen(false)}>
                            <span className="text-sm font-bold text-gray-500 uppercase">My Progress</span>
                            <StarCounter />
                        </Link>
                    </div>

                    {user ? (
                        <Link href="/parent" className="font-bold text-primary flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <LayoutDashboard size={18} />
                            Parent Dashboard
                        </Link>
                    ) : (
                        <Link href={navigation.auth.login_href} className="font-semibold flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <UserIcon size={18} />
                            Parent Login
                        </Link>
                    )}

                    <Link href={navigation.auth.primary_cta.href} className="btn btn-primary w-full text-center" onClick={() => setIsOpen(false)}>
                        {navigation.auth.primary_cta.label}
                    </Link>
                </div>
            )}
        </nav>
    );
}
