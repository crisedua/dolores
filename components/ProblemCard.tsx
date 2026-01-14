'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRight, ExternalLink, User, AlertTriangle, Wallet, Users, Lightbulb, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { PrototypePromptsButton } from './PrototypePromptsButton';


import { useTranslation } from '@/context/LanguageContext';
import { analytics } from '@/lib/analytics';
import { SelectedProblem } from '@/lib/schemas';

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

interface ProblemCardProps {
    problem: Problem;
    isProUser?: boolean;
}

export function ProblemCard({ problem, isProUser = true }: ProblemCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const { t } = useTranslation();

    // Backward compatibility for existingSolutions (handle string[] vs object[])
    const normalizedSolutions = Array.isArray(problem.existingSolutions)
        ? problem.existingSolutions.map(s => typeof s === 'string' ? { name: s, complaint: '' } : s)
        : [];

    // Get first 2 quotes for free users
    const visibleQuotes = problem.quotes?.slice(0, 2) || [];

    const handleLockedClick = () => {
        analytics.paywallViewed('locked_content');
    };

    // Prepare data for Coach
    const selectedProblem: SelectedProblem = {
        id: problem.id,
        problem_title: problem.description,
        who_has_it: problem.persona || "Unknown Persona",
        core_pain: problem.urgencySignals || problem.description,
        financial_impact: problem.willingnessToPay?.evidence || "Unknown financial impact",
        evidence_summary: problem.quotes?.map(q => typeof q === 'string' ? q : q.text).join('\n') || "",
        market_scope: "local_latam" // Default fallback, could be enhanced with analysis data
    };

    return (
        <div className="bg-[#0F0F0F] rounded-2xl border border-[#222] overflow-hidden mb-6 hover:border-[#333] transition-colors relative group-hover:shadow-lg hover:shadow-blue-900/10">
            <div className="p-8">
                {/* Header Row */}
                <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-[#1A1A1A] text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">
                                #{problem.rank} {t.problemCard.painPoint}
                            </span>
                            {problem.persona && (
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <User size={12} />
                                    {problem.persona}
                                </span>
                            )}
                            {/* Category label - visible to all */}
                            {problem.metrics.frequency >= 7 && (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1.5 rounded-lg">
                                    Alta frecuencia
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#151515] border border-[#222] rounded-xl px-5 py-3 text-center min-w-[100px]">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{t.problemCard.score}</div>
                        <div className="text-3xl font-bold text-[#FF5A36]">
                            {problem.signalScore}<span className="text-gray-600 text-base">/10</span>
                        </div>
                    </div>
                </div>

                {/* Title & Urgency - VISIBLE TO ALL */}
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 max-w-4xl">
                    {problem.description}
                </h2>

                {/* Urgency Signals - VISIBLE TO ALL */}
                {problem.urgencySignals && (
                    <div className="flex items-start gap-2 mb-8 bg-red-500/5 border border-red-500/10 rounded-lg p-3 max-w-2xl">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-red-200/80 italic">
                            &quot;{problem.urgencySignals}&quot;
                        </p>
                    </div>
                )}

                {/* Metrics Grid - BLUR FOR FREE USERS (except frequency) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border-b border-[#222] pb-8">
                    {/* Frequency - Always visible */}
                    <MetricBar label={t.problemCard.metrics.frequency} value={problem.metrics.frequency} color="bg-blue-500" />

                    {/* Intensity - Blur for free */}
                    <MetricBar
                        label={t.problemCard.metrics.intensity}
                        value={problem.metrics.intensity}
                        color="bg-red-500"
                        isBlurred={!isProUser}
                    />

                    {/* WTP - Blur for free */}
                    <MetricBar
                        label={t.problemCard.metrics.wtp}
                        value={problem.willingnessToPay?.score || problem.metrics.monetizability}
                        color="bg-green-500"
                        isBlurred={!isProUser}
                    />

                    {/* Monetization - Blur for free */}
                    <MetricBar
                        label={t.problemCard.metrics.monetization}
                        value={problem.metrics.monetizability}
                        color="bg-amber-500"
                        isBlurred={!isProUser}
                    />
                </div>

                {/* Visible Quotes Preview - For Free Users */}
                {!isProUser && visibleQuotes.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">
                            {t.problemCard.keyQuotes}
                        </h4>
                        <div className="space-y-3">
                            {visibleQuotes.map((quote, idx) => {
                                const quoteText = typeof quote === 'string' ? quote : quote.text;
                                return (
                                    <div key={idx} className="bg-[#111] border border-[#222] rounded-lg p-4">
                                        <p className="text-gray-300 text-sm italic">&quot;{quoteText}&quot;</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isProUser ? (
                    /* PRO USER VIEW - Full content */
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* LEFTSIDE: Existing Solutions & WTP */}
                        <div className="space-y-6">
                            {/* Willingness To Pay Evidence */}
                            {problem.willingnessToPay && (
                                <div className="bg-[#111] rounded-xl p-5 border border-[#222]">
                                    <h4 className="flex items-center gap-2 text-green-400 text-xs font-bold tracking-widest uppercase mb-3">
                                        <Wallet size={14} /> {t.problemCard.wtpHeader}
                                    </h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {problem.willingnessToPay.evidence}
                                    </p>
                                </div>
                            )}

                            {/* Existing Solutions Table */}
                            {normalizedSolutions.length > 0 && (
                                <div>
                                    <h4 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">{t.problemCard.existingSolutions}</h4>
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
                                        <Lightbulb size={14} /> {t.problemCard.mvpIdeas}
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
                                        <Users size={14} /> {t.problemCard.firstCustomers}
                                    </h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {problem.contactStrategy}
                                    </p>
                                </div>
                            )}

                            {/* ACTIONS ROW - MODIFIED HERE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <PrototypePromptsButton problem={problem} isProUser={true} />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* FREE USER VIEW - Blurred locked sections */
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Locked: Who pays for this */}
                        <LockedSection
                            title={t.paywalls?.locked?.whoPaysBuyer || 'Quién paga por esto'}
                            icon={<Wallet size={14} />}
                            onClick={handleLockedClick}
                            unlockText={t.paywalls?.locked?.unlockWithPro || 'Desbloquear con Pro'}
                        />

                        {/* Locked: First customers */}
                        <LockedSection
                            title={t.paywalls?.locked?.firstCustomers || 'Dónde encontrar primeros clientes'}
                            icon={<Users size={14} />}
                            onClick={handleLockedClick}
                            unlockText={t.paywalls?.locked?.unlockWithPro || 'Desbloquear con Pro'}
                        />

                        {/* Locked: MVP Plan - Full width */}
                        <div className="md:col-span-2">
                            <LockedSection
                                title={t.paywalls?.locked?.mvpPlan || 'Plan MVP de 7 días'}
                                icon={<Lightbulb size={14} />}
                                onClick={handleLockedClick}
                                unlockText={t.paywalls?.locked?.unlockWithPro || 'Desbloquear con Pro'}
                            />
                        </div>

                        {/* Prototype Prompts Button - Free Users (Locked) */}
                        <div className="md:col-span-2 mt-4">
                            <PrototypePromptsButton problem={problem} isProUser={false} />
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Accordion Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-[#111] border-t border-[#222] p-4 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold tracking-widest hover:bg-[#161616] transition-colors uppercase"
            >
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
                {isExpanded ? t.problemCard.hideEvidence : t.problemCard.showEvidence}
            </button>

            {/* Expandable Evidence Section */}
            {isExpanded && (
                <div className="bg-[#0A0A0A] border-t border-[#222] p-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Quotes */}
                    {problem.quotes && problem.quotes.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">{t.problemCard.keyQuotes}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {(isProUser ? problem.quotes : visibleQuotes).map((quote, idx) => {
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
                                                    <span>{t.problemCard.viewSource}</span>
                                                </div>
                                            )}
                                        </a>
                                    );
                                })}
                                {!isProUser && problem.quotes && problem.quotes.length > 2 && (
                                    <Link
                                        href="/pricing?plan=pro&action=subscribe"
                                        className="flex items-center justify-center gap-2 bg-[#111] border border-dashed border-[#333] rounded-lg p-4 text-gray-500 hover:text-white hover:border-blue-500/50 transition-all"
                                    >
                                        <Lock size={14} />
                                        <span className="text-sm">+{problem.quotes.length - 2} más con Pro</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface MetricBarProps {
    label: string;
    value: number;
    color: string;
    isBlurred?: boolean;
}

function MetricBar({ label, value, color, isBlurred = false }: MetricBarProps) {
    return (
        <div className={isBlurred ? 'relative' : ''}>
            <div className={`${isBlurred ? 'blur-sm select-none' : ''}`}>
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
            {isBlurred && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock size={12} className="text-gray-600" />
                </div>
            )}
        </div>
    );
}

interface LockedSectionProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    unlockText: string;
}

function LockedSection({ title, icon, onClick, unlockText }: LockedSectionProps) {
    return (
        <Link
            href="/pricing?plan=pro&action=subscribe"
            onClick={onClick}
            className="relative bg-[#111] rounded-xl p-6 border border-[#222] overflow-hidden group hover:border-blue-500/30 transition-all"
        >
            {/* Visible title - NOT blurred */}
            <h4 className="flex items-center gap-2 text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
                {icon} {title}
            </h4>

            {/* Blurred fake content preview */}
            <div className="blur-sm select-none mb-6">
                <div className="space-y-2">
                    <div className="h-3 bg-gray-600/40 rounded w-full" />
                    <div className="h-3 bg-gray-600/40 rounded w-4/5" />
                    <div className="h-3 bg-gray-600/40 rounded w-3/5" />
                </div>
            </div>

            {/* Unlock CTA - visible at bottom */}
            <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-400 transition-colors">
                <Lock size={16} />
                <span className="text-xs font-medium flex items-center gap-1">
                    {unlockText}
                    <ArrowRight size={12} />
                </span>
            </div>
        </Link>
    );
}
