'use client';
import Link from 'next/link';
import { X, ArrowRight, XCircle } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { analytics } from '@/lib/analytics';
import { useEffect } from 'react';

interface FirstSearchPaywallProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FirstSearchPaywall({ isOpen, onClose }: FirstSearchPaywallProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            analytics.paywallViewed('first_search');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpgradeClick = () => {
        analytics.upgradeClicked('first_search_paywall');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="bg-[#0F0F0F] border border-[#333] rounded-2xl p-8 max-w-lg w-full mx-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center">
                    {/* Success indicator */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">✓</span>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3">
                        {t.paywalls?.firstSearch?.title || 'Encontraste un problema real.'}
                    </h2>

                    <p className="text-gray-400 mb-8">
                        {t.paywalls?.firstSearch?.subtitle || 'La mayoría de los founders se queda aquí… y empieza a adivinar.'}
                    </p>

                    {/* Problem bullets */}
                    <div className="bg-[#1A1A1A] border border-[#222] rounded-xl p-5 mb-6 text-left">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-400">
                                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span>{t.paywalls?.firstSearch?.bullet1 || 'Construyen sin saber si alguien pagará'}</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400">
                                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span>{t.paywalls?.firstSearch?.bullet2 || 'Pierden semanas en ideas mediocres'}</span>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400">
                                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                <span>{t.paywalls?.firstSearch?.bullet3 || 'Lanzan sin clientes'}</span>
                            </li>
                        </ul>
                    </div>

                    <p className="text-white font-medium mb-6">
                        {t.paywalls?.firstSearch?.ctaDescription || 'Veta Pro te muestra si este problema vale tu tiempo.'}
                    </p>

                    <div className="flex justify-center mb-4">
                        <EarlyAccessBadge />
                    </div>

                    <Link
                        href="/pricing"
                        onClick={handleUpgradeClick}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {t.paywalls?.firstSearch?.primaryButton || 'Desbloquear Pro – Construir con evidencia'}
                        <ArrowRight size={20} />
                    </Link>

                    <button
                        onClick={onClose}
                        className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        {t.paywalls?.firstSearch?.secondaryButton || 'Volver al inicio'}
                    </button>
                </div>
            </div>
        </div>
    );
}
