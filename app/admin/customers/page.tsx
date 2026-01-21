"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, Tabs,
    ActionButton,
    Users, Edit, Eye, Package, CreditCard
} from '@/components/admin/AdminComponents';
import { getAllProfiles, getChildren } from '@/lib/database';

interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    subscription_tier: string;
    subscription_status: string;
    country_code: string;
    currency: string;
    has_grandparent_dashboard: boolean;
    created_at: string;
    children: {
        id: string;
        first_name: string;
        age: number;
        age_track: string;
        total_xp: number;
        current_streak: number;
    }[];
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { getAllProfilesAdmin } = await import('@/app/actions/admin');
            const { profiles, total } = await getAllProfilesAdmin(session.access_token, 100, 0);

            setCustomers(profiles as Customer[]);
            setTotalCount(total);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
            active: 'success',
            trialing: 'info',
            past_due: 'warning',
            canceled: 'error',
            inactive: 'default',
        };
        return variants[status] || 'default';
    };

    const getTierColor = (tier: string) => {
        const colors: Record<string, string> = {
            free: 'bg-gray-100 text-gray-600',
            starter_mailer: 'bg-blue-100 text-blue-700',
            legends_plus: 'bg-purple-100 text-purple-700',
            family_legacy: 'bg-amber-100 text-amber-700',
        };
        return colors[tier] || 'bg-gray-100 text-gray-600';
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'active') return matchesSearch && c.subscription_status === 'active';
        if (activeTab === 'trialing') return matchesSearch && c.subscription_status === 'trialing';
        if (activeTab === 'churned') return matchesSearch && c.subscription_status === 'canceled';
        return matchesSearch;
    });

    const tabCounts = {
        all: customers.length,
        active: customers.filter(c => c.subscription_status === 'active').length,
        trialing: customers.filter(c => c.subscription_status === 'trialing').length,
        churned: customers.filter(c => c.subscription_status === 'canceled').length,
    };

    return (
        <AdminLayout activeSection="customers">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Customers</h1>
                        <p className="text-gray-500">{totalCount} total customers</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Export CSV
                    </button>
                </div>
            </header>

            <div className="p-8">
                <Tabs
                    tabs={[
                        { id: 'all', label: 'All Customers', count: tabCounts.all },
                        { id: 'active', label: 'Active', count: tabCounts.active },
                        { id: 'trialing', label: 'On Trial', count: tabCounts.trialing },
                        { id: 'churned', label: 'Churned', count: tabCounts.churned },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or email..."
                    onRefresh={loadCustomers}
                />

                <DataTable
                    data={filteredCustomers}
                    isLoading={isLoading}
                    emptyMessage="No customers found"
                    onRowClick={setSelectedCustomer}
                    columns={[
                        {
                            key: 'full_name',
                            label: 'Customer',
                            render: (customer) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                                        {customer.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{customer.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-gray-400">{customer.email}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'subscription_tier',
                            label: 'Plan',
                            render: (customer) => (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTierColor(customer.subscription_tier)}`}>
                                    {customer.subscription_tier.replace('_', ' ')}
                                </span>
                            ),
                        },
                        {
                            key: 'subscription_status',
                            label: 'Status',
                            render: (customer) => (
                                <StatusBadge
                                    status={customer.subscription_status}
                                    variant={getStatusVariant(customer.subscription_status)}
                                />
                            ),
                        },
                        {
                            key: 'children',
                            label: 'Children',
                            render: (customer) => (
                                <div className="flex items-center gap-1">
                                    <Users size={16} className="text-gray-400" />
                                    <span>{customer.children?.length || 0}</span>
                                </div>
                            ),
                        },
                        {
                            key: 'country_code',
                            label: 'Location',
                            render: (customer) => (
                                <span className="text-gray-600">{customer.country_code} / {customer.currency}</span>
                            ),
                        },
                        {
                            key: 'created_at',
                            label: 'Joined',
                            render: (customer) => (
                                <span className="text-gray-500 text-sm">
                                    {new Date(customer.created_at).toLocaleDateString()}
                                </span>
                            ),
                        },
                    ]}
                    actions={(customer) => (
                        <div className="flex items-center gap-1">
                            <ActionButton icon={Eye} onClick={() => setSelectedCustomer(customer)} title="View Details" />
                            <ActionButton icon={Edit} onClick={() => { }} title="Edit" />
                        </div>
                    )}
                />
            </div>

            {/* Customer Detail Modal */}
            <Modal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                title="Customer Details"
                size="xl"
            >
                {selectedCustomer && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                {selectedCustomer.full_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-gray-900">{selectedCustomer.full_name}</h3>
                                <p className="text-gray-500">{selectedCustomer.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <StatusBadge
                                        status={selectedCustomer.subscription_status}
                                        variant={getStatusVariant(selectedCustomer.subscription_status)}
                                    />
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTierColor(selectedCustomer.subscription_tier)}`}>
                                        {selectedCustomer.subscription_tier.replace('_', ' ')}
                                    </span>
                                    {selectedCustomer.has_grandparent_dashboard && (
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                            + Grandparent Dashboard
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Children */}
                        <div>
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Users size={18} /> Children ({selectedCustomer.children?.length || 0})
                            </h4>
                            {selectedCustomer.children && selectedCustomer.children.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {selectedCustomer.children.map((child) => (
                                        <div key={child.id} className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-bold text-gray-900">{child.first_name}</h5>
                                                <span className="text-xs text-gray-500">Age: {child.age}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-500">
                                                    Track: <span className="font-medium capitalize">{child.age_track}</span>
                                                </span>
                                                <span className="text-gray-500">
                                                    XP: <span className="font-medium text-primary">{child.total_xp}</span>
                                                </span>
                                                <span className="text-gray-500">
                                                    Streak: <span className="font-medium">{child.current_streak} 🔥</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">No children added yet</p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                                <Package size={16} /> View Orders
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                                <CreditCard size={16} /> Manage Subscription
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
                                Send Message
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
