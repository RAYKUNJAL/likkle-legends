"use client";

import { AdminLayout } from '@/components/admin/AdminComponents';
import { DashboardOverview } from '@/components/admin/DashboardOverview';

export default function AdminOverviewPage() {
    return (
        <AdminLayout activeSection="overview">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <h1 className="text-3xl font-black text-gray-900">Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back — here's your business at a glance.</p>
            </header>
            <div className="p-8">
                <DashboardOverview />
            </div>
        </AdminLayout>
    );
}
