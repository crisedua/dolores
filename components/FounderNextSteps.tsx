'use client';
import Link from 'next/link';
import { ArrowRight, X, Check } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { analytics } from '@/lib/analytics';

interface FounderNextStepsProps {
    isProUser: boolean;
}

export function FounderNextSteps({ isProUser }: FounderNextStepsProps) {
    const { t } = useTranslation();

    const badSteps = t.paywalls?.founderNextSteps?.badSteps || [
        'Adivinar features',
        'Construir demasiado',
        'Lanzar a nadie'
    ];

    const goodSteps = t.paywalls?.founderNextSteps?.goodSteps || [
        'Validar pago antes de construir',
        'Definir MVP mínimo',
        'Ir directo a primeros clientes'
    ];

    const handleUpgradeClick = () => {
        analytics.upgradeClicked('founder_next_steps');
    };

    return (
        <div className="mt-12 bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] border border-[#333] rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white text-center mb-8">
                {t.paywalls?.founderNextSteps?.title || '¿Qué hacen los founders después de esto?'}
            </h3>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Bad behaviors - crossed out */}
                <div className="space-y-4">
                    {badSteps.map((step: string, idx: number) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 text-gray-500 line-through"
                        >
                            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <X size={14} className="text-red-500" />
                            </div>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>

                {/* Good behaviors - highlighted */}
                <div className="space-y-4">
                    {goodSteps.map((step: string, idx: number) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 text-white font-medium"
                        >
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                <Check size={14} className="text-green-500" />
                            </div>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            {!isProUser && (
                <div className="text-center">
                    <Link
                        href="/pricing"
                        onClick={handleUpgradeClick}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                        {t.paywalls?.founderNextSteps?.cta || 'Ver el plan completo con Pro'}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            )}
        </div>
    );
}
