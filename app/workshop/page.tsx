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
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '' });

    const handleReserve = () => {
        setShowRegisterModal(true);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Save Registration
            const registerResponse = await fetch('/api/workshop/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!registerResponse.ok) throw new Error('Error en el registro');

            // 2. Create Payment
            const userId = user?.id || 'guest';
            // Use the email entered in the form for the payment payer info
            const userEmail = formData.email;

            const paymentResponse = await fetch('/api/create-workshop-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userEmail
                })
            });

            const paymentData = await paymentResponse.json();

            if (paymentData.initPoint) {
                window.location.href = paymentData.initPoint;
            } else {
                throw new Error('No init point received');
            }
        } catch (error) {
            console.error('Process failed:', error);
            alert('Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Registration Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <XCircle size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-2">Casi listo... 🚀</h3>
                        <p className="text-gray-400 text-sm mb-6">Completa tus datos para enviarte el acceso.</p>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Nombre completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Ej. Juan Pérez"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Tu mejor email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="juan@ejemplo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp / Móvil</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="+54 9 11..."
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Ir al pago
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                            y validarlo creando una aplicación web simple (sin programar)
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        Aprende a construir una app mínima solo para validar una idea<br />
                        antes de invertir tiempo, energía o dinero.
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
                    <p className="text-xs text-amber-400 font-medium mt-4">
                        (precio fundador)
                    </p>
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
                                        <p className="text-sm text-white font-medium">Workshop práctico en vivo</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                        <Target size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Qué aprenderás</p>
                                        <p className="text-sm text-white font-medium">Elegir problema + crear app web de validación</p>
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

            {/* Type of App Section */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                        ¿Qué tipo de app vas a aprender a crear?
                    </h2>
                    <p className="text-gray-400 mb-8">Durante el workshop verás ejemplos de apps como:</p>

                    <div className="grid md:grid-cols-3 gap-6 text-left mb-12">
                        <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mb-3" />
                            <p className="text-gray-300 text-sm">Una app web básica con una sola función clara</p>
                        </div>
                        <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-purple-500 mb-3" />
                            <p className="text-gray-300 text-sm">Una app mínima que simula el producto final</p>
                        </div>
                        <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-pink-500 mb-3" />
                            <p className="text-gray-300 text-sm">Una app usada solo para medir interés o intención de pago</p>
                        </div>
                    </div>

                    <p className="text-white font-medium">Todo enfocado en: <span className="text-green-400">rapidez, simplicidad y validación real</span>.</p>
                </div>
            </section>





            {/* What You'll Learn */}
            <section className="py-12 px-6 bg-[#080808]">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
                        ¿Qué vas a aprender EXACTAMENTE?
                    </h2>
                    <p className="text-gray-400 text-center mb-10">
                        En este workshop voy a mostrar, paso a paso:
                    </p>

                    <div className="space-y-6">
                        {/* Item 1 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 group hover:border-blue-500/50 transition-colors flex gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Target size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Qué problemas sí valen la pena atacar</h3>
                                <p className="text-gray-400 text-sm">(y cuáles descartar aunque suenen bien)</p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 group hover:border-purple-500/50 transition-colors flex gap-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Lightbulb size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Qué es un MVP, explicado fácil y sin jerga</h3>
                                <p className="text-gray-400 text-sm">(una versión mínima solo para validar, no un producto completo)</p>
                            </div>
                        </div>

                        {/* Item 3 - Highlighted */}
                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 flex gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Zap size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Cómo crear una aplicación web muy simple</h3>
                                <ul className="space-y-1 text-gray-300 text-sm">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> solo con lo necesario para validar una idea</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> sin programar</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> usando herramientas no-code</li>
                                </ul>
                            </div>
                        </div>

                        {/* Item 4 */}
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6 group hover:border-pink-500/50 transition-colors flex gap-4">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp size={24} className="text-pink-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Cómo usar esa app para validar</h3>
                                <p className="text-gray-400 text-sm mb-2">si alguien realmente estaría interesado o pagaría</p>
                                <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs text-gray-300">
                                    <p className="mb-1">👉 El objetivo NO es construir un SaaS.</p>
                                    <p>👉 El objetivo es aprender a crear una app mínima para validar.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Modalidad & Guarantee */}
            < section className="py-12 px-6" >
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Modalidad */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6">Modalidad</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Video size={16} />
                                </div>
                                <span className="text-gray-300">100% en vivo (Pantalla + voz)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-gray-300">Se muestra el proceso en tiempo real</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Users size={16} />
                                </div>
                                <span className="text-gray-300">Espacio para preguntas</span>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 mt-4">
                                <Video size={20} className="text-red-400 shrink-0" />
                                <div>
                                    <p className="text-red-400 text-sm font-semibold">⚠️ No habrá grabación</p>
                                    <p className="text-red-300/70 text-xs">Si estás, estás.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guarantee */}
                    <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Garantía simple</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Si en los primeros 15 minutos sientes que no es para ti, me escribes y te devuelvo el dinero.
                        </p>
                        <p className="text-white font-medium">Sin preguntas.</p>
                    </div>
                </div>
            </section >

            {/* Final CTA */}
            < section className="py-20 px-6" >
                <div className="max-w-3xl mx-auto text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                        <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-3xl p-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                🔓 Reserva tu cupo — USD $19
                            </h2>
                            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-gray-300">
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> En vivo</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> App web simple</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> Sin programación</span>
                                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-400" /> Enfocado en validación real</span>
                            </div>
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
                                        👉 Quiero mi cupo
                                        <span className="text-sm font-normal text-white/50 line-through ml-1">$49</span>
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
            </section >

            {/* Footer */}
            < footer className="py-8 px-6 border-t border-white/5" >
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
            </footer >
        </div >
    );
}
