'use client';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function PaymentPendingPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={40} className="text-yellow-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    Pago Pendiente
                </h1>
                <p className="text-gray-400 mb-8">
                    Tu pago está siendo procesado. Te notificaremos cuando se confirme.
                </p>
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                    Ir al Dashboard
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
