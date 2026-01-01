"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { siteContent } from '@/lib/content';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { navigation } = siteContent;

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
                    <Link href={navigation.auth.login_href} className="font-semibold hover:text-primary transition-colors">
                        {navigation.auth.login_label}
                    </Link>
                    <Link href={navigation.auth.primary_cta.href} className="btn btn-primary animate-pulse-slow">
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
                    <Link href={navigation.auth.login_href} className="font-semibold" onClick={() => setIsOpen(false)}>
                        {navigation.auth.login_label}
                    </Link>
                    <Link href={navigation.auth.primary_cta.href} className="btn btn-primary w-full text-center" onClick={() => setIsOpen(false)}>
                        {navigation.auth.primary_cta.label}
                    </Link>
                </div>
            )}
        </nav>
    );
}
