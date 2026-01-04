'use client';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { useAuth } from '@/context/AuthContext';

export default function PaymentSuccessPage() {
    const { user } = useAuth();

    useEffect(() => {
        // Track successful upgrade
        if (user?.id) {
            analytics.upgradeCompleted(user.id);
        }
    }, [user]);
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-4">
                    ¡Pago Exitoso!
                </h1>
                <p className="text-gray-400 mb-8">
                    Tu suscripción a Veta Pro ha sido activada. Ahora puedes disfrutar de búsquedas ilimitadas.
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
