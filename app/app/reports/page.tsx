'use client';
import { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Report {
    id: string;
    title: string;
    query: string;
    problem_count: number;
    created_at: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchReports();
        } else {
            if (user === null) setIsLoading(false);
        }
    }, [user]);

    const fetchReports = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_reports')
                .select('id, title, query, problem_count, created_at') // Don't fetch heavy 'results' JSON for list
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteReport = async (id: string) => {
        try {
            const { error } = await supabase
                .from('saved_reports')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setReports(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Reportes Guardados</h1>
                    <p className="text-gray-500 text-sm">Tus análisis guardados para referencia futura.</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#333] px-4 py-2 rounded-full">
                    <span className="text-xs font-bold text-gray-300">
                        {reports.length} {reports.length === 1 ? 'REPORTE' : 'REPORTES'}
                    </span>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sin reportes guardados</h3>
                    <p className="text-gray-500 mb-6">Cuando guardes un análisis, aparecerá aquí.</p>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Crear Nueva Búsqueda
                        <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5 hover:border-[#444] transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-1">{report.title}</h3>
                                    <p className="text-sm text-gray-400 mb-3">Búsqueda: "{report.query}"</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(report.created_at)}
                                        </span>
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                            {report.problem_count} problemas
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/app/reports/${report.id}`}
                                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                                        title="Ver Reporte"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                    <button
                                        onClick={() => deleteReport(report.id)}
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
