'use client';
import { useState, useEffect } from 'react';
import { Search, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
    id: string;
    query: string;
    resultCount: number;
    createdAt: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load history from localStorage (for now, until Supabase is set up)
        const savedHistory = localStorage.getItem('dolores_search_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history:', e);
            }
        }
        setIsLoading(false);
    }, []);

    const deleteItem = (id: string) => {
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        localStorage.setItem('dolores_search_history', JSON.stringify(updated));
    };

    const clearAll = () => {
        setHistory([]);
        localStorage.removeItem('dolores_search_history');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Historial de Búsquedas</h1>
                    <p className="text-gray-500 text-sm">Tus búsquedas recientes y resultados guardados.</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-red-400 hover:text-red-300 uppercase tracking-wider font-bold"
                    >
                        Limpiar Todo
                    </button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sin historial aún</h3>
                    <p className="text-gray-500 mb-6">Tus búsquedas aparecerán aquí después de realizar una.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Iniciar Búsqueda
                        <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#1A1A1A] border border-[#333] rounded-lg p-4 hover:border-[#444] transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Link
                                        href={`/?q=${encodeURIComponent(item.query)}`}
                                        className="text-white font-medium hover:text-blue-400 transition-colors"
                                    >
                                        {item.query}
                                    </Link>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(item.createdAt)}
                                        </span>
                                        <span>{item.resultCount} problemas encontrados</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/?q=${encodeURIComponent(item.query)}`}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <ArrowRight size={16} />
                                    </Link>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <Trash2 size={16} />
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
