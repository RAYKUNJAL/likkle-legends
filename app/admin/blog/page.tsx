"use client";

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminComponents';
import {
    PlusCircle, Edit2, Trash2, Eye, RefreshCw,
    FileText, CheckCircle, Archive, Clock, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string; // Added missing property
    status: 'draft' | 'scheduled' | 'published' | 'archived';
    author_name: string;
    view_count: number;
    read_time_minutes: number;
    ai_generated: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_STYLES: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-500',
    scheduled: 'bg-blue-100 text-blue-700',
    archived: 'bg-amber-100 text-amber-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    published: <CheckCircle size={12} />,
    draft: <FileText size={12} />,
    scheduled: <Clock size={12} />,
    archived: <Archive size={12} />,
};

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'scheduled' | 'archived'>('all');
    const [search, setSearch] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const getToken = async () => {
        const { supabase } = await import('@/lib/storage');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Please log in as admin');
        return session.access_token;
    };

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { createClient } = await import('@supabase/supabase-js');
            const admin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            let query = admin.from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') query = query.eq('status', filter);

            const { data, error } = await query;
            if (error) throw error;
            setPosts(data || []);
        } catch (err: any) {
            console.error('Failed to fetch blog posts:', err);
            toast.error('Failed to load posts: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSave = async () => {
        if (!editingPost?.title || !editingPost?.content) {
            toast.error('Title and content are required');
            return;
        }
        setIsSaving(true);
        const toastId = toast.loading('Saving post...');
        try {
            const token = await getToken();
            const { supabase } = await import('@/lib/storage');
            const { createClient } = await import('@supabase/supabase-js');
            const admin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            );

            // Auto-generate slug from title
            const slug = editingPost.slug ||
                editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const payload = {
                ...editingPost,
                slug,
                author_name: editingPost.author_name || 'Likkle Legends',
                read_time_minutes: Math.ceil((editingPost.content?.split(' ').length || 0) / 200) || 1,
                updated_at: new Date().toISOString(),
            };

            if (editingPost.id) {
                const { error } = await admin.from('blog_posts').update(payload).eq('id', editingPost.id);
                if (error) throw error;
                toast.success('Post updated!', { id: toastId });
            } else {
                const { error } = await admin.from('blog_posts').insert({ ...payload, view_count: 0 });
                if (error) throw error;
                toast.success('Post created!', { id: toastId });
            }

            setShowEditor(false);
            setEditingPost(null);
            fetchPosts();
        } catch (err: any) {
            toast.error('Save failed: ' + err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this post permanently?')) return;
        const toastId = toast.loading('Deleting...');
        try {
            const token = await getToken();
            const { createClient } = await import('@supabase/supabase-js');
            const admin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            );
            const { error } = await admin.from('blog_posts').delete().eq('id', id);
            if (error) throw error;
            toast.success('Post deleted', { id: toastId });
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err: any) {
            toast.error('Delete failed: ' + err.message, { id: toastId });
        }
    };

    const handlePublish = async (post: BlogPost) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const toastId = toast.loading(`${newStatus === 'published' ? 'Publishing' : 'Unpublishing'}...`);
        try {
            const token = await getToken();
            const { createClient } = await import('@supabase/supabase-js');
            const admin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                { global: { headers: { Authorization: `Bearer ${token}` } } }
            );
            const { error } = await admin.from('blog_posts').update({
                status: newStatus,
                published_at: newStatus === 'published' ? new Date().toISOString() : null,
            }).eq('id', post.id);
            if (error) throw error;
            toast.success(`Post ${newStatus}!`, { id: toastId });
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus as any } : p));
        } catch (err: any) {
            toast.error('Failed: ' + err.message, { id: toastId });
        }
    };

    const filtered = posts.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase())
    );

    if (showEditor) {
        return (
            <AdminLayout activeSection="blog">
                <header className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            {editingPost?.id ? 'Edit Post' : 'New Post'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setShowEditor(false); setEditingPost(null); }}
                            className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-4xl mx-auto space-y-6">
                    <input
                        type="text"
                        placeholder="Post Title"
                        value={editingPost?.title || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPost(p => p ? ({ ...p, title: e.target.value }) : { title: e.target.value })}
                        className="w-full text-3xl font-black border-none outline-none bg-transparent placeholder-gray-300"
                    />
                    <input
                        type="text"
                        placeholder="Short excerpt (shown in listings)"
                        value={editingPost?.excerpt || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPost(p => p ? ({ ...p, excerpt: e.target.value }) : { excerpt: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm"
                    />
                    <textarea
                        placeholder="Write your content here..."
                        value={editingPost?.content || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingPost(p => p ? ({ ...p, content: e.target.value }) : { content: e.target.value })}
                        rows={20}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono resize-y"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-1">Status</label>
                            <select
                                value={editingPost?.status || 'draft'}
                                onChange={e => setEditingPost(p => ({ ...p, status: e.target.value as any }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-500 uppercase mb-1">Author</label>
                            <input
                                type="text"
                                value={editingPost?.author_name || 'Likkle Legends'}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingPost(p => p ? ({ ...p, author_name: e.target.value }) : { author_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                            />
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeSection="blog">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Blog Admin</h1>
                        <p className="text-gray-500">{posts.length} posts total</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchPosts} disabled={isLoading}
                            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => { setEditingPost({ status: 'draft' }); setShowEditor(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700"
                        >
                            <PlusCircle size={16} /> New Post
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                        {(['all', 'draft', 'published', 'scheduled', 'archived'] as const).map(s => (
                            <button key={s}
                                onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-xs border border-gray-200 rounded-xl px-3 py-2">
                        <Search size={14} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 text-sm outline-none bg-transparent"
                        />
                    </div>
                </div>
            </header>

            <div className="p-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No posts yet</h3>
                        <p className="text-gray-400 mb-6">Create your first blog post to get started</p>
                        <button
                            onClick={() => { setEditingPost({ status: 'draft' }); setShowEditor(true); }}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-700"
                        >
                            Create First Post
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Title</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Views</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Updated</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{post.title}</p>
                                                {post.excerpt && (
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>
                                                )}
                                                {post.ai_generated && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full">AI Generated</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLES[post.status]}`}>
                                                {STATUS_ICONS[post.status]} {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                                            {(post.view_count || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-gray-400">
                                            {new Date(post.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePublish(post)}
                                                    className={`p-2 rounded-lg transition-colors ${post.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingPost(post); setShowEditor(true); }}
                                                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
