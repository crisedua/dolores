/**
 * Veta Subscription Plans Configuration
 * ======================================
 * Centralized plan definitions for easy adjustment and future extensibility.
 * 
 * Plan Types:
 * - free: One-time usage, lifetime limit (no reset)
 * - pro: Monthly subscription with 5 scans/month
 * - advanced: Monthly subscription with 15 scans/month
 */

export type PlanType = 'free' | 'pro' | 'advanced';

export interface PlanConfig {
    id: PlanType;
    name: {
        en: string;
        es: string;
    };
    scansPerPeriod: number;
    maxPainPointsPerScan: number | null; // null = unlimited
    isRecurring: boolean;
    priceUSD: number;
    features: {
        en: string[];
        es: string[];
    };
    // For display purposes
    badge?: {
        en: string;
        es: string;
    };
}

export const PLANS: Record<PlanType, PlanConfig> = {
    free: {
        id: 'free',
        name: {
            en: 'Free',
            es: 'Gratuito'
        },
        scansPerPeriod: 1, // 1 scan TOTAL (lifetime)
        maxPainPointsPerScan: 3, // Only 3 pain points returned
        isRecurring: false, // No monthly reset
        priceUSD: 0,
        features: {
            en: [
                '1 scan total (one-time)',
                'Up to 3 pain points per scan',
                'Full AI analysis',
                'Direct source links',
            ],
            es: [
                '1 escaneo total (una vez)',
                'Hasta 3 problemas por escaneo',
                'Análisis completo con IA',
                'Enlaces directos a fuentes',
            ]
        }
    },
    pro: {
        id: 'pro',
        name: {
            en: 'Pro',
            es: 'Pro'
        },
        scansPerPeriod: 5, // 5 scans per month
        maxPainPointsPerScan: null, // Unlimited pain points
        isRecurring: true, // Monthly billing reset
        priceUSD: 10,
        features: {
            en: [
                '5 scans per month',
                'Unlimited pain points per scan',
                'Full AI analysis',
                'Direct source links',
                'Export results',
                'Prototype Prompt Generator',
            ],
            es: [
                '5 escaneos por mes',
                'Problemas ilimitados por escaneo',
                'Análisis completo con IA',
                'Enlaces directos a fuentes',
                'Exportar resultados',
                'Generador de Prompts para Prototipos',
            ]
        },
        badge: {
            en: 'MOST POPULAR',
            es: 'MÁS POPULAR'
        }
    },
    advanced: {
        id: 'advanced',
        name: {
            en: 'Advanced',
            es: 'Avanzado'
        },
        scansPerPeriod: 15, // 15 scans per month
        maxPainPointsPerScan: null, // Unlimited pain points
        isRecurring: true, // Monthly billing reset
        priceUSD: 29,
        features: {
            en: [
                '15 scans per month',
                'Unlimited pain points per scan',
                'Full AI analysis',
                'Direct source links',
                'Export results',
                'Prototype Prompt Generator',
                'Priority support',
            ],
            es: [
                '15 escaneos por mes',
                'Problemas ilimitados por escaneo',
                'Análisis completo con IA',
                'Enlaces directos a fuentes',
                'Exportar resultados',
                'Generador de Prompts para Prototipos',
                'Soporte prioritario',
            ]
        },
        badge: {
            en: 'FOR POWER USERS',
            es: 'PARA USUARIOS AVANZADOS'
        }
    }
};

/**
 * Get plan configuration by type
 */
export function getPlan(planType: PlanType): PlanConfig {
    return PLANS[planType] || PLANS.free;
}

/**
 * Get the scan limit for a plan
 */
export function getScanLimit(planType: PlanType): number {
    return PLANS[planType]?.scansPerPeriod || 1;
}

/**
 * Get the pain point limit for a plan (null = unlimited)
 */
export function getPainPointLimit(planType: PlanType): number | null {
    return PLANS[planType]?.maxPainPointsPerScan ?? 3;
}

/**
 * Check if a plan has monthly reset
 */
export function hasMonthlyReset(planType: PlanType): boolean {
    return PLANS[planType]?.isRecurring || false;
}

/**
 * Calculate remaining scans based on plan and usage
 * For free plan: checks lifetime usage
 * For paid plans: checks current billing cycle usage
 */
export function calculateRemainingScans(
    planType: PlanType,
    totalScansUsed: number,
    currentCycleScansUsed: number
): number {
    const plan = PLANS[planType];

    if (!plan.isRecurring) {
        // Free plan: lifetime limit
        return Math.max(0, plan.scansPerPeriod - totalScansUsed);
    } else {
        // Paid plans: monthly limit
        return Math.max(0, plan.scansPerPeriod - currentCycleScansUsed);
    }
}

/**
 * Check if user can perform a scan
 */
export function canPerformScan(
    planType: PlanType,
    totalScansUsed: number,
    currentCycleScansUsed: number
): boolean {
    return calculateRemainingScans(planType, totalScansUsed, currentCycleScansUsed) > 0;
}

/**
 * Get the next reset date for a subscription
 * Returns null for free plan (no reset)
 */
export function getNextResetDate(subscriptionStartDate: Date | null, planType: PlanType): Date | null {
    if (!PLANS[planType]?.isRecurring || !subscriptionStartDate) {
        return null;
    }

    const startDate = new Date(subscriptionStartDate);
    const now = new Date();

    // Calculate the next billing date based on subscription start
    const dayOfMonth = startDate.getDate();
    const nextReset = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

    // If we've passed this month's reset date, move to next month
    if (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
    }

    return nextReset;
}

/**
 * Format usage display string
 */
export function formatUsageDisplay(
    planType: PlanType,
    scansUsed: number,
    lang: 'en' | 'es' = 'en'
): string {
    const plan = PLANS[planType];
    const limit = plan.scansPerPeriod;

    if (planType === 'free') {
        return lang === 'en'
            ? `Free scan used: ${scansUsed} / ${limit}`
            : `Escaneo gratuito usado: ${scansUsed} / ${limit}`;
    } else {
        return lang === 'en'
            ? `Scans remaining this month: ${Math.max(0, limit - scansUsed)} / ${limit}`
            : `Escaneos disponibles este mes: ${Math.max(0, limit - scansUsed)} / ${limit}`;
    }
}

/**
 * Get upgrade suggestions based on current plan
 */
export function getUpgradeSuggestions(currentPlan: PlanType): PlanType[] {
    switch (currentPlan) {
        case 'free':
            return ['pro', 'advanced'];
        case 'pro':
            return ['advanced'];
        case 'advanced':
            return []; // Already at highest tier
        default:
            return ['pro', 'advanced'];
    }
}
