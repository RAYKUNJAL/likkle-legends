"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AdminLayout,
    ActionButton,
    StatusBadge,
    FileText,
    Trash2,
    Edit,
    Eye,
    Download,
    Plus,
    Search,
    RefreshCw,
} from '@/components/admin/AdminComponents';
import {
    ASSET_TYPE_LABELS,
    ASSET_TYPES,
    SECTION_KEYS,
    SECTION_LABELS,
    type AssetType,
    type SectionKey,
} from '@/lib/content-library/constants';

type Assignment = {
    section_key: SectionKey;
    sort_order: number;
    featured: boolean;
};

type Asset = {
    id: string;
    title: string;
    description: string | null;
    asset_type: AssetType;
    mime_type: string;
    file_size: number;
    cover_url: string | null;
    cover_path: string | null;
    published: boolean;
    tags: string[];
    age_min: number | null;
    age_max: number | null;
    age_band: string | null;
    updated_at: string;
    content_section_assignments?: Assignment[];
};

type Slot = { enabled: boolean; sort_order: string; featured: boolean };

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.zip,application/pdf,image/png,image/jpeg,image/webp,image/gif,application/zip';

function blankSlots(): Record<SectionKey, Slot> {
    return Object.fromEntries(
        SECTION_KEYS.map((key) => [key, { enabled: false, sort_order: '0', featured: false }]),
    ) as Record<SectionKey, Slot>;
}

function slotsFromAsset(asset: Asset | null): Record<SectionKey, Slot> {
    const slots = blankSlots();
    for (const row of asset?.content_section_assignments || []) {
        if (!slots[row.section_key]) continue;
        slots[row.section_key] = {
            enabled: true,
            sort_order: String(row.sort_order ?? 0),
            featured: Boolean(row.featured),
        };
    }
    return slots;
}

