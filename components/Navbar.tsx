'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BarChart2, Home, Lock } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl hover:text-blue-400 transition">
                        <Sparkles size={24} className="text-blue-500" />
                        <span>Veta</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition flex items-center gap-2 ${pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Home size={16} />
                            Inicio
                        </Link>

                        <Link
                            href="/"
                            className={`text-sm font-medium transition flex items-center gap-2 text-gray-400 hover:text-white`}
                        >
                            <BarChart2 size={16} />
                            Busca Dolores
                        </Link>

                        <Link
                            href="/casos-exito"
                            className={`text-sm font-medium transition flex items-center gap-2 ${pathname.startsWith('/casos-exito') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Sparkles size={16} />
                            Casos de Éxito
                        </Link>
                    </div>

                    {/* Admin Link (Subtle) */}
                    <Link
                        href="/admin/casos-exito"
                        className={`text-xs px-3 py-1 rounded-full border transition flex items-center gap-1 ${isAdmin ? 'bg-blue-900/30 border-blue-800 text-blue-300' : 'border-gray-800 text-gray-600 hover:text-gray-400 hover:border-gray-700'}`}
                    >
                        <Lock size={12} />
                        Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
}
