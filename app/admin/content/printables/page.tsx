
"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, DataTable, SearchBar, StatusBadge,
    Download, Upload, RefreshCw, FileText
} from '@/components/admin/AdminComponents'; // Adjust path if needed
import { BUCKETS, uploadFile, getPublicUrl } from '@/lib/storage';

interface Printable {
    id: string;
    title: string;
    description: string;
    pdf_url: string;
    thumbnail_url?: string;
    age_group: string;
    island: string;
    created_at: string;
}

export default function PrintablesPage() {
    const [printables, setPrintables] = useState<Printable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadPrintables();
    }, []);

    const loadPrintables = async () => {
        setIsLoading(true);
        try {
            // Fetch from database via server action or client-side SUPABASE query
            // For now, using client-side query wrapper for simplicity in this MVP Fix
            const { supabase } = await import('@/lib/storage');

            // Assuming 'printables' table exists (if not, we might need to query 'content_library' or similar)
            // Correction: The schema usually has specific tables or a unified content table.
            // Based on 'autocontent' agent, it seems we might store metadata in JSON or specific table.
            // Let's assume a 'printables' table or we query 'content' with type 'printable'.

            // Let's try querying `printables` table directly first.
            const { data, error } = await supabase
                .from('printables')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Printables table access error (might not exist yet):", error.message);
                // Fallback: Return empty or mock for now to prevent crash
                setPrintables([]);
            } else {
                setPrintables(data || []);
            }
        } catch (error) {
            console.error("Failed to load printables:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadFile(BUCKETS.PRINTABLES, file);
            if (url) {
                // Here we would normally insert into DB too. 
                // For this quick fix, we'll just reload.
                // In a real flow, we'd pop a modal to add metadata (Title, Island, etc).
                alert("File uploaded to bucket! (Metadata entry pending implementation)");
                loadPrintables();
            } else {
                alert("Upload failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Upload error.");
        } finally {
            setIsUploading(false);
        }
    };

    const filtered = printables.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.island?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout activeSection="content">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Download className="text-secondary" />
                            Activity Sheets
                        </h1>
                        <p className="text-gray-500">Manage PDF printables and coloring pages</p>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {/* Actions */}
                <div className="flex justify-between items-center mb-6">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search worksheets..."
                        onRefresh={loadPrintables}
                    />

                    <label className="cursor-pointer px-6 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors flex items-center gap-2 shadow-lg shadow-secondary/20">
                        {isUploading ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
                        <span>Upload PDF</span>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleUpload} disabled={isUploading} />
                    </label>
                </div>

                {/* Table */}
                <DataTable
                    isLoading={isLoading}
                    data={filtered}
                    columns={[
                        {
                            key: 'title', label: 'Title', render: (row) => (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg"><FileText size={20} className="text-gray-500" /></div>
                                    <span className="font-bold text-gray-900">{row.title || "Untitled"}</span>
                                </div>
                            )
                        },
                        { key: 'island', label: 'Island', render: (row) => <StatusBadge status={row.island || 'General'} variant="info" /> },
                        { key: 'age_group', label: 'Age Group', render: (row) => <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{row.age_group || 'All'}</span> },
                        {
                            key: 'actions', label: 'Actions', render: (row) => (
                                <a href={row.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold text-sm hover:underline">Download</a>
                            )
                        }
                    ]}
                    emptyMessage="No printables found. Upload one to get started!"
                />
            </div>
        </AdminLayout>
    );
}
