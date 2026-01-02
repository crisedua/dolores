'use client';
import { useState } from 'react';
import { ChevronDown, ArrowRight, ExternalLink, User, AlertTriangle, Wallet, Users, Lightbulb } from 'lucide-react';

export interface Problem {
    id: string;
    rank: number;
    description: string;
    signalScore: number;

    metrics: {
        frequency: number;
        intensity: number;
        solvability: number;
        monetizability: number;
    };

    persona?: string;
    urgencySignals?: string;

    existingSolutions?: Array<{ name: string; complaint: string }> | string[];

    willingnessToPay?: {
        score: number;
        evidence: string;
    };

    mvpIdeas?: string[];
    contactStrategy?: string;

    solution?: {
        landingPage: string;
        mvpFeatures: string[];
    };
    recommendation?: string;

    sources?: Array<{
        url: string;
        title: string;
        snippet: string;
    }>;
    quotes?: Array<string | { text: string; url?: string }>;
    gaps?: string[];
}

export function ProblemCard({ problem }: { problem: Problem }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Backward compatibility for existingSolutions (handle string[] vs object[])
    const normalizedSolutions = Array.isArray(problem.existingSolutions)
        ? problem.existingSolutions.map(s => typeof s === 'string' ? { name: s, complaint: '' } : s)
        : [];

    return (
        <div className="bg-[#0F0F0F] rounded-2xl border border-[#222] overflow-hidden mb-6 hover:border-[#333] transition-colors relative group-hover:shadow-lg hover:shadow-blue-900/10">
            <div className="p-8">
                {/* Header Row */}
                <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-[#1A1A1A] text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                                #{problem.rank} PUNTO DE DOLOR
                            </span>
                            {problem.persona && (
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <User size={12} />
                                    {problem.persona}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#151515] border border-[#222] rounded-xl px-5 py-3 text-center min-w-[100px]">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Puntuación</div>
                        <div className="text-3xl font-bold text-[#FF5A36]">
                            {problem.signalScore}<span className="text-gray-600 text-base">/10</span>
                        </div>
                    </div>
                </div>

                {/* Title & Urgency */}
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 max-w-4xl">
                    {problem.description}
                </h2>

                {problem.urgencySignals && (
                    <div className="flex items-start gap-2 mb-8 bg-red-500/5 border border-red-500/10 rounded-lg p-3 max-w-2xl">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-red-200/80 italic">
                            &quot;{problem.urgencySignals}&quot;
                        </p>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-b border-[#222] pb-8">
                    <MetricBar label="FRECUENCIA" value={problem.metrics.frequency} color="bg-blue-500" />
                    <MetricBar label="INTENSIDAD" value={problem.metrics.intensity} color="bg-red-500" />
                    <MetricBar label="DISPOSICIÓN PAGO" value={problem.willingnessToPay?.score || problem.metrics.monetizability} color="bg-green-500" />
                    <MetricBar label="MONETIZACIÓN" value={problem.metrics.monetizability} color="bg-amber-500" />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* LEFTSIDE: Existing Solutions & WTP */}
                    <div className="space-y-6">
                        {/* Willingness To Pay Evidence */}
                        {problem.willingnessToPay && (
                            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
                                <h4 className="flex items-center gap-2 text-green-400 text-xs font-bold tracking-widest uppercase mb-3">
                                    <Wallet size={14} /> DISPOSICIÓN A PAGAR
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {problem.willingnessToPay.evidence}
                                </p>
                            </div>
                        )}

                        {/* Existing Solutions Table */}
                        {normalizedSolutions.length > 0 && (
                            <div>
                                <h4 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">Lo que usan ahora (y odian)</h4>
                                <div className="space-y-3">
                                    {normalizedSolutions.map((sol, idx) => (
                                        <div key={idx} className="bg-[#161616] rounded-lg p-3 border border-white/5 flex flex-col md:flex-row md:items-center gap-3">
                                            <span className="text-white font-medium text-sm min-w-[120px]">{sol.name}</span>
                                            {sol.complaint && (
                                                <span className="text-gray-500 text-xs md:border-l md:border-[#333] md:pl-3 italic">{sol.complaint}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHTSIDE: MVP & Action */}
                    <div className="space-y-6">
                        {/* MVP Ideas */}
                        {(problem.mvpIdeas || (problem.solution?.mvpFeatures && problem.solution.mvpFeatures.length > 0)) && (
                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                                <h4 className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
                                    <Lightbulb size={14} /> 3 Ideas de MVP
                                </h4>
                                <ul className="space-y-4">
                                    {(problem.mvpIdeas || problem.solution?.mvpFeatures || []).map((idea, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span className="text-gray-300 text-sm leading-relaxed">{idea}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Contact Strategy */}
                        {problem.contactStrategy && (
                            <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
                                <h4 className="flex items-center gap-2 text-purple-400 text-xs font-bold tracking-widest uppercase mb-3">
                                    <Users size={14} /> Primeros 20 Clientes
                                </h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {problem.contactStrategy}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Footer Accordion Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-[#111] border-t border-[#222] p-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold tracking-widest hover:bg-[#161616] transition-colors"
            >
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
                {isExpanded ? 'OCULTAR' : 'VER'} EVIDENCIA (CITAS Y FUENTES)
            </button>

            {/* Expandable Evidence Section */}
            {isExpanded && (
                <div className="bg-[#0A0A0A] border-t border-[#222] p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Quotes */}
                    {problem.quotes && problem.quotes.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Citas Clave ("Evidence")</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {problem.quotes.map((quote, idx) => {
                                    const quoteText = typeof quote === 'string' ? quote : quote.text;
                                    const quoteUrl = typeof quote === 'object' ? quote.url : undefined;

                                    return (
                                        <a
                                            key={idx}
                                            href={quoteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`block bg-[#111] border border-[#222] rounded-lg p-4 hover:border-blue-500/50 transition-all group ${!quoteUrl ? 'pointer-events-none' : ''}`}
                                        >
                                            <p className="text-gray-300 text-sm italic mb-2">&quot;{quoteText}&quot;</p>
                                            {quoteUrl && (
                                                <div className="flex items-center gap-1 text-xs text-blue-500 opacity-60 group-hover:opacity-100">
                                                    <ExternalLink size={10} />
                                                    <span>Ver fuente</span>
                                                </div>
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function MetricBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-gray-500 font-bold tracking-wider">{label}</span>
                <span className="text-xs text-gray-400 font-medium">{value}/10</span>
            </div>
            <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${value * 10}%` }}
                />
            </div>
        </div>
    )
}
