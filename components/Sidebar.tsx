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
    X,
    Zap,
    FileText,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { ReactNode } from 'react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

import { useTranslation } from '@/context/LanguageContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, signOut } = useAuth();
    const { usage, subscription } = useSubscription();
    const { t, language, setLanguage } = useTranslation();

    const planName = usage.isProUser ? t.common.pro : t.common.free;
    const usagePercentage = usage.isProUser ? 100 : (usage.search_count / usage.limit) * 100;

    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-[var(--sidebar-bg)] border-r border-[#333] flex flex-col p-4 z-50
                transition-transform duration-300 ease-in-out
                md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Brand & Language Switcher */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-lg shadow-lg shadow-blue-500/20">
                            <Gem size={18} />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">Veta</span>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-md border border-white/10">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('es')}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${language === 'es' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Español
                        </button>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Nav */}
                <div className="space-y-6 flex-1">

                    {/* Section: Discoveries */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">{t.sidebar.discovery}</h3>
                        <nav className="space-y-1">
                            <NavItem
                                href="/app"
                                icon={<LayoutGrid size={18} />}
                                label={t.sidebar.explore}
                                active={pathname === '/app'}
                            />
                        </nav>
                    </div>

                    {/* Section: Analysis */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">{t.sidebar.analysis}</h3>
                        <nav className="space-y-1">
                            <NavItem
                                href="/app/history"
                                icon={<Search size={18} />}
                                label={t.sidebar.history}
                                active={pathname === '/app/history'}
                            />
                            <NavItem
                                href="/app/reports"
                                icon={<FileText size={18} />}
                                label={t.sidebar.reports}
                                active={pathname?.startsWith('/app/reports')}
                            />
                        </nav>
                    </div>

                    {/* Admin Section - Only visible to admin */}
                    {user?.email === 'ed@eduardoescalante.com' && (
                        <div>
                            <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">{t.sidebar.admin}</h3>
                            <nav className="space-y-1">
                                <NavItem
                                    href="/app/admin"
                                    icon={<Shield size={18} />}
                                    label={t.sidebar.adminPanel}
                                    active={pathname === '/app/admin'}
                                />
                            </nav>
                        </div>
                    )}
                </div>

                {/* Footer / User */}
                <div className="pt-4 border-t border-[#333]">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                        <div className="flex-1 w-full overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate" title={user?.email}>{user?.email || t.sidebar.guest}</p>
                            <p className="text-sm text-gray-400 mb-2">{t.sidebar.plan} {planName}</p>

                            {/* Usage for Free Plan */}
                            {!usage.isProUser && (
                                <div className="pr-2">
                                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                                        <span>{t.sidebar.searches}</span>
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
                                        ✨ {t.sidebar.unlimited}
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
                            {t.sidebar.upgrade}
                        </Link>
                    )}

                    <button
                        onClick={() => signOut()}
                        className="w-full text-xs text-gray-500 hover:text-white mt-3 flex items-center justify-center gap-2 py-2 transition-colors"
                    >
                        <LogOut size={14} />
                        {t.sidebar.logout}
                    </button>
                </div>
            </aside>
        </>
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

