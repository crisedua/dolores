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
    const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger

    useEffect(() => {
        if (user) {
            fetchSubscriptionData();

            // Set up real-time subscription to usage_tracking changes
            const currentMonth = new Date().toISOString().slice(0, 7);
            const channel = supabase
                .channel('usage_tracking_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                        schema: 'public',
                        table: 'usage_tracking',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        console.log('🔴 REALTIME: Usage tracking changed!', payload);
                        // Refresh subscription data when usage changes
                        fetchSubscriptionData();
                    }
                )
                .subscribe();

            return () => {
                console.log('🔴 REALTIME: Unsubscribing from usage_tracking');
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
            // Get subscription
            const { data: subData, error: subError } = await supabase
                .from('subscriptions')
                .select('plan_type, status')
                .eq('user_id', user.id)
                .single();

            console.log('useSubscription: Subscription query result:', { subData, subError });

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
            const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
            console.log('useSubscription: Fetching usage for month:', currentMonth);

            const { data: usageData, error: usageError } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            console.log('useSubscription: Usage query result:', { usageData, usageError });

            const searchCount = usageData?.search_count || 0;
            const canSearch = searchCount < 5;

            console.log('useSubscription: Final usage state:', { searchCount, canSearch });

            setUsage({
                search_count: searchCount,
                limit: 5,
                canSearch,
                isProUser: false
            });

        } catch (error: any) {
            console.error('useSubscription: ERROR fetching subscription:', error);
        } finally {
            setIsLoading(false);
            setRefreshKey(prev => prev + 1); // Force re-render
        }
    };

    const incrementUsage = async () => {
        console.log('🔵 incrementUsage called!', { user: user?.id, isProUser: usage.isProUser });

        if (!user || usage.isProUser) {
            console.log('🟡 Skipping increment:', !user ? 'No user' : 'Pro user');
            return true;
        }

        const currentMonth = new Date().toISOString().slice(0, 7);
        console.log('🔵 Incrementing for month:', currentMonth);

        try {
            const { data: existing, error: fetchError } = await supabase
                .from('usage_tracking')
                .select('search_count')
                .eq('user_id', user.id)
                .eq('month_year', currentMonth)
                .single();

            console.log('🔵 Existing usage:', { existing, fetchError });

            if (existing) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('usage_tracking')
                    .update({
                        search_count: existing.search_count + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .eq('month_year', currentMonth);

                console.log('🟢 Updated usage to:', existing.search_count + 1, { updateError });
            } else {
                // Create new
                const { error: insertError } = await supabase
                    .from('usage_tracking')
                    .insert({
                        user_id: user.id,
                        month_year: currentMonth,
                        search_count: 1
                    });

                console.log('🟢 Created new usage record with count: 1', { insertError });
            }

            // Refresh data
            console.log('🔵 Refreshing subscription data...');
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
        refreshKey // Export to force re-renders
    };
}
