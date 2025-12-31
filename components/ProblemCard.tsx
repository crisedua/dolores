'use client';
import { useState } from 'react';
import { ChevronDown, ArrowRight, ExternalLink } from 'lucide-react';

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

    recommendation: string;

    // Optional evidence fields
    sources?: Array<{
        url: string;
        title: string;
        snippet: string;
    }>;
    quotes?: string[];
    existingSolutions?: string[];
    gaps?: string[];
}

export function ProblemCard({ problem }: { problem: Problem }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-[#0F0F0F] rounded-2xl border border-[#222] overflow-hidden mb-6 hover:border-[#333] transition-colors">
            <div className="p-8">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#1A1A1A] text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                            #{problem.rank} PAIN POINT IDENTIFIED
                        </span>
                    </div>

                    <div className="bg-[#151515] border border-[#222] rounded-xl px-5 py-3 text-center">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Signal Score</div>
                        <div className="text-3xl font-bold text-[#FF5A36]">
                            {problem.signalScore}<span className="text-gray-600 text-base">/10</span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8 max-w-4xl">
                    {problem.description}
                </h2>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <MetricBar label="FREQUENCY" value={problem.metrics.frequency} color="bg-blue-500" />
                    <MetricBar label="INTENSITY" value={problem.metrics.intensity} color="bg-red-500" />
                    <MetricBar label="SOLVABILITY" value={problem.metrics.solvability} color="bg-green-500" />
                    <MetricBar label="MONETIZABILITY" value={problem.metrics.monetizability} color="bg-amber-500" />
                </div>

                {/* Recommendation Box */}
                <div className="bg-[#141420] border border-blue-500/20 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                            <ArrowRight className="text-white" size={20} />
                        </div>
                        <div>
                            <h4 className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-2">Recommended Next Step</h4>
                            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                                {problem.recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Evidence Section */}
            {isExpanded && (
                <div className="bg-[#0A0A0A] border-t border-[#222] p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Sources */}
                    {problem.sources && problem.sources.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Data Sources</h3>
                            <div className="space-y-3">
                                {problem.sources.map((source, idx) => (
                                    <a
                                        key={idx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block bg-[#111] border border-[#222] rounded-lg p-4 hover:border-[#333] transition-colors group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <ExternalLink size={14} className="text-gray-500 mt-1 shrink-0" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors mb-1">
                                                    {source.title}
                                                </div>
                                                <div className="text-xs text-gray-500 line-clamp-2">
                                                    {source.snippet}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quotes */}
                    {problem.quotes && problem.quotes.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Key Quotes</h3>
                            <div className="space-y-3">
                                {problem.quotes.map((quote, idx) => (
                                    <div key={idx} className="bg-[#111] border-l-2 border-blue-500 pl-4 py-3 italic text-gray-300 text-sm">
                                        &quot;{quote}&quot;
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Solutions */}
                    {problem.existingSolutions && problem.existingSolutions.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Existing Solutions</h3>
                            <ul className="space-y-2">
                                {problem.existingSolutions.map((solution, idx) => (
                                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        {solution}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Gaps */}
                    {problem.gaps && problem.gaps.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Market Gaps</h3>
                            <ul className="space-y-2">
                                {problem.gaps.map((gap, idx) => (
                                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                                        <span className="text-amber-500 mt-1">•</span>
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Fallback if no evidence */}
                    {(!problem.sources || problem.sources.length === 0) &&
                        (!problem.quotes || problem.quotes.length === 0) && (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <p>Detailed evidence and analysis will be available once the AI processes more data sources.</p>
                            </div>
                        )}
                </div>
            )}

            {/* Footer Accordion Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-[#111] border-t border-[#222] p-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold tracking-widest hover:bg-[#161616] transition-colors"
            >
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
                {isExpanded ? 'HIDE' : 'SHOW'} EVIDENCE & ANALYSIS
            </button>
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
