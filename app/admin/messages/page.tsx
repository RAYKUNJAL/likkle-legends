"use client";

import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, SearchBar, StatusBadge, ActionButton } from '@/components/admin/AdminComponents';
import { Eye, Trash2, Send, RefreshCcw } from 'lucide-react';
import { getSupportMessages, deleteSupportMessage, updateSupportMessageStatus, SupportMessage } from '@/lib/database';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const data = await getSupportMessages();
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await deleteSupportMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            alert('Failed to delete message');
        }
    };

    const handleStatusUpdate = async (id: string, status: SupportMessage['status']) => {
        try {
            await updateSupportMessageStatus(id, status);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const columns: any[] = [
        {
            key: 'parent_name',
            label: 'Parent',
            render: (msg: SupportMessage) => (
                <div>
                    <p className="font-bold text-gray-900">{msg.parent_name}</p>
                    <p className="text-xs text-gray-400">{msg.parent_email}</p>
                </div>
            )
        },
        {
            key: 'subject',
            label: 'Subject',
            render: (msg: SupportMessage) => (
                <div>
                    <p className="font-medium text-gray-900">{msg.subject}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{msg.message}</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (msg: SupportMessage) => (
                <StatusBadge
                    status={msg.status}
                    variant={msg.status === 'new' ? 'warning' : msg.status === 'replied' ? 'success' : 'default'}
                />
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (msg: SupportMessage) => msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A'
        }
    ];

    const filteredMessages = messages.filter(m =>
        m.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    ) as (SupportMessage & { id: string })[];

    return (
        <AdminLayout activeSection="messages">
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Support Messages</h1>
                        <p className="text-gray-500">Manage inquiries from parents and educators</p>
                    </div>
                    <button
                        onClick={loadMessages}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh messages"
                    >
                        <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </header>

                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search messages..."
                />

                <DataTable
                    data={filteredMessages}
                    columns={columns}
                    isLoading={isLoading}
                    actions={(msg) => (
                        <div className="flex justify-end gap-2">
                            <ActionButton icon={Eye} onClick={() => { }} title="View Message" />
                            {msg.status === 'new' && (
                                <ActionButton icon={Send} onClick={() => handleStatusUpdate(msg.id, 'replied')} title="Mark as Replied" />
                            )}
                            <ActionButton icon={Trash2} onClick={() => handleDelete(msg.id)} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
