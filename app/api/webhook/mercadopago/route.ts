import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('MercadoPago Webhook received:', body);

        // Verify webhook authenticity (simplified - add proper validation in production)
        const { type, data } = body;

        if (type === 'payment') {
            const paymentId = data.id;

            // In a real implementation, fetch payment details from MercadoPago API
            // For now, we'll trust the webhook data

            if (body.action === 'payment.created' || body.action === 'payment.updated') {
                const userId = body.external_reference;
                const status = body.status;

                if (status === 'approved') {
                    // Create or update subscription
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

                    const { error: subError } = await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: userId,
                            status: 'active',
                            plan_type: 'pro',
                            mercadopago_payment_id: paymentId,
                            current_period_start: new Date().toISOString(),
                            current_period_end: endDate.toISOString(),
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        });

                    if (subError) {
                        console.error('Subscription update error:', subError);
                    }

                    // Record payment
                    await supabase.from('payments').insert({
                        user_id: userId,
                        amount: 10.00,
                        currency: 'USD',
                        status: 'approved',
                        mercadopago_payment_id: paymentId,
                        payment_type: 'subscription',
                        created_at: new Date().toISOString()
                    });

                    console.log('Subscription activated for user:', userId);
                }
            }
        }

        return Response.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
