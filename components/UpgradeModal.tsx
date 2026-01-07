'use client';
import Link from 'next/link';
import { X, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

import { useTranslation } from '@/context/LanguageContext';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { analytics } from '@/lib/analytics';
import { PlanType, PLANS } from '@/lib/plans';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    scansUsed: number;
    scanLimit: number;
    currentPlan?: PlanType;
}

export function UpgradeModal({
    isOpen,
    onClose,
    scansUsed,
    scanLimit,
    currentPlan = 'free'
}: UpgradeModalProps) {
    const { t, language } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            analytics.paywallViewed('limit_reached');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleUpgradeClick = (plan: 'pro' | 'advanced') => {
        analytics.upgradeClicked(`upgrade_modal_${plan}`);
    };

    // Determine which plans to show based on current plan
    const showPro = currentPlan === 'free';
    const showAdvanced = currentPlan === 'free' || currentPlan === 'pro';

    // Usage display text based on plan type
    const getUsageText = () => {
        if (currentPlan === 'free') {
            return (t.upgradeModal as any).freeUsed
                ?.replace('{used}', scansUsed.toString())
                .replace('{limit}', scanLimit.toString())
                || `Free scan used: ${scansUsed} / ${scanLimit}`;
        } else {
            return (t.upgradeModal as any).scansRemaining
                ?.replace('{remaining}', Math.max(0, scanLimit - scansUsed).toString())
                .replace('{limit}', scanLimit.toString())
                || `Scans remaining: ${Math.max(0, scanLimit - scansUsed)} / ${scanLimit}`;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 max-w-2xl w-full relative animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap size={32} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t.upgradeModal.limitReached}
                    </h2>

                    <p className="text-gray-400 mb-1">
                        {getUsageText()}
                    </p>
                    <p className="text-gray-500 text-sm">
                        {(t.upgradeModal as any).upgradeDescription || "Upgrade to continue discovering real pain points with source evidence."}
                    </p>
                </div>

                {/* Plan Cards */}
                <div className={`grid gap-4 mb-6 ${showPro && showAdvanced ? 'md:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>

                    {/* Pro Plan Card */}
                    {showPro && (
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-xl p-5 relative">
                            <div className="absolute -top-3 left-4">
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {t.pricing.pro.badge}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mt-2 mb-2">{t.pricing.pro.title}</h3>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-white">{t.pricing.pro.price}</span>
                                <span className="text-lg text-gray-500 line-through">{t.pricing.pro.oldPrice}</span>
                                <span className="text-gray-400">{t.pricing.pro.unit}</span>
                            </div>

                            <ul className="space-y-2 text-sm text-gray-300 mb-4">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {(t.upgradeModal as any).benefit1 || '5 scans per month'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {(t.upgradeModal as any).benefit3 || 'Unlimited pain points'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {(t.upgradeModal as any).benefit4 || 'Direct source links'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    {(t.upgradeModal as any).benefit5 || 'Export results'}
                                </li>
                            </ul>

                            <Link
                                href="/pricing?plan=pro&action=subscribe"
                                onClick={() => handleUpgradeClick('pro')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {t.upgradeModal.upgradeButton}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}

                    {/* Advanced Plan Card */}
                    {showAdvanced && (
                        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500 rounded-xl p-5 relative">
                            <div className="absolute -top-3 left-4">
                                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {(t.pricing as any).advanced?.badge || 'FOR POWER USERS'}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mt-2 mb-2 flex items-center gap-2">
                                {(t.pricing as any).advanced?.title || 'Advanced'}
                                <Sparkles size={18} className="text-purple-400" />
                            </h3>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-white">{(t.pricing as any).advanced?.price || '$29'}</span>
                                <span className="text-lg text-gray-500 line-through">{(t.pricing as any).advanced?.oldPrice || '$79'}</span>
                                <span className="text-gray-400">{(t.pricing as any).advanced?.unit || '/month'}</span>
                            </div>

                            <ul className="space-y-2 text-sm text-gray-300 mb-4">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    {(t.upgradeModal as any).advancedBenefit1 || '15 scans per month'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    {(t.upgradeModal as any).advancedBenefit2 || 'Everything in Pro'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    {(t.upgradeModal as any).advancedBenefit3 || 'Priority support'}
                                </li>
                            </ul>

                            <Link
                                href="/pricing?plan=advanced&action=subscribe"
                                onClick={() => handleUpgradeClick('advanced')}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {(t.upgradeModal as any).upgradeToAdvanced || 'Upgrade to Advanced'}
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Early Access Badge */}
                <div className="flex justify-center mb-4">
                    <EarlyAccessBadge />
                </div>

                <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-500 hover:text-gray-400 transition-colors py-2"
                >
                    {t.upgradeModal.backToDashboard}
                </button>
            </div>
        </div>
    );
}
