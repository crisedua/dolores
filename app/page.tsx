'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    TrendingUp,
    MessageSquare,
    Zap,
    ArrowRight,
    CheckCircle2,
    Gem,
    Target,
    Lightbulb,
    Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function LandingPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Redirect logged-in users to the app
    useEffect(() => {
        if (!isLoading && user) {
            router.push('/app');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                            <Gem size={18} />
                        </div>
                        <span className="font-bold text-lg text-white">Veta</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium tracking-wide">BETA</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/pricing"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Precios
                        </Link>
                        {user ? (
                            <Link
                                href="/app"
                                className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/auth"
                                className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Ingresar
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">Impulsado por IA</span>
                    </div>

                    {/* Main Headline */}
                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Deja de adivinar ideas de startup.
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Encuentra problemas reales
                        </span>
                        <br />
                        <span className="text-3xl md:text-4xl text-gray-200">
                            de los que la gente se queja.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Escribe un nicho. Obtén un reporte clasificado de puntos de dolor con pruebas, quién los tiene y un plan de construcción no-code de 7 días.
                    </p>

                    {/* Bullets */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-sm text-gray-300 mb-12">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span>Quejas reales + fuentes (no corazonadas)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span>Puntuado por urgencia y pago</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span>Plan de MVP + primeros clientes</span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            href={user ? "/app" : "/auth"}
                            className="group bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all flex items-center gap-3"
                        >
                            Comenzar Análisis
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a
                            href="#como-funciona"
                            className="text-gray-400 hover:text-white px-8 py-4 font-medium transition-colors"
                        >
                            ¿Cómo funciona?
                        </a>
                    </div>

                    {/* Demo Preview */}
                    <div className="relative max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                        <div className="relative bg-[#111] border border-[#333] rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#222]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Search size={18} className="text-gray-500" />
                                    <span className="text-gray-400">software para abogados</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-medium">⚡ Gestión de casos fragmentada</span>
                                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">ALTA PRIORIDAD</span>
                                        </div>
                                        <p className="text-sm text-gray-400">Los abogados usan 5+ herramientas para gestionar un solo caso...</p>
                                    </div>
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-400">
                                        <span className="text-white font-medium">💰 Facturación manual de horas</span>
                                    </div>
                                    <div className="bg-[#1A1A1A] rounded-lg p-4 border-l-4 border-blue-300">
                                        <span className="text-white font-medium">📄 Documentos sin organizar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-white/5">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">10K+</div>
                        <div className="text-gray-500 text-sm">Hilos analizados por búsqueda</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">15+</div>
                        <div className="text-gray-500 text-sm">Problemas identificados</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">30s</div>
                        <div className="text-gray-500 text-sm">Tiempo promedio de análisis</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-white mb-2">100%</div>
                        <div className="text-gray-500 text-sm">Citas verificables</div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="como-funciona" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Cómo Funciona?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Tres pasos simples para descubrir tu próxima oportunidad de negocio
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-blue-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">1</div>
                            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                <Search size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Ingresa tu Nicho</h3>
                            <p className="text-gray-400">
                                Escribe el mercado o industria que quieres explorar. Ejemplos: "software para dentistas", "apps de productividad"
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-purple-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">2</div>
                            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                <MessageSquare size={28} className="text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">IA Analiza Conversaciones</h3>
                            <p className="text-gray-400">
                                Nuestra IA escanea Reddit, foros y comunidades buscando quejas, frustraciones y necesidades no resueltas.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 relative group hover:border-pink-500/50 transition-colors">
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white">3</div>
                            <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6">
                                <TrendingUp size={28} className="text-pink-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Recibe Oportunidades</h3>
                            <p className="text-gray-400">
                                Obtén una lista priorizada de problemas reales con citas directas y sugerencias de MVP para cada uno.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 px-6 bg-[#080808]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que Necesitas</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Herramientas diseñadas para validar ideas de negocio rápidamente
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Citas Verificables</h3>
                                <p className="text-gray-400 text-sm">Cada problema incluye citas textuales de usuarios reales que puedes verificar.</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Target size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Puntuación de Señal</h3>
                                <p className="text-gray-400 text-sm">Cada problema se puntúa por frecuencia, intensidad y potencial de monetización.</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Lightbulb size={24} className="text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Sugerencias de MVP</h3>
                                <p className="text-gray-400 text-sm">Recibe ideas concretas de productos mínimos viables para cada problema identificado.</p>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <Users size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Datos de Reddit y Foros</h3>
                                <p className="text-gray-400 text-sm">Accede a conversaciones auténticas donde usuarios expresan sus frustraciones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Deja de Adivinar,
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Empieza a Validar
                        </span>
                    </h2>
                    <p className="text-gray-400 text-lg mb-10">
                        Encuentra tu próxima idea de negocio basada en problemas reales que la gente tiene hoy.
                    </p>
                    <Link
                        href={user ? "/app" : "/auth"}
                        className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25"
                    >
                        Comenzar Ahora — Es Gratis
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
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
                        © 2025 Veta. Descubre problemas que puedes resolver.
                    </p>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <WhatsAppButton />
        </div>
    );
}
