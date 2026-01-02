'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProblemCard, Problem } from '@/components/ProblemCard';
import { ArrowLeft, Calendar, Download } from 'lucide-react';

interface Report {
    id: string;
    title: string;
    query: string;
    problem_count: number;
    results: {
        problems: Problem[];
    };
    created_at: string;
}

export default function ReportDetailsPage() {
    const params = useParams();
    const reportId = params.id as string;
    const { user } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && reportId) {
            fetchReport();
        } else {
            if (user === null) setIsLoading(false);
        }
    }, [user, reportId]);

    const fetchReport = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_reports')
                .select('*')
                .eq('id', reportId)
                .single();

            if (error) throw error;
            if (data) setReport(data);
        } catch (err: any) {
            console.error('Error fetching report:', err);
            setError(err.message || 'No se pudo cargar el reporte');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadReportPDF = async () => {
        if (!report) return;

        // Dynamic import of html2pdf (client-side only)
        const html2pdf = (await import('html2pdf.js')).default;

        // Get the problems container element
        const element = document.getElementById('problems-container');
        if (!element) {
            console.error('Problems container not found');
            return;
        }

        // Create a wrapper with white background for PDF
        const wrapper = document.createElement('div');
        wrapper.style.backgroundColor = '#0a0a0a';
        wrapper.style.padding = '20px';
        wrapper.style.color = 'white';

        // Add header
        const header = document.createElement('div');
        header.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #333;">
                <h1 style="font-size: 24px; color: white; margin-bottom: 10px;">Reporte de Análisis - Veta</h1>
                <p style="color: #888; font-size: 14px;">Búsqueda: "${report.query}"</p>
                <p style="color: #888; font-size: 12px;">Fecha: ${new Date(report.created_at).toLocaleDateString('es-ES')} | ${report.problem_count} problemas encontrados</p>
            </div>
        `;
        wrapper.appendChild(header);

        // Clone the problems content
        const clone = element.cloneNode(true) as HTMLElement;
        wrapper.appendChild(clone);

        // Add footer
        const footer = document.createElement('div');
        footer.innerHTML = `
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 10px;">Generado por Veta - veta.lat</p>
            </div>
        `;
        wrapper.appendChild(footer);

        // Temporarily add to document for rendering
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        document.body.appendChild(wrapper);

        const opt = {
            margin: 10,
            filename: `reporte-${report.query.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: {
                scale: 2,
                backgroundColor: '#0a0a0a',
                useCORS: true
            },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
            pagebreak: { mode: 'avoid-all' as const }
        };

        try {
            await html2pdf().set(opt).from(wrapper).save();
        } finally {
            // Clean up
            document.body.removeChild(wrapper);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Reporte No Encontrado</h2>
                    <p className="text-gray-500 mb-6">{error || 'Este reporte no existe o fue eliminado.'}</p>
                    <Link
                        href="/app/reports"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Volver a Reportes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/app/reports"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Volver a Reportes
                </Link>

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
                    <button
                        onClick={downloadReportPDF}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Download size={18} />
                        Descargar PDF
                    </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(report.created_at)}
                    </span>
                    <span>•</span>
                    <span>Búsqueda: "{report.query}"</span>
                    <span>•</span>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        {report.problem_count} problemas
                    </span>
                </div>
            </div>

            {/* Problems List */}
            {report.results?.problems && report.results.problems.length > 0 ? (
                <div id="problems-container" className="space-y-6">
                    {report.results.problems.map((problem) => (
                        <ProblemCard key={problem.id} problem={problem} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <p>No hay problemas guardados en este reporte.</p>
                </div>
            )}
        </div>
    );
}
