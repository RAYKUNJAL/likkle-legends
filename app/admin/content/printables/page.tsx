"use client";

import { useState, useEffect, useRef } from 'react';
import {
    AdminLayout,
    Download, Upload, RefreshCw, FileText, Search,
    Edit, Trash2, Plus, Eye, X, CheckCircle2,
} from '@/components/admin/AdminComponents';

interface Printable {
    id: string;
    title: string;
    description: string;
    category: string;
    tier_required: string;
    pdf_url: string;
    preview_url?: string;
    is_active: boolean;
    is_new?: boolean;
    created_at: string;
}

const CATEGORIES = ['coloring', 'activity', 'educational'];
const TIERS = ['free', 'starter_mailer', 'legends_plus', 'family_legacy'];

const CAT_COLORS: Record<string, string> = {
    coloring: 'bg-amber-100 text-amber-700',
    activity: 'bg-green-100 text-green-700',
    educational: 'bg-blue-100 text-blue-700',
};

const TIER_COLORS: Record<string, string> = {
    free: 'bg-slate-100 text-slate-600',
    starter_mailer: 'bg-indigo-100 text-indigo-700',
    legends_plus: 'bg-purple-100 text-purple-700',
    family_legacy: 'bg-rose-100 text-rose-700',
};

function hasRealPreview(url?: string) {
    if (!url) return false;
    if (url === '/images/logo.png') return false;
    if (url.startsWith('/printables/placeholder')) return false;
    return true;
}

/* ─── Upload helpers ─────────────────────────────────────────────── */

async function uploadToSupabase(file: File, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'printables');
    formData.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.url as string;
}

/* ─── Edit Modal ─────────────────────────────────────────────────── */

