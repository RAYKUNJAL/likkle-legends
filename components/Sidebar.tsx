"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Music,
    BookOpen,
    Download,
    Settings,
    LogOut,
    UserCircle,
    Star,
    Briefcase,
    Plus,
    BarChart3
} from 'lucide-react';

interface SidebarProps {
    view?: 'parent' | 'admin';
}

export default function Sidebar({ view = 'parent' }: SidebarProps) {
    const pathname = usePathname();
    const isAdmin = view === 'admin';

    const parentItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Parent View', href: '/parent', icon: UserCircle },
        { name: 'Nursery Songs', href: '/dashboard/songs', icon: Music },
        { name: 'Storybooks', href: '/dashboard/stories', icon: BookOpen },
        { name: 'Printables', href: '/dashboard/printables', icon: Download },
        { name: 'Child Portal', href: '/portal', icon: Star },
    ];

    const adminItems = [
        { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Media Library', href: '/admin/media', icon: Music },
        { name: 'Manage Customers', href: '/admin/customers', icon: UserCircle },
        { name: 'Content Library', href: '/admin/content', icon: BookOpen },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const items = isAdmin ? adminItems : parentItems;

    return (
        <aside className="w-64 bg-deep text-white h-screen fixed left-0 top-0 flex flex-col p-8 z-50">
            <div className="mb-12 flex items-center gap-3">
                <div className="relative w-28 h-10">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain brightness-0 invert"
                    />
                </div>
                {isAdmin && (
                    <span className="text-[9px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                        Admin
                    </span>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 px-4">Menu</p>
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${isActive
                                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                : 'hover:bg-white/5 text-white/50 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                            <span className="font-black text-sm tracking-tight">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-8 border-t border-white/10">
                <button
                    onClick={() => {
                        // In a real app, call supabase.auth.signOut()
                        window.location.href = '/';
                    }}
                    className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 w-full transition-all group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-sm tracking-tight">Logout</span>
                </button>
            </div>
        </aside>
    );
}
