"use client";

import Image from 'next/image';
import Link from 'next/link';
import { siteContent } from '@/lib/content';

export default function Footer() {
    const { footer } = siteContent;

    return (
        <footer className="bg-deep text-white py-24 border-t border-white/5">
            <div className="container grid md:grid-cols-4 gap-16">
                <div className="col-span-1 md:col-span-2 space-y-10">
                    <div className="relative w-56 h-20">
                        <Image
                            src="/images/logo.png"
                            alt="Likkle Legends"
                            fill
                            className="object-contain brightness-0 invert"
                        />
                    </div>
                    <p className="text-white/80 text-xl leading-relaxed max-w-md font-bold">
                        {footer.brand_line}
                    </p>
                </div>
                {footer.columns.map((col, i) => (
                    <div key={i} className="space-y-8">
                        <h4 className="font-black text-lg uppercase tracking-widest text-primary">{col.title}</h4>
                        <ul className="space-y-4">
                            {col.links.map((link, j) => (
                                <li key={j}>
                                    <Link href={link.href} className="text-white/80 font-bold hover:text-white transition-colors flex items-center gap-2 group">
                                        <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="container mt-24 pt-10 border-t border-white/5 text-center flex flex-col items-center gap-4">
                <p className="text-base font-black text-white/40 tracking-normal">
                    {footer.copyright}
                </p>
                <Link
                    href="/admin"
                    className="text-xs text-white/10 hover:text-white/30 transition-colors uppercase tracking-widest font-bold"
                >
                    Admin Access
                </Link>
            </div>
        </footer>
    );
}