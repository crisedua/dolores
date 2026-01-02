'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Folder,
    CheckSquare,
    Search,
    Gem, // Changed from BarChart3
    LogOut,
    Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { ReactNode } from 'react';

export function Sidebar() {
    const { user, signOut } = useAuth();
    const { usage, subscription } = useSubscription();

    const planName = subscription?.plan_type === 'pro' ? 'Pro' : 'Gratuito';
    const usagePercentage = usage.isProUser ? 100 : (usage.search_count / usage.limit) * 100;

    // Debug logging
    console.log('Sidebar - Subscription Data:', {
        user: user?.email,
        subscription,
        usage,
        planName,
        usagePercentage
    });
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--sidebar-bg)] border-r border-[#333] flex flex-col p-4 z-50">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                    <Gem size={18} />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">Veta</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium ml-1">BETA</span>
            </div>

            {/* Main Nav */}
            <div className="space-y-6 flex-1">

                {/* Section: Discoveries */}
                <div>
                    <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">Descubrimiento</h3>
                    <nav className="space-y-1">
                        <NavItem
                            href="/app"
                            icon={<LayoutGrid size={18} />}
                            label="Explorar"
                            active={pathname === '/app'}
                        />
                    </nav>
                </div>

                {/* Section: Analysis */}
                <div>
                    <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">Análisis</h3>
                    <nav className="space-y-1">
                        <NavItem
                            href="/app/history"
                            icon={<Search size={18} />}
                            label="Historial"
                            active={pathname === '/app/history'}
                        />
                    </nav>
                </div>
            </div>

            {/* Footer / User */}
            <div className="pt-4 border-t border-[#333]">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    <div className="flex-1 w-full overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate" title={user?.email}>{user?.email || 'Usuario Invitado'}</p>
                        <p className="text-sm text-gray-400 mb-2">Plan {planName}</p>

                        {/* Usage for Free Plan */}
                        {!usage.isProUser && (
                            <div className="pr-2">
                                <div className="flex justify-between text-xs text-gray-300 mb-1">
                                    <span>Búsquedas</span>
                                    <span className="font-semibold">{usage.search_count}/{usage.limit}</span>
                                </div>
                                <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500/80 rounded-full transition-all"
                                        style={{ width: `${usagePercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pro Badge */}
                        {usage.isProUser && (
                            <div className="pr-2">
                                <div className="text-xs text-blue-400 font-semibold">
                                    ✨ Búsquedas Ilimitadas
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upgrade Button - Only for Free Users */}
                {!usage.isProUser && (
                    <Link
                        href="/pricing"
                        className="mt-3 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={14} />
                        Actualizar a Pro
                    </Link>
                )}

                <button
                    onClick={() => signOut()}
                    className="w-full text-xs text-gray-500 hover:text-white mt-3 flex items-center justify-center gap-2 py-2 transition-colors"
                >
                    <LogOut size={14} />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}

function NavItem({ href, icon, label, active = false, badge }: { href: string, icon: ReactNode, label: string, active?: boolean, badge?: string }) {
    return (
        <Link
            href={href}
            className={`
                flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
                ${active ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white hover:bg-white/5'}
            `}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{badge}</span>
            )}
        </Link>
    )
}

