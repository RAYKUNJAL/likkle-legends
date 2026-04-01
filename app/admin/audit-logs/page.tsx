"use client";

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminComponents';
import { getAuditLogs, getAuditLogStats } from '@/app/actions/admin';
import { Search, Filter, ChevronRight, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

const ACTIONS = [
    'approve_content', 'reject_content', 'generate_content', 'publish_content',
    'delete_content', 'update_order', 'update_order_status', 'update_review_status',
    'delete_generated_content', 'run_agent', 'publish_module', 'generate_blog',
    'generate_social', 'update_settings', 'other'
];

const RESOURCE_TYPES = [
    'generated_content', 'order', 'blog_post', 'social_post', 'song',
    'video', 'printable', 'module', 'character', 'announcement', 'game', 'setting', 'other'
];

interface AuditLog {
    id: string;
    admin_id: string;
    admin_email: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    details?: Record<string, any>;
    status: 'success' | 'error';
    error_message?: string;
    ip_address?: string;
    created_at: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState({ totalLogs: 0, successfulActions: 0, failedActions: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(25);
    const [totalLogs, setTotalLogs] = useState(0);

    // Filters
    const [filters, setFilters] = useState({
        admin_email: '',
        action: '',
        resource_type: '',
        status: '' as '' | 'success' | 'error',
        date_from: '',
        date_to: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Get token from cookies
    const getToken = useCallback(async () => {
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        return cookieStore.get('sb-access-token')?.value || '';
    }, []);

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = await getToken();

            const filterObj: any = {};
            if (filters.admin_email) filterObj.admin_email = filters.admin_email;
            if (filters.action) filterObj.action = filters.action;
            if (filters.resource_type) filterObj.resource_type = filters.resource_type;
            if (filters.status) filterObj.status = filters.status;
            if (filters.date_from) filterObj.date_from = filters.date_from;
            if (filters.date_to) filterObj.date_to = filters.date_to;

            const result = await getAuditLogs(token, filterObj, pageSize, currentPage * pageSize);
            setLogs(result.logs);
            setTotalLogs(result.total);

            const statsResult = await getAuditLogStats(token);
            setStats(statsResult);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, filters, currentPage, pageSize]);

    useEffect(() => {
        fetchLogs();
    }, [filters, currentPage]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(0);
    };

    const resetFilters = () => {
        setFilters({
            admin_email: '',
            action: '',
            resource_type: '',
            status: '' as '' | 'success' | 'error',
            date_from: '',
            date_to: ''
        });
        setCurrentPage(0);
    };

    const totalPages = Math.ceil(totalLogs / pageSize);
    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    return (
        <AdminLayout activeSection="audit-logs">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <h1 className="text-3xl font-black text-gray-900">Audit Logs</h1>
                <p className="text-gray-500 mt-1">Complete record of all admin actions — immutable and permanent.</p>
            </header>

            <div className="p-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-500 font-semibold mb-2">Total Actions (30d)</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalLogs}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm text-green-600 font-semibold mb-2">Successful</p>
                        <p className="text-3xl font-black text-green-600">{stats.successfulActions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <p className="text-sm text-red-600 font-semibold mb-2">Failed</p>
                        <p className="text-3xl font-black text-red-600">{stats.failedActions}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-gray-700 font-semibold hover:text-gray-900"
                        >
                            <Filter size={20} />
                            Filters {hasActiveFilters && `(${Object.values(filters).filter(v => v !== '').length})`}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Reset All
                            </button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
                                <input
                                    type="text"
                                    name="admin_email"
                                    value={filters.admin_email}
                                    onChange={handleFilterChange}
                                    placeholder="Search by email..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
                                <select
                                    name="action"
                                    value={filters.action}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Actions</option>
                                    {ACTIONS.map(action => (
                                        <option key={action} value={action}>
                                            {action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Resource Type</label>
                                <select
                                    name="resource_type"
                                    value={filters.resource_type}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    {RESOURCE_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="success">Success</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                                <input
                                    type="datetime-local"
                                    name="date_from"
                                    value={filters.date_from}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                                <input
                                    type="datetime-local"
                                    name="date_to"
                                    value={filters.date_to}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Logs Table */}
                {isLoading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">No audit logs found.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Timestamp
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Admin
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Resource
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                IP Address
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                Details
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {log.admin_email}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        {log.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="text-gray-600">
                                                        {log.resource_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                    </span>
                                                    {log.resource_id && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            ({log.resource_id.substring(0, 8)}...)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        {log.status === 'success' ? (
                                                            <>
                                                                <CheckCircle2 size={16} className="text-green-600" />
                                                                <span className="text-green-600 font-semibold">Success</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle size={16} className="text-red-600" />
                                                                <span className="text-red-600 font-semibold">Error</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {log.ip_address || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedLog(log);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalLogs)} of {totalLogs} logs
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    const pageNum = i + Math.max(0, currentPage - 2);
                                    if (pageNum >= totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                                currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Detail Modal */}
                {selectedLog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Action Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Timestamp</p>
                                    <p className="text-gray-900 font-semibold">
                                        {new Date(selectedLog.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Admin Email</p>
                                    <p className="text-gray-900 font-semibold">{selectedLog.admin_email}</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action</p>
                                    <p className="text-gray-900 font-semibold">
                                        {selectedLog.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resource</p>
                                    <p className="text-gray-900 font-semibold">
                                        {selectedLog.resource_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        {selectedLog.resource_id && ` (${selectedLog.resource_id})`}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {selectedLog.status === 'success' ? (
                                            <>
                                                <CheckCircle2 size={20} className="text-green-600" />
                                                <span className="text-green-600 font-semibold">Success</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={20} className="text-red-600" />
                                                <span className="text-red-600 font-semibold">Error</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {selectedLog.error_message && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Error Message</p>
                                        <p className="text-red-600 font-mono text-sm bg-red-50 p-3 rounded-lg">
                                            {selectedLog.error_message}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.ip_address && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">IP Address</p>
                                        <p className="text-gray-900 font-semibold">{selectedLog.ip_address}</p>
                                    </div>
                                )}

                                {selectedLog.details && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Details</p>
                                        <pre className="text-gray-900 font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                                            {JSON.stringify(selectedLog.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="mt-8 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
