'use client';
import Link from 'next/link';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

import { useTranslation } from '@/context/LanguageContext';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { analytics } from '@/lib/analytics';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchesUsed: number;
    searchLimit: number;
}

export function UpgradeModal({ isOpen, onClose, searchesUsed, searchLimit }: UpgradeModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            analytics.paywallViewed('limit_reached');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpgradeClick = () => {
        analytics.upgradeClicked('upgrade_modal');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#333] rounded-2xl p-8 max-w-md w-full mx-4 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap size={32} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t.upgradeModal.limitReached}
                    </h2>

                    <p className="text-gray-400 mb-1">
                        {t.upgradeModal.usedSearches
                            .replace('{used}', searchesUsed.toString())
                            .replace('{limit}', searchLimit.toString())}
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        {t.upgradeModal.upgradeForUnlimited}
                    </p>

                    <div className="bg-[#1A1A1A] border border-[#222] rounded-xl p-4 mb-6 text-left">
                        <h3 className="text-white font-semibold mb-3">{t.upgradeModal.proBenefits}</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {t.upgradeModal.benefit1}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {t.upgradeModal.benefit2}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {t.upgradeModal.benefit3}
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                {t.upgradeModal.benefit4}
                            </li>
                        </ul>
                        <div className="mt-4 pt-4 border-t border-[#333]">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">$10</span>
                                    <span className="text-lg text-gray-500 line-through">$39</span>
                                    <span className="text-gray-500">{t.upgradeModal.priceLabel}</span>
                                </div>
                                <span className="text-green-500 text-xs font-bold uppercase tracking-wider">
                                    {t.upgradeModal.launchOffer}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Early Access Badge */}
                    <div className="flex justify-center mb-4">
                        <EarlyAccessBadge />
                    </div>

                    <Link
                        href="/pricing"
                        onClick={handleUpgradeClick}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        {t.upgradeModal.upgradeButton}
                        <ArrowRight size={20} />
                    </Link>

                    <button
                        onClick={onClose}
                        className="mt-3 text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        {t.upgradeModal.backToDashboard}
                    </button>
                </div>
            </div>
        </div>
    );
}
