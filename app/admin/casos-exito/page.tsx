'use client';

import { useState } from 'react';
import { generateAndSaveStory } from '@/app/actions/generate-story';

export default function AdminCasosExitoPage() {
    const [articleContent, setArticleContent] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await generateAndSaveStory(articleContent, websiteUrl);

            if (result.success) {
                setMessage({ type: 'success', text: 'Success! Story generated and saved.' });
                setArticleContent('');
                setWebsiteUrl('');
            } else {
                setMessage({ type: 'error', text: `Error: ${result.error}` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Admin: Add Success Story</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Website URL</label>
                    <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                        placeholder="https://example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Article Content (Raw Text)</label>
                    <textarea
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full h-64 p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-sm"
                        placeholder="Paste the full article text here..."
                        required
                    />
                </div>

                {message && (
                    <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg text-white font-medium transition-colors w-full"
                >
                    {loading ? 'Processing with AI...' : 'Generate & Save Story'}
                </button>
            </form>
        </div>
    );
}
