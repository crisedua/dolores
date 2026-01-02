'use client';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ProgressStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed';
}

import { useTranslation } from '@/context/LanguageContext';

export function SearchProgress({ steps }: { steps: ProgressStep[] }) {
    const { t } = useTranslation();
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 bg-[#0F0F0F] border border-[#222] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#222] pb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase">{t.dashboard.discoveryInProgress}</h3>
            </div>
            {/* ... rest of the file ... */}

            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {steps.map((step) => {
                        const isActive = step.status === 'active';
                        const isCompleted = step.status === 'completed';

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-4 text-sm font-medium"
                            >
                                <div className="shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 className="text-green-500" size={18} />
                                    ) : isActive ? (
                                        <Loader2 className="text-blue-500 animate-spin" size={18} />
                                    ) : (
                                        <Circle className="text-gray-700" size={18} />
                                    )}
                                </div>

                                <span className={`${isActive ? 'text-white' :
                                    isCompleted ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    {step.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
