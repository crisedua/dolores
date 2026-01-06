'use client';
import Link from 'next/link';
import { Gem, CheckCircle2 } from 'lucide-react';

export default function WorkshopSuccessPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            {/* Navigation */}
            <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                            <Gem size={18} />
                        </div>
                        <span className="font-bold text-lg text-white">Veta</span>
                    </Link>
                </div>
            </nav>

            {/* Success Content */}
            <div className="flex-1 flex items-center justify-center px-6">
                <div className="max-w-lg w-full text-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 blur-3xl" />
                        <div className="relative bg-[#111] border border-green-500/30 rounded-3xl p-10">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-green-400" />
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                ¡Todo listo! 🎉
                            </h1>

                            <p className="text-gray-400 mb-6">
                                Tu registro y pago se han completado con éxito.
                            </p>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
                                <p className="text-white text-sm font-medium mb-2">
                                    📩 Revisa tu email
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Te enviaremos los detalles de acceso al workshop pronto.
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Volver al inicio
                            </Link>

                            <p className="text-xs text-gray-500 mt-6">
                                Si tienes dudas, escríbenos por WhatsApp.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