function EditModal({
    item,
    onClose,
    onSaved,
}: {
    item: Printable | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isNew = !item?.id;
    const [form, setForm] = useState<Partial<Printable>>(
        item || { title: '', description: '', category: 'coloring', tier_required: 'free', pdf_url: '', preview_url: '', is_active: true }
    );
    const [saving, setSaving] = useState(false);
    const [uploadingPreview, setUploadingPreview] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [error, setError] = useState('');
    const previewRef = useRef<HTMLInputElement>(null);
    const pdfRef = useRef<HTMLInputElement>(null);

    const set = (k: keyof Printable, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPreview(true);
        setError('');
        try {
            const url = await uploadToSupabase(file, 'previews');
            set('preview_url', url);
        } catch (err: any) {
            setError('Preview upload failed: ' + err.message);
        } finally {
            setUploadingPreview(false);
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPdf(true);
        setError('');
        try {
            const url = await uploadToSupabase(file, 'pdfs');
            set('pdf_url', url);
        } catch (err: any) {
            setError('PDF upload failed: ' + err.message);
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSave = async () => {
        if (!form.title?.trim()) { setError('Title is required'); return; }
        setSaving(true);
        setError('');
        try {
            const { supabase } = await import('@/lib/storage');
            if (isNew) {
                const { error } = await supabase.from('printables').insert({
                    title: form.title,
                    description: form.description || '',
                    category: form.category || 'coloring',
                    tier_required: form.tier_required || 'free',
                    pdf_url: form.pdf_url || '',
                    preview_url: form.preview_url || null,
                    is_active: form.is_active ?? true,
                    is_new: true,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('printables').update({
                    title: form.title,
                    description: form.description || '',
                    category: form.category || 'coloring',
                    tier_required: form.tier_required || 'free',
                    pdf_url: form.pdf_url || '',
                    preview_url: form.preview_url || null,
                    is_active: form.is_active ?? true,
                }).eq('id', item!.id);
                if (error) throw error;
            }
            onSaved();
        } catch (err: any) {
            setError(err.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">
                        {isNew ? '+ Add Printable' : 'Edit Printable'}
                    </h2>
                    <button type="button" onClick={onClose} title="Close" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Preview image */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Preview Image</label>
                        <div className="flex gap-4 items-start">
                            {/* Thumbnail preview */}
                            <div className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                                {hasRealPreview(form.preview_url) ? (
                                    <img src={form.preview_url} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText size={28} className="text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-700 rounded-xl font-bold text-sm transition-colors w-fit">
                                    {uploadingPreview ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Upload Preview Image
                                    <input ref={previewRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePreviewUpload} disabled={uploadingPreview} />
                                </label>
                                <p className="text-xs text-gray-400">PNG/JPG/WebP · max 25MB · recommended 600×800px (portrait)</p>
                                {hasRealPreview(form.preview_url) && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                                        <CheckCircle2 size={12} /> Image uploaded
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Or paste a URL:</p>
                                    <input
                                        type="text"
                                        value={form.preview_url || ''}
                                        onChange={e => set('preview_url', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Title *</label>
                        <input
                            type="text"
                            value={form.title || ''}
                            onChange={e => set('title', e.target.value)}
                            placeholder="e.g. Caribbean Alphabet A-M"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea
                            value={form.description || ''}
                            onChange={e => set('description', e.target.value)}
                            rows={2}
                            placeholder="Short description of the worksheet..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                    </div>

                    {/* Category + Tier row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
                            <select
                                value={form.category || 'coloring'}
                                onChange={e => set('category', e.target.value)}
                                aria-label="Category"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-400 bg-white"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Tier Required</label>
                            <select
                                value={form.tier_required || 'free'}
                                onChange={e => set('tier_required', e.target.value)}
                                aria-label="Tier required"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-400 bg-white"
                            >
                                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* PDF URL / Upload */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">PDF / Worksheet URL</label>
                        <div className="space-y-2">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-xl font-bold text-sm transition-colors w-fit">
                                {uploadingPdf ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                                Upload PDF File
                                <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} disabled={uploadingPdf} />
                            </label>
                            <p className="text-xs text-gray-400">Or use the portal route URL (e.g. <code className="bg-gray-100 px-1 rounded">/portal/printables/caribbean-alphabet-a-m</code>)</p>
                            <input
                                type="text"
                                value={form.pdf_url || ''}
                                onChange={e => set('pdf_url', e.target.value)}
                                placeholder="/portal/printables/my-worksheet or https://..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div>
                            <p className="font-black text-gray-900 text-sm">Active / Visible</p>
                            <p className="text-xs text-gray-500">Show this worksheet in the kids portal</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set('is_active', !form.is_active)}
                            title={form.is_active ? 'Deactivate' : 'Activate'}
                            aria-label={form.is_active ? 'Deactivate worksheet' : 'Activate worksheet'}
                            className={`w-12 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-green-400' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 pb-6">
                    <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {saving ? 'Saving...' : 'Save Printable'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function PrintablesAdminPage() {
    const [printables, setPrintables] = useState<Printable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [editItem, setEditItem] = useState<Printable | null | 'new'>('new' as any);
    const [showModal, setShowModal] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadPrintables();
    }, []);

    const loadPrintables = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data, error } = await supabase
                .from('printables')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setPrintables(data || []);
        } catch (err) {
            console.error('Failed to load printables:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this printable? This cannot be undone.')) return;
        setDeleting(id);
        try {
            const { supabase } = await import('@/lib/storage');
            const { error } = await supabase.from('printables').delete().eq('id', id);
            if (error) throw error;
            setPrintables(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        } finally {
            setDeleting(null);
        }
    };

    const filtered = printables.filter(p => {
        const matchesCat = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = !searchQuery ||
            p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <AdminLayout activeSection="content">
            {/* Modal */}
            {showModal && (
                <EditModal
                    item={editItem === 'new' ? null : editItem}
                    onClose={() => setShowModal(false)}
                    onSaved={() => { setShowModal(false); loadPrintables(); }}
                />
            )}

            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Download className="text-amber-500" />
                            Activity Sheets
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {isLoading ? '...' : `${printables.length} total`} · Upload preview images & PDFs
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { setEditItem('new' as any); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-black shadow-lg shadow-amber-200 transition-colors"
                    >
                        <Plus size={18} /> Add Printable
                    </button>
                </div>
            </header>

            <div className="p-8 space-y-6">
                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
                        />
                        {searchQuery && (
                            <button type="button" aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>
                        )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        {['all', ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all border-2 ${
                                    activeCategory === cat
                                        ? 'bg-amber-400 border-amber-500 text-white'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {cat === 'all' ? '🌈 All' : cat}
                            </button>
                        ))}
                    </div>

                    <button type="button" onClick={loadPrintables} title="Refresh" className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors flex-shrink-0">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Results count */}
                {(searchQuery || activeCategory !== 'all') && !isLoading && (
                    <p className="text-sm text-gray-400 -mt-2">{filtered.length} of {printables.length} worksheets</p>
                )}

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                                <div className="aspect-[3/4] bg-gray-100" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🖨️</p>
                        <p className="text-xl font-black text-gray-400">No worksheets found</p>
                        <p className="text-gray-400 mt-1">
                            {searchQuery || activeCategory !== 'all'
                                ? 'Try clearing the filter'
                                : 'Click "Add Printable" to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filtered.map(item => (
                            <AdminPrintableCard
                                key={item.id}
                                item={item}
                                onEdit={() => { setEditItem(item); setShowModal(true); }}
                                onDelete={() => handleDelete(item.id)}
                                isDeleting={deleting === item.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function AdminPrintableCard({
    item,
    onEdit,
    onDelete,
    isDeleting,
}: {
    item: Printable;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}) {
    const realPreview = hasRealPreview(item.preview_url);
    const catColor = CAT_COLORS[item.category] || 'bg-gray-100 text-gray-600';
    const tierColor = TIER_COLORS[item.tier_required] || 'bg-gray-100 text-gray-600';

    return (
        <div className={`bg-white rounded-2xl overflow-hidden border-2 transition-all group ${item.is_active ? 'border-gray-100 hover:border-amber-300' : 'border-dashed border-gray-200 opacity-60'}`}>
            {/* Thumbnail */}
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                {realPreview ? (
                    <img src={item.preview_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
                        <FileText size={28} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-bold text-center px-2">No preview image</span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="p-2.5 bg-white rounded-xl text-amber-500 hover:bg-amber-50 transition-colors shadow"
                        title="Edit"
                        aria-label="Edit worksheet"
                    >
                        <Edit size={16} />
                    </button>
                    {item.pdf_url && (
                        <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white rounded-xl text-blue-500 hover:bg-blue-50 transition-colors shadow"
                            title="Preview"
                            aria-label="Preview worksheet"
                        >
                            <Eye size={16} />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-2.5 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow disabled:opacity-50"
                        title="Delete"
                        aria-label="Delete worksheet"
                    >
                        {isDeleting ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>

                {/* Active badge */}
                {!item.is_active && (
                    <div className="absolute top-2 left-2 bg-gray-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">HIDDEN</div>
                )}
                {item.is_new && item.is_active && (
                    <div className="absolute top-2 left-2 bg-green-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full">NEW</div>
                )}

                {/* Upload preview button (when no image) */}
                {!realPreview && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 hover:bg-white text-gray-600 text-[10px] font-black px-3 py-1.5 rounded-full shadow flex items-center gap-1 whitespace-nowrap"
                    >
                        <Upload size={10} /> Add preview
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
                <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${catColor}`}>{item.category}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${tierColor}`}>{item.tier_required}</span>
                </div>
                <p className="text-xs font-black text-gray-800 leading-tight line-clamp-2">{item.title}</p>
                <button
                    type="button"
                    onClick={onEdit}
                    className="w-full py-2 bg-gray-50 hover:bg-amber-50 hover:text-amber-600 text-gray-500 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-colors mt-1"
                >
                    <Edit size={10} /> Edit
                </button>
            </div>
        </div>
    );
}
