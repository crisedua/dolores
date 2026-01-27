'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, DollarSign, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

interface SuccessStory {
    id: string;
    title: string;
    revenue?: string;
    startup_costs?: string;
    summary: string;
    steps: string[];
    website_url?: string;
}

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Mock reader count based on ID to make it feel "real"
    const readersCount = (parseInt(story.id.substring(0, 2), 16) || 10) * 115 + 450;
    const formattedReaders = readersCount.toLocaleString();

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full font-sans">
            <div className="p-6">
                {/* Header with Avatar and Title */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden shrink-0">
                            {/* Placeholder for business icon or founder face */}
                            <User size={20} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-extrabold text-[#111] leading-snug line-clamp-2">
                            {story.title}
                        </h3>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <ChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Summary in quotes */}
                <p className="text-[#333] text-[15px] leading-relaxed mb-6 italic">
                    "{story.summary}"
                </p>

                {/* Metrics Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#111] text-sm">{story.revenue || 'N/A'}</span>
                        <span className="text-[#888] text-sm">Monthly Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#111] text-sm">{story.startup_costs || 'N/A'}</span>
                        <span className="text-[#888] text-sm">Startup Costs</span>
                    </div>
                </div>

                {/* Footer with readers and link */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        {/* Avatar stack mock */}
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <div className={`w-full h-full bg-gradient-to-br ${['from-blue-400 to-blue-600', 'from-purple-400 to-purple-600', 'from-green-400 to-green-600', 'from-gray-400 to-gray-600'][i - 1]}`} />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-[#111]">
                            Read by <span className="font-bold">{formattedReaders}</span> founders
                        </span>
                    </div>

                    <Link
                        href={`/casos-exito/${story.id}`}
                        className="text-xs font-bold text-[#111] flex items-center gap-1 hover:underline"
                    >
                        Read article <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-50 border-t border-gray-100"
                    >
                        <div className="p-6">
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">
                                Tactics & Growth Steps
                            </h4>
                            <ul className="space-y-3">
                                {story.steps.map((step, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        </div>
                                        <span className="text-gray-700 text-sm leading-snug">{step}</span>
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
