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
        limit: 1,
        canSearch: true,
        isProUser: true  // Always true - no content blurring for anyone
    });
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (user) {
            fetchSubscriptionData();

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
    }, [user]);

    const fetchSubscriptionData = async () => {
        if (!user) {
            console.log('useSubscription: No user, skipping fetch');
            return;
        }

        console.log('useSubscription: Fetching data for user:', user.id);

        try {
            // Check if user has pro subscription
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('plan_type, status')
                .eq('user_id', user.id)
                .single();

            setSubscription(subData);

            const isPro = subData?.plan_type === 'pro' && subData?.status === 'active';
            console.log('useSubscription: Is Pro?', isPro);

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
            const currentMonth = new Date().toISOString().slice(0, 7);
            const { data: usageData } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            const searchCount = usageData?.search_count || 0;
            const canSearch = searchCount < 1; // Free users get 1 search

            console.log('useSubscription: Free user usage:', { searchCount, canSearch });

            setUsage({
                search_count: searchCount,
                limit: 1,
                canSearch,
                isProUser: true  // Always true - free users see ALL content, no blur
            });

        } catch (error: unknown) {
            console.error('useSubscription: ERROR fetching subscription:', error);
        } finally {
            setIsLoading(false);
            setRefreshKey(prev => prev + 1);
        }
    };

    const incrementUsage = async () => {
        console.log('🔵 incrementUsage called!', { user: user?.id });

        if (!user) {
            console.log('🟡 Skipping increment: No user');
            return true;
        }

        // Check if actually pro (by subscription, not the display flag)
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('plan_type, status')
            .eq('user_id', user.id)
            .single();

        const isPro = subData?.plan_type === 'pro' && subData?.status === 'active';
        if (isPro) {
            console.log('🟡 Skipping increment: Pro user');
            return true;
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
        console.log('🔵 Incrementing for month:', currentMonth);

        try {
            const { data: existing } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            if (existing) {
                await supabase
                    .from('usage_tracking')
                    .update({
                        search_count: existing.search_count + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('month_year', currentMonth);

                console.log('🟢 Updated usage to:', existing.search_count + 1);
            } else {
                await supabase
                    .from('usage_tracking')
                    .insert({
                        user_id: user.id,
                        month_year: currentMonth,
                        search_count: 1
                    });

                console.log('🟢 Created new usage record with count: 1');
            }

            await fetchSubscriptionData();
            return true;

        } catch (error) {
            console.error('🔴 Error incrementing usage:', error);
            return false;
        }
    };

    return {
        subscription,
        usage,
        isLoading,
        incrementUsage,
        refreshSubscription: fetchSubscriptionData,
        refreshKey
    };
}
