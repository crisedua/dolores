'use client';
import { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';

export function EarlyAccessBadge() {
    const [showTooltip, setShowTooltip] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="relative inline-block">
            <div
                className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full cursor-help transition-all hover:bg-amber-500/20"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                {t.paywalls?.earlyAccess?.badge || '🎯 Acceso early — precio sube con más usuarios'}
            </div>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg text-xs text-gray-300 whitespace-nowrap z-50 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {t.paywalls?.earlyAccess?.tooltip || 'Los primeros usuarios tienen acceso preferente y feedback directo.'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#333]" />
                </div>
            )}
        </div>
    );
}
