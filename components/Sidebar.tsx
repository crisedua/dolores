'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    Search,
    Gem,
    LogOut,
    X,
    Zap,
    FileText,
    Shield,
    Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { ReactNode } from 'react';
import { EarlyAccessBadge } from './EarlyAccessBadge';
import { useTranslation } from '@/context/LanguageContext';
import { PlanType } from '@/lib/plans';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, signOut } = useAuth();
    const { usage, isLoading } = useSubscription();
    const { t, language, setLanguage } = useTranslation();

    const pathname = usePathname();

    // Get plan display name based on type
    const getPlanDisplayName = (planType: PlanType): string => {
        switch (planType) {
            case 'pro':
                return 'Pro';
            case 'advanced':
                return language === 'es' ? 'Avanzado' : 'Advanced';
            default:
                return language === 'es' ? 'Gratuito' : 'Free';
        }
    };

    // Format usage text based on plan type
    const getUsageText = (): string => {
        if (usage.planType === 'free') {
            const template = language === 'es'
                ? 'Escaneo gratuito usado: {used} / {limit}'
                : 'Free scan used: {used} / {limit}';
            return template
                .replace('{used}', usage.scansUsed.toString())
                .replace('{limit}', usage.scanLimit.toString());
        } else {
            const template = language === 'es'
                ? 'Escaneos: {remaining} / {limit}'
                : 'Scans: {remaining} / {limit}';
            return template
                .replace('{remaining}', usage.scansRemaining.toString())
                .replace('{limit}', usage.scanLimit.toString());
        }
    };

    // Calculate usage percentage for progress bar
    const usagePercentage = usage.planType === 'free'
        ? (usage.scansUsed / usage.scanLimit) * 100
        : (usage.scansUsed / usage.scanLimit) * 100;

    // Format next reset date
    const formatResetDate = (): string | null => {
        if (!usage.nextResetDate || usage.planType === 'free') return null;

        return usage.nextResetDate.toLocaleDateString(
            language === 'es' ? 'es-ES' : 'en-US',
            { month: 'short', day: 'numeric' }
        );
    };

    const nextResetDate = formatResetDate();

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
                    <div className="p-2 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate" title={user?.email}>
                                    {user?.email || t.sidebar.guest}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-medium ${usage.planType === 'advanced'
                                            ? 'text-purple-400'
                                            : usage.planType === 'pro'
                                                ? 'text-blue-400'
                                                : 'text-gray-400'
                                        }`}>
                                        {getPlanDisplayName(usage.planType)}
                                    </span>
                                    {usage.isPaidUser && (
                                        <span className="text-xs text-gray-500">✨</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Usage Display - All Plans */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-300 mb-1.5">
                                <span>{language === 'es' ? 'Escaneos' : 'Scans'}</span>
                                <span className="font-semibold">
                                    {usage.planType === 'free'
                                        ? `${usage.scansUsed}/${usage.scanLimit}`
                                        : `${usage.scansRemaining}/${usage.scanLimit}`
                                    }
                                </span>
                            </div>
                            <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${usage.planType === 'advanced'
                                            ? 'bg-purple-500/80'
                                            : usage.planType === 'pro'
                                                ? 'bg-blue-500/80'
                                                : usage.scansUsed >= usage.scanLimit
                                                    ? 'bg-red-500/80'
                                                    : 'bg-green-500/80'
                                        }`}
                                    style={{
                                        width: usage.planType === 'free'
                                            ? `${usagePercentage}%`
                                            : `${100 - usagePercentage}%` // Show remaining for paid plans
                                    }}
                                />
                            </div>

                            {/* Usage status text */}
                            {usage.planType === 'free' && usage.scansUsed >= usage.scanLimit && (
                                <p className="text-xs text-amber-400 mt-1.5">
                                    {language === 'es'
                                        ? 'Escaneo gratuito usado'
                                        : 'Free scan used'
                                    }
                                </p>
                            )}

                            {/* Next reset date for paid plans */}
                            {usage.isPaidUser && nextResetDate && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                                    <Calendar size={10} />
                                    <span>
                                        {language === 'es'
                                            ? `Reinicio: ${nextResetDate}`
                                            : `Reset: ${nextResetDate}`
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upgrade CTA - Only for non-Advanced users with limited or no scans */}
                    {usage.planType !== 'advanced' && (
                        <div className="space-y-2">
                            <Link
                                href="/pricing"
                                className={`w-full text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${usage.planType === 'pro'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                    }`}
                            >
                                <Zap size={14} />
                                {usage.planType === 'pro'
                                    ? (language === 'es' ? 'Actualizar a Avanzado' : 'Upgrade to Advanced')
                                    : (language === 'es' ? 'Actualizar a Pro' : 'Upgrade to Pro')
                                }
                            </Link>
                            {usage.planType === 'free' && (
                                <div className="flex justify-center transform scale-90">
                                    <EarlyAccessBadge />
                                </div>
                            )}
                        </div>
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
