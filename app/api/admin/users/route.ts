import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { PlanType } from '@/lib/plans';

// Lazy initialization to avoid build-time errors with server-only env vars
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Admin emails allowed to access this endpoint
const ADMIN_EMAILS = ['ed@eduardoescalante.com'];

export async function GET(req: NextRequest) {
    const supabase = getSupabaseAdmin();

    try {
        // Verify admin access via auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Fetch all users from auth.users (with pagination to get all)
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        });

        if (authError) {
            console.error('Error fetching users:', authError);
            return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        // Fetch all subscriptions
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('*');

        // Fetch all usage tracking
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('*');

        // Combine user data with subscription and usage
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const users = authUsers.users.map((authUser: any) => {
            const subscription = subscriptions?.find((s: any) => s.user_id === authUser.id);
            const userUsage = usage?.find((u: any) => u.user_id === authUser.id);

            return {
                id: authUser.id,
                email: authUser.email,
                created_at: authUser.created_at,
                last_sign_in_at: authUser.last_sign_in_at,
                plan_type: subscription?.plan_type || 'free',
                subscription_status: subscription?.status || 'none',
                // For display: show total_scans_ever for free, current_cycle_scans for paid
                search_count: userUsage?.total_scans_ever || userUsage?.search_count || 0,
                current_cycle_scans: userUsage?.current_cycle_scans || 0
            };
        });

        // Calculate stats
        const stats = {
            total_users: users.length,
            pro_users: users.filter((u: any) => u.plan_type === 'pro').length,
            advanced_users: users.filter((u: any) => u.plan_type === 'advanced').length,
            free_users: users.filter((u: any) => u.plan_type === 'free' || !u.plan_type).length,
            total_searches_this_month: usage?.reduce((sum: number, u: any) => sum + (u.current_cycle_scans || u.search_count || 0), 0) || 0
        };
        /* eslint-enable @typescript-eslint/no-explicit-any */

        return Response.json({ users, stats });

    } catch (error: any) {
        console.error('Admin API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const supabase = getSupabaseAdmin();

    try {
        // Verify admin access
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { action, userId, email, planType } = await req.json();

        // Handle plan change action
        if (action === 'set_plan') {
            const validPlans: PlanType[] = ['free', 'pro', 'advanced'];
            if (!validPlans.includes(planType)) {
                return Response.json({ error: 'Invalid plan type' }, { status: 400 });
            }

            const now = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            // Update subscription
            const subscriptionData: any = {
                user_id: userId,
                email: email,
                plan_type: planType,
                status: planType === 'free' ? 'none' : 'active',
                updated_at: now.toISOString()
            };

            // Add billing dates for paid plans
            if (planType !== 'free') {
                subscriptionData.subscription_start_date = now.toISOString();
                subscriptionData.current_period_start = now.toISOString();
                subscriptionData.current_period_end = endDate.toISOString();
            }

            const { error: subError } = await supabase
                .from('subscriptions')
                .upsert(subscriptionData, { onConflict: 'user_id' });

            if (subError) throw subError;

            // Reset cycle scans for paid plan upgrades
            if (planType !== 'free') {
                const { error: usageError } = await supabase
                    .from('usage_tracking')
                    .upsert({
                        user_id: userId,
                        current_cycle_scans: 0,
                        current_cycle_start: now.toISOString(),
                        updated_at: now.toISOString()
                    }, { onConflict: 'user_id' });

                if (usageError) {
                    console.error('Usage reset error:', usageError);
                }
            }

            return Response.json({
                success: true,
                message: `Plan changed to ${planType}`
            });
        }

        // Legacy actions for backwards compatibility
        if (action === 'grant_pro') {
            const now = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    email: email,
                    plan_type: 'pro',
                    status: 'active',
                    subscription_start_date: now.toISOString(),
                    current_period_start: now.toISOString(),
                    current_period_end: endDate.toISOString(),
                    updated_at: now.toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            return Response.json({ success: true, message: 'Pro status granted' });

        } else if (action === 'revoke_pro') {
            const { error } = await supabase
                .from('subscriptions')
                .update({
                    plan_type: 'free',
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
            return Response.json({ success: true, message: 'Pro status revoked' });

        } else {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Admin API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
