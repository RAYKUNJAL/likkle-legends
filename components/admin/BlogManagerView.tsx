'use client';

import { useState, useEffect } from 'react';
import {
    Sparkles, Edit, Trash2, Eye, EyeOff, Clock, Calendar,
    Plus, Wand2, Loader2, CheckCircle, AlertCircle, Search,
    FileText, BarChart, RefreshCw, Zap
} from 'lucide-react';
import { getAllPosts, publishPost, deletePost, BlogPost } from '@/lib/services/blog';

const CATEGORIES = [
    { id: 'culture', name: 'Caribbean Culture', icon: '🏝️' },
    { id: 'parenting', name: 'Diaspora Parenting', icon: '👨‍👩‍👧' },
    { id: 'education', name: 'Kid Education', icon: '📚' },
    { id: 'activities', name: 'Fun Activities', icon: '🎨' },
    { id: 'recipes', name: 'Family Recipes', icon: '🍲' },
    { id: 'stories', name: 'Heritage Stories', icon: '📖' },
    { id: 'patois', name: 'Patois Learning', icon: '🗣️' },
];

export default function BlogManagerView() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // AI Generation Form
    const [showGenerator, setShowGenerator] = useState(false);
    const [genForm, setGenForm] = useState({
        topic: '',
        category: 'culture',
        tone: 'educational',
        wordCount: 1200,
        autoPublish: false
    });

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        try {
            const data = await getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
        setLoading(false);
    }

    async function handleGenerate() {
        if (!genForm.topic) {
            setMessage({ type: 'error', text: 'Please enter a topic' });
            return;
        }

        setGenerating(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/blog/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(genForm)
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                setGenForm({ ...genForm, topic: '' });
                loadPosts();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }

        setGenerating(false);
    }

    async function handleBatchGenerate(count: number) {
        setGenerating(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/blog/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count, autoPublish: false })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                loadPosts();
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }

        setGenerating(false);
    }

    async function handlePublish(id: string) {
        try {
            await publishPost(id);
            setMessage({ type: 'success', text: 'Post published!' });
            loadPosts();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this post?')) return;

        try {
            await deletePost(id);
            setMessage({ type: 'success', text: 'Post deleted!' });
            loadPosts();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    }

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        drafts: posts.filter(p => p.status === 'draft').length,
        aiGenerated: posts.filter(p => p.ai_generated).length
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-deep">Blog Manager</h1>
                    <p className="text-deep/50 mt-1">AI-powered content generation & publishing</p>
                </div>
                <button
                    onClick={() => setShowGenerator(!showGenerator)}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                    <Wand2 size={20} />
                    {showGenerator ? 'Close Generator' : 'AI Generate'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <FileText className="text-blue-600" size={20} />
                        </div>
                        <span className="text-2xl font-black text-deep">{stats.total}</span>
                    </div>
                    <p className="text-sm text-deep/50 font-medium">Total Posts</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Eye className="text-green-600" size={20} />
                        </div>
                        <span className="text-2xl font-black text-deep">{stats.published}</span>
                    </div>
                    <p className="text-sm text-deep/50 font-medium">Published</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Edit className="text-amber-600" size={20} />
                        </div>
                        <span className="text-2xl font-black text-deep">{stats.drafts}</span>
                    </div>
                    <p className="text-sm text-deep/50 font-medium">Drafts</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-purple-600" size={20} />
                        </div>
                        <span className="text-2xl font-black text-deep">{stats.aiGenerated}</span>
                    </div>
                    <p className="text-sm text-deep/50 font-medium">AI Generated</p>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* AI Generator Panel */}
            {showGenerator && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-purple-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-deep">AI Content Generator</h3>
                            <p className="text-deep/50 text-sm">Generate SEO-optimized blog posts instantly</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Single Post Generation */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h4 className="font-bold text-deep mb-4">Generate Single Post</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-deep/60 mb-2">Topic / Title Idea</label>
                                    <input
                                        type="text"
                                        value={genForm.topic}
                                        onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                                        placeholder="e.g., 10 Caribbean Lullabies for Bedtime"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-deep/60 mb-2">Category</label>
                                        <select
                                            value={genForm.category}
                                            onChange={(e) => setGenForm({ ...genForm, category: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-deep/60 mb-2">Tone</label>
                                        <select
                                            value={genForm.tone}
                                            onChange={(e) => setGenForm({ ...genForm, tone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200"
                                        >
                                            <option value="educational">Educational</option>
                                            <option value="fun">Fun & Playful</option>
                                            <option value="inspiring">Inspiring</option>
                                            <option value="practical">Practical</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={genForm.autoPublish}
                                            onChange={(e) => setGenForm({ ...genForm, autoPublish: e.target.checked })}
                                            className="w-5 h-5 rounded border-zinc-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-deep/60">Auto-publish immediately</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !genForm.topic}
                                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {generating ? (
                                        <><Loader2 className="animate-spin" size={20} /> Generating...</>
                                    ) : (
                                        <><Wand2 size={20} /> Generate Post</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Batch Generation */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h4 className="font-bold text-deep mb-4">Quick Batch Generate</h4>
                            <p className="text-deep/50 text-sm mb-6">
                                Auto-generate posts from our curated topic library. Perfect for building initial content.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleBatchGenerate(3)}
                                    disabled={generating}
                                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-deep py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Zap size={18} /> Generate 3 Posts
                                </button>
                                <button
                                    onClick={() => handleBatchGenerate(5)}
                                    disabled={generating}
                                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-deep py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Zap size={18} /> Generate 5 Posts
                                </button>
                                <button
                                    onClick={() => handleBatchGenerate(10)}
                                    disabled={generating}
                                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-deep py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <Zap size={18} /> Generate 10 Posts
                                </button>
                            </div>

                            <p className="text-xs text-deep/30 mt-4 text-center">
                                Posts are saved as drafts. Review before publishing.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'published', 'draft'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filterStatus === status
                                    ? 'bg-deep text-white'
                                    : 'bg-zinc-100 text-deep/60 hover:bg-zinc-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep/30" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search posts..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-zinc-200 w-64"
                        />
                    </div>
                    <button
                        onClick={loadPosts}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 transition-colors"
                    >
                        <RefreshCw size={18} className="text-deep/60" />
                    </button>
                </div>
            </div>

            {/* Posts Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-zinc-100">
                    <FileText className="mx-auto mb-4 text-deep/20" size={48} />
                    <h3 className="text-xl font-bold text-deep mb-2">No posts yet</h3>
                    <p className="text-deep/50 mb-6">Use the AI generator to create your first blog post!</p>
                    <button
                        onClick={() => setShowGenerator(true)}
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold"
                    >
                        <Sparkles size={18} /> Generate First Post
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-deep/40 uppercase tracking-wider">Post</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-deep/40 uppercase tracking-wider">Category</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-deep/40 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-deep/40 uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-deep/40 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {post.ai_generated && (
                                                <span className="text-purple-500" title="AI Generated">
                                                    <Sparkles size={16} />
                                                </span>
                                            )}
                                            <div>
                                                <p className="font-bold text-deep line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-deep/40">/{post.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm">
                                            {CATEGORIES.find(c => c.id === post.category)?.icon}{' '}
                                            {CATEGORIES.find(c => c.id === post.category)?.name || post.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.status === 'published'
                                                ? 'bg-green-100 text-green-700'
                                                : post.status === 'draft'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-deep/50">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {post.status === 'published' ? (
                                                <a
                                                    href={`/blog/${post.slug}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => handlePublish(post.id)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                    title="Publish"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
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
    );
}
