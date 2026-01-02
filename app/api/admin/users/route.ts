import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin emails allowed to access this endpoint
const ADMIN_EMAILS = ['ed@eduardoescalante.com'];

export async function GET(req: NextRequest) {
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

        // Fetch all users from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching users:', authError);
            return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        // Fetch all subscriptions
        const { data: subscriptions } = await supabase
            .from('subscriptions')
            .select('*');

        // Fetch all usage tracking
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('month_year', currentMonth);

        // Combine user data with subscription and usage
        const users = authUsers.users.map(user => {
            const subscription = subscriptions?.find(s => s.user_id === user.id);
            const userUsage = usage?.find(u => u.user_id === user.id);

            return {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at,
                plan_type: subscription?.plan_type || 'free',
                subscription_status: subscription?.status || 'none',
                search_count: userUsage?.search_count || 0
            };
        });

        // Calculate stats
        const stats = {
            total_users: users.length,
            pro_users: users.filter(u => u.plan_type === 'pro').length,
            free_users: users.filter(u => u.plan_type !== 'pro').length,
            total_searches_this_month: usage?.reduce((sum, u) => sum + (u.search_count || 0), 0) || 0
        };

        return Response.json({ users, stats });

    } catch (error: any) {
        console.error('Admin API error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const { action, userId, email } = await req.json();

        if (action === 'grant_pro') {
            // Grant Pro status - only use essential columns
            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    email: email,
                    plan_type: 'pro',
                    status: 'active',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;
            return Response.json({ success: true, message: 'Pro status granted' });

        } else if (action === 'revoke_pro') {
            // Revoke Pro status
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
