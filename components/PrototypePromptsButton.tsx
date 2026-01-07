'use client';
import { useState } from 'react';
import { Wand2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Problem } from './ProblemCard';
import { PrototypePromptModal } from './PrototypePromptModal';
import { analytics } from '@/lib/analytics';

import { useSubscription } from '@/hooks/useSubscription';

interface PrototypePromptsButtonProps {
    problem: Problem;
    isProUser?: boolean; // Kept for interface compatibility but we use hook for source of truth
}

export function PrototypePromptsButton({ problem }: PrototypePromptsButtonProps) {
    const { t } = useTranslation();
    const { usage, isLoading } = useSubscription();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Feature is only for Advanced plan (or Admin)
    const hasAccess = usage.planType === 'advanced';

    const prototypePromptsT = (t as any).prototypePrompts || {
        buttonLabel: 'Generate Prototype Prompts',
        lockedCta: 'Upgrade to Advanced'
    };

    const handleClick = () => {
        if (hasAccess) {
            setIsModalOpen(true);
        } else {
            analytics.paywallViewed('prototype_prompts_advanced');
        }
    };

    if (isLoading) return <div className="h-12 w-full bg-[#111] animate-pulse rounded-xl" />;

    if (!hasAccess) {
        return (
            <Link
                href="/pricing?plan=advanced"
                onClick={handleClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/40 transition-all group"
            >
                <Lock size={16} className="text-purple-400" />
                <span className="font-medium">{prototypePromptsT.buttonLabel}</span>
                <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                    Advanced
                </span>
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            >
                <Wand2 size={18} />
                <span>{prototypePromptsT.buttonLabel}</span>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    Advanced
                </span>
            </button>

            <PrototypePromptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                problem={problem}
            />
        </>
    );
}
