
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminLayout, DataTable, StatusBadge, ActionButton, Tabs, EmptyState, Modal } from '@/components/admin/AdminComponents';
import { CheckCircle2, XCircle, Eye, AlertCircle, BookOpen, Music } from 'lucide-react';
import { getPendingContent, approveContent, rejectContent } from '@/app/actions/content-actions';
import { toast } from 'react-hot-toast';

export default function ApprovalPage() {
    const [activeTab, setActiveTab] = useState('stories');
    const [pending, setPending] = useState<{ stories: any[], songs: any[] }>({ stories: [], songs: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);
        try {
            const data = await getPendingContent();
            setPending(data);
        } catch (err) {
            toast.error("Failed to load pending content");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleApprove(type: any, id: string) {
        try {
            await approveContent(type, id);
            toast.success("Content approved and live!");
            loadData();
        } catch (err) {
            toast.error("Approval failed");
        }
    }

    async function handleReject(type: any, id: string) {
        if (!confirm("Are you sure you want to delete this pending content?")) return;
        try {
            await rejectContent(type, id);
            toast.success("Content rejected");
            loadData();
        } catch (err) {
            toast.error("Rejection failed");
        }
    }

    const storyColumns = [
        { key: 'title', label: 'Title' },
        { key: 'island_theme', label: 'Island' },
        { key: 'age_track', label: 'Age Track' },
        {
            key: 'created_at',
            label: 'Generated',
            render: (item: any) => new Date(item.created_at).toLocaleDateString()
        },
    ];

    const songColumns = [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'age_track', label: 'Age Track' },
    ];

    return (
        <AdminLayout activeSection="approval">
            <div className="p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Approval Queue</h1>
                    <p className="text-gray-500">Review and approve AI-generated content before it goes live to kids.</p>
                </header>

                <Tabs
                    tabs={[
                        { id: 'stories', label: 'Stories', count: pending.stories.length },
                        { id: 'songs', label: 'Songs', count: pending.songs.length }
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                {activeTab === 'stories' ? (
                    <DataTable
                        data={pending.stories}
                        columns={storyColumns}
                        isLoading={isLoading}
                        emptyMessage="No stories pending approval"
                        actions={(item) => (
                            <div className="flex justify-end gap-2">
                                <ActionButton icon={Eye} onClick={() => setSelectedItem(item)} title="Preview" />
                                <ActionButton icon={CheckCircle2} onClick={() => handleApprove('storybooks', item.id)} title="Approve" />
                                <ActionButton icon={XCircle} variant="danger" onClick={() => handleReject('storybooks', item.id)} title="Reject" />
                            </div>
                        )}
                    />
                ) : (
                    <DataTable
                        data={pending.songs}
                        columns={songColumns}
                        isLoading={isLoading}
                        emptyMessage="No songs pending approval"
                        actions={(item) => (
                            <div className="flex justify-end gap-2">
                                <ActionButton icon={CheckCircle2} onClick={() => handleApprove('songs', item.id)} title="Approve" />
                                <ActionButton icon={XCircle} variant="danger" onClick={() => handleReject('songs', item.id)} title="Reject" />
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Story Preview Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={selectedItem?.title || "Story Preview"}
                size="xl"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="relative w-48 h-64">
                                <Image
                                    src={selectedItem.cover_image_url}
                                    className="object-cover rounded-xl shadow-lg"
                                    alt="Cover"
                                    fill
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-2">{selectedItem.title}</h3>
                                <p className="text-gray-600 mb-4 italic">&quot;{selectedItem.summary}&quot;</p>
                                <div className="flex gap-2">
                                    <StatusBadge status={selectedItem.island_theme} variant="info" />
                                    <StatusBadge status={selectedItem.age_track} variant="success" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="font-black text-sm uppercase tracking-wider text-gray-400 mb-4">Story Content Review</h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {selectedItem.content_json?.pages?.map((page: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-serif leading-relaxed text-lg">
                                        <p dangerouslySetInnerHTML={{ __html: page.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <h4 className="font-bold text-primary mb-1">Teaching Focus</h4>
                                <p className="text-sm text-gray-700">{selectedItem.content_json?.lesson_moral || selectedItem.summary}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <h4 className="font-bold text-amber-900 mb-1">Cultural Roots</h4>
                                <p className="text-sm text-amber-800">{selectedItem.content_json?.culturalElements?.join(', ')}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t font-bold">
                            <button onClick={() => setSelectedItem(null)} className="px-6 py-3 rounded-xl border hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleApprove('storybooks', selectedItem.id)} className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 flex items-center gap-2">
                                <CheckCircle2 size={18} /> Approve Content
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
