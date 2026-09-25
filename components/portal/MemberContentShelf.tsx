"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Eye } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { AskAParentNotice } from '@/components/portal/AskAParentNotice';
import { ASSET_TYPE_LABELS, SECTION_LABELS, type AssetType, type SectionKey } from '@/lib/content-library/constants';

type ShelfAsset = {
    id: string;
    title: string;
    description: string | null;
    asset_type: AssetType;
    mime_type: string;
    featured: boolean;
    preview_kind: 'pdf' | 'image' | 'download';
    has_cover: boolean;
    cover_url: string | null;
};

type ShelfProps = {
    section: SectionKey;
    title: string;
    emptyMessage: string;
    variant?: 'page' | 'embed';
};

export function MemberContentShelf({ section, title, emptyMessage, variant = 'page', className = '' }: ShelfProps & { className?: string }) {
    const { user, activeChild, canAccess, isLoading } = useUser();
    const [assets, setAssets] = useState<ShelfAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [blocked, setBlocked] = useState(false);

    const member = !isLoading && !!user && canAccess('starter_mailer');

    useEffect(() => {
        if (isLoading) return;
        if (!member) {
            setLoading(false);
            setBlocked(Boolean(user));
            setAssets([]);
            return;
        }
        const params = new URLSearchParams({ section });
        if (activeChild?.age != null) params.set('age', String(activeChild.age));
        if (activeChild?.age_track) params.set('age_track', activeChild.age_track);
        const controller = new AbortController();
        setLoading(true);
        fetch(`/api/content-library?${params.toString()}`, { cache: 'no-store', signal: controller.signal })
            .then(async (res) => {
                if (res.status === 401 || res.status === 403) {
                    setBlocked(true);
                    setAssets([]);
                    return;
                }
                const body = await res.json();
                if (!res.ok) throw new Error(body.error || 'Could not load');
                setBlocked(false);
                setAssets(body.assets || []);
            })
            .catch((err) => {
                if (err?.name === 'AbortError') return;
                setAssets([]);
            })
            .finally(() => setLoading(false));
        return () => controller.abort();
    }, [activeChild?.age, activeChild?.age_track, isLoading, member, section, user]);

    if (variant === 'embed' && (isLoading || !member || blocked || loading || assets.length === 0)) {
        return null;
    }

    return (
        <div className={className}>
        <section className="rounded-[2rem] border-4 border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-700">
                    {SECTION_LABELS[section]}
                </span>
            </div>
            {isLoading || loading ? (
                <p className="font-bold text-slate-400">Loading…</p>
            ) : blocked || !member ? (
                <AskAParentNotice className="text-slate-600" />
            ) : assets.length === 0 ? (
                <p className="font-bold text-slate-500">{emptyMessage}</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {assets.map((asset) => {
                        const cover = asset.cover_url
                            || (asset.has_cover ? `/api/content-library/${asset.id}/file?kind=cover` : null);
                        const openHref = `/api/content-library/${asset.id}/file`;
                        const downloadHref = `/api/content-library/${asset.id}/file?download=1`;
                        return (
                            <article key={asset.id} className="overflow-hidden rounded-3xl border-2 border-slate-100 bg-[#FFFDF7]">
                                <div className="flex aspect-[4/3] items-center justify-center bg-amber-50">
                                    {cover ? (
                                        <img src={cover} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl" aria-hidden>{asset.preview_kind === 'pdf' ? '📄' : asset.preview_kind === 'image' ? '🖍️' : '📦'}</span>
                                    )}
                                </div>
                                <div className="space-y-3 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}
                                        </p>
                                        {asset.featured && <span className="text-[10px] font-black uppercase text-amber-600">Featured</span>}
                                    </div>
                                    <h3 className="text-lg font-black leading-tight text-slate-900">{asset.title}</h3>
                                    {asset.description && <p className="line-clamp-3 text-sm font-medium text-slate-500">{asset.description}</p>}
                                    <div className="flex gap-2">
                                        <a
                                            href={openHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-sm font-black text-white"
                                        >
                                            <Eye size={16} /> {asset.preview_kind === 'download' ? 'Open' : 'Look'}
                                        </a>
                                        <a
                                            href={downloadHref}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-amber-200 px-3 py-2 text-sm font-black text-amber-800"
                                        >
                                            <Download size={16} /> Save
                                        </a>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
        </div>
    );
}

export function MemberShelfPage({
    emoji,
    title,
    subtitle,
    shelves,
}: {
    emoji: string;
    title: string;
    subtitle: string;
    shelves: Array<{ section: SectionKey; title: string; emptyMessage: string }>;
}) {
    return (
        <div className="min-h-screen bg-[#FDFCF0] px-4 py-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link href="/portal" className="inline-flex items-center gap-2 font-black text-amber-700">
                    <ArrowLeft size={18} /> Back to the village
                </Link>
                <header>
                    <p className="text-4xl" aria-hidden>{emoji}</p>
                    <h1 className="mt-2 text-4xl font-black text-slate-900">{title}</h1>
                    <p className="mt-2 max-w-2xl font-bold text-slate-500">{subtitle}</p>
                </header>
                {shelves.map((shelf) => (
                    <MemberContentShelf key={shelf.section + shelf.title} {...shelf} />
                ))}
            </div>
        </div>
    );
}
