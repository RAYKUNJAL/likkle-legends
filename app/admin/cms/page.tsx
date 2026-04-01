
"use client";

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminComponents';
import { getSiteContent } from '@/lib/services/cms';
import { saveContentAction } from '@/app/actions/cms';
import { Loader2, Check, Save, RotateCcw } from 'lucide-react';

// Visual Editor Component for structured content
function VisualEditor({ initialData, onSave, label }: { initialData: any, onSave: (data: any) => Promise<void>, label: string }) {
    const [data, setData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const updateField = (path: string[], value: any) => {
        const newData = { ...data };
        let current = newData;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setData(newData);
    };

    const renderFields = (obj: any, path: string[] = []) => {
        if (!obj) return null;

        return Object.entries(obj).map(([key, value]) => {
            const currentPath = [...path, key];
            const fieldId = currentPath.join('.');

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                return (
                    <div key={fieldId} className="border-l-2 border-gray-100 pl-6 space-y-4 my-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</h4>
                        {renderFields(value, currentPath)}
                    </div>
                );
            }

            if (Array.isArray(value)) {
                return (
                    <div key={fieldId} className="space-y-4 my-6">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')} (Array)</h4>
                        <p className="text-[10px] text-amber-500 font-bold italic">Arrays still require JSON editing for safely adding/removing items for now.</p>
                        <textarea
                            id={`cms-${fieldId}-array`}
                            aria-label={`${key} array JSON input`}
                            value={JSON.stringify(value, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    updateField(currentPath, parsed);
                                } catch (e) { }
                            }}
                            className="w-full h-32 font-mono text-xs p-3 bg-gray-50 border rounded-xl"
                        />
                    </div>
                );
            }

            return (
                <div key={fieldId} className="space-y-1">
                    <label htmlFor={`cms-${fieldId}`} className="text-xs font-bold text-gray-600 block px-1">{key.replace(/_/g, ' ')}</label>
                    {typeof value === 'string' && value.length > 100 ? (
                        <textarea
                            id={`cms-${fieldId}`}
                            aria-label={`Edit ${key.replace(/_/g, ' ')}`}
                            value={value as string}
                            onChange={(e) => updateField(currentPath, e.target.value)}
                            className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    ) : (
                        <input
                            id={`cms-${fieldId}`}
                            type={typeof value === 'number' ? 'number' : 'text'}
                            aria-label={`Edit ${key.replace(/_/g, ' ')}`}
                            value={value as string | number}
                            onChange={(e) => updateField(currentPath, typeof value === 'number' ? parseFloat(e.target.value) : e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    )}
                </div>
            );
        });
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-6">
                <div>
                    <h3 className="font-black text-2xl capitalize text-gray-900">{label.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-gray-500">Edit content fields visually.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isSuccess && <span className="text-green-600 text-sm font-bold flex items-center gap-1"><Check size={16} /> Saved Successfully</span>}
                    <button
                        onClick={() => setData(initialData)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={async () => {
                            setIsSaving(true);
                            await onSave(data);
                            setIsSuccess(true);
                            setIsSaving(false);
                            setTimeout(() => setIsSuccess(false), 3000);
                        }}
                        disabled={isSaving}
                        className="bg-primary text-white py-3 px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-3xl space-y-2">
                {renderFields(data)}
            </div>
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
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("You must be logged in.");
                return;
            }

            await saveContentAction(session.access_token, activeSection, newContent);
            // We don't necessarily need to reload everything if we trust the local state, 
            // but let's re-fetch to be safe and clear any stale metadata.
            await loadContent(activeSection);
        } catch (e) {
            console.error(e);
            alert("Failed to save.");
        }
    }

    return (
        <AdminLayout activeSection="cms">
            <div className="space-y-8 p-4">
                <header>
                    <h1 className="text-3xl font-black text-gray-900">Site Content Management</h1>
                    <p className="text-gray-500">Update landing page copy and settings live.</p>
                </header>

                <div className="flex flex-wrap gap-2 pb-2">
                    {sections.map(section => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize shadow-sm ${activeSection === section
                                ? 'bg-deep text-white shadow-deep/20 scale-105'
                                : 'bg-white border text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {section.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <Loader2 className="animate-spin text-primary mb-4" size={48} />
                        <p className="text-gray-400 font-bold animate-pulse">Loading {activeSection} data...</p>
                    </div>
                ) : (
                    <VisualEditor
                        label={activeSection}
                        initialData={content}
                        onSave={handleSave}
                        key={`${activeSection}-${content ? Object.keys(content).length : 0}`}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
