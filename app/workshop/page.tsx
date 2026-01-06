'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
    Gem,
    Calendar,
    Clock,
    Video,
    Users,
    DollarSign,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Loader2,
    Zap,
    Target,
    Lightbulb,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function WorkshopPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleReserve = async () => {
        setLoading(true);

        try {
            const userId = user?.id || 'guest';
            const userEmail = user?.email || 'guest@veta.lat';

            const response = await fetch('/api/create-workshop-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userEmail
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
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                            <Gem size={18} />
                        </div>
                        <span className="font-bold text-lg text-white">Veta</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium tracking-wide">BETA</span>
                    </Link>
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link
                            href="/pricing"
                            className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                        >
                            Precios
                        </Link>
                        {user ? (
                            <Link
                                href="/app"
                                className="bg-white text-black px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/auth"
                                className="bg-white text-black px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm md:text-base"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-sm text-amber-400 font-semibold">Workshop en vivo</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Cómo elegir un buen problema
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            y validarlo sin construir de más
                        </span>
                        <br />
                        <span className="text-xl md:text-2xl text-gray-300">
                            (usando Veta)
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-4">
                        Aprende a tomar una decisión clara antes de invertir tiempo, energía o dinero.
                    </p>
                    <p className="text-sm text-amber-400 font-medium mb-8">
                        Enfocado en LATAM. Sin humo.
                    </p>

                    {/* Quick CTA */}
                    <button
                        onClick={handleReserve}
                        disabled={loading}
                        className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-purple-500/25 flex items-center gap-3 mx-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                Reservar mi cupo - USD $19
                                <span className="text-sm font-normal text-white/50 line-through ml-1">$49</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform ml-2" />
                            </>
                        )}
                    </button>
                </div>
            </section>

            {/* Quick Summary Card */}
            <section className="py-8 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
                        <div className="relative">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-xl">📌</span> Resumen rápido
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                        <Video size={20} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Qué es</p>
                                        <p className="text-sm text-white font-medium">Workshop en vivo, práctico</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                        <Clock size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Duración</p>
                                        <p className="text-sm text-white font-medium">60–75 minutos</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                        <Calendar size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Modalidad</p>
                                        <p className="text-sm text-white font-medium">Online (en vivo)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                                        <XCircle size={20} className="text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Grabación</p>
                                        <p className="text-sm text-white font-medium">No habrá grabación</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                        <DollarSign size={20} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Precio</p>
                                        <p className="text-sm text-white font-medium">
                                            USD $19 <span className="text-gray-500 line-through text-xs">$49</span>
                                            <span className="text-amber-400 text-xs block">(precio fundador)</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                                        <Users size={20} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Cupos</p>
                                        <p className="text-sm text-white font-medium">Limitados</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Whom Section */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">
                        ¿Para quién es este workshop?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Es para ti */}
                        <div className="bg-[#111] border border-green-500/30 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={20} />
                                Este workshop es para ti si:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Ya usaste Veta y encontraste problemas reales',
                                    'No sabes cuál elegir ni si vale la pena avanzar',
                                    'Quieres validar ideas sin construir de más',
                                    'Te interesa monetizar en LATAM',
                                    'Prefieres claridad antes que teoría'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-gray-300 text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* No es para ti */}
                        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                <XCircle size={20} />
                                No es para ti si:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Buscas un curso largo',
                                    'Quieres aprender programación',
                                    'No tienes intención de ejecutar nada'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                        <span className="text-gray-300 text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* What You'll Learn */}
            <section className="py-12 px-6 bg-[#080808]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                        ¿Qué vas a aprender?
                    </h2>
                    <p className="text-gray-400 text-center mb-10">
                        En esta sesión en vivo vamos a ver:
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Topic 1 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative group hover:border-blue-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">1️⃣</div>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Target size={24} className="text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">Cómo elegir el problema correcto</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>• Por qué muchos problemas "interesantes" no valen la pena</li>
                                <li>• Qué señales mirar para decidir si conviene validar</li>
                                <li>• Qué problemas descartar sin dudar</li>
                            </ul>
                        </div>

                        {/* Topic 2 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative group hover:border-purple-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-sm">2️⃣</div>
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Lightbulb size={24} className="text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">Qué significa "validar" de verdad</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>• Explicado en simple, sin jerga</li>
                                <li>• Qué preguntas debe responder una validación</li>
                                <li>• Qué señales indican interés real</li>
                                <li>• Qué señales son solo ruido</li>
                            </ul>
                        </div>

                        {/* Topic 3 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 relative group hover:border-pink-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white text-sm">3️⃣</div>
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4">
                                <TrendingUp size={24} className="text-pink-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3">Cómo evitar construir de más</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>• Técnicas prácticas para validar rápido</li>
                                <li>• Cómo testear sin código</li>
                                <li>• Errores comunes que hacen perder meses</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-3xl p-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                ¿Listo para tomar mejores decisiones?
                            </h2>
                            <p className="text-gray-400 mb-8">
                                Cupos limitados. Precio fundador por tiempo limitado.
                            </p>
                            <button
                                onClick={handleReserve}
                                disabled={loading}
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-purple-500/25 flex items-center gap-3 mx-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        👉 Reservar mi cupo - USD $19
                                        <span className="text-sm font-normal text-white/60 line-through ml-1">$49</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform ml-2" />
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 mt-4">
                                Pago seguro con MercadoPago
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 text-white font-bold flex items-center justify-center rounded text-xs">
                            <Gem size={14} />
                        </div>
                        <span className="font-semibold text-white">Veta</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Encuentra problemas reales que puedes resolver.
                    </p>
                </div>
            </footer>
        </div>
    );
}
