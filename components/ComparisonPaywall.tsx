'use client';
import Link from 'next/link';
import { X, ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { analytics } from '@/lib/analytics';
import { useEffect } from 'react';

interface ComparisonPaywallProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ComparisonPaywall({ isOpen, onClose }: ComparisonPaywallProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            analytics.paywallViewed('comparison');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpgradeClick = () => {
        analytics.upgradeClicked('comparison_paywall');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0F0F0F] border border-[#333] rounded-2xl p-8 max-w-2xl w-full mx-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 whitespace-pre-line">
                        {t.paywalls?.comparison?.headline || 'Un problema no es una startup.\nEl mejor problema, sí.'}
                    </h2>
                    <p className="text-gray-400">
                        {t.paywalls?.comparison?.description || 'Pro te permite comparar nichos y elegir dónde empezar.'}
                    </p>
                </div>

                {/* Blurred comparison preview */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Niche 1 - Blurred */}
                    <div className="relative bg-[#1A1A1A] border border-[#333] rounded-xl p-6 overflow-hidden">
                        <div className="blur-sm select-none">
                            <div className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">NICHO A</div>
                            <h3 className="text-lg font-bold text-white mb-3">Problema de freelancers...</h3>
                            <div className="space-y-2">
                                <div className="h-2 bg-blue-500/30 rounded-full w-3/4" />
                                <div className="h-2 bg-green-500/30 rounded-full w-1/2" />
                                <div className="h-2 bg-amber-500/30 rounded-full w-2/3" />
                            </div>
                            <div className="mt-4 text-sm text-gray-400">
                                Score: 8.5/10
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="text-gray-500" size={32} />
                        </div>
                    </div>

                    {/* Niche 2 - Blurred */}
                    <div className="relative bg-[#1A1A1A] border border-[#333] rounded-xl p-6 overflow-hidden">
                        <div className="blur-sm select-none">
                            <div className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">NICHO B</div>
                            <h3 className="text-lg font-bold text-white mb-3">Problema de restaurantes...</h3>
                            <div className="space-y-2">
                                <div className="h-2 bg-blue-500/30 rounded-full w-1/2" />
                                <div className="h-2 bg-green-500/30 rounded-full w-4/5" />
                                <div className="h-2 bg-amber-500/30 rounded-full w-1/3" />
                            </div>
                            <div className="mt-4 text-sm text-gray-400">
                                Score: 7.2/10
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="text-gray-500" size={32} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mb-4">
                    <EarlyAccessBadge />
                </div>

                <Link
                    href="/pricing"
                    onClick={handleUpgradeClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    {t.paywalls?.comparison?.button || 'Comparar con Pro'}
                    <ArrowRight size={20} />
                </Link>

                <button
                    onClick={onClose}
                    className="w-full mt-3 text-sm text-gray-500 hover:text-gray-400 transition-colors"
                >
                    {t.paywalls?.firstSearch?.secondaryButton || 'Volver al inicio'}
                </button>
            </div>
        </div>
    );
}
