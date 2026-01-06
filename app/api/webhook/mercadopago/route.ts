import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Lazy initialization to avoid build-time errors with server-only env vars
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function getMercadoPagoPaymentApi() {
    const mpClient = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        options: { timeout: 5000 }
    });
    return new Payment(mpClient);
}

export async function POST(request: Request) {
    const supabase = getSupabaseAdmin();
    const paymentApi = getMercadoPagoPaymentApi();

    try {
        const body = await request.json();

        console.log('📥 MercadoPago Webhook received:', JSON.stringify(body, null, 2));

        const { type, action, data } = body;

        // Only process payment notifications
        if (type === 'payment' && data?.id) {
            const paymentId = data.id;
            console.log('💳 Processing payment notification for ID:', paymentId);

            try {
                // Fetch actual payment details from MercadoPago API
                const paymentDetails = await paymentApi.get({ id: paymentId });

                console.log('📋 Payment Details from API:', JSON.stringify({
                    id: paymentDetails.id,
                    status: paymentDetails.status,
                    external_reference: paymentDetails.external_reference,
                    payer_email: paymentDetails.payer?.email,
                    amount: paymentDetails.transaction_amount
                }, null, 2));

                const userId = paymentDetails.external_reference;
                const status = paymentDetails.status;
                const payerEmail = paymentDetails.payer?.email;

                if (!userId) {
                    console.error('❌ No external_reference (user_id) found in payment');
                    return Response.json({ error: 'No user reference' }, { status: 400 });
                }

                if (status === 'approved') {
                    console.log('✅ Payment APPROVED for user:', userId);

                    // Skip subscription logic for workshop payments
                    if (userId.startsWith('workshop-')) {
                        console.log('🎓 Workshop payment received. Skipping subscription creation.');
                        return Response.json({ received: true, type: 'workshop' }, { status: 200 });
                    }

                    // Create or update subscription
                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

                    const { data: subData, error: subError } = await supabase
                        .from('subscriptions')
                        .upsert({
                            user_id: userId,
                            email: payerEmail, // Store email for easy identification
                            status: 'active',
                            plan_type: 'pro',
                            mercadopago_payment_id: String(paymentId),
                            current_period_start: new Date().toISOString(),
                            current_period_end: endDate.toISOString(),
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        })
                        .select();

                    if (subError) {
                        console.error('❌ Subscription update error:', subError);
                    } else {
                        console.log('✅ Subscription updated successfully:', subData);
                    }

                    // Record payment
                    const { error: paymentError } = await supabase.from('payments').insert({
                        user_id: userId,
                        amount: paymentDetails.transaction_amount || 10.00,
                        currency: paymentDetails.currency_id || 'CLP',
                        status: 'approved',
                        mercadopago_payment_id: String(paymentId),
                        payment_type: 'subscription',
                        created_at: new Date().toISOString()
                    });

                    if (paymentError) {
                        console.error('❌ Payment record error:', paymentError);
                    } else {
                        console.log('✅ Payment recorded successfully');
                    }

                    console.log('🎉 Subscription activated for user:', userId, 'email:', payerEmail);
                } else {
                    console.log('⏳ Payment status not approved:', status, 'for user:', userId);
                }

            } catch (mpError: any) {
                console.error('❌ MercadoPago API error fetching payment:', mpError.message);
                // Still return 200 to acknowledge webhook receipt
            }
        } else {
            console.log('ℹ️ Non-payment notification received, type:', type, 'action:', action);
        }

        return Response.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Webhook processing error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
