'use client';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailurePage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    Pago Fallido
                </h1>
                <p className="text-gray-400 mb-8">
                    Hubo un problema procesando tu pago. Por favor, intenta nuevamente.
                </p>
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                    <ArrowLeft size={20} />
                    Volver a Precios
                </Link>
            </div>
        </div>
    );
}
