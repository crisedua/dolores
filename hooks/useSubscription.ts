'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Subscription {
    plan_type: 'free' | 'pro';
    status: string;
}

interface UsageData {
    search_count: number;
    limit: number;
    canSearch: boolean;
    isProUser: boolean;
}

export function useSubscription() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<UsageData>({
        search_count: 0,
        limit: 5,
        canSearch: true,
        isProUser: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSubscriptionData();
        }
    }, [user]);

    const fetchSubscriptionData = async () => {
        if (!user) return;

        try {
            // Get subscription
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('plan_type, status')
                .eq('user_id', user.id)
                .single();

            setSubscription(subData);

            const isPro = subData?.plan_type === 'pro' && subData?.status === 'active';

            if (isPro) {
                setUsage({
                    search_count: 0,
                    limit: Infinity,
                    canSearch: true,
                    isProUser: true
                });
                setIsLoading(false);
                return;
            }

            // Get usage for free users
            const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

            const { data: usageData } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            const searchCount = usageData?.search_count || 0;
            const canSearch = searchCount < 5;

            setUsage({
                search_count: searchCount,
                limit: 5,
                canSearch,
                isProUser: false
            });

        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const incrementUsage = async () => {
        if (!user || usage.isProUser) return true;

        const currentMonth = new Date().toISOString().slice(0, 7);

        try {
            const { data: existing } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            if (existing) {
                // Update existing
                await supabase
                    .from('usage_tracking')
                    .update({
                        search_count: existing.search_count + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('month_year', currentMonth);
            } else {
                // Create new
                await supabase
                    .from('usage_tracking')
                    .insert({
                        user_id: user.id,
                        month_year: currentMonth,
                        search_count: 1
                    });
            }

            // Refresh data
            await fetchSubscriptionData();
            return true;

        } catch (error) {
            console.error('Error incrementing usage:', error);
            return false;
        }
    };

    return {
        subscription,
        usage,
        isLoading,
        incrementUsage,
        refreshSubscription: fetchSubscriptionData
    };
}
