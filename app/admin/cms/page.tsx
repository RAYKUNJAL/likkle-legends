
"use client";

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminComponents';
import { getSiteContent } from '@/lib/services/cms';
import { saveContentAction } from '@/app/actions/cms';
import { Loader2, Check, Save, RotateCcw } from 'lucide-react';

// Simple JSON Editor Component using textarea
function JsonEditor({ initialData, onSave, label }: { initialData: any, onSave: (data: any) => Promise<void>, label: string }) {
    const [jsonString, setJsonString] = useState(JSON.stringify(initialData, null, 2));
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSave = async () => {
        try {
            setError(null);
            setIsSaving(true);
            const parsed = JSON.parse(jsonString);
            await onSave(parsed);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (e: any) {
            setError("Invalid JSON format");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg capitalize">{label}</h3>
                <div className="flex items-center gap-2">
                    {error && <span className="text-red-500 text-sm">{error}</span>}
                    {isSuccess && <span className="text-green-600 text-sm flex items-center gap-1"><Check size={14} /> Saved</span>}
                    <button
                        onClick={() => setJsonString(JSON.stringify(initialData, null, 2))}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                        title="Reset to original"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>
            <p className="text-xs text-gray-500">Edit the JSON configuration below. Be careful with formatting.</p>
            <textarea
                value={jsonString}
                onChange={(e) => setJsonString(e.target.value)}
                aria-label={`Edit ${label} JSON`}
                className="w-full h-[400px] font-mono text-sm p-4 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                spellCheck={false}
            />
        </div>
    );
}

export default function CmsPage() {
    const [activeSection, setActiveSection] = useState('hero');
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const sections = ['hero', 'pricing', 'faq', 'how_it_works', 'what_you_get', 'testimonials'];

    useEffect(() => {
        loadContent(activeSection);
    }, [activeSection]);

    async function loadContent(section: string) {
        setLoading(true);
        try {
            // In a client component, we should probably fetch via an API route or server action wrapper if getSiteContent is safe for client? 
            // getSiteContent imports 'supabase' from storage (client safe) but also 'admin' (server only).
            // So we CANNOT use getSiteContent directly here if it imports server-only code.
            // We need to fetch via the Seeder API (GET) or a Server Action.
            // Let's use a server action wrapper that returns the data, OR just fetch from the seeder API if we implement GET there.
            // ACTUALLY: getSiteContent is reading from public table, so it should be fine IF we separate the write logic.
            // BUT 'lib/services/cms.ts' imports 'createAdminClient' which might break on client.
            // SAFE BET: Use a Server Action to fetch.

            const { getSiteContentAction } = await import('@/app/actions/cms-fetch');
            const data = await getSiteContentAction(section);
            setContent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(newContent: any) {
        await saveContentAction(activeSection, newContent);
        // Reload to confirm persistence
        await loadContent(activeSection);
    }

    return (
        <AdminLayout activeSection="content">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-deep">Site Content Management</h1>
                    <p className="text-gray-500">Edit the landing page content live.</p>
                </div>

                <div className="flex flex-wrap gap-2 pb-4 border-b">
                    {sections.map(section => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all capitalize ${activeSection === section
                                ? 'bg-deep text-white shadow-lg'
                                : 'bg-white border text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {section.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <JsonEditor
                        label={activeSection}
                        initialData={content}
                        onSave={handleSave}
                        key={`${activeSection}-${JSON.stringify(content)}`} // Force remount on section change
                    />
                )}
            </div>
        </AdminLayout>
    );
}
