'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { ProblemCard, Problem } from '@/components/ProblemCard';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import jsPDF from 'jspdf';

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

    const downloadReportPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = 20;

        // Helper to add text with word wrap
        const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 7) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return y + (lines.length * lineHeight);
        };

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Análisis - Veta', margin, yPos);
        yPos += 15;

        // Report info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Búsqueda: "${report.query}"`, margin, yPos);
        yPos += 8;
        doc.text(`Fecha: ${new Date(report.created_at).toLocaleDateString('es-ES')}`, margin, yPos);
        yPos += 8;
        doc.text(`Problemas encontrados: ${report.problem_count}`, margin, yPos);
        yPos += 15;

        // Separator line
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Problems
        const problems = report.results?.problems || [];
        problems.forEach((problem, index) => {
            // Check if we need a new page
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Problem title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 204);
            yPos = addWrappedText(`${index + 1}. ${problem.description.slice(0, 100)}${problem.description.length > 100 ? '...' : ''}`, margin, yPos, pageWidth - margin * 2);
            yPos += 5;

            // Problem description
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            if (problem.description) {
                yPos = addWrappedText(problem.description, margin, yPos, pageWidth - margin * 2, 5);
                yPos += 5;
            }

            // Severity & WTP
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Puntuación: ${problem.signalScore || 'N/A'} | Disposición a Pagar: ${problem.willingnessToPay?.score || 'N/A'}`, margin, yPos);
            yPos += 10;

            if (problem.quotes && problem.quotes.length > 0) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(80, 80, 80);
                const topQuotes = problem.quotes.slice(0, 2);
                topQuotes.forEach((quote: string | { text: string; url?: string }) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    const quoteText = typeof quote === 'string' ? quote : quote.text;
                    yPos = addWrappedText(`"${quoteText}"`, margin + 5, yPos, pageWidth - margin * 2 - 10, 5);
                    yPos += 3;
                });
            }

            yPos += 8;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por Veta - veta.lat', margin, doc.internal.pageSize.getHeight() - 10);

        // Save
        doc.save(`reporte-${report.query.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
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
                <div className="space-y-6">
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
