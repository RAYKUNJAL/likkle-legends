"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users, CreditCard, Package, TrendingUp, AlertCircle,
    Search, Activity, Upload, Music, Video, BookOpen,
    Settings, Bell, BarChart3, FileText, MessageSquare,
    Globe, Palette, Megaphone, ShieldCheck, ChevronRight,
    Plus, Eye, Edit, Trash2, Download, RefreshCw,
    Gamepad2, LayoutGrid, Wand2, Sparkles, CheckCircle2, Zap,
    Database, Smartphone, Accessibility, Lock
} from 'lucide-react';

// ==========================================
// ADMIN DASHBOARD LAYOUT
// ==========================================

interface AdminLayoutProps {
    children: React.ReactNode;
    activeSection: string;
}

export function AdminLayout({ children, activeSection }: AdminLayoutProps) {
    // Auth Check
    useEffect(() => {
        async function checkAuth() {
            // Dynamically import supabase to avoid build issues if env missing
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = '/login?redirect=/admin';
            }
        }
        checkAuth();
    }, []);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BarChart3, href: '/admin' },
        { id: 'customers', label: 'Customers', icon: Users, href: '/admin/customers' },
        { id: 'orders', label: 'Orders & Fulfillment', icon: Package, href: '/admin/orders' },
        { id: 'content', label: 'Content Library', icon: BookOpen, href: '/admin/content' },
        { id: 'characters', label: 'Characters', icon: Palette, href: '/admin/characters' },
        { id: 'media', label: 'Digital Assets', icon: Package, href: '/admin/assets' },
        { id: 'games', label: 'Game Builder', icon: Gamepad2, href: '/admin/games' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
        { id: 'cms', label: 'Site CMS', icon: Globe, href: '/admin/cms' },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
        { id: 'verify', label: 'Launch Verification', icon: ShieldCheck, href: '/admin/verify' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-deep text-white flex flex-col fixed h-full">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-black tracking-tight">Likkle Legends</h1>
                    <p className="text-xs text-white/60 mt-1">Admin Control Center</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Admin User</p>
                            <p className="text-xs text-white/60">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72">
                {children}
            </main>
        </div>
    );
}

// ==========================================
// STATS CARD
// ==========================================

interface StatCardProps {
    label: string;
    value: string | number;
    delta?: string;
    deltaType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color: string;
}

export function StatCard({ label, value, delta, deltaType = 'positive', icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {delta && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${deltaType === 'positive' ? 'bg-green-100 text-green-700' :
                        deltaType === 'negative' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {delta}
                    </span>
                )}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        </div>
    );
}

// ==========================================
// DATA TABLE
// ==========================================

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
    data,
    columns,
    onRowClick,
    actions,
    isLoading,
    emptyMessage = 'No data found'
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key as string} className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key as string} className="px-6 py-4">
                                        {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key as string] || '')}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 text-right">
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ==========================================
// SEARCH & FILTER BAR
// ==========================================

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onRefresh?: () => void;
    actions?: React.ReactNode;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', onRefresh, actions }: SearchBarProps) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={20} className="text-gray-600" />
                </button>
            )}
            {actions}
        </div>
    );
}

// ==========================================
// FILE UPLOAD COMPONENT
// ==========================================

interface FileUploadProps {
    accept: string;
    maxSize?: number; // in MB
    onUpload: (file: File) => Promise<void>;
    label: string;
    description?: string;
}

export function FileUpload({ accept, maxSize = 100, onUpload, label, description }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) await handleFile(file);
    };

    const handleFile = async (file: File) => {
        setError(null);

        // Validate size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File too large. Maximum size is ${maxSize}MB.`);
            return;
        }

        setIsUploading(true);
        try {
            await onUpload(file);
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            <input
                type="file"
                accept={accept}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
            />

            <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {isUploading ? (
                        <RefreshCw className="animate-spin text-primary" size={28} />
                    ) : (
                        <Upload className="text-gray-400" size={28} />
                    )}
                </div>
                <p className="font-bold text-gray-900 mb-1">{label}</p>
                {description && <p className="text-sm text-gray-500">{description}</p>}
                <p className="text-xs text-gray-400 mt-2">Max file size: {maxSize}MB</p>
            </label>

            {error && (
                <p className="text-red-500 text-sm mt-4 flex items-center justify-center gap-2">
                    <AlertCircle size={16} /> {error}
                </p>
            )}
        </div>
    );
}

// ==========================================
// MODAL COMPONENT
// ==========================================

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ×
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// STATUS BADGE
// ==========================================

interface StatusBadgeProps {
    status: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${variants[variant]}`}>
            {status}
        </span>
    );
}

// ==========================================
// ACTION BUTTONS
// ==========================================

interface ActionButtonProps {
    icon: React.ElementType;
    onClick: () => void;
    variant?: 'default' | 'danger';
    title?: string;
}

export function ActionButton({ icon: Icon, onClick, variant = 'default', title }: ActionButtonProps) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title={title}
            aria-label={title}
            className={`p-2 rounded-lg transition-colors ${variant === 'danger'
                ? 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
        >
            <Icon size={18} />
        </button>
    );
}

// ==========================================
// EMPTY STATE
// ==========================================

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon className="text-gray-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    {action.label}
                </button>
            )}
        </div>
    );
}

// ==========================================
// TABS COMPONENT
// ==========================================

interface TabsProps {
    tabs: { id: string; label: string; count?: number }[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-200'
                            }`}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

export {
    Users, CreditCard, Package, TrendingUp, AlertCircle,
    Search, Activity, Upload, Music, Video, BookOpen,
    Settings, Bell, BarChart3, FileText, MessageSquare,
    Globe, Palette, Megaphone, ShieldCheck, ChevronRight,
    Plus, Eye, Edit, Trash2, Download, RefreshCw,
    Gamepad2, LayoutGrid, Wand2, Sparkles, CheckCircle2, Zap,
    Database, Smartphone, Accessibility, Lock
};
