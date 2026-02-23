"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, Tabs,
    ActionButton,
    Package, Eye, Edit, Trash2, ChevronRight
} from '@/components/admin/AdminComponents';

interface Order {
    id: string;
    order_number: string;
    profiles: { full_name: string; email: string };
    tier: string;
    amount_cents: number;
    currency: string;
    payment_status: string;
    fulfillment_status: string;
    fulfillment_hub: string;
    shipping_name: string;
    shipping_address_line1: string;
    shipping_address_line2?: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    child_name: string;
    child_age: number;
    selected_island: string;
    tracking_number?: string;
    created_at: string;
    shipped_at?: string;
    delivered_at?: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [trackingInput, setTrackingInput] = useState('');

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { getAllOrdersAdmin } = await import('@/app/actions/admin');
            const { orders: ordersData, total } = await getAllOrdersAdmin(session.access_token, activeTab, 100, 0);

            setOrders(ordersData as Order[]);
            setTotalCount(total);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string, tracking?: string) => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { updateOrderStatusAdmin } = await import('@/app/actions/admin');
            await updateOrderStatusAdmin(session.access_token, orderId, status, tracking);

            await loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
        const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
            pending: 'warning',
            processing: 'info',
            shipped: 'info',
            delivered: 'success',
            failed: 'error',
            refunded: 'error',
        };
        return variants[status] || 'default';
    };

    const getFulfillmentHubLabel = (hub: string) => {
        const hubs: Record<string, { label: string; color: string }> = {
            maryland: { label: 'Maryland HQ', color: 'bg-blue-100 text-blue-700' },
            stannp_uk: { label: 'UK POD', color: 'bg-purple-100 text-purple-700' },
            stannp_canada: { label: 'Canada POD', color: 'bg-green-100 text-green-700' },
        };
        return hubs[hub] || { label: hub, color: 'bg-gray-100 text-gray-700' };
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
            o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            o.shipping_name?.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && o.fulfillment_status === activeTab;
    });

    const tabCounts = {
        all: orders.length,
        pending: orders.filter(o => o.fulfillment_status === 'pending').length,
        processing: orders.filter(o => o.fulfillment_status === 'processing').length,
        shipped: orders.filter(o => o.fulfillment_status === 'shipped').length,
        delivered: orders.filter(o => o.fulfillment_status === 'delivered').length,
    };

    return (
        <AdminLayout activeSection="orders">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Orders & Fulfillment</h1>
                        <p className="text-gray-500">{totalCount} total orders</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                            Export Orders
                        </button>
                        <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                            Print Batch Labels
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <Tabs
                    tabs={[
                        { id: 'all', label: 'All Orders', count: tabCounts.all },
                        { id: 'pending', label: 'Pending', count: tabCounts.pending },
                        { id: 'processing', label: 'Processing', count: tabCounts.processing },
                        { id: 'shipped', label: 'Shipped', count: tabCounts.shipped },
                        { id: 'delivered', label: 'Delivered', count: tabCounts.delivered },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by order #, customer name..."
                    onRefresh={loadOrders}
                />

                <DataTable
                    data={filteredOrders}
                    isLoading={isLoading}
                    emptyMessage="No orders found"
                    onRowClick={setSelectedOrder}
                    columns={[
                        {
                            key: 'order_number',
                            label: 'Order',
                            render: (order) => (
                                <div>
                                    <p className="font-bold text-gray-900">{order.order_number}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ),
                        },
                        {
                            key: 'customer',
                            label: 'Customer',
                            render: (order) => (
                                <div>
                                    <p className="font-medium text-gray-900">{order.profiles?.full_name}</p>
                                    <p className="text-xs text-gray-400">{order.shipping_city}, {order.shipping_country}</p>
                                </div>
                            ),
                        },
                        {
                            key: 'child',
                            label: 'Child',
                            render: (order) => (
                                <div>
                                    <p className="font-medium text-gray-900">{order.child_name}</p>
                                    <p className="text-xs text-gray-400">Age {order.child_age} • {order.selected_island}</p>
                                </div>
                            ),
                        },
                        {
                            key: 'tier',
                            label: 'Tier',
                            render: (order) => (
                                <span className="capitalize">{order.tier?.replace('_', ' ')}</span>
                            ),
                        },
                        {
                            key: 'fulfillment_hub',
                            label: 'Fulfillment',
                            render: (order) => {
                                const hub = getFulfillmentHubLabel(order.fulfillment_hub);
                                return (
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${hub.color}`}>
                                        {hub.label}
                                    </span>
                                );
                            },
                        },
                        {
                            key: 'fulfillment_status',
                            label: 'Status',
                            render: (order) => (
                                <StatusBadge
                                    status={order.fulfillment_status}
                                    variant={getStatusVariant(order.fulfillment_status)}
                                />
                            ),
                        },
                        {
                            key: 'amount',
                            label: 'Amount',
                            render: (order) => (
                                <span className="font-bold">
                                    {order.currency === 'GBP' ? '£' : order.currency === 'CAD' ? 'C$' : '$'}
                                    {(order.amount_cents / 100).toFixed(2)}
                                </span>
                            ),
                        },
                    ]}
                    actions={(order) => (
                        <ActionButton icon={ChevronRight} onClick={() => setSelectedOrder(order)} title="View Details" />
                    )}
                />
            </div>

            {/* Order Detail Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => { setSelectedOrder(null); setTrackingInput(''); }}
                title={`Order ${selectedOrder?.order_number}`}
                size="xl"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status Timeline */}
                        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                            {['pending', 'processing', 'shipped', 'delivered'].map((status, i) => {
                                const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.fulfillment_status) >= i;
                                const isCurrent = selectedOrder.fulfillment_status === status;

                                return (
                                    <div key={status} className="flex items-center flex-1">
                                        <div className={`flex-1 ${i > 0 ? 'h-1 mr-2' : ''} ${isActive ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCurrent ? 'bg-primary text-white' :
                                            isActive ? 'bg-green-500 text-white' :
                                                'bg-gray-200 text-gray-500'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <span className={`text-xs ml-2 capitalize ${isCurrent ? 'font-bold' : 'text-gray-500'}`}>
                                            {status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Shipping Info */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Package size={18} /> Shipping Address
                                </h4>
                                <div className="text-sm space-y-1 text-gray-600">
                                    <p className="font-medium text-gray-900">{selectedOrder.shipping_name}</p>
                                    <p>{selectedOrder.shipping_address_line1}</p>
                                    {selectedOrder.shipping_address_line2 && <p>{selectedOrder.shipping_address_line2}</p>}
                                    <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}</p>
                                    <p>{selectedOrder.shipping_country}</p>
                                </div>
                            </div>

                            {/* Child Info */}
                            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-4">
                                <h4 className="font-bold text-gray-900 mb-3">🎁 Personalization</h4>
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Child Name</span>
                                        <span className="font-bold">{selectedOrder.child_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Age</span>
                                        <span className="font-medium">{selectedOrder.child_age} years</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Island Theme</span>
                                        <span className="font-medium capitalize">{selectedOrder.selected_island?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subscription</span>
                                        <span className="font-medium capitalize">{selectedOrder.tier?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {selectedOrder.tracking_number && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <h4 className="font-bold text-blue-900 mb-1">Tracking Number</h4>
                                <p className="text-blue-700 font-mono">{selectedOrder.tracking_number}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="font-bold text-gray-900 mb-4">Update Order Status</h4>

                            <div className="flex flex-wrap gap-3">
                                {selectedOrder.fulfillment_status === 'pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                                    >
                                        Mark as Processing
                                    </button>
                                )}

                                {selectedOrder.fulfillment_status === 'processing' && (
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="text"
                                            value={trackingInput}
                                            onChange={(e) => setTrackingInput(e.target.value)}
                                            placeholder="Enter tracking number..."
                                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped', trackingInput)}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors"
                                        >
                                            Mark as Shipped
                                        </button>
                                    </div>
                                )}

                                {selectedOrder.fulfillment_status === 'shipped' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                                        className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}

                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                                    Print Label
                                </button>

                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                                    Send to Stannp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
