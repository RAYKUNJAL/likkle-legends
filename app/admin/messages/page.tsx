"use client";

import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, SearchBar, StatusBadge, ActionButton, Modal } from '@/components/admin/AdminComponents';
import { Eye, Trash2, Send, RefreshCcw, MessageSquare, RefreshCw } from 'lucide-react';
import { getSupportMessages, deleteSupportMessage, updateSupportMessageStatus, SupportMessage } from '@/lib/database';
import { replyToSupportMessage } from '@/app/actions/crm';

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState<SupportMessage | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

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

    const handleReply = async () => {
        if (!selectedMsg || !replyText) return;
        setIsSending(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await replyToSupportMessage(session.access_token, (selectedMsg as any).id, replyText);

            // Re-load messages to show update
            await loadMessages();
            setSelectedMsg(null);
            setReplyText('');
            alert('Reply logged and status updated');
        } catch (error) {
            console.error(error);
            alert('Failed to send reply');
        } finally {
            setIsSending(false);
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
                        <h1 className="text-3xl font-black text-gray-900">Support Hub</h1>
                        <p className="text-gray-500">Respond to parent inquiries and feedback</p>
                    </div>
                    <button
                        onClick={loadMessages}
                        className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        title="Refresh messages"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
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
                    onRowClick={(msg) => setSelectedMsg(msg as any)}
                    actions={(msg) => (
                        <div className="flex justify-end gap-2">
                            <ActionButton icon={MessageSquare} onClick={() => setSelectedMsg(msg as any)} title="View & Reply" />
                            <ActionButton icon={Trash2} onClick={() => handleDelete((msg as any).id)} variant="danger" title="Delete" />
                        </div>
                    )}
                />

                {/* Reply Modal */}
                <Modal
                    isOpen={!!selectedMsg}
                    onClose={() => setSelectedMsg(null)}
                    title="Support Message Details"
                    size="lg"
                >
                    {selectedMsg && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-900">{selectedMsg.parent_name}</h3>
                                        <p className="text-sm text-gray-500">{selectedMsg.parent_email}</p>
                                    </div>
                                    <StatusBadge status={selectedMsg.status} variant={selectedMsg.status === 'new' ? 'warning' : 'success'} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                                    <p className="font-bold text-gray-800">{selectedMsg.subject}</p>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Message</p>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-black text-gray-900 flex items-center gap-2">
                                    <Send size={18} className="text-primary" />
                                    Send a Reply
                                </h4>
                                <textarea
                                    id="reply-text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full h-40 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Type your response here..."
                                    aria-label="Reply message to send to parent"
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setSelectedMsg(null)}
                                        className="px-6 py-3 text-gray-500 font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReply}
                                        disabled={isSending || !replyText}
                                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        {isSending ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                                        Send Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
}
