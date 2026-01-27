
import { supabase } from '@/lib/supabase';
import { ExternalLink, DollarSign, ArrowLeft, CheckCircle2, Globe } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StoryDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const { data: story, error } = await supabase
        .from('success_stories')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !story) {
        console.error("Error fetching story:", error);
        return notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Navigation */}
                <Link
                    href="/casos-exito"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors gap-2 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Volver a Casos de Éxito
                </Link>

                {/* Header Section */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 md:p-12 mb-12 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                                {story.title}
                            </h1>

                            <div className="flex flex-wrap gap-4 items-center">
                                {story.revenue && (
                                    <div className="flex items-center gap-2 bg-green-900/30 text-green-400 px-4 py-2 rounded-full border border-green-800/50 font-mono font-bold">
                                        <DollarSign size={20} />
                                        <span>Generando {story.revenue}</span>
                                    </div>
                                )}

                                {story.startup_costs && (
                                    <div className="flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2 rounded-full border border-gray-700 font-mono font-bold">
                                        <span className="text-sm uppercase text-gray-500">Startup Costs:</span>
                                        <span>{story.startup_costs}</span>
                                    </div>
                                )}

                                {story.website_url && (
                                    <a
                                        href={story.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-2 rounded-full border border-blue-800/50 font-medium hover:bg-blue-900/50 transition-colors"
                                    >
                                        <Globe size={18} />
                                        <span>Visitar Aplicación</span>
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Resumen Ejecutivo</h2>
                            <p className="text-xl text-gray-300 leading-relaxed italic">
                                "{story.summary}"
                            </p>
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Claves de Ejecución</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {story.steps?.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                        <span className="text-gray-200">{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Content */}
                <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Historia y Detalles Completos</h2>
                    <div className="text-gray-400 leading-relaxed whitespace-pre-wrap text-lg">
                        {story.article_content || "No hay detalles adicionales disponibles."}
                    </div>
                </div>
            </div>
        </div>
    );
}
