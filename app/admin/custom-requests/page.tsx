"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout, DataTable, StatusBadge } from '@/components/admin/AdminComponents';
import { getCustomSongRequests, updateCustomSongRequest } from '@/app/actions/admin';
import { useUser } from '@/components/UserContext';
import { Loader2, Music, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomSongRequestsPage() {
    const { user } = useUser();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
            if (!session) return;
            const data = await getCustomSongRequests(session.access_token);
            setRequests(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
            if (!session) return;

            await updateCustomSongRequest(session.access_token, id, { status: newStatus });
            toast.success(`Request marked as ${newStatus}`);
            loadRequests();
            setSelectedRequest(null);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const columns: any[] = [
        { header: "Date", accessor: "created_at", render: (val: string) => new Date(val).toLocaleDateString() },
        { header: "Child", accessor: "child_name", className: "font-bold" },
        { header: "Occasion", accessor: "occasion", render: (val: string) => <span className="capitalize">{val.replace('_', ' ')}</span> },
        { header: "Mood", accessor: "mood", render: (val: string) => <span className="capitalize">{val}</span> },
        {
            header: "Status",
            accessor: "status",
            render: (val: string) => <StatusBadge status={val} variant={val === 'fulfilled' ? 'success' : val === 'paid' ? 'warning' : 'default'} />
        },
        {
            header: "Actions",
            accessor: "id",
            render: (_: string, row: any) => (
                <button
                    onClick={() => setSelectedRequest(row)}
                    className="text-primary font-bold hover:underline"
                >
                    Manage
                </button>
            )
        }
    ];

    return (
        <AdminLayout activeSection="orders">
            <div className="p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Music className="text-purple-600" /> Custom Song Requests
                        </h1>
                        <p className="text-gray-500">Manage incoming custom song orders.</p>
                    </div>
                    <button onClick={loadRequests} className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-bold text-sm">
                        Refresh
                    </button>
                </header>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={requests}
                        isLoading={isLoading}
                        emptyMessage="No custom song requests yet."
                    />
                </div>
            </div>

            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Request for {selectedRequest.child_name}</h3>
                                <p className="text-sm text-gray-500">ID: {selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} title="Close request details" aria-label="Close request details" className="text-gray-400 hover:text-gray-600">
                                <XCircle />
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Occasion</p>
                                    <p className="font-medium capitalize">{selectedRequest.occasion.replace('_', ' ')}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 font-bold uppercase">Mood</p>
                                    <p className="font-medium capitalize">{selectedRequest.mood}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <p className="text-xs text-purple-400 font-bold uppercase mb-1">Special Details</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.details}</p>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Payment Status</p>
                                    <p className="font-bold flex items-center gap-2">
                                        {selectedRequest.payment_status === 'paid' ? (
                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Paid</span>
                                        ) : (
                                            <span className="text-orange-500 flex items-center gap-1"><Clock size={14} /> Pending</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Amount</p>
                                    <p className="font-bold">${selectedRequest.amount_paid || '0.00'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            {selectedRequest.status === 'paid' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedRequest.id, 'in_progress')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                                >
                                    Start Working
                                </button>
                            )}
                            {selectedRequest.status === 'in_progress' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedRequest.id, 'fulfilled')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                                >
                                    Mark Fulfilled
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
