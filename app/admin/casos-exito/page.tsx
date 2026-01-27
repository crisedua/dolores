'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, List, ArrowLeft, ExternalLink } from 'lucide-react';

type Story = {
    id: string;
    title: string;
    summary: string;
    steps: string[];
    website_url: string;
    article_content: string;
    created_at: string;
};

export default function AdminCasosExitoPage() {
    // Views: 'list' | 'create' | 'edit'
    const [view, setView] = useState<'list' | 'create' | 'edit'>('create');
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [articleContent, setArticleContent] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    // Manual overrides for edit
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [steps, setSteps] = useState<string[]>([]);

    // Fetch Stories
    const fetchStories = async () => {
        setPageLoading(true);
        try {
            const res = await fetch('/api/stories');
            const data = await res.json();
            if (data.success) {
                setStories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stories', error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchStories();
        }
    }, [view]);

    // Handle Edit Click
    const handleEdit = (story: Story) => {
        setEditingId(story.id);
        setWebsiteUrl(story.website_url || '');
        setArticleContent(story.article_content || '');
        setTitle(story.title);
        setSummary(story.summary);
        setSteps(story.steps || []);
        setMessage(null);
        setView('edit');
    };

    // Handle Delete Click
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this story?')) return;

        try {
            const res = await fetch(`/api/stories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStories(stories.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    // Handle Create/Update Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (view === 'create') {
                // Generate/Create Mode
                const response = await fetch('/api/generate-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleText: articleContent, websiteUrl })
                });
                const result = await response.json();

                if (result.success) {
                    setMessage({ type: 'success', text: 'Success! Story generated and saved.' });
                    setArticleContent('');
                    setWebsiteUrl('');
                    // Optional: Switch to edit mode to refine results immediately? 
                    // For now, simple success message
                } else {
                    setMessage({ type: 'error', text: `Error: ${result.error}` });
                }
            } else if (view === 'edit') {
                // Update Mode
                const response = await fetch('/api/stories', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        title,
                        summary,
                        steps,
                        website_url: websiteUrl,
                        article_content: articleContent
                    })
                });
                const result = await response.json();

                if (result.success) {
                    setMessage({ type: 'success', text: 'Story updated successfully.' });
                    // Provide option to go back
                } else {
                    setMessage({ type: 'error', text: `Error: ${result.error}` });
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    // Add step helper
    const addStep = () => setSteps([...steps, '']);
    const updateStep = (idx: number, val: string) => {
        const newSteps = [...steps];
        newSteps[idx] = val;
        setSteps(newSteps);
    };
    const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));

    return (
        <div className="p-8 max-w-6xl mx-auto text-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin: Case Studies</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'list' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <List size={20} /> List All
                    </button>
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setArticleContent('');
                            setWebsiteUrl('');
                            setMessage(null);
                            setView('create');
                        }}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'create' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <Plus size={20} /> Add New
                    </button>
                </div>
            </div>

            {/* MESSAGE */}
            {message && (
                <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="grid gap-4">
                    {pageLoading ? (
                        <div className="text-center py-10 text-gray-400">Loading stories...</div>
                    ) : stories.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-900 rounded-xl">No stories found. Create one!</div>
                    ) : (
                        stories.map(story => (
                            <div key={story.id} className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-2">{story.title || 'Untitled'}</h3>
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{story.summary}</p>
                                    <a href={story.website_url} target="_blank" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                                        {story.website_url} <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleEdit(story)}
                                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-blue-300 transition"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-red-400 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* CREATE / EDIT VIEW */}
            {view !== 'list' && (
                <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-xl">
                    <div className="flex items-center gap-4 mb-4 border-b border-gray-800 pb-4">
                        {view === 'edit' && (
                            <button type="button" onClick={() => setView('list')} className="text-gray-400 hover:text-white">
                                <ArrowLeft />
                            </button>
                        )}
                        <h2 className="text-xl font-semibold">
                            {view === 'create' ? 'Generate New Story with AI' : 'Edit Story'}
                        </h2>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Website URL</label>
                            <input
                                type="url"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                                placeholder="https://example.com"
                            />
                        </div>

                        {view === 'create' && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Raw Article Text (for AI Generation)</label>
                                <textarea
                                    value={articleContent}
                                    onChange={(e) => setArticleContent(e.target.value)}
                                    className="w-full h-48 p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-sm"
                                    placeholder="Paste the raw text here..."
                                    required={view === 'create'}
                                />
                            </div>
                        )}

                        {/* Edit Mode Specific Fields */}
                        {view === 'edit' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Summary</label>
                                    <textarea
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full h-32 p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-300">Key Steps / Takeaways</label>
                                        <button type="button" onClick={addStep} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700">+ Add Step</button>
                                    </div>
                                    <div className="space-y-2">
                                        {steps.map((step, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={step}
                                                    onChange={(e) => updateStep(idx, e.target.value)}
                                                    className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white text-sm"
                                                />
                                                <button type="button" onClick={() => removeStep(idx)} className="text-red-400 hover:bg-red-900/30 p-2 rounded">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg text-white font-bold transition-all w-full flex justify-center items-center gap-2 ${loading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">Processing...</span>
                            ) : view === 'create' ? '✨ Generate & Save Story' : '💾 Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
