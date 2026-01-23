'use client';

import { AdminLayout } from '@/components/admin/AdminComponents';
import BlogManagerView from '@/components/admin/BlogManagerView';

export default function AdminBlogPage() {
    return (
        <AdminLayout activeSection="blog">
            <div className="p-8">
                <BlogManagerView />
            </div>
        </AdminLayout>
    );
}
