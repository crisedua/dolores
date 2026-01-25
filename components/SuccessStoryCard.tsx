'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronDown, CheckCircle2 } from 'lucide-react';

interface SuccessStory {
    id: string;
    title: string;
    summary: string;
    steps: string[];
    website_url?: string;
}

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                    {story.summary}
                </p>

                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <span>{isExpanded ? 'Hide Steps' : 'View Strategy Steps'}</span>
                        <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {story.website_url && (
                        <a
                            href={story.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            <span>Visit Website</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    )}
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
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Steps to Success</h4>
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
