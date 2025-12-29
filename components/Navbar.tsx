"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="container flex items-center justify-between py-4">
                <Link href="/" className="relative w-40 h-10">
                    <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" priority />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/#how-it-works" className="font-semibold hover:text-primary transition-colors">How It Works</Link>
                    <Link href="/#characters" className="font-semibold hover:text-primary transition-colors">Characters</Link>
                    <Link href="/#pricing" className="font-semibold hover:text-primary transition-colors">Pricing</Link>
                    <Link href="/#testimonials" className="font-semibold hover:text-primary transition-colors">Testimonials</Link>
                    <Link href="/login" className="font-semibold hover:text-primary transition-colors">Login</Link>
                    <Link href="/#pricing" className="btn btn-primary animate-pulse-slow">Start Adventure</Link>
                </div>

                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                    <Link href="/#how-it-works" className="font-semibold" onClick={() => setIsOpen(false)}>How It Works</Link>
                    <Link href="/#characters" className="font-semibold" onClick={() => setIsOpen(false)}>Characters</Link>
                    <Link href="/#pricing" className="font-semibold" onClick={() => setIsOpen(false)}>Pricing</Link>
                    <Link href="/#pricing" className="btn btn-primary w-full text-center">Start Adventure</Link>
                </div>
            )}
        </nav>
    );
}
