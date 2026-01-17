"use client";

import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, SearchBar, StatusBadge, ActionButton, Eye, MessageSquare, Trash2, Send } from '@/components/admin/AdminComponents';

interface AdminMessage {
    id: string;
    parent_name: string;
    parent_email: string;
    subject: string;
    preview: string;
    status: 'new' | 'replied' | 'pending';
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<AdminMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock data fetch
        setTimeout(() => {
            setMessages([
                {
                    id: '1',
                    parent_name: 'Sarah Johnson',
                    parent_email: 'sarah@example.com',
                    subject: 'Question about annual plan',
                    preview: 'Hello, I was wondering if the annual plan includes...',
                    status: 'new',
                    created_at: '2026-01-15T14:30:00Z'
                },
                {
                    id: '2',
                    parent_name: 'David Richards',
                    parent_email: 'david@example.com',
                    subject: 'Shipping delay in London',
                    preview: 'I haven\'t received my January box yet, can you check...',
                    status: 'replied',
                    created_at: '2026-01-14T09:15:00Z'
                }
            ]);
            setIsLoading(true); // Set to true to show actual data after a delay if needed
            // Actually set to false when data is "loaded"
            setIsLoading(false);
        }, 1000);
    }, []);

    const columns = [
        {
            key: 'parent_name',
            label: 'Parent',
            render: (msg: AdminMessage) => (
                <div>
                    <p className="font-bold text-gray-900">{msg.parent_name}</p>
                    <p className="text-xs text-gray-400">{msg.parent_email}</p>
                </div>
            )
        },
        {
            key: 'subject',
            label: 'Subject',
            render: (msg: AdminMessage) => (
                <div>
                    <p className="font-medium text-gray-900">{msg.subject}</p>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{msg.preview}</p>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (msg: AdminMessage) => (
                <StatusBadge
                    status={msg.status}
                    variant={msg.status === 'new' ? 'warning' : msg.status === 'replied' ? 'success' : 'default'}
                />
            )
        },
        {
            key: 'created_at',
            label: 'Date',
            render: (msg: AdminMessage) => new Date(msg.created_at).toLocaleDateString()
        }
    ];

    const filteredMessages = messages.filter(m =>
        m.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout activeSection="messages">
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Support Messages</h1>
                        <p className="text-gray-500">Manage inquiries from parents and educators</p>
                    </div>
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
                            <ActionButton icon={Send} onClick={() => { }} title="Reply" />
                            <ActionButton icon={Trash2} onClick={() => { }} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
