'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    PlanType,
    PLANS,
    getScanLimit,
    getPainPointLimit,
    canPerformScan,
    formatUsageDisplay,
    getUpgradeSuggestions,
    getNextResetDate
} from '@/lib/plans';

interface Subscription {
    plan_type: PlanType;
    status: string;
    subscription_start_date: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
}

interface UsageData {
    // Core usage metrics
    scansUsed: number;           // Scans used (lifetime for free, cycle for paid)
    scanLimit: number;           // Total scan limit for the plan
    scansRemaining: number;      // Remaining scans
    canScan: boolean;            // Whether user can perform a scan

    // Plan info
    planType: PlanType;
    planName: string;
    isPaidUser: boolean;         // Pro or Advanced
    painPointLimit: number | null; // Max pain points per scan (null = unlimited)

    // Reset info (for paid plans)
    nextResetDate: Date | null;

    // Usage display strings
    usageText: string;

    // Legacy compatibility
    search_count: number;
    limit: number;
    canSearch: boolean;
    isProUser: boolean;          // True for any paid plan (Pro or Advanced)
}

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<UsageData>({
        scansUsed: 0,
        scanLimit: 1,
        scansRemaining: 1,
        canScan: true,
        planType: 'free',
        planName: 'Free',
        isPaidUser: false,
        painPointLimit: 3,
        nextResetDate: null,
        usageText: '',
        // Legacy
        search_count: 0,
        limit: 1,
        canSearch: true,
        isProUser: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchSubscriptionData = useCallback(async () => {
        if (!user) {
            console.log('useSubscription: No user, skipping fetch');
            setIsLoading(false);
            return;
        }

        console.log('useSubscription: Fetching data for user:', user.id);

        try {
            // 1. Fetch subscription data
            const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .select('plan_type, status, subscription_start_date, current_period_start, current_period_end')
                .eq('user_id', user.id)
                .single();

            if (subError && subError.code !== 'PGRST116') {
                console.error('useSubscription: Error fetching subscription:', subError);
            }

            const planType: PlanType = (subData?.plan_type as PlanType) || 'free';
            const isActive = subData?.status === 'active';
            const isPaidUser = (planType === 'pro' || planType === 'advanced') && isActive;

            setSubscription(subData as Subscription);

            // 2. Fetch usage data
            const { data: usageData, error: usageError } = await supabase
                .from('usage_tracking')
                .select('total_scans_ever, current_cycle_scans, search_count')
                .eq('user_id', user.id)
                .single();

            if (usageError && usageError.code !== 'PGRST116') {
                console.error('useSubscription: Error fetching usage:', usageError);
            }

            // 3. Calculate usage based on plan type
            const plan = PLANS[planType];
            let scansUsed: number;

            if (planType === 'free') {
                // Free plan: use lifetime count
                scansUsed = usageData?.total_scans_ever || usageData?.search_count || 0;
            } else {
                // Paid plans: use current cycle count
                scansUsed = usageData?.current_cycle_scans || 0;
            }

            const scanLimit = getScanLimit(planType);
            const scansRemaining = Math.max(0, scanLimit - scansUsed);
            const canScan = scansRemaining > 0 && isActive;
            const painPointLimit = getPainPointLimit(planType);

            // Calculate next reset date for paid plans
            const subscriptionStartDate = subData?.subscription_start_date
                ? new Date(subData.subscription_start_date)
                : null;
            const nextResetDate = getNextResetDate(subscriptionStartDate, planType);

            // Generate usage display text
            const usageText = formatUsageDisplay(planType, scansUsed, 'en'); // Will be localized in components

            console.log('useSubscription:', {
                planType,
                isPaidUser,
                scansUsed,
                scanLimit,
                scansRemaining,
                canScan,
                nextResetDate
            });

            setUsage({
                scansUsed,
                scanLimit,
                scansRemaining,
                canScan,
                planType,
                planName: plan.name.en,
                isPaidUser,
                painPointLimit,
                nextResetDate,
                usageText,
                // Legacy compatibility
                search_count: scansUsed,
                limit: scanLimit,
                canSearch: canScan,
                isProUser: isPaidUser // True for both Pro and Advanced
            });

        } catch (error: unknown) {
            console.error('useSubscription: ERROR fetching subscription:', error);
        } finally {
            setIsLoading(false);
            setRefreshKey(prev => prev + 1);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSubscriptionData();

            // Set up real-time subscriptions
            const channel = supabase
                .channel('subscription_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'usage_tracking',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('🔴 REALTIME: Usage tracking changed!', payload);
                        fetchSubscriptionData();
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'subscriptions',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('🔴 REALTIME: Subscription status changed!', payload);
                        fetchSubscriptionData();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, fetchSubscriptionData]);

    /**
     * Increment usage when a scan is performed
     * This should be called BEFORE the scan to ensure accurate tracking
     */
    const incrementUsage = async (): Promise<boolean> => {
        console.log('🔵 incrementUsage called!', { user: user?.id });

        if (!user) {
            console.log('🟡 Skipping increment: No user');
            return true;
        }

        try {
            // Re-fetch current data to avoid race conditions
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('plan_type, status')
                .eq('user_id', user.id)
                .single();

            const planType: PlanType = (subData?.plan_type as PlanType) || 'free';
            const isActive = subData?.status === 'active';

            // Check current usage
            const { data: existing } = await supabase
                .from('usage_tracking')
                .select('total_scans_ever, current_cycle_scans')
                .eq('user_id', user.id)
                .single();

            const totalScans = existing?.total_scans_ever || 0;
            const cycleScans = existing?.current_cycle_scans || 0;

            // Check if user can scan
            if (!canPerformScan(planType, totalScans, cycleScans)) {
                console.log('🔴 User cannot scan: limit reached');
                return false;
            }

            // Increment usage
            if (existing) {
                await supabase
                    .from('usage_tracking')
                    .update({
                        total_scans_ever: totalScans + 1,
                        current_cycle_scans: cycleScans + 1,
                        search_count: (existing as any).search_count ? (existing as any).search_count + 1 : 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);

                console.log('🟢 Updated usage:', {
                    total: totalScans + 1,
                    cycle: cycleScans + 1
                });
            } else {
                await supabase
                    .from('usage_tracking')
                    .insert({
                        user_id: user.id,
                        total_scans_ever: 1,
                        current_cycle_scans: 1,
                        search_count: 1,
                        month_year: new Date().toISOString().slice(0, 7),
                        current_cycle_start: new Date().toISOString()
                    });

                console.log('🟢 Created new usage record');
            }

            await fetchSubscriptionData();
            return true;

        } catch (error) {
            console.error('🔴 Error incrementing usage:', error);
            return false;
        }
    };

    /**
     * Get upgrade suggestions based on current plan
     */
    const getUpgrades = (): PlanType[] => {
        return getUpgradeSuggestions(usage.planType);
    };

    /**
     * Check if user should see an upgrade prompt
     */
    const shouldShowUpgradePrompt = (): boolean => {
        if (usage.planType === 'free' && usage.scansUsed >= 1) {
            return true;
        }
        if (!usage.canScan && usage.planType !== 'advanced') {
            return true;
        }
        return false;
    };

    return {
        subscription,
        usage,
        isLoading,
        incrementUsage,
        refreshSubscription: fetchSubscriptionData,
        refreshKey,
        // New helper methods
        getUpgrades,
        shouldShowUpgradePrompt,
        planConfig: PLANS[usage.planType]
    };
}
