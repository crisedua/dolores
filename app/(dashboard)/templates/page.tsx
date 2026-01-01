'use client';
import { useState, useEffect } from 'react';
import { Folder, Play, Trash2, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Template {
    id: string;
    name: string;
    query: string;
    createdAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newQuery, setNewQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Load templates from localStorage
        const savedTemplates = localStorage.getItem('dolores_templates');
        if (savedTemplates) {
            try {
                setTemplates(JSON.parse(savedTemplates));
            } catch (e) {
                console.error('Failed to parse templates:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const saveTemplates = (updated: Template[]) => {
        setTemplates(updated);
        localStorage.setItem('dolores_templates', JSON.stringify(updated));
    };

    const createTemplate = () => {
        if (!newName.trim() || !newQuery.trim()) return;

        const template: Template = {
            id: Date.now().toString(),
            name: newName,
            query: newQuery,
            createdAt: new Date().toISOString()
        };

        saveTemplates([template, ...templates]);
        setNewName('');
        setNewQuery('');
        setShowCreate(false);
    };

    const deleteTemplate = (id: string) => {
        saveTemplates(templates.filter(t => t.id !== id));
    };

    const useTemplate = (query: string) => {
        router.push(`/?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Plantillas Guardadas</h1>
                    <p className="text-gray-500 text-sm">Búsquedas predefinidas para reutilizar rápidamente.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} />
                    Nueva Plantilla
                </button>
            </div>

            {/* Create Template Modal */}
            {showCreate && (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-lg font-semibold text-white mb-4">Crear Nueva Plantilla</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Nombre de la Plantilla</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="ej: Problemas SaaS Legal"
                                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Query de Búsqueda</label>
                            <input
                                type="text"
                                value={newQuery}
                                onChange={(e) => setNewQuery(e.target.value)}
                                placeholder="ej: legal compliance SaaS problems"
                                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createTemplate}
                                disabled={!newName.trim() || !newQuery.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : templates.length === 0 && !showCreate ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
                        <Folder size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sin plantillas guardadas</h3>
                    <p className="text-gray-500 mb-6">Crea plantillas para reutilizar tus búsquedas frecuentes.</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Crear Primera Plantilla
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#444] transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                                    <p className="text-sm text-gray-400 font-mono bg-[#111] inline-block px-2 py-1 rounded">
                                        {template.query}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => useTemplate(template.query)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Play size={14} />
                                        Usar
                                    </button>
                                    <button
                                        onClick={() => deleteTemplate(template.id)}
                                        className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
