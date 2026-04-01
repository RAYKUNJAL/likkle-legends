"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, Tabs, ActionButton,
    Users, Edit, Eye, CheckCircle2, RefreshCw
} from '@/components/admin/AdminComponents';
import { DollarSign, TrendingUp, UserCheck, UserX, ExternalLink, Copy, XCircle } from 'lucide-react';
import { getAllPromotersAdmin, updatePromoterStatus, getAffiliateAnalytics } from '@/app/actions/growth';
import toast from 'react-hot-toast';

interface Promoter {
    id: string;
    user_id: string;
    referral_code: string;
    paypal_email: string;
    commission_rate: number;
    total_earned: number;
    total_paid: number;
    status: 'pending_approval' | 'approved' | 'suspended';
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

interface AffiliateStats {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingApplications: number;
    totalCommissionsEarned: number;
    totalCommissionsPaid: number;
    totalReferrals: number;
}

export default function AdminAffiliatesPage() {
    const [promoters, setPromoters] = useState<Promoter[]>([]);
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const [promotersData, analyticsData] = await Promise.all([
                getAllPromotersAdmin(session.access_token),
                getAffiliateAnalytics(session.access_token)
            ]);

            setPromoters(promotersData || []);
            setStats(analyticsData);
        } catch (error) {
            console.error('Failed to load affiliates:', error);
            toast.error('Failed to load affiliate data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (promoterId: string, newStatus: 'approved' | 'suspended') => {
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await updatePromoterStatus(session.access_token, promoterId, newStatus);
            setPromoters(prev => prev.map(p =>
                p.id === promoterId ? { ...p, status: newStatus } : p
            ));
            toast.success(`Affiliate ${newStatus === 'approved' ? 'approved' : 'suspended'}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'error' => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending_approval': return 'warning';
            case 'suspended': return 'error';
            default: return 'warning';
        }
    };

    const filteredPromoters = promoters.filter(p => {
        const matchesSearch =
            p.referral_code.toLowerCase().includes(search.toLowerCase()) ||
            p.paypal_email.toLowerCase().includes(search.toLowerCase()) ||
            p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.profiles?.email?.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'pending') return p.status === 'pending_approval' && matchesSearch;
        if (activeTab === 'active') return p.status === 'approved' && matchesSearch;
        if (activeTab === 'suspended') return p.status === 'suspended' && matchesSearch;
        return matchesSearch;
    });

    const pendingCount = promoters.filter(p => p.status === 'pending_approval').length;
    const activeCount = promoters.filter(p => p.status === 'approved').length;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <AdminLayout activeSection="affiliates">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Affiliate Management</h1>
                        <p className="text-gray-500">Manage promoter applications and track performance</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="p-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Affiliates</p>
                                <p className="text-2xl font-black text-gray-900">{stats?.totalAffiliates || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <UserCheck className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Applications</p>
                                <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Earned</p>
                                <p className="text-2xl font-black text-gray-900">${stats?.totalCommissionsEarned?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Referrals</p>
                                <p className="text-2xl font-black text-gray-900">{stats?.totalReferrals || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100 px-6">
                        <div className="flex gap-6">
                            {[
                                { id: 'all', label: 'All Affiliates' },
                                { id: 'pending', label: `Pending (${pendingCount})` },
                                { id: 'active', label: `Active (${activeCount})` },
                                { id: 'suspended', label: 'Suspended' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-purple-600 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by name, email, or referral code..."
                        />

                        <DataTable
                            data={filteredPromoters}
                            isLoading={isLoading}
                            emptyMessage="No affiliates found"
                            columns={[
                                {
                                    key: 'profiles',
                                    label: 'Affiliate',
                                    render: (p) => (
                                        <div>
                                            <p className="font-bold text-gray-900">{p.profiles?.full_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{p.profiles?.email}</p>
                                        </div>
                                    )
                                },
                                {
                                    key: 'referral_code',
                                    label: 'Referral Code',
                                    render: (p) => (
                                        <div className="flex items-center gap-2">
                                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{p.referral_code}</code>
                                            <button
                                                onClick={() => copyToClipboard(`https://likklelegends.com/?ref=${p.referral_code}`)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                                title="Copy link"
                                            >
                                                <Copy size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    )
                                },
                                {
                                    key: 'commission_rate',
                                    label: 'Commission',
                                    render: (p) => (
                                        <span className="font-bold text-green-600">{(p.commission_rate * 100).toFixed(0)}%</span>
                                    )
                                },
                                {
                                    key: 'total_earned',
                                    label: 'Earned',
                                    render: (p) => (
                                        <span className="font-bold text-gray-900">${(p.total_earned || 0).toFixed(2)}</span>
                                    )
                                },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (p) => (
                                        <StatusBadge
                                            status={p.status === 'pending_approval' ? 'Pending' : p.status}
                                            variant={getStatusVariant(p.status)}
                                        />
                                    )
                                },
                                {
                                    key: 'created_at',
                                    label: 'Applied',
                                    render: (p) => (
                                        <span className="text-sm text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </span>
                                    )
                                }
                            ]}
                            actions={(p) => (
                                <div className="flex items-center gap-2">
                                    {p.status === 'pending_approval' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(p.id, 'approved')}
                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                title="Approve"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(p.id, 'suspended')}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Reject"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </>
                                    )}
                                    {p.status === 'approved' && (
                                        <button
                                            onClick={() => handleStatusChange(p.id, 'suspended')}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                            title="Suspend"
                                        >
                                            <UserX size={16} />
                                        </button>
                                    )}
                                    {p.status === 'suspended' && (
                                        <button
                                            onClick={() => handleStatusChange(p.id, 'approved')}
                                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                            title="Reactivate"
                                        >
                                            <UserCheck size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedPromoter(p);
                                            setShowModal(true);
                                        }}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Affiliate Details"
                size="lg"
            >
                {selectedPromoter && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-bold">{selectedPromoter.profiles?.full_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-bold">{selectedPromoter.profiles?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">PayPal Email</p>
                                <p className="font-bold">{selectedPromoter.paypal_email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Referral Code</p>
                                <code className="font-bold bg-gray-100 px-2 py-1 rounded">{selectedPromoter.referral_code}</code>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Commission Rate</p>
                                <p className="font-bold text-green-600">{(selectedPromoter.commission_rate * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <StatusBadge status={selectedPromoter.status} variant={getStatusVariant(selectedPromoter.status)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Earned</p>
                                <p className="font-bold text-2xl text-green-600">${(selectedPromoter.total_earned || 0).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Paid</p>
                                <p className="font-bold text-2xl">${(selectedPromoter.total_paid || 0).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <p className="text-sm text-gray-500 mb-2">Referral Link</p>
                            <div className="flex items-center gap-2">
                                <input
                                    id="referral-link"
                                    type="text"
                                    readOnly
                                    aria-label="Referral link for affiliate to share"
                                    value={`https://likklelegends.com/?ref=${selectedPromoter.referral_code}`}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(`https://likklelegends.com/?ref=${selectedPromoter.referral_code}`)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
