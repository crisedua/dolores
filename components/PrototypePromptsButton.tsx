'use client';
import { useState } from 'react';
import { Wand2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Problem } from './ProblemCard';
import { PrototypePromptModal } from './PrototypePromptModal';
import { analytics } from '@/lib/analytics';

interface PrototypePromptsButtonProps {
    problem: Problem;
    isProUser: boolean;
}

export function PrototypePromptsButton({ problem, isProUser }: PrototypePromptsButtonProps) {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const prototypePromptsT = (t as any).prototypePrompts || {
        buttonLabel: 'Generate Prototype Prompts',
        lockedCta: 'Upgrade to Pro'
    };

    const handleClick = () => {
        if (isProUser) {
            setIsModalOpen(true);
        } else {
            analytics.paywallViewed('prototype_prompts');
        }
    };

    if (!isProUser) {
        return (
            <Link
                href="/pricing"
                onClick={handleClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/40 transition-all group"
            >
                <Lock size={16} className="text-purple-400" />
                <span className="font-medium">{prototypePromptsT.buttonLabel}</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Pro</span>
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={handleClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            >
                <Wand2 size={18} />
                <span>{prototypePromptsT.buttonLabel}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Pro</span>
            </button>

            <PrototypePromptModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                problem={problem}
            />
        </>
    );
}
