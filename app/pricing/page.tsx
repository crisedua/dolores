'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Check, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

function PricingContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

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
        if (!user) {
            // Redirect to auth with return URL to complete payment after signup
            router.push('/auth?returnTo=/pricing&action=subscribe');
            return;
        }

        setLoading(true);

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
                // Redirect to MercadoPago checkout
                window.location.href = data.initPoint;
            } else {
                throw new Error('No init point received');
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Error al iniciar el pago. Por favor, intenta de nuevo.');
            setLoading(false);
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
                            Dashboard
                        </Link>
                    )}
                </div>
            </nav>

            {/* Pricing Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Planes Simples,
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Precios Transparentes
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Comienza gratis. Actualiza cuando necesites más.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative">
                            <h3 className="text-2xl font-bold text-white mb-2">Gratuito</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-gray-500">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-300">5 búsquedas por mes</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-300">Resultados básicos</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-gray-300">Historial limitado</span>
                                </li>
                            </ul>
                            <Link
                                href={user ? '/app' : '/auth'}
                                className="block w-full text-center bg-white/5 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
                            >
                                Comenzar Gratis
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-2xl p-8 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                                    MÁS POPULAR
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-white">$10</span>
                                <span className="text-gray-400">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Búsquedas ilimitadas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Análisis completo con IA</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Historial ilimitado</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Reportes guardados</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Plantillas personalizadas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check size={20} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="text-white font-medium">Soporte prioritario</span>
                                </li>
                            </ul>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Actualizar a Pro
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mt-20 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">Preguntas Frecuentes</h2>
                        <div className="space-y-6">
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h3>
                                <p className="text-gray-400 text-sm">
                                    Sí, puedes cancelar tu suscripción en cualquier momento. No se renovará automáticamente.
                                </p>
                            </div>
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">¿Qué métodos de pago aceptan?</h3>
                                <p className="text-gray-400 text-sm">
                                    Aceptamos tarjetas de crédito/débito y otros métodos a través de MercadoPago.
                                </p>
                            </div>
                            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
                                <h3 className="text-white font-semibold mb-2">¿Hay reembolsos?</h3>
                                <p className="text-gray-400 text-sm">
                                    Ofrecemos reembolso completo si no estás satisfecho en los primeros 7 días.
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