function formatBytes(size: number): string {
    if (!size) return '0 B';
    if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({
    label,
    hint,
    accept,
    file,
    onFile,
}: {
    label: string;
    hint: string;
    accept: string;
    file: File | null;
    onFile: (file: File | null) => void;
}) {
    const [drag, setDrag] = useState(false);
    return (
        <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const next = e.dataTransfer.files?.[0];
                if (next) onFile(next);
            }}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center ${drag ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`}
        >
            <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            <p className="font-black text-gray-900">{file ? file.name : label}</p>
            <p className="mt-1 text-sm text-gray-500">{file ? formatBytes(file.size) : hint}</p>
        </label>
    );
}

export function ContentLibraryDashboard() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [q, setQ] = useState('');
    const [type, setType] = useState('');
    const [section, setSection] = useState('');
    const [published, setPublished] = useState('');
    const [ageBand, setAgeBand] = useState('');
    const [tag, setTag] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [editor, setEditor] = useState<Asset | 'new' | null>(null);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assetType, setAssetType] = useState<AssetType>('coloring_book');
    const [live, setLive] = useState(false);
    const [tags, setTags] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [band, setBand] = useState('all');
    const [coverUrl, setCoverUrl] = useState('');
    const [slots, setSlots] = useState<Record<SectionKey, Slot>>(blankSlots);
    const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [bulkSections, setBulkSections] = useState<SectionKey[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (type) params.set('type', type);
        if (section) params.set('section', section);
        if (published) params.set('published', published);
        if (ageBand) params.set('age_band', ageBand);
        if (tag.trim()) params.set('tag', tag.trim().toLowerCase());
        try {
            const res = await fetch(`/api/admin/content-assets?${params.toString()}`, { cache: 'no-store' });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Could not load the library');
            setAssets(body.assets || []);
            setSelected((prev) => prev.filter((id) => (body.assets || []).some((a: Asset) => a.id === id)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load the library');
        } finally {
            setLoading(false);
        }
    }, [q, type, section, published, ageBand, tag]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void load(); }, 200);
        return () => window.clearTimeout(timer);
    }, [load]);

    const openNew = () => {
        setEditor('new');
        setFile(null);
        setCover(null);
        setTitle('');
        setDescription('');
        setAssetType('coloring_book');
        setLive(false);
        setTags('');
        setAgeMin('');
        setAgeMax('');
        setBand('all');
        setCoverUrl('');
        setSlots(blankSlots());
    };

    const openEdit = (asset: Asset) => {
        setEditor(asset);
        setFile(null);
        setCover(null);
        setTitle(asset.title);
        setDescription(asset.description || '');
        setAssetType(asset.asset_type);
        setLive(asset.published);
        setTags((asset.tags || []).join(', '));
        setAgeMin(asset.age_min == null ? '' : String(asset.age_min));
        setAgeMax(asset.age_max == null ? '' : String(asset.age_max));
        setBand(asset.age_band || 'all');
        setCoverUrl(asset.cover_url || '');
        setSlots(slotsFromAsset(asset));
    };

    const assignmentPayload = () => SECTION_KEYS
        .filter((key) => slots[key].enabled)
        .map((key) => ({
            section_key: key,
            sort_order: Number(slots[key].sort_order || 0),
            featured: slots[key].featured,
        }));

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            const form = new FormData();
            form.set('title', title);
            form.set('description', description);
            form.set('asset_type', assetType);
            form.set('published', live ? 'true' : 'false');
            form.set('tags', tags);
            form.set('age_min', ageMin);
            form.set('age_max', ageMax);
            form.set('age_band', band);
            form.set('cover_url', coverUrl);
            form.set('assignments', JSON.stringify(assignmentPayload()));
            if (file) form.set('file', file);
            if (cover) form.set('cover', cover);

            const isNew = editor === 'new';
            if (isNew && !file) throw new Error('Choose a file to upload.');
            const res = await fetch(isNew ? '/api/admin/content-assets' : `/api/admin/content-assets/${(editor as Asset).id}`, {
                method: isNew ? 'POST' : 'PATCH',
                body: isNew || file || cover ? form : JSON.stringify({
                    title,
                    description,
                    asset_type: assetType,
                    published: live,
                    tags,
                    age_min: ageMin,
                    age_max: ageMax,
                    age_band: band,
                    cover_url: coverUrl,
                    assignments: assignmentPayload(),
                }),
                headers: isNew || file || cover ? undefined : { 'Content-Type': 'application/json' },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Save failed');
            setEditor(null);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (asset: Asset) => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/content-assets/${asset.id}`, { method: 'DELETE' });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Delete failed');
            setPendingDelete(null);
            setEditor(null);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setSaving(false);
        }
    };

    const openPreview = async (asset: Asset, kind: 'file' | 'cover' = 'file') => {
        setError(null);
        const res = await fetch(`/api/admin/content-assets/${asset.id}/preview?kind=${kind}`);
        const body = await res.json();
        if (!res.ok) {
            setError(body.error || 'Preview failed');
            return;
        }
        const mime = String(body.mime_type || '');
        if (kind === 'cover' || mime.startsWith('image')) setPreview(body.url);
        else window.open(body.url, '_blank', 'noopener,noreferrer');
    };

    const runBulk = async (action: 'publish' | 'unpublish' | 'assign' | 'delete') => {
        if (selected.length === 0) return;
        if (action === 'delete' && !window.confirm(`Delete ${selected.length} file${selected.length === 1 ? '' : 's'}?`)) return;
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/content-assets/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    ids: selected,
                    assignments: bulkSections.map((section_key) => ({ section_key, sort_order: 0, featured: false })),
                }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Bulk update failed');
            setSelected([]);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bulk update failed');
        } finally {
            setSaving(false);
        }
    };

    const allSelected = assets.length > 0 && selected.length === assets.length;
    const editing = editor !== null;
    const counts = useMemo(() => ({
        live: assets.filter((a) => a.published).length,
        draft: assets.filter((a) => !a.published).length,
    }), [assets]);

    return (
        <AdminLayout activeSection="content-library">
            <header className="border-b border-gray-100 bg-white px-8 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Content Files</h1>
                        <p className="text-gray-500">Upload coloring books, PDFs, and stories, then place them on kid shelves.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openNew}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-black text-white shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Upload file
                    </button>
                </div>
            </header>

            <div className="space-y-6 p-8">
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
                )}

                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Showing</p>
                        <p className="text-2xl font-black text-gray-900">{assets.length}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Live</p>
                        <p className="text-2xl font-black text-green-700">{counts.live}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Drafts</p>
                        <p className="text-2xl font-black text-amber-700">{counts.draft}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Selected</p>
                        <p className="text-2xl font-black text-gray-900">{selected.length}</p>
                    </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-6">
                    <label className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search title or description"
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3"
                        />
                    </label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3">
                        <option value="">All types</option>
                        {ASSET_TYPES.map((item) => <option key={item} value={item}>{ASSET_TYPE_LABELS[item]}</option>)}
                    </select>
                    <select value={section} onChange={(e) => setSection(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3">
                        <option value="">All shelves</option>
                        {SECTION_KEYS.map((key) => <option key={key} value={key}>{SECTION_LABELS[key]}</option>)}
                    </select>
                    <select value={published} onChange={(e) => setPublished(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3">
                        <option value="">Live and draft</option>
                        <option value="true">Live for kids</option>
                        <option value="false">Draft</option>
                    </select>
                    <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3">
                        <option value="">Any age band</option>
                        <option value="all">All ages</option>
                        <option value="mini">Mini</option>
                        <option value="big">Big</option>
                    </select>
                    <input
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Tag"
                        className="rounded-xl border border-gray-200 px-3 py-3 lg:col-span-2"
                    />
                    <button type="button" onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 font-bold">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <p className="font-black text-gray-900">{selected.length} selected</p>
                        <button type="button" disabled={saving} onClick={() => void runBulk('publish')} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-black text-white">Mark live</button>
                        <button type="button" disabled={saving} onClick={() => void runBulk('unpublish')} className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-black text-white">Mark draft</button>
                        <button type="button" disabled={saving} onClick={() => void runBulk('delete')} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white">Delete</button>
                        <div className="flex flex-wrap gap-2">
                            {SECTION_KEYS.map((key) => (
                                <label key={key} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold">
                                    <input
                                        type="checkbox"
                                        checked={bulkSections.includes(key)}
                                        onChange={(e) => setBulkSections((prev) => e.target.checked ? [...prev, key] : prev.filter((k) => k !== key))}
                                    />
                                    {SECTION_LABELS[key]}
                                </label>
                            ))}
                        </div>
                        <button type="button" disabled={saving} onClick={() => void runBulk('assign')} className="rounded-xl bg-primary px-3 py-2 text-sm font-black text-white">Add to shelves</button>
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={(e) => setSelected(e.target.checked ? assets.map((a) => a.id) : [])}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Shelves</th>
                                <th className="px-4 py-3">Age</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && (
                                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading library…</td></tr>
                            )}
                            {!loading && assets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <FileText className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-black text-gray-700">No files match these filters</p>
                                        <p className="text-sm text-gray-500">Upload a coloring book, PDF, story, or ZIP pack.</p>
                                    </td>
                                </tr>
                            )}
                            {!loading && assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(asset.id)}
                                            onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, asset.id] : prev.filter((id) => id !== asset.id))}
                                            aria-label={`Select ${asset.title}`}
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-black text-gray-900">{asset.title}</p>
                                        <p className="text-xs text-gray-400">{formatBytes(asset.file_size)} · {(asset.tags || []).join(', ') || 'no tags'}</p>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-bold text-gray-600">{ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}</td>
                                    <td className="px-4 py-4 text-xs font-bold text-gray-500">
                                        {(asset.content_section_assignments || []).map((a) => SECTION_LABELS[a.section_key] || a.section_key).join(', ') || 'Not assigned'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        {asset.age_band || 'all'}
                                        {(asset.age_min != null || asset.age_max != null) ? ` · ${asset.age_min ?? '0'}–${asset.age_max ?? '18'}` : ''}
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={asset.published ? 'Live' : 'Draft'} variant={asset.published ? 'success' : 'warning'} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton icon={Eye} title="Preview" onClick={() => void openPreview(asset)} />
                                            <ActionButton icon={Edit} title="Edit" onClick={() => openEdit(asset)} />
                                            <ActionButton icon={Trash2} title="Delete" variant="danger" onClick={() => setPendingDelete(asset)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close editor" onClick={() => setEditor(null)} />
                    <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black">{editor === 'new' ? 'Upload file' : 'Edit file'}</h2>
                            <button type="button" onClick={() => setEditor(null)} className="text-gray-400">Close</button>
                        </div>
                        <div className="grid gap-4">
                            <DropZone
                                label={editor === 'new' ? 'Drop a PDF, image, or ZIP' : 'Replace file (optional)'}
                                hint="PDF 40MB · images 15MB · ZIP 80MB"
                                accept={ACCEPT}
                                file={file}
                                onFile={setFile}
                            />
                            <DropZone
                                label="Cover image (optional)"
                                hint="PNG, JPG, WEBP, or GIF up to 8MB"
                                accept="image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                                file={cover}
                                onFile={setCover}
                            />
                            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl border border-gray-200 px-3 py-3 font-bold" />
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="rounded-xl border border-gray-200 px-3 py-3" />
                            <div className="grid gap-3 md:grid-cols-2">
                                <select value={assetType} onChange={(e) => setAssetType(e.target.value as AssetType)} className="rounded-xl border border-gray-200 px-3 py-3">
                                    {ASSET_TYPES.map((item) => <option key={item} value={item}>{ASSET_TYPE_LABELS[item]}</option>)}
                                </select>
                                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 font-bold">
                                    <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
                                    Live for kids
                                </label>
                            </div>
                            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" className="rounded-xl border border-gray-200 px-3 py-3" />
                            <div className="grid gap-3 md:grid-cols-3">
                                <select value={band} onChange={(e) => setBand(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3">
                                    <option value="all">All ages</option>
                                    <option value="mini">Mini</option>
                                    <option value="big">Big</option>
                                </select>
                                <input value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Age min" inputMode="numeric" className="rounded-xl border border-gray-200 px-3 py-3" />
                                <input value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Age max" inputMode="numeric" className="rounded-xl border border-gray-200 px-3 py-3" />
                            </div>
                            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Optional cover link (https://)" className="rounded-xl border border-gray-200 px-3 py-3" />

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <h3 className="font-black text-gray-900">Distribution</h3>
                                <p className="mb-3 text-sm text-gray-500">Kids on a paid membership see this file only when it is live and assigned to a shelf.</p>
                                <div className="space-y-2">
                                    {SECTION_KEYS.map((key) => (
                                        <div key={key} className="grid grid-cols-[1fr_90px_auto] items-center gap-2 rounded-xl bg-white px-3 py-2">
                                            <label className="flex items-center gap-2 text-sm font-bold">
                                                <input
                                                    type="checkbox"
                                                    checked={slots[key].enabled}
                                                    onChange={(e) => setSlots((prev) => ({ ...prev, [key]: { ...prev[key], enabled: e.target.checked } }))}
                                                />
                                                {SECTION_LABELS[key]}
                                            </label>
                                            <input
                                                value={slots[key].sort_order}
                                                onChange={(e) => setSlots((prev) => ({ ...prev, [key]: { ...prev[key], sort_order: e.target.value } }))}
                                                disabled={!slots[key].enabled}
                                                aria-label={`${SECTION_LABELS[key]} sort order`}
                                                className="rounded-lg border border-gray-200 px-2 py-1 text-sm disabled:opacity-40"
                                            />
                                            <label className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                                <input
                                                    type="checkbox"
                                                    checked={slots[key].featured}
                                                    disabled={!slots[key].enabled}
                                                    onChange={(e) => setSlots((prev) => ({ ...prev, [key]: { ...prev[key], featured: e.target.checked } }))}
                                                />
                                                Featured
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-between gap-3">
                                {editor !== 'new' && (
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => void openPreview(editor)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold">
                                            <Eye size={16} /> Preview
                                        </button>
                                        <button type="button" onClick={() => void openPreview(editor, 'cover')} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold">
                                            <Download size={16} /> Cover
                                        </button>
                                        <button type="button" onClick={() => setPendingDelete(editor)} className="rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700">Delete</button>
                                    </div>
                                )}
                                <button type="button" disabled={saving} onClick={() => void save()} className="ml-auto rounded-xl bg-primary px-5 py-3 font-black text-white disabled:opacity-60">
                                    {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pendingDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6">
                        <h3 className="text-xl font-black">Delete this file?</h3>
                        <p className="mt-2 text-gray-500">{pendingDelete.title} will leave the kid shelves and storage.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setPendingDelete(null)} className="rounded-xl border border-gray-200 px-4 py-2 font-bold">Cancel</button>
                            <button type="button" disabled={saving} onClick={() => void remove(pendingDelete)} className="rounded-xl bg-red-600 px-4 py-2 font-black text-white">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {preview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close preview" onClick={() => setPreview(null)} />
                    <img src={preview} alt="Content preview" className="relative max-h-[85vh] max-w-4xl rounded-2xl bg-white object-contain" />
                </div>
            )}
        </AdminLayout>
    );
}
