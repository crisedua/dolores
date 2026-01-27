'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, List, ArrowLeft, ExternalLink, X, Eye, DollarSign } from 'lucide-react';

type Story = {
    id: string;
    title: string;
    revenue?: string;
    startup_costs?: string;
    summary: string;
    steps: string[];
    website_url: string;
    article_content: string;
    created_at: string;
};

export default function AdminCasosExitoPage() {
    // Views: 'list' | 'create' | 'edit'
    const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Detail Modal State
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [articleContent, setArticleContent] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    // Manual overrides for edit
    const [title, setTitle] = useState('');
    const [revenue, setRevenue] = useState('');
    const [startupCosts, setStartupCosts] = useState('');
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
        setRevenue(story.revenue || '');
        setStartupCosts(story.startup_costs || '');
        setSummary(story.summary);
        setSteps(story.steps || []);
        setMessage(null);
        setView('edit');
        setSelectedStory(null); // Close modal if open
    };

    // Handle Delete Click
    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!confirm('¿Estás seguro de que deseas eliminar esta historia?')) return;

        try {
            const res = await fetch(`/api/stories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStories(stories.filter(s => s.id !== id));
                if (selectedStory?.id === id) setSelectedStory(null);
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
                    setMessage({ type: 'success', text: '¡Éxito! Historia generada y guardada.' });
                    setArticleContent('');
                    setWebsiteUrl('');
                    setView('list'); // Go back to list to see it
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
                        revenue,
                        startup_costs: startupCosts,
                        summary,
                        steps,
                        website_url: websiteUrl,
                        article_content: articleContent
                    })
                });
                const result = await response.json();

                if (result.success) {
                    setMessage({ type: 'success', text: 'Historia actualizada correctamente.' });
                    // Provide option to go back
                } else {
                    setMessage({ type: 'error', text: `Error: ${result.error}` });
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Ocurrió un error inesperado.' });
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
        <div className="p-8 max-w-7xl mx-auto text-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Admin: Casos de Éxito</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${view === 'list' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        <List size={20} /> Ver Lista
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
                        <Plus size={20} /> Agregar Nuevo
                    </button>
                </div>
            </div>

            {/* MESSAGE */}
            {message && (
                <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* LIST VIEW (TABLE FORMAT) */}
            {view === 'list' && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-800 p-4 text-sm font-semibold text-gray-400 gap-4">
                        <div className="col-span-5">TITULO</div>
                        <div className="col-span-3">INGRESOS</div>
                        <div className="col-span-3">WEBSITE</div>
                        <div className="col-span-1 text-center">ACCIONES</div>
                    </div>

                    {pageLoading ? (
                        <div className="text-center py-10 text-gray-400">Cargando historias...</div>
                    ) : stories.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No se encontraron historias. ¡Crea una nueva!</div>
                    ) : (
                        stories.map(story => (
                            <div
                                key={story.id}
                                onClick={() => setSelectedStory(story)}
                                className="grid grid-cols-12 p-4 border-b border-gray-800 hover:bg-gray-800/50 transition cursor-pointer items-center gap-4 group"
                            >
                                <div className="col-span-5 font-medium text-white group-hover:text-blue-400 transition">
                                    {story.title || 'Sin Título'}
                                </div>
                                <div className="col-span-3 text-green-400 font-mono text-sm">
                                    {story.revenue || '-'}
                                </div>
                                <div className="col-span-3 text-gray-400 text-sm truncate flex items-center gap-2">
                                    {story.website_url ? (
                                        <div className="flex items-center gap-1 hover:text-white" onClick={(e) => e.stopPropagation()}>
                                            <a href={story.website_url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                                                {story.website_url}
                                            </a>
                                            <ExternalLink size={12} />
                                        </div>
                                    ) : '-'}
                                </div>
                                <div className="col-span-1 flex justify-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(story); }}
                                        className="p-2 hover:bg-gray-700 rounded text-blue-300 transition"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(story.id, e)}
                                        className="p-2 hover:bg-gray-700 rounded text-red-400 transition"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* DETAIL MODAL */}
            {selectedStory && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button
                            onClick={() => setSelectedStory(null)}
                            className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-bold text-white mb-2 pr-8">{selectedStory.title}</h2>

                            <div className="flex gap-4 mb-6 text-sm">
                                {selectedStory.website_url && (
                                    <a href={selectedStory.website_url} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline bg-blue-900/20 px-3 py-1 rounded-full border border-blue-900/50">
                                        <ExternalLink size={14} /> {selectedStory.website_url}
                                    </a>
                                )}
                                {selectedStory.revenue && (
                                    <div className="flex items-center gap-1 text-green-400 bg-green-900/20 px-3 py-1 rounded-full border border-green-900/50">
                                        <DollarSign size={14} /> {selectedStory.revenue}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Resumen</h3>
                                    <p className="text-gray-300 leading-relaxed">{selectedStory.summary}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Claves del Éxito</h3>
                                    <ul className="space-y-2">
                                        {selectedStory.steps?.map((step, i) => (
                                            <li key={i} className="flex gap-3 text-gray-300">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-600/40">{i + 1}</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => handleEdit(selectedStory)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2"
                                >
                                    <Edit size={16} /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedStory.id)}
                                    className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg font-medium flex items-center gap-2 border border-red-900/50"
                                >
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
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
                            {view === 'create' ? 'Generar Nueva Historia con IA' : 'Editar Historia'}
                        </h2>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 gap-6">
                        {view === 'create' && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-300">Texto del Artículo (Para generar con IA)</label>
                                <div className="text-xs text-gray-500 mb-2">Nota: La primera línea será usada como el TÍTULO exacto con Ingresos. El sistema detectará la URL automáticamente.</div>
                                <textarea
                                    value={articleContent}
                                    onChange={(e) => setArticleContent(e.target.value)}
                                    className="w-full h-48 p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-sm"
                                    placeholder="Pegue el texto completo aquí.&#10;Línea 1: Título | $Ingresos"
                                    required={view === 'create'}
                                />
                            </div>
                        )}

                        {/* Edit Mode Specific Fields */}
                        {view === 'edit' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Título</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-bold"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium mb-2 text-gray-300">URL del Sitio Web</label>
                                        <input
                                            type="url"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                                            placeholder="https://ejemplo.com"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Ingresos (e.g. $5k/mo)</label>
                                        <input
                                            type="text"
                                            value={revenue}
                                            onChange={(e) => setRevenue(e.target.value)}
                                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-green-400"
                                            placeholder="$0/mo"
                                        />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Costos de Inicio (e.g. $100)</label>
                                        <input
                                            type="text"
                                            value={startupCosts}
                                            onChange={(e) => setStartupCosts(e.target.value)}
                                            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white font-mono text-blue-400"
                                            placeholder="$0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-300">Resumen</label>
                                    <textarea
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full h-32 p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-300">Pasos Clave / Takeaways</label>
                                        <button type="button" onClick={addStep} className="text-xs bg-gray-800 px-2 py-1 rounded hover:bg-gray-700">+ Agregar Paso</button>
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
                                <span className="flex items-center gap-2">Procesando...</span>
                            ) : view === 'create' ? '✨ Generar y Guardar' : '💾 Guardar Cambios'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
