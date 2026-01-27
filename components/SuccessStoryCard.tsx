'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SuccessStory {
    id: string;
    title: string;
    revenue?: string;
    summary: string;
    steps: string[];
    website_url?: string;
}

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors flex flex-col h-full">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-xl font-bold text-white line-clamp-2">{story.title}</h3>
                    {story.revenue && (
                        <span className="shrink-0 bg-green-900/30 text-green-400 text-xs font-mono px-2 py-1 rounded border border-green-800/50 flex items-center gap-1">
                            <DollarSign size={12} />
                            {story.revenue}
                        </span>
                    )}
                </div>

                <p className="text-gray-400 leading-relaxed mb-4 flex-1">
                    {story.summary}
                </p>

                <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <span>{isExpanded ? 'Ocultar Estrategia' : 'Ver Estrategia'}</span>
                            <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {story.website_url && (
                            <a
                                href={story.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-gray-500 hover:text-white transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>Sitio Web</span>
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                        )}
                    </div>

                    <Link
                        href={`/casos-exito/${story.id}`}
                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition"
                    >
                        Ver Artículo Completo <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-800/30 border-t border-gray-800"
                    >
                        <div className="p-6 pt-2">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pasos Clave al Éxito</h4>
                            <ul className="space-y-3">
                                {story.steps.map((step, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                                        <span className="text-gray-300 text-sm">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
