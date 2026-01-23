'use client';

import { useState } from 'react';

export default function TestBlogGen() {
    const [status, setStatus] = useState('Idle');

    const runTest = async () => {
        setStatus('Generating...');
        try {
            const res = await fetch('/api/admin/blog/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: 'The importance of Caribbean Identity',
                    category: 'parenting',
                    tone: 'inspiring',
                    autoPublish: true
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Request failed');

            setStatus(`Success! Created: ${data.post.title}`);
        } catch (e: any) {
            setStatus(`Error: ${e.message}`);
        }
    };

    return (
        <div className="p-10">
            <h1>Blog Generator Test</h1>
            <p className="text-sm text-gray-500 mb-4">Uses API route /api/admin/blog/generate</p>
            <button
                onClick={runTest}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition-colors"
            >
                Generate Test Post
            </button>
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-w-xl">{status}</pre>
        </div>
    );
}
