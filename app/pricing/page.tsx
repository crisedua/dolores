'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useTranslation } from '@/context/LanguageContext';
import { EarlyAccessBadge } from '@/components/EarlyAccessBadge';
import { analytics } from '@/lib/analytics';

function PricingContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const { t } = useTranslation();

    // Auto-trigger payment if user just signed up with upgrade intent
    useEffect(() => {
        const action = searchParams.get('action');

        if (user && action === 'subscribe' && !loading) {
            // User returned after signup, trigger payment
            handleSubscribe();

            // Clean URL
            window.history.replaceState({}, '', '/pricing');
        }
    }, [user, searchParams]);

    const handleSubscribe = async () => {
        // Track upgrade click
        analytics.upgradeClicked('pricing_page_pro');

        if (!user) {
            router.push('/auth?returnTo=/pricing&action=subscribe');
            return;
        }

        setLoading('pro');

        try {
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email
                })
            });

            const data = await response.json();

            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else {
                throw new Error('No init point received');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Error al iniciar el pago. Por favor, intenta de nuevo.');
            setLoading(null);
        }
    };

    const handleBuilderSubscribe = async () => {
        analytics.upgradeClicked('pricing_page_builder');

        if (!user) {
            router.push('/auth?returnTo=/pricing&action=subscribe-builder');
            return;
        }

        setLoading('builder');

        try {
            const response = await fetch('/api/create-builder-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email
                })
            });

            const data = await response.json();

            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else {
                throw new Error('No init point received');
            }
        } catch (error) {
            console.error('Builder payment initiation failed:', error);
            alert('Error al iniciar el pago. Por favor, intenta de nuevo.');
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg">
                            <Zap size={18} />
                        </div>
                        <span className="font-bold text-lg text-white">Veta</span>
                    </Link>
                    {user && (
                        <Link
                            href="/app"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {t.sidebar.discovery}
                        </Link>
                    )}
                </div>
            </nav>

            {/* Pricing Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            {t.pricing.title1}
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {t.pricing.title2}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            {t.pricing.subtitle}
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative">
                            <h3 className="text-2xl font-bold text-white mb-2">{t.pricing.free.title}</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-white">{t.pricing.free.price}</span>
                                <span className="text-gray-500">{t.pricing.free.unit}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {t.pricing.free.features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={user ? '/app' : '/auth'}
                                className="block w-full text-center bg-white/5 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                            >
                                {t.pricing.free.button}
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-2xl p-8 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                                    {t.pricing.pro.badge}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t.pricing.pro.title}</h3>
                            <div className="flex flex-col mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{t.pricing.pro.price}</span>
                                    <span className="text-xl text-gray-500 line-through">{t.pricing.pro.oldPrice}</span>
                                    <span className="text-gray-400">{t.pricing.pro.unit}</span>
                                </div>
                                <span className="text-green-400 text-xs font-bold mt-1 uppercase tracking-wider">
                                    {t.pricing.pro.offer}
                                </span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {t.pricing.pro.features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                        <span className="text-white font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading === 'pro'}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading === 'pro' ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {t.common.loading}
                                    </>
                                ) : (
                                    <>
                                        {t.pricing.pro.button}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                            <div className="flex justify-center mt-4">
                                <EarlyAccessBadge />
                            </div>
                        </div>

                        {/* Builder Plan */}
                        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-purple-500 rounded-2xl p-8 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                                    {(t.pricing as any).builder?.badge || 'FOR BUILDERS'}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{(t.pricing as any).builder?.title || 'Builder'}</h3>
                            <div className="flex flex-col mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">{(t.pricing as any).builder?.price || '$19'}</span>
                                    <span className="text-xl text-gray-500 line-through">{(t.pricing as any).builder?.oldPrice || '$49'}</span>
                                    <span className="text-gray-400">{(t.pricing as any).builder?.unit || '/month'}</span>
                                </div>
                                <span className="text-green-400 text-xs font-bold mt-1 uppercase tracking-wider">
                                    {(t.pricing as any).builder?.offer || 'Launch Offer'}
                                </span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {((t.pricing as any).builder?.features || [
                                    'Everything in Pro',
                                    'Prototype Prompt Generator',
                                    'AI prompts for Lovable, Bolt, Antigravity',
                                    'Copy-paste ready prompts',
                                    'Validation-focused prototypes'
                                ]).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Check size={20} className="text-purple-400 mt-0.5 shrink-0" />
                                        <span className="text-white font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleBuilderSubscribe}
                                disabled={loading === 'builder'}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading === 'builder' ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {t.common.loading}
                                    </>
                                ) : (
                                    <>
                                        {(t.pricing as any).builder?.button || 'Start Building'}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                            <div className="flex justify-center mt-4">
                                <EarlyAccessBadge />
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mt-20 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.pricing.faq.title}</h2>
                        <div className="space-y-6">
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">{t.pricing.faq.q1}</h3>
                                <p className="text-gray-400 text-sm">
                                    {t.pricing.faq.a1}
                                </p>
                            </div>
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">{t.pricing.faq.q2}</h3>
                                <p className="text-gray-400 text-sm">
                                    {t.pricing.faq.a2}
                                </p>
                            </div>
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">{t.pricing.faq.q3}</h3>
                                <p className="text-gray-400 text-sm">
                                    {t.pricing.faq.a3}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white">Cargando...</div>
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}
