'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gem, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

export default function WorkshopSuccessPage() {
    const [countdown, setCountdown] = useState(5);

    // Redirect to Google Form after countdown
    useEffect(() => {
        const googleFormUrl = 'https://forms.gle/6SvKi3LovVotAzp99';

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = googleFormUrl;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const googleFormUrl = 'https://forms.gle/6SvKi3LovVotAzp99';

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
                                ¡Pago exitoso! 🎉
                            </h1>

                            <p className="text-gray-400 mb-6">
                                Tu lugar en el workshop está reservado.
                            </p>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                                <p className="text-amber-400 text-sm font-medium mb-2">
                                    📋 Último paso: Completa tu inscripción
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Serás redirigido automáticamente en {countdown} segundos...
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Redirigiendo al formulario...</span>
                            </div>

                            <a
                                href={googleFormUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Completar inscripción ahora
                                <ExternalLink size={18} />
                            </a>

                            <p className="text-xs text-gray-500 mt-6">
                                Si no eres redirigido automáticamente, haz clic en el botón.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
