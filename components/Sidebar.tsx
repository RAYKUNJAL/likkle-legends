"use client";

import Link from 'next/link';
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
    Briefcase
} from 'lucide-react';

interface SidebarProps {
    isAdmin?: boolean;
}

export default function Sidebar({ isAdmin = false }: SidebarProps) {
    const pathname = usePathname();

    const parentItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Nursery Songs', href: '/dashboard/songs', icon: Music },
        { name: 'Storybooks', href: '/dashboard/stories', icon: BookOpen },
        { name: 'Printables', href: '/dashboard/printables', icon: Download },
        { name: 'Child Portal', href: '/dashboard/portal', icon: Star },
        { name: 'Account', href: '/dashboard/account', icon: UserCircle },
    ];

    const adminItems = [
        { name: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Asset Command', href: '/admin/assets', icon: Briefcase },
        { name: 'Manage Customers', href: '/admin/customers', icon: UserCircle },
        { name: 'Content Manager', href: '/admin/content', icon: Plus },
        { name: 'Analytics', href: '/admin/analytics', icon: Star },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const items = isAdmin ? adminItems : parentItems;

    return (
        <aside className="w-64 bg-deep text-white h-screen fixed left-0 top-0 flex flex-col p-6 z-50">
            <div className="mb-12">
                <img src="/images/logo.png" alt="Logo" className="w-32 brightness-0 invert" />
                {isAdmin && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ml-1">Admin</span>}
            </div>

            <nav className="flex-1 space-y-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'hover:bg-white/5 text-white/60 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-6 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 w-full transition-all">
                    <LogOut size={20} />
                    <span className="font-semibold text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
}

// Dummy Plus icon for adminItems as it wasn't imported
const Plus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
);
