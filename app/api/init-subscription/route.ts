import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors with server-only env vars
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(request: Request) {
    const supabase = getSupabaseAdmin();

    try {
        const { userId } = await request.json();

        if (!userId) {
            return Response.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Check if user already has a subscription
        const { data: existing } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing) {
            return Response.json({ message: 'Subscription already exists' });
        }

        // Create free tier subscription
        const { error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                status: 'active',
                plan_type: 'free'
            });

        if (error) throw error;

        return Response.json({ success: true, plan: 'free' });

    } catch (error: any) {
        console.error('Error initializing subscription:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
